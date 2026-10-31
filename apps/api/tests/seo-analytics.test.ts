import { describe, it, expect, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db, sessionPool } from '../src/lib/db.js';
import { login } from './helpers.js';
describe('M6 SEO boundaries and real analytics', () => {
  it('T12 SEO whitelist enforced; T17 T19 analytics increase from actual signed-in activity', async () => {
    const prefix = `analytics-${randomUUID()}`;
    const cat = await db.category.create({ data: { name: 'Analytics fixture', slug: prefix } });
    const doc = await db.document.create({
      data: {
        title: prefix,
        slug: prefix,
        content: '<p>Giữ nội dung</p>',
        contentPlain: 'Giữ nội dung',
        summary: 'Giữ tóm tắt',
        author: 'Test',
        categoryId: cat.id,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
    const { a, t } = await login('seo');
    const { a: user, t: ut, user: identity } = await login('user');
    try {
      expect(
        (
          await a
            .patch(`/api/v1/seo/documents/${doc.id}`)
            .set('X-CSRF-Token', t)
            .send({
              seoTitle: 'Tiêu đề chuẩn SEO',
              seoDescription: 'Mô tả hữu ích',
              coverImageAlt: 'Minh họa',
            })
        ).status,
      ).toBe(200);
      expect(
        (
          await a
            .patch(`/api/v1/seo/documents/${doc.id}`)
            .set('X-CSRF-Token', t)
            .send({ content: 'Thay nội dung' })
        ).status,
      ).toBe(422);
      expect(
        (
          await a
            .patch(`/api/v1/documents/${doc.id}`)
            .set('X-CSRF-Token', t)
            .send({ content: 'Thay nội dung' })
        ).status,
      ).toBe(403);
      expect(
        (
          await a
            .patch(`/api/v1/documents/${doc.id}/status`)
            .set('X-CSRF-Token', t)
            .send({ status: 'UNPUBLISHED' })
        ).status,
      ).toBe(403);
      expect((await db.document.findUniqueOrThrow({ where: { id: doc.id } })).content).toBe(
        '<p>Giữ nội dung</p>',
      );
      expect((await user.get('/api/v1/analytics/overview')).status).toBe(403);
      const before = (await a.get('/api/v1/analytics/overview')).body.data;
      const s = await user.get('/api/v1/search').query({ q: prefix });
      expect(
        (await db.searchClickLog.findUniqueOrThrow({ where: { id: s.body.meta.searchId } })).userId,
      ).toBe(identity.id);
      expect(
        (
          await user
            .post('/api/v1/search/clicks')
            .set('X-CSRF-Token', ut)
            .send({ search_id: s.body.meta.searchId, clicked_doc_id: doc.id, position: 1 })
        ).status,
      ).toBe(201);
      await user.get(`/api/v1/documents/${doc.slug}`);
      const after = (await a.get('/api/v1/analytics/overview')).body.data;
      expect(after.searches).toBe(before.searches + 1);
      expect(after.clicks).toBe(before.clicks + 1);
      expect(after.views).toBe(before.views + 1);
      expect(after.ctr).toBeCloseTo((after.clicks / after.searches) * 100);
      expect(after.trends.length).toBeGreaterThan(0);
      const empty = (await a.get('/api/v1/analytics/overview?from=2000-01-01&to=2000-01-02')).body
        .data;
      expect(empty.searches).toBe(0);
      expect(empty.ctr).toBe(0);
    } finally {
      await db.searchClickLog.deleteMany({ where: { queryString: prefix } });
      await db.document.delete({ where: { id: doc.id } });
      await db.category.delete({ where: { id: cat.id } });
    }
  });
});
afterAll(async () => {
  await db.$disconnect();
  await sessionPool.end();
});
