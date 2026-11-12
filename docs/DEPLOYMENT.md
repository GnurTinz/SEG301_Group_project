# Deploy frontend lên Vercel, API lên Render

Giữ nguyên React/Vite, Express, PostgreSQL/Prisma và cookie session. Hai dịch vụ cùng lấy code từ repository GitHub này. Chỉ tạo cấu hình trong repo không tự tạo dịch vụ hay phát sinh phí.

```text
Browser → https://your-project.vercel.app
           /assets, /covers, React routes → frontend
           /api/*, /uploads/*, /health/* → https://your-api.onrender.com
                                                    → PostgreSQL
```

Frontend luôn gọi `/api/v1` trên domain Vercel. Cookie HttpOnly/Secure/SameSite=Lax thuộc domain frontend, không có Domain attribute. Không cần `VITE_API_URL` hoặc đổi sang cookie bên thứ ba. API trả `Cache-Control: no-store` vì phiên đăng nhập, search và view cần xử lý trên server ở mỗi request.

## 1. Chuẩn bị PostgreSQL

Tạo PostgreSQL trên Render hoặc dùng PostgreSQL hiện có. Nếu API và database cùng Render, chọn cùng region và dùng **Internal Database URL**. Dùng URL do nhà cung cấp cấp đầy đủ; giữ cấu hình TLS của họ khi kết nối bên ngoài. Hỗ trợ cả `postgres://` và `postgresql://`.

Không dùng database chứa dữ liệu thật để chạy `npm test`: test cần database riêng có tên kết thúc `_test`.

## 2. Backend trên Render

Chọn **New → Blueprint**, kết nối repo và dùng `render.yaml`. Blueprint tạo Web Service với `plan: free`, không tự tạo database hoặc ổ đĩa trả phí. Điền biến môi trường khi Render yêu cầu. Có thể chọn **New → Web Service** và nhập cấu hình tương đương:

| Cài đặt | Giá trị |
|---|---|
| Branch | `main` |
| Runtime | Node |
| Root Directory | Để trống (repo root) |
| Build Command | `npm ci --include=dev && npm run build:api` |
| Start Command | `npm run start:render` |
| Health Check Path | `/health/ready` |

| Biến trên Render | Giá trị |
|---|---|
| `NODE_VERSION` | `24` |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `TRUST_PROXY` | `1` (TLS proxy trước Express trên Render) |
| `WEB_ORIGIN` | `https://your-project.vercel.app` — domain frontend chính xác, không `/` ở cuối |
| `DATABASE_URL` | PostgreSQL connection URL |
| `SESSION_SECRET` | Chuỗi ngẫu nhiên ít nhất 32 ký tự; Blueprint tự sinh |
| `DEMO_PASSWORD` | Mật khẩu tự đặt 12–128 ký tự để tạo 5 tài khoản demo |
| `UPLOAD_DIR` | `/opt/render/project/src/storage/uploads` |

Không tự đặt `PORT`: API đọc port do Render cấp. `npm ci --include=dev` cần thiết vì compiler và Prisma CLI nằm trong devDependencies. `build:api` tạo Prisma Client rồi biên dịch API, bao gồm seed đã biên dịch.

`start:render` lần lượt chạy migration đã commit, seed idempotent rồi khởi động API. Không dùng `migrate dev`, `db push`, reset hoặc drop database. Thứ tự này dùng được cho Web Service free không có pre-deploy command. Chỉ chạy một instance với cấu hình này; khi triển khai nhiều instance, chuyển migration/seed sang một release job trước khi mở traffic. Seed bảo toàn mật khẩu, bài viết, role và permission đã tồn tại. `DEMO_PASSWORD` chỉ đặt mật khẩu cho tài khoản mới.

Kiểm tra `https://your-api.onrender.com/health/ready` trả `{ "data": { "status": "ready" } }`. `/health` chỉ kiểm tra process; `/health/ready` kiểm tra kết nối database, trả 503 khi lỗi và không lộ connection URL.

## 3. Frontend trên Vercel

Import **cùng repo GitHub**, chọn Node.js **24.x** và **Root Directory là repo root** (không chọn `apps/web`). `vercel.ts` tự cấu hình:

| Cài đặt | Giá trị |
|---|---|
| Framework | Vite |
| Install Command | `npm ci --include=dev` |
| Build Command | `npm run build:web` |
| Output Directory | `apps/web/dist` |

Trong Environment Variables, thêm **`RENDER_API_ORIGIN=https://your-api.onrender.com`** cho Production. Không có `/api`, credentials, query hoặc path trong URL. `vercel.ts` đọc biến này trước build để tạo rewrites, không cần sửa URL trong source. Không đưa `DATABASE_URL`, `SESSION_SECRET` hoặc `DEMO_PASSWORD` lên Vercel. Build frontend không cần database hoặc Prisma Client.

Deploy frontend, sau đó đặt lại `WEB_ORIGIN` trên Render bằng domain Vercel thực tế nếu trước đó dùng tên dự kiến, rồi redeploy Render. Thay biến Vercel cần redeploy Vercel. Nếu đổi sang custom domain, cập nhật `WEB_ORIGIN` cho khớp origin người dùng truy cập.

SPA fallback hỗ trợ mở trực tiếp hoặc refresh `/login`, `/articles/:slug`, `/admin/...`. `/api`, `/uploads`, `/health`, `/assets` và `/covers` không bị fallback thành HTML. API không được cache bởi Vercel.

**Preview deployments:** backend chỉ cho phép một `WEB_ORIGIN` chính xác. Dùng deployment Production/domain đã cấu hình để kiểm tra mutation. Preview có domain khác cần API/database riêng và `WEB_ORIGIN` tương ứng; không mở allowlist wildcard `*.vercel.app` dùng chung phiên production.

## 4. Ảnh upload và storage

Ảnh seed `/covers/*.svg` được version trong Git và phục vụ trên Vercel. Ảnh upload mới trả URL tương đối `/uploads/...`, Vercel chuyển tiếp sang Render.

Filesystem của Web Service free là tạm thời: **ảnh upload mới sẽ mất khi restart/redeploy**, dù URL vẫn còn trong PostgreSQL. Để giữ ảnh, chủ dịch vụ cần chọn gói hỗ trợ persistent disk và gắn disk tại `/opt/render/project/src/storage`, hoặc triển khai object storage adapter theo kế hoạch Phase 1. Chỉ đổi `UPLOAD_DIR` không tạo persistent storage. Blueprint mặc định không cấp tài nguyên trả phí. Không dùng free filesystem để lưu lâu dài ảnh quan trọng.

Database phải được lưu trữ/backup độc lập. Session nằm trong PostgreSQL nên vẫn tồn tại khi API restart nếu `SESSION_SECRET` giữ nguyên. Rate limit hiện dùng memory theo instance; hosting nhiều instance cần shared limiter. Kiểm tra chính sách ngủ/giới hạn của gói đang sử dụng trước buổi demo.

## 5. Kiểm tra sau deploy

1. Mở `/`, vào trang 2, mở bài và refresh trang chi tiết: nội dung tải từ database.
2. Truy cập `/health/ready` qua domain Vercel: JSON ready, không phải HTML.
3. Đăng nhập `user@demo.local` bằng `DEMO_PASSWORD` của Render; refresh vẫn đăng nhập; đăng xuất rồi không còn truy cập `/profile`.
4. Tìm kiếm, click một kết quả; đăng nhập SEO/Admin xem analytics tăng thật.
5. Manager tạo draft → publish → guest thấy → unpublish → guest không thấy. Upload ảnh, kiểm tra URL `/uploads/...` qua domain Vercel.
6. DevTools: request gửi đến domain Vercel; session cookie có HttpOnly, Secure, SameSite=Lax; API response có `Cache-Control: no-store`.

Nếu login không giữ phiên: kiểm tra `NODE_ENV=production`, `TRUST_PROXY=1`, HTTPS và cookie trong browser. Nếu mutation trả `CSRF_ORIGIN`: so sánh `Origin` thực tế với `WEB_ORIGIN`, kể cả custom domain. Nếu API trả HTML: kiểm tra Root Directory và rewrites trong `vercel.ts`. Nếu readiness 503: kiểm tra database/SSL/network, migration và log Render. Không đăng secrets vào issue/log công khai.

## 6. GitHub và cập nhật về sau

Commit cả source/config/docs cần thiết và `package-lock.json` khi dependency thay đổi. `.env`, `.vercel`, `.local`, upload và build output được ignore. Trước push chạy:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
# Sau khi stage các file dự định commit:
node scripts/check-staged.mjs
git diff --cached --check
```

Kết nối Render/Vercel với Git provider repository và branch `main` để các commit tiếp theo kích hoạt build theo cài đặt auto-deploy của từng dịch vụ. Không lưu production secrets trong GitHub repository; nhập trên dashboard của nhà cung cấp.

Tham chiếu: [Vercel programmatic configuration](https://vercel.com/docs/project-configuration/vercel-ts), [Vercel external rewrites/caching](https://vercel.com/docs/routing/rewrites), [Render Web Services](https://render.com/docs/web-services), [Render Blueprint specification](https://render.com/docs/blueprint-spec), [Render persistent disks](https://render.com/docs/disks).

Nếu build commit `5c4a098` báo `TS2307` thiếu `./modules/uploads/routes.js`, chọn **Manual Deploy → Deploy latest commit** sau khi lấy bản sửa mới trên `main`. Nguyên nhân là quy tắc ignore cũ loại nhầm thư mục source upload. Module nay được version trong Git; chỉ các thư mục chứa ảnh runtime bị ignore. Giữ nguyên Build/Start Command và biến môi trường, không cần tự tạo file `.js` hoặc đổi import TypeScript.
