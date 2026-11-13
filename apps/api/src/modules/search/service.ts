/**
 * Điểm Mới — Phase 2 Search Engine: Core Search Service
 * Coordinates Inverted Index, Multi-Model Ranking (BM25F, TF-IDF, Hybrid),
 * Interaction Logging, Query Autocomplete, and Highlighting.
 */

import { performance } from 'node:perf_hooks';
import { db } from '../../lib/db.js';
import { publicWhere, whereFilters, listSelect, filtersSchema } from '../documents/service.js';
import { globalIndex } from './indexer.js';
import { extractSnippet, calculateIdf } from './ranking.js';
import { tokenize, removeDiacritics } from './tokenizer.js';
import { z } from 'zod';

export const searchInputSchema = filtersSchema.extend({
  q: z.string().trim().min(1).max(200),
  mode: z.enum(['bm25', 'tfidf', 'hybrid', 'ilike']).default('bm25'),
});

export type SearchInput = z.infer<typeof searchInputSchema>;

export interface SearchResponseDoc {
  id: string;
  title: string;
  slug: string;
  summary: string;
  author: string;
  category: { id?: string; name: string; slug: string } | null;
  tags: Array<{ tag: { id?: string; name?: string; slug: string } }>;
  coverImageUrl: string | null;
  coverImageAlt: string;
  publishedAt: Date | null;
  createdAt: Date;
  viewsCount: number;
  status: string;
  score?: number;
  matchedTerms?: string[];
  highlightSnippet?: string;
}

/**
 * Ensures index is populated with current published documents
 */
export async function ensureIndexReady(): Promise<void> {
  if (globalIndex.totalDocs === 0) {
    await globalIndex.buildFromDatabase(db);
  }
}

/**
 * Fetches historical Click-Through Rate (CTR) boosts from search_click_logs
 * Computes query-level CTR = Clicks(doc, query) / max(1, Searches(query))
 */
async function getClickBoostsForQuery(query: string): Promise<Map<string, number>> {
  const boosts = new Map<string, number>();
  try {
    const [totalSearches, clickLogs] = await Promise.all([
      db.searchClickLog.count({
        where: {
          queryString: { equals: query, mode: 'insensitive' },
          eventType: 'SEARCH',
        },
      }),
      db.searchClickLog.findMany({
        where: {
          queryString: { equals: query, mode: 'insensitive' },
          eventType: 'CLICK',
          clickedDocId: { not: null },
        },
        select: {
          clickedDocId: true,
        },
      }),
    ]);

    const clickCounts = new Map<string, number>();
    for (const log of clickLogs) {
      if (log.clickedDocId) {
        clickCounts.set(log.clickedDocId, (clickCounts.get(log.clickedDocId) ?? 0) + 1);
      }
    }

    const searchCount = Math.max(1, totalSearches);
    for (const [docId, clicks] of clickCounts.entries()) {
      const ctr = clicks / searchCount;
      boosts.set(docId, Math.round(ctr * 1000) / 1000);
    }
  } catch {
    // Graceful fallback if database read fails
  }
  return boosts;
}

/**
 * Executes multi-stage search with BM25F / TF-IDF / Hybrid relevance ranking
 */
export async function executeSearch(
  input: SearchInput,
  ownerKey: string,
  userId?: string
) {
  const startTime = performance.now();
  const { q, mode, page, pageSize } = input;

  await ensureIndexReady();

  // Phase 1 Backward Compatibility Mode (ILIKE)
  if (mode === 'ilike') {
    const keyword = q.replace(/[\\%_]/g, '\\$&');
    const where = {
      ...publicWhere,
      ...whereFilters(input),
      OR: [
        { title: { contains: keyword, mode: 'insensitive' as const } },
        { summary: { contains: keyword, mode: 'insensitive' as const } },
        { contentPlain: { contains: keyword, mode: 'insensitive' as const } },
      ],
    };

    const result = await db.$transaction(async (tx) => {
      const data = await tx.document.findMany({
        where,
        select: listSelect,
        orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
        take: pageSize,
        skip: (page - 1) * pageSize,
      });
      const total = await tx.document.count({ where });

      const log = await tx.searchClickLog.create({
        data: {
          userId,
          ownerKey,
          queryString: q,
          eventType: 'SEARCH',
          page,
          resultCount: total,
          filtersJson: {
            category: input.category ?? null,
            tag: input.tag ?? null,
            from: input.from ?? null,
            to: input.to ?? null,
            pageSize,
            mode: 'ilike',
            resultIds: data.map((d) => d.id),
          },
        },
      });

      return { data, total, searchId: log.id };
    });

    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      data: result.data as SearchResponseDoc[],
      total: result.total,
      page,
      pageSize,
      searchId: result.searchId,
      meta: {
        mode: 'ilike',
        executionTimeMs,
        rankingAlgorithm: 'SQL ILIKE (Phase 1 Baseline)',
      },
    };
  }

  // Phase 2 Search Engine Mode: BM25F / TF-IDF / Hybrid
  // Step 1: Candidate Retrieval
  const keyword = q.replace(/[\\%_]/g, '\\$&');
  const tokens = tokenize(q, { removeStopWords: true, minTokenLength: 2 });
  const searchTerms = tokens.length > 0 ? tokens : [q.toLowerCase().trim()];
  const indexCandidateIds = globalIndex.findCandidateDocIds(searchTerms);

  // Candidate where query matching inverted index candidates OR database keyword matches
  const where = {
    ...publicWhere,
    ...whereFilters(input),
    OR: [
      ...(indexCandidateIds.length > 0 ? [{ id: { in: indexCandidateIds } }] : []),
      { title: { contains: keyword, mode: 'insensitive' as const } },
      { summary: { contains: keyword, mode: 'insensitive' as const } },
      { contentPlain: { contains: keyword, mode: 'insensitive' as const } },
      ...searchTerms.map((term) => ({
        title: { contains: term, mode: 'insensitive' as const },
      })),
      ...searchTerms.map((term) => ({
        summary: { contains: term, mode: 'insensitive' as const },
      })),
    ],
  };

  // Fetch candidate documents from database
  const candidates = await db.document.findMany({
    where,
    select: {
      ...listSelect,
      contentPlain: true,
    },
  });

  // Step 2: Scoring & Ranking candidates using Search Engine algorithms
  const scoredResults: Array<{
    doc: typeof candidates[0];
    score: number;
    matchedTerms: string[];
    highlightSnippet: string;
  }> = [];

  const clickBoosts = mode === 'hybrid' ? await getClickBoostsForQuery(q) : new Map();
  const N = Math.max(1, globalIndex.totalDocs || candidates.length);
  const avgLengths = globalIndex.averageFieldLengths;

  // Pre-calculate query vector norm for TF-IDF Cosine Similarity
  let qNormSq = 0;
  for (const term of searchTerms) {
    const df = globalIndex.getDocumentFrequency(term.toLowerCase()) || 1;
    const idf = calculateIdf(N, df);
    const wQ = (1 + Math.log(1)) * idf;
    qNormSq += wQ * wQ;
  }
  const qNorm = Math.sqrt(qNormSq) || 1;

  const qLower = q.toLowerCase();
  const qUnaccented = removeDiacritics(qLower);

  for (const doc of candidates) {
    const docTitle = doc.title.toLowerCase();
    const docSummary = doc.summary.toLowerCase();
    const docContent = doc.contentPlain.toLowerCase();
    const docTitleUnaccented = removeDiacritics(docTitle);
    const docSummaryUnaccented = removeDiacritics(docSummary);
    const docContentUnaccented = removeDiacritics(docContent);

    const matchedTerms: string[] = [];
    let bm25Score = 0;
    let tfIdfScore = 0;

    for (const term of searchTerms) {
      const termLower = term.toLowerCase();
      const termUnaccented = removeDiacritics(termLower);
      let tfTitle = 0;
      let tfSummary = 0;
      let tfContent = 0;

      // Count term occurrences in fields (accented first, unaccented fallback)
      if (docTitle.includes(termLower)) {
        tfTitle = (docTitle.match(new RegExp(termLower, 'g')) || []).length;
        matchedTerms.push(term);
      } else if (termUnaccented && docTitleUnaccented.includes(termUnaccented)) {
        tfTitle = (docTitleUnaccented.match(new RegExp(termUnaccented, 'g')) || []).length * 0.85;
        matchedTerms.push(term);
      }

      if (docSummary.includes(termLower)) {
        tfSummary = (docSummary.match(new RegExp(termLower, 'g')) || []).length;
        matchedTerms.push(term);
      } else if (termUnaccented && docSummaryUnaccented.includes(termUnaccented)) {
        tfSummary = (docSummaryUnaccented.match(new RegExp(termUnaccented, 'g')) || []).length * 0.85;
        matchedTerms.push(term);
      }

      if (docContent.includes(termLower)) {
        tfContent = (docContent.match(new RegExp(termLower, 'g')) || []).length;
        matchedTerms.push(term);
      } else if (termUnaccented && docContentUnaccented.includes(termUnaccented)) {
        tfContent = (docContentUnaccented.match(new RegExp(termUnaccented, 'g')) || []).length * 0.85;
        matchedTerms.push(term);
      }

      if (tfTitle > 0 || tfSummary > 0 || tfContent > 0) {
        // BM25 calculation
        const df = globalIndex.getDocumentFrequency(termLower) || 1;
        const idf = calculateIdf(N, df);

        const titleLen = docTitle.split(/\s+/).length || 1;
        const summaryLen = docSummary.split(/\s+/).length || 1;
        const contentLen = docContent.split(/\s+/).length || 1;

        const bNormTitle = Math.max(0.01, 1 - 0.75 + 0.75 * (titleLen / avgLengths.title));
        const bNormSummary = Math.max(0.01, 1 - 0.75 + 0.75 * (summaryLen / avgLengths.summary));
        const bNormContent = Math.max(0.01, 1 - 0.75 + 0.75 * (contentLen / avgLengths.content));

        const tfTilde =
          3.0 * (tfTitle / bNormTitle) +
          2.0 * (tfSummary / bNormSummary) +
          1.0 * (tfContent / bNormContent);

        const termBm25 = idf * ((tfTilde * 2.2) / (tfTilde + 1.2));
        bm25Score += termBm25;

        // TF-IDF dot product term
        const totalTf = tfTitle * 3 + tfSummary * 2 + tfContent;
        tfIdfScore += (1 + Math.log(totalTf)) * idf;
      }
    }

    // Exact phrase match bonus
    if (docTitle.includes(qLower)) {
      bm25Score += 5.0;
      tfIdfScore += 5.0;
      matchedTerms.push(q);
    } else if (qUnaccented && docTitleUnaccented.includes(qUnaccented)) {
      bm25Score += 4.0;
      tfIdfScore += 4.0;
      matchedTerms.push(q);
    }

    const titleLen = docTitle.split(/\s+/).length || 1;
    const summaryLen = docSummary.split(/\s+/).length || 1;
    const contentLen = docContent.split(/\s+/).length || 1;

    let finalScore = bm25Score;
    if (mode === 'tfidf') {
      const docLength = titleLen + summaryLen + contentLen;
      const docNorm = Math.sqrt(docLength) || 1;
      finalScore = tfIdfScore / (qNorm * docNorm);
    } else if (mode === 'hybrid') {
      const ctr = clickBoosts.get(doc.id) ?? 0;
      const ctrBoost = 1 + Math.min(0.5, ctr * 0.5);
      const viewsBoost = 1 + 0.05 * Math.log10(Math.max(1, doc.viewsCount));
      finalScore = bm25Score * ctrBoost * viewsBoost;
    }

    const uniqueMatched = Array.from(new Set(matchedTerms));
    const snippet = extractSnippet(doc.summary || doc.contentPlain, uniqueMatched);

    if (finalScore > 0 || uniqueMatched.length > 0) {
      scoredResults.push({
        doc,
        score: Math.round(finalScore * 100) / 100,
        matchedTerms: uniqueMatched,
        highlightSnippet: snippet,
      });
    }
  }

  const total = scoredResults.length;

  // Sort by relevance score descending, fallback to publishedAt
  scoredResults.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.01) {
      return b.score - a.score;
    }
    const dateB = b.doc.publishedAt ? new Date(b.doc.publishedAt).getTime() : 0;
    const dateA = a.doc.publishedAt ? new Date(a.doc.publishedAt).getTime() : 0;
    return dateB - dateA;
  });

  // Step 3: Paginate
  const startIndex = (page - 1) * pageSize;
  const paginatedSlice = scoredResults.slice(startIndex, startIndex + pageSize);

  const responseData: SearchResponseDoc[] = paginatedSlice.map((item) => {
    const { contentPlain: _contentPlain, ...docRest } = item.doc;
    return {
      ...docRest,
      score: item.score,
      matchedTerms: item.matchedTerms,
      highlightSnippet: item.highlightSnippet,
    };
  });

  // Step 4: Interaction Telemetry Logging
  const log = await db.searchClickLog.create({
    data: {
      userId,
      ownerKey,
      queryString: q,
      eventType: 'SEARCH',
      page,
      resultCount: total,
      filtersJson: {
        category: input.category ?? null,
        tag: input.tag ?? null,
        from: input.from ?? null,
        to: input.to ?? null,
        pageSize,
        mode,
        resultIds: responseData.map((d) => d.id),
      },
    },
  });

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    data: responseData,
    total,
    page,
    pageSize,
    searchId: log.id,
    meta: {
      mode,
      executionTimeMs,
      rankingAlgorithm:
        mode === 'bm25'
          ? 'Okapi BM25F (Field-Weighted Relevance)'
          : mode === 'tfidf'
            ? 'TF-IDF Vector Space Model'
            : 'Hybrid BM25 + CTR Feedback',
      totalIndexedDocs: globalIndex.totalDocs,
    },
  };
}

/**
 * Returns query autocomplete suggestions from index vocabulary and search logs
 */
export async function getSearchSuggestions(prefix: string, limit: number = 6): Promise<string[]> {
  if (!prefix || prefix.trim().length < 1) return [];
  const cleanPrefix = prefix.trim().toLowerCase();

  await ensureIndexReady();

  const suggestions = new Set<string>();

  // 1. Suggestions from popular query logs
  try {
    const popularQueries = await db.searchClickLog.findMany({
      where: {
        eventType: 'SEARCH',
        resultCount: { gt: 0 },
        queryString: {
          startsWith: cleanPrefix,
          mode: 'insensitive',
        },
      },
      select: { queryString: true },
      take: limit * 2,
    });

    for (const item of popularQueries) {
      if (item.queryString && item.queryString.toLowerCase() !== cleanPrefix) {
        suggestions.add(item.queryString.trim());
      }
      if (suggestions.size >= limit) break;
    }
  } catch {
    // Continue if DB query fails
  }

  // 2. Vocabulary term completions from Inverted Index
  const vocabCompletions = globalIndex.getSuggestions(cleanPrefix, limit);
  for (const term of vocabCompletions) {
    suggestions.add(term);
    if (suggestions.size >= limit) break;
  }

  return Array.from(suggestions).slice(0, limit);
}
