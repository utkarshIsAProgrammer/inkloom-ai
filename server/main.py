import os
import uuid
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .models import (
    BrandRule, ReviewDocument, ScanRequest, ScanResult, ImageScanRequest,
    ImageScanResult, FixAllRequest, FixAllResponse, StatusUpdateRequest,
    AddCommentRequest, ThreadedComment, DocumentStatus, UserRole
)
from .database import db
from .engine.governance_scanner import GovernanceScanner
from .engine.visual_analyzer import VisualAnalyzer
from .engine.ai_copilot import AICopilot

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

copilot = AICopilot()

@app.get("/health")
@app.get("/api/health")
def health_check():
    rules = db.get_all_rules()
    docs = db.get_all_documents()
    return {
        "status": "healthy",
        "service": "Inkloom AI Brand-Governance Platform",
        "stage": "Round 2 — The Build",
        "version": "1.0.0",
        "active_rules_count": len([r for r in rules if r.active]),
        "total_rules_count": len(rules),
        "tracked_documents": len(docs),
        "timestamp": time.time()
    }

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

@app.post("/api/rules/reset")
def reset_rules():
    db.reset_to_defaults()
    return {"message": "Brand guidelines reset to enterprise defaults", "count": len(db.get_all_rules())}

# --- MULTI-FORMAT SCANNER ---

@app.post("/api/scan", response_model=ScanResult)
def scan_content(req: ScanRequest):
    rules = db.get_all_rules()
    scanner = GovernanceScanner(rules)
    result = scanner.scan(req)

    # If document_id is provided, auto-sync document state
    if req.document_id:
        doc = db.get_document(req.document_id)
        if doc:
            doc.content = req.content
            doc.compliance_score = result.compliance_score
            doc.score_breakdown = result.score_breakdown
            doc.violations = result.violations
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
def fix_all_violations(req: FixAllRequest):
    return copilot.apply_all_fixes(req.content, req.violations)

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

@app.get("/api/documents/{doc_id}/certificate")
def get_certificate(doc_id: str):
    doc = db.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.status not in [DocumentStatus.APPROVED, DocumentStatus.PUBLISHED]:
        raise HTTPException(status_code=400, detail="Certificate is only generated for approved or published content")

    cert_id = doc.certificate_id or f"CERT-INKLOOM-2026-{uuid.uuid4().hex[:6].upper()}"
    return {
        "certificate_id": cert_id,
        "title": doc.title,
        "channel": doc.channel,
        "author": doc.author,
        "approved_by": doc.approved_by or "Brand Governance Board",
        "approved_at": doc.approved_at or time.time(),
        "compliance_score": doc.compliance_score,
        "score_breakdown": doc.score_breakdown.model_dump(),
        "digital_signature_hash": f"SHA256-{hash(doc.content + cert_id) & 0xffffffff:08x}",
        "governance_status": "CERTIFIED_BRAND_COMPLIANT",
        "verification_url": f"https://inkloom.ai/verify/{cert_id}"
    }

# --- GOVERNANCE ANALYTICS ---

@app.get("/api/analytics")
def get_analytics():
    return db.get_analytics()

# Static Client Serving (when built)
client_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "dist"))
if os.path.exists(client_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(client_dist, "assets")), name="assets")
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(client_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(client_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
