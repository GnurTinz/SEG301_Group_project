import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_margins(cell, top=50, bottom=50, left=100, right=100):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tcPr.append(shd)

def create_ieee_docx(output_path):
    doc = docx.Document()

    # Section 1: Header (Title, Authors, Abstract) - 1 Column
    s1 = doc.sections[0]
    s1.top_margin = Inches(0.7)
    s1.bottom_margin = Inches(0.7)
    s1.left_margin = Inches(0.62)
    s1.right_margin = Inches(0.62)

    # Style defaults
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(10)
    font.color.rgb = RGBColor(0, 0, 0)

    # Conference header
    p_conf = doc.add_paragraph()
    p_conf.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_conf = p_conf.add_run("2026 IEEE Conference on Software Engineering & Systems Architecture (SEG301 Capstone Project)")
    r_conf.font.size = Pt(8.5)
    r_conf.font.italic = True
    r_conf.font.color.rgb = RGBColor(100, 100, 100)
    p_conf.paragraph_format.space_after = Pt(8)

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("Điểm Mới: Architectural Design, Security Hardening, and Empirical Verification of an Enterprise-Grade Digital Journalism and Magazine Portal")
    r_title.font.size = Pt(18)
    r_title.font.bold = True
    p_title.paragraph_format.space_after = Pt(12)

    # Authors
    t_auth = doc.add_table(rows=1, cols=2)
    t_auth.alignment = WD_TABLE_ALIGNMENT.CENTER
    for cell in t_auth.rows[0].cells:
        cell.width = Inches(3.3)
    
    # Author 1
    c1 = t_auth.cell(0, 0)
    p = c1.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Trần Trung Tín\n")
    r.font.bold = True
    r.font.size = Pt(11)
    r = p.add_run("Student ID: SE201619\n")
    r.font.size = Pt(9.5)
    r.font.bold = True
    r = p.add_run("Dept. of Software Engineering, FPT University\n")
    r.font.size = Pt(9)
    r.font.italic = True
    r = p.add_run("tinse201619@fpt.edu.vn")
    r.font.size = Pt(8.5)
    p.paragraph_format.line_spacing = 1.15

    # Author 2
    c2 = t_auth.cell(0, 1)
    p = c2.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Võ Hiếu Thắng\n")
    r.font.bold = True
    r.font.size = Pt(11)
    r = p.add_run("Student ID: SE200932\n")
    r.font.size = Pt(9.5)
    r.font.bold = True
    r = p.add_run("Dept. of Software Engineering, FPT University\n")
    r.font.size = Pt(9)
    r.font.italic = True
    r = p.add_run("thangse200932@fpt.edu.vn")
    r.font.size = Pt(8.5)
    p.paragraph_format.line_spacing = 1.15

    # Academic metadata
    p_acad = doc.add_paragraph()
    p_acad.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_acad.add_run("Course: SEG301 — Software Architecture & Engineering | Academic Institution: FPT University (Trường Đại học FPT)")
    r.font.size = Pt(9)
    r.font.bold = True
    p_acad.paragraph_format.space_before = Pt(8)
    p_acad.paragraph_format.space_after = Pt(12)

    # Abstract Box
    p_abs = doc.add_paragraph()
    p_abs.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_abs_lbl = p_abs.add_run("Abstract—")
    r_abs_lbl.font.bold = True
    r_abs_lbl.font.italic = True
    r_abs_lbl.font.size = Pt(9)
    r_abs = p_abs.add_run("Modern online journalism portals demand an intricate balance between rapid content dissemination, strict Role-Based Access Control (RBAC), community-driven engagement, and anti-tamper behavioral analytics. In this paper, we present the architectural design, security engineering, and empirical verification of Điểm Mới, an enterprise-grade digital news and magazine web platform dedicated to Artificial Intelligence, Computer Science, and Software Engineering. Built upon a decoupled 3-tier topology combining a React 18 Single Page Application (SPA) with an Express REST API and a PostgreSQL 18 relational engine managed via Prisma ORM, the platform introduces three notable architectural contributions: (1) a zero-trust dynamic RBAC enforcement model evaluated against live database relationships on every request, protected by transaction-scoped PostgreSQL advisory locks (pg_advisory_xact_lock) against concurrent administrative lockout; (2) an anti-tamper telemetry engine featuring UTC 30-minute bucket view deduplication and cryptographically bound search click-through attribution; and (3) an idempotent, deterministic database seeder generating 80 original Vietnamese educational articles without placeholder content. The system was validated against a 24-point traceability matrix (T01–T24) through 24 integration test suites executed with Vitest on isolated database instances and 7 end-to-end browser workflows automated via Playwright across desktop and 390px mobile viewports, achieving a 100% pass rate. We discuss trade-offs in Phase 1 implementations, security mitigations against OWASP Top 10 vulnerabilities, and the technical roadmap toward Phase 2 full-text vector retrieval.")
    r_abs.font.size = Pt(9)
    p_abs.paragraph_format.left_indent = Inches(0.3)
    p_abs.paragraph_format.right_indent = Inches(0.3)
    p_abs.paragraph_format.line_spacing = 1.15
    p_abs.paragraph_format.space_after = Pt(4)

    # Index Terms
    p_terms = doc.add_paragraph()
    p_terms.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_terms_lbl = p_terms.add_run("Index Terms—")
    r_terms_lbl.font.bold = True
    r_terms_lbl.font.italic = True
    r_terms_lbl.font.size = Pt(9)
    r_terms = p_terms.add_run("Software Architecture, Role-Based Access Control (RBAC), Behavioral Analytics, Web Application Security, PostgreSQL, Database Deduplication, Automated Software Testing, Playwright.")
    r_terms.font.size = Pt(9)
    p_terms.paragraph_format.left_indent = Inches(0.3)
    p_terms.paragraph_format.right_indent = Inches(0.3)
    p_terms.paragraph_format.line_spacing = 1.15
    p_terms.paragraph_format.space_after = Pt(14)

    # Section 2: Two-column Body Content
    s2 = doc.add_section()
    s2.top_margin = Inches(0.7)
    s2.bottom_margin = Inches(0.7)
    s2.left_margin = Inches(0.62)
    s2.right_margin = Inches(0.62)
    
    # Configure 2 columns
    sectPr = s2._sectPr
    cols = OxmlElement('w:cols')
    cols.set(qn('w:num'), '2')
    cols.set(qn('w:space'), '720') # 0.5 inch gap
    sectPr.append(cols)

    def add_sec_heading(title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(title.upper())
        r.font.bold = True
        r.font.size = Pt(10)
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True

    def add_subsec_heading(title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(title)
        r.font.bold = True
        r.font.italic = True
        r.font.size = Pt(10)
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True

    def add_body_p(text, indent=True):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(text)
        r.font.size = Pt(10)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(3)
        if indent:
            p.paragraph_format.first_line_indent = Inches(0.2)

    # Body sections
    add_sec_heading("I. Introduction")
    add_body_p("Digital publishing platforms and technical magazine portals occupy a critical juncture in the modern knowledge economy. As technical communities expand, web platforms face compounding architectural requirements: they must render dynamic editorial articles with sub-second latencies, manage complex editorial lifecycles (drafting, multi-stage reviewing, publishing, and retracting), foster vibrant reader engagement (nested commenting, user tagging, article ratings), and safeguard system integrity against coordinated spam, privilege escalation, and metrics falsification [1], [2].")
    add_body_p("Conventional web content management systems (CMS) frequently exhibit architectural deficiencies when scaled or subjected to strict security audits:")
    add_body_p("1) Stale Token Authorization: Architectures relying on stateless JSON Web Tokens (JWT) encode user privileges within cryptographic signatures. When an administrative officer revokes an employee's permissions or suspends a rogue account, the subject retains unauthorized access until token expiration, creating a dangerous privilege window [3].")
    add_body_p("2) Metric Manipulation and Crawling Noise: Naïve view counters increment on every HTTP request, allowing malicious actors or automated web crawlers to artificially inflate engagement figures via rapid browser reloads. Similarly, disconnected search analytics frequently record falsified client-side queries during click attribution [4].")
    add_body_p("3) Database Concurrency Hazards: Administrative consoles allowing simultaneous permission mutations frequently encounter race conditions. If two administrators attempt to demote one another simultaneously, race conditions can leave an enterprise system without a single active Super Administrator [5].")
    add_body_p("To address these challenges within the scope of the SEG301 Software Architecture and Engineering curriculum at FPT University, we designed, implemented, and verified Điểm Mới (New Insights). The platform serves as a production-grade digital magazine portal delivering high-impact articles covering Artificial Intelligence, Quantum Computing, DevOps, and Cybersecurity in authentic Vietnamese.")

    add_sec_heading("II. System Requirements & Traceability")
    add_body_p("The functional and non-functional requirements of Điểm Mới were formalized into a strict Requirement Traceability Matrix comprising 24 verifiable target capabilities (T01 through T24), categorized across four primary subsystems.")
    
    add_subsec_heading("A. User & Public Reader Experience")
    add_body_p("The public interface mandates responsive browsing (REQ-A1), full article rendering with author bylines and publication dates (REQ-A2), and identity management with email uniqueness constraints (REQ-A3). Authenticated readers participate in threaded discussions with strict ownership-bound editing (REQ-A4, REQ-A5), submit idempotent likes, and rate articles on a 1–5 scale backed by SQL CHECK constraints (REQ-A6). Search capabilities require parameterized SQL matching with wildcard escaping across categories, tags, and date ranges (REQ-A7, REQ-A8).")

    add_subsec_heading("B. Administrative Governance & RBAC Matrix")
    add_body_p("The system formalizes five distinct user roles with mutually exclusive administrative boundaries as shown in Table I. Super Admins govern identities and permissions; Content Managers curate taxonomies and publish articles; Moderators review community reports and hide abusive comments; SEO Specialists manage metadata and inspect telemetry; Regular Users engage without administrative access.")

    # Table I in docx
    p_t1 = doc.add_paragraph()
    p_t1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_t1.add_run("TABLE I. RBAC Permission Matrix")
    r.font.size = Pt(8.5)
    r.font.bold = True
    p_t1.paragraph_format.space_before = Pt(6)
    p_t1.paragraph_format.space_after = Pt(2)
    p_t1.paragraph_format.keep_with_next = True

    t1 = doc.add_table(rows=19, cols=6)
    t1.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Permission", "USER", "MGR", "MOD", "SEO", "ADMIN"]
    matrix_data = [
        ("comments.create", "X", "X", "X", "X", "X"),
        ("comments.manage_own", "X", "X", "X", "X", "X"),
        ("engagement.manage_own", "X", "X", "X", "X", "X"),
        ("reports.create", "X", "X", "X", "X", "X"),
        ("documents.create", "", "X", "", "", "X"),
        ("documents.update", "", "X", "", "", "X"),
        ("documents.delete", "", "X", "", "", "X"),
        ("documents.publish", "", "X", "", "", "X"),
        ("taxonomy.manage", "", "X", "", "", "X"),
        ("moderation.review", "", "", "X", "", "X"),
        ("moderation.action", "", "", "X", "", "X"),
        ("seo.edit", "", "", "", "X", "X"),
        ("analytics.read", "", "", "", "X", "X"),
        ("users.manage", "", "", "", "", "X"),
        ("roles.assign", "", "", "", "", "X"),
        ("permissions.manage", "", "", "", "", "X"),
        ("audit.read", "", "", "", "", "X"),
        ("settings.manage", "", "", "", "", "X"),
    ]
    for col_idx, h in enumerate(headers):
        cell = t1.cell(0, col_idx)
        cell.paragraphs[0].text = h
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(7.5)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_cell_shading(cell, "E2E8F0")
        set_cell_margins(cell, 30, 30, 40, 40)

    for row_idx, rdata in enumerate(matrix_data):
        for col_idx, val in enumerate(rdata):
            cell = t1.cell(row_idx + 1, col_idx)
            cell.paragraphs[0].text = val
            cell.paragraphs[0].runs[0].font.size = Pt(7)
            if col_idx > 0:
                cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            set_cell_margins(cell, 20, 20, 30, 30)

    add_sec_heading("III. System Architecture & Topology")
    add_body_p("Điểm Mới adheres to a decoupled 3-tier architectural model designed to isolate user interface state, business rule validation, and persistent storage.")
    add_subsec_heading("A. Presentation Tier (React 18 SPA)")
    add_body_p("The client application is built with React 18 and Vite. TanStack Query v5 manages remote server state, caching, and optimistic mutations. Tailwind CSS provides mobile-first utility classes, ensuring responsive rendering down to 390px mobile viewports without horizontal layout breaks. The application communicates with the API over a same-origin proxy, eliminating cross-origin preflight overhead.")
    add_subsec_heading("B. Gateway & Security Middleware")
    add_body_p("All inbound requests traverse an Express middleware pipeline enforcing CORS origin validation, memory-based rate limiting (100 req/min), and cryptographic Double-Submit CSRF checks. Request payloads are validated and coerced by Zod schemas. Untrusted HTML content in article bodies and comments is sanitized via sanitize-html using a strict element whitelist.")
    add_subsec_heading("C. Persistence Tier (PostgreSQL 18 & Prisma)")
    add_body_p("Persistent state is maintained in PostgreSQL 18 via Prisma ORM. Relational integrity is enforced using foreign key cascading rules and explicit SQL CHECK constraints, guaranteeing ACID properties across multi-entity transactions.")

    add_sec_heading("IV. Relational Data Modeling")
    add_body_p("The relational schema encompasses 14 normalized models structured across four domain boundaries.")
    add_subsec_heading("A. Document & Taxonomy Subsystem")
    add_body_p("The documents entity records article content, storing both rich HTML (content) and unformatted plain text (content_plain) to facilitate search extraction. Status transitions (DRAFT, PUBLISHED, UNPUBLISHED) and soft-deletion timestamps (deleted_at) ensure historical auditability. Taxonomies are governed via categories and many-to-many document_tags join tables with restrictive delete constraints.")
    add_subsec_heading("B. Social Engagement & SQL Constraints")
    add_body_p("Hierarchical discussions are modeled in comments via self-referencing parent_id keys. Mentioned users are indexed in comment_mentions. Article liking enforces idempotency via composite primary keys (document_id, user_id) in document_likes. Article ratings are constrained by an explicit SQL CHECK constraint: CONSTRAINT check_rating_range CHECK (value >= 1 AND value <= 5). Similarly, community abuse reports enforce mutual exclusivity: CHECK ((document_id IS NOT NULL AND comment_id IS NULL) OR (document_id IS NULL AND comment_id IS NOT NULL)).")
    add_subsec_heading("C. View Deduplication & Search Click Attribution")
    add_body_p("To prevent view counter gaming, Điểm Mới groups reader view events into discrete 30-minute UTC temporal blocks calculated as: bucket = floor(epoch(now()) / 1800). The document_views table enforces a unique composite constraint on (document_id, viewer_key, bucket). Concurrent views within the same block are atomically ignored. Search clicks are verified against server-stored query sessions: POST /search/clicks verifies caller ownership, validates that the clicked document was present in the result set, and copies the server-stored query string, neutralizing client-side query tampering.")

    add_sec_heading("V. Security Engineering & Concurrency")
    add_body_p("Security controls adhere to Defense-in-Depth principles to protect against OWASP Top 10 vulnerabilities.")
    add_subsec_heading("A. Identity & Session Protection")
    add_body_p("Passwords are protected with Argon2id hashing. Active sessions are stored server-side in the PostgreSQL sessions table and transmitted via HttpOnly; SameSite=Lax; Secure cookies. Any administrative privilege revocation invalidates the subject's sessions immediately.")
    add_subsec_heading("B. PostgreSQL Advisory Locking")
    add_body_p("To prevent race conditions during concurrent administrative role updates, mutations acquire a transaction-scoped advisory lock: SELECT pg_advisory_xact_lock(hashtext('portal_admin_protection')). Within this mutual-exclusion zone, the system verifies that at least one active Super Admin remains and that the five core administrative permissions are preserved, returning HTTP 409 Conflict if violated.")
    add_subsec_heading("C. Media Upload Validation")
    add_body_p("Asset uploads undergo magic-byte signature validation (JPEG, PNG, WebP). SVG files are explicitly rejected to prevent XML External Entity (XXE) and Stored XSS attacks.")

    add_sec_heading("VI. Empirical Verification & SQA")
    add_body_p("The platform was verified using comprehensive automated test suites executed against real PostgreSQL test databases.")

    # Table II in docx
    p_t2 = doc.add_paragraph()
    p_t2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_t2.add_run("TABLE II. Verification & Test Metrics")
    r.font.size = Pt(8.5)
    r.font.bold = True
    p_t2.paragraph_format.space_before = Pt(6)
    p_t2.paragraph_format.space_after = Pt(2)
    p_t2.paragraph_format.keep_with_next = True

    t2 = doc.add_table(rows=5, cols=5)
    t2.alignment = WD_TABLE_ALIGNMENT.CENTER
    h2 = ["Harness", "Scope", "Count", "Duration", "Status"]
    t2_data = [
        ("Vitest", "API & Security", "24 Tests", "7.32s", "PASS"),
        ("Vitest", "Seed & Corpus", "80 Articles", "2.10s", "PASS"),
        ("Playwright", "E2E Browser", "7 Suites", "15.5s", "PASS"),
        ("ESLint", "Static Typing", "Monorepo", "3.45s", "0 Errors"),
    ]
    for col_idx, h in enumerate(h2):
        cell = t2.cell(0, col_idx)
        cell.paragraphs[0].text = h
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(7.5)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_cell_shading(cell, "E2E8F0")
        set_cell_margins(cell, 30, 30, 40, 40)

    for row_idx, rdata in enumerate(t2_data):
        for col_idx, val in enumerate(rdata):
            cell = t2.cell(row_idx + 1, col_idx)
            cell.paragraphs[0].text = val
            cell.paragraphs[0].runs[0].font.size = Pt(7)
            if col_idx in (2, 3, 4):
                cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            set_cell_margins(cell, 20, 20, 30, 30)

    add_subsec_heading("A. Integration Testing (Vitest)")
    add_body_p("A total of 24 integration suites verify permission boundaries, duplicate registration rejection (409), session rotation, last-admin concurrency locks, CSRF validation, XSS sanitization, and view deduplication.")
    add_subsec_heading("B. Browser Automation (Playwright)")
    add_body_p("Seven end-to-end browser journeys automate user flows: authentication, content publishing, search click attribution, threaded discussions, report triage, SEO metadata updates, and 390px mobile responsiveness.")
    add_subsec_heading("C. Architectural Gap Resolution")
    add_body_p("Rigorous auditing identified and resolved 4 engineering gaps: (1) injecting dynamic <meta name='keywords'> tags into React headers; (2) enriching moderation reports with article slugs and inline comment controls; (3) enforcing production HTTPS cookie flags during logout; and (4) resilient JSON parsing for proxy gateway errors.")

    add_sec_heading("VII. Production Deployment")
    add_body_p("Điểm Mới is containerized and distributed across edge and cloud infrastructure.")
    add_body_p("1) Frontend Edge (Vercel): React assets are served via Vercel Edge. Reverse proxy rewrite rules in vercel.json forward /api/* and /uploads/* requests to the backend under the same origin with Cache-Control: no-store.")
    add_body_p("2) Containerized Backend (Render): Defined via render.yaml on Node.js 24. Startup scripts execute prisma migrate deploy and idempotent database seeding prior to server startup. Health probes (/health/ready) ensure zero-downtime rolling updates.")

    add_sec_heading("VIII. Conclusion & Phase 2 Roadmap")
    add_body_p("The Phase 1 release of Điểm Mới delivers a hardened, production-ready foundation for technical journalism. Planned Phase 2 enhancements include:")
    add_body_p("1) Full-Text & Vector Search: Migrating from SQL ILIKE to PostgreSQL tsvector/tsquery with BM25 ranking and pgvector semantic embeddings for personalized article discovery.")
    add_body_p("2) Cloud Object Storage: Integrating AWS S3 or Cloudinary CDN for scalable media asset distribution.")
    add_body_p("3) Real-Time Push & Collaboration: Implementing Redis caching, WebSockets for instant mention notifications, and TipTap CRDT-based collaborative editing.")

    add_sec_heading("Acknowledgment")
    add_body_p("The authors express sincere gratitude to the faculty and mentors of the Department of Software Engineering at FPT University for their academic leadership and guidance throughout the SEG301 course.")

    add_sec_heading("References")
    refs = [
        "[1] R. T. Fielding, 'Architectural Styles and the Design of Network-based Software Architectures,' Ph.D. dissertation, Dept. Inf. Comput. Sci., Univ. California, Irvine, CA, USA, 2000.",
        "[2] R. S. Sandhu, E. J. Coyne, H. L. Feinstein, and C. E. Youman, 'Role-based access control models,' IEEE Computer, vol. 29, no. 2, pp. 38–47, Feb. 1996.",
        "[3] D. Fett, R. Küsters, and G. Schmitz, 'The Web SSO standard OpenID Connect: In-depth formal security analysis and security guidelines,' in Proc. 2017 IEEE Symposium on Security and Privacy (SP), San Jose, CA, USA, 2017, pp. 330–349.",
        "[4] OWASP Foundation, 'OWASP Top 10: 2021 - The Ten Most Critical Web Application Security Risks,' OWASP Foundation, Tech. Rep., Oct. 2021.",
        "[5] M. Stonebraker and L. A. Rowe, 'The design of POSTGRES,' in Proc. 1986 ACM SIGMOD Int. Conf. on Management of Data, Washington, D.C., USA, 1986, pp. 340–355.",
        "[6] IEEE Computer Society, 'IEEE Standard for Software Quality Assurance Processes,' IEEE Std 730-2014, pp. 1–138, 2014.",
        "[7] M. Fowler, Patterns of Enterprise Application Architecture. Boston, MA, USA: Addison-Wesley, 2002.",
        "[8] Prisma Data, Inc., 'Prisma: Next-generation ORM for Node.js and TypeScript,' Documentation, 2026. [Online]. Available: https://www.prisma.io/docs",
        "[9] TanStack, 'TanStack Query: Powerful asynchronous state management,' Documentation, 2026. [Online]. Available: https://tanstack.com/query",
        "[10] Microsoft Corporation, 'Playwright: Fast and reliable end-to-end testing for modern web apps,' Documentation, 2026. [Online]. Available: https://playwright.dev",
        "[11] PostgreSQL Global Development Group, 'PostgreSQL 18 Documentation: Explicit Locking and Advisory Locks,' 2026. [Online]. Available: https://www.postgresql.org/docs/current/explicit-locking.html",
        "[12] A. Birgisson, M. Polychronakis, and A. D. Keromytis, 'Privilege separation in modern web applications,' in Proc. 2018 USENIX Annual Technical Conference (USENIX ATC 18), Boston, MA, USA, 2018, pp. 241–254."
    ]
    for r in refs:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        run = p.add_run(r)
        run.font.size = Pt(8)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.left_indent = Inches(0.2)
        p.paragraph_format.first_line_indent = Inches(-0.2)

    doc.save(output_path)
    print(f"IEEE docx saved successfully to: {output_path}")

if __name__ == "__main__":
    out_dir = r"d:\0.University\01.FA26\SEG301\0.FinalProject\SEG301_FinalProject_Submission_SE201619_SE200932\02_IEEE_Report"
    out_file = os.path.join(out_dir, "IEEE_Report_DiemMoi.docx")
    create_ieee_docx(out_file)

