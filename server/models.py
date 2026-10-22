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
