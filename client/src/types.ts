export type RuleCategory = 
  | 'TONE_OF_VOICE' 
  | 'PRODUCT_FACTS' 
  | 'RESTRICTED_TERMINOLOGY' 
  | 'VISUAL_GUIDELINES';

export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export type DocumentStatus = 
  | 'DRAFT' 
  | 'IN_REVIEW' 
  | 'CHANGES_REQUESTED' 
  | 'APPROVED' 
  | 'PUBLISHED';

export type UserRole = 'CREATOR' | 'BRAND_MANAGER' | 'COMPLIANCE_OFFICER';

export type PlanTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface PIIFlag {
  type: string;
  masked_preview: string;
  start_char: number;
  end_char: number;
}

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
  created_at?: number;
  updated_at?: number;
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
  applied?: boolean;
}

export interface ScoreBreakdown {
  tone: number;
  facts: number;
  terminology: number;
  clarity: number;
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
  pii_detected?: PIIFlag[];
  cryptographic_hash?: string;
  processing_time_ms?: number;
  ephemeral?: boolean;
  scan_timestamp: number;
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

export interface ThreadedComment {
  id: string;
  author: string;
  author_role: UserRole;
  text: string;
  timestamp: number;
  resolved: boolean;
  anchor_text?: string;
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
  approved_by?: string;
  approved_at?: number;
  certificate_id?: string;
  cryptographic_hash?: string;
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

export interface SecuritySpecs {
  architecture: string;
  client_crypto: string;
  server_encryption: string;
  ephemeral_mode: {
    supported: boolean;
    description: string;
  };
  pii_scrubber: {
    supported: boolean;
    patterns: string[];
  };
  compliance_standards: string[];
}

export interface AnalyticsData {
  brand_health_index: number;
  total_scans: number;
  violations_intercepted: number;
  editorial_hours_saved: number;
  category_distribution: Record<string, number>;
  top_violated_rules: Array<{
    id: string;
    name: string;
    violations: number;
    category: string;
  }>;
  department_compliance: Array<{
    department: string;
    score: number;
    trend: string;
  }>;
  guideline_clarity_index: number;
  clarity_recommendation: string;
}
