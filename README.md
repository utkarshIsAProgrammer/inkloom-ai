# Inkloom AI — Brand-Governance Platform

<div align="center">

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-20232a.svg?style=flat-square&logo=react&logoColor=61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0-8E75C2.svg?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-42_Passing-brightgreen.svg?style=flat-square)](server/test_e2e.py)

</div>

**Team:** indiedevs — Utkarsh Yadav (AI & Backend Lead) & Shreya Kumari (Frontend & Workflow Lead)  
**Track:** Enterprise AI & Workflow Automation  
**Stage:** Round 2 — The Build (22–25 October 2026)  
**This file is the updated project PDF for Round 2.**

Inkloom AI is a brand-governance workspace. A creator or brand manager pastes marketing copy, technical documentation, or uploads a visual asset, and Inkloom audits it against the company's brand manual **before publication** — returning a 0–100 compliance score and letter grade, quoting every offending passage at real character offsets, citing the exact manual section, explaining the legal/reputational risk, and offering context-preserving fixes up to a full AI rewrite. Approved drafts earn a SHA-256-signed clearance certificate with a public verification URL.

The whole product — the React workspace in `client/` and the FastAPI governance backend in `server/` — is served from one app at `/`. No sign-up, no auth wall, no key to enter on the client side: the AI key lives only in the server environment.

---

## 1. What You Must Submit — Mapping to This Document

| Round 2 form field | Where it lives |
|---|---|
| Working project link | Deployed app URL **and** the local launcher below. `./start.sh` → `http://localhost:8000`. |
| Source-code repository link | The git repository containing `client/` and `server/`. |
| Updated project PDF | **This README.md** — it is the submission document. |
| List of completed features | Section 2, the 10-row feature table. |
| Technology and implementation details | Section 3 (stack table) and Section 4 (AI + key-safety architecture). |
| Explanation of any changes made to the original plan | Section 5. |
| Three major improvements for Round 3 | Section 6. |

### Working project link — local
```bash
./start.sh
```
Then open `http://localhost:8000`. The launcher activates the Python environment, builds the client if `client/dist` is missing, and starts the full-stack server on port 8000. Swagger API docs are at `http://localhost:8000/docs`.

### Working project link — deployed
Deploy the same repository to any host that runs `./start.sh` (or `uvicorn server.main:app`) and accepts one server-side environment variable:

- `GEMINI_API_KEY` — the provider key for AI scans. Without it the app still serves the workspace and falls back to the deterministic local engine.

`.env` is gitignored; `.env.example` shows the shape.

---

## 2. List of Completed Features

| # | Completed feature | Shipped as | How a judge verifies it live |
|---|---|---|---|
| 1 | Centralized brand rule repository | `RulesView.tsx` + `GET/POST/PUT/DELETE /api/rules`, export/import, reset to defaults | Rules tab → add a rule, toggle it off, search it, export the JSON, re-import it |
| 2 | Multi-format content scanner | Paste or upload `.md`/`.txt` in `ScanView`, PNG/JPEG/WebP + alt-text-only in `VisualScanView`, `/api/scan` and `/api/scan/image` | Scan tab → paste copy → Scan draft; Assets tab → upload an image or check alt text alone → Check asset |
| 3 | Explainable flagging with citations | Every finding shows verbatim flagged text at repaired offsets, the manual citation, the risk rationale, and a suggested fix. The AI returns a verdict for **every** active rule — shown as "13 of 13 rules evaluated · N violated" | Scan a sample draft and read the findings panel |
| 4 | One-click remediation | Per-finding *Apply fix* and an AI full-draft *Fix all* rewrite that preserves voice, followed by a **measured** rescan (the returned score is the rescan, not an estimate) | Scan a failing draft → Fix all → Re-scan to confirm the improved score |
| 5 | Security & zero-data retention | Ephemeral RAM-only scans, length-preserving PII/secret scrubber (AWS keys, API keys, bearer tokens, emails, credit cards) applied **before** any model prompt, SHA-256 document hashes, emergency purge, server-side key relay | Trust tab for the security spec; Scan tab → Ephemeral scan toggle + Scrub PII toggle; a purge button in Trust |
| 6 | Sustainable free tier & quota meter | 10,000-word monthly allowance, tier switcher (Free / Pro / Enterprise) wired to the API, honest `402` before any work starts | Usage shows in the health payload; once the allowance is spent the scan returns `402` |
| 7 | Collaborative review & certification | Queue + detail, draft/changes diff, threaded comments with resolve, role-based status transitions, signed clearance certificate + public `/api/verify/{id}` | Scan a draft → Send to review → Review tab → transition to Approved → View certificate → open its verification URL |
| 8 | Governance analytics | Brand health index, scans, findings intercepted, editorial hours saved, category distribution, top violated rules, Guideline Clarity Index — every number derived from stored data | Insights tab |
| 9 | Judge one-click testing | Glowing **accent sample buttons** on every testable surface: three scan drafts (risky / clean / thin), a weak-alt-text preset, a full sample rule form fill, and a sample review comment. Scan even has one single toggle button that cycles all three demo drafts on click | Scan tab → click the glowing "Try a sample" button repeatedly; Assets → "Sample: weak alt text"; Rules → "Fill sample rule"; Review → "Sample comment" |
| 10 | Key-safe AI integration | `GEMINI_API_KEY` lives only in the server environment, is sent in an `x-goog-api-key` header (never a URL), is rate-limited per IP, and falls back to the deterministic engine on any failure. It is never returned to the client | The `test_provider_key_is_never_returned_to_clients` and `test_ai_only_never_sees_unscrubbed_secrets` tests assert this; Trust tab documents it |

A total of **42 automated end-to-end tests** back these features (`python3 -m unittest server.test_e2e`). They cover governance scoring, citations, PII scrubbing, ephemeral mode, fix-all, oversized-draft rejection, the AI path with the model mocked out, image & OWASP security scanning, the review workflow and certificates, quota tiers, rule export/import, gzip + immutable asset caching, the waitlist API, and the static client mount.

---

## 3. End-to-End Product Workflow (As Implemented)

1. **Brand ingestion & rule setup** — brand managers maintain tone, product-fact, restricted-term, and visual rules in the repository. Every rule's full manual text feeds each AI audit, not just its keyword list.
2. **Content drafting & upload** — creators paste copy or drop `.md`/`.txt` files; images upload through in-browser resize-and-compress so uploads stay small.
3. **Automated AI governance scan** — secrets are masked first, then Gemini scores Tone / Facts / Terminology / Clarity against every active rule, producing a weighted 0–100 score, letter grade, per-rule verdicts, and critical feedback. The result reports `analysis_mode: "ai"` when the model scores it, `"heuristic"` when the local engine answers.
4. **Explanation & correction** — findings show the quote, citation, risk, and fix; apply one finding or run *Fix all* for a full rewrite, then rescan to measure the improvement.
5. **Review & approval** — drafts move through statuses with diffs, threaded comments, and an audit trail; approval issues a signed Brand Clearance Certificate.
6. **Publication & insights** — the analytics dashboard aggregates recurring violations, category distribution, and guideline clarity for training decisions.

### Judge's 60-second evaluation path
1. Open the app (`./start.sh` → `http://localhost:8000`, or the deployed URL). No setup, no keys to enter.
2. **Scan** tab → click the glowing **Try a sample** button → **Scan draft**.
3. Read the result: score/grade, four-dimension breakdown, **"13 of 13 rules evaluated"**, engine badge **AI · ms**, and findings with exact quotes, manual citations, and risk rationales.
4. Click **Fix all** → the AI rewrites the draft → **Re-scan** to confirm the improved score is measured, not claimed.
5. Click **Send to review** → **Review** tab → open the draft → transition to **Approved** (any role) → **View certificate** → open its verification URL.
6. Optional one-click tests elsewhere: **Assets** → *Sample: weak alt text* → **Check asset**; **Rules** → *Fill sample rule*; **Review** → *Sample comment*; **Trust** for the security posture.

> AI scans take ~11–13 s by design — that is a full rule-by-rule audit with written feedback, shown honestly in the *Engine* stat. The key-less deterministic fallback still runs in milliseconds if the model is ever unavailable.

---

## 4. Technology Stack & Implementation Details

| Layer | Technology | Implementation purpose |
|---|---|---|
| **Frontend UI** | React 18, TypeScript, Vite, Tailwind CSS v4 | Swiss-grid governance workspace, six hash-routed views (`#scan`, `#review`, …), no component library, no animation library. Motion respects `prefers-reduced-motion`. |
| **Backend server** | Python 3.14, FastAPI, Uvicorn, Pydantic v2 | Async REST API for scans, workflow states, quotas, and rules. Gzip + immutable asset caching, CORS for the client dev proxy. |
| **Governance engine** | Gemini (structured JSON) + deterministic matcher | The model scores every draft against the **live rule repository** — per-dimension scores, a legibility verdict, and violations with verbatim quotes and repaired character offsets. Results are merged conservatively (the lower of AI and local score wins), so the model can flag meaning but can never inflate a grade. *Fix all* is a full-draft model rewrite that preserves voice, then a measured rescan. With no key or on model failure, the deterministic regex engine answers alone and the scan reports `analysis_mode: "heuristic"`. |
| **Security & cryptography** | SHA-256, ephemeral RAM, PII scrubber | Verifiable document hashes, zero-retention scanning, and automatic secret masking. |
| **Visual / image engine** | Pillow (PIL), Euclidean color space | Dominant palette extraction, color-distance scoring, WCAG 2.1 AA contrast checks. |
| **Persistence** | Thread-safe JSON store (`server/data/db_storage.json`) | Zero-infrastructure storage for rules, documents, comments, audit trails, quota state, and the waitlist. |

### The AI engine & keeping the key server-side
Scoring is powered by Gemini, called **only from the FastAPI server** — this is what lets the deployed app work for judges who never configure anything.

- **Where the key lives.** `GEMINI_API_KEY` in the server environment (Render → Environment, or `.env` locally — see `.env.example`). `.env` is gitignored.
- **How it reaches the model.** `server/engine/ai_engine.py` sends it in the `x-goog-api-key` **header**, never in a URL, so it cannot leak into access logs or exception strings.
- **How it is kept from the client.** The browser only ever talks to `/api/*` on this server. The key is not in any response, not in the JS bundle, and a test asserts this on every scan, `/health`, and `/api/security/specs`.
- **Quota protection.** A per-IP token bucket (`AI_RATE_LIMIT_PER_MIN`, default 60/min) rejects bursts with an honest `429` instead of silently degrading to heuristic scores. Model input is capped at 16,000 characters.
- **Failure behaviour.** Missing key, quota error, or model outage → the deterministic engine answers and the result is labelled `analysis_mode: "heuristic"`. The product never hard-depends on the secret.
- **What the model sees.** The PII-scrubbed draft only (secrets are masked before any prompt is built — covered by a test), plus the active rule digest. Ephemeral drafts are analysed in memory like everything else.

Optional environment variables: `GEMINI_MODEL` (default the current flash model) and `AI_RATE_LIMIT_PER_MIN` (default `60`).

### API surface
Documented interactively at `http://localhost:8000/docs`.

| Area | Routes |
|---|---|
| Brand rules | `GET/POST /api/rules`, `PUT/DELETE /api/rules/{id}`, `GET /api/rules/export`, `POST /api/rules/import`, `POST /api/rules/reset` |
| Scanning | `POST /api/scan`, `POST /api/scan/image`, `POST /api/scan/fix-all` |
| Review workflow | `GET /api/documents`, `GET/POST /api/documents/{id}`, `POST /api/documents/{id}/status`, `POST /api/documents/{id}/comments`, `PATCH /api/documents/{id}/comments/{comment_id}`, `GET /api/documents/{id}/certificate` |
| Verification | `GET /api/verify/{certificate_id}` — resolves a signed clearance certificate |
| Security & usage | `GET /api/security/specs`, `POST /api/security/purge`, `GET /api/usage`, `POST /api/usage/tier` |
| Analytics | `GET /api/analytics` |
| Service | `GET /health`, `GET /api/health` |

Scan input is capped at 100,000 characters, image payloads at 8 MB, comments at 4,000 characters, and rule imports at 200 rules. Invalid input returns a readable `4xx`, never a stack trace. Certificate signatures are real SHA-256 digests of the document plus certificate id.

---

## 5. Explanation of Changes Made to the Original Plan

| Round 1 proposal | Round 2 shipped | Why |
|---|---|---|
| LLM + vector retrieval (Pinecone/pgvector) for guideline matching | Full-context Gemini audit of **all** active rules in one call | The repository holds 13 active rules — the entire manual fits in a prompt, so nothing can be missed by retrieval, and there is no index to run or pay for. A deterministic matcher remains as fallback so the product never hard-depends on a secret. |
| PostgreSQL for roles, revision logs, workflow state | Thread-safe JSON store (`server/data/db_storage.json`) | Zero-infrastructure design that fits a free hosting tier while preserving rules, documents, comments, audit trails, and quota state across restarts. |
| Optional "generative explanations" over a heuristic core | **AI-first scoring** with heuristic merge-floor (the lower score always wins) | Keyword matching cannot judge meaning: random keyboard input once scored 100/100. The model now decides; the local engine only ever lowers a score, never inflates one. |
| (not in plan) | Free tier & quota meter, PII scrubber + ephemeral vault, SHA-256 certificates, visual inspector from Round 2 | Added in Round 2 for judging breadth, security posture, and accessibility coverage. |

Features we deliberately **did not** do, even though they were in the old Round 2 PDF, because they are not in this codebase: a Cmd+K command palette, a confetti celebration, a dark-mode toggle, a mobile iPhone frame, and a multi-preset "Judge Demo Presets" dropdown. Where a judge needs to test quickly, we used glowing sample buttons and a single cycling demo button instead, and we did not claim the missing features here.

---

## 6. Three Major Planned Improvements for Round 3

These are substantial additions, not cosmetic changes.

1. **Deep multi-modal visual brand engine — logo geometry, clear space, rotation, and typography detection.** Computer-vision models that detect logo minimum clear-space violations, prohibited rotations, unapproved typography in marketing assets, and automated watermark placement. This moves the visual inspector from palette-and-contrast checks to a real geometry-and-typography pass — the difference between "this color is close" and "this logo is in the wrong place, rotated, and using the wrong typeface."

2. **Omnichannel workspace integrations & browser extension.** Native plugins and a Chromium workspace extension letting distributed teams run Inkloom AI directly inside Google Docs, Notion, and Figma before copy is published. This is a meaningful expansion of where governance happens — from a standalone paste-and-scan app to edits-in-place governance inside the tools teams already write in.

3. **Autonomous guideline self-optimization & predictive risk engine.** An active-learning feedback loop that analyzes reviewer override patterns and editorial disputes to automatically suggest style-guide refinements to the Brand Governance Board, plus a predictive risk signal that flags recurring weak areas before they become violations. This turns the manual from a static document into something that improves from real usage.

---

## 7. Team & Responsibilities

| Member | Role | Round 2 ownership |
|---|---|---|
| Utkarsh Yadav | AI & Backend Lead | FastAPI backend, Gemini governance engine (audit prompts, offset repair, key-safe relay), scoring/merge logic, storage layer, test suite |
| Shreya Kumari | Frontend & Workflow Lead | React workspace, scan/review/rules/analytics views, review workflows, certificate UI, judge demo presets |

---

## 8. How to Run Locally

### Option A — the one-command launcher
```bash
./start.sh
```
Then open `http://localhost:8000`.

### Option B — manual
```bash
uv pip install -r requirements.txt

cd client
bun install && bun run build     # or: npm install && npm run build
cd ..

python3 -m uvicorn server.main:app --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000`. Swagger API documentation is at `http://localhost:8000/docs`.

For client development with hot reload, `cd client && bun run dev` serves on `http://localhost:5173` and proxies `/api` to port 8000.

### Environment variables
- `GEMINI_API_KEY` — required for AI scans; without it the app serves the workspace and falls back to the deterministic engine.
- `GEMINI_MODEL` — optional, defaults to the current flash model.
- `AI_RATE_LIMIT_PER_MIN` — optional, default `60`.

---

## 9. Tests

```bash
python3 -m unittest server.test_e2e
```

42 end-to-end tests cover the governance engine (scoring, citations, PII scrubbing, ephemeral mode, fix-all including the measured rescan, oversized-draft rejection), the AI path with the model mocked out (AI analysis mode, gibberish failing the legibility review, semantic violations with no keyword match, hallucinated offsets repaired to the real quote, secrets never reaching the model prompt, the key never appearing in any response, AI full-draft rewrite, per-IP rate limiting), image/asset scanning including alt-text-only input and OWASP LLM Top 10 security findings in alt text, the standalone OWASP scanner behaviour, the review workflow and signed certificates, quota tiers, rule export/import, gzip and immutable asset caching, the waitlist API, and the static client mount. The waitlist tests restore the queue after they run, so the shipped queue count stays truthful.

---

## 10. Project Structure

```
.
├── start.sh                  # One-command local launcher
├── requirements.txt          # Python deps
├── .env.example              # Environment variable shape (key is not stored)
├── README.md                 # This file — the Round 2 submission document
├── client/                   # React workspace
│   ├── src/
│   │   ├── App.tsx           # Shell: hash routing, one health check, transient notices
│   │   ├── types.ts          # Types mirroring server/models.py
│   │   ├── lib/api.ts        # Typed client for every governance route
│   │   ├── lib/constants.ts  # Tabs, channels, filters, demo drafts
│   │   ├── lib/format.ts     # Labels, dates, grades, relative time
│   │   ├── lib/diff.ts       # Line diff for the review view
│   │   └── components/
│   │       ├── ScanView.tsx
│   │       ├── VisualScanView.tsx
│   │       ├── RulesView.tsx
│   │       ├── ReviewView.tsx
│   │       ├── AnalyticsView.tsx
│   │       ├── SecurityView.tsx
│   │       ├── PageHead.tsx
│   │       ├── ViolationRow.tsx
│   │       └── ui/           # Button, fields/switch, panel/notice, score readout
│       └── ...
└── server/                   # FastAPI backend
    ├── main.py
    ├── models.py
    ├── database.py
    ├── engine/
    │   ├── ai_engine.py      # Gemini governance engine + key-safe relay
    │   ├── ai_copilot.py
    │   ├── governance_scanner.py
    │   ├── visual_analyzer.py
    │   ├── tone_analyzer.py
    │   ├── claims_verifier.py
    │   └── terminology_filter.py
    ├── data/
    │   └── db_storage.json   # Thread-safe JSON store
    └── test_e2e.py
```

---

*Inkloom AI · Round 2 Build Report · Team indiedevs (Utkarsh Yadav & Shreya Kumari) · Enterprise AI & Workflow Automation*
