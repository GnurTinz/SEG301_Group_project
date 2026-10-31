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

## Demo accounts and sign-in

Anyone cloning this repository runs the application with **their own database and `.env` file**. The `.env` file is excluded from Git, so the project author's local passwords are not shared through the repository.

As part of the Setup instructions above:

1. If you create `.env` from `.env.example`, replace the `REPLACE_...` value of `DEMO_PASSWORD` with your own demo password, between 12 and 128 characters long. If you use `db:local` without an existing `.env`, the helper generates a random password in this variable.
2. Run `npm.cmd run db:migrate` and `npm.cmd run db:seed` to create the tables, sample data and five demo accounts. Cloning the source code alone does not create accounts.
3. Run `npm.cmd run dev`, open **http://localhost:5173/login** and sign in with an email from the table below. All five newly seeded accounts use the password specified by **`DEMO_PASSWORD` in your own `.env` file**.

| Role | Sign-in email | Main capabilities |
|---|---|---|
| Super Admin | `admin@demo.local` | Full access; manage accounts, roles, permissions, logs and settings |
| Content Manager | `manager@demo.local` | Create, edit and publish articles; manage categories and tags |
| Moderator | `moderator@demo.local` | Moderate comments and handle reports |
| SEO Specialist | `seo@demo.local` | Edit SEO metadata and view analytics |
| User | `user@demo.local` | Edit their profile, comment, reply, mention, like, rate and report content |

**Enter the email address in the sign-in form; `admin` and `user` are not default passwords.** All roles use the same `/login` page. After signing in, accounts with administrative permissions see an administration link; Super Admin can open `/admin`, while User accounts use `/profile` and the article pages. Registering through `/register` creates only the `USER` role and does not grant administrator access.

To view only the demo password variable in PowerShell, run this command from the repository root:

```powershell
Select-String -Path .env -Pattern '^DEMO_PASSWORD='
```

Seeding preserves passwords for existing accounts. Changing `DEMO_PASSWORD` and running the seed again **does not change existing passwords**; use the password configured when the account was created or follow a separate password-change process. For a deployed website, accounts and passwords depend on that deployment's database and configuration. Do not publish administrator passwords or use the demo accounts unchanged for a production website.

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

## Documentation

- [Architecture and ERD](docs/ARCHITECTURE.md)
- [API contract](docs/API.md)
- [Decisions](docs/DECISIONS.md)
- [Phase 2 handoff](docs/PHASE2_HANDOFF.md)
- [Audit](docs/AUDIT.md)

SQL ILIKE only. Phase 2 indexing and ranking are intentionally outside this implementation.

## Troubleshooting

PowerShell may block npm.ps1: use npm.cmd. If Docker cannot connect, start Docker Desktop or use db:local. Database connection errors require verifying DATABASE_URL and the running server. Sessions and uploads require writable local storage; uploads are limited to JPEG/PNG/WebP and 5 MB. For production use object storage, HTTPS, backups, external request rate limiting, and explicit trusted proxy configuration.
