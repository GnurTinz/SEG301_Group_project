# IMPLEMENTATION PLAN — AI News & Digital Magazine Portal (Phase 1)

**Đối tượng:** Coding agent (Codex, Claude Code hoặc công cụ lập trình tương đương).  
**Mục tiêu:** Xây dựng ứng dụng Full-Stack thực sự chạy được, đúng rubric Phase 1, đồng thời chuẩn bị dữ liệu và hành vi tương tác cho Phase 2 (Search Engine).  
**Ngôn ngữ sản phẩm:** Giao diện tiếng Việt; API, code, schema và tên biến tiếng Anh.  
**Phương án mặc định:** **News & Digital Magazine Portal** chuyên về AI, khoa học và công nghệ. Không triển khai thêm ba domain còn lại.

> **Quy tắc phạm vi:** Phase 1 chỉ dùng truy vấn cơ sở dữ liệu (PostgreSQL ILIKE) để tìm kiếm. **KHÔNG** tự triển khai tokenizer, inverted index, TF-IDF, BM25 hay semantic search; **KHÔNG** thay thế các mục bắt buộc bằng giao diện demo hoặc dữ liệu giả hardcoded ở frontend.

---

## 0. Định nghĩa hoàn thành (Definition of Done)

Ứng dụng chỉ được xem là hoàn thành khi:

1. Clone repo, cấu hình `.env`, bật PostgreSQL và chạy lệnh thiết lập/seed là mở được website, không cần chỉnh mã nguồn.
2. Frontend responsive; trang danh sách có phân trang, tóm tắt; trang chi tiết hiển thị nội dung, hình ảnh, tác giả, ngày đăng, lượt xem, danh mục, tags.
3. Người dùng đăng ký, đăng nhập, đăng xuất, chỉnh sửa profile; có comment, like **và** rating 1–5, mention `@username` trong comment, báo cáo nội dung.
4. Có CRUD thực sự qua backend cho documents, categories, tags; publish/unpublish đúng quyền. Content Manager quản trị nội dung; Moderator kiểm duyệt bình luận/báo cáo; Data & SEO Specialist quản lý metadata và dashboard; Super Admin quản lý user/role/permission/logs/settings.
5. Mọi API mutation bị kiểm tra authentication, permission và ownership **ở server**; thử gọi API trực tiếp khi không đủ quyền phải trả 401/403.
6. Tìm kiếm keyword bằng `ILIKE`, lọc category/tag/date, có phân trang; mọi lượt search được log và mọi lượt click từ kết quả được log với query, document, time, user (nếu có).
7. Database có đủ các trường bắt buộc của `documents` và `search_click_logs`, cùng quan hệ hợp lệ.
8. Seed **80** bài viết/ tài liệu phân biệt, thực tế, không Lorem Ipsum/đoạn lặp vô nghĩa, và 5 tài khoản demo theo role; seeding idempotent.
9. Test tự động các luồng quan trọng, RBAC negative cases, logging; lint/typecheck/build chạy thành công; README có hướng dẫn cài đặt, run, seed, test, tài khoản demo, kiến trúc.
10. Không lộ mật khẩu/token/secrets trong repo; có `.env.example`, log an toàn, upload được kiểm tra, chống SQLi/XSS, rate limiting.

---

## 1. Stack và kiến trúc cố định

Tránh để agent thay framework giữa chừng. Dùng:

- **Frontend:** React + TypeScript + Vite + React Router + TanStack Query, Tailwind CSS, React Hook Form + Zod.
- **Backend:** Node.js LTS + Express + TypeScript, Zod cho validation, Prisma ORM.
- **Database:** PostgreSQL. **Không cần** MongoDB.
- **Authentication:** session cookie HttpOnly, SameSite=Lax, Secure trên HTTPS; session lưu tại PostgreSQL (không dùng MemoryStore production). Password hash Argon2id. CORS allowlist; CSRF protection cho các mutation sử dụng cookie.
- **RBAC:** roles/permissions trong DB; middleware `requireAuth`, `requirePermission`, kiểm tra ownership.
- **File/image:** upload ảnh bìa với MIME allowlist, giới hạn dung lượng, tên ngẫu nhiên, static serving trong local dev; production có hướng dẫn đổi sang object storage. Bắt buộc lưu alt text.
- **Tests:** Vitest + Supertest cho API/logic; Playwright cho các luồng trình duyệt quan trọng.
- **Tooling:** ESLint, Prettier, Docker Compose (PostgreSQL), GitHub Actions CI.
- **API:** RESTful, prefix `/api/v1`, JSON, consistent response/error contracts.

Cấu trúc:

```text
repo/
├── apps/
│   ├── web/
│   │   ├── src/{api,components,features,hooks,layouts,pages,routes,types,utils}/
│   │   └── ...
│   └── api/
│       ├── prisma/{schema.prisma,migrations,seed.ts}/
│       ├── src/{app.ts,server.ts,config,middleware,modules,lib,utils}/
│       └── tests/
├── packages/shared/        # shared API types / constants where useful
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .github/workflows/ci.yml
├── AGENTS.md
├── IMPLEMENTATION_PLAN.md
└── README.md
```

Các module backend tối thiểu: `auth`, `users`, `roles`, `documents`, `categories`, `tags`, `comments`, `engagement`, `reports`, `search`, `analytics`, `seo`, `audit`, `settings`, `uploads`.

**API contract:** thành công `{ data, meta? }`; lỗi `{ error: { code, message, details? } }`; status 400/401/403/404/409/422/429/500 phù hợp; paginated response `{ data: [...], meta: { page, pageSize, total, totalPages } }`.

---

## 2. User stories (nghiệp vụ cần hoạt động)

### 2.1 Guest
- Xem bài đã `PUBLISHED`, lọc và phân trang, xem chi tiết, tìm kiếm keyword; không thấy draft/unpublished.
- Có thể thực hiện search và click vào kết quả; log có `user_id = null`, định danh ẩn danh tùy chọn (ngẫu nhiên, không gắn PII).
- Khi thử bình luận, like, rating, báo cáo: yêu cầu đăng nhập.

### 2.2 Registered User
- Đăng ký, đăng nhập, đăng xuất, xem/sửa profile (tên, bio, avatar nếu hỗ trợ; email xử lý cẩn trọng).
- Bình luận vào bài đã publish; sửa/xóa **bình luận của chính mình**, không sửa người khác.
- Like/unlike, đánh giá từ 1 đến 5 (một rating mỗi user/bài), mention `@username` và báo cáo bài/bình luận.
- Xem trạng thái tương tác của bản thân.

### 2.3 Content Manager
- Tạo/xem/sửa/xóa mềm (soft delete) articles; quản lý cover image, category và tags.
- Draft -> Published -> Unpublished, có ngày xuất bản; quản lý taxonomy (category/tag CRUD).
- Chỉ màn quản trị thấy bản draft/unpublished theo phân quyền.

### 2.4 Moderator
- Xem comments/reports; hide/restore comment, đánh dấu spam, resolve/dismiss report; ghi audit action.
- Không có quyền cấp roles, sửa nội dung bài viết, SEO metadata nếu không được gán thêm permission.

### 2.5 Data & SEO Specialist
- Sửa riêng các trường SEO title, description, keywords, image alt; xem analytics (views, searches, clicks, top docs, top queries).
- **Không** tự sửa document body hoặc thay trạng thái publish.

### 2.6 Super Admin
- Xem/khoá/mở tài khoản; gán roles và permissions cho roles; xem audit/system logs và sửa global settings.
- Chặn khoá/xoá Super Admin cuối cùng hoặc gỡ permission quản trị lõi khỏi Super Admin cuối cùng.
- Có quyền tác nghiệp của các role khác theo bảng permissions.

---

## 3. Thiết kế RBAC chi tiết

### 3.1 Roles seed sẵn
- `SUPER_ADMIN`
- `CONTENT_MANAGER`
- `MODERATOR`
- `SEO_SPECIALIST`
- `USER`

Một user có thể có nhiều role (`user_roles`); quyền hiệu lực bằng union permissions. UI ẩn nút theo quyền nhưng **API là nguồn quyết định**.

### 3.2 Permission keys bắt buộc

| Permission key | User | Content Manager | Moderator | SEO Specialist | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| `documents.create` / `documents.update` / `documents.delete` / `documents.publish` | — | ✓ | — | — | ✓ |
| `taxonomy.manage` | — | ✓ | — | — | ✓ |
| `comments.create` / `comments.manage_own` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `engagement.manage_own` / `reports.create` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `moderation.review` / `moderation.action` | — | — | ✓ | — | ✓ |
| `seo.edit` / `analytics.read` | — | — | — | ✓ | ✓ |
| `users.manage` / `roles.assign` / `permissions.manage` | — | — | — | — | ✓ |
| `audit.read` / `settings.manage` | — | — | — | — | ✓ |

Các role quản trị cũng có hành vi USER; Guest chỉ được các API public. Khi đổi role/permission, API lần tiếp theo phải áp dụng quyền mới (không cache vô thời hạn trong token).

---

## 4. Database schema — PostgreSQL/Prisma

Tạo **migration thực sự**, không chỉ mô tả schema. UUID primary keys; timezone-aware `timestamptz`; unique/index/foreign keys; validate dữ liệu.

| Table | Trường chính | Ràng buộc / Mục đích |
|---|---|---|
| `users` | `id`, `email`, `username`, `password_hash`, `display_name`, `bio`, `avatar_url`, `status`, `created_at`, `updated_at` | email/username unique; password never in public response |
| `roles` | `id`, `key`, `name` | unique key; seed 5 roles |
| `permissions` | `id`, `key`, `description` | unique key |
| `user_roles` | `user_id`, `role_id` | unique pair |
| `role_permissions` | `role_id`, `permission_id` | unique pair |
| `categories` | `id`, `name`, `slug`, `description` | slug unique |
| `tags` | `id`, `name`, `slug` | slug unique |
| **`documents`** | **`id`, `title`, `content`, `summary`, `category_id`, `author`, `created_at`, `views_count`**; thêm `slug`, `author_id`, `content_plain`, `status`, `cover_image_url`, `cover_image_alt`, `published_at`, `updated_at`, `deleted_at`, `seo_title`, `seo_description`, `seo_keywords` | **Đúng field bắt buộc đề bài**; `author` là snapshot text, `author_id` là FK nếu tác giả có account. `content` là HTML đã sanitize; `content_plain` dùng cho tìm kiếm Phase 2. `views_count` default 0. |
| `document_tags` | `document_id`, `tag_id` | join many-to-many; unique pair |
| `comments` | `id`, `document_id`, `user_id`, `parent_id` (nullable), `body`, `status`, `created_at`, `updated_at`, `deleted_at` | visible/hidden/spam; hỗ trợ reply |
| `comment_mentions` | `comment_id`, `mentioned_user_id` | join unique; parse `@username` ở server, chỉ lưu username tồn tại |
| `document_likes` | `document_id`, `user_id`, `created_at` | unique user+document |
| `document_ratings` | `document_id`, `user_id`, `value`, `created_at`, `updated_at` | 1–5; unique user+document |
| `reports` | `id`, `reporter_id`, `document_id` (nullable), `comment_id` (nullable), `reason`, `description`, `status`, `resolved_by`, `resolved_at`, `created_at` | exactly one target; prevent duplicate open report where practical |
| **`search_click_logs`** | **`id`, `user_id` (nullable), `query_string`, `clicked_doc_id` (nullable), `timestamp`**; thêm `event_type` (`SEARCH`/`CLICK`), `search_id`, `page`, `position`, `filters_json`, `result_count` | **Đúng bốn field bắt buộc**; search luôn tạo 1 event (clicked_doc_id=null); click tạo event có clicked_doc_id + search_id liên kết. Tìm kiếm không click vẫn được lưu. |
| `document_views` | `id`, `document_id`, `user_id` (nullable), `viewed_at` | ghi view server-side; dùng tạo dashboard và kiểm tra views_count |
| `audit_logs` | `id`, `actor_id` (nullable), `action`, `entity_type`, `entity_id`, `metadata_json`, `created_at` | RBAC, publish, moderation, settings, login security events; tuyệt đối không lưu password/token |
| `settings` | `key`, `value_json`, `updated_by`, `updated_at` | danh sách key cho phép, validate schema per key |

**Indexes tối thiểu:** `documents(status, published_at DESC)`, `documents(category_id, status)`, `documents(created_at)`, `document_tags(tag_id, document_id)`, `comments(document_id, created_at)`, `search_click_logs(event_type, timestamp)`, `search_click_logs(search_id)`, `search_click_logs(query_string)`, `document_views(document_id, viewed_at)`.

**Quy tắc dữ liệu:**
- `documents.status`: `DRAFT | PUBLISHED | UNPUBLISHED`. Soft delete qua `deleted_at`; mọi public query lọc `PUBLISHED` và `deleted_at IS NULL`.
- `content_plain` phải được tính tự động từ `content` sau sanitize; giữ Unicode/tiếng Việt; không viết search engine nâng cao trong Phase 1.
- Slug unique; nếu trùng thì xử lý suffix; `summary` là text không HTML.
- SEO metadata tách khỏi nội dung bài để chỉ SEO Specialist được sửa.
- `search_click_logs.clicked_doc_id` nullable là **cần thiết** vì người dùng có thể tìm nhưng không click.
- Không log mật khẩu, session cookie, access token, nội dung riêng tư; có thể cấu hình retention log.

---

## 5. REST API contract (danh sách chức năng)

Tất cả endpoint trong `/api/v1`. Các tên và payload chi tiết phải được ghi vào OpenAPI hoặc file `docs/API.md` trước khi frontend tích hợp. Xử lý validation, status codes, RBAC, pagination thống nhất.

### 5.1 Auth / Profile

| Method | Endpoint | Access | Behavior |
|---|---|---|---|
| POST | `/auth/register` | Guest | email, username, password; mặc định USER |
| POST | `/auth/login` | Guest | set session HttpOnly; hạn chế brute force |
| POST | `/auth/logout` | Auth | invalidate session |
| GET | `/auth/me` | Auth | identity, roles và permissions hiệu lực |
| GET | `/users/me` | Auth | hồ sơ của mình |
| PATCH | `/users/me` | Auth | cập nhật các field cho phép |
| GET | `/users/:username` | Public | public profile, không lộ email nhạy cảm |

### 5.2 Documents / Taxonomy

| Method | Endpoint | Access | Behavior |
|---|---|---|---|
| GET | `/documents?page=&pageSize=&category=&tag=&from=&to=` | Public | published items mới nhất + summary + total |
| GET | `/documents/:slug` | Public | full content, metadata, comments summary; tăng view count (quy tắc count rõ) |
| GET | `/admin/documents?status=&...` | Content Manager hoặc Super Admin | tất cả status |
| POST | `/documents` | `documents.create` | create DRAFT |
| PATCH | `/documents/:id` | `documents.update` | edit fields, không tùy tiện edit SEO |
| DELETE | `/documents/:id` | `documents.delete` | soft delete |
| PATCH | `/documents/:id/status` | `documents.publish` | publish/unpublish/draft transition |
| GET | `/categories`, `/tags` | Public | list taxonomy |
| POST/PATCH/DELETE | `/categories`, `/categories/:id` | `taxonomy.manage` | CRUD category, bảo vệ category đang được tham chiếu |
| POST/PATCH/DELETE | `/tags`, `/tags/:id` | `taxonomy.manage` | CRUD tag |
| POST | `/uploads/images` | `documents.create` | validated image upload, return URL |

### 5.3 Engagement / Moderation

| Method | Endpoint | Access | Behavior |
|---|---|---|---|
| GET | `/documents/:id/comments?page=` | Public | visible comments, phân trang |
| POST | `/documents/:id/comments` | `comments.create` | create + parse mentions; chỉ published docs |
| PATCH | `/comments/:id` | owner hoặc Moderator (nếu thuộc moderation) | edit own content; audit nếu mod action |
| DELETE | `/comments/:id` | owner hoặc Moderator | soft delete/hide phù hợp |
| PUT/DELETE | `/documents/:id/like` | `engagement.manage_own` | like/unlike idempotent |
| PUT/DELETE | `/documents/:id/rating` | `engagement.manage_own` | rating 1–5 hoặc xoá rating |
| POST | `/reports` | `reports.create` | report document hoặc comment |
| GET | `/moderation/reports` | `moderation.review` | queue, filters |
| PATCH | `/moderation/reports/:id` | `moderation.action` | resolve/dismiss |
| GET | `/moderation/comments` | `moderation.review` | visible/hidden/spam queue |
| PATCH | `/moderation/comments/:id/status` | `moderation.action` | hide/restore/spam |

### 5.4 Search / Logs / SEO / Admin

| Method | Endpoint | Access | Behavior |
|---|---|---|---|
| GET | `/search?q=&category=&tag=&from=&to=&page=` | Public | `ILIKE` trên title/summary/content_plain, category/tag/date filter; trả `search_id`, pagination; **log SEARCH event** |
| POST | `/search/clicks` | Public | `{ search_id, clicked_doc_id, position? }`; server tra query tương ứng và **log CLICK event**; validate id tồn tại |
| PATCH | `/seo/documents/:id` | `seo.edit` | cập nhật duy nhất SEO title/description/keywords/cover alt |
| GET | `/analytics/overview?from=&to=` | `analytics.read` | top articles, views, search trends, top queries, clicks, CTR |
| GET | `/admin/users` | `users.manage` | paginated users |
| PATCH | `/admin/users/:id` | `users.manage` | enable/suspend |
| PUT | `/admin/users/:id/roles` | `roles.assign` | assign known roles, protect last Super Admin |
| GET | `/admin/roles`, `/admin/permissions` | `permissions.manage` | matrix quyền |
| PUT | `/admin/roles/:id/permissions` | `permissions.manage` | cập nhật matrix permissions, protect core admin rights |
| GET | `/admin/audit-logs` | `audit.read` | filter action/actor/date |
| GET/PATCH | `/admin/settings` | `settings.manage` | global settings with whitelist |

**Ví dụ contract search:**

```json
{
  "data": [ { "id": "...", "title": "...", "summary": "...", "slug": "..." } ],
  "meta": { "searchId": "uuid", "page": 1, "pageSize": 10, "total": 26, "totalPages": 3 }
}
```

Frontend phải giữ `searchId` từ kết quả; khi người dùng click một kết quả, gửi `POST /search/clicks` rồi điều hướng đến detail. Click trực tiếp từ trang chủ **không** được giả lập là search click.

---

## 6. Pages / routes / UI checklist

**Public:** `/` (latest + pagination + filter), `/articles/:slug` (full details, SEO meta, image alt, comments, likes, ratings), `/search` (keyword+filters+pagination; track clicks), `/login`, `/register`, `/users/:username`.

**Authenticated:** `/profile` (read/update); comment form, mention autocomplete hoặc parser `@username`; report form/dialog; like/rating controls.

**Admin shell:** `/admin` dashboard với navigation theo permissions; `/admin/articles` (list/status/filter), `/admin/articles/new`, `/admin/articles/:id/edit` (authoring + category/tags + cover), `/admin/taxonomy`, `/admin/moderation`, `/admin/seo`, `/admin/analytics`, `/admin/users`, `/admin/roles`, `/admin/logs`, `/admin/settings`.

**UI states bắt buộc:** loading, empty, error, unauthorized, not found, confirmation dialog for delete, form validation, successful mutation feedback, page-size/pagination behavior; mobile responsive.

**Không giả lập:** Không dùng local `mockArticles` sau khi backend tích hợp; dữ liệu lấy qua API; nút bấm phải hoạt động thật; quyền admin phải được backend kiểm tra.

---

## 7. Seed dữ liệu có giá trị cho Phase 2

Seed **80 unique documents**, chẳng hạn 20 ML, 20 Computer Vision, 20 NLP, 20 AI Applications. Tối thiểu 8–12 tags; 4–6 categories; mỗi bài có:
- Tiêu đề riêng; summary 1–3 câu; nội dung giải thích có ý nghĩa, khuyến nghị khoảng 150–400 từ/bài (có biến thiên độ dài), không lặp khuôn vô nghĩa.
- `content` (HTML sanitized), `content_plain`, author, cover image nếu có nguồn hợp lệ, cover alt, created/published date có phân bố hợp lý, tags, category, SEO fields.
- Không Lorem Ipsum. Không copy vi phạm bản quyền. Có thể tạo bài giải thích tự viết hoặc nhập dataset được phép sử dụng, ghi nguồn nếu cần. Không tự bịa nguồn và thông tin tin tức cụ thể.
- Ít nhất 70 `PUBLISHED`, vài `DRAFT/UNPUBLISHED` để test RBAC; có dữ liệu comments/likes/ratings/reports để demo dashboard và moderation.
- 5 tài khoản demo seed theo mỗi role, mật khẩu demo cấu hình bằng ENV (không hardcode password thật), README chỉ nêu biến env hoặc mật khẩu dev không dùng ngoài local.
- Seeding **idempotent** (`upsert`/unique natural keys), không tạo trùng dữ liệu khi chạy 2 lần. Có script xác thực document count, duplicates, required fields, empty/placeholder text.

---

## 8. Logging và Analytics — yêu cầu bắt buộc

### Flow search rồi click

```text
User nhập 'transformer' + chọn filters
  -> GET /api/v1/search?q=transformer&...
  -> Backend query ILIKE, tạo log SEARCH (clicked_doc_id=NULL)
  -> Backend trả list + searchId
  -> User click kết quả #3
  -> POST /api/v1/search/clicks {search_id, clicked_doc_id, position:3}
  -> Backend xác thực search_id và published doc, tạo log CLICK
  -> Frontend mở /articles/:slug
```

**Tiêu chí dữ liệu:**
- Mỗi request search hợp lệ tạo đúng một SEARCH event; không click vẫn tồn tại.
- Click chỉ ghi khi thực sự click từ danh sách search, không ghi khi mở trực tiếp bài; support signed-in và guest.
- Query từ server lấy lại theo `search_id`, **không tin** query client gửi cho click; validate `clicked_doc_id`.
- `timestamp` sử dụng UTC trong DB, frontend hiển thị timezone người dùng.
- Dashboard sử dụng logs thật, không số fake; có trạng thái no-data.
- CTR = số click hợp lệ / số lượt search trong khoảng ngày (định nghĩa rõ là clicks per search, có thể >100% nếu một search click nhiều bài); nếu cần CTR nằm trong 0–100%, dùng tỷ lệ lượt search có ít nhất một click và ghi rõ định nghĩa.
- `views_count` tăng chỉ khi có request detail hợp lệ; xác định quy tắc chống double-count như giới hạn một view mỗi người/browser mỗi khoảng thời gian tùy cấu hình. Không để frontend tăng trực tiếp.

---

## 9. Security, validation, consistency

- Hash password Argon2id; minimum password length, email normalization; session rotation khi login, invalidate khi logout; safe cookie settings production.
- CSRF protection trên mutation endpoints vì dùng cookie sessions; CORS allowlist, không wildcard với credentials.
- Zod validate `params/query/body`; max length cho query/title/body/comment; bounded pageSize (10 default, max 50).
- Prisma parameterized queries; dùng `ILIKE` an toàn thông qua ORM/parameter binding, **không** nối string SQL từ đầu vào.
- Sanitize HTML **trên server** cho `documents.content`, sanitize render và comment để tránh stored XSS; ưu tiên plain text comment.
- Image upload accept `image/jpeg`, `image/png`, `image/webp`; max 5 MB; kiểm tra magic bytes, random filename; không cho upload script/HTML/SVG nguy hiểm.
- Rate limiting login/register, comments, search, click logging; chống spam report; audit các hành động quản trị.
- Không ghi password, cookie, API keys vào logs; không commit `.env`, database dump thật, uploads nhạy cảm.
- Khi status hoặc permission đổi, public/admin responses tuân thủ ngay; dùng transactions cho multi-table operations; indexes/migrations thực tế.
- Error responses không lộ stack trace trong production; health endpoint `GET /health`.

---

## 10. Kế hoạch theo milestones (làm tuần tự, mỗi bước có bằng chứng chạy được)

### M0 — Khảo sát repo & chốt hợp đồng
**Task:** Kiểm tra repo hiện có, không ghi đè file của người dùng. Thiết lập thư mục, scripts, docs `docs/REQUIREMENTS_TRACEABILITY.md` ánh xạ yêu cầu -> module/API/test. Chốt stack/architecture và ERD trong `docs/ARCHITECTURE.md`.  
**Gate:** Repo structure và kế hoạch được commit; không có code xung đột.

### M1 — Scaffold & Infrastructure
**Task:** React/Vite/Express/TypeScript/Prisma; Docker Compose Postgres; CORS, env validation, ESLint/Prettier, scripts, basic CI, `/health`; root scripts `dev`, `build`, `lint`, `typecheck`, `test`, `db:migrate`, `db:seed`.  
**Gate:** `docker compose up -d`, migrate, start web+api, health trả 200, pipeline build pass.

### M2 — Schema, Seed & Authentication
**Task:** Viết toàn bộ Prisma schema + constraints + migrations; seed roles/permissions và tài khoản dev; register/login/logout/me/profile, session store, CSRF, protected routes; unit/API tests.  
**Gate:** Register/login/logout/401 profile hoạt động, permission change có hiệu lực; migrations chạy DB trống; seed 2 lần không duplicate.

### M3 — Content CRUD + Taxonomy + Upload
**Task:** Categories/tags CRUD, documents CRUD/status, sanitize content, cover image+alt, public listing/detail, pagination, view counters; index queries.  
**Gate:** Manager tạo draft -> publish -> guest thấy -> unpublish -> guest không thấy; viewer direct API không sửa được; admin thấy drafts.

### M4 — Public Frontend + Search (SQL only)
**Task:** Home, article detail, auth forms, profile, listing filters, `/search` with ILIKE + category/tag/date filters and result count; URL query params sync; mobile responsive.  
**Gate:** Đăng bài qua admin -> trang chủ/chi tiết hiển thị; search có kết quả đúng, filter và phân trang chính xác, guest không thấy draft.

### M5 — Engagement + Moderation
**Task:** Comments/replies, mention parser, like, rating, reports; moderator queues, hide/restore/spam, audit logs; UI actions.  
**Gate:** User comments/likes/rates; comment owner edit; user khác không edit; Moderator hide comment; public không thấy hidden/spam; report resolved.

### M6 — Search/Click Logging + Analytics + SEO
**Task:** SEARCH/CLICK events và `searchId`, view events, analytics real queries, SEO metadata editor quyền riêng, SEO title/description/alt rendering; indexes.  
**Gate:** Search tạo SEARCH log (kể cả không click); click tạo CLICK log đúng doc/query; SEO Specialist chỉ sửa SEO; analytics tăng từ dữ liệu hoạt động thực.

### M7 — Super Admin + RBAC Management
**Task:** User list/suspend, assign roles, edit permission matrix, view system logs, global settings, audit screens.  
**Gate:** Admin đổi quyền -> API phản ánh; Moderator/SEO Specialist bị 403 khi cố manage users; không gỡ Super Admin cuối cùng.

### M8 — Complete Seed + Testing/Polish + Docs
**Task:** Đủ 80 realistic documents, polish responsive/accessibility/errors; test unit/integration/E2E/RBAC/migrations/logging; README full setup + demo accounts + API docs + phase2 handoff; `npm run build` và CI pass.  
**Gate:** Bảng acceptance bên dưới được đánh dấu PASS có evidence; nêu rõ những việc chưa làm (nếu có), không nói 'hoàn tất' khi test fail.

**Chiến lược triển khai:** Ưu tiên vertical slices end-to-end (DB -> service -> API -> React -> test); không build toàn bộ frontend với dữ liệu giả trước rồi mới nối backend. Sau mỗi milestone agent phải tự chạy lệnh kiểm tra và cung cấp bằng chứng.

---

## 11. Testing & acceptance scenarios (ít nhất)

| ID | Case | Kết quả mong đợi |
|---|---|---|
| T01 | Guest xem home, chuyển trang 1->2 | 10 items/trang, không trùng, sort mới nhất |
| T02 | Guest GET draft/unpublished theo slug | 404 (không lộ nội dung) |
| T03 | Register email trùng | 409/validation error, không tạo trùng |
| T04 | Logout rồi GET `/auth/me` | 401 |
| T05 | User POST document qua API trực tiếp | 403 |
| T06 | Content Manager tạo draft, sửa, publish, unpublish, delete | đúng trạng thái và quyền public |
| T07 | Category/tag được CRUD và gắn vào document | list/filter/metadata đúng |
| T08 | User bình luận, người khác PATCH comment | 403 |
| T09 | Mention `@username` hợp lệ | record `comment_mentions` đúng, không chèn HTML độc hại |
| T10 | User like 2 lần; rating 1–5 | không duplicate like; rating out-of-range reject |
| T11 | Report comment + Moderator hide/resolve | public không thấy comment ẩn, audit có record |
| T12 | SEO Specialist sửa SEO title, thử sửa body | SEO thành công; body bị 403/422 và giữ nguyên |
| T13 | Moderator thử quản lý roles | 403 |
| T14 | Không thể xoá/gỡ role Super Admin cuối cùng | 409/403 |
| T15 | Search keyword + category/tag/date | DB results đúng, pagination đúng, drafts không hiện |
| T16 | Search trả 0 results | SEARCH log vẫn được lưu, clicked_doc_id=NULL |
| T17 | Search rồi click bài | CLICK log gắn searchId, docId, query server-side, timestamp |
| T18 | Mở bài qua trang chủ không search | không ghi CLICK log giả |
| T19 | Detail view | view counter/log cập nhật theo policy |
| T20 | HTML/XSS, SQL injection input, upload sai MIME | dữ liệu an toàn, request bị xử lý đúng |
| T21 | 80 seeded docs; seed lần 2 | count không tăng, không Lorem Ipsum, required fields đủ |
| T22 | Mobile viewport + dashboard role navigation | responsive, permission-aware UI |
| T23 | Fresh install: migrate -> seed -> dev -> build/test | chạy được từ README |
| T24 | Admin audit/system settings | xem logs và thay settings hợp lệ; user thường không truy cập |

Đề xuất tối thiểu **6 E2E flows:** register/login/profile, manager article lifecycle, search+click, comment+moderation, admin roles, SEO+analytics. Các ca RBAC tiêu cực phải test qua HTTP API, không chỉ qua UI.

---

## 12. Docs và deliverables

Phải nộp được:
1. Git repo chứa web, API, migrations, seed script, test, CI, `.env.example` (không secrets).
2. `README.md`: prerequisites, quick start, env variables, migrate+seed, accounts, features, commands, API paths, screenshots tùy chọn, troubleshoot.
3. `docs/ARCHITECTURE.md`: module graph, request flow, ERD (Mermaid được), lựa chọn trade-off.
4. `docs/API.md` hoặc OpenAPI: routes, request/response, role, lỗi.
5. `docs/REQUIREMENTS_TRACEABILITY.md`: rubric -> exact implemented file/API -> test -> PASS/FAIL.
6. `docs/PHASE2_HANDOFF.md`: schema `documents`, content_plain, taxonomy, search/click event definitions, field semantics, limitations; không triển khai search ranking Phase 2.
7. `docs/TEST_REPORT.md`: commands, results, edge cases, coverage/known issues.

---

## 13. Lệnh vận hành chuẩn (agent phải tạo và verify)

Lệnh thực tế có thể thay đổi chút ít theo package manager, nhưng **README phải chạy đúng**:

```bash
cp .env.example .env
# Điền database URL và demo passwords từ .env

docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev

# Cửa sổ terminal khác
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Không commit `.env`. Nếu local OS không hỗ trợ `cp`, README phải có hướng dẫn tương đương trên PowerShell: `Copy-Item .env.example .env`.

---

## 14. Định dạng agent báo cáo sau mỗi milestone

```text
Milestone: Mx — [Tên]
Status: PASS | PARTIAL | BLOCKED
Implemented:
- [Danh sách chức năng thực sự hoàn thành]
Changed files:
- [Danh sách file chính]
Verification:
- [Lệnh đã chạy -> kết quả, số tests pass/fail]
Acceptance:
- [ID test và bằng chứng]
Known issues:
- [Không giấu lỗi]
Next:
- [Milestone tiếp theo]
```

**Agent rules:**
- Trước khi sửa, đọc code hiện hữu, dependency, scripts, migrations; bảo toàn dữ liệu/branch người dùng.
- Không cài dependency hoặc đổi stack vô cớ; ưu tiên thư viện maintained phù hợp Node LTS.
- Không làm Phase 2; không tự mở rộng thành checkout/payment, AI model, recommender, full-text ranking; chỉ làm chức năng rubric.
- Không hardcode demo content cho UI; seed vào DB, frontend dùng API thật.
- Không tuyên bố pass nếu chưa chạy; khi bị chặn bởi môi trường, báo rõ blocker và lệnh để user kiểm chứng.
- Không thực hiện `git push`, deploy production hay thao tác có chi phí nếu chưa được yêu cầu.
- Với mọi tính năng: cập nhật schema/migration (nếu cần), endpoint, UI, authorization, test, docs trước khi đánh dấu xong.

---

## 15. Prompt giao việc cho coding agent

Copy nguyên đoạn sau vào Codex/Claude Code khi mở repo. Agent được quyền đọc `IMPLEMENTATION_PLAN.md` và `AGENTS.md`:

```text
Bạn là Senior Full-Stack Engineer chịu trách nhiệm triển khai Phase 1.
Đọc kỹ AGENTS.md và IMPLEMENTATION_PLAN.md trong repo trước khi sửa bất kỳ file nào.
Mục tiêu: thực hiện đúng mọi yêu cầu bắt buộc trong implementation plan cho News & Digital Magazine Portal.

Quy trình:
1) Audit repository hiện tại: liệt kê cấu trúc, trạng thái Git, scripts/dependencies, phần đã có; không ghi đè dữ liệu người dùng.
2) Làm tuần tự M0 -> M8. Ở mỗi milestone: lập checklist nhỏ, code hoàn chỉnh end-to-end, migrations/test, chạy kiểm thử, báo bằng chứng.
3) Không bỏ qua RBAC ở backend, UI chức năng admin, 80 seed documents, search-click logging, SEO dashboard, audit logs.
4) Tất cả trang lấy data từ API thật; ưu tiên đơn giản, bảo trì được, responsive; không fake functionality.
5) Không triển khai tokenization/inverted index/TF-IDF/BM25 trong Phase 1.
6) Sau mỗi milestone cập nhật docs/REQUIREMENTS_TRACEABILITY.md và báo PASS/PARTIAL/BLOCKED kèm commands/test results.
7) Nếu có quyết định nhỏ chưa được chỉ định, tự chọn phương án tối giản, an toàn, nhất quán và ghi vào docs/DECISIONS.md; không dừng chỉ để hỏi về chi tiết không quan trọng.
8) Không push/deploy production, không xóa file người dùng, không commit secrets.

Bắt đầu ngay bằng M0, sau đó tiếp tục triển khai theo thứ tự khi môi trường cho phép.
```

---

## 16. Ma trận phạm vi: Bắt buộc vs không yêu cầu

| Bắt buộc Phase 1 | Chỉ chuẩn bị / Phase 2 | Không tự thêm |
|---|---|---|
| Full Stack React + API + DB | Content plain text đủ sạch cho tokenize | E-commerce payment/cart |
| CRUD, RBAC, auth, admin | Search/click logs có liên kết | AI chatbot/recommendation |
| Comments, likes, ratings, mentions | Định nghĩa evaluation/feedback data | Semantic vector search |
| SQL ILIKE, filters, pagination | Indexable documents/tags/categories | TF-IDF/BM25/Inverted Index |
| 80 realistic seed docs | Phase 2 handoff docs | Push/deploy trả phí |
| SEO metadata, real analytics | Log CTR và behavioral data | OAuth/SSO chưa yêu cầu |

**Thành công cuối cùng:** Người chấm có thể vào web, sử dụng tài khoản theo từng role, thao tác tất cả chức năng thật, xem DB/API/logs và thấy rõ Phase 2 có thể tiếp tục trên cùng nền tảng.
