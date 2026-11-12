# Báo cáo kiểm thử

Báo cáo tổng hợp bằng chứng đã ghi nhận cho sản phẩm Phase 1. Các kết quả dưới đây được giữ từ báo cáo trước khi dọn tài liệu, không phải kết quả chạy lại trong lần chỉnh sửa tài liệu ngày 2026-11-12. Phạm vi từng trường hợp T01–T24 nằm trong [bảng đối chiếu yêu cầu](REQUIREMENTS_TRACEABILITY.md).

## Môi trường và phạm vi

- Windows, Node.js 24.x, PostgreSQL 18 chạy bằng công cụ local; Compose cấu hình PostgreSQL 17.
- API: Vitest và Supertest trên PostgreSQL thật. E2E: Playwright Chromium, gồm viewport mobile 390px.
- Database kiểm thử tách biệt, tên kết thúc `_test`; runner áp dụng migrations và seed. API và E2E chạy lần lượt.

## Kết quả đã ghi nhận

| Hạng mục | Lệnh hoặc phương pháp | Kết quả và thời điểm |
|---|---|---|
| Cài dependency sạch | `npm.cmd ci` trong thư mục cách ly chỉ chứa manifest/lock | PASS ngày 2026-10-31: 436 packages, audit không có lỗ hổng |
| Database mới và seed lặp | `npm.cmd run db:verify-fresh` | PASS ngày 2026-10-31: migrate → seed hai lần → validate → 17/17 API → 7/7 E2E → 17/17 API; database được giữ lại |
| Kiểm tra corpus | `npm.cmd run db:validate-seed` | PASS ngày 2026-10-31: 80 bài riêng biệt, 72 published, 4 danh mục, 12 thẻ, ít nhất 183 từ/bài; đủ trường bắt buộc và không tăng số lượng khi seed lại |
| API đầy đủ gần nhất | `npm.cmd test` | PASS ngày 2026-11-12: 10 files, 24/24 tests; lần chạy sau khi đổi cấu hình Vercel mất 7,32 giây |
| E2E đầy đủ gần nhất | `npm.cmd run test:e2e` | PASS ngày 2026-11-12 sau sửa startup Windows: 7/7 workflows, 15,5 giây |
| Kiểm tra mã và kiểu | `npm.cmd run lint`, `npm.cmd run typecheck` | PASS ngày 2026-11-12, gồm lần sửa dependency native cho frontend |
| Build toàn dự án | `npm.cmd run build` | PASS ngày 2026-11-12 sau sửa startup Windows |
| Build từng ứng dụng | `npm.cmd run build:api`, `npm.cmd run build:web` | PASS cục bộ ngày 2026-11-12; frontend được build lại sau sửa dependency native |
| Source đủ trong Git | Export Git index sang thư mục cách ly, liên kết dependency có sẵn, chạy `build:api` | PASS ngày 2026-11-12; gồm module upload, không dùng source ngoài Git; không phải cài dependency mới |
| Dependency cho Linux | `npm ci --include=dev --include=optional --os=linux --cpu=x64 --libc=glibc --ignore-scripts --no-audit` trong thư mục cách ly | PASS ngày 2026-11-12: có binary Oxide, Lightning CSS, esbuild, Rollup; Oxide native khớp 4.3.3. Chọn package Linux trên Windows, không thực thi Linux binary |
| Dev và bản API build | HTTP/browser smoke, chạy API compiled với cấu hình production và forwarded HTTPS | PASS cục bộ: dữ liệu thật, readiness 200, Secure cookie, API no-store; homepage có 10 bài và không tràn ngang mobile |
| Startup trùng cổng | Chạy lặp root/API/web khi API đang tải Prisma DLL | PASS ngày 2026-11-12: từ chối cổng bận, không EPERM, DLL không bị thay thế, ứng dụng ban đầu vẫn trả 200 |
| Docker Compose | `docker compose config --quiet` với biến kiểm tra không nhạy cảm | PASS kiểm tra cấu hình; Docker daemon không chạy trong môi trường xác minh |

Bảy luồng trình duyệt: đăng ký/đăng nhập/hồ sơ/đăng xuất; vòng đời bài viết; tìm kiếm và click; tương tác và kiểm duyệt; tài khoản/quyền/log/cài đặt; SEO và analytics; phân trang và điều hướng mobile theo quyền.

API bao phủ các trường hợp thiếu quyền, quyền sở hữu, thay đổi quyền ngay lập tức, bảo vệ Super Admin cuối cùng kể cả cập nhật đồng thời, CSRF, XSS, SQL injection, giới hạn tần suất, MIME/magic bytes/kích thước upload, ràng buộc database, seed lặp, logging và cấu hình cookie/proxy/readiness.

## Chạy lại

Sau khi cài đặt theo [README](../README.md) và bật database:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
npm.cmd run db:validate-seed
# Tuỳ chọn: xác minh trên database mới, giữ lại database để kiểm tra
npm.cmd run db:verify-fresh
```

## Giới hạn xác minh

- T01–T24 có bằng chứng PASS cục bộ; quy trình cài sạch/database rỗng được thực hiện ngày 2026-10-31, không lặp lại toàn bộ sau mỗi sửa cấu hình ngày 2026-11-12.
- Sau sửa dependency native Linux, đã chạy lint/typecheck/build frontend và kiểm tra cài package; không chạy lại API/E2E. Số lượng test trong bảng là bằng chứng lịch sử với phạm vi nêu rõ.
- Vercel/Render thực tế và GitHub Actions từ xa chưa được xác minh trong các lần chạy được ghi nhận. Cần thực hiện [checklist sau deploy](DEPLOYMENT.md#5-kiểm-tra-sau-deploy) trên môi trường hosting.
- Hai cảnh báo annotation của Rollup từ Zod không làm build thất bại.
- Upload dùng ổ đĩa local; rate limit theo bộ nhớ từng instance. Storage bền vững, backup, HTTPS/proxy, shared limiter và lịch dọn log thuộc vận hành hosting.
- View dùng bucket UTC 30 phút, không phải cửa sổ trượt; CTR là clicks/search và có thể vượt 100%. Lệnh dọn log mặc định chỉ xem trước; không có lịch tự chạy.

## Kiểm tra lần dọn tài liệu — 2026-11-12

Không thay đổi source, migrations, seed, tests, dependency hoặc cấu hình runtime. PASS: 17 liên kết/anchor nội bộ và 14 lệnh `npm run` trong README hợp lệ; không còn tham chiếu tới tài liệu đã xoá. Còn 7 file Markdown. Git diff chỉ gồm tài liệu và kiểm tra whitespace không báo lỗi. Không chạy lại build/API/E2E trong lần này vì chỉ sửa tài liệu và workspace chưa có `node_modules`.
