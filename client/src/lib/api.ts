import type {
  Analytics,
  BrandCertificate,
  BrandRule,
  DocumentStatus,
  FixAllResponse,
  HealthStatus,
  ImageScanRequest,
  ImageScanResult,
  PlanTier,
  ReviewDocument,
  ScanRequest,
  ScanResult,
  ScoreBreakdown,
  SecuritySpecs,
  UsageStats,
  UserRole,
  ViolationItem,
} from "../types";

// The production build is served by the FastAPI app on the same origin, so the
// default base is empty. VITE_API_BASE only exists for split-origin deployments.
const BASE = import.meta.env.VITE_API_BASE ?? "";

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("Cannot reach the API. Start the server on port 8000 and try again.");
  }

  if (!response.ok) {
    throw new ApiError(await readError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown };
    if (typeof data.detail === "string") {
      return data.detail;
    }
    if (Array.isArray(data.detail)) {
      const messages = data.detail
        .map((item) => {
          if (item && typeof item === "object" && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }
          return null;
        })
        .filter((message): message is string => message !== null);
      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  } catch {
    // Fall through to the generic message.
  }
  return `Request failed with status ${response.status}.`;
}

/* ------------------------------------------------------------------ */
/* Service                                                             */
/* ------------------------------------------------------------------ */

export const getHealth = () => request<HealthStatus>("/api/health");

/* ------------------------------------------------------------------ */
/* Usage, tiers and trust                                              */
/* ------------------------------------------------------------------ */

export const getUsage = () => request<UsageStats>("/api/usage");

export const setTier = (tier: PlanTier) =>
  request<UsageStats>("/api/usage/tier", {
    method: "POST",
    body: JSON.stringify({ tier }),
  });

export const getSecuritySpecs = () => request<SecuritySpecs>("/api/security/specs");

export const purgeAll = () =>
  request<{ message: string; purged: boolean }>("/api/security/purge", { method: "POST" });

/* ------------------------------------------------------------------ */
/* Brand rules                                                         */
/* ------------------------------------------------------------------ */

export const getRules = () => request<BrandRule[]>("/api/rules");

export const createRule = (rule: BrandRule) =>
  request<BrandRule>("/api/rules", { method: "POST", body: JSON.stringify(rule) });

export const updateRule = (ruleId: string, rule: BrandRule) =>
  request<BrandRule>(`/api/rules/${encodeURIComponent(ruleId)}`, {
    method: "PUT",
    body: JSON.stringify(rule),
  });

export const deleteRule = (ruleId: string) =>
  request<{ message: string; rule_id: string }>(`/api/rules/${encodeURIComponent(ruleId)}`, {
    method: "DELETE",
  });

export const resetRules = () =>
  request<{ message: string; count: number }>("/api/rules/reset", { method: "POST" });

export const exportRules = () => request<BrandRule[]>("/api/rules/export");

export const importRules = (rules: BrandRule[]) =>
  request<{ message: string; count: number }>("/api/rules/import", {
    method: "POST",
    body: JSON.stringify(rules),
  });

/* ------------------------------------------------------------------ */
/* Scanning                                                            */
/* ------------------------------------------------------------------ */

export const scanContent = (payload: ScanRequest) =>
  request<ScanResult>("/api/scan", { method: "POST", body: JSON.stringify(payload) });

export const scanImage = (payload: ImageScanRequest) =>
  request<ImageScanResult>("/api/scan/image", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fixAll = (content: string, violations: ViolationItem[]) =>
  request<FixAllResponse>("/api/scan/fix-all", {
    method: "POST",
    body: JSON.stringify({ content, violations }),
  });

/* ------------------------------------------------------------------ */
/* Review workflow                                                     */
/* ------------------------------------------------------------------ */

export const listDocuments = () => request<ReviewDocument[]>("/api/documents");

export const getDocument = (docId: string) =>
  request<ReviewDocument>(`/api/documents/${encodeURIComponent(docId)}`);

export type NewDocumentInput = {
  title: string;
  author: string;
  author_role: UserRole;
  channel: string;
  content: string;
  original_content?: string;
  status?: DocumentStatus;
  compliance_score?: number;
  score_breakdown?: ScoreBreakdown;
  violations?: ViolationItem[];
  cryptographic_hash?: string | null;
};

/** Creates a document. The backend assigns the id when it is empty. */
export const saveDocument = (input: NewDocumentInput) =>
  request<ReviewDocument>("/api/documents", {
    method: "POST",
    body: JSON.stringify({
      id: "",
      title: input.title,
      author: input.author,
      author_role: input.author_role,
      channel: input.channel,
      status: input.status ?? "DRAFT",
      content: input.content,
      original_content: input.original_content ?? input.content,
      compliance_score: input.compliance_score ?? 0,
      score_breakdown:
        input.score_breakdown ?? { tone: 100, facts: 100, terminology: 100, clarity: 100 },
      violations: input.violations ?? [],
      cryptographic_hash: input.cryptographic_hash ?? null,
    }),
  });

export const transitionStatus = (
  docId: string,
  payload: { status: DocumentStatus; user_role: UserRole; user_name: string; comment?: string }
) =>
  request<ReviewDocument>(`/api/documents/${encodeURIComponent(docId)}/status`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const addComment = (
  docId: string,
  payload: { author: string; author_role: UserRole; text: string; anchor_text?: string | null }
) =>
  request<ReviewDocument>(`/api/documents/${encodeURIComponent(docId)}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resolveComment = (docId: string, commentId: string, resolved: boolean) =>
  request<ReviewDocument>(
    `/api/documents/${encodeURIComponent(docId)}/comments/${encodeURIComponent(commentId)}?resolved=${resolved}`,
    { method: "PATCH" }
  );

export const getCertificate = (docId: string) =>
  request<BrandCertificate>(`/api/documents/${encodeURIComponent(docId)}/certificate`);

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export const getAnalytics = () => request<Analytics>("/api/analytics");
