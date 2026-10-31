import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { db, sessionPool } from '../lib/db.js';
import { env } from '../config/env.js';
import { fail } from '../lib/http.js';

export interface Identity {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  status: string;
  roles: string[];
  permissions: string[];
}
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    csrfToken?: string;
    visitorId?: string;
  }
}
declare module 'express-serve-static-core' {
  interface Request {
    identity?: Identity;
  }
}
const Store = pgSession(session);
export const sessionStore = new Store({
  pool: sessionPool,
  tableName: 'sessions',
  createTableIfMissing: false,
  pruneSessionInterval: env.NODE_ENV === 'test' ? false : 900,
});
export const sessionMiddleware = session({
  name: 'portal.sid',
  secret: env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 12,
  },
});
export const token = () => randomBytes(32).toString('hex');
export function visitor(req: Request) {
  return (req.session.visitorId ??= token());
}
export async function identity(userId: string): Promise<Identity | undefined> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
    },
  });
  if (!user || user.status !== 'ACTIVE') return undefined;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    status: user.status,
    roles: user.roles.map((r) => r.role.key),
    permissions: [
      ...new Set(user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.key))),
    ],
  };
}
export async function loadIdentity(req: Request, _res: Response, next: NextFunction) {
  if (req.session.userId) req.identity = await identity(req.session.userId);
  next();
}
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.identity) fail(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập');
  next();
}
export const requirePermission =
  (key: string) => (req: Request, _res: Response, next: NextFunction) => {
    if (!req.identity) fail(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập');
    if (!req.identity!.permissions.includes(key))
      fail(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện thao tác');
    next();
  };
export function csrf(req: Request, _res: Response, next: NextFunction) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const expected = req.session.csrfToken;
    const supplied = req.get('X-CSRF-Token');
    if (req.get('Origin') && req.get('Origin') !== env.WEB_ORIGIN)
      fail(403, 'CSRF_ORIGIN', 'Nguồn yêu cầu không hợp lệ');
    if (
      !expected ||
      !supplied ||
      Buffer.byteLength(expected) !== Buffer.byteLength(supplied) ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
    )
      fail(403, 'CSRF_INVALID', 'Phiên bảo mật không hợp lệ, vui lòng tải lại');
  }
  next();
}
export const limiter = (max: number, windowMs = 60000) =>
  rateLimit({
    windowMs,
    limit: env.NODE_ENV === 'test' ? 10000 : max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) =>
      res
        .status(429)
        .json({
          error: { code: 'RATE_LIMITED', message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
        }),
  });
