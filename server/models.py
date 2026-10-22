from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import time

class RuleCategory(str, Enum):
    TONE_OF_VOICE = "TONE_OF_VOICE"
    PRODUCT_FACTS = "PRODUCT_FACTS"
    RESTRICTED_TERMINOLOGY = "RESTRICTED_TERMINOLOGY"
    VISUAL_GUIDELINES = "VISUAL_GUIDELINES"

class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    INFO = "INFO"

class DocumentStatus(str, Enum):
    DRAFT = "DRAFT"
    IN_REVIEW = "IN_REVIEW"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"

class UserRole(str, Enum):
    CREATOR = "CREATOR"
    BRAND_MANAGER = "BRAND_MANAGER"
    COMPLIANCE_OFFICER = "COMPLIANCE_OFFICER"

class PlanTier(str, Enum):
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"

class PIIFlag(BaseModel):
    type: str # 'API_KEY', 'SECRET_TOKEN', 'EMAIL', 'CREDIT_CARD', 'PHONE'
    masked_preview: str
    start_char: int
    end_char: int

class BrandRule(BaseModel):
    id: str
    name: str
    category: RuleCategory
    severity: Severity
    guideline_section: str
    guideline_text: str
    pattern_or_terms: List[str]
    rationale: str
    suggested_fix: str
    active: bool = True
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

class ViolationItem(BaseModel):
    rule_id: str
    rule_name: str
    category: RuleCategory
    severity: Severity
    flagged_text: str
    start_char: int
    end_char: int
    line_number: int = 1
    guideline_citation: str
    guideline_excerpt: str
    ai_rationale: str
    suggested_fix: str
    applied: bool = False

class ScanRequest(BaseModel):
    title: Optional[str] = "Untitled Draft"
    channel: Optional[str] = "Marketing Copy"
    content: str
    document_id: Optional[str] = None
    ephemeral: bool = False # If true: zero data retention mode, strictly in-memory
    scrub_pii: bool = True  # If true: auto-masks API keys, credentials, and emails

class ScoreBreakdown(BaseModel):
    tone: int
    facts: int
    terminology: int
    clarity: int

class ScanResult(BaseModel):
    compliance_score: int
    grade: str
    score_breakdown: ScoreBreakdown
    total_words: int
    reading_time_seconds: int
    sentiment_label: str
    formality_label: str
    violations: List[ViolationItem]
    pii_detected: List[PIIFlag] = []
    cryptographic_hash: str = ""
    processing_time_ms: float = 0.0
    ephemeral: bool = False
    scan_timestamp: float = Field(default_factory=time.time)

class ImageScanRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    alt_text: Optional[str] = ""
    asset_name: Optional[str] = "Brand Hero Graphic"
    channel: Optional[str] = "Website Hero"

class ImageScanResult(BaseModel):
    compliance_score: int
    status: str
    dominant_colors: List[str]
    brand_palette_match: float
    contrast_ratio: float
    wcag_pass: bool
    alt_text_score: int
    alt_text_feedback: str
    suggested_alt_text: str
    violations: List[ViolationItem]
    recommendations: List[str]

class FixAllRequest(BaseModel):
    content: str
    violations: List[ViolationItem]

class FixAllResponse(BaseModel):
    content: str
    applied_count: int
    compliance_score: int

class ThreadedComment(BaseModel):
    id: str
    author: str
    author_role: UserRole
    text: str
    timestamp: float = Field(default_factory=time.time)
    resolved: bool = False
    anchor_text: Optional[str] = None

class AuditEntry(BaseModel):
    timestamp: float = Field(default_factory=time.time)
    user_role: str
    action: str
    details: str

class ReviewDocument(BaseModel):
    id: str
    title: str
    author: str
    author_role: UserRole = UserRole.CREATOR
    channel: str = "Marketing Copy"
    status: DocumentStatus = DocumentStatus.DRAFT
    content: str
    original_content: str
    compliance_score: int = 0
    score_breakdown: ScoreBreakdown = Field(default_factory=lambda: ScoreBreakdown(tone=100, facts=100, terminology=100, clarity=100))
    violations: List[ViolationItem] = []
    comments: List[ThreadedComment] = []
    audit_trail: List[AuditEntry] = []
    approved_by: Optional[str] = None
    approved_at: Optional[float] = None
    certificate_id: Optional[str] = None
    cryptographic_hash: Optional[str] = None
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

class StatusUpdateRequest(BaseModel):
    status: DocumentStatus
    user_role: UserRole
    user_name: str
    comment: Optional[str] = None

class AddCommentRequest(BaseModel):
    author: str
    author_role: UserRole
    text: str
    anchor_text: Optional[str] = None

class UsageStats(BaseModel):
    tier: PlanTier = PlanTier.FREE
    tier_name: str = "Free Community Tier"
    words_scanned: int = 2450
    words_limit: int = 10000
    words_remaining: int = 7550
    scans_conducted: int = 14
    max_rules: int = 25
    active_rules: int = 13
    features: List[str] = [
        "10,000 words / month included (Zero credit card required)",
        "Deterministic local-first real-time scanning (<5ms latency)",
        "Ephemeral Zero-Data-Retention Vault mode",
        "Automated PII & Secret Scrubber (AWS, API keys, credentials)",
        "WCAG 2.1 AA Color Contrast & Alt-Text analysis",
        "Verifiable SHA-256 Brand Clearance Certificates"
    ]
    reset_days_remaining: int = 9

class ChangeTierRequest(BaseModel):
    tier: PlanTier
