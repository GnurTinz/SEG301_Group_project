import { describe, it, expect, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db, sessionPool } from '../src/lib/db.js';
import { login } from './helpers.js';
describe('M7 administration and safety invariants', () => {
  it('T13 T14 protects last active admin/core permissions and rejects moderator/SEO administrative calls', async () => {
    const { a, t, user } = await login('admin');
    const role = await db.role.findUniqueOrThrow({ where: { key: 'SUPER_ADMIN' } });
    expect(
      (
        await a
          .put(`/api/v1/admin/users/${user.id}/roles`)
          .set('X-CSRF-Token', t)
          .send({ roleIds: [] })
      ).status,
    ).toBe(409);
    expect(
      (
        await a
          .patch(`/api/v1/admin/users/${user.id}`)
          .set('X-CSRF-Token', t)
          .send({ status: 'SUSPENDED' })
      ).status,
    ).toBe(409);
    expect(
      (
        await a
          .put(`/api/v1/admin/roles/${role.id}/permissions`)
          .set('X-CSRF-Token', t)
          .send({ permissionIds: [] })
      ).status,
    ).toBe(409);
    for (const name of ['moderator', 'seo', 'user']) {
      const { a: m, t: mt } = await login(name);
      expect((await m.get('/api/v1/admin/users')).status).toBe(403);
      expect(
        (
          await m
            .put(`/api/v1/admin/users/${user.id}/roles`)
            .set('X-CSRF-Token', mt)
            .send({ roleIds: [] })
        ).status,
      ).toBe(403);
    }
  });
  it('assigns roles, changes permissions immediately and suspends existing sessions', async () => {
    const { a, t } = await login('admin');
    const { a: u, user } = await login('user');
    const existing = await db.userRole.findMany({ where: { userId: user.id } });
    const role = await db.role.create({ data: { key: `TEMP_${randomUUID()}`, name: 'Temporary' } });
    const p = await db.permission.findUniqueOrThrow({ where: { key: 'analytics.read' } });
    try {
      expect(
        (
          await a
            .put(`/api/v1/admin/users/${user.id}/roles`)
            .set('X-CSRF-Token', t)
            .send({ roleIds: [...existing.map((r) => r.roleId), role.id] })
        ).status,
      ).toBe(200);
      expect((await u.get('/api/v1/analytics/overview')).status).toBe(403);
      expect(
        (
          await a
            .put(`/api/v1/admin/roles/${role.id}/permissions`)
            .set('X-CSRF-Token', t)
            .send({ permissionIds: [p.id] })
        ).status,
      ).toBe(200);
      expect((await u.get('/api/v1/analytics/overview')).status).toBe(200);
      expect(
        (
          await a
            .patch(`/api/v1/admin/users/${user.id}`)
            .set('X-CSRF-Token', t)
            .send({ status: 'SUSPENDED' })
        ).status,
      ).toBe(200);
      expect((await u.get('/api/v1/auth/me')).status).toBe(401);
    } finally {
      await db.user.update({ where: { id: user.id }, data: { status: 'ACTIVE' } });
      await db.userRole.deleteMany({ where: { roleId: role.id } });
      await db.role.delete({ where: { id: role.id } });
    }
  });
  it('T24 settings whitelist and audit filters work; ordinary users rejected', async () => {
    const { a, t } = await login('admin');
    const old = (await a.get('/api/v1/admin/settings')).body.data;
    try {
      expect(
        (
          await a
            .patch('/api/v1/admin/settings')
            .set('X-CSRF-Token', t)
            .send({ siteName: 'Tạp chí kiểm thử', commentsEnabled: false, logRetentionDays: 30 })
        ).status,
      ).toBe(200);
      expect((await a.get('/api/v1/admin/settings')).body.data.commentsEnabled).toBe(false);
      expect(
        (
          await a
            .patch('/api/v1/admin/settings')
            .set('X-CSRF-Token', t)
            .send({ sessionSecret: 'leak' })
        ).status,
      ).toBe(422);
      expect(
        (await a.get('/api/v1/admin/audit-logs?action=settings.update')).body.meta.total,
      ).toBeGreaterThan(0);
    } finally {
      await a.patch('/api/v1/admin/settings').set('X-CSRF-Token', t).send(old);
    }
    const { a: u, t: ut } = await login('user');
    expect((await u.get('/api/v1/admin/audit-logs')).status).toBe(403);
    expect(
      (await u.patch('/api/v1/admin/settings').set('X-CSRF-Token', ut).send({ siteName: 'x' }))
        .status,
    ).toBe(403);
  });
});
afterAll(async () => {
  await db.$disconnect();
  await sessionPool.end();
});
