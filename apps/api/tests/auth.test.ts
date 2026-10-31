import { describe, it, expect, afterAll } from 'vitest';
import { db, sessionPool } from '../src/lib/db.js';
import { agent, csrfToken, login } from './helpers.js';
const suffix = Date.now().toString(36);
describe('M2 authentication, sessions and live RBAC', () => {
  it('T03 register, duplicate email, own profile, public profile privacy and T04 logout', async () => {
    const a = agent();
    let t = await csrfToken(a);
    const input = {
      email: `auth_${suffix}@example.test`,
      username: `auth_${suffix}`,
      password: 'Test-only-password-1234',
    };
    const created = await a.post('/api/v1/auth/register').set('X-CSRF-Token', t).send(input);
    expect(created.status).toBe(201);
    expect(created.body.data.roles).toEqual(['USER']);
    expect(JSON.stringify(created.body)).not.toContain('passwordHash');
    expect(created.headers['set-cookie']?.[0]).toContain('HttpOnly');
    t = await csrfToken(a);
    expect((await a.post('/api/v1/auth/register').set('X-CSRF-Token', t).send(input)).status).toBe(
      409,
    );
    expect(
      (
        await a
          .patch('/api/v1/users/me')
          .set('X-CSRF-Token', t)
          .send({ displayName: 'Bạn đọc', bio: 'Khoa học' })
      ).body.data.displayName,
    ).toBe('Bạn đọc');
    const profile = await a.get(`/api/v1/users/${input.username}`);
    expect(profile.status).toBe(200);
    expect(profile.body.data.email).toBeUndefined();
    expect((await a.post('/api/v1/auth/logout').set('X-CSRF-Token', t).send({})).status).toBe(200);
    expect((await a.get('/api/v1/auth/me')).status).toBe(401);
  });
  it('rejects missing CSRF, unexpected profile privilege fields, bad credentials', async () => {
    const a = agent();
    expect((await a.post('/api/v1/auth/login').send({})).status).toBe(403);
    const { a: u, t } = await login('user');
    expect(
      (
        await u
          .patch('/api/v1/users/me')
          .set('X-CSRF-Token', t)
          .send({ roles: ['SUPER_ADMIN'] })
      ).status,
    ).toBe(422);
    expect(
      (
        await u
          .post('/api/v1/auth/login')
          .set('X-CSRF-Token', t)
          .send({ email: 'user@demo.local', password: 'incorrect' })
      ).status,
    ).toBe(401);
  });
  it('reloads database permissions on the next request', async () => {
    const { a, user } = await login('user');
    const permission = await db.permission.findUniqueOrThrow({ where: { key: 'analytics.read' } });
    const role = await db.role.create({
      data: {
        key: `TEST_${suffix}`,
        name: 'temporary test',
        permissions: { create: { permissionId: permission.id } },
        users: { create: { userId: user.id } },
      },
    });
    try {
      expect((await a.get('/api/v1/auth/me')).body.data.permissions).toContain('analytics.read');
    } finally {
      await db.userRole.deleteMany({ where: { roleId: role.id } });
      await db.role.delete({ where: { id: role.id } });
    }
    expect((await a.get('/api/v1/auth/me')).body.data.permissions).not.toContain('analytics.read');
  });
});
afterAll(async () => {
  await db.$disconnect();
  await sessionPool.end();
});
