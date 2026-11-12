# Điểm Mới — News & Digital Magazine Portal

Cổng tin tức và tạp chí điện tử về AI, khoa học và công nghệ, thuộc đồ án SEG301 — Phase 1. Giao diện tiếng Việt, dữ liệu được lưu trong PostgreSQL và truy cập qua REST API.

## Chức năng

- Đọc bài viết, lọc theo danh mục, thẻ, ngày đăng và phân trang; tìm kiếm bằng PostgreSQL `ILIKE`.
- Đăng ký, đăng nhập, chỉnh sửa hồ sơ; bình luận, trả lời, mention `@username`, thích, đánh giá 1–5 và báo cáo nội dung.
- Quản lý bài viết nháp/xuất bản/gỡ xuất bản, danh mục, thẻ và ảnh bìa; kiểm duyệt bình luận và báo cáo.
- Chỉnh sửa metadata SEO; thống kê lượt xem, tìm kiếm và click từ dữ liệu hoạt động thực tế.
- Quản lý tài khoản, vai trò, quyền, nhật ký và cài đặt. Backend kiểm tra quyền và quyền sở hữu trên từng yêu cầu.

Seed gồm 80 bài viết giáo dục tiếng Việt riêng biệt: 72 bài đã xuất bản, 8 bài nháp hoặc gỡ xuất bản; 4 danh mục, 12 thẻ, ảnh minh hoạ và dữ liệu tương tác demo. Phase 1 chỉ dùng SQL `ILIKE`; phần lập chỉ mục và xếp hạng tìm kiếm dành cho Phase 2.

## Công nghệ và cấu trúc

React, TypeScript, Vite, React Router, TanStack Query và Tailwind CSS ở frontend; Express, Zod, Prisma và PostgreSQL ở backend. Xác thực bằng cookie session lưu trong PostgreSQL, mật khẩu băm Argon2id, mutation được bảo vệ bằng CSRF.

```text
apps/web/              Giao diện React và ảnh minh hoạ
apps/api/src/          REST API, xác thực, RBAC và các module nghiệp vụ
apps/api/prisma/       Schema, SQL migrations và seed
apps/api/tests/        Kiểm thử API, bảo mật và cấu hình
packages/shared/      Hằng số vai trò và quyền dùng chung
tests/e2e/             Kiểm thử trình duyệt Playwright
scripts/               Công cụ chạy local, kiểm thử và bảo trì
docs/                  Tài liệu kiến trúc, API, vận hành và bàn giao
.github/workflows/     Cấu hình CI
```

## Chạy trên máy cá nhân

Yêu cầu: Node.js **24.x**, npm và PostgreSQL. Có thể dùng Docker Compose với PostgreSQL 17 trong repository hoặc máy chủ PostgreSQL sẵn có. Chạy các lệnh từ thư mục gốc dự án.

### Dùng Docker Compose

```powershell
Copy-Item .env.example .env
```

Điền các biến trong `.env` trước khi chạy:

| Biến | Cấu hình |
|---|---|
| `DATABASE_URL` | URL PostgreSQL; với Compose dùng cổng `5432`, thông tin khớp `POSTGRES_*` |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Tài khoản và database khởi tạo bởi Compose; thay giá trị `CHANGE_ME` |
| `SESSION_SECRET` | Chuỗi ngẫu nhiên ít nhất 32 ký tự; thay giá trị `REPLACE_...` |
| `DEMO_PASSWORD` | Mật khẩu tự đặt, 12–128 ký tự, dùng cho tài khoản demo mới |
| `WEB_ORIGIN` | Local: `http://localhost:5173`; origin chính xác, không có dấu `/` cuối |
| `NODE_ENV` | `development` khi chạy local, `production` khi chạy bản build trên hosting |
| `HOST`, `PORT`, `TRUST_PROXY` | Local mặc định `0.0.0.0`, `3001`, `0`; Render dùng proxy trust `1` và port do dịch vụ cấp |
| `UPLOAD_DIR` | Thư mục ảnh upload; mặc định `uploads`, tính từ thư mục làm việc của API |
| `TEST_DATABASE_URL` | Tuỳ chọn: URL database kiểm thử riêng, tên kết thúc bằng `_test` |

Không đưa `.env` vào Git. Nếu mật khẩu database chứa ký tự đặc biệt, mã hoá phần mật khẩu trong connection URL.

```powershell
npm.cmd ci
docker compose up -d --wait
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

Mở **http://localhost:5173**. API chạy tại `http://127.0.0.1:3001`, prefix `/api/v1`; Vite proxy `/api`, `/uploads` và `/health` sang API. Trên Linux/macOS, dùng `cp .env.example .env` và `npm` thay cho `npm.cmd`.

### Khi không dùng Docker

Sau `npm.cmd ci`, chạy `npm.cmd run db:local` để mở PostgreSQL thật tại `127.0.0.1:55432`. Giữ terminal này chạy; dữ liệu nằm trong `.local/pgdata`.

Nếu chưa có `.env`, công cụ tự tạo file với thông tin kết nối và mật khẩu ngẫu nhiên. Nếu `.env` đã tồn tại, công cụ giữ nguyên file: cần sửa `DATABASE_URL` cho đúng cổng `55432`, user `portal`, database `portal` và mật khẩu trong `.local/postgres.json`. Các file này được Git ignore.

Trong terminal thứ hai, chạy `db:generate`, `db:migrate`, `db:seed`, rồi `dev` như trên. Những lần sau chỉ cần bật lại database và chạy `npm.cmd run dev`.

## Tài khoản demo và các trang chính

Sau khi seed, đăng nhập tại `/login` bằng email bên dưới và **`DEMO_PASSWORD` trong `.env` của chính bạn**. Tất cả tài khoản demo mới dùng chung giá trị này; repository không chứa mật khẩu đăng nhập cố định.

| Vai trò | Email | Trang sử dụng chính |
|---|---|---|
| Super Admin | `admin@demo.local` | `/admin/users`, `/admin/roles`, `/admin/logs`, `/admin/settings` và toàn bộ chức năng quản trị |
| Content Manager | `manager@demo.local` | `/admin/articles`, `/admin/taxonomy` |
| Moderator | `moderator@demo.local` | `/admin/moderation` |
| SEO Specialist | `seo@demo.local` | `/admin/seo`, `/admin/analytics` |
| User | `user@demo.local` | `/profile`, tương tác tại `/articles/:slug` |

Khách đọc bài ở `/`, tìm kiếm ở `/search`, xem hồ sơ công khai ở `/users/:username`. Đăng ký tại `/register` chỉ tạo vai trò `USER`. Các tài khoản có quyền quản trị truy cập từ `/admin`.

Seed chạy lại không tạo trùng và giữ nguyên bài viết, mật khẩu, vai trò và quyền đã có. Thay `DEMO_PASSWORD` rồi seed lại **không đổi mật khẩu tài khoản cũ**. Đối với website đã host, tài khoản phụ thuộc database và cấu hình trên hosting.

## Kiểm thử và lệnh vận hành

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
npm.cmd run db:validate-seed
```

API và E2E dùng database riêng, mặc định `portal_test` trên cùng máy chủ với `DATABASE_URL`, hoặc database từ `TEST_DATABASE_URL`. Runner tạo database nếu thiếu, áp dụng migrations và seed; tài khoản database cần quyền `CREATEDB`, hoặc người vận hành tạo database trước. Chạy hai bộ kiểm thử lần lượt khi dùng chung database; không trỏ chúng vào dữ liệu cần giữ.

| Lệnh bổ sung | Mục đích |
|---|---|
| `npm.cmd run build:api` | Sinh Prisma Client và build API độc lập |
| `npm.cmd run build:web` | Build frontend độc lập, không cần database |
| `npm.cmd start` | Chạy API đã build; frontend build nằm tại `apps/web/dist` |
| `npm.cmd run db:verify-fresh` | Tạo database kiểm thử mới, migrate, seed hai lần, validate và chạy API/E2E/API; giữ database để kiểm tra |
| `npm.cmd run logs:prune` | Xem trước số log quá hạn theo `logRetentionDays`; thêm `-- --apply` khi chủ động xoá log |

Kết quả kiểm thử đã ghi nhận và giới hạn xác minh nằm trong [báo cáo kiểm thử](docs/TEST_REPORT.md); ánh xạ T01–T24 nằm trong [bảng đối chiếu yêu cầu](docs/REQUIREMENTS_TRACEABILITY.md).

## Hosting và xử lý lỗi

Repository có `vercel.json` cho frontend và `render.yaml` cho API. Cả hai build từ thư mục gốc. Vercel proxy API/uploads/health tới `https://seg301-group-project.onrender.com`; đổi backend cần sửa ba destination trong `vercel.json`. Frontend không cần biến môi trường riêng. Cấu hình database, secrets, HTTPS origin, lưu trữ ảnh và kiểm tra sau khi host được mô tả trong [hướng dẫn Vercel + Render](docs/DEPLOYMENT.md).

- PowerShell chặn `npm.ps1`: dùng `npm.cmd` như các ví dụ trên.
- Lỗi kết nối database: kiểm tra PostgreSQL đang chạy và `DATABASE_URL` đúng cổng/tài khoản. Giữ terminal `db:local` mở nếu dùng công cụ này.
- Lỗi Prisma Client chưa khởi tạo: dừng API rồi chạy lại `npm.cmd run dev`; bước chuẩn bị tự sinh client khi thiếu hoặc thay đổi. Có thể chạy riêng `npm.cmd run db:generate` sau khi dừng API.
- Lỗi `EPERM` ở Prisma DLL hoặc cổng đã dùng: dừng phiên `dev` trước bằng Ctrl+C. Công cụ tái sử dụng client còn hợp lệ và từ chối cổng bị chiếm; Vite cố định cổng `5173` để khớp `WEB_ORIGIN`.
- Upload chỉ nhận JPEG/PNG/WebP tối đa 5 MB. Ảnh upload lưu trên ổ đĩa local; filesystem tạm thời của hosting không bảo đảm giữ ảnh qua restart/redeploy. Cần storage bền vững nếu sử dụng lâu dài.

## Tài liệu dự án

| Tài liệu | Nội dung |
|---|---|
| [Kiến trúc](docs/ARCHITECTURE.md) | Luồng xử lý, ERD và các quy tắc kỹ thuật |
| [REST API](docs/API.md) | Endpoint, payload, quyền và mã lỗi |
| [Vận hành hosting](docs/DEPLOYMENT.md) | Vercel, Render, PostgreSQL và lưu trữ ảnh |
| [Đối chiếu yêu cầu](docs/REQUIREMENTS_TRACEABILITY.md) | T01–T24, source và kiểm thử tương ứng |
| [Báo cáo kiểm thử](docs/TEST_REPORT.md) | Kết quả đã ghi nhận, lệnh chạy và giới hạn |
| [Bàn giao Phase 2](docs/PHASE2_HANDOFF.md) | Schema, dữ liệu nội dung và ý nghĩa search/click logs |
