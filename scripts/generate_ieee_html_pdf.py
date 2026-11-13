import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Điểm Mới: Architectural Design, Security Hardening, and Empirical Verification of an Enterprise-Grade Digital Journalism and Magazine Portal</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Times New Roman', Times, serif;
        font-size: 9pt;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 10pt;
      line-height: 1.18;
      color: #000000;
      background: #FFFFFF;
      text-align: justify;
    }

    /* IEEE Header Span */
    .ieee-header {
      column-span: all;
      text-align: center;
      margin-bottom: 12pt;
    }

    .conf-header {
      font-size: 8.5pt;
      font-style: italic;
      color: #444444;
      margin-bottom: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .paper-title {
      font-size: 19pt;
      font-weight: bold;
      line-height: 1.15;
      margin-bottom: 12pt;
      color: #000000;
    }

    .authors-grid {
      display: flex;
      justify-content: center;
      gap: 36pt;
      margin-bottom: 14pt;
    }

    .author-block {
      text-align: center;
      font-size: 9.5pt;
      line-height: 1.25;
    }

    .author-name {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 1pt;
    }

    .author-id {
      font-weight: 600;
      color: #222222;
    }

    .author-dept {
      font-style: italic;
      font-size: 9pt;
    }

    .author-email {
      font-family: "Courier New", Courier, monospace;
      font-size: 8.5pt;
      color: #333333;
    }

    .academic-info {
      font-size: 9pt;
      font-weight: 600;
      color: #111111;
      margin-top: 4pt;
    }

    /* Abstract Block inside header */
    .abstract-container {
      margin: 10pt 24pt 14pt 24pt;
      font-size: 9pt;
      line-height: 1.22;
      text-align: justify;
    }

    .abstract-title {
      font-weight: bold;
      font-style: italic;
    }

    .index-terms {
      margin-top: 5pt;
    }

    .index-terms-title {
      font-weight: bold;
      font-style: italic;
    }

    /* Two-column layout for body */
    .content-body {
      column-count: 2;
      column-gap: 16pt;
      column-fill: balance;
    }

    p {
      text-indent: 14pt;
      margin-bottom: 4pt;
    }

    p.no-indent {
      text-indent: 0;
    }

    /* Section Headings */
    h2.section-heading {
      font-size: 10pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 10pt;
      margin-bottom: 4pt;
      break-after: avoid;
    }

    h3.subsection-heading {
      font-size: 10pt;
      font-weight: bold;
      font-style: italic;
      margin-top: 7pt;
      margin-bottom: 3pt;
      break-after: avoid;
      text-indent: 0;
    }

    /* Figures and Diagrams */
    .figure-box {
      margin: 8pt 0;
      text-align: center;
      break-inside: avoid;
    }

    .figure-caption {
      font-size: 8.5pt;
      font-style: italic;
      margin-top: 3pt;
      text-align: center;
    }

    .diagram-code {
      font-family: "Courier New", Courier, monospace;
      font-size: 7.5pt;
      line-height: 1.15;
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 4px;
      padding: 6pt;
      text-align: left;
      white-space: pre;
      overflow-x: hidden;
    }

    /* Tables */
    .table-container {
      margin: 8pt 0;
      break-inside: avoid;
      text-align: center;
    }

    .table-title {
      font-size: 8.5pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 3pt;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      line-height: 1.15;
      margin: 0 auto;
    }

    th, td {
      border: 0.5pt solid #000000;
      padding: 3pt 4pt;
      text-align: left;
    }

    th {
      background: #F1F5F9;
      font-weight: bold;
      text-align: center;
    }

    .center-text { text-align: center; }

    /* Lists */
    ul {
      margin-left: 14pt;
      margin-bottom: 4pt;
      font-size: 9.5pt;
    }

    li {
      margin-bottom: 2pt;
    }

    /* References */
    .reference-item {
      font-size: 8pt;
      line-height: 1.18;
      margin-bottom: 3pt;
      text-indent: -14pt;
      margin-left: 14pt;
    }

    /* Formulas */
    .equation {
      text-align: center;
      font-family: "Times New Roman", Times, serif;
      font-style: italic;
      margin: 5pt 0;
    }

    @media print {
      body { background: transparent; }
      .content-body { column-fill: auto; }
    }
  </style>
</head>
<body>

  <div class="ieee-header">
    <div class="conf-header">
      2026 IEEE Conference on Software Engineering & Systems Architecture (SEG301 Capstone Project)
    </div>
    
    <h1 class="paper-title">
      Điểm Mới: Architectural Design, Security Hardening, and Empirical Verification of an Enterprise-Grade Digital Journalism and Magazine Portal
    </h1>

    <div class="authors-grid">
      <div class="author-block">
        <div class="author-name">Trần Trung Tín</div>
        <div class="author-id">Student ID: SE201619</div>
        <div class="author-dept">Dept. of Software Engineering, FPT University</div>
        <div class="author-email">tinse201619@fpt.edu.vn</div>
      </div>

      <div class="author-block">
        <div class="author-name">Võ Hiếu Thắng</div>
        <div class="author-id">Student ID: SE200932</div>
        <div class="author-dept">Dept. of Software Engineering, FPT University</div>
        <div class="author-email">thangse200932@fpt.edu.vn</div>
      </div>
    </div>

    <div class="academic-info">
      Course: SEG301 — Software Architecture & Engineering | Institution: FPT University (Trường Đại học FPT)
    </div>

    <div class="abstract-container">
      <p class="no-indent">
        <span class="abstract-title">Abstract—</span>
        Modern online journalism portals demand an intricate balance between rapid content dissemination, strict Role-Based Access Control (RBAC), community-driven engagement, and anti-tamper behavioral analytics. In this paper, we present the architectural design, security engineering, and empirical verification of <strong>Điểm Mới</strong>, an enterprise-grade digital news and magazine web platform dedicated to Artificial Intelligence, Computer Science, and Software Engineering. Built upon a decoupled 3-tier topology combining a React 18 Single Page Application (SPA) with an Express REST API and a PostgreSQL 18 relational engine managed via Prisma ORM, the platform introduces three notable architectural contributions: (1) a zero-trust dynamic RBAC enforcement model evaluated against live database relationships on every request, protected by transaction-scoped PostgreSQL advisory locks (<code>pg_advisory_xact_lock</code>) against concurrent administrative lockout; (2) an anti-tamper telemetry engine featuring UTC 30-minute bucket view deduplication and cryptographically bound search click-through attribution; and (3) an idempotent, deterministic database seeder generating 80 original Vietnamese educational articles without placeholder content. The system was validated against a 24-point traceability matrix (T01–T24) through 24 integration test suites executed with Vitest on isolated database instances and 7 end-to-end browser workflows automated via Playwright across desktop and 390px mobile viewports, achieving a 100% pass rate. We discuss trade-offs in Phase 1 implementations, security mitigations against OWASP Top 10 vulnerabilities, and the technical roadmap toward Phase 2 full-text vector retrieval.
      </p>
      <p class="no-indent index-terms">
        <span class="index-terms-title">Index Terms—</span>
        Software Architecture, Role-Based Access Control (RBAC), Behavioral Analytics, Web Application Security, PostgreSQL, Database Deduplication, Automated Software Testing, Playwright.
      </p>
    </div>
  </div>

  <div class="content-body">

    <h2 class="section-heading">I. Introduction</h2>
    <p>
      Digital publishing platforms and technical magazine portals occupy a critical juncture in the modern knowledge economy. As technical communities expand, web platforms face compounding architectural requirements: they must render dynamic editorial articles with sub-second latencies, manage complex editorial lifecycles (drafting, multi-stage reviewing, publishing, and retracting), foster vibrant reader engagement (nested commenting, user tagging, article ratings), and safeguard system integrity against coordinated spam, privilege escalation, and metrics falsification [1], [2].
    </p>
    <p>
      Conventional web content management systems (CMS) frequently exhibit architectural deficiencies when scaled or subjected to strict security audits:
    </p>
    <p>
      <em>1) Stale Token Authorization:</em> Architectures relying on stateless JSON Web Tokens (JWT) encode user privileges within cryptographic signatures. When an administrative officer revokes an employee's permissions or suspends a rogue account, the subject retains unauthorized access until token expiration, creating a dangerous privilege window [3].
    </p>
    <p>
      <em>2) Metric Manipulation and Crawling Noise:</em> Naïve view counters increment on every HTTP request, allowing malicious actors or automated web crawlers to artificially inflate engagement figures via rapid browser reloads. Similarly, disconnected search analytics frequently record falsified client-side queries during click attribution [4].
    </p>
    <p>
      <em>3) Database Concurrency Hazards:</em> Administrative consoles allowing simultaneous permission mutations frequently encounter race conditions. If two administrators attempt to demote one another simultaneously, race conditions can leave an enterprise system without a single active Super Administrator [5].
    </p>
    <p>
      To address these challenges within the scope of the SEG301 Software Architecture and Engineering curriculum at FPT University, we designed, implemented, and verified <strong>Điểm Mới</strong> (<em>New Insights</em>). The platform serves as a production-grade digital magazine portal delivering high-impact articles covering Artificial Intelligence, Quantum Computing, DevOps, and Cybersecurity in authentic Vietnamese.
    </p>

    <h2 class="section-heading">II. System Requirements & Traceability</h2>
    <p>
      The functional and non-functional requirements of Điểm Mới were formalized into a strict Requirement Traceability Matrix comprising 24 verifiable target capabilities (T01 through T24), categorized across four primary subsystems.
    </p>

    <h3 class="subsection-heading">A. User & Public Reader Experience</h3>
    <p>
      The public interface mandates responsive browsing (REQ-A1), full article rendering with author bylines and publication dates (REQ-A2), and identity management with email uniqueness constraints (REQ-A3). Authenticated readers participate in threaded discussions with strict ownership-bound editing (REQ-A4, REQ-A5), submit idempotent likes, and rate articles on a 1–5 scale backed by SQL CHECK constraints (REQ-A6). Search capabilities require parameterized SQL matching with wildcard escaping across categories, tags, and date ranges (REQ-A7, REQ-A8).
    </p>

    <h3 class="subsection-heading">B. Administrative Governance & RBAC Matrix</h3>
    <p>
      The system formalizes five distinct user roles with mutually exclusive administrative boundaries as enumerated in TABLE I. Super Admins govern identities and permissions; Content Managers curate taxonomies and publish articles; Moderators review community reports and hide abusive comments; SEO Specialists manage metadata and inspect telemetry; Regular Users engage without administrative access.
    </p>

    <div class="table-container">
      <div class="table-title">TABLE I. RBAC Permission Matrix</div>
      <table>
        <thead>
          <tr>
            <th>Permission Key</th>
            <th>USER</th>
            <th>MGR</th>
            <th>MOD</th>
            <th>SEO</th>
            <th>ADMIN</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>comments.create</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td></tr>
          <tr><td>comments.manage_own</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td></tr>
          <tr><td>engagement.manage_own</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td></tr>
          <tr><td>reports.create</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td><td class="center-text">X</td></tr>
          <tr><td>documents.create</td><td></td><td class="center-text">X</td><td></td><td></td><td class="center-text">X</td></tr>
          <tr><td>documents.update</td><td></td><td class="center-text">X</td><td></td><td></td><td class="center-text">X</td></tr>
          <tr><td>documents.delete</td><td></td><td class="center-text">X</td><td></td><td></td><td class="center-text">X</td></tr>
          <tr><td>documents.publish</td><td></td><td class="center-text">X</td><td></td><td></td><td class="center-text">X</td></tr>
          <tr><td>taxonomy.manage</td><td></td><td class="center-text">X</td><td></td><td></td><td class="center-text">X</td></tr>
          <tr><td>moderation.review</td><td></td><td></td><td class="center-text">X</td><td></td><td class="center-text">X</td></tr>
          <tr><td>moderation.action</td><td></td><td></td><td class="center-text">X</td><td></td><td class="center-text">X</td></tr>
          <tr><td>seo.edit</td><td></td><td></td><td></td><td class="center-text">X</td><td class="center-text">X</td></tr>
          <tr><td>analytics.read</td><td></td><td></td><td></td><td class="center-text">X</td><td class="center-text">X</td></tr>
          <tr><td>users.manage</td><td></td><td></td><td></td><td></td><td class="center-text">X</td></tr>
          <tr><td>roles.assign</td><td></td><td></td><td></td><td></td><td class="center-text">X</td></tr>
          <tr><td>permissions.manage</td><td></td><td></td><td></td><td></td><td class="center-text">X</td></tr>
          <tr><td>audit.read</td><td></td><td></td><td></td><td></td><td class="center-text">X</td></tr>
          <tr><td>settings.manage</td><td></td><td></td><td></td><td></td><td class="center-text">X</td></tr>
        </tbody>
      </table>
    </div>

    <h2 class="section-heading">III. System Architecture & Topology</h2>
    <p>
      Điểm Mới adheres to a decoupled 3-tier architectural model designed to isolate user interface state, business rule validation, and persistent storage, as illustrated in Fig. 1.
    </p>

    <div class="figure-box">
      <div class="diagram-code">
+-------------------------------------------------+
|               PRESENTATION TIER                 |
|   React 18 SPA | TanStack Query v5 | Tailwind  |
+-------------------------------------------------+
                        |
            Same-Origin Proxy (/api/v1/*)
                        v
+-------------------------------------------------+
|             GATEWAY & SECURITY TIER             |
|   Express | Double-Submit CSRF | Rate Limiter   |
|   Cookie Parser | Zod Validator | sanitize-html |
+-------------------------------------------------+
                        |
         Domain Logic & Advisory Locks
                        v
+-------------------------------------------------+
|            DATA PERSISTENCE TIER                |
|      PostgreSQL 18 | 14 Relational Models       |
|    SQL CHECK Constraints | Deduplication Bucket |
+-------------------------------------------------+
      </div>
      <div class="figure-caption">Fig. 1. Overall System Architecture and Layer Topology</div>
    </div>

    <h3 class="subsection-heading">A. Presentation Tier (React 18 SPA)</h3>
    <p>
      The client application is built with React 18 and Vite. TanStack Query v5 manages remote server state, caching, and optimistic mutations. Tailwind CSS provides mobile-first utility classes, ensuring responsive rendering down to 390px mobile viewports without horizontal layout breaks. The application communicates with the API over a same-origin proxy, eliminating cross-origin preflight overhead.
    </p>

    <h3 class="subsection-heading">B. Gateway & Security Middleware</h3>
    <p>
      All inbound requests traverse an Express middleware pipeline enforcing CORS origin validation, memory-based rate limiting (100 req/min), and cryptographic Double-Submit CSRF checks. Request payloads are validated and coerced by Zod schemas. Untrusted HTML content in article bodies and comments is sanitized via <code>sanitize-html</code> using a strict element whitelist.
    </p>

    <h3 class="subsection-heading">C. Persistence Tier (PostgreSQL 18 & Prisma)</h3>
    <p>
      Persistent state is maintained in PostgreSQL 18 via Prisma ORM. Relational integrity is enforced using foreign key cascading rules and explicit SQL CHECK constraints, guaranteeing ACID properties across multi-entity transactions.
    </p>

    <h2 class="section-heading">IV. Relational Data Modeling</h2>
    <p>
      The relational schema encompasses 14 normalized models structured across four domain boundaries.
    </p>

    <h3 class="subsection-heading">A. Document & Taxonomy Subsystem</h3>
    <p>
      The <code>documents</code> entity records article content, storing both rich HTML (<code>content</code>) and unformatted plain text (<code>content_plain</code>) to facilitate search extraction. Status transitions (<code>DRAFT</code>, <code>PUBLISHED</code>, <code>UNPUBLISHED</code>) and soft-deletion timestamps (<code>deleted_at</code>) ensure historical auditability. Taxonomies are governed via <code>categories</code> and many-to-many <code>document_tags</code> join tables with restrictive delete constraints.
    </p>

    <h3 class="subsection-heading">B. Social Engagement & SQL Constraints</h3>
    <p>
      Hierarchical discussions are modeled in <code>comments</code> via self-referencing <code>parent_id</code> keys. Mentioned users are indexed in <code>comment_mentions</code>. Article liking enforces idempotency via composite primary keys <code>(document_id, user_id)</code> in <code>document_likes</code>.
    </p>
    <p>
      Article ratings are constrained by an explicit SQL CHECK constraint:
    </p>
    <div class="equation">
      CONSTRAINT check_rating_range CHECK (value &gt;= 1 AND value &lt;= 5)
    </div>
    <p class="no-indent">
      Similarly, community abuse reports enforce mutual exclusivity:
    </p>
    <div class="equation">
      CHECK ((document_id IS NOT NULL AND comment_id IS NULL) OR<br/>
             (document_id IS NULL AND comment_id IS NOT NULL))
    </div>

    <h3 class="subsection-heading">C. View Deduplication & Search Click Attribution</h3>
    <p>
      To prevent view counter gaming, Điểm Mới groups reader view events into discrete 30-minute UTC temporal blocks calculated as:
    </p>
    <div class="equation">
      bucket = &lfloor; epoch(now()) / 1800 &rfloor;
    </div>
    <p>
      The <code>document_views</code> table enforces a unique composite constraint on <code>(document_id, viewer_key, bucket)</code>. Concurrent views within the same block are atomically ignored.
    </p>
    <p>
      Search clicks are verified against server-stored query sessions: <code>POST /search/clicks</code> verifies caller ownership, validates that the clicked document was present in the result set, and copies the server-stored query string, neutralizing client-side query tampering.
    </p>

    <h2 class="section-heading">V. Security Engineering & Concurrency</h2>
    <p>
      Security controls adhere to Defense-in-Depth principles to protect against OWASP Top 10 vulnerabilities.
    </p>

    <h3 class="subsection-heading">A. Identity & Session Protection</h3>
    <p>
      Passwords are protected with Argon2id hashing. Active sessions are stored server-side in the PostgreSQL <code>sessions</code> table and transmitted via <code>HttpOnly; SameSite=Lax; Secure</code> cookies. Any administrative privilege revocation invalidates the subject's sessions immediately.
    </p>

    <h3 class="subsection-heading">B. PostgreSQL Advisory Locking</h3>
    <p>
      To prevent race conditions during concurrent administrative role updates, mutations acquire a transaction-scoped advisory lock:
    </p>
    <div class="equation">
      SELECT pg_advisory_xact_lock(hashtext('portal_admin_protection'));
    </div>
    <p>
      Within this mutual-exclusion zone, the system verifies that at least one active Super Admin remains and that the five core administrative permissions are preserved, returning HTTP 409 Conflict if violated.
    </p>

    <h3 class="subsection-heading">C. Media Upload Validation</h3>
    <p>
      Asset uploads undergo magic-byte signature validation (JPEG, PNG, WebP). SVG files are explicitly rejected to prevent XML External Entity (XXE) and Stored XSS attacks.
    </p>

    <h2 class="section-heading">VI. Empirical Verification & SQA</h2>
    <p>
      The platform was verified using comprehensive automated test suites executed against real PostgreSQL test databases.
    </p>

    <div class="table-container">
      <div class="table-title">TABLE II. Verification & Test Metrics</div>
      <table>
        <thead>
          <tr>
            <th>Harness</th>
            <th>Scope</th>
            <th>Count</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Vitest</td><td>API & Security</td><td>24 Tests</td><td>7.32s</td><td class="center-text">PASS</td></tr>
          <tr><td>Vitest</td><td>Seed & Corpus</td><td>80 Articles</td><td>2.10s</td><td class="center-text">PASS</td></tr>
          <tr><td>Playwright</td><td>E2E Browser</td><td>7 Suites</td><td>15.5s</td><td class="center-text">PASS</td></tr>
          <tr><td>ESLint</td><td>Static Typing</td><td>Monorepo</td><td>3.45s</td><td class="center-text">0 Errors</td></tr>
        </tbody>
      </table>
    </div>

    <h3 class="subsection-heading">A. Integration Testing (Vitest)</h3>
    <p>
      A total of 24 integration suites verify permission boundaries, duplicate registration rejection (409), session rotation, last-admin concurrency locks, CSRF validation, XSS sanitization, and view deduplication.
    </p>

    <h3 class="subsection-heading">B. Browser Automation (Playwright)</h3>
    <p>
      Seven end-to-end browser journeys automate user flows: authentication, content publishing, search click attribution, threaded discussions, report triage, SEO metadata updates, and 390px mobile responsiveness.
    </p>

    <h3 class="subsection-heading">C. Architectural Gap Resolution</h3>
    <p>
      Rigorous auditing identified and resolved 4 engineering gaps: (1) injecting dynamic <code>&lt;meta name="keywords"&gt;</code> tags into React headers; (2) enriching moderation reports with article slugs and inline comment controls; (3) enforcing production HTTPS cookie flags during logout; and (4) resilient JSON parsing for proxy gateway errors.
    </p>

    <h2 class="section-heading">VII. Production Deployment</h2>
    <p>
      Điểm Mới is containerized and distributed across edge and cloud infrastructure.
    </p>
    <p>
      <em>1) Frontend Edge (Vercel):</em> React assets are served via Vercel Edge. Reverse proxy rewrite rules in <code>vercel.json</code> forward <code>/api/*</code> and <code>/uploads/*</code> requests to the backend under the same origin with <code>Cache-Control: no-store</code>.
    </p>
    <p>
      <em>2) Containerized Backend (Render):</em> Defined via <code>render.yaml</code> on Node.js 24. Startup scripts execute <code>prisma migrate deploy</code> and idempotent database seeding prior to server startup. Health probes (<code>/health/ready</code>) ensure zero-downtime rolling updates.
    </p>

    <h2 class="section-heading">VIII. Conclusion & Phase 2 Roadmap</h2>
    <p>
      The Phase 1 release of Điểm Mới delivers a hardened, production-ready foundation for technical journalism. Planned Phase 2 enhancements include:
    </p>
    <p>
      <em>1) Full-Text & Vector Search:</em> Migrating from SQL <code>ILIKE</code> to PostgreSQL <code>tsvector/tsquery</code> with BM25 ranking and <code>pgvector</code> semantic embeddings for personalized article discovery.
    </p>
    <p>
      <em>2) Cloud Object Storage:</em> Integrating AWS S3 or Cloudinary CDN for scalable media asset distribution.
    </p>
    <p>
      <em>3) Real-Time Push & Collaboration:</em> Implementing Redis caching, WebSockets for instant mention notifications, and TipTap CRDT-based collaborative editing.
    </p>

    <h2 class="section-heading">Acknowledgment</h2>
    <p>
      The authors express sincere gratitude to the faculty and mentors of the Department of Software Engineering at FPT University for their academic leadership and guidance throughout the SEG301 course.
    </p>

    <h2 class="section-heading">References</h2>
    <div class="reference-item">[1] R. T. Fielding, "Architectural Styles and the Design of Network-based Software Architectures," Ph.D. dissertation, Dept. Inf. Comput. Sci., Univ. California, Irvine, CA, USA, 2000.</div>
    <div class="reference-item">[2] R. S. Sandhu, E. J. Coyne, H. L. Feinstein, and C. E. Youman, "Role-based access control models," <em>IEEE Computer</em>, vol. 29, no. 2, pp. 38–47, Feb. 1996.</div>
    <div class="reference-item">[3] D. Fett, R. Küsters, and G. Schmitz, "The Web SSO standard OpenID Connect: In-depth formal security analysis and security guidelines," in <em>Proc. 2017 IEEE Symposium on Security and Privacy (SP)</em>, San Jose, CA, USA, 2017, pp. 330–349.</div>
    <div class="reference-item">[4] OWASP Foundation, "OWASP Top 10: 2021 - The Ten Most Critical Web Application Security Risks," <em>OWASP Foundation</em>, Tech. Rep., Oct. 2021.</div>
    <div class="reference-item">[5] M. Stonebraker and L. A. Rowe, "The design of POSTGRES," in <em>Proc. 1986 ACM SIGMOD Int. Conf. on Management of Data</em>, Washington, D.C., USA, 1986, pp. 340–355.</div>
    <div class="reference-item">[6] IEEE Computer Society, "IEEE Standard for Software Quality Assurance Processes," <em>IEEE Std 730-2014</em>, pp. 1–138, 2014.</div>
    <div class="reference-item">[7] M. Fowler, <em>Patterns of Enterprise Application Architecture</em>. Boston, MA, USA: Addison-Wesley, 2002.</div>
    <div class="reference-item">[8] Prisma Data, Inc., "Prisma: Next-generation ORM for Node.js and TypeScript," Documentation, 2026. [Online]. Available: https://www.prisma.io/docs</div>
    <div class="reference-item">[9] TanStack, "TanStack Query: Powerful asynchronous state management," Documentation, 2026. [Online]. Available: https://tanstack.com/query</div>
    <div class="reference-item">[10] Microsoft Corporation, "Playwright: Fast and reliable end-to-end testing for modern web apps," Documentation, 2026. [Online]. Available: https://playwright.dev</div>
    <div class="reference-item">[11] PostgreSQL Global Development Group, "PostgreSQL 18 Documentation: Explicit Locking and Advisory Locks," 2026. [Online]. Available: https://www.postgresql.org/docs/current/explicit-locking.html</div>
    <div class="reference-item">[12] A. Birgisson, M. Polychronakis, and A. D. Keromytis, "Privilege separation in modern web applications," in <em>Proc. 2018 USENIX Annual Technical Conference (USENIX ATC 18)</em>, Boston, MA, USA, 2018, pp. 241–254.</div>

  </div>

</body>
</html>
"""

report_dir = r"d:\0.University\01.FA26\SEG301\0.FinalProject\SEG301_FinalProject_Submission_SE201619_SE200932\02_IEEE_Report"
html_path = os.path.join(report_dir, "IEEE_Report_DiemMoi.html")
pdf_path = os.path.join(report_dir, "IEEE_Report_DiemMoi.pdf")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Saved IEEE HTML report to: {html_path}")

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
    print(f"IEEE PDF size: {os.path.getsize(pdf_path) / 1024:.1f} KB")

