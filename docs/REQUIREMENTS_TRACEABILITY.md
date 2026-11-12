# Requirement traceability

Verified locally on 2026-10-31 with real PostgreSQL 18, HTTP API tests and Chromium browser tests. PASS describes the stated acceptance scenario, not a claim of exhaustive security or production certification. Command evidence and milestone reports: TEST_REPORT.md.

Deployment regression on 2026-11-12: all 22 API tests and 7 Chromium flows passed, including five new production configuration/session/readiness/routing checks. Existing T01–T24 coverage remains in the suites; this run did not repeat the original empty-database/clean-install acceptance procedure.

Local-startup fix on 2026-11-12: T23 now includes automatic Prisma Client generation via `apps/api/package.json` → `predev`, reached by both root and API-workspace development commands. An actual uninitialized client was repaired; `npm.cmd run dev` then generated the client automatically and started the API. HTTP checks through Vite and a Chromium homepage smoke passed (10 real article cards), as did all 22 API tests, lint, typecheck and build. No database reset or new clean-install claim.

Follow-up T23 Windows regression: unconditional generation was replaced by `scripts/prepare-dev.mjs` in root/API `predev`; current generated clients are reused, occupied API/web ports are rejected before generation, and Vite stays on strict port 5173. `apps/api/tests/dev-startup.test.ts` checks real engine-file preservation and occupied API ports. Running duplicate root/API/web commands against an active API was exercised successfully: clear port errors, no EPERM, unchanged engine file, original app still healthy. Current command counts are in TEST_REPORT.md.

Render source-completeness correction: the old unanchored `uploads/` ignore omitted `apps/api/src/modules/uploads/routes.ts` from Git despite local tests passing. The module is now tracked; ignore rules and the staged scanner target runtime upload directories only. T23 was strengthened by exporting all staged Git files to an isolated source directory and successfully running `npm.cmd run build:api` there with existing dependencies linked. This verifies repository source completeness, not a new clean dependency install or a hosted Linux deployment.

API paths below use `/api/v1`. Source module paths are relative to `apps/api/src/modules/`; browser pages are under `apps/web/src/`.

| ID | Requirement and exact implementation | Executed evidence | Status |
|---|---|---|---|
| T01 | `documents/routes.ts` GET /documents; `pages/Public.tsx`, `components/Pagination.tsx` | `content.test.ts`, `search.test.ts`: 10 then 2 disjoint fixture results, descending publication; `portal.spec.ts` mobile page 2 | PASS |
| T02 | `documents/service.ts` publicWhere; GET /documents/:slug and /search exclude drafts/deletes | `content.test.ts`, `search.test.ts`: draft/unpublished 404 | PASS |
| T03 | `auth/routes.ts` POST /auth/register; unique users.email | `auth.test.ts`: duplicate 409, no duplicate identity | PASS |
| T04 | `auth/routes.ts` POST /auth/logout; PostgreSQL sessions | `auth.test.ts`: subsequent /auth/me 401; `auth.spec.ts` browser logout/login | PASS |
| T05 | `middleware/security.ts` requirePermission; POST /documents | `content.test.ts`: signed-in USER 403, guest 401 | PASS |
| T06 | `documents/routes.ts` CRUD/status; `pages/ContentAdmin.tsx` | `content.test.ts` lifecycle; `portal.spec.ts` manager creates/edits/publishes/unpublishes/deletes and guest checks | PASS |
| T07 | `categories/routes.ts`, `tags/routes.ts`; `pages/ContentAdmin.tsx` taxonomy/editor | `content.test.ts`: create/update/delete, attach/filter, referenced-category 409 | PASS |
| T08 | `comments/routes.ts` owner-only PATCH /comments/:id | `engagement.test.ts`: other user 403, owner 200; browser own edit | PASS |
| T09 | `comments/routes.ts` mentions(), bodySchema; comment_mentions | `engagement.test.ts`: only existing @username stored, script removed | PASS |
| T10 | `engagement/routes.ts`; unique joins and SQL rating CHECK | `engagement.test.ts`: repeated like unique, ratings 0/6/1.5 rejected; `seed-security.test.ts` direct DB bound rejection | PASS |
| T11 | `reports/routes.ts`, `moderation/routes.ts`, `audit/service.ts`; `pages/Moderation.tsx` | `engagement.test.ts` report/hide/restore/resolve/audit; `portal.spec.ts` browser report and moderation | PASS |
| T12 | `seo/routes.ts` strict whitelist; `pages/SeoAnalytics.tsx`, `pages/Public.tsx` metadata/alt | `seo-analytics.test.ts`: SEO succeeds, body 403/422 unchanged; browser metadata save | PASS |
| T13 | `roles/routes.ts` requirePermission; admin user/role APIs | `admin.test.ts`: Moderator, SEO, USER administrative calls 403 | PASS |
| T14 | `roles/service.ts` advisory lock, protectLastAdmin; core permission guard | `admin.test.ts`: last role/status/core removal 409; `seed-security.test.ts`: concurrent suspensions yield 200/409, one active admin remains | PASS |
| T15 | `search/routes.ts` Prisma contains insensitive → PostgreSQL ILIKE; document filters | `search.test.ts`: keyword/category/tag/date count, pagination/privacy; browser filtered search | PASS |
| T16 | `search/routes.ts` SEARCH row even total=0 | `search.test.ts`: zero-result row, null clicked_doc_id | PASS |
| T17 | POST /search/clicks validates owner/result/position and copies stored query | `search.test.ts`, `seo-analytics.test.ts`: linked click, UTC time, signed-in/guest; browser actual click 201 | PASS |
| T18 | Only search result navigation calls /search/clicks | `search.test.ts`: direct detail leaves CLICK count unchanged | PASS |
| T19 | `documents/routes.ts` unique browser/document/30-minute bucket and atomic counter | `content.test.ts`: repeated detail one event/count; analytics activity increases once | PASS |
| T20 | `documents/service.ts`, `uploads/routes.ts`, CSRF/error/rate middleware; SQL CHECKs | content/search/seed-security tests: sanitized HTML, SQLi, spoofed MIME/SVG/oversize, cross-origin and multibyte CSRF rejection, 429 | PASS |
| T21 | `apps/api/prisma/content/*.ts`, `seed-content.ts`, `validate-seed.ts` | seed twice + validator: 80 distinct, 72 published, 4 categories, 12 tags, min 183 words; `seed-security.test.ts` counts stable | PASS |
| T22 | `pages/Public.tsx`, `layouts/Admin.tsx`, responsive styles, permission gates | `portal.spec.ts`: 390px no overflow, paging, moderator navigation restrictions; all role workflows exercised | PASS |
| T23 | real SQL migrations, workspace scripts, Docker Compose, CI, README | clean isolated `npm ci`; fresh DB migrate/seed twice/validate; 17 API + 7 E2E + 17 API; lint/typecheck/build; actual dev HTTP/browser smoke | PASS locally |
| T24 | `audit/routes.ts`, `settings/routes.ts`, `users/admin.ts`, `pages/SuperAdmin.tsx` | `admin.test.ts`: audit filter/settings whitelist and USER 403; browser roles/logs/settings | PASS |

Deployment mapping: T04/T20 → `apps/api/tests/deployment.test.ts` exercises Secure cookie rotation/login/logout and exact-origin CSRF behind TLS termination; T16–T19 → API no-store headers preserve server-side event handling; T23 → `vercel.ts`, `render.yaml`, root build/start scripts and `docs/DEPLOYMENT.md`. Independent web/API builds and the compiled production server were executed locally. Hosted provider deployment remains unverified until account environment variables/database are configured.

Environment limits: Docker engine unavailable (local real PostgreSQL used); GitHub Actions is configured but was not remotely executed during the baseline verification. M0's requested commit gate is closed by the final verified local implementation snapshot. GitHub delivery is tracked separately from runtime deployment.
