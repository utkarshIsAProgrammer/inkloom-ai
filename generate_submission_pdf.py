import subprocess
import os

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Inkloom AI — Round 2 Technical Proposal & Build Report</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-right {
      content: "Page " counter(page) " of " counter(pages);
      font-size: 8pt;
      color: #64748b;
    }
  }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #0f172a;
    line-height: 1.45;
    font-size: 9.5pt;
    margin: 0;
    padding: 0;
  }
  .header-box {
    border-bottom: 2px solid #6366f1;
    padding-bottom: 12px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .title {
    font-size: 20pt;
    font-weight: 800;
    color: #1e1b4b;
    margin: 0;
    letter-spacing: -0.5px;
  }
  .subtitle {
    font-size: 11pt;
    color: #4f46e5;
    font-weight: 600;
    margin-top: 3px;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 18px;
    font-size: 8.5pt;
  }
  .meta-item strong {
    display: block;
    color: #64748b;
    text-transform: uppercase;
    font-size: 7.5pt;
    margin-bottom: 2px;
  }
  .meta-item span {
    font-weight: 600;
    color: #1e293b;
  }
  h2 {
    font-size: 12pt;
    font-weight: 700;
    color: #1e1b4b;
    border-left: 3.5px solid #6366f1;
    padding-left: 8px;
    margin: 16px 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  h3 {
    font-size: 10pt;
    font-weight: 700;
    color: #334155;
    margin: 10px 0 4px 0;
  }
  p {
    margin: 0 0 8px 0;
    text-align: justify;
  }
  ul, ol {
    margin: 0 0 8px 0;
    padding-left: 20px;
  }
  li {
    margin-bottom: 3.5px;
  }
  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
  }
  .badge-primary { background: #e0e7ff; color: #3730a3; }
  .badge-success { background: #dcfce7; color: #166534; }
  .badge-warning { background: #fef3c7; color: #92400e; }
  .card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 8px 0 12px 0;
  }
  .card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 12px;
  }
  .card h4 {
    margin: 0 0 4px 0;
    font-size: 9.5pt;
    color: #1e293b;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 8.5pt;
  }
  th, td {
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    text-align: left;
  }
  th {
    background: #f1f5f9;
    font-weight: 700;
    color: #1e293b;
  }
  .highlight-box {
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    border-left: 4px solid #6366f1;
    padding: 8px 12px;
    border-radius: 4px;
    margin: 10px 0;
  }
  .page-break {
    page-break-after: always;
  }
</style>
</head>
<body>

<div class="header-box">
  <div>
    <h1 class="title">Inkloom AI — Brand-Governance Platform</h1>
    <div class="subtitle">Round 2 Build Report & Updated Technical Proposal</div>
  </div>
  <div style="text-align: right; font-size: 8.5pt; color: #64748b;">
    <strong>Date:</strong> 22–25 October 2026<br>
    <strong>Stage:</strong> Round 2 Final Submission
  </div>
</div>

<div class="meta-grid">
  <div class="meta-item">
    <strong>Team Name</strong>
    <span>indiedevs</span>
  </div>
  <div class="meta-item">
    <strong>Track</strong>
    <span>Enterprise AI & Automation</span>
  </div>
  <div class="meta-item">
    <strong>Team Members</strong>
    <span>Utkarsh Yadav, Shreya Kumari</span>
  </div>
  <div class="meta-item">
    <strong>Build Status</strong>
    <span style="color: #166534;">Working Core MVP Ready</span>
  </div>
</div>

<h2>1. Executive Summary & Progress from Round 1</h2>
<p>
In Round 1, team <strong>indiedevs</strong> proposed <strong>Inkloom AI</strong>: an intelligent enterprise brand-governance platform designed to eliminate the risks of public brand inconsistencies, unverified product claims, non-inclusive terminology, visual design divergence, and accessibility failures.
</p>
<p>
For <strong>Round 2 — The Build</strong>, we transitioned our blueprint into a <strong>fully operational, production-ready system</strong>. The entire core product journey works seamlessly from start to finish without external setup hurdles. Judges can open the web application, select ready-to-test enterprise scenarios, run real-time scans across multiple formats (text drafts, markdown documents, and visual graphics), inspect explainable rule citations, apply context-preserving auto-fixes with 1 click, collaborate through role-based editorial workflows, and generate cryptographically verifiable Brand Governance Clearance Certificates.
</p>

<h2>2. Completed MVP Features in Round 2</h2>
<div class="card-grid">
  <div class="card">
    <h4>1. Centralized Brand Rule Repository</h4>
    <p style="font-size: 8.5pt; margin: 0; color: #475569;">
      Persistent storage with CRUD operations for Tone-of-Voice rules, verified Product Facts & SLAs, restricted vocabulary dictionaries (DEI & competitor rules), and approved visual palettes. Includes export/import and active rule toggles.
    </p>
  </div>
  <div class="card">
    <h4>2. Multi-Format Real-Time Scanner</h4>
    <p style="font-size: 8.5pt; margin: 0; color: #475569;">
      Dual-engine analysis for text copy, markdown files, and image assets. Evaluates formality, tone polarity, reading time, character offsets, WCAG 2.1 AA color contrast, and accessibility alt-text descriptive depth.
    </p>
  </div>
  <div class="card">
    <h4>3. Explainable Flagging & Remediation</h4>
    <p style="font-size: 8.5pt; margin: 0; color: #475569;">
      Pinpoints violations with exact line citations from the Brand Operations Manual, explains the legal/reputational brand risk, and offers context-preserving replacements with individual "Apply Fix" and "Fix All" actions.
    </p>
  </div>
  <div class="card">
    <h4>4. Collaborative Review & Approval Pipeline</h4>
    <p style="font-size: 8.5pt; margin: 0; color: #475569;">
      Role-based access control (Creator Utkarsh, Brand Manager Shreya, Compliance Lead), document lifecycle tracking (Draft &rarr; In Review &rarr; Changes Requested &rarr; Approved &rarr; Published), visual diff mode, and threaded comments.
    </p>
  </div>
</div>

<div class="highlight-box">
  <strong>Key Round 2 Milestone:</strong> Integrated an interactive "Judge Demo Presets" selector (SaaS Launch, Security Whitepaper, Social Campaign, Governed Showcase) that allows evaluators to test all edge cases and remediation pipelines in under 60 seconds without manual typing.
</div>

<h2>3. Complete End-to-End Product Workflow</h2>
<ol>
  <li><strong>Ingestion & Rule Formulation:</strong> Brand managers configure tone dimensions, verified SLAs (e.g. 99.95% standard), restricted terminology, and approved hex palettes in the Brand Rule Repository.</li>
  <li><strong>Content Drafting & Upload:</strong> Creators draft announcements or drop markdown/text files into the multi-channel editor (Marketing, Docs, Social, Press Release).</li>
  <li><strong>Real-Time AI Governance Scan:</strong> The system scans content simultaneously across Tone, Facts, Terminology, and Clarity, computing a weighted 0–100% Brand Health score with letter grades.</li>
  <li><strong>Explainable Remediation:</strong> The copilot displays flagged snippets with rule citations, risk rationales, and one-click fixes. Users can trigger "Fix All" to automatically remediate all issues.</li>
  <li><strong>Editorial Review & Formal Certification:</strong> Drafts move through role approvals with change tracking and threaded discussions. Upon approval, a signed Brand Governance Clearance Certificate is issued.</li>
  <li><strong>Macro Analytics:</strong> Aggregates department compliance trends, recurring violation categories, and the Guideline Clarity Index to identify training gaps.</li>
</ol>

<div class="page-break"></div>

<h2>4. Technology Stack & Implementation Details</h2>
<table>
  <thead>
    <tr>
      <th style="width: 25%;">Layer</th>
      <th style="width: 35%;">Technology</th>
      <th style="width: 40%;">Implementation Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend UI/UX</strong></td>
      <td>React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons</td>
      <td>Executive enterprise dashboard with sub-50ms render latency, responsive dual-pane layout, and dark-mode aesthetics.</td>
    </tr>
    <tr>
      <td><strong>Backend API</strong></td>
      <td>Python 3.14, FastAPI, Uvicorn, Pydantic v2</td>
      <td>High-concurrency asynchronous REST APIs for scanning, document workflow state transitions, and guideline management.</td>
    </tr>
    <tr>
      <td><strong>AI Governance Engine</strong></td>
      <td>Hybrid Rule Heuristic + Semantic Claim Verifier + LLM Copilot</td>
      <td>Deterministic regex & semantic boundary matching combined with optional Gemini/OpenAI API integration for context-aware explanations.</td>
    </tr>
    <tr>
      <td><strong>Visual & WCAG Engine</strong></td>
      <td>Pillow (PIL), Color Distance Euclidean Space, WCAG 2.1 AA Heuristics</td>
      <td>Extracts dominant 5-color palette from graphics, compares to brand hex codes, verifies 4.5:1 contrast, and scores alt-text accessibility.</td>
    </tr>
    <tr>
      <td><strong>Data Persistence</strong></td>
      <td>SQLite / JSON-backed persistent store</td>
      <td>Thread-safe persistence for rules, review drafts, revision diffs, threaded comments, and audit trails across restarts.</td>
    </tr>
  </tbody>
</table>

<h2>5. Explanation of Changes Made to Original Plan</h2>
<ul>
  <li><strong>Added Multi-Modal Visual Asset Inspector in Round 2:</strong> Originally scheduled for Round 3, we accelerated the image analyzer into Round 2 to allow judges to evaluate visual brand consistency and WCAG 2.1 AA alt-text compliance immediately.</li>
  <li><strong>Added 1-Click "Fix All" Remediator:</strong> Expanded beyond single-violation fixes by creating a reverse-offset replacement engine that remediates entire documents in a single click without character collision.</li>
  <li><strong>Added Verifiable Brand Clearance Certificates:</strong> Implemented cryptographic digital signature hashes and printable audit certificates for approved documents to simulate enterprise compliance sign-offs.</li>
  <li><strong>Self-Contained Offline Reliability:</strong> Integrated robust deterministic semantic heuristics alongside cloud LLM hooks so that judges can run the entire platform with 100% reliability without requiring private third-party API keys.</li>
</ul>

<h2>6. Three Major Planned Improvements for Round 3</h2>
<p>
For Round 3 (The Finish), team <strong>indiedevs</strong> will deliver three substantial, high-impact enterprise additions:
</p>
<ol>
  <li><strong>Deep Multi-Modal Visual Brand Engine (Logo Geometry, Clear Space & Layout Alignment):</strong>
    Upgrading the image scanner from color/alt-text checks to computer vision models that detect logo minimum clear-space violations, prohibited orientation rotations, unapproved typography in graphics, and automated watermark placement verification.
  </li>
  <li><strong>Omnichannel Workspace Integrations & Browser Extension:</strong>
    Developing native plugins and a Chromium workspace extension allowing marketing teams to run Inkloom AI directly inside Google Docs, Notion, and Figma, catching governance violations before drafts are even exported.
  </li>
  <li><strong>Autonomous Guideline Self-Optimization & Predictive Risk Engine:</strong>
    A machine learning feedback loop that analyzes creator override patterns and editorial disputes to automatically suggest style guide refinements to the Brand Governance Board, transforming static rulebooks into living organizational intelligence.
  </li>
</ol>

<h2>7. Usability & Judging Verification Guide</h2>
<div class="card" style="background: #f1f5f9; border-color: #cbd5e1; margin-top: 6px;">
  <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">Quick 60-Second Evaluation Path for Judges:</div>
  <ol style="margin-bottom: 0; padding-left: 18px; font-size: 8.5pt;">
    <li>Open the application link (or run <code>./start.sh</code> locally).</li>
    <li>Click <strong>"Judge Demo Presets"</strong> in the top header and select <em>"1. SaaS Launch Draft"</em>.</li>
    <li>Observe the 42% compliance score and 8 explainable violations with exact citations.</li>
    <li>Click <strong>"Fix All (8)"</strong> in the top right to watch the AI remediator boost score to 98% with confetti celebration!</li>
    <li>Click <strong>"Submit for Review"</strong>, then switch persona in the top right to <em>"Shreya Kumari (Brand Manager)"</em>.</li>
    <li>Navigate to <strong>"Review & Approvals"</strong>, toggle <strong>"View Changes Diff"</strong>, and click <strong>"Approve Content"</strong>.</li>
    <li>Switch to <em>"Compliance Officer"</em> and click <strong>"View Brand Clearance Certificate"</strong> to view the signed certificate!</li>
  </ol>
</div>

<div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 8pt; color: #64748b;">
  <span>Inkloom AI • Round 2 Official Build Document</span>
  <span>Submitted by Team indiedevs (Utkarsh Yadav & Shreya Kumari)</span>
</div>

</body>
</html>
"""

def generate_pdf():
    html_file = "/home/indiedev/Projects/inkloom-ai/submission_document.html"
    pdf_file = "/home/indiedev/Projects/inkloom-ai/Inkloom_AI_Round_2_Submission.pdf"
    
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)
    
    cmd = [
        "chromium",
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--print-to-pdf-no-header",
        f"--print-to-pdf={pdf_file}",
        html_file
    ]
    subprocess.run(cmd, check=True)
    print(f"Generated PDF successfully: {pdf_file}")

if __name__ == "__main__":
    generate_pdf()
