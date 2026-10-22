# Inkloom AI — Enterprise Brand-Governance Platform
> **Round 2 — The Build Submission | Hackathon Event**  
> **Team Name:** `indiedevs`  
> **Track:** Enterprise AI & Workflow Automation  
> **Team Members:** Utkarsh Yadav (AI & Backend Lead), Shreya Kumari (Frontend & Workflow Lead)  
> **Submission Form Link:** [Google Form](https://forms.gle/gyRiHtQT3AnC3MdV6)

---

## 1. Executive Summary & Scalable Production Architecture

Growing enterprises publish marketing copy, technical documentation, press announcements, and visual assets across diverse channels via distributed employees, external agencies, and generative AI tools. Unvetted content often leaks outdated SLA claims, competitor disparagement, non-inclusive terminology, off-brand visual palettes, and digital accessibility violations.

**Inkloom AI** is an intelligent brand-governance platform and editorial co-pilot engineered to scale to millions of users with **free-tier cloud sustainability**, **sub-5ms deterministic performance**, and **zero-knowledge security guarantees**:

1. **Sustainable Free Tier ($0/mo, No Card Required):** Includes 10,000 words/mo, 25 custom brand rules, and client-side cryptographic hashing. Zero expensive vector database dependencies ensure sustainable hosting on free tiers (Render, Vercel, Railway, Fly.io).
2. **Security & Zero-Knowledge Vault:** Features **Ephemeral Zero-Data Retention Mode** (content processed strictly in volatile RAM with zero disk writes), an automated **PII & Secret Scrubber** (masks AWS keys, API credentials, customer emails), and an emergency local data purge.
3. **Multi-Format Content & Visual Scanner:** Instantaneous text scanning with line-by-line violation citations, plus image asset inspection (dominant color extraction, WCAG 2.1 AA contrast checking, and alt-text accessibility scoring).
4. **Explainable Remediation & 1-Click "Fix All":** Flags problematic phrases, quotes the corporate Brand Operations Manual, explains the legal risk, and offers context-preserving replacements with 1-click individual fixes or single-click **"Fix All"**.
5. **Collaborative Review & Certification:** Multi-role workflow (Creator, Brand Manager, Compliance Officer), visual diff view, threaded comments, and printable **Brand Governance Clearance Certificates** with WebCrypto SHA-256 digital signature hashes.
6. **Command Palette (`Cmd+K`) & Hackathon Presets:** Lightning-fast keyboard navigation across all views and one-click "Judge Demo Presets" enabling evaluators to test the full pipeline in under 60 seconds.

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
│  02. Multi-Format AI Scanner    │  Real-time scan (<5ms) across Tone, Facts,
│      & Explainable Co-Pilot     │  Terminology & Clarity with 0–100% Score.
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│  03. Security & Vault Controls  │  Ephemeral RAM processing (Zero Retention),
│      (PII Scrubber & WebCrypto) │  secret masking, and SHA-256 checksums.
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│  04. Context Remediation Engine │  Flagged snippets with exact manual citations;
│      (One-Click & Fix All)      │  one-click contextual remediation.
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│  05. Collaborative Review Hub   │  Role-based approvals (Creator / Brand Lead /
│      & Certification Sign-off   │  Compliance), threaded comments & audit logs.
└───────────────┬─────────────────┘
                │
                ▼
                ▼
┌─────────────────────────────────┐
│  06. Governance Analytics       │  Macro health index, recurring error trends,
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
- **Sub-5ms Execution:** Deterministic local-first tokenization benchmarked at &lt;5ms processing latency.
- **Channel Optimization:** Target channels including Marketing Copy, Technical Documentation, Press Release, Social Media, and Investor Relations.
- **Weighted Health Score:** 0–100% score circular gauge with letter grades (`A+` to `F`), word count, reading time estimation, formality index, and sentiment classification.

### 3. Multi-Modal Visual & Image Asset Inspector
- **Color Palette Extraction:** Extracts 5 dominant colors from uploaded graphics (PNG, JPG, SVG).
- **Brand Palette Harmonization:** Measures Euclidean color distance to certified brand hex standards (`#6366F1` Indigo, `#0F172A` Slate, `#10B981` Emerald).
- **WCAG 2.1 AA Contrast:** Automated contrast ratio verification (requires $\ge 4.5:1$).
- **Accessibility Alt-Text Inspector:** Flags missing or generic alt-text (`image`, `screenshot.png`) and provides one-click AI generation of WCAG-compliant descriptive alt-text.

### 4. Security & Zero-Knowledge Privacy Vault
- **Ephemeral Zero-Data Retention Mode:** Processes confidential drafts purely in volatile memory. Zero disk persistence, zero logging.
- **Automated PII & Secret Scrubber:** Pre-emptively masks AWS access keys, OpenAI/Gemini API keys, bearer auth tokens, customer emails, and credit cards.
- **Hardware-Accelerated Cryptography:** Computes SHA-256 digital document hashes client-side via `window.crypto.subtle`.
- **Emergency Data Purge:** One-click sovereign reset wiping all local document caches and audit states.

### 5. Sustainable Free Tier & Live Quota Meter
- **$0 Free Community Tier:** 10,000 words/mo included forever without credit card.
- **Live Monthly Quota Meter:** Real-time usage progress bar, days until reset, and graceful local throttle.
- **Interactive Tier Simulator:** Switch dynamically between Free Community, Pro Team ($29/mo), and Enterprise Scale ($199/mo) to inspect quota behavior.

### 6. Explainable Flagging & Remediation Copilot
- **Exact Line Citations:** Direct references to the Brand Operations Manual (e.g. *Section 4.1 — Operational Disclosures & Legal Guarantees*).
- **AI Rationale:** Explicit legal and reputational explanations of *why* the flagged phrase damages brand integrity.
- **One-Click "Apply Fix":** Instant in-place text replacement.
- **"Fix All" Automated Remediator:** Remediates all non-conflicting violations simultaneously using reverse character offset sorting without text drift.

### 7. Collaborative Review & Editorial Approval Pipeline
- **Role Persona Switcher:** Switch seamlessly between:
  - ✍️ **Utkarsh Yadav** (`CREATOR`)
  - 🛡️ **Shreya Kumari** (`BRAND_MANAGER`)
  - ⚖️ **Compliance Lead** (`COMPLIANCE_OFFICER`)
- **Document Workflow States:** `DRAFT` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `CHANGES_REQUESTED` $\rightarrow$ `APPROVED` $\rightarrow$ `PUBLISHED`.
- **Side-by-Side Visual Diff:** Compares original unvetted draft against the governed version.
- **Threaded Review Comments:** Anchor-linked comments with resolved/unresolved toggling.
- **Immutable Audit Trail:** Chronological log of all scans, applied fixes, status updates, and reviewer sign-offs.

### 8. Official Brand Clearance Certificate
- Printable / downloadable Certificate of Brand Compliance featuring:
  - Unique Certificate ID (`CERT-INKLOOM-2026-XXXX`).
  - Cryptographic digital signature hash (`SHA256-...`).
  - Compliance scorecard breakdown across all 4 pillars.
  - Authorized sign-off stamps from Brand Management and Legal Compliance.

### 9. Governance Analytics & Audit Intelligence
- **Macro Health Index:** Real-time organizational compliance health (91.4%).
- **Violation Breakdown:** Distribution across Product Facts (38%), Tone (28%), Terminology (22%), and Visual (12%).
- **Department Compliance Leaderboard:** Tracks Marketing, Developer Relations, Sales, and Executive Communications.
- **Top Friction Rules:** Highlights specific rules with high violation rates to uncover corporate training gaps.
- **Guideline Clarity Index:** Identifies ambiguous style guide rules and generates actionable recommendations for brand managers.
- **Exportable Audit Logs:** Download full CSV audit summaries for corporate compliance archives.

### 10. Command Palette (`Cmd+K`) & Judge Demo Presets
- Global `Cmd+K` keyboard launcher for instant navigation, preset loading, and role switching.
- Dedicated **"Judge Demo Presets"** button loading 4 realistic evaluation scenarios in 1 click.

---

## 4. Technology Stack & Architecture

| Layer | Technology | Details |
|---|---|---|
| **Frontend UI** | React 18, TypeScript, Vite, Tailwind CSS | Fast responsive single-page enterprise dashboard, custom dark-mode theme, Lucide icons, canvas-confetti, Cmd+K palette. |
| **Backend Server** | Python 3.14, FastAPI, Uvicorn, Pydantic v2 | High-performance asynchronous REST API handling scans, workflow states, quotas, and rules. |
| **Governance Engine** | Hybrid Regex & Semantic Boundary Matcher | Deterministic context matching (&lt;5ms) + optional Gemini/OpenAI API integration for generative re-writes. |
| **Security & Cryptography** | WebCrypto SubtleCrypto, Ephemeral RAM | Client-side SHA-256 digital hashing, zero-retention memory processing, and regex PII scrubber. |
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

Judges can test the complete end-to-end journey in under 60 seconds:

1. **Open the App:** Navigate to `http://localhost:8000`.
2. **Select Demo Scenario:** Click **"Judge Demo Presets"** in the top header and select **"1. SaaS Launch Draft"**.
3. **Inspect Violations & Speed:** Observe the initial **42% compliance score**, the **&lt;4ms processing speed**, and 8 flagged violations (unsupported "100% uptime", competitor disparagement "AWS is clunky", etc.).
4. **Trigger 1-Click Auto-Remediation:** Click **"Fix All (8)"** in the top right. Watch the score jump to **98%** with celebratory confetti!
5. **Submit to Pipeline:** Click **"Submit for Review"** at the bottom of the editor.
6. **Switch Persona:** In the top right header, click the role badge and switch to **"Shreya Kumari (Brand Manager)"**.
7. **Review & Compare Changes:** Go to the **"Review & Approvals"** tab, toggle **"View Changes Diff"** to inspect original vs. remediated text, and click **"Approve Content"**.
8. **Compliance Sign-Off:** Switch persona to **"Compliance Auditor"**, click **"Certify & Publish"**, and open the **"Brand Clearance Certificate"** to inspect the signed certificate with SHA-256 hash!
9. **Inspect Security & Free Tier:** 
   - Open **"Security & Vault"** to toggle Ephemeral Zero-Data Retention Mode and inspect the PII scrubber.
   - Open **"Plans & Free Tier"** to view the live monthly usage meter and simulate switching tiers.

---

## 7. Submission Metadata
- **Project Name:** Inkloom AI — Brand-Governance Platform
- **Team Name:** indiedevs
- **Track:** Enterprise AI & Workflow Automation
- **Participants:** Utkarsh Yadav, Shreya Kumari
- **Submission Link:** https://forms.gle/gyRiHtQT3AnC3MdV6
- **Updated Project PDF:** `Inkloom_AI_Round_2_Submission.pdf`
