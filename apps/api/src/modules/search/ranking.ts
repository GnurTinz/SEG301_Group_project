/**
 * Điểm Mới — Phase 2 Search Engine: Relevance & Ranking Algorithms
 * Implements Field-Weighted Okapi BM25 (BM25F), Vector Space TF-IDF,
 * Click-Through Rate (CTR) Learning-to-Rank Feedback, and Keyword Highlighting.
 */

import { InvertedIndex, IndexedDocMeta } from './indexer.js';
import { tokenize } from './tokenizer.js';

export interface SearchScoreResult {
  doc: IndexedDocMeta;
  score: number;
  matchedTerms: string[];
  highlightSnippet: string;
}

export interface RankingOptions {
  mode?: 'bm25' | 'tfidf' | 'hybrid' | 'ilike';
  bm25Params?: {
    k1?: number;
    bTitle?: number;
    bSummary?: number;
    bContent?: number;
    wTitle?: number;
    wSummary?: number;
    wContent?: number;
  };
  clickBoosts?: Map<string, number>; // docId -> CTR score
}

const DEFAULT_BM25_PARAMS = {
  k1: 1.2,
  bTitle: 0.75,
  bSummary: 0.75,
  bContent: 0.75,
  wTitle: 3.0,
  wSummary: 2.0,
  wContent: 1.0,
};

/**
 * Standard Robertson-Spärck Jones IDF formula with add-1 smoothing
 * Clamps DF <= N to guarantee non-negative IDF and numerical stability
 */
export function calculateIdf(totalDocs: number, docFrequency: number): number {
  if (totalDocs <= 0 || docFrequency <= 0) return 0;
  const clampedDf = Math.min(totalDocs, docFrequency);
  // RSJ IDF with smoothing: ln(1 + (N - DF + 0.5) / (DF + 0.5))
  return Math.max(0, Math.log(1 + (totalDocs - clampedDf + 0.5) / (clampedDf + 0.5)));
}

/**
 * Extracts and highlights a search snippet around matching keywords
 */
export function extractSnippet(
  text: string, 
  queryTerms: string[], 
  maxLength: number = 220
): string {
  if (!text) return '';
  const lowerText = text.toLowerCase();
  
  // Find first occurrence of any query term
  let bestIdx = -1;
  for (const term of queryTerms) {
    const idx = lowerText.indexOf(term.toLowerCase());
    if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
      bestIdx = idx;
    }
  }

  let start = 0;
  if (bestIdx > 40) {
    start = Math.max(0, bestIdx - 40);
  }
  const end = Math.min(text.length, start + maxLength);

  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  // Highlight matched terms
  for (const term of queryTerms) {
    if (term.length < 2) continue;
    const regex = new RegExp(`(${term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
    snippet = snippet.replace(regex, '<mark class="bg-amber-400/20 text-amber-300 font-semibold px-0.5 rounded">$1</mark>');
  }

  return snippet;
}

/**
 * Field-Weighted Okapi BM25 Ranking Engine (BM25F)
 */
export function rankBm25(
  index: InvertedIndex,
  query: string,
  options: RankingOptions = {}
): SearchScoreResult[] {
  const params = { ...DEFAULT_BM25_PARAMS, ...options.bm25Params };
  const queryTokens = tokenize(query, { removeStopWords: true, includeBigrams: false });
  if (queryTokens.length === 0) return [];

  const N = index.totalDocs;
  const avgLengths = index.averageFieldLengths;
  const docScores = new Map<string, number>();
  const docMatchedTerms = new Map<string, Set<string>>();

  for (const term of queryTokens) {
    const postings = index.getPostings(term);
    if (!postings || postings.size === 0) continue;

    const idf = calculateIdf(N, postings.size);

    for (const [docId, posting] of postings.entries()) {
      const doc = index.getDocumentMeta(docId);
      if (!doc) continue;

      // Field length normalization
      const bNormTitle = 1 - params.bTitle + params.bTitle * (doc.fieldLengths.title / avgLengths.title);
      const bNormSummary = 1 - params.bSummary + params.bSummary * (doc.fieldLengths.summary / avgLengths.summary);
      const bNormContent = 1 - params.bContent + params.bContent * (doc.fieldLengths.content / avgLengths.content);

      // Weighted normalized term frequency
      const tfTilde =
        params.wTitle * (posting.fieldTf.title / (bNormTitle || 1)) +
        params.wSummary * (posting.fieldTf.summary / (bNormSummary || 1)) +
        params.wContent * (posting.fieldTf.content / (bNormContent || 1));

      // BM25 term saturation
      const termScore = idf * ((tfTilde * (params.k1 + 1)) / (tfTilde + params.k1));

      docScores.set(docId, (docScores.get(docId) ?? 0) + termScore);

      let matched = docMatchedTerms.get(docId);
      if (!matched) {
        matched = new Set<string>();
        docMatchedTerms.set(docId, matched);
      }
      matched.add(term);
    }
  }

  const results: SearchScoreResult[] = [];
  for (const [docId, score] of docScores.entries()) {
    const doc = index.getDocumentMeta(docId);
    if (!doc) continue;

    const matched = Array.from(docMatchedTerms.get(docId) ?? []);
    const snippet = extractSnippet(doc.summary || doc.contentPlain, matched);

    results.push({
      doc,
      score: Math.round(score * 100) / 100,
      matchedTerms: matched,
      highlightSnippet: snippet,
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Vector Space Model with TF-IDF and Cosine Similarity
 */
export function rankTfIdf(
  index: InvertedIndex,
  query: string
): SearchScoreResult[] {
  const queryTokens = tokenize(query, { removeStopWords: true, includeBigrams: false });
  if (queryTokens.length === 0) return [];

  const N = index.totalDocs;
  const qTfMap = new Map<string, number>();
  for (const t of queryTokens) {
    qTfMap.set(t, (qTfMap.get(t) ?? 0) + 1);
  }

  // Calculate query vector weights & norm
  let qNormSq = 0;
  const qWeights = new Map<string, number>();
  for (const [term, tf] of qTfMap.entries()) {
    const df = index.getDocumentFrequency(term);
    const idf = df > 0 ? Math.log(1 + N / df) : 0;
    const w = (1 + Math.log(tf)) * idf;
    qWeights.set(term, w);
    qNormSq += w * w;
  }
  const qNorm = Math.sqrt(qNormSq) || 1;

  const dotProducts = new Map<string, number>();
  const docMatchedTerms = new Map<string, Set<string>>();

  for (const [term, qWeight] of qWeights.entries()) {
    const postings = index.getPostings(term);
    if (!postings) continue;

    const df = postings.size;
    const idf = Math.log(1 + N / df);

    for (const [docId, posting] of postings.entries()) {
      if (posting.totalTf <= 0) continue;
      const dWeight = (1 + Math.log(posting.totalTf)) * idf;
      dotProducts.set(docId, (dotProducts.get(docId) ?? 0) + qWeight * dWeight);

      let matched = docMatchedTerms.get(docId);
      if (!matched) {
        matched = new Set<string>();
        docMatchedTerms.set(docId, matched);
      }
      matched.add(term);
    }
  }

  const results: SearchScoreResult[] = [];
  for (const [docId, dotProd] of dotProducts.entries()) {
    const doc = index.getDocumentMeta(docId);
    if (!doc) continue;

    // Estimate document vector norm roughly from length
    const docNorm = Math.sqrt(doc.totalLength) || 1;
    const cosineSim = dotProd / (qNorm * docNorm);

    const matched = Array.from(docMatchedTerms.get(docId) ?? []);
    const snippet = extractSnippet(doc.summary || doc.contentPlain, matched);

    results.push({
      doc,
      score: Math.round(cosineSim * 1000) / 1000,
      matchedTerms: matched,
      highlightSnippet: snippet,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Hybrid Ranking Engine: BM25 combined with Click-Through Rate (CTR) and Recency
 */
export function rankHybrid(
  index: InvertedIndex,
  query: string,
  clickBoosts: Map<string, number> = new Map()
): SearchScoreResult[] {
  const bm25Results = rankBm25(index, query);
  const nowMs = Date.now();

  for (const res of bm25Results) {
    const doc = res.doc;

    // CTR Boost: up to 50% boost for high CTR documents
    const ctr = clickBoosts.get(doc.id) ?? 0;
    const ctrBoost = 1 + Math.min(0.5, ctr * 0.5);

    // Recency Boost: documents within 180 days get up to 15% boost
    let recencyBoost = 1.0;
    if (doc.publishedAt) {
      const daysOld = Math.max(0, (nowMs - doc.publishedAt.getTime()) / (1000 * 60 * 60 * 24));
      recencyBoost = 1 + 0.15 * Math.exp(-daysOld / 180);
    }

    // Popularity View Boost: log-scaled view count boost
    const viewBoost = 1 + 0.1 * Math.log10(Math.max(1, doc.viewsCount));

    res.score = Math.round(res.score * ctrBoost * recencyBoost * viewBoost * 100) / 100;
  }

  bm25Results.sort((a, b) => b.score - a.score);
  return bm25Results;
}

