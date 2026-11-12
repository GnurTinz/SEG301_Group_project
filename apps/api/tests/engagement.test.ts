import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db, sessionPool } from '../src/lib/db.js';
import { login, agent, csrfToken } from './helpers.js';
let documentId: string;
let categoryId: string;
beforeAll(async () => {
  const category = await db.category.create({
    data: { name: 'Engagement', slug: `engagement-${randomUUID()}` },
  });
  categoryId = category.id;
  const doc = await db.document.create({
    data: {
      title: 'Thảo luận về kiểm định',
      slug: `discussion-${randomUUID()}`,
      summary: 'Đánh giá mô hình',
      content: '<p>Kiểm định dữ liệu.</p>',
      contentPlain: 'Kiểm định dữ liệu.',
      categoryId,
      author: 'Test',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });
  documentId = doc.id;
});
describe('M5 engagement and moderation', () => {
  it('T08 T09 T11 owner enforcement, valid mentions, replies and moderator report handling', async () => {
    const { a, t, user } = await login('user');
    const { a: other, t: ot } = await login('manager');
    const { a: mod, t: mt } = await login('moderator');
    const r = await a
      .post(`/api/v1/documents/${documentId}/comments`)
      .set('X-CSRF-Token', t)
      .send({ body: 'Cảm ơn @seo và @nonexistent_123 <script>alert(1)</script>' });
    expect(r.status).toBe(201);
    const c = r.body.data;
    expect(c.userId).toBe(user.id);
    expect(c.body).not.toContain('<script');
    expect(c.mentions).toHaveLength(1);
    expect(c.mentions[0].mentionedUser.username).toBe('seo');
    expect(
      (
        await other
          .patch(`/api/v1/comments/${c.id}`)
          .set('X-CSRF-Token', ot)
          .send({ body: 'Chiếm quyền' })
      ).status,
    ).toBe(403);
    expect(
      (
        await a
          .patch(`/api/v1/comments/${c.id}`)
          .set('X-CSRF-Token', t)
          .send({ body: 'Đã sửa @manager' })
      ).status,
    ).toBe(200);
    expect(await db.commentMention.findMany({ where: { commentId: c.id } })).toHaveLength(1);
    const reply = await other
      .post(`/api/v1/documents/${documentId}/comments`)
      .set('X-CSRF-Token', ot)
      .send({ body: 'Phản hồi', parentId: c.id });
    expect(reply.status).toBe(201);
    const report = await a
      .post('/api/v1/reports')
      .set('X-CSRF-Token', t)
      .send({ commentId: c.id, reason: 'SPAM' });
    expect(report.status).toBe(201);
    expect(
      (
        await a
          .post('/api/v1/reports')
          .set('X-CSRF-Token', t)
          .send({ commentId: c.id, reason: 'SPAM' })
      ).status,
    ).toBe(409);
    expect((await a.get('/api/v1/moderation/comments')).status).toBe(403);
    const reports = await mod.get('/api/v1/moderation/reports');
    expect(reports.status).toBe(200);
    const foundReport = reports.body.data.find(
      (item: { id: string }) => item.id === report.body.data.id,
    );
    expect(foundReport).toBeDefined();
    expect(foundReport.comment.document.slug).toBeTruthy();
    expect(
      (
        await mod
          .patch(`/api/v1/moderation/comments/${c.id}/status`)
          .set('X-CSRF-Token', mt)
          .send({ status: 'HIDDEN' })
      ).status,
    ).toBe(200);
    const visible = await agent().get(`/api/v1/documents/${documentId}/comments`);
    expect(visible.body.data).toHaveLength(0);
    expect(
      (
        await mod
          .patch(`/api/v1/moderation/reports/${report.body.data.id}`)
          .set('X-CSRF-Token', mt)
          .send({ status: 'RESOLVED' })
      ).status,
    ).toBe(200);
    expect(
      await db.auditLog.count({ where: { entityId: c.id, action: 'moderation.comment_status' } }),
    ).toBe(1);
    expect(
      (await db.report.findUniqueOrThrow({ where: { id: report.body.data.id } })).resolvedBy,
    ).toBeTruthy();
    expect(
      (
        await mod
          .patch(`/api/v1/moderation/comments/${c.id}/status`)
          .set('X-CSRF-Token', mt)
          .send({ status: 'VISIBLE' })
      ).status,
    ).toBe(200);
    expect((await agent().get(`/api/v1/documents/${documentId}/comments`)).body.data).toHaveLength(
      2,
    );
    expect(
      (await a.delete(`/api/v1/comments/${c.id}`).set('X-CSRF-Token', t).send({})).status,
    ).toBe(200);
    const docReport = await a
      .post('/api/v1/reports')
      .set('X-CSRF-Token', t)
      .send({ documentId, reason: 'MISINFORMATION', description: 'Kiểm tra nguồn dẫn' });
    expect(docReport.status).toBe(201);
    const modDocReports = await mod.get('/api/v1/moderation/reports?status=OPEN');
    expect(modDocReports.status).toBe(200);
    const foundDocReport = modDocReports.body.data.find(
      (item: { id: string }) => item.id === docReport.body.data.id,
    );
    expect(foundDocReport.document.slug).toBeTruthy();
    expect(
      (
        await mod
          .patch(`/api/v1/moderation/reports/${docReport.body.data.id}`)
          .set('X-CSRF-Token', mt)
          .send({ status: 'DISMISSED' })
      ).status,
    ).toBe(200);
    const { a: seo } = await login('seo');
    expect((await seo.get('/api/v1/moderation/reports')).status).toBe(403);
    expect((await other.get('/api/v1/moderation/reports')).status).toBe(403);
  });
  it('T10 likes are idempotent and ratings are bounded and replaceable; guest interaction rejected', async () => {
    const { a, t, user } = await login('user');
    for (let i = 0; i < 2; i++)
      expect(
        (await a.put(`/api/v1/documents/${documentId}/like`).set('X-CSRF-Token', t).send({}))
          .status,
      ).toBe(200);
    expect(await db.documentLike.count({ where: { documentId, userId: user.id } })).toBe(1);
    for (const value of [0, 6, 1.5])
      expect(
        (
          await a
            .put(`/api/v1/documents/${documentId}/rating`)
            .set('X-CSRF-Token', t)
            .send({ value })
        ).status,
      ).toBe(422);
    for (const value of [1, 5])
      expect(
        (
          await a
            .put(`/api/v1/documents/${documentId}/rating`)
            .set('X-CSRF-Token', t)
            .send({ value })
        ).status,
      ).toBe(200);
    expect(await db.documentRating.count({ where: { documentId, userId: user.id } })).toBe(1);
    expect(
      (
        await db.documentRating.findUniqueOrThrow({
          where: { documentId_userId: { documentId, userId: user.id } },
        })
      ).value,
    ).toBe(5);
    expect(
      (await a.delete(`/api/v1/documents/${documentId}/like`).set('X-CSRF-Token', t).send({}))
        .status,
    ).toBe(200);
    expect(
      (await a.delete(`/api/v1/documents/${documentId}/rating`).set('X-CSRF-Token', t).send({}))
        .status,
    ).toBe(200);
    const guest = agent();
    const gt = await csrfToken(guest);
    expect(
      (await guest.put(`/api/v1/documents/${documentId}/like`).set('X-CSRF-Token', gt).send({}))
        .status,
    ).toBe(401);
  });
});
afterAll(async () => {
  await db.commentMention.deleteMany({ where: { comment: { documentId } } });
  await db.comment.deleteMany({ where: { documentId, parentId: { not: null } } });
  await db.document.delete({ where: { id: documentId } });
  await db.category.delete({ where: { id: categoryId } });
  await db.$disconnect();
  await sessionPool.end();
});
