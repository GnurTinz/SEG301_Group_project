# Requirement traceability

T01–T24 map the delivered Phase 1 behavior to implementation and executed tests. The original acceptance run was recorded on 2026-10-31 with real PostgreSQL 18 and Chromium; regression verification was recorded on 2026-11-12. PASS refers to the stated scenario within that environment. Test dates, counts, commands and verification limits are consolidated in the [test report](TEST_REPORT.md); the documentation cleanup did not rerun application tests.

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

Additional deployment/startup coverage:

| Scope | Implementation and evidence |
|---|---|
| T04/T20: production sessions and CSRF | `apps/api/tests/deployment.test.ts`: Secure cookie rotation/logout behind TLS termination, exact-origin CSRF, invalid environment settings, database URL compatibility and readiness responses |
| T16–T19: server event handling | API no-store responses and same-origin Vercel proxy preserve backend search/view logging |
| T23: Windows startup | `scripts/prepare-dev.mjs`, root/API predev and strict Vite port; `apps/api/tests/dev-startup.test.ts` verifies client engine preservation and occupied ports; live duplicate starts also checked |
| T23: source completeness | Upload route tracked in Git; runtime upload ignores anchored; API built successfully from isolated Git source export with existing dependencies linked |
| T23: hosting configuration | `vercel.json`, `render.yaml`, build/start scripts and [hosting guide](DEPLOYMENT.md); tests inspect the actual static rewrite destinations |
| T23: Linux dependency completeness | Root optional Oxide pin matches 4.3.3; isolated Linux-targeted npm install on Windows verified Oxide, Lightning CSS, esbuild and Rollup packages; local frontend build passed |

Docker engine, remote CI, hosted Vercel/Render acceptance and execution of Linux binaries were not verified by these local checks. Clean-install/fresh-database evidence dates to 2026-10-31; later configuration checks do not establish a new full fresh-install run.
