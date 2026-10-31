# REST API contract

Prefix `/api/v1`. Success `{ data, meta? }`. Error `{ error: { code, message, details? } }`. Paginated results `{ data: [], meta: { page, pageSize, total, totalPages, searchId? } }`. UUID IDs. Dates are ISO 8601 UTC. Default pageSize 10, maximum 50. Unknown body fields rejected; validation failures 422, duplicates/conflicts 409, anonymous 401, missing permissions 403, invisible/missing resources 404.

Cookie auth: GET `/auth/csrf` returns `{data:{csrfToken}}` and initializes a PostgreSQL session. Send `X-CSRF-Token` and credentials on every mutation, including login/register and anonymous click logging. Login/register rotate session and CSRF token; obtain a fresh token afterwards. Cookies: HttpOnly, SameSite=Lax, Secure in production.

| Method/path | Body/query | Access/result |
|---|---|---|
| GET /auth/csrf | — | Public; CSRF token |
| GET /public/settings | — | Public; siteName and commentsEnabled only |
| POST /auth/register | email, username, password, displayName? | Public; USER identity, 201 |
| POST /auth/login | email, password | Public; identity |
| POST /auth/logout | {} | Auth; session invalidated |
| GET /auth/me, /users/me | — | Auth; safe identity, roles, permissions |
| PATCH /users/me | displayName?, bio? | Auth; own profile |
| GET /users/:username | — | Public; username/displayName/bio/avatarUrl only |
| GET /documents | page?, pageSize?, category?, tag?, from?, to? | Public; published summaries |
| GET /documents/:slug | — | Public; full published document, engagement; view policy applies |
| GET /admin/documents | list filters, status? | documents.update; all non-deleted statuses |
| GET /admin/documents/:id | — | documents.update; editor detail |
| POST /documents | title, content, summary, categoryId, tagIds?, coverImageUrl?, coverImageAlt? | documents.create; DRAFT 201 |
| PATCH /documents/:id | any authoring field above | documents.update; excludes SEO/status |
| DELETE /documents/:id | {} | documents.delete; soft delete |
| PATCH /documents/:id/status | status: DRAFT/PUBLISHED/UNPUBLISHED | documents.publish |
| GET /categories, /tags | — | Public; arrays |
| POST /categories, /tags | name, description? (categories only) | taxonomy.manage; 201 |
| PATCH /categories/:id, /tags/:id | name?, description? (categories only) | taxonomy.manage |
| DELETE /categories/:id, /tags/:id | {} | taxonomy.manage; referenced category 409 |
| POST /uploads/images | multipart image + alt | documents.create; URL/alt; 5 MB raster magic-byte validation |
| GET /documents/:id/comments | page?, pageSize? | Public; visible comments |
| POST /documents/:id/comments | body, parentId? | comments.create; published doc; mentions parsed; 201 |
| PATCH /comments/:id | body | comments.manage_own + owner |
| DELETE /comments/:id | {} | owner/comments.manage_own or moderation.action |
| PUT /documents/:id/like | {} | engagement.manage_own; idempotent |
| DELETE /documents/:id/like | {} | engagement.manage_own |
| PUT /documents/:id/rating | value: integer 1–5 | engagement.manage_own |
| DELETE /documents/:id/rating | {} | engagement.manage_own |
| POST /reports | documentId XOR commentId, reason, description? | reports.create; 201; duplicate open report 409 |
| GET /moderation/comments | page?, pageSize?, status? | moderation.review |
| PATCH /moderation/comments/:id/status | status: VISIBLE/HIDDEN/SPAM | moderation.action |
| GET /moderation/reports | page?, pageSize?, status? | moderation.review |
| PATCH /moderation/reports/:id | status: RESOLVED/DISMISSED | moderation.action |
| GET /search | q, list filters | Public; exactly one SEARCH log, meta.searchId |
| POST /search/clicks | search_id, clicked_doc_id, position? | Public; search ownership and recorded result membership checked; 201 |
| GET /seo/documents | page?, pageSize? | seo.edit; metadata catalog |
| PATCH /seo/documents/:id | seoTitle?, seoDescription?, seoKeywords?, coverImageAlt? | seo.edit; strict metadata whitelist |
| GET /analytics/overview | from?, to? | analytics.read; views/searches/clicks/CTR/top docs/queries/trends |
| GET /admin/users | page?, pageSize? | users.manage; safe identities |
| PATCH /admin/users/:id | status: ACTIVE/SUSPENDED | users.manage; last-admin protection |
| PUT /admin/users/:id/roles | roleIds: UUID[] | roles.assign; last-admin protection |
| GET /admin/roles, /admin/permissions | — | permissions.manage; role matrix |
| PUT /admin/roles/:id/permissions | permissionIds: UUID[] | permissions.manage; core admin permissions protected |
| GET /admin/audit-logs | page?, pageSize?, action?, actor?, from?, to? | audit.read |
| GET /admin/settings | — | settings.manage |
| PATCH /admin/settings | siteName?, commentsEnabled?, logRetentionDays? | settings.manage; whitelist schemas |

Public list records include id, title, slug, summary, author, category, tags, coverImageUrl/Alt, publishedAt, viewsCount. Authoring content is sanitized HTML; plain Unicode text derived server-side. Comments are plain text and React-escaped. Public detail includes likesCount, ratingsCount, averageRating, ownLiked, ownRating. Profile/email updates are restricted to display name/bio; email changes are outside Phase 1.
