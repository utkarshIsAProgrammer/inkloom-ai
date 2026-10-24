import type { RuleCategory, RuleCategoryOrAll, TabId } from "../types";

export const NAV_ITEMS: { id: TabId; label: string }[] = [
  { id: "scan", label: "Scan" },
  { id: "visual", label: "Assets" },
  { id: "rules", label: "Rules" },
  { id: "review", label: "Review" },
  { id: "insights", label: "Insights" },
  { id: "trust", label: "Trust" },
];

export const CHANNELS = [
  "Marketing Copy",
  "Technical Documentation",
  "Website Hero",
  "Release Notes",
  "Email Campaign",
  "Sales Deck",
  "Social Post",
];

export const VISUAL_CHANNELS = [
  "Website Hero",
  "Paid Social",
  "Email Header",
  "Event Banner",
  "Product Deck",
];

export const CATEGORY_FILTERS: { id: RuleCategoryOrAll; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "PRODUCT_FACTS", label: "Facts" },
  { id: "TONE_OF_VOICE", label: "Tone" },
  { id: "RESTRICTED_TERMINOLOGY", label: "Terminology" },
  { id: "VISUAL_GUIDELINES", label: "Visual" },
];

export const CATEGORY_OPTIONS: { value: RuleCategory; label: string }[] = [
  { value: "PRODUCT_FACTS", label: "Product facts" },
  { value: "TONE_OF_VOICE", label: "Tone of voice" },
  { value: "RESTRICTED_TERMINOLOGY", label: "Restricted terminology" },
  { value: "VISUAL_GUIDELINES", label: "Visual guidelines" },
];

export const SEVERITY_OPTIONS = [
  { value: "CRITICAL" as const, label: "Critical" },
  { value: "WARNING" as const, label: "Warning" },
  { value: "INFO" as const, label: "Info" },
];

export const SAMPLE_COPY = `We are thrilled to unveil the world's greatest workflow platform, an infinitely superior solution that guarantees 100% uptime with zero downtime under any circumstances.

Unlike traditional legacy systems where AWS is clunky and slow, our real-time distributed engine is deployed in every country in the world with military-grade zero-hack encryption.

You'd be foolish not to upgrade immediately. Reach the team at growth@inkloom.ai before the offer ends.`;

export const CLEAN_COPY = `Inkloom scans every draft against the published brand manual and records a signed clearance certificate for each approved version. Performance figures in this material come from the Q3 audit report, and every claim can be traced to a numbered section of the manual.`;

export const THIN_COPY = "this is a very good thing to use";

/** One-click drafts so a reviewer can test the scanner without writing copy. */
export type SampleDraft = { label: string; title: string; channel: string; content: string };

export const SAMPLE_DRAFTS: SampleDraft[] = [
  {
    label: "Sample · risky copy",
    title: "Q4 launch announcement",
    channel: "Marketing Copy",
    content: SAMPLE_COPY,
  },
  {
    label: "Sample · clean copy",
    title: "Security overview",
    channel: "Technical Documentation",
    content: CLEAN_COPY,
  },
  {
    label: "Sample · thin copy",
    title: "Homepage intro",
    channel: "Website Hero",
    content: THIN_COPY,
  },
];

/** Weak alt text chosen so the asset checker has something real to flag. */
export const SAMPLE_ALT_ASSET = "Q4 hero banner";
export const SAMPLE_ALT_TEXT = "IMG_2041";

export const SAMPLE_COMMENT =
  "The uptime guarantee breaches Section 4.2 — Legal Disclaimers & Warranties. Please rewrite with standard warranty terms before approval.";
