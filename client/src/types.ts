/** Types mirroring server/models.py. Keep field names identical to the API. */

export type TabId = "scan" | "visual" | "rules" | "review" | "insights" | "trust";

export type RuleCategory =
  | "TONE_OF_VOICE"
  | "PRODUCT_FACTS"
  | "RESTRICTED_TERMINOLOGY"
  | "VISUAL_GUIDELINES";

export type Severity = "CRITICAL" | "WARNING" | "INFO";

export type DocumentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "PUBLISHED";

export type UserRole = "CREATOR" | "BRAND_MANAGER" | "COMPLIANCE_OFFICER";

export type PlanTier = "FREE" | "PRO" | "ENTERPRISE";

export type RuleCategoryOrAll = RuleCategory | "ALL";

export interface BrandRule {
  id: string;
  name: string;
  category: RuleCategory;
  severity: Severity;
  guideline_section: string;
  guideline_text: string;
  pattern_or_terms: string[];
  rationale: string;
  suggested_fix: string;
  active: boolean;
  created_at: number;
  updated_at: number;
}

export interface ViolationItem {
  rule_id: string;
  rule_name: string;
  category: RuleCategory;
  severity: Severity;
  flagged_text: string;
  start_char: number;
  end_char: number;
  line_number: number;
  guideline_citation: string;
  guideline_excerpt: string;
  ai_rationale: string;
  suggested_fix: string;
  applied: boolean;
}

export interface ScoreBreakdown {
  tone: number;
  facts: number;
  terminology: number;
  clarity: number;
}

export interface RuleCheck {
  rule_id: string;
  rule_name: string;
  status: "VIOLATED" | "COMPLIANT" | "NOT_APPLICABLE" | string;
  note: string;
}

export interface PIIFlag {
  type: string;
  masked_preview: string;
  start_char: number;
  end_char: number;
}

export interface ScanRequest {
  title?: string;
  channel?: string;
  content: string;
  document_id?: string | null;
  ephemeral?: boolean;
  scrub_pii?: boolean;
}

export interface ScanResult {
  compliance_score: number;
  grade: string;
  score_breakdown: ScoreBreakdown;
  total_words: number;
  reading_time_seconds: number;
  sentiment_label: string;
  formality_label: string;
  violations: ViolationItem[];
  pii_detected: PIIFlag[];
  cryptographic_hash: string;
  processing_time_ms: number;
  ephemeral: boolean;
  scrubbed_content?: string | null;
  /** "ai" when the model scored the draft, "heuristic" for the local engine. */
  analysis_mode: "ai" | "heuristic";
  /** Per-rule audit trail from the AI's mandatory rule-by-rule pass. */
  rule_coverage?: RuleCheck[];
  scan_timestamp: number;
}

export interface ImageScanRequest {
  image_url?: string | null;
  image_base64?: string | null;
  alt_text?: string;
  asset_name?: string;
  channel?: string;
}

export interface ImageScanResult {
  compliance_score: number;
  status: string;
  dominant_colors: string[];
  brand_palette_match: number;
  contrast_ratio: number;
  wcag_pass: boolean;
  alt_text_score: number;
  alt_text_feedback: string;
  suggested_alt_text: string;
  violations: ViolationItem[];
  recommendations: string[];
}

export interface FixAllRequest {
  content: string;
  violations: ViolationItem[];
}

export interface FixAllResponse {
  content: string;
  applied_count: number;
  compliance_score: number;
  /** "ai" for a full-draft model rewrite, "mechanical" for span replacement. */
  mode?: "ai" | "mechanical";
}

export interface ThreadedComment {
  id: string;
  author: string;
  author_role: UserRole;
  text: string;
  timestamp: number;
  resolved: boolean;
  anchor_text?: string | null;
}

export interface AuditEntry {
  timestamp: number;
  user_role: string;
  action: string;
  details: string;
}

export interface ReviewDocument {
  id: string;
  title: string;
  author: string;
  author_role: UserRole;
  channel: string;
  status: DocumentStatus;
  content: string;
  original_content: string;
  compliance_score: number;
  score_breakdown: ScoreBreakdown;
  violations: ViolationItem[];
  comments: ThreadedComment[];
  audit_trail: AuditEntry[];
  approved_by?: string | null;
  approved_at?: number | null;
  certificate_id?: string | null;
  cryptographic_hash?: string | null;
  created_at: number;
  updated_at: number;
}

export interface UsageStats {
  tier: PlanTier;
  tier_name: string;
  words_scanned: number;
  words_limit: number;
  words_remaining: number;
  scans_conducted: number;
  max_rules: number;
  active_rules: number;
  features: string[];
  reset_days_remaining: number;
}

export interface AnalyticsCategoryCounts {
  PRODUCT_FACTS: number;
  TONE_OF_VOICE: number;
  RESTRICTED_TERMINOLOGY: number;
  VISUAL_GUIDELINES: number;
  [key: string]: number;
}

export interface TopViolatedRule {
  id: string;
  name: string;
  violations: number;
  category: RuleCategory;
}

export interface Analytics {
  brand_health_index: number;
  total_scans: number;
  violations_intercepted: number;
  editorial_hours_saved: number;
  category_distribution: AnalyticsCategoryCounts;
  top_violated_rules: TopViolatedRule[];
  guideline_clarity_index: number;
  clarity_recommendation: string;
}

export interface SecuritySpecs {
  architecture: string;
  client_crypto: string;
  server_encryption: string;
  ephemeral_mode: { supported: boolean; description: string };
  pii_scrubber: { supported: boolean; patterns: string[] };
  compliance_standards: string[];
}

export interface HealthStatus {
  status: string;
  service: string;
  stage: string;
  version: string;
  tier: PlanTier;
  active_rules_count: number;
  total_rules_count: number;
  tracked_documents: number;
  zero_retention_supported: boolean;
  hardware_crypto_supported: boolean;
  timestamp: number;
}

export interface BrandCertificate {
  certificate_id: string;
  title: string;
  channel: string;
  author: string;
  approved_by: string;
  approved_at: number;
  compliance_score: number;
  score_breakdown: ScoreBreakdown;
  digital_signature_hash: string;
  governance_status: string;
  verification_url: string;
}

