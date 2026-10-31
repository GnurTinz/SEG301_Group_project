# Implementation decisions

1. Keep implementation local. Sites local-development guidance applies; hosted Sites would change the specified runtime and is outside authorization.
2. Use npm workspaces. PowerShell commands use npm.cmd where npm.ps1 is blocked.
3. PostgreSQL is mandatory in development and tests. A local ephemeral PostgreSQL helper may replace unavailable Docker infrastructure, never the database technology.
4. Guest search/click logging also uses CSRF-protected anonymous sessions. Store result IDs in search metadata to validate actual result membership and position; never trust client query text.
5. Count one detail view per browser/session/document per 30 minutes. Maintain view event and counter atomically.
6. Moderator edits use dedicated status endpoints; comment text edits remain owner-only.
7. Protect the SUPER_ADMIN role's core permission set and serialize administrator changes in a database transaction to prevent concurrent last-admin removal.
8. Seed articles are original educational explanations, not invented current news. Use local original cover illustrations and environment-provided demo passwords.
9. Pin Prisma to patched 6.19.3 to retain the specified Prisma schema/client workflow; override vulnerable transitive deepmerge-ts/minimatch to patched releases and verify migrations, generation, lint, build and integration tests. Use Zod 4 with the matching maintained resolver. No forced framework migration.
10. View deduplication uses aligned UTC 30-minute buckets, enforced by a unique database key; two requests straddling a bucket boundary may both count. This is a documented approximation, not a rolling window.
11. SUPER_ADMIN always retains its five core administrative permissions, a stricter invariant than protecting only the last administrator. All user status/role/permission mutations take the same transaction-scoped PostgreSQL advisory lock.
12. Seeds preserve existing article content, password hashes, user role assignments and role permission edits. New identities/roles receive defaults inside a transaction. A failed browser verification initially left a test role grant behind; browser tests now await restoration and the fresh verification repeats API RBAC tests afterwards.
13. Test runners create only databases with validated simple names ending in `_test`, never reset/drop existing databases, and use a separate connection from development. The fresh verification database is retained for inspection.
14. Public settings expose only the magazine name and comments-enabled flag. Retention cleanup is an operator command with dry-run default; it is not automatically scheduled. View counters are lifetime totals and remain after old view events are pruned.
