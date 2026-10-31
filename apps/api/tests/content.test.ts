import { describe, it, expect, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db, sessionPool } from '../src/lib/db.js';
import { agent, csrfToken, login } from './helpers.js';
describe('M3 content lifecycle, taxonomy, views and uploads', () => {
  it('T02 T05 T06 T07 T19 T20 lifecycle with public privacy, RBAC, XSS filtering and view deduplication', async () => {
    const { a, t } = await login('manager');
    const { a: u, t: ut } = await login('user');
    const cat = await a
      .post('/api/v1/categories')
      .set('X-CSRF-Token', t)
      .send({ name: `Test ${randomUUID()}` });
    expect(cat.status).toBe(201);
    expect(
      (
        await a
          .patch(`/api/v1/categories/${cat.body.data.id}`)
          .set('X-CSRF-Token', t)
          .send({ name: 'Danh mục đã sửa', description: 'Kiểm thử taxonomy' })
      ).status,
    ).toBe(200);
    const empty = await a
      .post('/api/v1/categories')
      .set('X-CSRF-Token', t)
      .send({ name: 'Danh mục trống' });
    expect(
      (await a.delete(`/api/v1/categories/${empty.body.data.id}`).set('X-CSRF-Token', t).send({}))
        .status,
    ).toBe(200);
    const tag = await a
      .post('/api/v1/tags')
      .set('X-CSRF-Token', t)
      .send({ name: 'Khoa học thử nghiệm' });
    expect(tag.status).toBe(201);
    const payload = {
      title: 'Kiểm định mô hình',
      summary: 'Dữ liệu kiểm định độc lập.',
      content:
        '<p>Tiếng Việt &amp; dữ liệu</p><script>alert(1)</script><a href="javascript:alert(1)">link</a>',
      categoryId: cat.body.data.id,
      tagIds: [tag.body.data.id],
    };
    expect((await u.post('/api/v1/documents').set('X-CSRF-Token', ut).send(payload)).status).toBe(
      403,
    );
    const created = await a.post('/api/v1/documents').set('X-CSRF-Token', t).send(payload);
    expect(created.status).toBe(201);
    const doc = created.body.data;
    expect(doc.content).not.toContain('<script');
    expect(doc.content).not.toContain('javascript:');
    expect(doc.contentPlain).toContain('Tiếng Việt & dữ liệu');
    expect(doc.tags[0].tagId).toBe(tag.body.data.id);
    const guest = agent();
    expect((await guest.get(`/api/v1/documents/${doc.slug}`)).status).toBe(404);
    expect(
      (await a.get('/api/v1/admin/documents?status=DRAFT')).body.data.some(
        (d: { id: string }) => d.id === doc.id,
      ),
    ).toBe(true);
    expect(
      (
        await a
          .patch(`/api/v1/documents/${doc.id}`)
          .set('X-CSRF-Token', t)
          .send({ title: 'Tiêu đề đã sửa' })
      ).status,
    ).toBe(200);
    expect(
      (
        await a
          .patch(`/api/v1/documents/${doc.id}/status`)
          .set('X-CSRF-Token', t)
          .send({ status: 'PUBLISHED' })
      ).status,
    ).toBe(200);
    const detail = await guest.get(`/api/v1/documents/${doc.slug}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.viewsCount).toBe(1);
    expect((await guest.get(`/api/v1/documents/${doc.slug}`)).body.data.viewsCount).toBe(1);
    expect(await db.documentView.count({ where: { documentId: doc.id } })).toBe(1);
    const list = await guest.get(
      `/api/v1/documents?category=${cat.body.data.slug}&tag=${tag.body.data.slug}`,
    );
    expect(list.body.data[0].id).toBe(doc.id);
    expect(
      (await a.delete(`/api/v1/categories/${cat.body.data.id}`).set('X-CSRF-Token', t).send({}))
        .status,
    ).toBe(409);
    expect(
      (
        await a
          .patch(`/api/v1/documents/${doc.id}/status`)
          .set('X-CSRF-Token', t)
          .send({ status: 'UNPUBLISHED' })
      ).status,
    ).toBe(200);
    expect((await guest.get(`/api/v1/documents/${doc.slug}`)).status).toBe(404);
    expect(
      (await a.delete(`/api/v1/documents/${doc.id}`).set('X-CSRF-Token', t).send({})).status,
    ).toBe(200);
    expect((await a.get(`/api/v1/admin/documents/${doc.id}`)).status).toBe(404);
    expect(
      (
        await a
          .patch(`/api/v1/tags/${tag.body.data.id}`)
          .set('X-CSRF-Token', t)
          .send({ name: 'Thẻ mới' })
      ).status,
    ).toBe(200);
    expect(
      (await a.delete(`/api/v1/tags/${tag.body.data.id}`).set('X-CSRF-Token', t).send({})).status,
    ).toBe(200);
  });
  it('T20 rejects spoofed image MIME, SVG and missing alt; accepts genuine PNG', async () => {
    const { a, t } = await login('manager');
    const bad = await a
      .post('/api/v1/uploads/images')
      .set('X-CSRF-Token', t)
      .field('alt', 'Ảnh')
      .attach('image', Buffer.from('<script>alert(1)</script>'), {
        filename: 'x.png',
        contentType: 'image/png',
      });
    expect(bad.status).toBe(422);
    expect(
      (
        await a
          .post('/api/v1/uploads/images')
          .set('X-CSRF-Token', t)
          .field('alt', 'Ảnh')
          .attach('image', Buffer.from('<svg/>'), {
            filename: 'x.svg',
            contentType: 'image/svg+xml',
          })
      ).status,
    ).toBe(422);
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZusAAAAASUVORK5CYII=',
      'base64',
    );
    const ok = await a
      .post('/api/v1/uploads/images')
      .set('X-CSRF-Token', t)
      .field('alt', 'Điểm ảnh')
      .attach('image', png, { filename: '../../x.png', contentType: 'image/png' });
    expect(ok.status).toBe(201);
    expect(
      (
        await a
          .post('/api/v1/uploads/images')
          .set('X-CSRF-Token', t)
          .attach('image', png, { filename: 'no-alt.png', contentType: 'image/png' })
      ).status,
    ).toBe(422);
    const served = await a.get(ok.body.data.url);
    expect(served.status).toBe(200);
    expect(served.headers['x-content-type-options']).toBe('nosniff');
    expect(ok.body.data.url).toMatch(/^\/uploads\/[a-f0-9-]+\.png$/);
    const g = agent();
    const gt = await csrfToken(g);
    expect((await g.post('/api/v1/documents').set('X-CSRF-Token', gt).send({})).status).toBe(401);
    expect((await g.get('/api/v1/documents?pageSize=100')).status).toBe(422);
  });
});
afterAll(async () => {
  await db.$disconnect();
  await sessionPool.end();
});
