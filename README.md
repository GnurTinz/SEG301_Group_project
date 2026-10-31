# Điểm Mới — News & Digital Magazine Portal

Phase 1 coursework implementation. Vietnamese UI, React/TypeScript/Vite, Express, PostgreSQL/Prisma, PostgreSQL cookie sessions and database RBAC. Scope and acceptance criteria: IMPLEMENTATION_PLAN.md. Current evidence: [test report](docs/TEST_REPORT.md), [traceability](docs/REQUIREMENTS_TRACEABILITY.md).

## Setup

Use Node 24 LTS, npm, Docker Compose with PostgreSQL 17 (or an existing PostgreSQL server).

```powershell
Copy-Item .env.example .env
# Set DATABASE_URL, POSTGRES_* values, random SESSION_SECRET (32+ characters),
# and DEMO_PASSWORD (12+ characters). Never commit .env.
docker compose up -d
npm.cmd install
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

On Unix use `cp .env.example .env` and `npm` instead of `npm.cmd`. Open http://localhost:5173 (API: http://127.0.0.1:3001). Vite proxies /api and /uploads. Production requires HTTPS and a same-origin reverse proxy for the built frontend and API.

If Docker is unavailable, `npm.cmd install`, then `npm.cmd run db:local` starts real PostgreSQL on port 55432 in `.local/`. The helper creates `.env` with random secrets only if it does not exist. Keep the helper running, then migrate/seed/dev in another terminal. Existing `.env` files are preserved; point DATABASE_URL to the helper using the password in ignored `.local/postgres.json`. No system service or OS user is created. This helper is optional test/development tooling.

## Commands

`dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `db:generate`, `db:migrate`, `db:seed`, `db:validate-seed`, `db:local` run from the repository root.

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
npm.cmd run db:validate-seed
```

Tests use a separate database ending in `_test`: by default `portal_test` on the configured server, or `TEST_DATABASE_URL`. The runner creates it if missing (the database user needs CREATEDB or an operator must create it first), applies migrations and seeds it. Never point test configuration at a database containing real data. API and browser tests should run sequentially when sharing this database. `npm.cmd run db:verify-fresh` creates a new timestamped test database, migrates, seeds twice, validates, runs the API/browser suites and repeats API tests to check restoration. It preserves the test database for inspection; it never drops existing databases.

`npm.cmd run logs:prune` previews retention counts using `logRetentionDays`. An operator can explicitly add `-- --apply` to remove expired search/view events; administrative audit records and lifetime document counters are retained. Schedule that command externally if automated retention is needed. No cleanup is executed automatically.

The seed contains 80 original Vietnamese educational articles, 72 published and 8 draft/unpublished, four categories, twelve tags, four original SVG illustrations, and demo comments/mentions/likes/ratings/reports. Articles contain at least 183 whitespace-separated words. Reruns preserve existing documents, passwords, role assignments and permission edits. To change a demo password, use an explicit account-management process; changing DEMO_PASSWORD alone does not overwrite existing hashes. No search/view activity is fabricated for dashboard numbers.

Role walkthrough: a manager uses `/admin/articles` and `/admin/taxonomy`; a moderator uses `/admin/moderation`; the SEO specialist uses `/admin/seo` and `/admin/analytics`; the administrator also has `/admin/users`, `/admin/roles`, `/admin/logs` and `/admin/settings`. Ordinary users can edit their profile, comment/reply/mention, like, rate and report published articles. Guest search and clicks are recorded without a user ID.

After building, `npm.cmd run start -w apps/api` starts the compiled API; serve `apps/web/dist` through a same-origin web server. Set NODE_ENV=production, WEB_ORIGIN to the HTTPS origin, and provision HTTPS/reverse-proxy settings. UPLOAD_DIR is resolved relative to the API process working directory; production must use a stable absolute path or an object-storage adapter. The coursework upload implementation is local disk only.

Demo accounts (all use the local DEMO_PASSWORD): user@demo.local / user; manager@demo.local / manager; moderator@demo.local / moderator; seo@demo.local / seo; admin@demo.local / admin. Each has its matching seeded role. Never use these accounts or passwords in a public deployment.

## Documentation

- [Architecture and ERD](docs/ARCHITECTURE.md)
- [API contract](docs/API.md)
- [Decisions](docs/DECISIONS.md)
- [Phase 2 handoff](docs/PHASE2_HANDOFF.md)
- [Audit](docs/AUDIT.md)

SQL ILIKE only. Phase 2 indexing and ranking are intentionally outside this implementation.

## Troubleshooting

PowerShell may block npm.ps1: use npm.cmd. If Docker cannot connect, start Docker Desktop or use db:local. Database connection errors require verifying DATABASE_URL and the running server. Sessions and uploads require writable local storage; uploads are limited to JPEG/PNG/WebP and 5 MB. For production use object storage, HTTPS, backups, external request rate limiting, and explicit trusted proxy configuration.
