import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Điểm Mới — Final Project Presentation | SEG301 FPT University</title>
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
      overflow-x: hidden;
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

    .slide-header {
      margin-bottom: 2rem;
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
      margin-bottom: 0.75rem;
    }

    .slide-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: -0.02em;
    }

    .divider {
      width: 100%;
      height: 2px;
      background: #1E293B;
      margin-top: 1rem;
    }

    .slide-body {
      flex: 1;
      display: grid;
      gap: 1.5rem;
    }

    .grid-2 { grid-template-columns: 1fr 1fr; }
    .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
    .grid-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }

    .card {
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    .card.accent-blue { border-left: 4px solid #3B82F6; }
    .card.accent-cyan { border-left: 4px solid #0EA5E9; }
    .card.accent-green { border-left: 4px solid #10B981; }
    .card.accent-amber { border-left: 4px solid #F59E0B; }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #38BDF8;
      margin-bottom: 1rem;
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
      font-size: 3rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    .stat-blue { color: #38BDF8; }
    .stat-green { color: #34D399; }
    .stat-amber { color: #FBBF24; }
    .stat-purple { color: #A78BFA; }

    .stat-label {
      font-size: 0.9rem;
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

    /* Print settings for PDF output */
    @media print {
      body { background: #0F172A; }
      .slide {
        page-break-after: always;
        height: 100vh;
        width: 100vw;
        border: none;
      }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- Slide 1: Title -->
  <div class="slide" style="justify-content: center; align-items: stretch; background: radial-gradient(circle at 80% 20%, #1E3A8A 0%, #0F172A 70%);">
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <div class="badge" style="width: fit-content;">FPT UNIVERSITY • SEG301 CAPSTONE PROJECT DEFENSE</div>
      <h1 style="font-size: 4rem; font-weight: 800; color: #FFFFFF; letter-spacing: -0.03em; margin-bottom: 0.5rem;">
        ĐIỂM MỚI
      </h1>
      <h2 style="font-size: 1.8rem; font-weight: 600; color: #38BDF8; margin-bottom: 1.5rem;">
        Enterprise-Grade News & Digital Magazine Web Portal
      </h2>
      <p style="font-size: 1.15rem; color: #94A3B8; max-width: 900px; line-height: 1.6; margin-bottom: 2.5rem;">
        An end-to-end fullstack platform featuring multi-tier Role-Based Access Control, robust content moderation, behavioral query and click analytics, and strict software verification.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div class="card accent-blue">
          <div class="card-title">PROJECT AUTHORS</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #F8FAFC; margin-bottom: 0.25rem;">
            Trần Trung Tín <span style="font-size: 0.95rem; font-weight: normal; color: #38BDF8;">(SE201619)</span>
          </div>
          <div style="font-size: 0.9rem; color: #94A3B8; margin-bottom: 1rem;">
            Backend Architecture, Live RBAC Security, Database Design & Vitest Suites
          </div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #F8FAFC; margin-bottom: 0.25rem;">
            Võ Hiếu Thắng <span style="font-size: 0.95rem; font-weight: normal; color: #38BDF8;">(SE200932)</span>
          </div>
          <div style="font-size: 0.9rem; color: #94A3B8;">
            Frontend SPA Architecture, Community Engagement, Playwright E2E & Deployment
          </div>
        </div>

        <div class="card accent-cyan">
          <div class="card-title">ACADEMIC & SYSTEM INFO</div>
          <ul class="card-list">
            <li><strong>Course:</strong> SEG301 — Software Architecture & Engineering</li>
            <li><strong>Institution:</strong> FPT University (Trường Đại học FPT)</li>
            <li><strong>Technology Stack:</strong> React 18, Express, PostgreSQL 18, Prisma ORM, TanStack Query, Tailwind CSS</li>
            <li><strong>Verification Status:</strong> 100% Automated Tests Passing (24 Vitest + 7 Playwright Workflows)</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal — SEG301 Capstone Defense</span>
      <span>Slide 1 / 18</span>
    </div>
  </div>

  <!-- Slide 2: Executive Summary -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Project Overview</div>
      <div class="slide-title">Executive Summary & Project Scope</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-3">
      <div class="card accent-blue">
        <div class="card-title">Mission & Vision</div>
        <ul class="card-list">
          <li><strong>Tech Journalism Hub:</strong> Deliver an enterprise-grade digital portal specializing in Artificial Intelligence, Computer Science, and Software Engineering.</li>
          <li><strong>Vietnamese First:</strong> Full localized UI and 100% authentic Vietnamese educational articles without any mock placeholder text.</li>
          <li><strong>Production Mindset:</strong> Designed from day one for strict regulatory compliance, granular RBAC, and cloud deployment.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">Core Capabilities</div>
        <ul class="card-list">
          <li><strong>Public Magazine SPA:</strong> Paginated feeds, taxonomy filtering (categories/tags), keyword search, threaded comments, and 1–5 star ratings.</li>
          <li><strong>Editorial Lifecycle:</strong> Draft, Published, and Unpublished states with soft-deletion and cover image upload validation.</li>
          <li><strong>Centralized Governance:</strong> Dedicated portals for Content Managers, Moderators, SEO Specialists, and Super Admins.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">Engineering Highlights</div>
        <ul class="card-list">
          <li><strong>Defense-in-Depth:</strong> Argon2id hashing, PostgreSQL sessions in HttpOnly cookies, Double-Submit CSRF, and HTML sanitization.</li>
          <li><strong>Behavioral Analytics:</strong> Anti-tamper click-through logging, zero-result query tracking, and UTC 30-min bucketed view deduplication.</li>
          <li><strong>Automated SQA:</strong> 24 integration suites and 7 browser journeys verified against real isolated PostgreSQL databases.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 2 / 18</span>
    </div>
  </div>

  <!-- Slide 3: Problem Statement -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Domain Analysis</div>
      <div class="slide-title">Problem Statement & Architectural Challenges</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card accent-blue">
        <div class="card-title">1. Token Staleness vs. Dynamic RBAC</div>
        <ul class="card-list">
          <li><strong>The Challenge:</strong> Conventional JWT-based authorization bakes claims into client tokens. When an administrator revokes a compromised user or reassigns privileges, permissions remain active until token expiry.</li>
          <li><strong>Our Solution:</strong> Re-query live role-permission associations directly from PostgreSQL on every protected mutation. We also implement PostgreSQL advisory locks (<code>pg_advisory_xact_lock</code>) to guarantee that the final Super Admin can never be accidentally demoted or locked out under concurrency.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">2. Toxicity, Spam & Content Governance</div>
        <ul class="card-list">
          <li><strong>The Challenge:</strong> Open digital magazines suffer from XSS injection vectors, spam bots, and harassment in discussion sections.</li>
          <li><strong>Our Solution:</strong> Strict multi-layered sanitization via <code>sanitize-html</code>, regex mention validation with foreign key integrity, and a dedicated Moderator Triage queue allowing non-destructive comment hiding and resolution.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">3. Metric Inflation & Skewed Analytics</div>
        <ul class="card-list">
          <li><strong>The Challenge:</strong> F5 reloads, scraper bots, and client-forged click queries destroy advertising and editorial analytics integrity.</li>
          <li><strong>Our Solution:</strong> Implemented a UTC 30-minute bucket view deduplication formula enforced by composite database keys, alongside verifiable search-click linkages that strictly reject client-tampered query text.</li>
        </ul>
      </div>

      <div class="card accent-amber">
        <div class="card-title">4. Windows Dev Engine Locks & Monorepo Scale</div>
        <ul class="card-list">
          <li><strong>The Challenge:</strong> The Prisma Client query engine binary on Windows holds a file lock, causing fatal EPERM crashes during code generation and hot-reloading.</li>
          <li><strong>Our Solution:</strong> Developed custom pre-dev orchestration scripts (<code>prepare-dev.mjs</code>) that probe port availability, check schema hashes, and safely reuse native binaries.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 3 / 18</span>
    </div>
  </div>

  <!-- Slide 4: System Architecture -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Architecture & Design</div>
      <div class="slide-title">System Architecture & End-to-End Topology</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-4">
      <div class="card accent-blue">
        <div class="card-title">Presentation Tier</div>
        <ul class="card-list">
          <li><strong>React 18 & Vite:</strong> Ultra-fast compilation and HMR.</li>
          <li><strong>TanStack Query v5:</strong> Intelligent asynchronous state caching.</li>
          <li><strong>Tailwind CSS:</strong> Responsive utility design (tested down to 390px mobile).</li>
          <li><strong>Vite Same-Origin Proxy:</strong> Transparent routing for API and assets.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">Security & Gateway</div>
        <ul class="card-list">
          <li><strong>Double-Submit CSRF:</strong> Cryptographic token on mutations.</li>
          <li><strong>Cookie Session Guard:</strong> HttpOnly, SameSite=Lax cookies.</li>
          <li><strong>Rate Limiting:</strong> 100 req/min bucket protection.</li>
          <li><strong>Zod Middleware:</strong> Strict input validation & type coercion.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">Domain Logic Tier</div>
        <ul class="card-list">
          <li><strong>Modular Express Services:</strong> Isolated modules for Auth, Documents, Taxonomy, Moderation, and Analytics.</li>
          <li><strong>Live Permission Gates:</strong> Request-scoped authorization.</li>
          <li><strong>Atomic Workflows:</strong> Prisma transactions for audit consistency.</li>
        </ul>
      </div>

      <div class="card accent-amber">
        <div class="card-title">Persistence Tier</div>
        <ul class="card-list">
          <li><strong>PostgreSQL 18:</strong> Solid relational engine.</li>
          <li><strong>Prisma ORM:</strong> Schema safety & migrations.</li>
          <li><strong>SQL CHECK Constraints:</strong> Rating bounds & report targets.</li>
          <li><strong>PostgreSQL Session Store:</strong> Stateful session revocation.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 4 / 18</span>
    </div>
  </div>

  <!-- Slide 5: RBAC Matrix -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Security & Governance</div>
      <div class="slide-title">Role-Based Access Control (RBAC) Architecture</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body" style="display: flex; flex-direction: column; gap: 0.75rem;">
      <div class="card accent-amber" style="padding: 1rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #FBBF24; font-size: 1.15rem; width: 220px;">SUPER_ADMIN</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Full governance: Manage user accounts (ACTIVE/SUSPENDED), assign roles, modify granular permissions, review immutable audit logs, and modify global portal settings. Protected by <code>pg_advisory_xact_lock</code>.
          </span>
        </div>
      </div>

      <div class="card accent-blue" style="padding: 1rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #38BDF8; font-size: 1.15rem; width: 220px;">CONTENT_MANAGER</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Editorial authority: Full CRUD across articles, toggle publish/unpublish lifecycle states, curate categories and tags, and upload cover images with magic-byte signature validation.
          </span>
        </div>
      </div>

      <div class="card accent-cyan" style="padding: 1rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #0EA5E9; font-size: 1.15rem; width: 220px;">MODERATOR</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Community policing: Review reported violations in a dedicated triage queue, hide/restore reported comments, mark spam items, and resolve or dismiss complaints with audit tracking.
          </span>
        </div>
      </div>

      <div class="card accent-green" style="padding: 1rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #34D399; font-size: 1.15rem; width: 220px;">SEO_SPECIALIST</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Metadata & analytics: Strictly whitelisted to modify SEO Title, Meta Description, Search Keywords, and Image Alt text. Real-time access to search query click-through analytics.
          </span>
        </div>
      </div>

      <div class="card" style="padding: 1rem 1.5rem; border-left: 4px solid #94A3B8;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #F8FAFC; font-size: 1.15rem; width: 220px;">USER (Authenticated)</strong>
          <span style="color: #CBD5E1; font-size: 0.95rem; flex: 1;">
            Reader engagement: Profile editing, create comments and threaded replies, @username mentions, idempotent article likes, 1–5 star ratings, and community report submission.
          </span>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 5 / 18</span>
    </div>
  </div>

  <!-- Slide 6: Content Lifecycle -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Core Features</div>
      <div class="slide-title">Editorial Management & Content Lifecycle</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-3">
      <div class="card accent-blue">
        <div class="card-title">Document State Machine</div>
        <ul class="card-list">
          <li><strong>DRAFT:</strong> Work in progress. Completely invisible to guests and search queries (returns 404). Only authors and Content Managers can view.</li>
          <li><strong>PUBLISHED:</strong> Live on the portal with descending chronological order by <code>published_at</code>. Indexed by search engines.</li>
          <li><strong>UNPUBLISHED:</strong> Retracted articles. Public access returns 404 while preserving comments and rating records.</li>
          <li><strong>Soft-Delete:</strong> Non-destructive deletion via <code>deleted_at</code> timestamp.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">Taxonomy & Relations</div>
        <ul class="card-list">
          <li><strong>Hierarchical Organization:</strong> Every article belongs to exactly 1 Category and references multiple Tags via <code>document_tags</code> join table.</li>
          <li><strong>Referential Integrity:</strong> Deleting a category that currently holds active articles is strictly rejected with HTTP 409 Conflict.</li>
          <li><strong>Dual Representation:</strong> Stores sanitized rich HTML for the frontend reader and <code>content_plain</code> for search extraction.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">Secure Media Ingestion</div>
        <ul class="card-list">
          <li><strong>Magic-Byte Verification:</strong> Verifies actual file headers (JPEG, PNG, WebP) to prevent executable upload tricks.</li>
          <li><strong>SVG Vector Blocking:</strong> SVGs are explicitly rejected to eliminate Cross-Site Scripting (XSS) and XML External Entity (XXE) attacks.</li>
          <li><strong>Storage Guard:</strong> 5MB payload limit, UUID file name hashing, and required Alt-text for accessibility compliance.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 6 / 18</span>
    </div>
  </div>

  <!-- Slide 7: Community Engagement -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Core Features</div>
      <div class="slide-title">Community Interaction & Reader Engagement</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card accent-blue">
        <div class="card-title">Threaded Comments & Strict Ownership</div>
        <ul class="card-list">
          <li><strong>Nested Discussions:</strong> Supports root comments and child replies via recursive <code>parent_id</code> foreign key relationships.</li>
          <li><strong>Ownership Enforcement (T08):</strong> Only the creator can edit their comment. Non-owners receive HTTP 403 Forbidden.</li>
          <li><strong>Public Availability:</strong> Global toggle in portal settings allows Super Admin to disable comments system-wide instantly.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">Validated User @Mentions</div>
        <ul class="card-list">
          <li><strong>Automated Regex Extraction:</strong> The backend scans comment text for valid <code>@username</code> patterns upon submission.</li>
          <li><strong>Foreign Key Join:</strong> Verifies matched users against the <code>users</code> table; existing users are recorded in <code>comment_mentions</code>.</li>
          <li><strong>Ghost Tolerance:</strong> Mentioning non-existent usernames does not abort comment creation; phantom tokens are left unlinked.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">Idempotent Article Liking</div>
        <ul class="card-list">
          <li><strong>Composite Unique Key:</strong> Relational table <code>document_likes</code> enforces uniqueness across <code>(document_id, user_id)</code>.</li>
          <li><strong>Idempotent Mutations:</strong> Users can toggle likes smoothly; rapid double-clicks never create duplicate rows.</li>
          <li><strong>Aggregate Counts:</strong> Live count of likes dynamically computed and displayed on article hero cards.</li>
        </ul>
      </div>

      <div class="card accent-amber">
        <div class="card-title">1–5 Star Rating with SQL Constraints</div>
        <ul class="card-list">
          <li><strong>Mathematical Integrity:</strong> Ratings must be integer values between 1 and 5.</li>
          <li><strong>Dual Layer Defense:</strong> Zod validates inputs at the API gateway; PostgreSQL <code>CHECK (value >= 1 AND value <= 5)</code> enforces it at the database engine level.</li>
          <li><strong>Live Score:</strong> Average score and total rating count computed dynamically via SQL aggregation.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 7 / 18</span>
    </div>
  </div>

  <!-- Slide 8: Content Moderation -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Core Features</div>
      <div class="slide-title">Content Moderation & Governance Workflow</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-3">
      <div class="card accent-blue">
        <div class="card-title">1. Community Abuse Reports</div>
        <ul class="card-list">
          <li><strong>Polymorphic Reporting:</strong> Any registered reader can report offensive articles or abusive comments.</li>
          <li><strong>Relational Exclusivity:</strong> Database CHECK constraint ensures a report targets either a document OR a comment, never both or neither.</li>
          <li><strong>Structured Reasons:</strong> Categorized by Spam, Harassment, Misinformation, Offensive Language, and Other.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">2. Moderator Triage Console</div>
        <ul class="card-list">
          <li><strong>Dedicated Queue:</strong> Access at <code>/admin/moderation</code> restricted to MODERATOR and SUPER_ADMIN roles.</li>
          <li><strong>Full Context View:</strong> Displays reporter username, violation category, explanation text, and direct target links.</li>
          <li><strong>Direct Inspection:</strong> Single click navigates to the exact article to view context before taking action.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">3. Disciplinary Actions</div>
        <ul class="card-list">
          <li><strong>Hide / Restore Comment:</strong> Transitions comment status to HIDDEN. Public readers see '[Bình luận đã bị ẩn do vi phạm]'. Can be restored if false alarm.</li>
          <li><strong>Spam Flagging:</strong> Flags comments as SPAM for filtering algorithms.</li>
          <li><strong>Immutable Audit:</strong> Every resolution records an audit entry capturing resolver ID, timestamp, and action.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 8 / 18</span>
    </div>
  </div>

  <!-- Slide 9: Behavioral Analytics -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Analytics & Data</div>
      <div class="slide-title">Behavioral Analytics & Search Click Attribution</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card accent-blue">
        <div class="card-title">Search Attribution Pipeline</div>
        <ul class="card-list">
          <li><strong>PostgreSQL ILIKE Engine:</strong> Executes parameterized keyword matching across title, summary, and contentPlain with wildcard escaping.</li>
          <li><strong>Zero-Result Auditing:</strong> Even searches with 0 results create an immutable record to help editors spot content gaps.</li>
          <li><strong>Tamper-Resistant Clicks:</strong> Clicking a search result sends <code>search_id</code>. Backend checks that the clicked article was actually in the original result set, verifies rank position, and copies the server-stored query string instead of trusting client input.</li>
          <li><strong>Direct Navigation Guard (T18):</strong> Direct visits to article URLs increment views but leave search click counters completely untouched.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">View Counter Deduplication & Analytics</div>
        <ul class="card-list">
          <li><strong>UTC 30-Minute Bucket Window:</strong> Solves reload spamming by grouping reader timestamps into 30-minute intervals:
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; background: #0B1120; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0; color: #38BDF8;">
              bucket = floor(extract(epoch from now()) / 1800)
            </div>
          </li>
          <li><strong>Relational Enforcement:</strong> Unique index on <code>(document_id, viewer_key, bucket)</code> atomically ignores duplicate hits within the same 30-minute block.</li>
          <li><strong>Privacy First:</strong> Internal logging requires zero third-party analytics trackers (no Google Analytics / Facebook Pixel).</li>
          <li><strong>SEO Analytics Dashboard:</strong> Real-time visualizations of top queries, CTR percentages, article popularity, and category traffic.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 9 / 18</span>
    </div>
  </div>

  <!-- Slide 10: Database Schema -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Data Modeling</div>
      <div class="slide-title">Database Schema & Relational Design</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card accent-blue">
        <div class="card-title">Core Entities & Relational Map (14 Models)</div>
        <ul class="card-list">
          <li><strong>Identity:</strong> <code>users</code>, <code>roles</code>, <code>permissions</code>, <code>user_roles</code>, <code>role_permissions</code>.</li>
          <li><strong>Sessions:</strong> <code>sessions</code> (Server-side PostgreSQL session store managed via express-session).</li>
          <li><strong>Content & Taxonomies:</strong> <code>documents</code>, <code>categories</code>, <code>tags</code>, <code>document_tags</code>.</li>
          <li><strong>Engagement:</strong> <code>comments</code>, <code>comment_mentions</code>, <code>document_likes</code>, <code>document_ratings</code>.</li>
          <li><strong>Telemetry & Auditing:</strong> <code>document_views</code>, <code>search_click_logs</code>, <code>reports</code>, <code>audit_logs</code>, <code>settings</code>.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">Database-Level Integrity Constraints</div>
        <ul class="card-list">
          <li><strong>Rating Bounds CHECK:</strong> <code>CONSTRAINT check_rating_range CHECK (value >= 1 AND value <= 5)</code>.</li>
          <li><strong>Report Exclusivity CHECK:</strong> Ensures reports attach to either an article OR a comment, never both.</li>
          <li><strong>Foreign Key Integrity:</strong> Cascade deletions configured on join tables (document_tags, likes); Restrict deletions on core taxonomies and roles.</li>
          <li><strong>High-Throughput Indexes:</strong> B-Tree indexes on <code>[status, published_at DESC]</code>, <code>[categoryId, status]</code>, <code>[searchId]</code>, and <code>[viewer_key, bucket]</code>.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 10 / 18</span>
    </div>
  </div>

  <!-- Slide 11: Security Engineering -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Security & Hardening</div>
      <div class="slide-title">Security Engineering & Defense-in-Depth</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-3">
      <div class="card accent-blue">
        <div class="card-title">Authentication & Sessions</div>
        <ul class="card-list">
          <li><strong>Argon2id:</strong> Industry-standard password hashing with high memory cost parameters.</li>
          <li><strong>PostgreSQL Sessions:</strong> State stored in database; revoked instantly upon logout or account suspension.</li>
          <li><strong>Cookie Armor:</strong> <code>HttpOnly; SameSite=Lax; Secure</code> prevents JavaScript token theft.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">CSRF & Request Security</div>
        <ul class="card-list">
          <li><strong>Double-Submit CSRF:</strong> Requires valid <code>X-CSRF-Token</code> issued from <code>/auth/csrf</code> on all state-mutating requests.</li>
          <li><strong>Origin Validation:</strong> Matches <code>Origin</code> header against exact configured whitelist.</li>
          <li><strong>Rate Limiting:</strong> Memory-based rate limiter throttles suspicious brute-force attempts.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">Input Sanitization & Concurrency</div>
        <ul class="card-list">
          <li><strong>XSS Prevention:</strong> HTML bodies sanitized via strict whitelist; strips <code>&lt;script&gt;</code> and dangerous attributes.</li>
          <li><strong>SQL Injection:</strong> Parameterized Prisma queries with wildcard character escaping.</li>
          <li><strong>Advisory Locks:</strong> <code>pg_advisory_xact_lock</code> blocks race conditions during Super Admin revocation.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 11 / 18</span>
    </div>
  </div>

  <!-- Slide 12: Seed Corpus -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Corpus & Seeding</div>
      <div class="slide-title">Seed Corpus & Real Data Validation</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;">
        <div class="card" style="text-align: center;">
          <div class="stat-number stat-blue">80</div>
          <div class="stat-label">Total Unique Articles</div>
        </div>
        <div class="card" style="text-align: center;">
          <div class="stat-number stat-green">72 / 8</div>
          <div class="stat-label">Published / Drafts</div>
        </div>
        <div class="card" style="text-align: center;">
          <div class="stat-number stat-amber">4 / 12</div>
          <div class="stat-label">Categories / Tags</div>
        </div>
        <div class="card" style="text-align: center;">
          <div class="stat-number stat-purple">100%</div>
          <div class="stat-label">Original Vietnamese Text</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card accent-blue">
          <div class="card-title">Authentic Content Standards</div>
          <ul class="card-list">
            <li><strong>Zero Placeholder Text:</strong> Strictly 0 Lorem Ipsum; every document is an authentic educational article on AI, Software Architecture, and Cybersecurity.</li>
            <li><strong>Length Requirements:</strong> Automatically validated by <code>validate-seed.ts</code> to contain a minimum of 183 words per article with structured paragraphs.</li>
            <li><strong>Original Media:</strong> Packaged with curated high-resolution technical illustrations and required accessibility alt text.</li>
          </ul>
        </div>

        <div class="card accent-cyan">
          <div class="card-title">Idempotent Seeding Architecture</div>
          <ul class="card-list">
            <li><strong>Non-Destructive:</strong> Running <code>npm run db:seed</code> repeatedly preserves existing customized articles, password hashes, and user roles.</li>
            <li><strong>Deterministic Demo Accounts:</strong> Pre-provisions 5 role-based accounts (Admin, Manager, Moderator, SEO, User) for effortless instructor evaluation.</li>
            <li><strong>Clean Telemetry:</strong> Seeding does not fabricate fake view counts or synthetic search logs; analytics reflect real user interactions only.</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 12 / 18</span>
    </div>
  </div>

  <!-- Slide 13: SQA & Testing -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Testing & SQA</div>
      <div class="slide-title">Software Quality Assurance & Empirical Verification</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card accent-green">
        <div class="card-title">Backend Integration Suites (Vitest)</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #34D399; margin-bottom: 0.5rem;">
          24 / 24 Tests Passed (100%) in 7.32s
        </div>
        <ul class="card-list">
          <li><strong>Real Database Testing:</strong> Tests run against isolated PostgreSQL databases (ending in <code>_test</code>).</li>
          <li><strong>Auth & Sessions:</strong> Duplicate registration rejection (409), session invalidation on logout, cookie rotation.</li>
          <li><strong>RBAC Enforcement:</strong> Verified 403 Forbidden on unauthorized admin routes; last-admin concurrency locks.</li>
          <li><strong>Security Payloads:</strong> Tested XSS script stripping, SQL injection wildcards, and spoofed MIME file uploads.</li>
        </ul>
      </div>

      <div class="card accent-blue">
        <div class="card-title">Browser E2E Automation (Playwright)</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #38BDF8; margin-bottom: 0.5rem;">
          7 / 7 Workflows Passed in 15.5s
        </div>
        <ul class="card-list">
          <li><strong>User Lifecycle:</strong> Register, login, edit bio, logout, and access control redirects.</li>
          <li><strong>Editorial Flow:</strong> Create draft, publish article, edit content, and soft-delete.</li>
          <li><strong>Community Flow:</strong> Filtered search, result click tracking, comment posting, @mention parsing, ratings.</li>
          <li><strong>Moderation Flow:</strong> User report submission, moderator triage queue, inline hide/restore, audit check.</li>
          <li><strong>Mobile Responsiveness:</strong> Verified zero horizontal layout overflow on 390px mobile viewports.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 13 / 18</span>
    </div>
  </div>

  <!-- Slide 14: Gap Analysis -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Enhancements & Audit</div>
      <div class="slide-title">Architectural Gap Analysis & Engineering Fixes</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card accent-blue">
        <div class="card-title">Gap 1: Dynamic SEO Meta Keywords Injection</div>
        <ul class="card-list">
          <li><strong>Observation:</strong> SEO Specialists could curate <code>seoKeywords</code> in the admin panel, but the public reader page was omitting the <code>&lt;meta name="keywords"&gt;</code> HTML tag.</li>
          <li><strong>Resolution:</strong> Injected dynamic meta keyword tags into React's document head, ensuring search engine bots index curated terms.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">Gap 2: Moderation Report Context & Direct Controls</div>
        <ul class="card-list">
          <li><strong>Observation:</strong> <code>GET /moderation/reports</code> returned basic IDs without target article slugs or inline comment management controls.</li>
          <li><strong>Resolution:</strong> Enriched API payload with target article slugs and comment visibility status; added single-click article navigation and inline hide/restore buttons.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">Gap 3: Session Cookie Security Parity on Logout</div>
        <ul class="card-list">
          <li><strong>Observation:</strong> <code>res.clearCookie('portal.sid')</code> was called without explicit <code>secure: true</code> flag, causing potential browser cookie jar mismatches in production HTTPS.</li>
          <li><strong>Resolution:</strong> Added <code>secure: env.NODE_ENV === 'production'</code> to logout handler, strictly matching login cookie attributes.</li>
        </ul>
      </div>

      <div class="card accent-amber">
        <div class="card-title">Gap 4: Resilient Client API Error Handling</div>
        <ul class="card-list">
          <li><strong>Observation:</strong> Direct <code>response.json()</code> in the frontend client threw uncaught syntax exceptions on non-JSON gateway (502/504) HTML errors.</li>
          <li><strong>Resolution:</strong> Implemented safe JSON parsing with plain-text fallback, displaying human-readable error messages.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 14 / 18</span>
    </div>
  </div>

  <!-- Slide 15: Deployment Strategy -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">DevOps & Cloud</div>
      <div class="slide-title">Deployment Strategy & Production Architecture</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-3">
      <div class="card accent-blue">
        <div class="card-title">Vercel (Frontend SPA)</div>
        <ul class="card-list">
          <li><strong>Global Edge Network:</strong> Fast delivery of pre-compiled Vite assets.</li>
          <li><strong>Same-Origin Proxying:</strong> <code>vercel.json</code> rewrites <code>/api/*</code> and <code>/uploads/*</code> directly to Render backend, eliminating CORS overhead.</li>
          <li><strong>No-Store Caching:</strong> <code>Cache-Control: no-store</code> ensures search clicks and analytics are never cached at the edge.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">Render (Containerized API)</div>
        <ul class="card-list">
          <li><strong>Node.js 24 Runtime:</strong> Managed via <code>render.yaml</code> blueprint.</li>
          <li><strong>Zero-Downtime Pipeline:</strong> Startup script runs <code>prisma migrate deploy</code> and idempotent seed before accepting traffic.</li>
          <li><strong>Proxy Trust Guard:</strong> Configured <code>TRUST_PROXY=1</code> for accurate HTTPS cookie and client IP detection.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">Local Dev & Docker</div>
        <ul class="card-list">
          <li><strong>Docker Compose:</strong> Production-matched PostgreSQL 17 container.</li>
          <li><strong>Native Mode:</strong> <code>npm run db:local</code> runs native PostgreSQL with isolated storage in <code>.local/pgdata</code>.</li>
          <li><strong>Pre-Dev Automation:</strong> Validates port availability, preventing EADDRINUSE conflicts on Windows.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 15 / 18</span>
    </div>
  </div>

  <!-- Slide 16: Phase 2 Roadmap -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Future Work</div>
      <div class="slide-title">Phase 2 Evolution & Technical Roadmap</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card accent-blue">
        <div class="card-title">Full-Text Search & Semantic Embeddings</div>
        <ul class="card-list">
          <li><strong>PostgreSQL Full-Text Search:</strong> Transition from Phase 1 SQL ILIKE to PostgreSQL <code>tsvector/tsquery</code> with Vietnamese text analyzers and BM25 relevance ranking.</li>
          <li><strong>Vector Embeddings (pgvector):</strong> Generate OpenAI/Cohere embeddings from <code>content_plain</code> to power semantic search and personalized article recommendations.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">Cloud Object Storage (AWS S3 / Cloudinary)</div>
        <ul class="card-list">
          <li><strong>Stateless API Autoscaling:</strong> Move image storage from local filesystem to S3-compatible buckets with signed upload URLs.</li>
          <li><strong>Edge CDN Media Delivery:</strong> Automatic image resizing, WebP conversion, and low-latency delivery.</li>
        </ul>
      </div>

      <div class="card accent-green">
        <div class="card-title">Distributed Cache & WebSockets</div>
        <ul class="card-list">
          <li><strong>Redis Caching:</strong> Offload hot article view counts and high-frequency rate-limiting from PostgreSQL to an in-memory Redis cluster.</li>
          <li><strong>Real-Time Notifications:</strong> WebSocket / Server-Sent Events (SSE) for instant mention alerts and live comment updates.</li>
        </ul>
      </div>

      <div class="card accent-amber">
        <div class="card-title">Collaborative Rich-Text Editing</div>
        <ul class="card-list">
          <li><strong>CRDT-Based Collaboration:</strong> Integrate TipTap with Yjs to enable concurrent multi-author editing on article drafts with live cursors.</li>
          <li><strong>Granular Revision History:</strong> Visual diffing between published versions and editorial revisions.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 16 / 18</span>
    </div>
  </div>

  <!-- Slide 17: Team Contributions -->
  <div class="slide">
    <div class="slide-header">
      <div class="badge">Team & Contributions</div>
      <div class="slide-title">Team Contributions & Responsibilities</div>
      <div class="divider"></div>
    </div>
    <div class="slide-body grid-2">
      <div class="card accent-blue">
        <div class="card-title">Trần Trung Tín (SE201619)</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: #38BDF8; margin-bottom: 0.75rem;">
          Backend Architecture, Security & Database Specialist
        </div>
        <ul class="card-list">
          <li><strong>REST API Architecture:</strong> Designed and implemented Express API endpoints across Auth, Documents, Taxonomy, Moderation, and SEO.</li>
          <li><strong>Live RBAC Engine:</strong> Created dynamic permission validation middleware and PostgreSQL advisory locking for Super Admin protection.</li>
          <li><strong>Data Modeling:</strong> Authored Prisma schema, 14 relational tables, and custom SQL CHECK constraints.</li>
          <li><strong>Search & Analytics:</strong> Implemented SQL ILIKE search, search query logging, verified click attribution, and 30-min view deduplication.</li>
          <li><strong>Unit & Integration Testing:</strong> Developed the 24 Vitest integration tests and Docker Compose container setup.</li>
        </ul>
      </div>

      <div class="card accent-cyan">
        <div class="card-title">Võ Hiếu Thắng (SE200932)</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: #0EA5E9; margin-bottom: 0.75rem;">
          Frontend SPA Architecture, UX & E2E Testing Specialist
        </div>
        <ul class="card-list">
          <li><strong>Frontend SPA Architecture:</strong> Built React 18 client with React Router v6, TanStack Query v5, and Tailwind CSS.</li>
          <li><strong>Public Portal & Reader UX:</strong> Designed responsive article listings, category/tag filters, threaded comments, @mentions, and rating widgets.</li>
          <li><strong>Administrative Consoles:</strong> Developed dedicated dashboards for Content Managers, Moderators, SEO Specialists, and Super Admins.</li>
          <li><strong>E2E Browser Testing:</strong> Engineered the 7 Playwright automation test suites and verified mobile responsiveness down to 390px.</li>
          <li><strong>Deployment & Seed Corpus:</strong> Configured Vercel edge rewrite proxy, Render blueprint, and curated the 80-article original Vietnamese seed corpus.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 17 / 18</span>
    </div>
  </div>

  <!-- Slide 18: Q&A & Demonstration -->
  <div class="slide" style="justify-content: center; align-items: center; background: radial-gradient(circle at 50% 50%, #1E3A8A 0%, #0F172A 80%);">
    <div class="card accent-cyan" style="max-width: 950px; width: 100%; text-align: center; padding: 3rem 2rem;">
      <h1 style="font-size: 3.5rem; font-weight: 800; color: #FFFFFF; margin-bottom: 0.5rem;">
        THANK YOU!
      </h1>
      <h2 style="font-size: 1.8rem; font-weight: 600; color: #38BDF8; margin-bottom: 2rem;">
        Điểm Mới — News & Digital Magazine Portal
      </h2>
      <div style="font-size: 1.25rem; font-weight: 700; color: #34D399; margin-bottom: 2rem;">
        Ready for System Demonstration & Technical Q&A
      </div>

      <div style="background: #0B1120; border-radius: 8px; padding: 1.5rem; text-align: left; max-width: 750px; margin: 0 auto 1.5rem auto;">
        <ul class="card-list">
          <li><strong>Local Frontend Application:</strong> <code style="color: #38BDF8;">http://localhost:5173</code></li>
          <li><strong>REST API Backend:</strong> <code style="color: #38BDF8;">http://127.0.0.1:3001/api/v1</code></li>
          <li><strong>Demo Accounts:</strong> Super Admin (<code>admin@demo.local</code>), Content Manager (<code>manager@demo.local</code>), Moderator (<code>moderator@demo.local</code>), SEO Specialist (<code>seo@demo.local</code>)</li>
          <li><strong>Students:</strong> Trần Trung Tín (SE201619) & Võ Hiếu Thắng (SE200932)</li>
          <li><strong>Course & Institution:</strong> SEG301 — FPT University (Trường Đại học FPT)</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer" style="width: 100%;">
      <span>Điểm Mới Portal | FPT University | Trần Trung Tín & Võ Hiếu Thắng</span>
      <span>Slide 18 / 18</span>
    </div>
  </div>

</body>
</html>
"""

slides_dir = r"d:\0.University\01.FA26\SEG301\0.FinalProject\SEG301_FinalProject_Submission_SE201619_SE200932\01_Presentation_Slides"
html_path = os.path.join(slides_dir, "Presentation_DiemMoi_SEG301.html")
pdf_path = os.path.join(slides_dir, "Presentation_DiemMoi_SEG301.pdf")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Saved HTML slides to: {html_path}")

# Compile HTML to PDF using msedge or chrome
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

