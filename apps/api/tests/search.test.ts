import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db, sessionPool } from '../src/lib/db.js';
import { agent, csrfToken } from './helpers.js';
const prefix = `search-${randomUUID()}`;
let categoryId: string;
let tagId: string;
const ids: string[] = [];
beforeAll(async () => {
  const cat = await db.category.create({ data: { name: 'Search fixture', slug: prefix } });
  categoryId = cat.id;
  const tag = await db.tag.create({ data: { name: 'Search tag', slug: prefix } });
  tagId = tag.id;
  for (let i = 0; i < 14; i++) {
    const doc = await db.document.create({
      data: {
        title: `${prefix} mô hình ${i}`,
        slug: `${prefix}-${i}`,
        summary: 'Kiểm định bộ lọc và phân trang',
        content: '<p>Dữ liệu độc lập.</p>',
        contentPlain: 'Dữ liệu độc lập.',
        categoryId,
        author: 'Test',
        status: i < 12 ? 'PUBLISHED' : i === 12 ? 'DRAFT' : 'UNPUBLISHED',
        publishedAt: new Date(`2025-01-${String(i + 1).padStart(2, '0')}T12:00:00Z`),
        tags: { create: { tagId } },
      },
    });
    ids.push(doc.id);
  }
});
describe('M4 SQL search and public listing', () => {
  it('T01 T15 correct keyword/taxonomy/date/pagination and draft exclusions', async () => {
    const a = agent();
    const one = await a.get(`/api/v1/documents?category=${prefix}`);
    expect(one.status).toBe(200);
    expect(one.body.data).toHaveLength(10);
    const two = await a.get(`/api/v1/documents?category=${prefix}&page=2`);
    expect(two.body.data).toHaveLength(2);
    expect(
      two.body.data.some((d: { id: string }) =>
        one.body.data.some((x: { id: string }) => x.id === d.id),
      ),
    ).toBe(false);
    expect(one.body.data.every((d: { status: string }) => d.status === 'PUBLISHED')).toBe(true);
    const r = await a.get(
      `/api/v1/search?q=${prefix}&category=${prefix}&tag=${prefix}&from=2025-01-05&to=2025-01-09`,
    );
    expect(r.status).toBe(200);
    expect(r.body.meta.total).toBe(5);
    expect(r.body.meta.searchId).toBeTruthy();
    const log = await db.searchClickLog.findUniqueOrThrow({ where: { id: r.body.meta.searchId } });
    expect(log.eventType).toBe('SEARCH');
    expect(log.resultCount).toBe(5);
    expect(log.clickedDocId).toBeNull();
    expect(log.userId).toBeNull();
    expect((await a.get(`/api/v1/documents/${prefix}-12`)).status).toBe(404);
    const zero = await a.get('/api/v1/search').query({ q: "' OR 1=1; --" });
    expect(zero.status).toBe(200);
    expect(zero.body.meta.total).toBe(0);
    expect((await a.get('/api/v1/search?q=x&from=2025-02-01&to=2025-01-01')).status).toBe(422);
  });
  it('T16 T17 T18 log zero results, link real clicks and reject forged results and foreign searches', async () => {
    const a = agent();
    const t = await csrfToken(a);
    const zero = await a.get(`/api/v1/search?q=missing-${prefix}`);
    expect(zero.body.meta.total).toBe(0);
    expect(
      (await db.searchClickLog.findUniqueOrThrow({ where: { id: zero.body.meta.searchId } }))
        .clickedDocId,
    ).toBeNull();
    const r = await a.get(`/api/v1/search?q=${prefix}`);
    const doc = r.body.data[0];
    expect(
      (
        await a
          .post('/api/v1/search/clicks')
          .set('X-CSRF-Token', t)
          .send({ search_id: r.body.meta.searchId, clicked_doc_id: doc.id, position: 1 })
      ).status,
    ).toBe(201);
    const log = await db.searchClickLog.findFirstOrThrow({
      where: { searchId: r.body.meta.searchId },
    });
    expect(log.queryString).toBe(prefix);
    expect(log.clickedDocId).toBe(doc.id);
    expect(log.timestamp).toBeInstanceOf(Date);
    const foreign = agent();
    const ft = await csrfToken(foreign);
    expect(
      (
        await foreign
          .post('/api/v1/search/clicks')
          .set('X-CSRF-Token', ft)
          .send({ search_id: r.body.meta.searchId, clicked_doc_id: doc.id })
      ).status,
    ).toBe(404);
    expect(
      (
        await a
          .post('/api/v1/search/clicks')
          .set('X-CSRF-Token', t)
          .send({ search_id: r.body.meta.searchId, clicked_doc_id: ids[0] })
      ).status,
    ).toBe(422);
    const before = await db.searchClickLog.count({ where: { eventType: 'CLICK' } });
    await a.get(`/api/v1/documents/${doc.slug}`);
    expect(await db.searchClickLog.count({ where: { eventType: 'CLICK' } })).toBe(before);
  });
});
afterAll(async () => {
  await db.searchClickLog.deleteMany({ where: { queryString: { contains: prefix } } });
  await db.document.deleteMany({ where: { id: { in: ids } } });
  await db.category.delete({ where: { id: categoryId } });
  await db.tag.delete({ where: { id: tagId } });
  await db.$disconnect();
  await sessionPool.end();
});
