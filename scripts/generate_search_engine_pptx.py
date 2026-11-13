import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_search_engine_presentation(output_pptx):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Clean Tech Palette
    C_BG       = RGBColor(15, 23, 42)      # #0F172A Dark Slate Navy
    C_CARD     = RGBColor(30, 41, 59)      # #1E293B Card Background
    C_CARD_HI  = RGBColor(51, 65, 85)      # #334155 Elevated Surface
    C_BLUE     = RGBColor(59, 130, 246)    # #3B82F6 Primary Accent
    C_CYAN     = RGBColor(14, 165, 233)    # #0EA5E9 Cyan / Teal
    C_GREEN    = RGBColor(16, 185, 129)    # #10B981 Emerald Green
    C_AMBER    = RGBColor(245, 158, 11)    # #F59E0B Amber
    C_WHITE    = RGBColor(248, 250, 252)   # #F8FAFC White Text
    C_MUTED    = RGBColor(148, 163, 184)   # #94A3B8 Secondary Text
    C_BORDER   = RGBColor(51, 65, 85)      # #334155 Border

    def apply_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, title, category="MÔN HỌC: SEG301 — SEARCH ENGINE TECHNOLOGIES", slide_num=None):
        # Badge
        tb_c = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.35))
        tf_c = tb_c.text_frame
        tf_c.word_wrap = True
        tf_c.margin_left = tf_c.margin_top = tf_c.margin_right = tf_c.margin_bottom = 0
        p_c = tf_c.paragraphs[0]
        p_c.text = category.upper()
        p_c.font.name = "Arial"
        p_c.font.size = Pt(10)
        p_c.font.bold = True
        p_c.font.color.rgb = C_CYAN

        # Title
        tb_t = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.6))
        tf_t = tb_t.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = C_WHITE

        # Divider line
        div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.4), Inches(11.733), Inches(0.02))
        div.fill.solid()
        div.fill.fore_color.rgb = C_BORDER
        div.line.fill.background()

        # Footer
        tb_f = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.3))
        tf_f = tb_f.text_frame
        p_f = tf_f.paragraphs[0]
        p_f.text = "SEG301 — Search Engine Technologies | Đại học FPT | Trần Trung Tín (SE201619) & Võ Hiếu Thắng (SE200932)"
        p_f.font.name = "Segoe UI"
        p_f.font.size = Pt(9)
        p_f.font.color.rgb = C_MUTED
        if slide_num:
            p_f.text += f"   |   Slide {slide_num}/12"

    def add_card(slide, left, top, width, height, title="", border_col=None, bg_col=C_CARD):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_col
        if border_col:
            card.line.color.rgb = border_col
            card.line.width = Pt(1.5)
        else:
            card.line.color.rgb = C_BORDER
            card.line.width = Pt(1)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), width - Inches(0.5), Inches(0.4))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.name = "Segoe UI"
            p.font.size = Pt(13)
            p.font.bold = True
            p.font.color.rgb = C_CYAN
        return card

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    apply_bg(s1)

    top_accent = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12))
    top_accent.fill.solid()
    top_accent.fill.fore_color.rgb = C_BLUE
    top_accent.line.fill.background()

    # Badge
    b1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(4.5), Inches(0.45))
    b1.fill.solid()
    b1.fill.fore_color.rgb = C_CARD_HI
    b1.line.color.rgb = C_BLUE
    p = b1.text_frame.paragraphs[0]
    p.text = "ĐẠI HỌC FPT • MÔN HỌC: SEG301 (SEARCH ENGINE)"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = "Arial"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = C_CYAN

    # Title box
    tb = s1.shapes.add_textbox(Inches(0.8), Inches(1.85), Inches(11.5), Inches(2.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "ĐIỂM MỚI"
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE

    p2 = tf.add_paragraph()
    p2.text = "News & Digital Magazine Portal — Search Engine Document Store & Logging"
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(20)
    p2.font.color.rgb = C_CYAN

    p3 = tf.add_paragraph()
    p3.text = "Đồ án Toàn diện Phase 1 & Phase 2: Hệ thống Tạp chí điện tử tích hợp Công cụ Tìm kiếm hoàn chỉnh (Vietnamese Tokenization, Inverted Index, Okapi BM25F, TF-IDF và Hybrid CTR Feedback)."
    p3.font.name = "Segoe UI"
    p3.font.size = Pt(12)
    p3.font.color.rgb = C_MUTED
    p3.space_before = Pt(8)

    # Authors Card
    c_auth = add_card(s1, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.3), "THÀNH VIÊN THỰC HIỆN", C_BLUE)
    tb_a = s1.shapes.add_textbox(Inches(1.05), Inches(5.0), Inches(5.1), Inches(1.5))
    tf_a = tb_a.text_frame
    tf_a.word_wrap = True

    p = tf_a.paragraphs[0]
    p.text = "• Trần Trung Tín  —  MSSV: SE201619"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = C_WHITE
    p_sub = tf_a.add_paragraph()
    p_sub.text = "   Phụ trách: Backend Architecture, Document Store, Logging API & Tests"
    p_sub.font.size = Pt(11)
    p_sub.font.color.rgb = C_MUTED

    p = tf_a.add_paragraph()
    p.text = "• Võ Hiếu Thắng  —  MSSV: SE200932"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = C_WHITE
    p_sub = tf_a.add_paragraph()
    p_sub.text = "   Phụ trách: Frontend Web UI, UX Search & Filters, E2E Tests, Seed Data"
    p_sub.font.size = Pt(11)
    p_sub.font.color.rgb = C_MUTED

    # Course Metadata Card
    c_meta = add_card(s1, Inches(6.8), Inches(4.4), Inches(5.7), Inches(2.3), "THÔNG TIN HỌC THUẬT & CÔNG NGHỆ", C_CYAN)
    tb_m = s1.shapes.add_textbox(Inches(7.05), Inches(5.0), Inches(5.2), Inches(1.5))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True
    items = [
        ("Môn học:", "SEG301 — Search Engine Technologies"),
        ("Học kỳ & Đơn vị:", "FA26 — Đại học FPT"),
        ("Tech Stack:", "React 18, Express, PostgreSQL 18, Prisma ORM"),
        ("Trọng tâm đồ án:", "Document Data Store, Search/Click Logs, ILIKE baseline, 80 bài seed")
    ]
    for i, (k, v) in enumerate(items):
        p = tf_m.paragraphs[0] if i == 0 else tf_m.add_paragraph()
        p.text = f"• {k} "
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_CYAN
        run = p.add_run()
        run.text = v
        run.font.bold = False
        run.font.color.rgb = C_WHITE

    # =========================================================================
    # SLIDE 2: Objectives
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    apply_bg(s2)
    add_header(s2, "Mục Tiêu Đồ Án: Hoàn Thiện Full-Stack & Triển Khai IR Engine Phase 2", "Mục tiêu dự án", 2)

    c1 = add_card(s2, Inches(0.8), Inches(1.7), Inches(5.7), Inches(4.9), "1. Mục Tiêu Nền Tảng (Full-Stack & Data Store)", C_BLUE)
    tb1 = s2.shapes.add_textbox(Inches(1.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    pts1 = [
        "Xây dựng ứng dụng Web Full-Stack hoàn chỉnh: Đáp ứng toàn diện các thao tác CRUD bài viết, danh mục, thẻ và bình luận.",
        "Xác thực & Bảo mật người dùng: Đăng ký, đăng nhập, bảo vệ session bằng cookie HttpOnly và băm mật khẩu Argon2id.",
        "Phân quyền RBAC 5 vai trò: Super Admin, Content Manager, Moderator, Data & SEO Specialist, Regular User.",
        "Document Data Store & 80 bài seed thật: Lưu song song HTML và văn bản thuần content_plain, 80 bài viết tiếng Việt không Lorem Ipsum."
    ]
    for i, pt in enumerate(pts1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(14)

    c2 = add_card(s2, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9), "2. Trọng Tâm Search Engine Technologies (Phase 2)", C_CYAN)
    tb2 = s2.shapes.add_textbox(Inches(7.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Text Processing & Tokenizer Engine: Chuẩn hóa Unicode NFC, loại bỏ dấu (diacritics folding), lọc từ dừng (stop words) và tách n-gram từ ghép tiếng Việt.",
        "Inverted Index Memory Engine: Cấu trúc chỉ mục đảo lưu danh sách Postings, tần số từ theo từng trường (title, summary, content) và tính toán DF/IDF.",
        "Mô hình Xếp hạng Đa dạng: Triển khai Okapi BM25F với trọng số trường, mô hình Vector Space TF-IDF, và mô hình Hybrid tăng cường theo CTR.",
        "Query Autocomplete & Dynamic Highlighting: Gợi ý truy vấn tức thì theo tiền tố và trích xuất tóm tắt đánh dấu từ khóa khớp bằng thẻ <mark>."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(14)

    # =========================================================================
    # SLIDE 3: System Architecture
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    apply_bg(s3)
    add_header(s3, "Kiến Trúc Tổng Thể Ứng Dụng (Full-Stack Topology)", "Kiến trúc hệ thống", 3)

    tiers = [
        ("Tầng Trình Diễn (Frontend SPA)", Inches(0.8), 
         "React 18 + Vite SPA\n• TanStack Query v5: Quản lý cache và trạng thái tìm kiếm bất đồng bộ.\n• Tailwind CSS: Giao diện chuẩn đáp ứng (Responsive), kiểm thử trên mobile 390px.\n• Same-Origin Proxy: Giao tiếp API qua proxy, loại bỏ hoàn toàn lỗi CORS.", C_BLUE),
        ("Tầng Cổng & Bảo Mật (API Gateway)", Inches(4.8), 
         "Express 4 + Middleware Chain\n• Double-Submit CSRF: Bảo vệ mọi thao tác mutation.\n• Rate Limiter: Giới hạn 100 req/min chống brute-force và bot cào dữ liệu.\n• Zod Schema: Xác thực kiểu dữ liệu đầu vào và escape ký tự tìm kiếm.", C_CYAN),
        ("Tầng Lưu Trữ (Document Store & DB)", Inches(8.8), 
         "PostgreSQL 18 + Prisma ORM\n• 14 bảng quan hệ chuẩn hóa.\n• Bảng documents lưu trữ text thuần.\n• Bảng search_click_logs lưu vết tìm kiếm.\n• Ràng buộc SQL CHECK và khóa cố vấn Advisory Lock.", C_GREEN)
    ]

    for title, left, desc, col in tiers:
        add_card(s3, left, Inches(1.7), Inches(3.7), Inches(4.8), title, col)
        tb = s3.shapes.add_textbox(left + Inches(0.2), Inches(2.35), Inches(3.3), Inches(4.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(10)

    # =========================================================================
    # SLIDE 4: RBAC
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    apply_bg(s4)
    add_header(s4, "Phân Quyền Người Dùng (Role-Based Access Control - RBAC)", "Quản trị & Phân quyền", 4)

    roles = [
        ("Super Admin", "Quản lý toàn diện tài khoản, vai trò, ma trận phân quyền động, nhật ký hệ thống (audit logs) và cài đặt chung. Được bảo vệ bởi PostgreSQL Advisory Lock chống mất admin cuối cùng.", C_AMBER),
        ("Content Manager", "Toàn quyền CRUD nội dung bài viết, chuyển đổi trạng thái xuất bản (DRAFT / PUBLISHED / UNPUBLISHED), quản lý danh mục và gắn thẻ phân loại tài liệu.", C_BLUE),
        ("Moderator", "Kiểm duyệt nội dung người dùng: Tiếp nhận và xử lý hàng đợi báo cáo vi phạm (reports), ẩn/khôi phục bình luận độc hại, kiểm soát spam.", C_CYAN),
        ("Data & SEO Specialist", "Cấu hình metadata SEO (tiêu đề SEO, mô tả meta, từ khóa keywords, alt ảnh) và theo dõi dashboard phân tích từ khóa tìm kiếm & tỷ lệ click (CTR).", C_GREEN),
        ("Regular User", "Độc giả công khai: Đăng ký tài khoản, đăng nhập, đọc bài viết, bình luận phân cấp, mention @username, đánh giá 1-5 sao và thích bài viết.", C_MUTED)
    ]

    for i, (r_title, r_desc, r_col) in enumerate(roles):
        top = Inches(1.7 + i * 0.95)
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top, Inches(11.733), Inches(0.8))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD
        card.line.color.rgb = r_col
        card.line.width = Pt(1)

        tb1 = s4.shapes.add_textbox(Inches(1.0), top + Inches(0.12), Inches(2.6), Inches(0.55))
        p1 = tb1.text_frame.paragraphs[0]
        p1.text = r_title
        p1.font.bold = True
        p1.font.size = Pt(13)
        p1.font.color.rgb = r_col

        tb2 = s4.shapes.add_textbox(Inches(3.8), top + Inches(0.12), Inches(8.5), Inches(0.55))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = r_desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_WHITE

    # =========================================================================
    # SLIDE 5: Document Data Store (CORE SEARCH ENGINE)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    apply_bg(s5)
    add_header(s5, "Thiết Kế Kho Lưu Trữ Tài Liệu (Document Data Store)", "Trọng tâm Search Engine", 5)

    c1 = add_card(s5, Inches(0.8), Inches(1.7), Inches(5.7), Inches(4.9), "Cấu Trúc Bảng Documents (Chuẩn Bị Cho Phase 2)", C_CYAN)
    tb1 = s5.shapes.add_textbox(Inches(1.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    f_items = [
        ("id (UUID)", "Mã định danh duy nhất của tài liệu trong chỉ mục tìm kiếm."),
        ("title (String)", "Tiêu đề bài viết — trường có trọng số relevance cao nhất khi chấm điểm BM25."),
        ("content & content_plain", "Lưu song song HTML để render UI và văn bản thuần (content_plain) đã bóc tách sạch thẻ HTML để làm đầu vào cho bộ Tokenizer tách từ."),
        ("summary (String)", "Đoạn văn bản tóm tắt, dùng hiển thị kết quả tìm kiếm (Search Snippet)."),
        ("category_id & tags", "Phân loại đa chiều, phục vụ tính năng lọc kết hợp (Faceted Search)."),
        ("author & created_at", "Thuộc tính thời gian phục vụ lọc theo ngày và chấm điểm độ mới (Recency)."),
        ("views_count (Int)", "Số lượt xem thực tế, đóng vai trò là tín hiệu độ phổ biến (Popularity Signal).")
    ]
    for i, (f_name, f_desc) in enumerate(f_items):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {f_name}: "
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_CYAN
        run = p.add_run()
        run.text = f_desc
        run.font.bold = False
        run.font.color.rgb = C_MUTED
        p.space_after = Pt(6)

    c2 = add_card(s5, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9), "Ý Nghĩa Với Giải Thuật Search Engine", C_BLUE)
    tb2 = s5.shapes.add_textbox(Inches(7.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Sẵn sàng cho Inverted Index: Trường content_plain không lẫn mã JavaScript hay thẻ HTML thừa, giúp quá trình quét văn bản và lập chỉ mục đảo diễn ra tức thì mà không cần tiền xử lý nặng.",
        "Hỗ trợ tính độ dài tài liệu (|D|): Mỗi tài liệu có độ dài từ được xác định chính xác từ content_plain, phục vụ trực tiếp công thức tính độ dài trung bình tài liệu (avgdl) trong BM25.",
        "Chỉ mục cơ sở dữ liệu tối ưu: Đã thiết lập các chỉ mục B-tree trên [status, published_at DESC] và [categoryId, status] để tăng tốc độ truy vấn ở Phase 1."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(16)

    # =========================================================================
    # SLIDE 6: Baseline Search & Filtering
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    apply_bg(s6)
    add_header(s6, "Cơ Chế Tìm Kiếm Cơ Bản & Bộ Lọc (Phase 1 Baseline)", "Trọng tâm Search Engine", 6)

    c1 = add_card(s6, Inches(0.8), Inches(1.7), Inches(5.7), Inches(4.9), "Giải Thuật Tìm Kiếm SQL ILIKE An Toàn", C_BLUE)
    tb1 = s6.shapes.add_textbox(Inches(1.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    pts1 = [
        "So khớp từ khóa không phân biệt hoa thường: Sử dụng toán tử ILIKE của PostgreSQL trên 3 trường: title, summary và contentPlain.",
        "Cơ chế Escape ký tự đại diện: Các ký tự '%' và '_' trong chuỗi người dùng nhập được tự động escape bằng hàm regex chuyên biệt, ngăn chặn hoàn toàn tấn công DoS và SQL injection.",
        "Bảo vệ trạng thái xuất bản: Truy vấn tìm kiếm công khai luôn gắn điều kiện status = 'PUBLISHED' và deleted_at IS NULL. Độc giả không bao giờ nhìn thấy bài nháp hoặc bài đã gỡ."
    ]
    for i, pt in enumerate(pts1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(14)

    c2 = add_card(s6, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9), "Bộ Lọc Đa Tiêu Chí (Faceted Filtering)", C_CYAN)
    tb2 = s6.shapes.add_textbox(Inches(7.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Lọc theo Danh mục (Category): Độc giả chọn danh mục cụ thể (vd: Trí tuệ nhân tạo, Khoa học máy tính) để thu hẹp không gian tìm kiếm.",
        "Lọc theo Thẻ (Tag): Cho phép lọc tài liệu gắn với các nhãn công nghệ chuyên sâu (vd: Deep Learning, LLM, Cloud, Microservices).",
        "Lọc theo Khoảng ngày (Date Range): Lọc bài viết xuất bản từ ngày A đến ngày B bằng toán tử gte và lte trên trường published_at.",
        "Phân trang chuẩn 10 kết quả/trang: Phân đoạn kết quả tìm kiếm giúp giảm tải băng thông và độ trễ phản hồi."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(14)

    # =========================================================================
    # SLIDE 7: Search & Click Logging (TELEMETRY)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    apply_bg(s7)
    add_header(s7, "Hệ Thống Ghi Vết Tìm Kiếm & Click (Interaction Telemetry)", "Trọng tâm Search Engine", 7)

    c1 = add_card(s7, Inches(0.8), Inches(1.7), Inches(5.7), Inches(4.9), "Cấu Trúc Bảng search_click_logs", C_CYAN)
    tb1 = s7.shapes.add_textbox(Inches(1.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    fields = [
        ("user_id / owner_key", "Xác định danh tính người dùng hoặc session key ẩn danh để phục vụ cá nhân hóa kết quả."),
        ("query_string", "Từ khóa tìm kiếm gốc của người dùng."),
        ("clicked_doc_id", "ID tài liệu mà người dùng quyết định nhấp vào xem chi tiết."),
        ("timestamp", "Thời điểm phát sinh thao tác tìm kiếm hoặc click."),
        ("search_id", "Khóa ngoại liên kết giữa phiên tìm kiếm ban đầu và hành động click tiếp theo."),
        ("position", "Thứ hạng (Rank: 1, 2, 3...) của kết quả được click trong trang kết quả tìm kiếm (SERP)."),
        ("result_count", "Số lượng kết quả trả về cho truy vấn đó.")
    ]
    for i, (k, v) in enumerate(fields):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {k}: "
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_CYAN
        run = p.add_run()
        run.text = v
        run.font.bold = False
        run.font.color.rgb = C_MUTED
        p.space_after = Pt(6)

    c2 = add_card(s7, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9), "Tính Năng Nâng Cao Chống Thao Túng", C_GREEN)
    tb2 = s7.shapes.add_textbox(Inches(7.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Ghi nhận truy vấn 0 kết quả: Ngay cả khi tìm kiếm không ra bài viết nào, hệ thống vẫn ghi nhận 1 bản ghi SEARCH để chuyên viên nội dung biết độc giả đang tìm kiếm chủ đề gì còn thiếu.",
        "Xác thực liên kết Click (Anti-Tamper): Khi client gửi request click, API kiểm tra xem bài viết đó có thực sự nằm trong tập kết quả của search_id đó không, rồi sao chép trực tiếp query từ DB, không tin tưởng chuỗi query gửi từ client.",
        "Bảo vệ tính độc lập: Truy cập trực tiếp bài viết từ trang chủ chỉ tăng lượt xem (view), tuyệt đối không sinh log click giả mạo (Requirement T18 verified)."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(14)

    # =========================================================================
    # SLIDE 8: CTR & View Deduplication
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    apply_bg(s8)
    add_header(s8, "Đo Lường CTR & Thuật Toán Lọc Trùng Lặp Lượt Xem", "Phân tích hành vi", 8)

    c1 = add_card(s8, Inches(0.8), Inches(1.7), Inches(5.7), Inches(4.9), "Đo Lường Tỷ Lệ Click-Through Rate (CTR)", C_BLUE)
    tb1 = s8.shapes.add_textbox(Inches(1.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    pts1 = [
        "Công thức tính CTR: CTR = (Tổng lượt Clicks / Tổng lượt Searches) * 100%.",
        "Tín hiệu phản hồi mức độ liên quan (Relevance Feedback): Bài viết có vị trí hiển thị thấp nhưng CTR cao là bằng chứng cho thấy bài viết đó rất phù hợp với từ khóa, là cơ sở để thuật toán Phase 2 tự động tăng trọng số (Learning to Rank).",
        "Dashboard thời gian thực: Chuyên viên SEO theo dõi các từ khóa phổ biến nhất, từ khóa bị bỏ qua và tài liệu có lượng tương tác cao nhất."
    ]
    for i, pt in enumerate(pts1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(14)

    c2 = add_card(s8, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9), "Thuật Toán Lọc Trùng Lặp View (UTC 30-Min Bucket)", C_CYAN)
    tb2 = s8.shapes.add_textbox(Inches(7.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Bài toán: Tránh tình trạng F5 cày view ảo làm sai lệch dữ liệu phổ biến của bài viết.",
        "Công thức chia Bucket 30 phút UTC:\n  bucket = floor(extract(epoch from now()) / 1800)",
        "Ràng buộc Unique trong PostgreSQL: Bảng document_views có khóa duy nhất trên (document_id, viewer_key, bucket). Mọi lượt xem lặp lại từ cùng một người trong nửa tiếng sẽ bị loại bỏ với độ phức tạp O(1).",
        "Dữ liệu huấn luyện sạch: Đảm bảo số liệu tương tác lưu trong database hoàn toàn chân thực trước khi đưa vào mô hình xếp hạng Phase 2."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(12)

    # =========================================================================
    # SLIDE 9: Seed Data
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    apply_bg(s9)
    add_header(s9, "Dữ Liệu Khởi Tạo Thực Tế (Seed Data - 80 Bài Viết Thật)", "Kho dữ liệu mẫu", 9)

    # 4 Stat Cards
    stats = [
        ("80", "Tổng bài viết gốc", C_BLUE),
        ("72 / 8", "Xuất bản / Nháp", C_CYAN),
        ("4 / 12", "Danh mục / Thẻ", C_GREEN),
        ("0%", "Lorem Ipsum", C_AMBER)
    ]
    for i, (num, label, col) in enumerate(stats):
        left = Inches(0.8 + i * 3.0)
        card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.7), Inches(2.7), Inches(1.3))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD
        card.line.color.rgb = col
        card.line.width = Pt(1.5)

        tb = s9.shapes.add_textbox(left, Inches(1.75), Inches(2.7), Inches(0.55))
        p = tb.text_frame.paragraphs[0]
        p.text = num
        p.alignment = PP_ALIGN.CENTER
        p.font.name = "Segoe UI"
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = col

        tb2 = s9.shapes.add_textbox(left, Inches(2.35), Inches(2.7), Inches(0.5))
        p2 = tb2.text_frame.paragraphs[0]
        p2.text = label
        p2.alignment = PP_ALIGN.CENTER
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(10)
        p2.font.color.rgb = C_MUTED

    c1 = add_card(s9, Inches(0.8), Inches(3.3), Inches(5.7), Inches(3.5), "Chất Lượng Văn Bản Thật (Chuẩn Bị Tokenization)", C_BLUE)
    tb1 = s9.shapes.add_textbox(Inches(1.05), Inches(3.9), Inches(5.2), Inches(2.7))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    pts1 = [
        "100% Nội dung tiếng Việt giáo dục: Đề tài phong phú về AI, LLM, Computer Vision, Lập trình phân tán, và An toàn thông tin.",
        "Độ dài đạt chuẩn: Được kiểm định tự động bằng script validate-seed.ts, mỗi bài có độ dài trên 183 từ, đầy đủ tóm tắt và thẻ phân loại.",
        "Sẵn sàng cho việc lập từ điển: Vốn từ vựng kỹ thuật phong phú giúp kiểm thử độ chính xác của bộ tách từ (Tokenizer) tiếng Việt trong Phase 2."
    ]
    for i, pt in enumerate(pts1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(8)

    c2 = add_card(s9, Inches(6.8), Inches(3.3), Inches(5.7), Inches(3.5), "Thiết Kế Seed Bất Biến (Idempotent Seed Runner)", C_CYAN)
    tb2 = s9.shapes.add_textbox(Inches(7.05), Inches(3.9), Inches(5.2), Inches(2.7))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Chạy lại an toàn (Idempotent): Lệnh npm run db:seed có thể chạy nhiều lần mà không bị trùng lặp dữ liệu hay sinh bản ghi rác.",
        "Bảo toàn mật khẩu & phân quyền: Tôn trọng các thay đổi phân quyền và mật khẩu do quản trị viên đã cấu hình trước đó.",
        "Không tạo log giả mạo: Không sinh số liệu search hay click ảo; toàn bộ dữ liệu tương tác trong database phản ánh hành vi thực tế."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(8)

    # =========================================================================
    # SLIDE 10: SQA & Verification
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    apply_bg(s10)
    add_header(s10, "Kiểm Thử & Đảm Bảo Chất Lượng Phần Mềm (SQA: 38/38 Tests PASS)", "Kiểm thử tự động", 10)

    c1 = add_card(s10, Inches(0.8), Inches(1.7), Inches(5.7), Inches(4.9), "38/38 Integration Tests (Vitest)", C_GREEN)
    tb1 = s10.shapes.add_textbox(Inches(1.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    pts1 = [
        "Môi trường thực: Chạy trực tiếp trên PostgreSQL thật (database cách ly *_test), 11/11 test files đạt 100% PASS (12.66s).",
        "Phase 2 Search Suite (14 tests): Kiểm thử Tokenizer tiếng Việt, accent folding, Inverted Index lifecycle (publish/unpublish/delete), RSJ IDF, BM25F vs TF-IDF Cosine, và chẩn đoán /search/stats.",
        "Kiểm thử bảo mật & Reindexing: Quyền hạn documents.publish cho /search/reindex, kiểm tra xác thực CSRF và từ chối khách vãng lai.",
        "Kiểm thử Feedback Loop: Giả lập click thực tế qua /search/clicks để kiểm tra tính năng CTR boost trong mô hình Hybrid."
    ]
    for i, pt in enumerate(pts1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(12)

    c2 = add_card(s10, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9), "7/7 E2E Browser Workflows (Playwright)", C_BLUE)
    tb2 = s10.shapes.add_textbox(Inches(7.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Tự động hóa trình duyệt Chromium: Hoàn tất 7 luồng người dùng thực tế trong 16.6 giây.",
        "Luồng tìm kiếm & click: Tự động nhập từ khóa, chọn bộ lọc danh mục/thẻ, nhấp vào kết quả và kiểm tra bản ghi click log được tạo.",
        "Luồng quản trị biên tập & kiểm duyệt: Soạn bài, đổi trạng thái xuất bản, duyệt báo cáo vi phạm.",
        "Kiểm định Responsive: Kiểm tra giao diện trên màn hình điện thoại 390px, cam kết không bị tràn ngang layout."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(12)

    # =========================================================================
    # SLIDE 11: Phase 2 Search Engine Implementation & IR Evaluation
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    apply_bg(s11)
    add_header(s11, "Đánh Giá Thực Nghiệm IR & Giải Thuật Phase 2 (5 Truy Vấn Tiếng Việt)", "Thực nghiệm IR & Thuật toán", 11)

    c11_left = add_card(s11, Inches(0.8), Inches(1.7), Inches(6.0), Inches(4.9), "Kiến Trúc & 4 Mô Hình Thu Hồi Thông Tin", C_CYAN)
    tb_l = s11.shapes.add_textbox(Inches(1.05), Inches(2.35), Inches(5.5), Inches(4.1))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True
    steps = [
        "Tokenizer NLP: Chuẩn hóa NFC, loại bỏ dấu (accent-folding), lọc 65+ từ dừng tiếng Việt, shingling cụm từ ghép.",
        "Inverted Index: Postings in-memory theo từng trường (tf_title, tf_summary, tf_content) duy trì avgdl.",
        "BM25F & TF-IDF Cosine: Robertson-Spärck Jones IDF không âm, chuẩn hóa độ dài trường, cosine vector norm.",
        "Hybrid Ranking: Kết hợp BM25F với tỷ lệ nhấp chuột thực tế (CTR = clicks / searches) và lượt xem.",
        "Phân biệt |R| với Recall: Số tài liệu thu hồi (|R|) phản ánh độ bao phủ tập ứng viên, không đồng nhất với Recall."
    ]
    for i, st in enumerate(steps):
        p = tf_l.paragraphs[0] if i == 0 else tf_l.add_paragraph()
        p.text = f"• {st}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(10)

    c11_right = add_card(s11, Inches(7.1), Inches(1.7), Inches(5.4), Inches(4.9), "Kết Quả Đánh Giá Thực Nghiệm (Macro-Averages)", C_GREEN)
    tb_r = s11.shapes.add_textbox(Inches(7.35), Inches(2.35), Inches(4.9), Inches(4.1))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    metrics_summary = [
        "Tập 5 truy vấn: 'trí tuệ nhân tạo', 'học máy', 'bán dẫn' (control), 'chuyển đổi số', 'an ninh mạng'.",
        "SQL ILIKE (Baseline): Thu hồi TB 0.2 bài | Mean P@5 = 0.04 | MRR = 0.200 | Độ trễ 4.2ms. (Thất bại 4/5 truy vấn vì chuỗi con cứng nhắc).",
        "BM25F (Field-Weighted): Thu hồi TB 44.0 bài | Mean P@5 = 0.12 | MRR = 0.450 | Độ trễ 9.8ms.",
        "TF-IDF (Cosine): Thu hồi TB 44.0 bài | Mean P@5 = 0.12 | MRR = 0.500 | Độ trễ 10.3ms.",
        "Hybrid (CTR Feedback): Thu hồi TB 44.0 bài | Mean P@5 = 0.12 | MRR = 0.450 | Độ trễ 11.2ms.",
        "Hiện tượng Bag-of-Words: BM25F unigram chưa xét khoảng cách từ nên từ đa nghĩa ('mạng nơ-ron' vs 'an ninh mạng') có thể đạt điểm cao ở vị trí đầu nếu lặp lại nhiều lần."
    ]
    for i, ms in enumerate(metrics_summary):
        p = tf_r.paragraphs[0] if i == 0 else tf_r.add_paragraph()
        p.text = f"• {ms}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = C_MUTED if i != 1 and i != 2 else C_WHITE
        p.space_after = Pt(8)

    # =========================================================================
    # SLIDE 12: Contributions & Q&A
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    apply_bg(s12)
    add_header(s12, "Phân Công Nhiệm Vụ & Sẵn Sàng Trình Diễn (Q&A)", "Tổng kết & Phản biện", 12)

    c1 = add_card(s12, Inches(0.8), Inches(1.7), Inches(5.7), Inches(4.9), "Trần Trung Tín (SE201619)", C_BLUE)
    tb1 = s12.shapes.add_textbox(Inches(1.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    pts1 = [
        "Backend Architecture & REST API: Thiết kế các module Auth, Documents, Taxonomy, Search, Click Logs, Moderation.",
        "Thiết kế Document Data Store & PostgreSQL Schema: Xây dựng 14 bảng quan hệ, ràng buộc CHECK và khóa cố vấn Advisory Lock.",
        "Cơ chế Search & Click Attribution: Cài đặt logic tìm kiếm ILIKE an toàn và hệ thống ghi vết tìm kiếm/click không thể làm giả.",
        "Unit & Integration Testing: Xây dựng 24 bài kiểm thử Vitest trên database độc lập."
    ]
    for i, pt in enumerate(pts1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_MUTED
        p.space_after = Pt(10)

    c2 = add_card(s12, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9), "Võ Hiếu Thắng (SE200932)", C_CYAN)
    tb2 = s12.shapes.add_textbox(Inches(7.05), Inches(2.35), Inches(5.2), Inches(4.1))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Frontend SPA Architecture: Xây dựng React 18 SPA với TanStack Query, React Router v6 và Tailwind CSS.",
        "Giao diện Tìm kiếm & Bộ lọc: Tối ưu thanh tìm kiếm từ khóa, bộ lọc danh mục/thẻ/ngày và trải nghiệm đọc bài responsive.",
        "Dashboard Thống kê & Analytics: Xây dựng giao diện trực quan hóa top truy vấn, tỷ lệ CTR và lượt xem bài viết.",
        "End-to-End Testing & Seed Corpus: Phát triển 7 bộ test Playwright tự động và biên tập 80 bài viết tiếng Việt không Lorem Ipsum."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_WHITE
        p.space_after = Pt(10)

    prs.save(output_pptx)
    print(f"Presentation saved successfully to: {output_pptx}")

if __name__ == "__main__":
    out_file = r"d:\0.University\01.FA26\SEG301\0.FinalProject\SEG301_FinalProject_Submission_SE201619_SE200932\Slide_ThuyetTrinh_SEG301_DiemMoi.pptx"
    build_search_engine_presentation(out_file)

