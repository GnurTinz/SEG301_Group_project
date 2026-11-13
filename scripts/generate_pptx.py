import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # completely blank layout

    # Color Palette - Professional Tech Dark & Modern Indigo/Cyan
    C_NAVY_DARK = RGBColor(15, 23, 42)      # #0F172A - Main dark bg
    C_CARD_BG   = RGBColor(30, 41, 59)      # #1E293B - Card container bg
    C_CARD_BG2  = RGBColor(51, 65, 85)      # #334155 - Elevated surface
    C_ACCENT_BL = RGBColor(59, 130, 246)    # #3B82F6 - Primary blue
    C_ACCENT_CY = RGBColor(14, 165, 233)    # #0EA5E9 - Cyan / Sky
    C_ACCENT_GR = RGBColor(16, 185, 129)    # #10B981 - Emerald green
    C_ACCENT_AM = RGBColor(245, 158, 11)    # #F59E0B - Amber
    C_TEXT_PRI  = RGBColor(248, 250, 252)   # #F8FAFC - Main text
    C_TEXT_SEC  = RGBColor(148, 163, 184)   # #94A3B8 - Sub text
    C_TEXT_MUT  = RGBColor(100, 116, 139)   # #64748B - Muted text
    C_BORDER    = RGBColor(51, 65, 85)      # #334155 - Border

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_NAVY_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="SEG301 — FINAL PROJECT DEFENSE", slide_num=None):
        # Category / Module badge
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        tf_cat.margin_left = tf_cat.margin_top = tf_cat.margin_right = tf_cat.margin_bottom = 0
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.name = "Arial"
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_ACCENT_CY

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.6))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.name = "Segoe UI"
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = C_TEXT_PRI

        # Subtle divider line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.4), Inches(11.733), Inches(0.02))
        line.fill.solid()
        line.fill.fore_color.rgb = C_BORDER
        line.line.fill.background()

        # Footer
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.3))
        tf_foot = footer_box.text_frame
        p_foot = tf_foot.paragraphs[0]
        p_foot.text = "Điểm Mới Portal | FPT University | Trần Trung Tín (SE201619) & Võ Hiếu Thắng (SE200932)"
        p_foot.font.name = "Segoe UI"
        p_foot.font.size = Pt(9)
        p_foot.font.color.rgb = C_TEXT_MUT
        if slide_num:
            p_foot.text += f"   |   Slide {slide_num}/18"

    def add_card(slide, left, top, width, height, title="", border_color=None, bg_color=C_CARD_BG):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.color.rgb = C_BORDER
            card.line.width = Pt(1)
        
        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.18), width - Inches(0.4), Inches(0.4))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.name = "Segoe UI"
            p.font.size = Pt(14)
            p.font.bold = True
            p.font.color.rgb = C_ACCENT_CY
        return card

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)

    # Accent decorative top bar
    top_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.15))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = C_ACCENT_BL
    top_bar.line.fill.background()

    # Big Badge
    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(3.8), Inches(0.45))
    badge.fill.solid()
    badge.fill.fore_color.rgb = C_CARD_BG2
    badge.line.color.rgb = C_ACCENT_BL
    tf_b = badge.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = "FPT UNIVERSITY • SEG301 FINAL PROJECT"
    p_b.alignment = PP_ALIGN.CENTER
    p_b.font.name = "Arial"
    p_b.font.size = Pt(10)
    p_b.font.bold = True
    p_b.font.color.rgb = C_ACCENT_CY

    # Project Main Title
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.5), Inches(1.8))
    tf = t_box.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "ĐIỂM MỚI"
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = C_TEXT_PRI

    p2 = tf.add_paragraph()
    p2.text = "News & Digital Magazine Web Portal with Enterprise Architecture"
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(22)
    p2.font.color.rgb = C_ACCENT_CY

    p3 = tf.add_paragraph()
    p3.text = "An end-to-end fullstack platform featuring multi-tier RBAC, content moderation, behavioral analytics, and strict security compliance."
    p3.font.name = "Segoe UI"
    p3.font.size = Pt(13)
    p3.font.color.rgb = C_TEXT_SEC

    # Authors Card
    c_auth = add_card(s1, Inches(0.8), Inches(4.3), Inches(5.6), Inches(2.3), "PROJECT AUTHORS", C_ACCENT_BL)
    tb_a = s1.shapes.add_textbox(Inches(1.0), Inches(4.9), Inches(5.2), Inches(1.5))
    tf_a = tb_a.text_frame
    tf_a.word_wrap = True
    p = tf_a.paragraphs[0]
    p.text = "• Trần Trung Tín  —  Student ID: SE201619"
    p.font.name = "Segoe UI"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_TEXT_PRI
    p_sub = tf_a.add_paragraph()
    p_sub.text = "   Role: Backend Architecture, RBAC Security, Database & Tests"
    p_sub.font.name = "Segoe UI"
    p_sub.font.size = Pt(11)
    p_sub.font.color.rgb = C_TEXT_SEC

    p = tf_a.add_paragraph()
    p.text = "• Võ Hiếu Thắng  —  Student ID: SE200932"
    p.font.name = "Segoe UI"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_TEXT_PRI
    p_sub = tf_a.add_paragraph()
    p_sub.text = "   Role: Frontend SPA, UX/UI, Engagement, Moderation & E2E"
    p_sub.font.name = "Segoe UI"
    p_sub.font.size = Pt(11)
    p_sub.font.color.rgb = C_TEXT_SEC

    # Academic Metadata Card
    c_meta = add_card(s1, Inches(6.8), Inches(4.3), Inches(5.7), Inches(2.3), "ACADEMIC INFORMATION", C_ACCENT_CY)
    tb_m = s1.shapes.add_textbox(Inches(7.0), Inches(4.9), Inches(5.3), Inches(1.5))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True
    items = [
        ("Course:", "SEG301 — Software Architecture & Engineering"),
        ("Institution:", "FPT University (Trường Đại học FPT)"),
        ("Tech Stack:", "React 18 + Express + PostgreSQL 18 + Prisma ORM"),
        ("Verification:", "100% Automated Tests Passed (Vitest + Playwright)")
    ]
    for i, (k, v) in enumerate(items):
        p = tf_m.paragraphs[0] if i == 0 else tf_m.add_paragraph()
        p.text = f"• {k} "
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_ACCENT_CY
        run = p.add_run()
        run.text = v
        run.font.bold = False
        run.font.color.rgb = C_TEXT_PRI

    # =========================================================================
    # SLIDE 2: Executive Summary & Project Objectives
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_header(s2, "Executive Summary & Project Scope", "Project Overview", 2)

    c1 = add_card(s2, Inches(0.8), Inches(1.7), Inches(3.6), Inches(4.8), "Mission & Purpose")
    tb = s2.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(3.2), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    points1 = [
        "Deliver a modern, enterprise-ready digital magazine dedicated to AI, science, and technology.",
        "Serve high-quality Vietnamese educational content with zero placeholder text.",
        "Solve foundational challenges in content lifecycle, community governance, and data privacy.",
        "Strictly adhere to production-grade software engineering principles and IEEE standards."
    ]
    for i, pt in enumerate(points1):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(12)

    c2 = add_card(s2, Inches(4.8), Inches(1.7), Inches(3.7), Inches(4.8), "Core Deliverables")
    tb = s2.shapes.add_textbox(Inches(5.0), Inches(2.3), Inches(3.3), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    points2 = [
        "Interactive Reader SPA: Responsive article browsing, category/tag filtering, keyword search, threaded comments, and 1-5 star ratings.",
        "Administrative Console: Comprehensive management for content, taxonomies, moderation, SEO metadata, user roles, and audit logs.",
        "Multi-Tier RBAC: 5 distinct roles with dynamic permission evaluation on every single request.",
        "Behavioral Analytics Engine: Query logging, CTR tracking, and bucketed view deduplication."
    ]
    for i, pt in enumerate(points2):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    c3 = add_card(s2, Inches(8.9), Inches(1.7), Inches(3.6), Inches(4.8), "Technical Excellence")
    tb = s2.shapes.add_textbox(Inches(9.1), Inches(2.3), Inches(3.2), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    points3 = [
        "Modern Stack: TypeScript end-to-end, React 18, TanStack Query, Express 4, Prisma ORM, PostgreSQL 18.",
        "Defense-in-Depth: Double-submit CSRF, Argon2id, HttpOnly PostgreSQL sessions, and HTML sanitization.",
        "Automated Quality: 24/24 Vitest integration tests and 7/7 Playwright browser workflows passing cleanly.",
        "Seed Corpus: 80 original articles (72 published, 8 drafts), 4 categories, 12 tags with idempotent migrations."
    ]
    for i, pt in enumerate(points3):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    # =========================================================================
    # SLIDE 3: Problem Statement & Engineering Challenges
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_header(s3, "Problem Statement & Key Engineering Challenges", "Domain Analysis", 3)

    challenges = [
        ("1. Dynamic Authorization & RBAC Drift", 
         "Standard role systems hardcode permissions in tokens (JWT), leading to stale rights when an admin revokes privileges. Solution: Điểm Mới queries fresh role-permission relations from PostgreSQL on every API mutation and uses PostgreSQL advisory locks to guarantee the last Super Admin is never revoked or locked out."),
        ("2. Spam, Toxicity & Community Governance", 
         "Open comment sections suffer from malicious script injections (XSS), harassment, and spam. Solution: Implemented server-side HTML sanitization with sanitize-html, regex-based user mentions with foreign-key validation, and a centralized Moderator triage queue for user-submitted abuse reports."),
        ("3. Skewed Metrics & Analytics De-duplication", 
         "Rapid page reloads and search crawlers artificially inflate view counters and click-through rates. Solution: Designed a UTC 30-minute bucket deduplication algorithm using unique composite keys in PostgreSQL, alongside verifiable click-through links that reject fabricated queries."),
        ("4. Deployment Integrity & Windows Engine Locking", 
         "Prisma Client query engine DLL on Windows locks during file writes, breaking local hot reloads and builds. Solution: Engineered predev automation scripts to verify port availability, test schema hashes, and reuse native binaries without permission conflicts.")
    ]

    for i, (title, desc) in enumerate(challenges):
        col = i % 2
        row = i // 2
        left = Inches(0.8 + col * 6.0)
        top = Inches(1.7 + row * 2.5)
        add_card(s3, left, top, Inches(5.7), Inches(2.2), title, C_ACCENT_BL if i%2==0 else C_ACCENT_CY)
        tb = s3.shapes.add_textbox(left + Inches(0.2), top + Inches(0.65), Inches(5.3), Inches(1.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 4: System Architecture & Layered Design
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_header(s4, "System Architecture & End-to-End Topology", "Architecture & Design", 4)

    # Architecture diagram containers (Left to Right flow)
    tiers = [
        ("Client Tier (Browser)", Inches(0.8), "React 18 + Vite SPA\n• TanStack Query v5 (caching)\n• Tailwind CSS (responsive UI)\n• Lucide Icons\n• Same-Origin API Proxy\n• Mobile 390px Optimized", C_ACCENT_BL),
        ("Gateway & Security", Inches(3.8), "Express 4 Middleware\n• CORS & CSRF Double-Submit\n• Rate Limiter (express-rate-limit)\n• Cookie Parser (HttpOnly)\n• Zod Schema Validation\n• Session Store (PostgreSQL)", C_ACCENT_CY),
        ("Business Logic Tier", Inches(6.8), "Modular Domain Handlers\n• Auth & RBAC Service\n• Document & Taxonomy Service\n• Comment & Mention Engine\n• Moderation & Audit Service\n• Analytics & Search Logger", C_ACCENT_GR),
        ("Data Persistence Tier", Inches(9.8), "PostgreSQL 18 + Prisma\n• 14 Relational Models\n• SQL CHECK Constraints\n• Atomic Transactions\n• Deduplication Buckets\n• Advisory Locking Locks", C_ACCENT_AM)
    ]

    for title, left, desc, color in tiers:
        add_card(s4, left, Inches(1.7), Inches(2.7), Inches(3.8), title, color)
        tb = s4.shapes.add_textbox(left + Inches(0.15), Inches(2.4), Inches(2.4), Inches(2.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC

    # Architecture Key Features summary bottom box
    b_card = add_card(s4, Inches(0.8), Inches(5.8), Inches(11.733), Inches(1.0), "Key Architectural Safeguards", None, C_CARD_BG2)
    tb_b = s4.shapes.add_textbox(Inches(1.0), Inches(6.15), Inches(11.3), Inches(0.6))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True
    p = tf_b.paragraphs[0]
    p.text = "• Zero-Trust State: Session credentials strictly isolated in HttpOnly, SameSite=Lax cookies with rotation on privilege changes.\n• Strict Separation: All public queries require status=PUBLISHED and deleted_at=NULL; unpublished drafts are fully obscured from guests."
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_PRI

    # =========================================================================
    # SLIDE 5: Role-Based Access Control (RBAC) Matrix
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    add_header(s5, "Role-Based Access Control (RBAC) Architecture", "Security & Governance", 5)

    roles = [
        ("SUPER_ADMIN", "Full system governance: User management, role assignments, dynamic permission editing, audit log inspection, and global portal settings. Protected by concurrency locks.", C_ACCENT_AM),
        ("CONTENT_MANAGER", "Editorial operations: Create, update, publish, unpublish, and soft-delete articles; taxonomy management (categories & tags); cover image upload with validation.", C_ACCENT_BL),
        ("MODERATOR", "Content moderation: Review community abuse reports, hide/restore reported comments, mark spam, and resolve or dismiss disciplinary actions.", C_ACCENT_CY),
        ("SEO_SPECIALIST", "Metadata & analytics: Strictly permitted to edit SEO titles, meta descriptions, search keywords, and image alt text. Real-time access to search click-through analytics.", C_ACCENT_GR),
        ("USER (Regular)", "Community engagement: Profile management, write comments, threaded replies, @username mentions, idempotent liking, 1-5 star ratings, and reporting violations.", C_TEXT_SEC)
    ]

    for i, (r_name, r_desc, r_col) in enumerate(roles):
        top = Inches(1.7 + i * 0.95)
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top, Inches(11.733), Inches(0.8))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = r_col
        card.line.width = Pt(1)

        # Title
        tb = s5.shapes.add_textbox(Inches(1.0), top + Inches(0.12), Inches(2.6), Inches(0.5))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        p.text = r_name
        p.font.name = "Segoe UI"
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = r_col

        # Description
        tb2 = s5.shapes.add_textbox(Inches(3.8), top + Inches(0.12), Inches(8.5), Inches(0.55))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = r_desc
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_PRI

    # Bottom note
    b_tb = s5.shapes.add_textbox(Inches(0.8), Inches(6.55), Inches(11.733), Inches(0.4))
    tf_b = b_tb.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = "★ Concurrency Guard: PostgreSQL advisory lock (pg_advisory_xact_lock) ensures that under simultaneous administrative requests, the final active Super Admin cannot be suspended, demoted, or stripped of core permissions."
    p_b.font.size = Pt(10)
    p_b.font.bold = True
    p_b.font.color.rgb = C_ACCENT_CY

    # =========================================================================
    # SLIDE 6: Content Lifecycle & Editorial Management
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    add_header(s6, "Editorial Management & Document Lifecycle", "Core Features", 6)

    # Workflow cards
    c1 = add_card(s6, Inches(0.8), Inches(1.7), Inches(3.6), Inches(4.8), "Document State Machine")
    tb = s6.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(3.2), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    pts = [
        "DRAFT: In-progress editorial work. Strictly hidden from public portal and search index (returns 404 for guests).",
        "PUBLISHED: Live on the homepage, category feeds, and search results with recorded published_at timestamp.",
        "UNPUBLISHED: Temporarily retracted articles. Public queries return 404; historical comments and ratings preserved.",
        "Soft Delete: deleted_at timestamp ensures non-destructive audit compliance."
    ]
    for i, pt in enumerate(pts):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    c2 = add_card(s6, Inches(4.8), Inches(1.7), Inches(3.7), Inches(4.8), "Taxonomy & Metadata")
    tb = s6.shapes.add_textbox(Inches(5.0), Inches(2.3), Inches(3.3), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    pts2 = [
        "Hierarchical Taxonomy: Articles map to exactly one primary Category and multiple Tag labels via m:n join table.",
        "Referential Integrity: Deletion of categories currently assigned to active documents is strictly blocked with HTTP 409.",
        "Dual Content Format: Both rich HTML (for sanitized frontend rendering) and plain text (content_plain) are stored for search extraction.",
        "Slug Generation: Automated unique URL slug derivation with hyphenated transliteration."
    ]
    for i, pt in enumerate(pts2):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    c3 = add_card(s6, Inches(8.9), Inches(1.7), Inches(3.6), Inches(4.8), "Secure Asset Uploads")
    tb = s6.shapes.add_textbox(Inches(9.1), Inches(2.3), Inches(3.2), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    pts3 = [
        "Magic-Byte Verification: File signatures (JPEG, PNG, WebP) are validated against byte headers, rejecting spoofed file extensions.",
        "SVG Protection: SVG uploads are blocked to eliminate XML External Entity (XXE) and embedded JavaScript attack vectors.",
        "Size & Dimension Bounding: 5MB upload limit per image with unique UUID renaming to prevent path traversal.",
        "Accessibility: SEO Specialist enforces coverImageAlt tags for screen readers and search crawlability."
    ]
    for i, pt in enumerate(pts3):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    # =========================================================================
    # SLIDE 7: Community Interaction & Reader Engagement
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    add_header(s7, "Community Interaction & Engagement Engine", "Core Features", 7)

    features = [
        ("Threaded Comments & Ownership Enforcement",
         "Users can post root comments or nest replies to existing discussions (parent_id hierarchy). In compliance with requirement T08, only the original comment author can edit comment text. Other users attempting edits receive HTTP 403 Forbidden. Moderators have separate administrative controls to hide or restore comments.",
         C_ACCENT_BL),
        ("Dynamic @username Mention System",
         "The backend comment parser extracts @username tokens using validated regular expressions. The system cross-references active user accounts: verified mentions are recorded in the comment_mentions relational join table, while phantom or fabricated mentions are safely ignored without halting creation.",
         C_ACCENT_CY),
        ("Idempotent Liking Mechanism",
         "The document_likes join table enforces unique composite keys (document_id, user_id). Users can toggle likes seamlessly. Repeated click requests remain completely idempotent, preventing double-increment attacks and ensuring accurate engagement metrics.",
         C_ACCENT_GR),
        ("1–5 Star Rating with SQL CHECK Constraints",
         "Readers submit 1–5 integer ratings for articles. Strict validation is enforced both at the application level (Zod validation schemas) and at the relational database level via PostgreSQL CHECK constraints (value >= 1 AND value <= 5). Real-time average ratings and counts are aggregated on demand.",
         C_ACCENT_AM)
    ]

    for i, (title, desc, col) in enumerate(features):
        c_left = Inches(0.8 + (i % 2) * 6.0)
        c_top  = Inches(1.7 + (i // 2) * 2.5)
        add_card(s7, c_left, c_top, Inches(5.7), Inches(2.2), title, col)
        tb = s7.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.65), Inches(5.3), Inches(1.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 8: Content Moderation & Abuse Reporting
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    add_header(s8, "Content Moderation & Governance Workflow", "Core Features", 8)

    # 3 Column Workflow
    w1 = add_card(s8, Inches(0.8), Inches(1.7), Inches(3.6), Inches(4.8), "1. Community Reporting")
    tb1 = s8.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(3.2), Inches(4.0))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    pts1 = [
        "Readers can submit reports targeting inappropriate articles or abusive comments.",
        "PostgreSQL CHECK constraint ensures mutual exclusivity: a report points to either a document_id OR a comment_id, never both or neither.",
        "Structured violation categories: SPAM, HARASSMENT, MISINFORMATION, OFFENSIVE, OTHER.",
        "Initial status set to OPEN with automatic timestamp and reporter ID recording."
    ]
    for i, pt in enumerate(pts1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    w2 = add_card(s8, Inches(4.8), Inches(1.7), Inches(3.7), Inches(4.8), "2. Moderator Triage Console")
    tb2 = s8.shapes.add_textbox(Inches(5.0), Inches(2.3), Inches(3.3), Inches(4.0))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Dedicated moderation workspace at /admin/moderation restricted to MODERATOR and SUPER_ADMIN.",
        "Rich context: Lists reporter username, violation reason, detailed description, target link, and current status.",
        "Direct Content Inspection: Allows single-click navigation to inspect flagged articles in their public context.",
        "Audit Logged: All moderation actions write immutable records into audit_logs."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    w3 = add_card(s8, Inches(8.9), Inches(1.7), Inches(3.6), Inches(4.8), "3. Enforcement Actions")
    tb3 = s8.shapes.add_textbox(Inches(9.1), Inches(2.3), Inches(3.2), Inches(4.0))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    pts3 = [
        "Hide Comment: Updates comment status to HIDDEN. Public readers see '[Bình luận đã bị ẩn do vi phạm]'.",
        "Restore Comment: Reverts hidden comments back to VISIBLE if false report.",
        "Mark as Spam: Flags content as SPAM for automated filter heuristics.",
        "Resolve / Dismiss: Transitions report status to RESOLVED or DISMISSED with resolver user reference."
    ]
    for i, pt in enumerate(pts3):
        p = tf3.paragraphs[0] if i == 0 else tf3.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    # =========================================================================
    # SLIDE 9: Behavioral Analytics & Search Tracking
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9)
    add_header(s9, "Behavioral Analytics & Search Click Attribution", "Analytics & Data", 9)

    c1 = add_card(s9, Inches(0.8), Inches(1.7), Inches(5.7), Inches(4.8), "Search Query & Click Attribution Pipeline", C_ACCENT_BL)
    tb1 = s9.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.0))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    pts1 = [
        "PostgreSQL ILIKE Search: Queries execute across title, summary, and contentPlain with wildcard escaping to prevent LIKE injection.",
        "Immutable Event Logging: Every query execution records an event_type=SEARCH row containing search_id, user/session key, query string, filters, and result count.",
        "Zero-Result Tracking: Even queries yielding zero results are faithfully recorded to identify content gaps and user demand.",
        "Anti-Tamper Click Logging: When a user clicks a result, POST /search/clicks validates search_id ownership, verifies that the clicked document was in the result set, records position, and copies the stored query string directly from the database rather than trusting client-submitted text."
    ]
    for i, pt in enumerate(pts1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    c2 = add_card(s9, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.8), "View Counter Deduplication & Metrics", C_ACCENT_CY)
    tb2 = s9.shapes.add_textbox(Inches(7.0), Inches(2.3), Inches(5.3), Inches(4.0))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "UTC 30-Minute Bucket Deduplication: Solves artificial view inflation by bucketing timestamps:\n  bucket = floor(extract(epoch from now()) / 1800)",
        "PostgreSQL Unique Constraint: Unique index on (document_id, viewer_key, bucket) atomically rejects duplicate views from the same viewer in the same 30-minute interval.",
        "Direct View Protection: Navigating directly to an article detail page increments the view counter but leaves search click counts unchanged (T18 verified).",
        "Real-Time Analytics Dashboard: SEO Specialists inspect top queries, CTR percentages, article popularity, and category traffic trends in real time without third-party trackers."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    # =========================================================================
    # SLIDE 10: Database Schema & Relational Design
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10)
    add_header(s10, "Database Schema & Relational Architecture", "Data Modeling", 10)

    models_info = [
        ("Identity & Access", "users, roles, permissions, user_roles, role_permissions, sessions (PostgreSQL native session store)"),
        ("Editorial & Content", "documents (status, slug, SEO tags), categories, tags, document_tags (m:n association)"),
        ("Social Engagement", "comments (hierarchical parent_id), comment_mentions, document_likes, document_ratings"),
        ("Moderation & Governance", "reports (polymorphic target with CHECK constraint), audit_logs, settings (JSON key-value)")
    ]

    for i, (cat, desc) in enumerate(models_info):
        left = Inches(0.8 + (i % 2) * 6.0)
        top  = Inches(1.7 + (i // 2) * 1.5)
        add_card(s10, left, top, Inches(5.7), Inches(1.3), cat, C_ACCENT_BL if i%2==0 else C_ACCENT_CY)
        tb = s10.shapes.add_textbox(left + Inches(0.2), top + Inches(0.55), Inches(5.3), Inches(0.65))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC

    # Schema Constraints & Table stats
    c_bot = add_card(s10, Inches(0.8), Inches(4.9), Inches(11.733), Inches(1.9), "Relational Integrity & Database Constraints", C_ACCENT_GR)
    tb_bot = s10.shapes.add_textbox(Inches(1.0), Inches(5.4), Inches(11.3), Inches(1.3))
    tf_bot = tb_bot.text_frame
    tf_bot.word_wrap = True
    c_pts = [
        "SQL Rating Bounds: CHECK (value >= 1 AND value <= 5) guarantees mathematical validity at the storage engine level.",
        "Exclusive Report Target: CHECK ((document_id IS NOT NULL AND comment_id IS NULL) OR (document_id IS NULL AND comment_id IS NOT NULL)) prevents ambiguous report linkage.",
        "Cascade Rules: Cascading deletes applied to child comments and likes upon document removal; restrictive deletes on roles to prevent orphan privileges.",
        "Performance Indexing: B-tree indexes placed on [status, published_at DESC], [categoryId, status], [searchId], and [eventType, timestamp]."
    ]
    for i, pt in enumerate(c_pts):
        p = tf_bot.paragraphs[0] if i == 0 else tf_bot.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_PRI

    # =========================================================================
    # SLIDE 11: Security Engineering & Defense-in-Depth
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11)
    add_header(s11, "Security Engineering & Threat Mitigation", "Security & Hardening", 11)

    threats = [
        ("Authentication & Password Storage",
         "Argon2id hashing algorithm with tuned memory cost and salt parameters. Sessions stored server-side in PostgreSQL with HttpOnly; SameSite=Lax; Secure cookies. Session IDs rotated upon privilege transitions.",
         C_ACCENT_BL),
        ("Cross-Site Request Forgery (CSRF)",
         "Double-submit token pattern. State-changing requests (POST, PUT, PATCH, DELETE) require a valid X-CSRF-Token header issued by /auth/csrf. Multi-byte and cross-origin forging attempts are strictly rejected.",
         C_ACCENT_CY),
        ("Cross-Site Scripting (XSS)",
         "Server-side HTML sanitization using sanitize-html whitelist for article bodies and comments. Disallows script, iframe, and inline JS event handlers (e.g. onerror). Frontend escapes all rendered text by default.",
         C_ACCENT_GR),
        ("SQL Injection & Parameterization",
         "PostgreSQL ILIKE queries are fully parameterized via Prisma ORM. Raw search input escapes wildcard characters (%, _) to prevent denial of service and semantic leakage.",
         C_ACCENT_AM),
        ("File Upload Tampering",
         "Multer memory buffer inspected with magic-byte validation (JPEG: FF D8 FF, PNG: 89 50 4E, WebP: RIFF/WEBP). Disallows executable binaries and SVGs.",
         C_TEXT_PRI),
        ("Denial of Service & Concurrency",
         "Express-rate-limit bounds API bursts (100 req/min). PostgreSQL advisory locks (pg_advisory_xact_lock) prevent race conditions during Super Admin role updates.",
         C_ACCENT_BL)
    ]

    for i, (t_name, t_desc, t_col) in enumerate(threats):
        col = i % 3
        row = i // 3
        left = Inches(0.8 + col * 4.0)
        top  = Inches(1.7 + row * 2.5)
        add_card(s11, left, top, Inches(3.7), Inches(2.3), t_name, t_col)
        tb = s11.shapes.add_textbox(left + Inches(0.15), top + Inches(0.65), Inches(3.4), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = t_desc
        p.font.size = Pt(10)
        p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 12: Seed Corpus & Data Scale
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12)
    add_header(s12, "Seed Corpus & Data Scale Verification", "Corpus & Seeding", 12)

    # 4 Stat Counters
    stats = [
        ("80", "Total Original Articles", C_ACCENT_BL),
        ("72 / 8", "Published vs. Draft/Unpublished", C_ACCENT_CY),
        ("4 / 12", "Categories / Technical Tags", C_ACCENT_GR),
        ("100%", "Original Vietnamese Content", C_ACCENT_AM)
    ]

    for i, (num, label, col) in enumerate(stats):
        left = Inches(0.8 + i * 3.0)
        card = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.7), Inches(2.7), Inches(1.3))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = col
        card.line.width = Pt(1.5)

        tb = s12.shapes.add_textbox(left, Inches(1.75), Inches(2.7), Inches(0.6))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        p.text = num
        p.alignment = PP_ALIGN.CENTER
        p.font.name = "Segoe UI"
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = col

        tb2 = s12.shapes.add_textbox(left, Inches(2.4), Inches(2.7), Inches(0.5))
        tf2 = tb2.text_frame
        p2 = tf2.paragraphs[0]
        p2.text = label
        p2.alignment = PP_ALIGN.CENTER
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(10)
        p2.font.color.rgb = C_TEXT_SEC

    # Seed Details Cards
    c1 = add_card(s12, Inches(0.8), Inches(3.3), Inches(5.7), Inches(3.5), "Corpus Quality & Integrity", C_ACCENT_BL)
    tb1 = s12.shapes.add_textbox(Inches(1.0), Inches(3.9), Inches(5.3), Inches(2.7))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    pts1 = [
        "Zero Lorem Ipsum: Every article represents realistic, educational Vietnamese journalism covering AI, Quantum Computing, DevOps, and Cybersecurity.",
        "Word Count Standards: Validated by validate-seed.ts to contain at least 183 words per article, complete summary snippets, and structured HTML paragraphs.",
        "Taxonomy Coverage: Categorized into 'Trí tuệ nhân tạo', 'Khoa học máy tính', 'Kỹ thuật phần mềm', and 'An toàn thông tin'.",
        "Vector & Search Ready: Each document maintains both rich HTML markup and content_plain text for text processing and future vector embeddings."
    ]
    for i, pt in enumerate(pts1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(8)

    c2 = add_card(s12, Inches(6.8), Inches(3.3), Inches(5.7), Inches(3.5), "Idempotent Seed Engineering", C_ACCENT_CY)
    tb2 = s12.shapes.add_textbox(Inches(7.0), Inches(3.9), Inches(5.3), Inches(2.7))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Non-Destructive Execution: Re-running npm run db:seed does not duplicate records, wipe user accounts, or overwrite customized admin passwords.",
        "Deterministic Default Accounts: Seeds five pre-configured demo users across all roles (admin, manager, moderator, seo, user) with environment password fallback.",
        "Preserved Audit Trails: Seeding does not fabricate fake view counts or synthetic search logs; analytics reflect real user interactions only.",
        "Automated Verification: npm run db:validate-seed executes in CI to assert exact counts and integrity rules before deployments."
    ]
    for i, pt in enumerate(pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(8)

    # =========================================================================
    # SLIDE 13: Software Quality Assurance & Testing
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_bg(s13)
    add_header(s13, "Software Quality Assurance & Empirical Verification", "Testing & SQA", 13)

    # Top metrics
    c_vitest = add_card(s13, Inches(0.8), Inches(1.7), Inches(5.7), Inches(2.5), "Backend Integration Tests (Vitest)", C_ACCENT_GR)
    tb_v = s13.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(1.8))
    tf_v = tb_v.text_frame
    tf_v.word_wrap = True
    v_pts = [
        "24/24 Test Suites Passed in 7.32s across 10 test modules.",
        "Executed against real isolated PostgreSQL database (*_test).",
        "Covers: Auth & session rotation, RBAC permission matrices, last-admin concurrency guards, CSRF injection, SQL injection, MIME upload validation, and deduplication."
    ]
    for i, pt in enumerate(v_pts):
        p = tf_v.paragraphs[0] if i == 0 else tf_v.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(6)

    c_playwright = add_card(s13, Inches(6.8), Inches(1.7), Inches(5.7), Inches(2.5), "End-to-End Browser Tests (Playwright)", C_ACCENT_BL)
    tb_p = s13.shapes.add_textbox(Inches(7.0), Inches(2.3), Inches(5.3), Inches(1.8))
    tf_p = tb_p.text_frame
    tf_p.word_wrap = True
    p_pts = [
        "7/7 Core Browser Workflows Passed in 15.5s on Chromium.",
        "Simulates actual browser user journeys from login to logout.",
        "Covers: Content lifecycle, filtered search with linked clicks, comments & @mentions, report triage, SEO metadata saving, and mobile viewport responsiveness."
    ]
    for i, pt in enumerate(p_pts):
        p = tf_p.paragraphs[0] if i == 0 else tf_p.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(6)

    # Bottom Table: Traceability Summary
    c_tbl = add_card(s13, Inches(0.8), Inches(4.4), Inches(11.733), Inches(2.4), "Requirements Traceability Summary (T01 – T24)", None, C_CARD_BG2)
    tb_t = s13.shapes.add_textbox(Inches(1.0), Inches(4.9), Inches(11.3), Inches(1.7))
    tf_t = tb_t.text_frame
    tf_t.word_wrap = True
    t_rows = [
        "• T01–T03: Public listing pagination (10 items), published-only queries, unique registration — 100% PASS",
        "• T04–T07: HttpOnly session logout, permission middleware, full article CRUD, taxonomy constraints — 100% PASS",
        "• T08–T11: Owner-only comment edit, @mentions parsing, ratings [1,5] check, moderator hide/restore — 100% PASS",
        "• T12–T14: SEO whitelist edit, Super Admin advisory concurrency lock, core permissions guard — 100% PASS",
        "• T15–T20: ILIKE search, zero-result logging, click attribution, 30-min view deduplication, security tests — 100% PASS",
        "• T21–T24: 80 original articles seed, responsive UI (390px mobile no-overflow), audit logs & settings — 100% PASS"
    ]
    for i, r in enumerate(t_rows):
        p = tf_t.paragraphs[0] if i == 0 else tf_t.add_paragraph()
        p.text = r
        p.font.size = Pt(10)
        p.font.color.rgb = C_TEXT_PRI
        p.space_after = Pt(2)

    # =========================================================================
    # SLIDE 14: Gap Analysis & Architecture Enhancements
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    add_bg(s14)
    add_header(s14, "Architectural Gap Analysis & Engineering Fixes", "Enhancements & Audit", 14)

    gaps = [
        ("Gap 1: Dynamic SEO Meta Keywords Injection",
         "Initial State: SEO Specialists could curate seoKeywords in the admin panel, but the public ArticlePage was not rendering `<meta name=\"keywords\">`.\nFix: Injected meta keyword elements dynamically in React, ensuring search engines index curated terms seamlessly.",
         C_ACCENT_BL),
        ("Gap 2: Moderation Report Context & Direct Controls",
         "Initial State: GET /api/v1/moderation/reports returned report IDs without article slugs or inline comment action controls.\nFix: Enriched API responses with document slug and comment visibility status; added single-click article navigation and inline hide/restore buttons.",
         C_ACCENT_CY),
        ("Gap 3: Cookie Security Parity on Session Logout",
         "Initial State: Logout cleared portal.sid without explicit secure attribute, risking cookie mismatch on production HTTPS.\nFix: Enforced secure: env.NODE_ENV === 'production' in res.clearCookie(), matching strict production HTTPS cookie jar standards.",
         C_ACCENT_GR),
        ("Gap 4: Resilient Client API Error Handling",
         "Initial State: Bare response.json() in client.ts crashed on non-JSON 502/504 gateway or proxy responses.\nFix: Implemented safe JSON parsing with plain-text fallback, presenting friendly diagnostic error toasts to users.",
         C_ACCENT_AM)
    ]

    for i, (g_title, g_desc, g_col) in enumerate(gaps):
        col = i % 2
        row = i // 2
        left = Inches(0.8 + col * 6.0)
        top  = Inches(1.7 + row * 2.5)
        add_card(s14, left, top, Inches(5.7), Inches(2.2), g_title, g_col)
        tb = s14.shapes.add_textbox(left + Inches(0.2), top + Inches(0.65), Inches(5.3), Inches(1.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = g_desc
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 15: Deployment Strategy & DevOps Architecture
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    add_bg(s15)
    add_header(s15, "Deployment Architecture & Production Strategy", "DevOps & Cloud", 15)

    d1 = add_card(s15, Inches(0.8), Inches(1.7), Inches(3.6), Inches(4.8), "Frontend Edge (Vercel)", C_ACCENT_BL)
    tb1 = s15.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(3.2), Inches(4.0))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    d_pts1 = [
        "Static SPA Hosting: Highly optimized Vite production bundle distributed globally via Vercel Edge Network.",
        "Zero-CORS Same-Origin Proxying: vercel.json routes /api/*, /uploads/*, and /health/* directly to Render API backend.",
        "Cache Invalidation: Cache-Control: no-store and x-vercel-enable-rewrite-caching: 0 preserve dynamic logging and prevent stale API data.",
        "Security Headers: Automatic TLS encryption, X-Content-Type-Options: nosniff, and frameguard protections."
    ]
    for i, pt in enumerate(d_pts1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    d2 = add_card(s15, Inches(4.8), Inches(1.7), Inches(3.7), Inches(4.8), "Backend Container (Render)", C_ACCENT_CY)
    tb2 = s15.shapes.add_textbox(Inches(5.0), Inches(2.3), Inches(3.3), Inches(4.0))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    d_pts2 = [
        "Infrastructure as Code: Managed via render.yaml blueprint with Node.js 24 runtime and automatic deployment hooks.",
        "Safe Boot Sequence: Startup script executes prisma migrate deploy and idempotent db:seed before API server launch.",
        "Proxy Trust Configuration: TRUST_PROXY=1 ensures accurate client IP detection and Secure cookie negotiation behind cloud load balancers.",
        "Health Monitoring: Dedicated /health/ready endpoint probes database connectivity for zero-downtime rolling deploys."
    ]
    for i, pt in enumerate(d_pts2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    d3 = add_card(s15, Inches(8.9), Inches(1.7), Inches(3.6), Inches(4.8), "Local Dev & CI Pipeline", C_ACCENT_GR)
    tb3 = s15.shapes.add_textbox(Inches(9.1), Inches(2.3), Inches(3.2), Inches(4.0))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    d_pts3 = [
        "Docker Compose: Single-command orchestration for PostgreSQL 17 container with automated healthchecks.",
        "Zero-Docker Mode: npm run db:local runs native PostgreSQL with isolated data storage in .local/pgdata.",
        "GitHub Actions CI: Automated pipeline checks linting, TypeScript types, schema migrations, and full Vitest suite.",
        "Port Conflict Guard: Automated script checks port 3001/5173 availability, preventing EADDRINUSE on Windows."
    ]
    for i, pt in enumerate(d_pts3):
        p = tf3.paragraphs[0] if i == 0 else tf3.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    # =========================================================================
    # SLIDE 16: Phase 2 Roadmap & Future Enhancements
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    add_bg(s16)
    add_header(s16, "Phase 2 Evolution Roadmap", "Future Work", 16)

    roadmap = [
        ("Full-Text Search & Semantic Search (Phase 2 Target)",
         "Transition from Phase 1 SQL ILIKE to PostgreSQL tsvector/tsquery with Vietnamese dictionaries, BM25 relevance ranking, and semantic embeddings via pgvector for AI-driven article recommendations.",
         C_ACCENT_BL),
        ("Cloud Object Storage (S3 / Cloudinary)",
         "Replace local disk upload storage with AWS S3 or Cloudinary CDN storage to enable stateless multi-instance backend autoscaling and fast media distribution.",
         C_ACCENT_CY),
        ("Distributed Cache & WebSocket Push",
         "Introduce Redis for high-throughput distributed session caching, shared rate-limiting, and WebSocket / SSE for real-time notification push when articles are published or comments are replied to.",
         C_ACCENT_GR),
        ("Collaborative Real-Time Editor",
         "Integrate TipTap / ProseMirror with CRDTs (Yjs) allowing multiple authors and editors to collaborate on article drafts concurrently with live cursor tracking.",
         C_ACCENT_AM)
    ]

    for i, (title, desc, col) in enumerate(roadmap):
        col_idx = i % 2
        row_idx = i // 2
        left = Inches(0.8 + col_idx * 6.0)
        top  = Inches(1.7 + row_idx * 2.5)
        add_card(s16, left, top, Inches(5.7), Inches(2.2), title, col)
        tb = s16.shapes.add_textbox(left + Inches(0.2), top + Inches(0.65), Inches(5.3), Inches(1.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 17: Project Contributions & Teamwork Breakdown
    # =========================================================================
    s17 = prs.slides.add_slide(blank_layout)
    add_bg(s17)
    add_header(s17, "Project Contributions & Team Responsibilities", "Team & Contributions", 17)

    # Member 1 Card
    c_m1 = add_card(s17, Inches(0.8), Inches(1.7), Inches(5.7), Inches(4.8), "Trần Trung Tín (SE201619)", C_ACCENT_BL)
    tb1 = s17.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.0))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    m1_pts = [
        "Backend Architecture & REST API: Engineered Express modular routes for auth, documents, taxonomy, moderation, SEO, and audit.",
        "RBAC Security Matrix: Designed live database permission loading, permission keys, and advisory locking for Super Admin protection.",
        "Database Modeling: Authored Prisma schema, SQL CHECK constraints, 14 relational models, and composite index tuning.",
        "Search & Analytics Backend: Built SQL ILIKE search, search query logging, verified click attribution, and 30-min view deduplication.",
        "Quality Assurance: Authored Vitest unit/integration test suites (24 tests) and Docker Compose infrastructure."
    ]
    for i, pt in enumerate(m1_pts):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    # Member 2 Card
    c_m2 = add_card(s17, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.8), "Võ Hiếu Thắng (SE200932)", C_ACCENT_CY)
    tb2 = s17.shapes.add_textbox(Inches(7.0), Inches(2.3), Inches(5.3), Inches(4.0))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    m2_pts = [
        "Frontend SPA Architecture: Built React 18 client with React Router v6, TanStack Query v5, and Tailwind CSS design system.",
        "Public Portal & Engagement UX: Implemented responsive article feeds, category/tag filters, threaded comments, @mentions, and rating widgets.",
        "Admin Consoles: Created administrative dashboards for Content Managers, Moderators, SEO Specialists, and Super Admins.",
        "End-to-End Testing: Developed Playwright browser automation suites covering 7 core workflows and 390px mobile responsiveness.",
        "Cloud Deployment & Seed Corpus: Configured Vercel frontend rewrite proxies, Render blueprint, and curated 80-article educational seed corpus."
    ]
    for i, pt in enumerate(m2_pts):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(10)

    # =========================================================================
    # SLIDE 18: Q&A & Demonstration
    # =========================================================================
    s18 = prs.slides.add_slide(blank_layout)
    add_bg(s18)

    # Center hero card
    add_card(s18, Inches(1.8), Inches(1.2), Inches(9.733), Inches(5.1), "", C_ACCENT_BL, C_CARD_BG)
    tb = s18.shapes.add_textbox(Inches(2.0), Inches(1.6), Inches(9.333), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "THANK YOU!"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = "Segoe UI"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = C_ACCENT_CY

    p_sub = tf.add_paragraph()
    p_sub.text = "Điểm Mới — News & Digital Magazine Portal"
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.font.name = "Segoe UI"
    p_sub.font.size = Pt(18)
    p_sub.font.color.rgb = C_TEXT_PRI
    p_sub.space_after = Pt(20)

    p_demo = tf.add_paragraph()
    p_demo.text = "Ready for System Demonstration & Technical Q&A"
    p_demo.alignment = PP_ALIGN.CENTER
    p_demo.font.name = "Segoe UI"
    p_demo.font.size = Pt(14)
    p_demo.font.bold = True
    p_demo.font.color.rgb = C_ACCENT_GR
    p_demo.space_after = Pt(15)

    info_pts = [
        "Live Local URL: http://localhost:5173  |  REST API: http://127.0.0.1:3001/api/v1",
        "Demo Accounts: Super Admin (admin@demo.local), Manager (manager@demo.local), Moderator (moderator@demo.local), SEO (seo@demo.local)",
        "Students: Trần Trung Tín (SE201619) & Võ Hiếu Thắng (SE200932)",
        "FPT University — Capstone Course SEG301"
    ]
    for ipt in info_pts:
        p = tf.add_paragraph()
        p.text = ipt
        p.alignment = PP_ALIGN.CENTER
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_SEC
        p.space_after = Pt(4)

    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    out_dir = r"d:\0.University\01.FA26\SEG301\0.FinalProject\SEG301_FinalProject_Submission_SE201619_SE200932\01_Presentation_Slides"
    out_file = os.path.join(out_dir, "Presentation_DiemMoi_SEG301.pptx")
    create_presentation(out_file)

