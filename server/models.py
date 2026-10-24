import re
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
import time

# Kept dependency-free on purpose: adding email-validator would mean a new
# entry in requirements.txt just to gate one landing page field.
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$")

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
    title: Optional[str] = Field(default="Untitled Draft", max_length=200)
    channel: Optional[str] = Field(default="Marketing Copy", max_length=80)
    content: str = Field(max_length=100_000)
    document_id: Optional[str] = None
    ephemeral: bool = False # If true: zero data retention mode, strictly in-memory
    scrub_pii: bool = True  # If true: auto-masks API keys, credentials, and emails

class ScoreBreakdown(BaseModel):
    tone: int
    facts: int
    terminology: int
    clarity: int

class RuleCheck(BaseModel):
    """One rule's determination from the AI's mandatory rule-by-rule audit."""

    rule_id: str
    rule_name: str = ""
    # VIOLATED | COMPLIANT | NOT_APPLICABLE (normalised by the engine)
    status: str = "COMPLIANT"
    note: str = ""

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
    scrubbed_content: Optional[str] = None  # masked copy when PII scrubbing changed the text
    # "ai" when the Gemini governance analyst scored the draft, "heuristic"
    # when the deterministic matcher ran alone (no key / model unavailable).
    analysis_mode: str = "heuristic"
    # Per-rule audit trail: every active rule the model judged, and how.
    # Empty in heuristic mode.
    rule_coverage: List[RuleCheck] = []
    scan_timestamp: float = Field(default_factory=time.time)

class ImageScanRequest(BaseModel):
    image_url: Optional[str] = Field(default=None, max_length=2000)
    image_base64: Optional[str] = Field(default=None, max_length=8_000_000)
    alt_text: Optional[str] = Field(default="", max_length=2000)
    asset_name: Optional[str] = Field(default="Brand Hero Graphic", max_length=200)
    channel: Optional[str] = Field(default="Website Hero", max_length=80)

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
    # "ai" for a full-draft model rewrite, "mechanical" for span replacement.
    mode: str = "mechanical"

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
    user_name: str = Field(max_length=120)
    comment: Optional[str] = Field(default=None, max_length=2000)

class AddCommentRequest(BaseModel):
    author: str = Field(max_length=120)
    author_role: UserRole
    text: str = Field(min_length=1, max_length=4000)
    anchor_text: Optional[str] = Field(default=None, max_length=500)

class UsageStats(BaseModel):
    tier: PlanTier = PlanTier.FREE
    tier_name: str = "Free Community Tier"
    words_scanned: int = 0
    words_limit: int = 10000
    words_remaining: int = 10000
    scans_conducted: int = 0
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

# --- LEDGER WAITLIST ---

class WaitlistRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalised = value.strip().lower()
        if not EMAIL_PATTERN.match(normalised):
            raise ValueError("Please enter a valid email address")
        return normalised

class WaitlistSignup(BaseModel):
    id: str
    email: str # lowercased and trimmed
    queue_position: int # 1-based place in the queue
    created_at: float = Field(default_factory=time.time)

class WaitlistResponse(BaseModel):
    queue_position: int
    total_ahead: int
    total: int
    already_registered: bool = False
