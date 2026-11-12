# SEG301 Final Project — Phase 1 Final Verification Report

Verification Date: 2026-11-13
Author: Senior Full-Stack / QA / DevOps Engineer
Project: **Điểm Mới — News & Digital Magazine Portal**
Repository: `SEG301_Group_project`

---

## 1. Environment & Setup

- **Operating System**: Windows 11 Pro (x86_64)
- **Conda Environment**: `seg301-project` (`D:\MiniConda\envs\seg301-project`)
- **Runtime**: Node.js `24.22.1`, npm `11.19.1`
- **Database**: PostgreSQL 18 (local embedded instance at `127.0.0.1:55432`)
- **Prisma**: `6.19.3`
- **Test Frameworks**: Vitest `5.0.5`, Supertest `7.1.4`, Playwright Chromium `1.56.0`

---

## 2. Executed Test Commands & Verification Results

All tests were executed directly in the `seg301-project` Conda environment against live databases:

| Phase / Tool | Command | Result | Details |
|---|---|---|---|
| **Code Quality (Lint)** | `npm.cmd run lint` | **PASS (0 errors, 0 warnings)** | ESLint across root, `apps/api`, `apps/web`, `packages/shared`, `scripts`, `tests` |
| **Type Integrity** | `npm.cmd run typecheck` | **PASS (0 errors)** | TypeScript `tsc --noEmit` on `@portal/api`, `@portal/web`, and `tsconfig.tests.json` |
| **Seed Integrity** | `npm.cmd run db:validate-seed` | **PASS** | 80 original articles, 72 published, 4 categories, 12 tags, min 183 words, 0 placeholders |
| **API & Integration Tests** | `npm.cmd test` | **PASS (10/10 files, 24/24 tests)** | Executed via Vitest on isolated `portal_test` PostgreSQL database (16.26s) |
| **Full Build** | `npm.cmd run build` | **PASS** | Builds `@portal/api` (tsc) and `@portal/web` (Vite client bundle, 142.15 kB gzip) |
| **E2E Browser Tests** | `npm.cmd run test:e2e` | **PASS (7/7 workflows passed)** | Playwright Chromium (20.0s), including responsive mobile 390px viewport |

---

## 3. Requirement-to-Test Traceability Matrix

This table maps the functional and non-functional assignment requirements to automated test suites and exact source implementations.

| Requirement Area | Assignment Requirement | Source Implementation | Executed Automated Test Evidence | Status |
|---|---|---|---|---|
| **A. Client / UI** | Paginated listing with summaries | `apps/web/src/pages/Public.tsx`, `apps/api/src/modules/documents/routes.ts` | `search.test.ts` (T01 pagination & desc ordering), `portal.spec.ts` (10 items/page, next page navigation) | **PASS** |
| | Article detail view (author, date, views, tags, cover) | `apps/web/src/pages/Public.tsx` (`ArticlePage`), `documents/routes.ts` | `content.test.ts` (detail metadata & sanitized HTML), `portal.spec.ts` (article header & body) | **PASS** |
| | User registration, login, logout, profile | `apps/api/src/modules/auth/routes.ts`, `apps/web/src/pages/Account.tsx` | `auth.test.ts` (duplicate email 409, logout, profile patch), `auth.spec.ts` (end-to-end browser auth) | **PASS** |
| | Comment creation, reading, editing, deletion | `apps/api/src/modules/comments/routes.ts`, `apps/web/src/components/Engagement.tsx` | `engagement.test.ts` (owner enforcement 403, owner edit 200, moderator delete 200) | **PASS** |
| | Comment replies & user `@username` mentions | `apps/api/src/modules/comments/routes.ts`, `schema.prisma` (`CommentMention`) | `engagement.test.ts` (mentions extraction & verification, reply `parentId`), `portal.spec.ts` | **PASS** |
| | Article liking & 1–5 rating | `apps/api/src/modules/engagement/routes.ts`, SQL CHECK constraints | `engagement.test.ts` (idempotent like, rating bounds 1–5, average score calculation) | **PASS** |
| | Keyword search (PostgreSQL ILIKE) | `apps/api/src/modules/search/routes.ts` | `search.test.ts` (case-insensitive keyword matching, wildcard escaping, SQL injection rejection) | **PASS** |
| | Filters for category, tag, date range | `apps/api/src/modules/documents/service.ts`, `apps/web/src/pages/Public.tsx` | `search.test.ts` (combined filters and date bounds), `portal.spec.ts` (filtered search workflow) | **PASS** |
| | Responsive mobile design | `apps/web/src/styles.css` (Tailwind & media queries) | `portal.spec.ts` (390px viewport test asserts `scrollWidth <= innerWidth` with 0 overflow) | **PASS** |
| **B. RBAC & Admin** | Super Admin: user status, roles, permissions, audit logs, settings | `users/admin.ts`, `roles/routes.ts`, `audit/routes.ts`, `settings/routes.ts` | `admin.test.ts` (last admin protection 409, core permission guard 409, audit filter, settings whitelist) | **PASS** |
| | Content Manager: article CRUD, publish/unpublish, taxonomy, uploads | `documents/routes.ts`, `categories/routes.ts`, `tags/routes.ts`, `uploads/routes.ts` | `content.test.ts` (lifecycle DRAFT -> PUBLISHED -> UNPUBLISHED -> deleted), `portal.spec.ts` | **PASS** |
| | Moderator: comment moderation, spam handling, report review | `moderation/routes.ts`, `reports/routes.ts`, `Moderation.tsx` | `engagement.test.ts` (comment status VISIBLE/HIDDEN/SPAM, report triage with slug), `portal.spec.ts` | **PASS** |
| | Data & SEO Specialist: SEO metadata whitelist & real analytics | `seo/routes.ts`, `analytics/routes.ts`, `SeoAnalytics.tsx`, `Public.tsx` | `seo-analytics.test.ts` (strict whitelist, views/searches/clicks/CTR/trends), `portal.spec.ts` (meta tags verified) | **PASS** |
| | Regular User: engagement permitted, admin routes forbidden | `middleware/security.ts` (`requirePermission`) | `admin.test.ts` (USER receives 403 on all `/admin/*` operations), `portal.spec.ts` (admin UI hidden) | **PASS** |
| **C. Database & Phase 2** | Documents table (id, title, HTML/plain content, summary, category, tags, author, created_at, views) | `schema.prisma` (`Document`, `DocumentTag`), `documents/service.ts` | `content.test.ts`, `validate-seed.ts` (all required fields verified) | **PASS** |
| | Search & Click interaction logs (user_id, query_string, clicked_doc_id, timestamp, linkage) | `schema.prisma` (`SearchClickLog`), `search/routes.ts` | `search.test.ts` (SEARCH row recorded on search, CLICK row recorded on result click, no click on direct view) | **PASS** |
| | Seed data (50–100 realistic text records, no Lorem Ipsum) | `apps/api/prisma/content/*.ts`, `seed.ts` | `validate-seed.ts` (80 articles, 72 published, 0 Lorem Ipsum, idempotent execution tested) | **PASS** |

---

## 4. Key Fixes Implemented

1. **SEO Meta Keywords Tag (`apps/web/src/pages/Public.tsx`)**:
   - Injected `<meta name="keywords" content={d.seoKeywords} />` dynamically when an article has `seoKeywords` defined.
   - Cleaned up the meta tag on component unmount or navigation to prevent metadata pollution.
   - Verified via Playwright E2E browser assertion in `portal.spec.ts`.

2. **Moderation Reports Enrichment (`apps/api/src/modules/moderation/routes.ts` & `apps/web/src/pages/Moderation.tsx`)**:
   - Expanded `db.report.findMany` inclusion to select `document.slug` and `comment.document.slug`, `comment.id`, and `comment.status`.
   - Updated the Moderation UI to display direct links to reported articles and provide quick inline comment hide/restore controls directly from the report triage view.
   - Added test assertion in `apps/api/tests/engagement.test.ts`.

3. **Secure Cookie Parity on Logout (`apps/api/src/modules/auth/routes.ts`)**:
   - Updated `res.clearCookie('portal.sid')` to pass `secure: env.NODE_ENV === 'production'`.
   - Ensures exact parity with `sessionMiddleware` cookie security attributes so modern browsers accept cookie clearing behind HTTPS TLS termination.
   - Verified via `apps/api/tests/deployment.test.ts`.

4. **Resilient Client API Error Parsing (`apps/web/src/api/client.ts`)**:
   - Replaced unconditional `response.json()` with safe text parsing.
   - Prevents unhandled JSON parsing syntax errors when proxies or cloud hosts return HTML or plain-text 502/503 error responses.

---

## 5. Production Readiness & Hosting Analysis

- **Vercel Frontend Configuration (`vercel.json`)**:
  - Rewrites `/api/:path*`, `/uploads/:path*`, and `/health/:path*` to `https://seg301-group-project.onrender.com`.
  - Disables edge rewrite caching (`x-vercel-enable-rewrite-caching: 0`) and sets `Cache-Control: no-store` to prevent session and logging leaks.
  - SPA routing fallback `/index.html` excludes API, upload, health, asset, and cover paths.
- **Render Backend Configuration (`render.yaml`)**:
  - Configures `plan: free` web service with Node 24, `HOST=0.0.0.0`, `TRUST_PROXY=1`, and `/health/ready` database connectivity probe.
  - Startup command runs migrations, idempotent seed, and production API server.
- **Hosted Login & CSRF Blocker Resolution**:
  - Render Express checks `req.get('Origin') === env.WEB_ORIGIN`.
  - In `render.yaml`, `WEB_ORIGIN` has `sync: false`.
  - **Required Action for Hosted Deployment**: The operator must navigate to the Render service dashboard and set the environment variable:
    ```text
    WEB_ORIGIN=https://<your-vercel-domain>.vercel.app
    ```
    (Exact HTTPS protocol, no path, and no trailing slash). Without this matching setting, browser mutations correctly fail with `403 CSRF_ORIGIN`.
- **Image Persistence on Free Hosting**:
  - Render's free tier provides an ephemeral filesystem; images written to `UPLOAD_DIR` do not persist across redeployments or container restarts.
  - Production deployments requiring persistent user uploads should attach a persistent disk or migrate to an S3-compatible cloud storage adapter (as noted in Phase 2 roadmap).

---

## 6. How to Run Locally

```powershell
# 1. Activate Conda environment
conda activate seg301-project

# 2. Start PostgreSQL (keep this terminal open)
npm.cmd run db:local

# 3. In a second terminal: generate client, migrate, and seed
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed

# 4. Start full development stack (API on 3001, Frontend on 5173)
npm.cmd run dev
```

Visit `http://localhost:5173`. Demo accounts (`admin@demo.local`, `manager@demo.local`, `moderator@demo.local`, `seo@demo.local`, `user@demo.local`) authenticate using the `DEMO_PASSWORD` generated in `.env`.
