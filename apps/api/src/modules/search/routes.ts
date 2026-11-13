import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { fail, paged } from '../../lib/http.js';
import { limiter, visitor, requirePermission } from '../../middleware/security.js';
import { publicWhere } from '../documents/service.js';
import { executeSearch, searchInputSchema, getSearchSuggestions } from './service.js';
import { globalIndex } from './indexer.js';

export const search = Router();

/**
 * GET /api/v1/search
 * Executes search query with BM25F, TF-IDF, Hybrid CTR-boosted, or ILIKE algorithms
 */
search.get('/', limiter(60), async (req, res) => {
  const input = searchInputSchema.parse(req.query);
  const ownerKey = visitor(req);

  const result = await executeSearch(input, ownerKey, req.identity?.id);

  paged(res, result.data, result.total, result.page, result.pageSize, {
    searchId: result.searchId,
    ...result.meta,
  });
});

/**
 * GET /api/v1/search/suggestions
 * Provides query completion & suggestions based on vocabulary and historical click logs
 */
search.get('/suggestions', limiter(120), async (req, res) => {
  const q = z.string().trim().max(100).parse(req.query.q ?? '');
  const suggestions = await getSearchSuggestions(q);
  res.json({ data: suggestions });
});

/**
 * GET /api/v1/search/stats
 * Diagnostic statistics of the Inverted Index and Document Store
 */
search.get('/stats', limiter(60), async (_req, res) => {
  if (globalIndex.totalDocs === 0) {
    await globalIndex.buildFromDatabase(db);
  }
  res.json({ data: globalIndex.getStats() });
});

/**
 * POST /api/v1/search/reindex
 * Forces rebuilding the in-memory inverted index from PostgreSQL
 */
search.post('/reindex', limiter(20), requirePermission('documents.publish'), async (_req, res) => {
  const stats = await globalIndex.buildFromDatabase(db);
  res.json({ data: { message: 'Reindexing completed successfully', stats } });
});

/**
 * POST /api/v1/search/clicks
 * Interaction telemetry: records verifiable click-through events
 */
search.post('/clicks', limiter(120), async (req, res) => {
  const input = z
    .object({
      search_id: z.string().uuid(),
      clicked_doc_id: z.string().uuid(),
      position: z.number().int().min(1).max(50).optional(),
    })
    .strict()
    .parse(req.body);

  const parent = await db.searchClickLog.findFirst({
    where: { id: input.search_id, eventType: 'SEARCH', ownerKey: visitor(req) },
  });

  if (!parent) fail(404, 'SEARCH_NOT_FOUND', 'Không tìm thấy phiên tìm kiếm');

  const resultIds = (parent!.filtersJson as { resultIds?: string[] }).resultIds ?? [];
  const index = resultIds.indexOf(input.clicked_doc_id);

  if (index < 0 || (input.position !== undefined && input.position !== index + 1)) {
    fail(422, 'INVALID_RESULT', 'Bài viết không thuộc kết quả tìm kiếm này');
  }

  if (!(await db.document.findFirst({ where: { id: input.clicked_doc_id, ...publicWhere } }))) {
    fail(404, 'NOT_FOUND', 'Không tìm thấy bài viết');
  }

  const data = await db.searchClickLog.create({
    data: {
      userId: req.identity?.id,
      queryString: parent!.queryString,
      ownerKey: parent!.ownerKey,
      eventType: 'CLICK',
      searchId: parent!.id,
      clickedDocId: input.clicked_doc_id,
      page: parent!.page,
      position: index + 1,
      filtersJson: parent!.filtersJson ?? {},
    },
  });

  res.status(201).json({ data: { id: data.id } });
});
