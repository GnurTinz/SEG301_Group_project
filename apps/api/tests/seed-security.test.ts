import { describe, it, expect, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import express from 'express';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { db, sessionPool } from '../src/lib/db.js';
import { env } from '../src/config/env.js';
import { limiter } from '../src/middleware/security.js';
import { articles } from '../prisma/content/index.js';
import { slugify } from '../src/modules/documents/service.js';
import { agent, csrfToken, login } from './helpers.js';
describe('M8 corpus, database invariants and security regressions', () => {
  it('T21 exactly 80 meaningful distinct seed articles; seeding twice preserves counts', async () => {
    const before = await Promise.all([
      db.document.count(),
      db.user.count(),
      db.category.count(),
      db.tag.count(),
      db.comment.count(),
      db.report.count(),
    ]);
    for (let i = 0; i < 2; i++) {
      const r = spawnSync(process.execPath, ['--import', 'tsx', 'apps/api/prisma/seed.ts'], {
        env: process.env,
        encoding: 'utf8',
      });
      expect(r.status, r.stderr).toBe(0);
    }
    expect(
      await Promise.all([
        db.document.count(),
        db.user.count(),
        db.category.count(),
        db.tag.count(),
        db.comment.count(),
        db.report.count(),
      ]),
    ).toEqual(before);
    const docs = await db.document.findMany({
      where: { slug: { in: articles.map((a) => `seed-${slugify(a.title)}`) } },
      include: { tags: true },
    });
    expect(docs).toHaveLength(80);
    expect(new Set(docs.map((d) => d.contentPlain)).size).toBe(80);
    expect(docs.filter((d) => d.status === 'PUBLISHED')).toHaveLength(72);
    for (const d of docs) {
      expect(d.contentPlain.split(/\s+/).length).toBeGreaterThanOrEqual(150);
      expect(d.contentPlain).not.toMatch(/lorem ipsum|placeholder/i);
      expect(d.coverImageAlt).toBeTruthy();
      expect(d.tags.length).toBeGreaterThan(0);
      expect(d.author).toBeTruthy();
    }
  });
  it('T14 concurrent admin suspension never removes every active administrator', async () => {
    const { a, t, user } = await login('admin');
    const original = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    const role = await db.role.findUniqueOrThrow({ where: { key: 'SUPER_ADMIN' } });
    const name = `temp_admin_${Date.now().toString(36)}`;
    const temp = await db.user.create({
      data: {
        username: name,
        email: `${name}@demo.local`,
        displayName: 'Temporary administrator',
        passwordHash: original.passwordHash,
        roles: { create: { roleId: role.id } },
      },
    });
    const { a: second, t: st } = await login(name);
    try {
      const responses = await Promise.all([
        a
          .patch(`/api/v1/admin/users/${user.id}`)
          .set('X-CSRF-Token', t)
          .send({ status: 'SUSPENDED' }),
        second
          .patch(`/api/v1/admin/users/${temp.id}`)
          .set('X-CSRF-Token', st)
          .send({ status: 'SUSPENDED' }),
      ]);
      expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
      expect(
        await db.user.count({
          where: { status: 'ACTIVE', roles: { some: { role: { key: 'SUPER_ADMIN' } } } },
        }),
      ).toBe(1);
    } finally {
      await db.user.update({ where: { id: user.id }, data: { status: 'ACTIVE' } });
      await db.user.delete({ where: { id: temp.id } });
    }
  });
  it('T20 rejects byte-mismatched CSRF, cross-origin mutation and oversized images; enforces rate limits', async () => {
    const a = agent();
    await csrfToken(a);
    expect(
      (await a.post('/api/v1/auth/login').set('X-CSRF-Token', 'é'.repeat(64)).send({})).status,
    ).toBe(403);
    const { a: m, t } = await login('manager');
    expect(
      (
        await m
          .post('/api/v1/categories')
          .set('X-CSRF-Token', t)
          .set('Origin', 'https://untrusted.invalid')
          .send({ name: 'Attack' })
      ).status,
    ).toBe(403);
    expect(
      (
        await m
          .post('/api/v1/uploads/images')
          .set('X-CSRF-Token', t)
          .field('alt', 'Large image')
          .attach('image', Buffer.alloc(5 * 1024 * 1024 + 1), {
            filename: 'large.png',
            contentType: 'image/png',
          })
      ).status,
    ).toBe(413);
    const previous = env.NODE_ENV;
    env.NODE_ENV = 'development';
    const rate = limiter(2);
    env.NODE_ENV = previous;
    const app = express();
    app.use(rate);
    app.get('/', (_req, res) => res.json({ data: true }));
    expect((await request(app).get('/')).status).toBe(200);
    expect((await request(app).get('/')).status).toBe(200);
    expect((await request(app).get('/')).status).toBe(429);
    const category = await db.category.findFirstOrThrow();
    const doc = await db.document.findFirstOrThrow({ where: { categoryId: category.id } });
    const u = await db.user.findUniqueOrThrow({ where: { username: 'user' } });
    await expect(
      db.documentRating.upsert({
        where: { documentId_userId: { documentId: doc.id, userId: u.id } },
        create: { documentId: doc.id, userId: u.id, value: 0 },
        update: { value: 0 },
      }),
    ).rejects.toThrow();
    await expect(
      db.report.create({ data: { reporterId: u.id, reason: 'OTHER' } }),
    ).rejects.toThrow();
    const q = await a.get('/api/v1/search').query({ q: `no-match-${randomUUID()}%_` });
    expect(q.status).toBe(200);
    expect(q.body.meta.total).toBe(0);
  });
});
afterAll(async () => {
  await db.$disconnect();
  await sessionPool.end();
});
