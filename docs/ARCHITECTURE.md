# Phase 1 architecture

Vietnamese React UI → same-origin /api/v1 → Express validation, CSRF, live database RBAC → Prisma → PostgreSQL.

Browser mutations send an X-CSRF-Token obtained from /auth/csrf. Cookies are HttpOnly, SameSite=Lax, Secure in production; session records live in PostgreSQL. Permission checks reload role relationships on every request. Responses omit password hashes and session identifiers. Public document queries always require PUBLISHED and deleted_at NULL.

```mermaid
flowchart LR
  UI[React / Router / Query] --> API[Express / Zod / CSRF]
  API --> RBAC[Authentication / permissions / ownership]
  RBAC --> ORM[Prisma / parameterized ILIKE]
  ORM --> PG[(PostgreSQL)]
  API --> Images[Validated local raster uploads]
```

```mermaid
erDiagram
  users ||--o{ user_roles : has
  roles ||--o{ user_roles : grants
  roles ||--o{ role_permissions : has
  permissions ||--o{ role_permissions : defines
  users ||--o{ documents : authors
  categories ||--o{ documents : groups
  documents ||--o{ document_tags : has
  tags ||--o{ document_tags : labels
  documents ||--o{ comments : receives
  users ||--o{ comments : writes
  comments ||--o{ comment_mentions : mentions
  documents ||--o{ document_likes : receives
  documents ||--o{ document_ratings : receives
  documents ||--o{ document_views : records
  documents ||--o{ reports : targets
  comments ||--o{ reports : targets
  search_click_logs ||--o{ search_click_logs : links_clicks
  users ||--o{ audit_logs : acts
```

API modules: auth, users, roles, documents, categories, tags, uploads, comments, engagement, reports, search, analytics, SEO, audit, settings. Shared constants define the permission matrix. SQL CHECK constraints cover rating bounds, report target exclusivity and log event shape. Administrations and associated audit writes use transactions. Pagination defaults to 10 and caps at 50.

Trade-offs: local disk uploads for coursework (production must use object storage); SQL ILIKE without ranking for Phase 1; PostgreSQL sessions avoid a separate cache service. Analytics use actual events. CI uses isolated PostgreSQL and browser tests.
