# AGENTS.md — Coding Agent Instructions

## Mission
Implement a production-minded (but coursework-scoped) **News & Digital Magazine Portal Phase 1**. The authoritative specification, milestones, DB schema, routes, RBAC matrix, and tests are in `IMPLEMENTATION_PLAN.md`. Read it completely before modifying source code.

## Rules
1. First inspect the existing repository and `git status`. Do not overwrite user work or delete files without explicit approval.
2. Follow milestones M0–M8 in the plan. Implement **end-to-end vertical slices** (database -> API -> web -> automated tests -> docs), not mock-only UI.
3. Keep the chosen stack: React/TypeScript/Vite, Express/TypeScript, PostgreSQL/Prisma, cookie sessions, RBAC. No scope drift.
4. RBAC must be enforced on the server, including ownership checks, not solely by hiding React buttons.
5. Use Zod validation, parameterized queries, password hashing, CSRF protections for cookie mutations, safe upload handling, HTML sanitization, rate limits, safe logging, environment variables for secrets.
6. `documents` and `search_click_logs` must satisfy the required fields. Every search is logged even with zero results/no click. Actual result clicks are linked to the search that produced them.
7. Seed 80 *meaningful, distinct* articles, not lorem ipsum or duplicated filler; seed idempotently and document demo roles.
8. Build real pages for guest, user, Content Manager, Moderator, SEO Specialist, Super Admin. Required actions must work against backend API.
9. **Do not** implement Phase 2 tokenization, inverted index, TF-IDF, BM25 or vector search. Use SQL `ILIKE` for Phase 1 search only.
10. Test after each milestone. Never claim a test/build passed unless you actually executed it. Track the plan’s acceptance cases T01–T24.
11. Keep documentation synchronized (`README.md`, `docs/API.md`, `docs/REQUIREMENTS_TRACEABILITY.md`, `docs/PHASE2_HANDOFF.md`, `docs/TEST_REPORT.md`).
12. Never commit secrets, publish, push, perform destructive operations, or deploy/charge paid infrastructure without authorization.
13. If a small ambiguity arises, adopt the safest minimally-complex solution and record the assumption in `docs/DECISIONS.md`.

## End-of-milestone report
Provide: `Status`, `Implemented`, `Changed files`, `Verification commands + outcomes`, `Acceptance tests`, `Known issues`, and `Next milestone`.

## Initial action
1. Read `IMPLEMENTATION_PLAN.md`.
2. Audit repo structure/status.
3. Begin milestone M0; work through the milestones as environment allows.
