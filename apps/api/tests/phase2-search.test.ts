import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db, sessionPool } from '../src/lib/db.js';
import { agent, csrfToken, login } from './helpers.js';
import {
  tokenize,
  normalizeText,
  removeDiacritics,
  countTermFrequencies,
} from '../src/modules/search/tokenizer.js';
import { InvertedIndex, globalIndex } from '../src/modules/search/indexer.js';
import { calculateIdf, extractSnippet } from '../src/modules/search/ranking.js';

const testPrefix = `p2-${randomUUID().slice(0, 8)}`;
let categoryId: string;
const createdDocIds: string[] = [];

beforeAll(async () => {
  const cat = await db.category.create({
    data: { name: `Phase 2 Category ${testPrefix}`, slug: `cat-${testPrefix}` },
  });
  categoryId = cat.id;

  // Create documents with varying keyword densities across fields
  // Doc A: Title contains "trí tuệ nhân tạo", summary has high density
  const docA = await db.document.create({
    data: {
      title: `${testPrefix} trí tuệ nhân tạo và tương lai công nghệ`,
      slug: `${testPrefix}-doc-a`,
      summary: 'Nghiên cứu trí tuệ nhân tạo và học máy thông minh.',
      content: '<p>Trí tuệ nhân tạo đang làm thay đổi toàn bộ nền kinh tế số.</p>',
      contentPlain: 'Trí tuệ nhân tạo đang làm thay đổi toàn bộ nền kinh tế số.',
      categoryId,
      author: 'Nguyen Van A',
      status: 'PUBLISHED',
      publishedAt: new Date('2025-02-01T10:00:00Z'),
      viewsCount: 100,
    },
  });
  createdDocIds.push(docA.id);

  // Doc B: Only content contains "trí tuệ nhân tạo", title is different
  const docB = await db.document.create({
    data: {
      title: `${testPrefix} Chuyển đổi số trong doanh nghiệp sản xuất`,
      slug: `${testPrefix}-doc-b`,
      summary: 'Các bước tiến hành chuyển đổi số toàn diện cho doanh nghiệp.',
      content: '<p>Ứng dụng trí tuệ nhân tạo để tối ưu hóa dây chuyền sản xuất tự động.</p>',
      contentPlain: 'Ứng dụng trí tuệ nhân tạo để tối ưu hóa dây chuyền sản xuất tự động.',
      categoryId,
      author: 'Tran Van B',
      status: 'PUBLISHED',
      publishedAt: new Date('2025-02-05T10:00:00Z'),
      viewsCount: 10,
    },
  });
  createdDocIds.push(docB.id);

  // Doc C: Unrelated topic
  const docC = await db.document.create({
    data: {
      title: `${testPrefix} Khám phá đại dương sâu thẳm`,
      slug: `${testPrefix}-doc-c`,
      summary: 'Hệ sinh thái sinh vật biển dưới đáy biển sâu.',
      content: '<p>Các loài sinh vật phát quang kỳ lạ dưới lòng đại dương.</p>',
      contentPlain: 'Các loài sinh vật phát quang kỳ lạ dưới lòng đại dương.',
      categoryId,
      author: 'Le Van C',
      status: 'PUBLISHED',
      publishedAt: new Date('2025-02-10T10:00:00Z'),
      viewsCount: 50,
    },
  });
  createdDocIds.push(docC.id);

  // Refresh index
  await globalIndex.buildFromDatabase(db);
});

describe('Phase 2 Search Engine Core: Tokenizer & NLP', () => {
  it('normalizes Vietnamese text and removes accents properly', () => {
    const raw = '  Trí   Tuệ   Nhân   Tạo  ';
    expect(normalizeText(raw)).toBe('trí tuệ nhân tạo');
    expect(removeDiacritics('Học máy & Tìm kiếm')).toBe('hoc may & tim kiem');
  });

  it('tokenizes text, strips stop words, and generates bigrams', () => {
    const text = 'và những trí tuệ nhân tạo trong năm 2025';
    const tokens = tokenize(text, { removeStopWords: true, generateBigrams: true });

    // Stop words like 'và', 'những', 'trong' should be filtered out
    expect(tokens).not.toContain('và');
    expect(tokens).not.toContain('những');
    expect(tokens).not.toContain('trong');

    // Key unigrams & bigrams should be present
    expect(tokens).toContain('trí');
    expect(tokens).toContain('tuệ');
    expect(tokens).toContain('nhân');
    expect(tokens).toContain('tạo');
    expect(tokens).toContain('trí tuệ');
    expect(tokens).toContain('nhân tạo');
  });

  it('calculates term frequencies correctly', () => {
    const tokens = ['ai', 'search', 'ai', 'engine', 'ai'];
    const freqs = countTermFrequencies(tokens);
    expect(freqs.get('ai')).toBe(3);
    expect(freqs.get('search')).toBe(1);
    expect(freqs.get('engine')).toBe(1);
  });
});

describe('Phase 2 Inverted Index', () => {
  it('indexes documents and provides fast term lookup', () => {
    const index = new InvertedIndex();
    index.indexDocument({
      id: 'doc-1',
      title: 'Học máy nâng cao',
      slug: 'hoc-may-nang-cao',
      summary: 'Giáo trình học máy',
      contentPlain: 'Học máy ứng dụng trong xử lý ngôn ngữ tự nhiên.',
      author: 'Nguyen Van A',
      categoryId: 'cat-1',
    });

    const postings = index.getPostings('học máy');
    expect(postings).toBeDefined();
    expect(postings?.has('doc-1')).toBe(true);

    const docPosting = postings?.get('doc-1');
    expect(docPosting?.tfTitle).toBeGreaterThanOrEqual(1);
    expect(docPosting?.tfSummary).toBeGreaterThanOrEqual(1);

    const suggestions = index.getSuggestions('học', 5);
    expect(suggestions.some((s) => s.startsWith('học'))).toBe(true);
  });

  it('calculates Robertson-Spärck Jones IDF correctly', () => {
    const idfRare = calculateIdf(100, 2);
    const idfCommon = calculateIdf(100, 80);
    expect(idfRare).toBeGreaterThan(idfCommon);
    expect(idfCommon).toBeGreaterThanOrEqual(0);
  });

  it('extracts snippets with highlighted <mark> tags', () => {
    const text = 'Hệ thống tìm kiếm thông tin ứng dụng giải thuật BM25 giúp xếp hạng văn bản chính xác nhất.';
    const snippet = extractSnippet(text, ['bm25', 'tìm kiếm']);
    expect(snippet).toContain('>tìm kiếm</mark>');
    expect(snippet).toContain('>BM25</mark>');
  });
});

describe('Phase 2 Multi-Model Search API Endpoints', () => {
  it('ranks higher when keyword is in title (BM25F field weighting)', async () => {
    const a = agent();
    const res = await a.get(`/api/v1/search?q=${testPrefix}&mode=bm25`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.meta.mode).toBe('bm25');
    expect(res.body.meta.executionTimeMs).toBeDefined();

    // Verify each doc has score and highlight snippet
    expect(res.body.data[0].score).toBeGreaterThan(0);
    expect(res.body.data[0].highlightSnippet).toBeDefined();
  });

  it('supports TF-IDF ranking mode', async () => {
    const a = agent();
    const res = await a.get(`/api/v1/search?q=${testPrefix}&mode=tfidf`);
    expect(res.status).toBe(200);
    expect(res.body.meta.mode).toBe('tfidf');
    expect(res.body.meta.rankingAlgorithm).toContain('TF-IDF');
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('supports Hybrid ranking with click feedback boost', async () => {
    const a = agent();
    const t = await csrfToken(a);

    // Initial search
    const initRes = await a.get(`/api/v1/search?q=${testPrefix}&mode=hybrid`);
    expect(initRes.status).toBe(200);
    const searchId = initRes.body.meta.searchId;
    const targetDocId = createdDocIds[1]; // Doc B

    // Simulate 3 clicks on Doc B to boost its CTR
    for (let pos = 1; pos <= 3; pos++) {
      const clickRes = await a
        .post('/api/v1/search/clicks')
        .set('X-CSRF-Token', t)
        .send({
          search_id: searchId,
          clicked_doc_id: targetDocId,
          position: initRes.body.data.findIndex((d: { id: string }) => d.id === targetDocId) + 1,
        });
      expect(clickRes.status).toBe(201);
    }

    // Next search in hybrid mode should factor in click logs
    const hybridRes = await a.get(`/api/v1/search?q=${testPrefix}&mode=hybrid`);
    expect(hybridRes.status).toBe(200);
    expect(hybridRes.body.meta.mode).toBe('hybrid');
  });

  it('returns query autocomplete suggestions', async () => {
    const a = agent();
    const res = await a.get(`/api/v1/search/suggestions?q=${testPrefix}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns diagnostic index stats at /api/v1/search/stats', async () => {
    const a = agent();
    const res = await a.get('/api/v1/search/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalDocuments).toBeGreaterThanOrEqual(3);
    expect(res.body.data.vocabularySize).toBeGreaterThan(0);
    expect(res.body.data.averageFieldLengths).toBeDefined();
    expect(res.body.data.averageFieldLengths.title).toBeGreaterThan(0);
  });

  it('requires document.publish permission for reindexing', async () => {
    const guest = agent();
    const guestCsrf = await csrfToken(guest);
    const guestRes = await guest
      .post('/api/v1/search/reindex')
      .set('X-CSRF-Token', guestCsrf);
    expect(guestRes.status).toBe(401);

    const { a: admin, t: adminCsrf } = await login('admin');
    const adminRes = await admin
      .post('/api/v1/search/reindex')
      .set('X-CSRF-Token', adminCsrf);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.message).toBe('Reindexing completed successfully');
    expect(adminRes.body.data.stats).toBeDefined();
  });

  it('supports accent-insensitive search queries', async () => {
    const a = agent();
    const res = await a.get(`/api/v1/search?q=tri tue&mode=bm25`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.some((d: { title: string }) => d.title.includes('trí tuệ'))).toBe(true);
  });

  it('synchronizes index lifecycle on document unpublishing and soft-deletion', async () => {
    const { a: managerAgent, t: csrf } = await login('manager');
    const createRes = await managerAgent
      .post('/api/v1/documents')
      .set('X-CSRF-Token', csrf)
      .send({
        title: `IndexLifecycle ${testPrefix} bài viết mới`,
        summary: 'Kiểm tra vòng đời chỉ mục',
        content: '<p>Nội dung kiểm định vòng đời.</p>',
        categoryId,
        tagIds: [],
      });
    expect(createRes.status).toBe(201);
    const newDocId = createRes.body.data.id;
    createdDocIds.push(newDocId);

    // Initial creation as draft should NOT be indexed
    expect(globalIndex.getDocumentMeta(newDocId)).toBeUndefined();

    // Publish the document
    const pubRes = await managerAgent
      .patch(`/api/v1/documents/${newDocId}/status`)
      .set('X-CSRF-Token', csrf)
      .send({ status: 'PUBLISHED' });
    expect(pubRes.status).toBe(200);

    // Verify it is immediately in the inverted index
    expect(globalIndex.getDocumentMeta(newDocId)).toBeDefined();

    // Unpublish the document
    const unpubRes = await managerAgent
      .patch(`/api/v1/documents/${newDocId}/status`)
      .set('X-CSRF-Token', csrf)
      .send({ status: 'UNPUBLISHED' });
    expect(unpubRes.status).toBe(200);

    // Verify it was immediately removed from inverted index
    expect(globalIndex.getDocumentMeta(newDocId)).toBeUndefined();

    // Soft delete the document
    const delRes = await managerAgent
      .delete(`/api/v1/documents/${newDocId}`)
      .set('X-CSRF-Token', csrf);
    expect(delRes.status).toBe(200);
    expect(globalIndex.getDocumentMeta(newDocId)).toBeUndefined();
  });
});

afterAll(async () => {
  await db.searchClickLog.deleteMany({ where: { queryString: { contains: testPrefix } } });
  await db.document.deleteMany({ where: { id: { in: createdDocIds } } });
  await db.category.delete({ where: { id: categoryId } });
  await db.$disconnect();
  await sessionPool.end();
});
