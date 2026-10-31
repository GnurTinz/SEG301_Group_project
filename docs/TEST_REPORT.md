# Test report

## M0 — Repository audit and contracts

- Status: PASS for audit/design; the requested commit gate is closed by the final local implementation snapshot after verification.
- Implemented: full plan read, clean-repository audit, architecture/ERD, decision log, acceptance checklist.
- Changed files: docs/AUDIT.md, docs/ARCHITECTURE.md, docs/DECISIONS.md, docs/REQUIREMENTS_TRACEABILITY.md, docs/TEST_REPORT.md.
- Verification: `git status --short` found only the two supplied documents; `git log -5 --oneline` confirmed no commits; Node v24.18.0 and npm.cmd 11.16.0 available; Docker engine unavailable.
- Acceptance: T01–T24 not run, no application exists yet.
- Known issues at initial gate: commit deferred until final source verification; Docker engine absent. The two input documents were preserved.
- Next milestone: M1 scaffold and infrastructure.

## M1 — Scaffold and infrastructure

- Status: PASS using local PostgreSQL; Docker-specific gate unavailable.
- Implemented: npm workspaces, React/Vite, Express/TypeScript, env validation, ESLint/Prettier, PostgreSQL Compose, CI and health route/test, operational scripts.
- Changed files: package.json/package-lock.json, apps/* scaffold/config, scripts/local-postgres.mjs, .env.example, docker-compose.yml, eslint.config.js, .github/workflows/ci.yml, README.md, docs/API.md.
- Verification: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build` passed; `npm.cmd test` passed 1/1 health test. Local PostgreSQL initialized successfully; first real migrations applied at M2 entry.
- Acceptance: health 200 via Supertest; T23 scaffold portion verified, full installation/browser verification pending.
- Known issues: Docker engine absent; Windows restricted token prevents os.userInfo in tsx/local PostgreSQL (run approved commands outside that token). Initial dependency audit reported 19 vulnerabilities; remediation pending before final gate.
- Next: M2 schema, seed and authentication.

## M2 — Schema, seed and authentication

- Status: PASS.
- Implemented: full Prisma schema, two real SQL migrations (including CHECK/partial unique constraints), idempotent five-role demo seed, Argon2id, PostgreSQL cookie sessions, CSRF/session rotation, live RBAC, auth/profile API and React forms.
- Changed files: apps/api/prisma/*, apps/api/src/{lib,middleware,modules/auth,modules/users,modules/audit}, packages/shared/src/index.ts, apps/web/src/{api,hooks,pages/Account.tsx}, scripts/run-tests.mjs, scripts/run-e2e.mjs, tests/e2e/auth.spec.ts.
- Verification: migrate succeeded on empty portal and portal_test databases; seed executed twice; lint/typecheck passed after correcting module augmentation and upgrading Zod/resolver; 4/4 API tests passed. `npm.cmd run test:e2e -- tests/e2e/auth.spec.ts`: 1/1 passed (7.1s).
- Acceptance: T03/T04 PASS; CSRF, profile privacy, mass-assignment rejection and next-request permission changes verified.
- Known issues: dependency audit remediation continues; production hosting not exercised.
- Next: M3 content lifecycle.

## M3 — Content, taxonomy and upload

- Status: PASS (API lifecycle and typed/built editor; broader browser lifecycle is checked at M8).
- Implemented: draft/create/update/publish/unpublish/soft-delete, taxonomy CRUD, sanitized HTML/plain text, protected editor/list, image upload MIME/magic/size/random path/alt, public visibility and atomic view deduplication.
- Changed files: modules/documents, modules/categories, modules/tags, modules/uploads, web/pages/ContentAdmin.tsx, web/layouts/Admin.tsx, web/types/content.ts, tests/content.test.ts.
- Verification: lint/typecheck/build passed. First lifecycle test exposed partial-update defaults clearing tags; fixed optional tagIds, reran `npm.cmd test`: 6/6 passed.
- Acceptance: T02/T05/T06/T07/T19/T20 API checks PASS. Invalid PNG/SVG uploads rejected; real PNG accepted.
- Known issues: browser manager lifecycle verification pending at M8.
- Next: M4 public pages and SQL search.

## M4 — Public frontend and SQL search

- Status: PASS (API; browser search flow checked at M8).
- Implemented: public home/detail, responsive cards, URL-synchronized keyword/category/tag/date/page/page-size controls, ILIKE through parameterized Prisma contains queries, search/click logging from the first search release.
- Changed files: modules/search/routes.ts, web/pages/Public.tsx, web/components/Pagination.tsx, web/App.tsx, web/styles.css, tests/search.test.ts.
- Verification: typecheck/build passed; after connecting routes lint passed. `npm.cmd test`: 8/8 passed, including filtered counts, zero results, SQL injection input, result-membership/foreign-search rejection and no direct-navigation click.
- Acceptance: T01/T15/T16/T17/T18 PASS at API level.
- Known issues: full seeded content/browser coverage pending M8.
- Next: M5 engagement/moderation.

## M5 — Engagement and moderation

- Status: PASS (API; browser moderation checked at M8).
- Implemented: comments/replies, existing-user mentions, own edit/delete, unique likes, bounded ratings, target-exclusive duplicate-protected reports, moderator status/report queues, audit records and UI.
- Changed files: modules/{comments,engagement,reports,moderation}, web/components/Engagement.tsx, web/pages/Moderation.tsx, tests/engagement.test.ts.
- Verification: typecheck/lint/build passed; `npm.cmd test`: 10/10 passed. Hidden/deleted root comments also hide their replies from public results.
- Acceptance: T08/T09/T10/T11 PASS at API level.
- Known issues: browser interactions pending M8.
- Next: M6 analytics and SEO.

## M6 — Logging, analytics and SEO

- Status: PASS (API; browser SEO/analytics checked at M8).
- Implemented: linked session-owned search/click events, zero-result logging, transactional view events, real aggregate dashboard/trends/top queries/articles, strict SEO-only endpoint/editor, dynamic title/description and alt rendering.
- Changed files: modules/{search,analytics,seo}, web/pages/SeoAnalytics.tsx, web/pages/Public.tsx, tests/seo-analytics.test.ts.
- Verification: typecheck/lint passed; `npm.cmd test`: 11/11 passed, including real count increases and no-data analytics.
- Acceptance: T12/T16–T19 PASS at API level; signed-in and anonymous logging verified.
- Known issues: clicks/search CTR can exceed 100% by definition; trends limited to 90 latest active days.
- Next: M7 Super Admin and permissions.

## M7 — Super Admin and RBAC management

- Status: PASS (API; browser admin flows checked at M8).
- Implemented: safe paginated users, suspend/activate, multi-role assignment, editable permission matrix, audit filters and whitelist settings. A shared transaction-scoped advisory lock protects administrator changes; SUPER_ADMIN core permissions cannot be removed.
- Changed files: modules/{users/admin.ts,roles,audit/routes.ts,settings}, web/pages/SuperAdmin.tsx, tests/admin.test.ts.
- Verification: typecheck/lint passed; initial regression found settings middleware guarding unrelated admin routes, fixed to /settings only. `npm.cmd test`: 14/14 passed.
- Acceptance: T13/T14/T24 PASS at API level, immediate permission changes and suspended sessions verified.
- Known issues: browser-wide role navigation and concurrent last-admin stress test pending M8.
- Next: M8 complete seed, browser tests, polish and documentation.

## M8 — Complete corpus, verification, polish and deliverables

- Status: PASS locally. Hosted CI and production deployment were not run.
- Implemented: 80 original Vietnamese educational articles (183+ whitespace-separated words each), 72 published/4 draft/4 unpublished, four categories/twelve tags, original local cover illustrations, idempotent demo engagement/reports, seed quality validator, six required browser workflows plus mobile navigation, isolated/fresh database helpers, full documentation and traceability.
- Changed files: apps/api/prisma/{content,seed.ts,seed-content.ts,validate-seed.ts}, apps/web/public/covers, apps/api/tests/*, tests/e2e/*, scripts/*, root package/TypeScript/Playwright configuration, CI, README and docs/*.md. Prior milestone source files were formatted and final startup/CSRF/upload/date-validation edge cases corrected.
- Verification commands and outcomes (2026-10-31):
  - `npm.cmd ci --prefix .local/install-check --fetch-timeout=30000 --fetch-retries=1`: clean isolated dependency installation passed, 436 packages installed, zero audit vulnerabilities. Source manifests/lockfile only copied; no local secrets copied.
  - `npm.cmd run db:generate`: Prisma 6.19.3 client generated successfully after security overrides.
  - `npm.cmd run db:migrate`: both committed SQL migrations applied to empty real PostgreSQL databases.
  - `npm.cmd run db:seed` twice, then `npm.cmd run db:validate-seed`: 80 unique articles, 72 published, four categories, minimum 183 words; stable counts on repeat, required fields present.
  - `npm.cmd run db:verify-fresh`: fresh portal_verify_1793428774420_test created without deleting existing data; migrate → double seed → corpus validation → 17/17 API tests → 7/7 E2E tests → 17/17 API tests PASS. Machine-readable command statuses retained locally in .local/fresh-verification.json.
  - Final `npm.cmd run lint`, `npm.cmd run typecheck` (including tests/scripts), `npm.cmd run build`: PASS. Frontend build: 197 modules, approximately 460 kB JS / 142 kB gzip.
  - Final `npm.cmd test`: 8 files, 17/17 tests PASS (7.09s), including concurrent last-admin suspensions, database CHECKs, rate limits, CSRF/magic bytes/oversize/alt, full category/tag operations and seed idempotency.
  - Final `npm.cmd run test:e2e`: 7/7 Chromium flows PASS (14.5s): register/login/profile/logout; manager lifecycle; guest filtered search/click; comments/likes/rating/report/moderation; roles/permissions/logs/settings; SEO metadata/rendering/analytics; mobile pagination and role navigation.
  - `npm.cmd audit`: zero vulnerabilities. Targeted deepmerge-ts 8 and minimatch 11 overrides are reflected in the lockfile; Prisma generation, migrations and runtime tests passed with them.
  - `npm.cmd run dev` + `node scripts/smoke-local.mjs`: API/web HTTP 200, ten database-backed cards, no browser page errors and no mobile horizontal overflow. Desktop 1440px/mobile 390px screenshots inspected at .local/preview-desktop.png and .local/preview-mobile.png.
  - `npm.cmd run start -w apps/api`: compiled API starts and /health returns 200; second startup intentionally exits 1 with EADDRINUSE. Fixed the Express startup callback so a bind failure no longer prints success.
  - Git ignore checks confirm .env, .local credentials/screenshots/databases, node_modules, builds and uploads are excluded. No remote push/deployment performed.
  - `docker compose config --quiet` with non-sensitive validation environment values: PASS; Docker engine was not started.
  - Local implementation commits: a1c0b01 (application and verification) and b03f770 (Compose). Staged-file scans passed for private paths and configured local secrets. The original implementation plan's intentional Markdown hard-break whitespace was preserved; new-source whitespace checks passed.
- Acceptance: T01–T24 PASS locally with exact implementation/test mapping in REQUIREMENTS_TRACEABILITY.md.
- Resolved verification failures: Zod partial defaults clearing tags; overly broad settings authorization; browser label selectors; browser test state/restoration timing; dependency lock retaining a vulnerable nested package; compiled start collision falsely reporting success. All affected checks rerun successfully.
- Known issues/limits: Docker CLI exists but daemon is unavailable; PostgreSQL 18 local process used instead of Compose 17. GitHub Actions is configured, not remotely executed. Rollup prints two harmless annotation warnings from Zod. Uploads use local disk; horizontal production rate limiting, HTTPS/reverse proxy, object storage, backups and operator-scheduled retention remain deployment responsibilities. View deduplication uses aligned 30-minute buckets; analytics CTR may exceed 100% by documented definition. Retention pruning was not applied.
- Next milestone: none in Phase 1; review the local implementation and PHASE2_HANDOFF.md. Phase 2 search/index/ranking is not implemented.

Final handoff: development/compiled/browser test servers and the project-local PostgreSQL process were stopped. Database files, random local .env credentials and inspected screenshots remain in ignored paths. Restart `npm.cmd run db:local`, then `npm.cmd run dev` in another terminal. No database was dropped or reset.
