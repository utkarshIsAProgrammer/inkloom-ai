# Inkloom AI — Enterprise Brand-Governance Platform
> **Round 2 — The Build Submission | Hackathon Event**  
> **Team Name:** `indiedevs`  
> **Track:** Enterprise AI & Workflow Automation  
> **Team Members:** Utkarsh Yadav (AI & Backend Lead), Shreya Kumari (Frontend & Workflow Lead)  
> **Submission Form Link:** [Google Form](https://forms.gle/gyRiHtQT3AnC3MdV6)

---

## 1. Executive Summary & Round 2 Progress

Growing enterprises publish marketing copy, technical documentation, press announcements, and visual assets across diverse channels via distributed employees, external agencies, and generative AI tools. Unvetted content often leaks outdated SLA claims, competitor disparagement, non-inclusive terminology, off-brand visual palettes, and digital accessibility violations.

**Inkloom AI** is an intelligent brand-governance platform and editorial co-pilot. Rather than acting as a blunt content rejection filter, Inkloom AI:
1. **Scans multi-format content** (text drafts, markdown documents, and visual graphics).
2. **Explains why an issue was flagged**, citing the exact section and paragraph of the corporate Brand Operations Manual.
3. **Offers context-preserving one-click fixes** with individual remediation or single-click **"Fix All"**.
4. **Facilitates collaborative review workflows** with role-based personas (Creator, Brand Manager, Compliance Officer), threaded comments, and revision diff tracking.
5. **Issues verifiable Brand Governance Clearance Certificates** with cryptographic digital signature hashes.
6. **Delivers macro-governance analytics** tracking organizational Brand Health, department compliance trends, and style guide friction points.

---

## 2. Complete Product Workflow

```
┌─────────────────────────────────┐
│  01. Brand Rule Repository      │  Define verified SLAs (99.95%), tone rules,
│      (Single Source of Truth)   │  restricted terms (DEI), and approved colors.
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│  02. Multi-Format AI Scanner    │  Real-time scan across Tone, Facts,
│      & Explainable Co-Pilot     │  Terminology & Clarity with 0–100% Score.
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│  03. Context Remediation Engine │  Flagged snippets with exact manual citations;
│      (One-Click & Fix All)      │  one-click contextual remediation.
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│  04. Collaborative Review Hub   │  Role-based approvals (Creator / Brand Lead /
│      & Certification Sign-off   │  Compliance), threaded comments & audit logs.
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│  05. Governance Analytics       │  Macro health index, recurring error trends,
│      & Continuous Improvement   │  and Guideline Clarity Index recommendations.
└─────────────────────────────────┘
```

---

## 3. Completed Features (Round 2 Deliverables)

### 1. Centralized Brand Rule Repository
- **4 Governance Pillars:** Tone of Voice, Product Facts & SLAs, Restricted Vocabulary, and Visual Standards.
- **Full CRUD & Dynamic Toggling:** Brand managers can create custom rules, modify severity (`CRITICAL`, `WARNING`, `INFO`), edit trigger keywords, and deactivate rules.
- **Export / Reset:** Single-click export to JSON format or reset to certified enterprise defaults.

### 2. Multi-Format Real-Time Content Scanner
- **Dual Engine Input:** Direct rich text/markdown editor or drag-and-drop file upload (`.md`, `.txt`, `.json`).
- **Channel Optimization:** Target channels including Marketing Copy, Technical Documentation, Press Release, Social Media, and Investor Relations.
- **Weighted Health Score:** 0–100% score circular gauge with letter grades (`A+` to `F`), word count, reading time estimation, formality index, and sentiment classification.

### 3. Multi-Modal Visual & Image Asset Inspector
- **Color Palette Extraction:** Extracts 5 dominant colors from uploaded graphics (PNG, JPG, SVG).
- **Brand Palette Harmonization:** Measures Euclidean color distance to certified brand hex standards (`#6366F1` Indigo, `#0F172A` Slate, `#10B981` Emerald).
- **WCAG 2.1 AA Contrast:** Automated contrast ratio verification (requires $\ge 4.5:1$).
- **Accessibility Alt-Text Inspector:** Flags missing or generic alt-text (`image`, `screenshot.png`) and provides one-click AI generation of WCAG-compliant descriptive alt-text.

### 4. Explainable Flagging & Remediation Copilot
- **Exact Line Citations:** Direct references to the Brand Operations Manual (e.g. *Section 4.1 — Operational Disclosures & Legal Guarantees*).
- **AI Rationale:** Explicit legal and reputational explanations of *why* the flagged phrase damages brand integrity.
- **One-Click "Apply Fix":** Instant in-place text replacement.
- **"Fix All" Automated Remediator:** Remediates all non-conflicting violations simultaneously using reverse character offset sorting without text drift.

### 5. Collaborative Review & Editorial Approval Pipeline
- **Role Persona Switcher:** Switch seamlessly between:
  - ✍️ **Utkarsh Yadav** (`CREATOR`)
  - 🛡️ **Shreya Kumari** (`BRAND_MANAGER`)
  - ⚖️ **Compliance Lead** (`COMPLIANCE_OFFICER`)
- **Document Workflow States:** `DRAFT` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `CHANGES_REQUESTED` $\rightarrow$ `APPROVED` $\rightarrow$ `PUBLISHED`.
- **Side-by-Side Visual Diff:** Compares original unvetted draft against the governed version.
- **Threaded Review Comments:** Anchor-linked comments with resolved/unresolved toggling.
- **Immutable Audit Trail:** Chronological log of all scans, applied fixes, status updates, and reviewer sign-offs.

### 6. Official Brand Clearance Certificate
- Printable / downloadable Certificate of Brand Compliance featuring:
  - Unique Certificate ID (`CERT-INKLOOM-2026-XXXX`).
  - Cryptographic digital signature hash (`SHA256-...`).
  - Compliance scorecard breakdown across all 4 pillars.
  - Authorized sign-off stamps from Brand Management and Legal Compliance.

### 7. Governance Analytics & Audit Intelligence
- **Macro Health Index:** Real-time organizational compliance health (91.4%).
- **Violation Breakdown:** Distribution across Product Facts (38%), Tone (28%), Terminology (22%), and Visual (12%).
- **Department Compliance Leaderboard:** Tracks Marketing, Developer Relations, Sales, and Executive Communications.
- **Top Friction Rules:** Highlights specific rules with high violation rates to uncover corporate training gaps.
- **Guideline Clarity Index:** Identifies ambiguous style guide rules and generates actionable recommendations for brand managers.
- **Exportable Audit Logs:** Download full CSV audit summaries for corporate compliance archives.

---

## 4. Technology Stack & Architecture

| Layer | Technology | Details |
|---|---|---|
| **Frontend UI** | React 18, TypeScript, Vite, Tailwind CSS | Fast responsive single-page enterprise dashboard, custom dark-mode theme, Lucide icons, canvas-confetti. |
| **Backend Server** | Python 3.14, FastAPI, Uvicorn, Pydantic v2 | High-performance asynchronous REST API handling scans, workflow states, and rules. |
| **Governance Engine** | Hybrid Regex & Semantic Boundary Matcher | Deterministic context matching + optional Gemini/OpenAI API integration for generative re-writes. |
| **Visual / Image Engine** | Pillow (PIL), Euclidean Color Space | Dominant palette extraction, color distance scoring, WCAG 2.1 AA contrast ratio checks. |
| **Persistence** | SQLite / JSON Storage Layer | Thread-safe, zero-friction local storage for rules, documents, comments, and audit trails. |

---

## 5. How to Run Locally

### Option A: The One-Command Launcher (Recommended)
From the project root:
```bash
./start.sh
```
This automatically activates the Python environment, builds client assets, and starts the full-stack server on `http://localhost:8000`.

### Option B: Manual Startup
```bash
# 1. Install backend dependencies (if not using .venv)
uv pip install -r requirements.txt

# 2. Build or run frontend
cd client
bun install && bun run build
cd ..

# 3. Start server
python3 -m uvicorn server.main:app --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000` in your web browser.  
Swagger API Documentation is available at `http://localhost:8000/docs`.

---

## 6. Sixty-Second Judging & Verification Guide

Judges can test the complete end-to-end journey in under 60 seconds using the pre-loaded evaluation scenarios:

1. **Open the App:** Navigate to `http://localhost:8000`.
2. **Select Demo Scenario:** Click **"Judge Demo Presets"** in the top header and select **"1. SaaS Launch Draft"**.
3. **Inspect Violations:** Observe the initial **42% compliance score** with 8 flagged violations (unsupported "100% uptime", competitor disparagement "AWS is clunky", deprecated brand name "Inkloom Classic", etc.).
4. **Trigger 1-Click Auto-Remediation:** Click **"Fix All (8)"** in the top right. Watch the score jump to **98%** with a celebratory confetti animation!
5. **Submit to Pipeline:** Click **"Submit for Review"** at the bottom of the editor.
6. **Switch Persona:** In the top right header, click the role badge and switch to **"Shreya Kumari (Brand Manager)"**.
7. **Review & Compare Changes:** Go to the **"Review & Approvals"** tab, toggle **"View Changes Diff"** to inspect original vs. remediated text, and click **"Approve Content"**.
8. **Compliance Sign-Off:** Switch persona to **"Compliance Auditor"**, click **"Certify & Publish"**, and open the **"Brand Clearance Certificate"** to inspect the signed, audit-ready certificate with cryptographic checksum!

---

## 7. Explanation of Changes Made to Original Proposal

1. **Accelerated Multi-Modal Visual Inspection into Round 2:** Originally envisioned for Round 3, we implemented the visual asset scanner (color palette extraction, contrast checking, and WCAG alt-text analysis) in Round 2 to give evaluators immediate multi-format governance.
2. **One-Click "Fix All" Automated Remediation:** Upgraded from single-violation fixes to a robust multi-violation replacement engine that applies fixes from reverse character offsets, preventing text corruption.
3. **Verifiable Brand Clearance Certificates:** Added digital cryptographic hashes and print-ready compliance certificates to model actual enterprise sign-off procedures.
4. **Self-Contained Offline Reliability:** Engineered a deterministic semantic and heuristic engine that works 100% offline with zero external API dependencies, while retaining hooks for Gemini/OpenAI cloud models.

---

## 8. Three Major Improvements for Round 3

1. **Deep Multi-Modal Visual Brand Engine (Logo Geometry, Clear Space & Vector Alignment):**
   Computer vision models for detecting logo minimum clear-space breaches, prohibited rotations, unapproved typography in marketing creatives, and automated brand watermark placement.
2. **Omnichannel Workspace Integrations & Browser Extension:**
   Native plugins and a Chromium browser extension enabling live Inkloom AI governance inside Google Docs, Notion, and Figma.
3. **Autonomous Guideline Self-Optimization & Predictive Risk Engine:**
   Machine learning feedback loops that analyze reviewer dispute patterns to suggest corporate style guide refinements to the Brand Governance Board.

---

## 9. Submission Metadata
- **Project Name:** Inkloom AI — Brand-Governance Platform
- **Team Name:** indiedevs
- **Track:** Enterprise AI & Workflow Automation
- **Participants:** Utkarsh Yadav, Shreya Kumari
- **Submission Link:** https://forms.gle/gyRiHtQT3AnC3MdV6
- **Updated Project PDF:** `Inkloom_AI_Round_2_Submission.pdf`
