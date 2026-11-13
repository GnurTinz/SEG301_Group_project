/**
 * Điểm Mới — Phase 2 Search Engine: Inverted Index & Document Indexing Engine
 * In-memory inverted index synchronized with PostgreSQL Document Data Store.
 */

import { type PrismaClient } from '@prisma/client';
import { tokenize, countTermFrequencies, removeDiacritics } from './tokenizer.js';

export interface FieldLengths {
  title: number;
  summary: number;
  content: number;
}

export interface Posting {
  docId: string;
  fieldTf: {
    title: number;
    summary: number;
    content: number;
  };
  tfTitle?: number;
  tfSummary?: number;
  tfContent?: number;
  totalTf: number;
}

export interface IndexedDocMeta {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentPlain: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  author: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  tagSlugs: string[];
  publishedAt: Date | null;
  viewsCount: number;
  fieldLengths: FieldLengths;
  totalLength: number;
}

export interface IndexStats {
  totalDocs: number;
  totalDocuments?: number;
  totalTerms: number;
  vocabularySize?: number;
  avgDocLength: number;
  avgFieldLengths: FieldLengths;
  averageFieldLengths?: FieldLengths;
  memoryUsageKb: number;
  lastBuiltAt: Date | null;
}

export class InvertedIndex {
  // Term -> (DocId -> Posting)
  private index: Map<string, Map<string, Posting>> = new Map();
  // DocId -> IndexedDocMeta
  private docs: Map<string, IndexedDocMeta> = new Map();

  private avgFieldLengths: FieldLengths = { title: 0, summary: 0, content: 0 };
  private avgDocLength: number = 0;
  private lastBuiltAt: Date | null = null;

  /**
   * Clears the current index
   */
  public clear(): void {
    this.index.clear();
    this.docs.clear();
    this.avgFieldLengths = { title: 0, summary: 0, content: 0 };
    this.avgDocLength = 0;
    this.lastBuiltAt = null;
  }

  /**
   * Adds or updates a document in the index
   */
  public indexDocument(doc: {
    id: string;
    title: string;
    slug?: string;
    summary: string;
    contentPlain: string;
    coverImageUrl?: string | null;
    coverImageAlt?: string;
    author?: string;
    categoryId?: string;
    category?: { name: string; slug: string };
    tags?: Array<{ tag: { slug: string } }>;
    publishedAt?: Date | null;
    viewsCount?: number;
  }): void {
    // If updating, remove old postings first
    if (this.docs.has(doc.id)) {
      this.removeDocument(doc.id);
    }

    // Tokenize each field
    const titleTokens = tokenize(doc.title, { removeStopWords: false, includeBigrams: true });
    const summaryTokens = tokenize(doc.summary, { removeStopWords: true, includeBigrams: true });
    const contentTokens = tokenize(doc.contentPlain, { removeStopWords: true, includeBigrams: false });

    const titleTf = countTermFrequencies(titleTokens);
    const summaryTf = countTermFrequencies(summaryTokens);
    const contentTf = countTermFrequencies(contentTokens);

    const fieldLengths: FieldLengths = {
      title: titleTokens.length,
      summary: summaryTokens.length,
      content: contentTokens.length,
    };
    const totalLength = titleTokens.length + summaryTokens.length + contentTokens.length;

    const meta: IndexedDocMeta = {
      id: doc.id,
      title: doc.title,
      slug: doc.slug ?? doc.id,
      summary: doc.summary,
      contentPlain: doc.contentPlain,
      coverImageUrl: doc.coverImageUrl ?? null,
      coverImageAlt: doc.coverImageAlt ?? '',
      author: doc.author ?? 'Biên tập viên',
      categoryId: doc.categoryId ?? 'default',
      categoryName: doc.category?.name,
      categorySlug: doc.category?.slug,
      tagSlugs: doc.tags?.map((t) => t.tag.slug) ?? [],
      publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : null,
      viewsCount: doc.viewsCount ?? 0,
      fieldLengths,
      totalLength,
    };

    this.docs.set(doc.id, meta);

    // Merge unique terms
    const allTerms = new Set([
      ...titleTf.keys(),
      ...summaryTf.keys(),
      ...contentTf.keys(),
    ]);

    for (const term of allTerms) {
      const tfTitle = titleTf.get(term) ?? 0;
      const tfSummary = summaryTf.get(term) ?? 0;
      const tfContent = contentTf.get(term) ?? 0;
      const totalTf = tfTitle + tfSummary + tfContent;

      const keysToIndex = [term];
      const unaccented = removeDiacritics(term);
      if (unaccented && unaccented !== term) {
        keysToIndex.push(unaccented);
      }

      for (const k of keysToIndex) {
        let postingsMap = this.index.get(k);
        if (!postingsMap) {
          postingsMap = new Map<string, Posting>();
          this.index.set(k, postingsMap);
        }

        const existing = postingsMap.get(doc.id);
        if (!existing) {
          postingsMap.set(doc.id, {
            docId: doc.id,
            fieldTf: {
              title: tfTitle,
              summary: tfSummary,
              content: tfContent,
            },
            tfTitle,
            tfSummary,
            tfContent,
            totalTf,
          });
        }
      }
    }

    this.recomputeAverages();
  }

  /**
   * Finds matching document IDs across accented and unaccented terms for candidate retrieval
   */
  public findCandidateDocIds(terms: string[]): string[] {
    const matched = new Set<string>();
    for (const term of terms) {
      const clean = term.toLowerCase().trim();
      const unaccented = removeDiacritics(clean);

      const p1 = this.index.get(clean);
      if (p1) {
        for (const id of p1.keys()) matched.add(id);
      }

      if (unaccented && unaccented !== clean) {
        const p2 = this.index.get(unaccented);
        if (p2) {
          for (const id of p2.keys()) matched.add(id);
        }
      }
    }
    return Array.from(matched);
  }

  /**
   * Removes a document from the index
   */
  public removeDocument(docId: string): void {
    if (!this.docs.has(docId)) return;
    this.docs.delete(docId);

    for (const [term, postingsMap] of this.index.entries()) {
      postingsMap.delete(docId);
      if (postingsMap.size === 0) {
        this.index.delete(term);
      }
    }

    this.recomputeAverages();
  }

  /**
   * Recomputes average document and field lengths across corpus
   */
  private recomputeAverages(): void {
    const N = this.docs.size;
    if (N === 0) {
      this.avgFieldLengths = { title: 0, summary: 0, content: 0 };
      this.avgDocLength = 0;
      return;
    }

    let sumTitle = 0;
    let sumSummary = 0;
    let sumContent = 0;
    let sumTotal = 0;

    for (const meta of this.docs.values()) {
      sumTitle += meta.fieldLengths.title;
      sumSummary += meta.fieldLengths.summary;
      sumContent += meta.fieldLengths.content;
      sumTotal += meta.totalLength;
    }

    this.avgFieldLengths = {
      title: sumTitle / N,
      summary: sumSummary / N,
      content: sumContent / N,
    };
    this.avgDocLength = sumTotal / N;
  }

  /**
   * Builds the entire index from published documents in the database
   */
  public async buildFromDatabase(db: PrismaClient): Promise<IndexStats> {
    const documents = await db.document.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        contentPlain: true,
        coverImageUrl: true,
        coverImageAlt: true,
        author: true,
        categoryId: true,
        publishedAt: true,
        viewsCount: true,
        category: {
          select: { name: true, slug: true },
        },
        tags: {
          select: {
            tag: { select: { slug: true } },
          },
        },
      },
    });

    this.clear();

    for (const doc of documents) {
      this.indexDocument(doc);
    }

    this.lastBuiltAt = new Date();
    return this.getStats();
  }

  /**
   * Retrieves postings for a specific term
   */
  public getPostings(term: string): Map<string, Posting> | undefined {
    return this.index.get(term);
  }

  /**
   * Document frequency (DF) for a term
   */
  public getDocumentFrequency(term: string): number {
    return this.index.get(term)?.size ?? 0;
  }

  /**
   * Retrieves document metadata
   */
  public getDocumentMeta(docId: string): IndexedDocMeta | undefined {
    return this.docs.get(docId);
  }

  /**
   * Retrieves all indexed document IDs
   */
  public getAllDocIds(): string[] {
    return Array.from(this.docs.keys());
  }

  /**
   * Retrieves total number of documents (N)
   */
  public get totalDocs(): number {
    return this.docs.size;
  }

  public get averageDocLength(): number {
    return this.avgDocLength || 1;
  }

  public get averageFieldLengths(): FieldLengths {
    return {
      title: this.avgFieldLengths.title || 1,
      summary: this.avgFieldLengths.summary || 1,
      content: this.avgFieldLengths.content || 1,
    };
  }

  /**
   * Auto-complete suggestions for query prefix
   */
  public getSuggestions(prefix: string, limit: number = 8): string[] {
    if (!prefix || prefix.length < 1) return [];
    const normalizedPrefix = prefix.toLowerCase().trim();
    const suggestions: string[] = [];

    for (const term of this.index.keys()) {
      if (term.startsWith(normalizedPrefix) && term !== normalizedPrefix) {
        suggestions.push(term);
      }
    }

    // Sort by document frequency descending
    suggestions.sort((a, b) => {
      const dfA = this.getDocumentFrequency(a);
      const dfB = this.getDocumentFrequency(b);
      return dfB - dfA;
    });

    return suggestions.slice(0, limit);
  }

  /**
   * Returns index diagnostics and statistics
   */
  public getStats(): IndexStats {
    let postingEntriesCount = 0;
    for (const postings of this.index.values()) {
      postingEntriesCount += postings.size;
    }

    // Estimate memory usage in KB (~64 bytes per posting + string keys)
    const memoryUsageKb = Math.round(
      (this.index.size * 32 + postingEntriesCount * 64 + this.docs.size * 512) / 1024
    );

    const fieldLengths = {
      title: Math.round(this.avgFieldLengths.title * 10) / 10,
      summary: Math.round(this.avgFieldLengths.summary * 10) / 10,
      content: Math.round(this.avgFieldLengths.content * 10) / 10,
    };

    return {
      totalDocs: this.docs.size,
      totalDocuments: this.docs.size,
      totalTerms: this.index.size,
      vocabularySize: this.index.size,
      avgDocLength: Math.round(this.avgDocLength * 10) / 10,
      avgFieldLengths: fieldLengths,
      averageFieldLengths: fieldLengths,
      memoryUsageKb,
      lastBuiltAt: this.lastBuiltAt,
    };
  }
}

// Global Singleton Instance
export const globalIndex = new InvertedIndex();
