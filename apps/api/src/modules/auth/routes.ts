import { Router } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import type { Request } from 'express';
import { db } from '../../lib/db.js';
import { env } from '../../config/env.js';
import { fail } from '../../lib/http.js';
import { identity, limiter, requireAuth, token, visitor } from '../../middleware/security.js';
import { audit } from '../audit/service.js';
export const auth = Router();
const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((v) => v.toLowerCase());
const registerBody = z
  .object({
    email,
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_]{3,30}$/)
      .transform((v) => v.toLowerCase()),
    password: z.string().min(12).max(128),
    displayName: z.string().trim().min(1).max(80).optional(),
  })
  .strict();
async function establish(req: Request, userId: string) {
  await new Promise<void>((resolve, reject) =>
    req.session.regenerate((e) => (e ? reject(e) : resolve())),
  );
  req.session.userId = userId;
  req.session.csrfToken = token();
  visitor(req);
  await new Promise<void>((resolve, reject) =>
    req.session.save((e) => (e ? reject(e) : resolve())),
  );
  return identity(userId);
}
auth.get('/csrf', (req, res) => {
  req.session.csrfToken ??= token();
  visitor(req);
  res.json({ data: { csrfToken: req.session.csrfToken } });
});
auth.post('/register', limiter(10, 15 * 60000), async (req, res) => {
  const input = registerBody.parse(req.body);
  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  const role = await db.role.findUniqueOrThrow({ where: { key: 'USER' } });
  const user = await db.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        displayName: input.displayName ?? input.username,
        roles: { create: { roleId: role.id } },
      },
    });
    await audit(u.id, 'auth.register', 'user', u.id, {}, tx);
    return u;
  });
  res.status(201).json({ data: await establish(req, user.id) });
});
let dummyHash: string | undefined;
auth.post('/login', limiter(15, 15 * 60000), async (req, res) => {
  const input = z
    .object({ email, password: z.string().min(1).max(128) })
    .strict()
    .parse(req.body);
  const user = await db.user.findUnique({ where: { email: input.email } });
  dummyHash ??= await argon2.hash(token(), { type: argon2.argon2id });
  const valid = await argon2.verify(user?.passwordHash ?? dummyHash, input.password);
  if (!user || !valid || user.status !== 'ACTIVE') {
    await audit(undefined, 'auth.login_failed', 'user');
    fail(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng');
  }
  await audit(user!.id, 'auth.login', 'user', user!.id);
  res.json({ data: await establish(req, user!.id) });
});
auth.post('/logout', requireAuth, async (req, res) => {
  await audit(req.identity!.id, 'auth.logout', 'user', req.identity!.id);
  await new Promise<void>((resolve, reject) =>
    req.session.destroy((e) => (e ? reject(e) : resolve())),
  );
  res.clearCookie('portal.sid', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  });
  res.json({ data: { success: true } });
});
auth.get('/me', requireAuth, (req, res) => res.json({ data: req.identity }));
