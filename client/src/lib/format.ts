import type { DocumentStatus, PlanTier, RuleCategory, UserRole } from "../types";

export const CATEGORY_LABEL: Record<RuleCategory, string> = {
  TONE_OF_VOICE: "Tone of voice",
  PRODUCT_FACTS: "Product facts",
  RESTRICTED_TERMINOLOGY: "Restricted terminology",
  VISUAL_GUIDELINES: "Visual guidelines",
};

export const CATEGORY_ORDER: RuleCategory[] = [
  "PRODUCT_FACTS",
  "TONE_OF_VOICE",
  "RESTRICTED_TERMINOLOGY",
  "VISUAL_GUIDELINES",
];

export const ROLE_LABEL: Record<UserRole, string> = {
  CREATOR: "Creator",
  BRAND_MANAGER: "Brand manager",
  COMPLIANCE_OFFICER: "Compliance officer",
};

export const STATUS_ORDER: DocumentStatus[] = [
  "DRAFT",
  "IN_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "PUBLISHED",
];

export const TIER_LABEL: Record<PlanTier, string> = {
  FREE: "Free",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

/** Transitions the review workflow allows a human reviewer to make. */
export const NEXT_STATUS: Record<DocumentStatus, DocumentStatus[]> = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "CHANGES_REQUESTED"],
  CHANGES_REQUESTED: ["IN_REVIEW"],
  APPROVED: ["PUBLISHED", "CHANGES_REQUESTED"],
  PUBLISHED: [],
};

export const STATUS_NEXT_LABEL: Record<DocumentStatus, string> = {
  DRAFT: "Submit for review",
  IN_REVIEW: "Send back to draft",
  CHANGES_REQUESTED: "Resubmit for review",
  APPROVED: "Escalate to review",
  PUBLISHED: "Reopen review",
};

const numberFormat = new Intl.NumberFormat("en-US");

export function formatNumber(value: number): string {
  return numberFormat.format(Math.round(value));
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatDateTime(seconds: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(seconds * 1000))
    .toUpperCase();
}

export function formatDate(seconds: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(seconds * 1000))
    .toUpperCase();
}

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function relativeTime(seconds: number): string {
  const diff = Math.round((seconds * 1000 - Date.now()) / 1000);
  const table: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 7],
    ["week", 4.35],
    ["month", 12],
    ["year", Number.POSITIVE_INFINITY],
  ];

  let value = diff;
  for (const [unit, size] of table) {
    if (Math.abs(value) < size) {
      return relativeFormat.format(Math.round(value), unit);
    }
    value = value / size;
  }
  return relativeFormat.format(Math.round(value), "year");
}

export function shortHash(hash: string | null | undefined): string {
  if (!hash) return "—";
  const body = hash.replace(/^SHA256:/i, "");
  return body.length > 20 ? `${body.slice(0, 20)}…` : body;
}

/** The same grade boundaries the governance engine uses. */
export function gradeFor(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 88) return "A";
  if (score >= 78) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

/** One-line reading of a compliance score, used wherever the number appears. */
export function scoreLabel(score: number): string {
  if (score >= 95) return "Clear of the manual";
  if (score >= 88) return "Minor notes";
  if (score >= 78) return "Review required";
  if (score >= 65) return "Substantial rework";
  return "Blocked by critical findings";
}
