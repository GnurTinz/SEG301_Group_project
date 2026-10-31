import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { csrf, limiter, loadIdentity, sessionMiddleware } from './middleware/security.js';
import { auth } from './modules/auth/routes.js';
import { users } from './modules/users/routes.js';
import { errorHandler } from './lib/http.js';
import { documents, adminDocuments } from './modules/documents/routes.js';
import { categories } from './modules/categories/routes.js';
import { tags } from './modules/tags/routes.js';
import { uploads } from './modules/uploads/routes.js';
import { search } from './modules/search/routes.js';
import { comments, documentComments } from './modules/comments/routes.js';
import { engagement } from './modules/engagement/routes.js';
import { reports } from './modules/reports/routes.js';
import { moderation } from './modules/moderation/routes.js';
import { seo } from './modules/seo/routes.js';
import { analytics } from './modules/analytics/routes.js';
import { roles } from './modules/roles/routes.js';
import { adminUsers } from './modules/users/admin.js';
import { auditRoutes } from './modules/audit/routes.js';
import { settings } from './modules/settings/routes.js';
import { db } from './lib/db.js';
export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(
  '/uploads',
  express.static(env.UPLOAD_DIR, {
    dotfiles: 'deny',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'");
    },
  }),
);
app.get('/health', (_req, res) => res.json({ data: { status: 'ok' } }));
app.use('/api/v1', limiter(300), sessionMiddleware, loadIdentity, csrf);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.get('/api/v1/public/settings', async (_req, res) =>
  res.json({
    data: Object.fromEntries(
      (await db.setting.findMany({ where: { key: { in: ['siteName', 'commentsEnabled'] } } })).map(
        (s) => [s.key, s.valueJson],
      ),
    ),
  }),
);
app.use('/api/v1/documents/:id/comments', documentComments);
app.use('/api/v1/documents/:id', engagement);
app.use('/api/v1/documents', documents);
app.use('/api/v1/comments', comments);
app.use('/api/v1/reports', reports);
app.use('/api/v1/moderation', moderation);
app.use('/api/v1/seo', seo);
app.use('/api/v1/analytics', analytics);
app.use('/api/v1/admin', roles, adminUsers, auditRoutes, settings);
app.use('/api/v1/admin/documents', adminDocuments);
app.use('/api/v1/categories', categories);
app.use('/api/v1/tags', tags);
app.use('/api/v1/uploads', uploads);
app.use('/api/v1/search', search);
app.use((_req, res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy đường dẫn' } }),
);
app.use(errorHandler);
