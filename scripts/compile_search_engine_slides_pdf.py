import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Điểm Mới — Search Engine Document Store & Logging | SEG301 ĐH FPT</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0B1120;
      color: #F8FAFC;
    }

    .slide {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 3rem 4.5rem;
      position: relative;
      background: #0F172A;
      border-bottom: 2px solid #1E293B;
      page-break-after: always;
      overflow: hidden;
    }

    .badge {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #0EA5E9;
      background: #1E293B;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      border: 1px solid #334155;
      margin-bottom: 0.6rem;
    }

    .slide-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: -0.02em;
    }

    .divider {
      width: 100%;
      height: 2px;
      background: #1E293B;
      margin: 1rem 0 1.5rem 0;
    }

    .slide-body {
      flex: 1;
      display: grid;
      gap: 1.5rem;
    }

    .grid-2 { grid-template-columns: 1fr 1fr; }
    .grid-3 { grid-template-columns: 1fr 1fr 1fr; }

    .card {
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    .card.blue { border-left: 4px solid #3B82F6; }
    .card.cyan { border-left: 4px solid #0EA5E9; }
    .card.green { border-left: 4px solid #10B981; }
    .card.amber { border-left: 4px solid #F59E0B; }

    .card-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #38BDF8;
      margin-bottom: 0.85rem;
    }

    .card-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .card-list li {
      font-size: 0.95rem;
      line-height: 1.55;
      color: #CBD5E1;
      position: relative;
      padding-left: 1.25rem;
    }

    .card-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #38BDF8;
      font-weight: bold;
    }

    .card-list li strong {
      color: #F8FAFC;
    }

    .stat-number {
      font-size: 2.6rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 0.4rem;
    }
    .stat-blue { color: #38BDF8; }
    .stat-green { color: #34D399; }
    .stat-amber { color: #FBBF24; }
    .stat-purple { color: #A78BFA; }

    .stat-label {
      font-size: 0.85rem;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      font-size: 0.85rem;
      color: #64748B;
      border-top: 1px solid #1E293B;
    }

    @media print {
      body { background: #0F172A; }
      .slide {
        page-break-after: always;
        height: 100vh;
        width: 100vw;
        border: none;
      }
    }
  </style>
</head>
<body>

  <!-- Slide 1: Title -->
  <div class="slide" style="justify-content: center; background: radial-gradient(circle at 80% 20%, #1E3A8A 0%, #0F172A 70%);">
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <div class="badge" style="width: fit-content;">ĐẠI HỌC FPT • MÔN HỌC: SEG301 (SEARCH ENGINE TECHNOLOGIES)</div>
      <h1 style="font-size: 3.8rem; font-weight: 800; color: #FFFFFF; letter-spacing: -0.03em; margin-bottom: 0.4rem;">
        ĐIỂM MỚI
      </h1>
      <h2 style="font-size: 1.6rem; font-weight: 600; color: #38BDF8; margin-bottom: 1.2rem;">
        News & Digital Magazine Portal — Search Engine Document Store & Interaction Logging
      </h2>
      <p style="font-size: 1.1rem; color: #94A3B8; max-width: 950px; line-height: 1.6; margin-bottom: 2rem;">
        Đồ án Phase 1: Xây dựng nền tảng ứng dụng Full-Stack, thiết kế kho lưu trữ tài liệu (Document Store) chuẩn hóa và hệ thống ghi vết tương tác (Search & Click Logging) sẵn sàng cho các thuật toán Search Engine Phase 2.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div class="card blue">
          <div class="card-title">THÀNH VIÊN THỰC HIỆN</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #F8FAFC; margin-bottom: 0.2rem;">
            Trần Trung Tín <span style="font-size: 0.95rem; font-weight: normal; color: #38BDF8;">(MSSV: SE201619)</span>
          </div>
          <div style="font-size: 0.9rem; color: #94A3B8; margin-bottom: 0.8rem;">
            Backend Architecture, Document Store, Logging API & Vitest Suites
          </div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #F8FAFC; margin-bottom: 0.2rem;">
            Võ Hiếu Thắng <span style="font-size: 0.95rem; font-weight: normal; color: #38BDF8;">(MSSV: SE200932)</span>
          </div>
          <div style="font-size: 0.9rem; color: #94A3B8;">
            Frontend Web UI, UX Search & Filtering, Playwright E2E & Seed Corpus
          </div>
        </div>

        <div class="card cyan">
          <div class="card-title">THÔNG TIN HỌC THUẬT & HỆ THỐNG</div>
          <ul class="card-list">
            <li><strong>Môn học:</strong> SEG301 — Search Engine Technologies (FA26)</li>
            <li><strong>Đơn vị đào tạo:</strong> Trường Đại học FPT (FPT University)</li>
            <li><strong>Công nghệ nền tảng:</strong> React 18, Node.js/Express, PostgreSQL 18, Prisma ORM</li>
            <li><strong>Trọng tâm môn học:</strong> Document Data Store, Search/Click Logs, ILIKE search, 80 bài seed thật</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal — SEG301 Final Project Defense</span>
      <span>Slide 1 / 12</span>
    </div>
  </div>

  <!-- Slide 2: Objectives -->
  <div class="slide">
    <div>
      <div class="badge">Mục tiêu dự án</div>
      <div class="slide-title">Mục Tiêu Đồ Án: Phase 1 & Chuẩn Bị Cho Search Engine Phase 2</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card blue">
        <div class="card-title">1. Mục Tiêu Ngắn Hạn (Phase 1 Baseline)</div>
        <ul class="card-list">
          <li><strong>Ứng dụng Full-Stack hoàn chỉnh:</strong> Đầy đủ CRUD bài viết, quản lý danh mục, thẻ phân loại, và bình luận.</li>
          <li><strong>Xác thực & Bảo mật:</strong> Đăng ký, đăng nhập session với cookie HttpOnly, mã hóa mật khẩu Argon2id.</li>
          <li><strong>Phân quyền RBAC 5 vai trò:</strong> Super Admin, Content Manager, Moderator, Data & SEO Specialist, Regular User.</li>
          <li><strong>Tìm kiếm cơ sở (Baseline):</strong> Tìm kiếm từ khóa bằng SQL ILIKE có escape ký tự wildcard chống injection.</li>
        </ul>
      </div>

      <div class="card cyan">
        <div class="card-title">2. Trọng Tâm Chuẩn Bị Cho Search Engine (Phase 2 Prep)</div>
        <ul class="card-list">
          <li><strong>Document Data Store chuẩn hóa:</strong> Lưu song song HTML hiển thị và văn bản thuần (<code>content_plain</code>) đã bóc tách sạch thẻ HTML để làm đầu vào cho Tokenizer tách từ.</li>
          <li><strong>Thu thập Interaction Telemetry:</strong> Xây dựng bảng <code>search_click_logs</code> theo đúng chuẩn (User ID, Query, Clicked Doc, Timestamp, Position) phục vụ xếp hạng BM25 / TF-IDF.</li>
          <li><strong>Dữ liệu huấn luyện sạch:</strong> Nạp sẵn 80 bài viết tiếng Việt chuyên sâu về AI & Khoa học, tuyệt đối không dùng placeholder "Lorem Ipsum".</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 2 / 12</span>
    </div>
  </div>

  <!-- Slide 3: Architecture -->
  <div class="slide">
    <div>
      <div class="badge">Kiến trúc hệ thống</div>
      <div class="slide-title">Kiến Trúc Tổng Thể Ứng Dụng (Full-Stack Topology)</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-3">
      <div class="card blue">
        <div class="card-title">Tầng Trình Diễn (Frontend SPA)</div>
        <ul class="card-list">
          <li><strong>React 18 + Vite:</strong> Hiệu năng cao, tải trang nhanh chóng.</li>
          <li><strong>TanStack Query v5:</strong> Quản lý cache và trạng thái tìm kiếm bất đồng bộ mượt mà.</li>
          <li><strong>Tailwind CSS:</strong> Giao diện Responsive tối ưu, kiểm thử đạt chuẩn trên mobile 390px.</li>
          <li><strong>Same-Origin Proxy:</strong> Giao tiếp API qua proxy Vite/Vercel, loại bỏ hoàn toàn lỗi CORS.</li>
        </ul>
      </div>

      <div class="card cyan">
        <div class="card-title">Tầng Cổng & Bảo Mật (API Gateway)</div>
        <ul class="card-list">
          <li><strong>Express 4 RESTful API:</strong> Kiến trúc module hóa phân tầng.</li>
          <li><strong>Double-Submit CSRF:</strong> Khóa token bảo vệ mọi thao tác mutation.</li>
          <li><strong>Rate Limiter:</strong> Giới hạn 100 req/min chống brute-force và bot cào bài.</li>
          <li><strong>Zod Schema:</strong> Xác thực kiểu dữ liệu đầu vào và escape ký tự tìm kiếm.</li>
        </ul>
      </div>

      <div class="card green">
        <div class="card-title">Tầng Lưu Trữ (Document Store)</div>
        <ul class="card-list">
          <li><strong>PostgreSQL 18 + Prisma ORM:</strong> 14 bảng quan hệ chuẩn hóa.</li>
          <li><strong>Bảng documents:</strong> Lưu trữ text thuần cho Search Engine.</li>
          <li><strong>Bảng search_click_logs:</strong> Ghi vết tìm kiếm & click.</li>
          <li><strong>Advisory Locks:</strong> Bảo vệ Admin cuối cùng bằng khóa cấp transaction.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 3 / 12</span>
    </div>
  </div>

  <!-- Slide 4: RBAC -->
  <div class="slide">
    <div>
      <div class="badge">Quản trị & Phân quyền</div>
      <div class="slide-title">Phân Quyền Người Dùng (Role-Based Access Control - RBAC)</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body" style="display: flex; flex-direction: column; gap: 0.65rem;">
      <div class="card amber" style="padding: 0.9rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #FBBF24; font-size: 1.1rem; width: 220px;">Super Admin</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Quản lý toàn diện tài khoản, vai trò, ma trận phân quyền động, nhật ký hệ thống (audit logs) và cài đặt chung. Được bảo vệ bởi PostgreSQL Advisory Lock chống mất admin cuối cùng.
          </span>
        </div>
      </div>

      <div class="card blue" style="padding: 0.9rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #38BDF8; font-size: 1.1rem; width: 220px;">Content Manager</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Toàn quyền CRUD nội dung bài viết, chuyển đổi trạng thái xuất bản (DRAFT / PUBLISHED / UNPUBLISHED), quản lý danh mục và gắn thẻ phân loại tài liệu.
          </span>
        </div>
      </div>

      <div class="card cyan" style="padding: 0.9rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #0EA5E9; font-size: 1.1rem; width: 220px;">Moderator</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Kiểm duyệt nội dung người dùng: Tiếp nhận và xử lý hàng đợi báo cáo vi phạm (reports), ẩn/khôi phục bình luận độc hại, kiểm soát spam.
          </span>
        </div>
      </div>

      <div class="card green" style="padding: 0.9rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #34D399; font-size: 1.1rem; width: 220px;">Data & SEO Specialist</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Cấu hình metadata SEO (tiêu đề SEO, mô tả meta, từ khóa keywords, alt ảnh) và theo dõi dashboard phân tích từ khóa tìm kiếm & tỷ lệ click (CTR).
          </span>
        </div>
      </div>

      <div class="card" style="padding: 0.9rem 1.25rem; border-left: 4px solid #94A3B8;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #F8FAFC; font-size: 1.1rem; width: 220px;">Regular User</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Độc giả công khai: Đăng ký tài khoản, đăng nhập, đọc bài viết, bình luận phân cấp, mention @username, đánh giá 1-5 sao và thích bài viết.
          </span>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 4 / 12</span>
    </div>
  </div>

  <!-- Slide 5: Document Data Store -->
  <div class="slide">
    <div>
      <div class="badge">Trọng tâm Search Engine</div>
      <div class="slide-title">Thiết Kế Kho Lưu Trữ Tài Liệu (Document Data Store)</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card cyan">
        <div class="card-title">Cấu Trúc Bảng Documents (Chuẩn Bị Cho Phase 2)</div>
        <ul class="card-list">
          <li><strong>id:</strong> Mã UUID định danh duy nhất của tài liệu trong tập chỉ mục.</li>
          <li><strong>title:</strong> Tiêu đề bài viết — trường có trọng số relevance cao nhất khi chấm điểm BM25.</li>
          <li><strong>content & content_plain:</strong> Lưu song song HTML để render và văn bản thuần (<code>content_plain</code>) đã bóc tách sạch thẻ HTML để làm đầu vào trực tiếp cho Tokenizer tách từ.</li>
          <li><strong>summary:</strong> Đoạn trích tóm tắt phục vụ hiển thị kết quả tìm kiếm (Search Snippet).</li>
          <li><strong>category_id & tags:</strong> Phân loại đa chiều phục vụ lọc kết hợp (Faceted Search).</li>
          <li><strong>author & created_at:</strong> Thuộc tính thời gian phục vụ lọc ngày và chấm điểm độ mới (Recency).</li>
          <li><strong>views_count:</strong> Lượt xem thực tế, tín hiệu độ phổ biến (Popularity signal).</li>
        </ul>
      </div>

      <div class="card blue">
        <div class="card-title">Ý Nghĩa Đối Với Giải Thuật Search Engine</div>
        <ul class="card-list">
          <li><strong>Sẵn sàng cho Inverted Index:</strong> Trường <code>content_plain</code> không chứa thẻ script hay mã HTML thừa, giúp quá trình quét văn bản và lập chỉ mục đảo diễn ra tức thì trong Phase 2.</li>
          <li><strong>Hỗ trợ tính độ dài tài liệu (|D|):</strong> Mỗi tài liệu có độ dài từ được xác định chính xác từ <code>content_plain</code>, phục vụ trực tiếp công thức tính độ dài trung bình tài liệu (avgdl) trong BM25.</li>
          <li><strong>Chỉ mục B-tree tối ưu:</strong> Thiết lập chỉ mục trên <code>[status, published_at DESC]</code> và <code>[categoryId, status]</code> giúp tìm kiếm lọc cực nhanh.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 5 / 12</span>
    </div>
  </div>

  <!-- Slide 6: Baseline Search & Filtering -->
  <div class="slide">
    <div>
      <div class="badge">Trọng tâm Search Engine</div>
      <div class="slide-title">Cơ Chế Tìm Kiếm Cơ Bản & Bộ Lọc (Phase 1 Baseline)</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card blue">
        <div class="card-title">Giải Thuật Tìm Kiếm SQL ILIKE An Toàn</div>
        <ul class="card-list">
          <li><strong>So khớp không phân biệt hoa thường:</strong> Dùng toán tử <code>ILIKE</code> của PostgreSQL trên 3 trường: <code>title</code>, <code>summary</code> và <code>contentPlain</code>.</li>
          <li><strong>Cơ chế Escape ký tự đại diện:</strong> Các ký tự '%' và '_' trong chuỗi tìm kiếm được tự động escape bằng regex, ngăn chặn hoàn toàn tấn công DoS và SQL injection.</li>
          <li><strong>Bảo vệ quyền riêng tư:</strong> Tìm kiếm chỉ áp dụng trên bài viết <code>status = 'PUBLISHED'</code> và <code>deleted_at IS NULL</code>. Bài nháp hoặc bài đã gỡ trả về 404.</li>
        </ul>
      </div>

      <div class="card cyan">
        <div class="card-title">Bộ Lọc Đa Tiêu Chí (Faceted Filtering)</div>
        <ul class="card-list">
          <li><strong>Lọc theo Danh mục (Category):</strong> Thu hẹp không gian tìm kiếm vào các chủ đề chính (Trí tuệ nhân tạo, Khoa học máy tính, Kỹ thuật phần mềm, An toàn thông tin).</li>
          <li><strong>Lọc theo Thẻ (Tag):</strong> Lọc sâu theo công nghệ cụ thể (vd: Deep Learning, LLM, Cloud, Microservices).</li>
          <li><strong>Lọc theo Khoảng ngày (Date Range):</strong> Tìm kiếm bài viết xuất bản từ ngày A đến ngày B bằng toán tử gte/lte.</li>
          <li><strong>Phân trang chuẩn 10 kết quả/trang:</strong> Giảm tải băng thông và tối ưu thời gian phản hồi của máy chủ.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 6 / 12</span>
    </div>
  </div>

  <!-- Slide 7: Search & Click Logging -->
  <div class="slide">
    <div>
      <div class="badge">Trọng tâm Search Engine</div>
      <div class="slide-title">Hệ Thống Ghi Vết Tìm Kiếm & Click (Interaction Telemetry)</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card cyan">
        <div class="card-title">Cấu Trúc Bảng search_click_logs</div>
        <ul class="card-list">
          <li><strong>user_id / owner_key:</strong> Xác định danh tính người dùng hoặc session key ẩn danh phục vụ cá nhân hóa.</li>
          <li><strong>query_string:</strong> Từ khóa tìm kiếm gốc của người dùng.</li>
          <li><strong>clicked_doc_id:</strong> ID tài liệu mà người dùng nhấp vào xem.</li>
          <li><strong>timestamp:</strong> Thời điểm chính xác diễn ra tìm kiếm hoặc click.</li>
          <li><strong>search_id:</strong> Khóa ngoại liên kết phiên tìm kiếm ban đầu và hành động click tiếp theo.</li>
          <li><strong>position:</strong> Vị trí thứ hạng (Rank: 1, 2, 3...) của kết quả được click.</li>
          <li><strong>result_count:</strong> Số lượng kết quả trả về của truy vấn.</li>
        </ul>
      </div>

      <div class="card green">
        <div class="card-title">Tính Năng Chống Thao Túng Dữ Liệu</div>
        <ul class="card-list">
          <li><strong>Ghi nhận truy vấn 0 kết quả:</strong> Truy vấn không ra kết quả vẫn ghi nhận 1 dòng SEARCH để biên tập viên nắm bắt nhu cầu tìm kiếm chưa được đáp ứng.</li>
          <li><strong>Xác thực liên kết Click (Anti-Tamper):</strong> Khi click kết quả, API kiểm tra xem bài viết đó có thực sự nằm trong danh sách kết quả của search_id không, và sao chép trực tiếp query từ DB, không tin tưởng client.</li>
          <li><strong>Bảo vệ tính độc lập (T18):</strong> Truy cập trực tiếp bài viết từ trang chủ chỉ tăng view, không tạo log click tìm kiếm giả mạo.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 7 / 12</span>
    </div>
  </div>

  <!-- Slide 8: CTR & View Deduplication -->
  <div class="slide">
    <div>
      <div class="badge">Phân tích hành vi</div>
      <div class="slide-title">Đo Lường CTR & Thuật Toán Lọc Trùng Lặp Lượt Xem</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card blue">
        <div class="card-title">Đo Lường Tỷ Lệ Click-Through Rate (CTR)</div>
        <ul class="card-list">
          <li><strong>Công thức tính CTR:</strong> <code>CTR = (Tổng lượt Clicks / Tổng lượt Searches) * 100%</code>.</li>
          <li><strong>Tín hiệu Relevance Feedback:</strong> Bài viết có vị trí hiển thị thấp nhưng CTR cao là minh chứng cho thấy tài liệu rất phù hợp với từ khóa, là cơ sở để thuật toán Phase 2 tự động tăng thứ hạng (Learning to Rank).</li>
          <li><strong>Dashboard phân tích trực quan:</strong> Chuyên viên SEO theo dõi từ khóa thịnh hành, từ khóa 0 kết quả và bài viết có tương tác cao nhất.</li>
        </ul>
      </div>

      <div class="card cyan">
        <div class="card-title">Thuật Toán Lọc Trùng Lặp View (UTC 30-Min Bucket)</div>
        <ul class="card-list">
          <li><strong>Vấn đề:</strong> F5 liên tục cày view ảo làm sai lệch độ phổ biến của bài viết.</li>
          <li><strong>Công thức băm thời gian 30 phút UTC:</strong>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; background: #0B1120; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0; color: #38BDF8;">
              bucket = floor(extract(epoch from now()) / 1800)
            </div>
          </li>
          <li><strong>Ràng buộc Unique trong PostgreSQL:</strong> Khóa duy nhất trên <code>(document_id, viewer_key, bucket)</code> giúp loại bỏ toàn bộ view trùng trong 30 phút với độ phức tạp O(1).</li>
          <li><strong>Giữ dữ liệu sạch:</strong> Đảm bảo tín hiệu tương tác đưa vào mô hình xếp hạng Phase 2 hoàn toàn chân thực.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 8 / 12</span>
    </div>
  </div>

  <!-- Slide 9: Seed Data -->
  <div class="slide">
    <div>
      <div class="badge">Kho dữ liệu mẫu</div>
      <div class="slide-title">Dữ Liệu Khởi Tạo Thực Tế (Seed Data - 80 Bài Viết Thật)</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;">
        <div class="card" style="text-align: center;">
          <div class="stat-number stat-blue">80</div>
          <div class="stat-label">Tổng bài viết gốc</div>
        </div>
        <div class="card" style="text-align: center;">
          <div class="stat-number stat-green">72 / 8</div>
          <div class="stat-label">Xuất bản / Nháp</div>
        </div>
        <div class="card" style="text-align: center;">
          <div class="stat-number stat-amber">4 / 12</div>
          <div class="stat-label">Danh mục / Thẻ</div>
        </div>
        <div class="card" style="text-align: center;">
          <div class="stat-number stat-purple">0%</div>
          <div class="stat-label">Lorem Ipsum</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card blue">
          <div class="card-title">Chất Lượng Văn Bản Thật (Chuẩn Bị Cho Tokenizer)</div>
          <ul class="card-list">
            <li><strong>100% Nội dung tiếng Việt giáo dục:</strong> Bao phủ các chủ đề AI, LLM, Computer Vision, Lập trình phân tán, Cloud, và An toàn thông tin.</li>
            <li><strong>Độ dài đạt chuẩn:</strong> Kiểm tra tự động bằng <code>validate-seed.ts</code>, mỗi bài đều có trên 183 từ, đầy đủ tóm tắt và ảnh minh họa có alt text.</li>
            <li><strong>Kho từ vựng phong phú:</strong> Sẵn sàng làm tập ngữ liệu (Corpus) chuẩn để đo lường độ chính xác của bộ tách từ tiếng Việt ở Phase 2.</li>
          </ul>
        </div>

        <div class="card cyan">
          <div class="card-title">Thiết Kế Seed Bất Biến (Idempotent Seed Runner)</div>
          <ul class="card-list">
            <li><strong>Chạy lại an toàn:</strong> Lệnh <code>npm run db:seed</code> có thể chạy nhiều lần mà không nhân bản dữ liệu hay làm lỗi cơ sở dữ liệu.</li>
            <li><strong>Bảo toàn phân quyền & tài khoản:</strong> Giữ nguyên mật khẩu và phân quyền do admin đã đổi trước đó.</li>
            <li><strong>Không sinh log ảo:</strong> Không tạo số liệu search/click giả, giữ tính toàn vẹn cho dữ liệu học máy.</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 9 / 12</span>
    </div>
  </div>

  <!-- Slide 10: SQA -->
  <div class="slide">
    <div>
      <div class="badge">Kiểm thử tự động</div>
      <div class="slide-title">Kiểm Thử & Đảm Bảo Chất Lượng Phần Mềm (SQA)</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card green">
        <div class="card-title">24/24 Integration Tests (Vitest)</div>
        <div style="font-size: 1.4rem; font-weight: 700; color: #34D399; margin-bottom: 0.5rem;">
          100% PASS trong 7.32 giây
        </div>
        <ul class="card-list">
          <li><strong>Môi trường thực:</strong> Chạy trực tiếp trên PostgreSQL thật (database cách ly <code>*_test</code>).</li>
          <li><strong>Kiểm thử tìm kiếm (search.test.ts):</strong> Kiểm tra từ khóa, ký tự wildcard %, lọc danh mục, ngày tháng, và kiểm tra bài nháp trả về 404.</li>
          <li><strong>Kiểm thử log tương tác:</strong> Kiểm tra ghi nhận dòng SEARCH khi 0 kết quả, kiểm tra CLICK hợp lệ, và từ chối click giả mạo.</li>
          <li><strong>Kiểm thử bảo mật:</strong> Kiểm tra khóa Advisory Lock bảo vệ Admin cuối cùng, CSRF đa byte, và bóc tách @mention.</li>
        </ul>
      </div>

      <div class="card blue">
        <div class="card-title">7/7 E2E Browser Workflows (Playwright)</div>
        <div style="font-size: 1.4rem; font-weight: 700; color: #38BDF8; margin-bottom: 0.5rem;">
          100% PASS trong 15.5 giây
        </div>
        <ul class="card-list">
          <li><strong>Tự động hóa Chromium:</strong> Hoàn tất 7 luồng tương tác thực tế từ đăng nhập, duyệt bài, đến đăng xuất.</li>
          <li><strong>Luồng tìm kiếm & click:</strong> Tự động nhập từ khóa, lọc theo danh mục/thẻ, nhấp kết quả và xác minh click log được ghi nhận.</li>
          <li><strong>Luồng quản trị biên tập & kiểm duyệt:</strong> Soạn bài, xuất bản/gỡ bài, duyệt báo cáo vi phạm.</li>
          <li><strong>Kiểm định Mobile:</strong> Kiểm tra trên viewport di động 390px, cam kết không bị tràn ngang layout.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 10 / 12</span>
    </div>
  </div>

  <!-- Slide 11: Phase 2 Roadmap -->
  <div class="slide">
    <div>
      <div class="badge">Định hướng Phase 2</div>
      <div class="slide-title">Lộ Trình Nâng Cấp Search Engine Hoàn Chỉnh (Phase 2 Roadmap)</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body" style="display: flex; flex-direction: column; gap: 0.65rem;">
      <div class="card blue" style="padding: 0.9rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #38BDF8; font-size: 1.1rem; width: 260px;">1. Tokenization Tiếng Việt</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Tích hợp bộ tách từ ghép tiếng Việt (VnCoreNLP hoặc Underthesea) xử lý văn bản thuần từ <code>content_plain</code>, loại bỏ stop words chuyên biệt.
          </span>
        </div>
      </div>

      <div class="card cyan" style="padding: 0.9rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #0EA5E9; font-size: 1.1rem; width: 260px;">2. Inverted Index (Chỉ mục đảo)</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Xây dựng bảng Postings List lưu trữ Term Frequency (TF) và Document Frequency (DF) cho từng từ khóa, tối ưu tốc độ tra cứu văn bản.
          </span>
        </div>
      </div>

      <div class="card green" style="padding: 0.9rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #34D399; font-size: 1.1rem; width: 260px;">3. Xếp Hạng BM25 & TF-IDF</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Cài đặt giải thuật Okapi BM25 kết hợp trọng số trường (Field Weighting): Tiêu đề có trọng số cao hơn tóm tắt và nội dung bài viết.
          </span>
        </div>
      </div>

      <div class="card amber" style="padding: 0.9rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #FBBF24; font-size: 1.1rem; width: 260px;">4. Tối Ưu Bằng Click Log (LTR)</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Sử dụng dữ liệu <code>search_click_logs</code> từ Phase 1 để huấn luyện mô hình Learning to Rank, tự động ưu tiên bài viết có tỷ lệ CTR cao.
          </span>
        </div>
      </div>

      <div class="card" style="padding: 0.9rem 1.25rem; border-left: 4px solid #A78BFA;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #A78BFA; font-size: 1.1rem; width: 260px;">5. Semantic Vector Search</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Tích hợp extension <code>pgvector</code> trong PostgreSQL và mô hình embedding để cho phép tìm kiếm theo ý nghĩa ngữ nghĩa (Semantic Search).
          </span>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 11 / 12</span>
    </div>
  </div>

  <!-- Slide 12: Contributions & Q&A -->
  <div class="slide" style="justify-content: center; background: radial-gradient(circle at 50% 50%, #1E3A8A 0%, #0F172A 80%);">
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="font-size: 3.2rem; font-weight: 800; color: #FFFFFF; margin-bottom: 0.3rem;">
          CẢM ƠN THẦY ĐÃ LẮNG NGHE!
        </h1>
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #38BDF8; margin-bottom: 0.5rem;">
          Điểm Mới — News & Digital Magazine Portal
        </h2>
        <div style="font-size: 1.1rem; font-weight: 700; color: #34D399;">
          Sẵn sàng Demo Hệ Thống & Trả Lời Câu Hỏi Phản Biện (Q&A)
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div class="card blue">
          <div class="card-title">Trần Trung Tín (MSSV: SE201619)</div>
          <ul class="card-list">
            <li><strong>Backend Architecture:</strong> Thiết kế REST API các module Auth, Documents, Taxonomy, Search, Click Logs, Moderation.</li>
            <li><strong>Document Data Store & DB:</strong> Xây dựng 14 bảng quan hệ, ràng buộc CHECK và khóa cố vấn Advisory Lock.</li>
            <li><strong>Search & Click Telemetry:</strong> Cài đặt logic tìm kiếm ILIKE an toàn và hệ thống ghi vết tìm kiếm/click chống giả mạo.</li>
            <li><strong>Testing:</strong> Xây dựng 24 bài kiểm thử Vitest trên database độc lập.</li>
          </ul>
        </div>

        <div class="card cyan">
          <div class="card-title">Võ Hiếu Thắng (MSSV: SE200932)</div>
          <ul class="card-list">
            <li><strong>Frontend SPA:</strong> Xây dựng React 18 SPA với TanStack Query, React Router v6 và Tailwind CSS.</li>
            <li><strong>Search & Filtering UX:</strong> Tối ưu giao diện tìm kiếm từ khóa, bộ lọc danh mục/thẻ/ngày và trải nghiệm đọc bài responsive.</li>
            <li><strong>Analytics & CTR Dashboard:</strong> Trực quan hóa top từ khóa tìm kiếm, tỷ lệ CTR và lượt xem bài viết.</li>
            <li><strong>Testing & Seed Corpus:</strong> Phát triển 7 bộ test Playwright tự động và biên tập 80 bài viết tiếng Việt không Lorem Ipsum.</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 12 / 12</span>
    </div>
  </div>

</body>
</html>
"""

out_dir = r"d:\0.University\01.FA26\SEG301\0.FinalProject\SEG301_FinalProject_Submission_SE201619_SE200932"
html_path = os.path.join(out_dir, "Slide_ThuyetTrinh_SEG301_DiemMoi.html")
pdf_path = os.path.join(out_dir, "Slide_ThuyetTrinh_SEG301_DiemMoi.pdf")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Saved HTML slides to: {html_path}")

cmd = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("PDF compilation return code:", res.returncode)
print("PDF file exists:", os.path.exists(pdf_path))
if os.path.exists(pdf_path):
    print(f"PDF size: {os.path.getsize(pdf_path) / 1024:.1f} KB")

