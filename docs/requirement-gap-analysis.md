# Phase 1 Requirement Gap Analysis

Audit and Verification Date: 2026-11-13
Repository: `SEG301_Group_project` (Điểm Mới — News & Digital Magazine Portal)
Environment: Windows 11, Conda `seg301-project` (Node.js 24.22.1, npm 11.19.1), PostgreSQL 18 on 127.0.0.1:55432

---

## Executive Summary

An exhaustive audit of the repository against all Phase 1 assignment requirements was performed across architecture, schema, security middleware, API modules, React frontend pages, and end-to-end tests.

All core Phase 1 requirements were already implemented in the repository architecture. During this deep audit, 4 specific implementation gaps/improvements were identified and resolved:
1. **SEO Meta Keywords**: Added automatic injection of `<meta name="keywords">` in `ArticlePage` from `d.seoKeywords`, matching the SEO Specialist's ability to curate metadata.
2. **Moderation Report Context**: Enriched `GET /api/v1/moderation/reports` with document/comment slugs, IDs, and comment status, and updated `Moderation.tsx` with direct article inspection links and inline comment hiding/restoring controls.
3. **Session Cookie Security Parity on Logout**: Added `secure: env.NODE_ENV === 'production'` to `res.clearCookie('portal.sid')` in `apps/api/src/modules/auth/routes.ts` so cookie clearance strictly matches production HTTPS `Secure; SameSite=Lax` cookie jar attributes.
4. **Client API Robustness**: Replaced bare `response.json()` in `apps/web/src/api/client.ts` with safe JSON parsing that handles HTML/plain-text gateway or proxy error responses gracefully.

All 4 confirmed gaps were fixed and verified with updated unit, integration, and E2E Playwright tests.

---

## Detailed Requirement Matrix

Classification legend:
- **PASS**: Implemented, verified with code inspection, unit/integration, and browser E2E tests.
- **BLOCKED**: Requires live third-party hosting dashboard access or paid infrastructure credentials.

### A. Frontend and User Features

| Requirement ID | Description | Status | Source Paths | Verification Evidence |
|---|---|---|---|---|
| **REQ-A1** | Responsive homepage with paginated article listings and summary snippets | **PASS** | `apps/web/src/pages/Public.tsx`, `apps/web/src/components/Pagination.tsx`, `apps/api/src/modules/documents/routes.ts` | Vitest `content.test.ts`, Playwright `portal.spec.ts` (10 items/page, 390px mobile viewport test without overflow) |
| **REQ-A2** | Article detail pages with full content, images, author, date, views, category, tags | **PASS** | `apps/web/src/pages/Public.tsx` (`ArticlePage`), `apps/api/src/modules/documents/routes.ts` (`GET /documents/:slug`) | Vitest `content.test.ts`, Playwright `portal.spec.ts` (renders HTML content, byline, tags, cover image) |
| **REQ-A3** | User registration, login, logout, and profile management | **PASS** | `apps/api/src/modules/auth/routes.ts`, `apps/api/src/modules/users/routes.ts`, `apps/web/src/pages/Account.tsx` | Vitest `auth.test.ts` (duplicate email 409, profile patch, session invalidate), `deployment.test.ts` (Secure cookie rotation & logout), Playwright `auth.spec.ts` |
| **REQ-A4** | Comment CRUD with strict ownership enforcement | **PASS** | `apps/api/src/modules/comments/routes.ts`, `apps/web/src/components/Engagement.tsx` | Vitest `engagement.test.ts` (non-owner 403, owner 200, moderator delete 200), Playwright `portal.spec.ts` |
| **REQ-A5** | Comment replies (threading) and user `@username` mentions | **PASS** | `apps/api/src/modules/comments/routes.ts`, `apps/api/prisma/schema.prisma` (`CommentMention`), `apps/web/src/components/Engagement.tsx` | Vitest `engagement.test.ts` (verified mentions parsed, non-existent ignored, replies saved with `parentId`), Playwright `portal.spec.ts` |
| **REQ-A6** | Article liking and 1–5 rating | **PASS** | `apps/api/src/modules/engagement/routes.ts`, `apps/api/prisma/migrations/202610310002_constraints/migration.sql`, `apps/web/src/components/Engagement.tsx` | Vitest `engagement.test.ts` (idempotent like, ratings outside 1–5 rejected by DB & Zod, average rating aggregation), Playwright `portal.spec.ts` |
| **REQ-A7** | Keyword search using standard SQL LIKE/ILIKE with wildcard escaping | **PASS** | `apps/api/src/modules/search/routes.ts` (PostgreSQL `ILIKE` across `title`, `summary`, `contentPlain`) | Vitest `search.test.ts` (SQL injection & wildcard tests, draft exclusion), Playwright `portal.spec.ts` |
| **REQ-A8** | Filtering by category, tag, and date range | **PASS** | `apps/api/src/modules/documents/service.ts`, `apps/web/src/pages/Public.tsx` | Vitest `search.test.ts` (combined category + tag + date range filter count), Playwright `portal.spec.ts` |
| **REQ-A9** | Loading, empty, error, and unauthorized states | **PASS** | `apps/web/src/components/Feedback.tsx`, `apps/web/src/layouts/Admin.tsx`, `apps/web/src/api/client.ts` | Safe non-JSON error handling in `client.ts`, `PermissionGate` renders alert, empty search/queue feedback |

---

### B. Administration and Role-Based Access Control (RBAC)

| Role | Responsibilities | Status | Source Paths | Verification Evidence |
|---|---|---|---|---|
| **Super Admin** | Manage users, account status (`ACTIVE`/`SUSPENDED`), role assignments, permissions, audit logs, global settings, concurrency protection | **PASS** | `apps/api/src/modules/users/admin.ts`, `apps/api/src/modules/roles/routes.ts`, `apps/api/src/modules/roles/service.ts`, `apps/api/src/modules/audit/routes.ts`, `apps/api/src/modules/settings/routes.ts`, `apps/web/src/pages/SuperAdmin.tsx` | Vitest `admin.test.ts` (409 on removing last admin, 409 on removing core permissions, immediate permission updates, session suspension), `seed-security.test.ts`, Playwright `portal.spec.ts` |
| **Content Manager** | Full article CRUD, publish/unpublish status, taxonomy (categories & tags), image uploads with magic-byte check | **PASS** | `apps/api/src/modules/documents/routes.ts`, `apps/api/src/modules/categories/routes.ts`, `apps/api/src/modules/tags/routes.ts`, `apps/api/src/modules/uploads/routes.ts`, `apps/web/src/pages/ContentAdmin.tsx` | Vitest `content.test.ts` (draft 404 for guests, published 200, unpublished 404, in-use category 409), `seed-security.test.ts` (spoofed SVG/MIME rejected, alt required), Playwright `portal.spec.ts` |
| **Moderator** | Review reported comments and content, hide/restore/moderate comments, spam and report triage | **PASS** | `apps/api/src/modules/moderation/routes.ts`, `apps/api/src/modules/reports/routes.ts`, `apps/web/src/pages/Moderation.tsx` | Vitest `engagement.test.ts` (report triage with article slug, comment status updates, audit logging), Playwright `portal.spec.ts` |
| **Data & SEO Specialist** | Permitted SEO metadata (`seoTitle`, `seoDescription`, `seoKeywords`, `coverImageAlt`) and analytics dashboard | **PASS** | `apps/api/src/modules/seo/routes.ts`, `apps/api/src/modules/analytics/routes.ts`, `apps/web/src/pages/SeoAnalytics.tsx`, `apps/web/src/pages/Public.tsx` | Vitest `seo-analytics.test.ts` (strict whitelist enforcement, 422 on content edit, real-time analytics aggregation), Playwright `portal.spec.ts` (browser SEO save + `<meta name="keywords">` verification) |
| **Regular User** | Profile management, engagement, report creation, unauthorized admin access blocked | **PASS** | `apps/api/src/middleware/security.ts`, `packages/shared/src/index.ts` | Vitest `auth.test.ts`, `admin.test.ts` (all admin routes return 403 for `USER`), Playwright `portal.spec.ts` (navigation bar hides admin routes) |

---

### C. Database and Phase 2 Preparation

| Item | Requirement | Status | Source Paths | Verification Evidence |
|---|---|---|---|---|
| **Document Store** | `id`, `title`, HTML `content`, `content_plain`, `summary`, `category_id`, tags, `author`, timestamps, `views_count` | **PASS** | `apps/api/prisma/schema.prisma` (`Document`), `apps/api/src/modules/documents/service.ts` | Schema inspection, `validate-seed.ts`, `content.test.ts` |
| **Search & Click Logs** | `user_id`/session, `query_string`, `clicked_doc_id`, `timestamp`, `search_id` linkage, filters context; no click log on direct view | **PASS** | `apps/api/prisma/schema.prisma` (`SearchClickLog`, `DocumentView`), `apps/api/src/modules/search/routes.ts`, `apps/api/src/modules/documents/routes.ts` | Vitest `search.test.ts` (zero results logged, real click linked with position, forged click 422, foreign click 404, direct view does not log click), `seo-analytics.test.ts` |
| **Seed Data** | At least 50–100 realistic text records, no Lorem Ipsum, idempotent seed | **PASS** | `apps/api/prisma/content/*.ts`, `apps/api/prisma/seed.ts`, `apps/api/prisma/validate-seed.ts` | `npm run db:validate-seed`: 80 distinct original articles (72 published, 8 draft/unpublished), 4 categories, 12 tags, min 183 words, 0 placeholders. Running seed repeatedly preserves exact counts without duplication. |

---

### D. Production Deployment & Hosted Login Analysis

| Target | Configuration | Status | Technical Details |
|---|---|---|---|
| **Vercel** (Frontend) | `vercel.json` | **PASS** (Config) / **BLOCKED** (Live deployment verification) | Static rewrites proxy `/api/*`, `/uploads/*`, `/health/*` directly to `https://seg301-group-project.onrender.com`. Headers include `Cache-Control: no-store` and `x-vercel-enable-rewrite-caching: 0`. Monorepo build uses `apps/web/dist`. Live verification requires Vercel project access. |
| **Render** (API) | `render.yaml` | **PASS** (Config) / **BLOCKED** (Live deployment verification) | Blueprint defines web service with `NODE_VERSION=24`, `NODE_ENV=production`, `HOST=0.0.0.0`, `TRUST_PROXY=1`, health check at `/health/ready`. Startup runs `npm run start:render` (`db:migrate` + `db:seed` + `start`). |
| **Hosted Login & Origin** | `WEB_ORIGIN`, CORS, CSRF, Secure cookies | **PASS** (Code & integration test) / **BLOCKED** (Render environment variables) | Tested in `apps/api/tests/deployment.test.ts`: under TLS termination with `TRUST_PROXY=1`, Express issues `portal.sid` with `HttpOnly; Secure; SameSite=Lax`. When hosted, Render Express checks `req.get('Origin') === env.WEB_ORIGIN`. Because `WEB_ORIGIN` is un-synced in `render.yaml`, the operator **must set `WEB_ORIGIN=https://<actual-vercel-domain>.vercel.app` (without trailing slash)** in the Render dashboard for login mutations to succeed. |
| **Image Persistence** | `UPLOAD_DIR` | **PASS** (Validation & local storage) / **BLOCKED** (Durable hosting disk) | Render free web service filesystem is ephemeral; uploaded images are lost upon service sleep/restart unless a persistent Render disk or S3-compatible object storage is attached. |
