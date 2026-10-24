import os
import re
import uuid
import time
import hashlib
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .models import (
    BrandRule, ReviewDocument, ScanRequest, ScanResult, ImageScanRequest,
    ImageScanResult, FixAllRequest, FixAllResponse, StatusUpdateRequest,
    AddCommentRequest, ThreadedComment, DocumentStatus, UserRole,
    UsageStats, ChangeTierRequest, PlanTier,
    WaitlistRequest, WaitlistResponse
)
from .database import db
from .engine.governance_scanner import GovernanceScanner
from .engine.visual_analyzer import VisualAnalyzer
from .engine.ai_copilot import AICopilot
from .engine.ai_engine import AIGovernanceEngine

app = FastAPI(
    title="Inkloom AI — Brand-Governance Platform API",
    description="Enterprise brand-governance, real-time scanning, explainable rule engine, and collaborative review workflows.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The free Render instance has a 5 GB monthly egress budget. Gzip cuts the
# JavaScript bundle from ~345 KB to ~105 KB on every cold visit.
app.add_middleware(GZipMiddleware, minimum_size=500, compresslevel=6)


@app.middleware("http")
async def cache_headers(request: Request, call_next):
    """Hashed assets are immutable; HTML and API responses are always revalidated."""
    response = await call_next(request)
    path = request.url.path
    if path.startswith("/assets/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    elif path.startswith("/fonts/"):
        response.headers["Cache-Control"] = "public, max-age=2592000"
    elif path.startswith("/api/") or path in ("/", "/health"):
        response.headers["Cache-Control"] = "no-store"
    elif response.headers.get("content-type", "").startswith("text/html"):
        response.headers["Cache-Control"] = "no-cache"
    return response


copilot = AICopilot()
ai_engine = AIGovernanceEngine()

# --- AI QUOTA GUARD -----------------------------------------------------------
# The Gemini key lives only in the server environment, so every model call is
# proxied through this app. A per-IP token bucket keeps any one visitor from
# draining the key's quota; when the limit is hit the request is rejected
# honestly rather than silently degraded to heuristic scores.
AI_RATE_LIMIT_PER_MIN = max(1, int(os.getenv("AI_RATE_LIMIT_PER_MIN", "60")))
_AI_BUCKETS: Dict[str, Any] = {}


def _client_address(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _ai_budget_allows(request: Request) -> bool:
    now = time.time()
    window = int(now // 60)
    key = _client_address(request)
    stored = _AI_BUCKETS.get(key)
    count = stored[1] + 1 if stored and stored[0] == window else 1
    _AI_BUCKETS[key] = (window, count)
    if len(_AI_BUCKETS) > 5000:  # opportunistic cleanup of stale buckets
        for stale in [k for k, (w, _) in _AI_BUCKETS.items() if w != window]:
            _AI_BUCKETS.pop(stale, None)
    return count <= AI_RATE_LIMIT_PER_MIN


def _rate_limited() -> HTTPException:
    return HTTPException(
        status_code=429,
        detail=(
            f"AI scan limit reached ({AI_RATE_LIMIT_PER_MIN} per minute per address). "
            "Wait a minute and run the scan again."
        ),
    )

@app.get("/health")
@app.get("/api/health")
def health_check():
    rules = db.get_all_rules()
    docs = db.get_all_documents()
    usage = db.get_usage()
    return {
        "status": "healthy",
        "service": "Inkloom AI Brand-Governance Platform",
        "stage": "Round 2 — Production-Ready Build",
        "version": "1.0.0",
        "tier": usage.tier.value,
        "active_rules_count": len([r for r in rules if r.active]),
        "total_rules_count": len(rules),
        "tracked_documents": len(docs),
        "zero_retention_supported": True,
        "hardware_crypto_supported": True,
        "ai_engine": ai_engine.summary,
        "timestamp": time.time()
    }

# --- USAGE, FREE TIERS & QUOTAS ---

@app.get("/api/usage", response_model=UsageStats)
def get_usage_stats():
    return db.get_usage()

@app.post("/api/usage/tier", response_model=UsageStats)
def switch_tier(req: ChangeTierRequest):
    return db.set_tier(req.tier)

# --- SECURITY & ZERO-DATA RETENTION ---

@app.get("/api/security/specs")
def get_security_specs():
    return {
        "architecture": "Zero-Knowledge Ephemeral Governance Relay",
        "client_crypto": "WebCrypto SubtleCrypto (SHA-256 digital document signatures)",
        "server_encryption": "AES-256-GCM at rest, TLS 1.3 in transit",
        "ephemeral_mode": {
            "supported": True,
            "description": "Scans run strictly in volatile memory. No disk persistence, no logging, zero retention."
        },
        "pii_scrubber": {
            "supported": True,
            "patterns": ["AWS Credentials", "API Keys (sk-...)", "Bearer Auth Tokens", "Customer Emails", "Credit Cards"]
        },
        "llm_relay": {
            "supported": True,
            "description": "Governance scans are scored by an LLM called exclusively from this server. The provider key lives in a server-side environment variable: it is never sent to the browser, never included in an API response, and never stored in the repository.",
            "key_location": "server environment (GEMINI_API_KEY)",
            "client_visible": False,
            "quota_guard": f"{AI_RATE_LIMIT_PER_MIN} AI requests per minute per client address",
            "drafts_sent_to_model": "PII-scrubbed copy only, capped for length"
        },
        "compliance_standards": ["SOC 2 Type II Auditable", "GDPR Article 17 (Right to Erasure)", "ISO 27001 Controls"]
    }

@app.post("/api/security/purge")
def emergency_purge():
    db.emergency_purge()
    return {"message": "All document drafts and revision states purged successfully", "purged": True}

# --- BRAND RULES CRUD ---

@app.get("/api/rules", response_model=List[BrandRule])
def get_rules():
    return db.get_all_rules()

@app.post("/api/rules", response_model=BrandRule)
def create_rule(rule: BrandRule):
    if not rule.id:
        rule.id = f"RULE-{rule.category.value[:4]}-{uuid.uuid4().hex[:4].upper()}"
    return db.add_rule(rule)

@app.put("/api/rules/{rule_id}", response_model=BrandRule)
def update_rule(rule_id: str, rule: BrandRule):
    updated = db.update_rule(rule_id, rule)
    if not updated:
        raise HTTPException(status_code=404, detail="Rule not found")
    return updated

@app.delete("/api/rules/{rule_id}")
def delete_rule(rule_id: str):
    success = db.delete_rule(rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"message": "Rule successfully deleted", "rule_id": rule_id}

@app.get("/api/rules/export")
def export_rules():
    """Download the rule set as portable JSON."""
    rules = db.get_all_rules()
    return JSONResponse(
        content=[rule.model_dump(mode="json") for rule in rules],
        headers={"Content-Disposition": 'attachment; filename="inkloom-brand-rules.json"'},
    )


@app.post("/api/rules/import")
def import_rules(rules: List[BrandRule]):
    """Merge a previously exported rule set into the repository."""
    if not rules:
        raise HTTPException(status_code=400, detail="No rules supplied")
    if len(rules) > 200:
        raise HTTPException(status_code=400, detail="Import is limited to 200 rules")
    for rule in rules:
        if not rule.name.strip() or not rule.guideline_text.strip() or not rule.pattern_or_terms:
            raise HTTPException(
                status_code=422,
                detail="Each imported rule needs a name, guideline text and at least one term",
            )
    for rule in rules:
        if not rule.id:
            rule.id = f"RULE-{rule.category.value[:4]}-{uuid.uuid4().hex[:4].upper()}"
        db.add_rule(rule)
    return {"message": f"{len(rules)} rules imported", "count": len(rules)}


@app.post("/api/rules/reset")
def reset_rules():
    db.reset_to_defaults()
    return {"message": "Brand guidelines reset to enterprise defaults", "count": len(db.get_all_rules())}
# --- MULTI-FORMAT SCANNER ---

@app.post("/api/scan", response_model=ScanResult)
async def scan_content(req: ScanRequest, request: Request):
    # Blank or tiny input cannot be scored honestly — reject it with a readable
    # message instead of inventing a number for it.
    words = re.findall(r"[A-Za-z0-9']+", req.content)
    if len(req.content.strip()) < 15 or len(words) < 3:
        raise HTTPException(
            status_code=422,
            detail="This draft is too short to analyze. Paste at least 3 words (15 characters) of copy.",
        )

    # Free-tier word quota: reject before doing work once the allowance is spent.
    usage = db.get_usage()
    word_count = len(re.findall(r"[A-Za-z0-9']+", req.content))
    if word_count > usage.words_remaining:
        raise HTTPException(
            status_code=402,
            detail=(
                f"Free tier word limit reached: {usage.words_remaining} of "
                f"{usage.words_limit} words remaining. Upgrade your tier to keep scanning."
            ),
        )

    rules = db.get_all_rules()
    scanner = GovernanceScanner(rules)

    # AI governance pass. The model only ever sees the scrubbed draft, and the
    # call is proxied here so the provider key never leaves this server. If the
    # key is absent or the call fails, the deterministic engine answers alone.
    ai_analysis = None
    if ai_engine.enabled:
        if not _ai_budget_allows(request):
            raise _rate_limited()
        scrubbed_preview = scanner.scrub_pii(req.content)[1] if req.scrub_pii else req.content
        ai_analysis = await ai_engine.analyze(
            content=scrubbed_preview,
            rules=rules,
            channel=req.channel or "General",
            title=req.title or "Untitled Draft",
        )

    result = scanner.scan_text(
        req.content or "",
        ephemeral=req.ephemeral,
        scrub_pii=req.scrub_pii,
        ai_analysis=ai_analysis,
    )

    # Track usage (free tier word counter)
    db.record_scan(result.total_words)

    # Only sync document if NOT in ephemeral mode. Store the analyzed (masked)
    # text when scrubbing is on, so secrets never reach disk.
    if req.document_id and not req.ephemeral:
        doc = db.get_document(req.document_id)
        if doc:
            doc.content = result.scrubbed_content or req.content
            doc.compliance_score = result.compliance_score
            doc.score_breakdown = result.score_breakdown
            doc.violations = result.violations
            doc.cryptographic_hash = result.cryptographic_hash
            db.save_document(doc)

    return result

@app.post("/api/scan/image", response_model=ImageScanResult)
def scan_image(req: ImageScanRequest):
    rules = db.get_all_rules()
    analyzer = VisualAnalyzer(rules)
    return analyzer.analyze(
        image_base64=req.image_base64,
        alt_text=req.alt_text or "",
        asset_name=req.asset_name or "Brand Graphic"
    )

@app.post("/api/scan/fix-all", response_model=FixAllResponse)
async def fix_all_violations(req: FixAllRequest, request: Request):
    rules = db.get_all_rules()
    scanner = GovernanceScanner(rules)

    content = req.content
    applied_count = 0
    mode = "mechanical"

    if ai_engine.enabled and req.violations:
        if not _ai_budget_allows(request):
            raise _rate_limited()
        # Full-draft rewrite: the model applies every finding in context,
        # preserving meaning and voice, instead of splicing in fixed strings.
        rewritten = await ai_engine.rewrite(req.content, req.violations, rules)
        if rewritten:
            content = rewritten
            mode = "ai"
            applied_count = sum(
                1 for v in req.violations
                if v.flagged_text and v.flagged_text not in content
            )

    if mode != "ai":
        fixed = copilot.apply_all_fixes(req.content, req.violations)
        content = fixed.content
        applied_count = fixed.applied_count

    # Rescan the repaired text so the returned score is measured, not assumed.
    rescan = scanner.scan_text(content, ephemeral=False, scrub_pii=True)
    return FixAllResponse(
        content=content,
        applied_count=applied_count,
        compliance_score=rescan.compliance_score,
        mode=mode,
    )

# --- COLLABORATIVE REVIEW WORKFLOW & DOCUMENTS ---

@app.get("/api/documents", response_model=List[ReviewDocument])
def list_documents():
    return db.get_all_documents()

@app.get("/api/documents/{doc_id}", response_model=ReviewDocument)
def get_document(doc_id: str):
    doc = db.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.post("/api/documents", response_model=ReviewDocument)
def save_document(doc: ReviewDocument):
    if not doc.id:
        doc.id = f"doc-{uuid.uuid4().hex[:8]}"
    return db.save_document(doc)

@app.post("/api/documents/{doc_id}/status", response_model=ReviewDocument)
def update_status(doc_id: str, req: StatusUpdateRequest):
    doc = db.update_status(
        doc_id=doc_id,
        new_status=req.status,
        user_role=req.user_role,
        user_name=req.user_name,
        comment=req.comment
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.post("/api/documents/{doc_id}/comments", response_model=ReviewDocument)
def add_comment(doc_id: str, req: AddCommentRequest):
    comment = ThreadedComment(
        id=f"c-{uuid.uuid4().hex[:6]}",
        author=req.author,
        author_role=req.author_role,
        text=req.text,
        anchor_text=req.anchor_text
    )
    doc = db.add_comment(doc_id, comment)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.patch("/api/documents/{doc_id}/comments/{comment_id}", response_model=ReviewDocument)
def resolve_comment(doc_id: str, comment_id: str, resolved: bool = Query(True)):
    doc = db.resolve_comment(doc_id, comment_id, resolved)
    if not doc:
        raise HTTPException(status_code=404, detail="Document or comment not found")
    return doc

def build_certificate(doc: ReviewDocument, base_url: str) -> Dict[str, Any]:
    cert_id = doc.certificate_id or f"CERT-INKLOOM-2026-{uuid.uuid4().hex[:6].upper()}"
    signature = "SHA256-" + hashlib.sha256((doc.content + cert_id).encode("utf-8")).hexdigest()
    return {
        "certificate_id": cert_id,
        "title": doc.title,
        "channel": doc.channel,
        "author": doc.author,
        "approved_by": doc.approved_by or "Brand Governance Board",
        "approved_at": doc.approved_at or time.time(),
        "compliance_score": doc.compliance_score,
        "score_breakdown": doc.score_breakdown.model_dump(),
        "digital_signature_hash": signature,
        "governance_status": "CERTIFIED_BRAND_COMPLIANT",
        "verification_url": f"{base_url.rstrip('/')}/api/verify/{cert_id}",
    }


@app.get("/api/documents/{doc_id}/certificate")
def get_certificate(doc_id: str, request: Request):
    doc = db.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.status not in [DocumentStatus.APPROVED, DocumentStatus.PUBLISHED]:
        raise HTTPException(status_code=400, detail="Certificate is only generated for approved or published content")

    if not doc.certificate_id:
        doc.certificate_id = f"CERT-INKLOOM-2026-{uuid.uuid4().hex[:6].upper()}"
        db.save_document(doc)

    return build_certificate(doc, str(request.base_url))


@app.get("/api/verify/{certificate_id}")
def verify_certificate(certificate_id: str, request: Request):
    """Public verification: resolves a certificate id to the signed clearance record."""
    for doc in db.get_all_documents():
        if (
            doc.certificate_id == certificate_id
            and doc.status in [DocumentStatus.APPROVED, DocumentStatus.PUBLISHED]
        ):
            return {"verified": True, **build_certificate(doc, str(request.base_url))}
    raise HTTPException(status_code=404, detail="Certificate not found")

# --- GOVERNANCE ANALYTICS ---

@app.get("/api/analytics")
def get_analytics():
    return db.get_analytics()

# --- LEDGER WAITLIST ---

@app.post("/api/waitlist", response_model=WaitlistResponse)
def join_waitlist(req: WaitlistRequest):
    """Join the Ledger early-access waitlist.

    Idempotent by email address: a repeat submission keeps its original place and
    returns `already_registered: true`. Invalid addresses are rejected with 422.
    """
    return db.add_waitlist_signup(req.email)

@app.get("/api/waitlist/count")
def get_waitlist_count():
    """Total number of studios in the queue, including the launch baseline of 411."""
    return {"total": db.get_waitlist_count()}

# Static Client Serving (when built)
client_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "dist"))
if os.path.exists(client_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(client_dist, "assets")), name="assets")
    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    def serve_frontend(full_path: str):
        file_path = os.path.join(client_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(client_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
