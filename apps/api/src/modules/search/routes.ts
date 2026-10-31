import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { fail, paged } from '../../lib/http.js';
import { limiter, visitor } from '../../middleware/security.js';
import { filtersSchema, listSelect, publicWhere, whereFilters } from '../documents/service.js';
export const search = Router();
search.get('/', limiter(60), async (req, res) => {
  const q = z.string().trim().min(1).max(200).parse(req.query.q);
  const f = filtersSchema.parse(req.query);
  const keyword = q.replace(/[\\%_]/g, '\\$&');
  const where = {
    ...publicWhere,
    ...whereFilters(f),
    OR: [
      { title: { contains: keyword, mode: 'insensitive' as const } },
      { summary: { contains: keyword, mode: 'insensitive' as const } },
      { contentPlain: { contains: keyword, mode: 'insensitive' as const } },
    ],
  };
  const ownerKey = visitor(req);
  const result = await db.$transaction(async (tx) => {
    const data = await tx.document.findMany({
      where,
      select: listSelect,
      orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
      take: f.pageSize,
      skip: (f.page - 1) * f.pageSize,
    });
    const total = await tx.document.count({ where });
    const log = await tx.searchClickLog.create({
      data: {
        userId: req.identity?.id,
        ownerKey,
        queryString: q,
        eventType: 'SEARCH',
        page: f.page,
        resultCount: total,
        filtersJson: {
          category: f.category ?? null,
          tag: f.tag ?? null,
          from: f.from ?? null,
          to: f.to ?? null,
          pageSize: f.pageSize,
          resultIds: data.map((d) => d.id),
        },
      },
    });
    return { data, total, searchId: log.id };
  });
  paged(res, result.data, result.total, f.page, f.pageSize, { searchId: result.searchId });
});
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
  if (index < 0 || (input.position !== undefined && input.position !== index + 1))
    fail(422, 'INVALID_RESULT', 'Bài viết không thuộc kết quả tìm kiếm này');
  if (!(await db.document.findFirst({ where: { id: input.clicked_doc_id, ...publicWhere } })))
    fail(404, 'NOT_FOUND', 'Không tìm thấy bài viết');
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
