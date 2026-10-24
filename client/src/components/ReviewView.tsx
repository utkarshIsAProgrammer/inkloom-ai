import { useEffect, useMemo, useState } from "react";
import type { BrandCertificate, DocumentStatus, ReviewDocument, UserRole } from "../types";
import {
  addComment,
  getCertificate,
  listDocuments,
  resolveComment,
  transitionStatus,
} from "../lib/api";
import { diffLines } from "../lib/diff";
import { messageOf } from "../lib/errors";
import { SAMPLE_COMMENT } from "../lib/constants";
import {
  formatDateTime,
  gradeFor,
  NEXT_STATUS,
  relativeTime,
  scoreLabel,
  shortHash,
} from "../lib/format";
import PageHead from "./PageHead";
import { Button } from "./ui/Button";
import { Notice, Panel, PanelHead } from "./ui/Panel";
import { Breakdown, ScoreReadout, Stat } from "./ui/Readout";

const REVIEWER: { name: string; role: UserRole } = {
  name: "Inkloom reviewer",
  role: "COMPLIANCE_OFFICER",
};

const TRANSITION_LABEL: Record<DocumentStatus, string> = {
  DRAFT: "Back to draft",
  IN_REVIEW: "Submit for review",
  CHANGES_REQUESTED: "Request changes",
  APPROVED: "Approve",
  PUBLISHED: "Publish",
};

export default function ReviewView({
  selectedDocId,
  onSelectDoc,
  notify,
  onOpenScanner,
}: {
  selectedDocId: string | null;
  onSelectDoc: (docId: string | null) => void;
  notify: (text: string, tone?: "info" | "error") => void;
  onOpenScanner: () => void;
}) {
  const [docs, setDocs] = useState<ReviewDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [certificate, setCertificate] = useState<BrandCertificate | null>(null);
  const [view, setView] = useState<"draft" | "changes">("draft");

  const selected = docs.find((doc) => doc.id === selectedDocId) ?? docs[0] ?? null;

  const diff = useMemo(
    () => (selected ? diffLines(selected.original_content, selected.content) : []),
    [selected]
  );

  async function refresh() {
    try {
      const data = await listDocuments();
      setDocs(data);
      setError(null);
      if (!selectedDocId && data.length > 0) onSelectDoc(data[0].id);
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!certificate) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCertificate(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [certificate]);

  function mergeDoc(next: ReviewDocument) {
    setDocs((current) =>
      current
        .map((doc) => (doc.id === next.id ? next : doc))
        .sort((a, b) => b.updated_at - a.updated_at)
    );
  }

  async function changeStatus(status: DocumentStatus) {
    if (!selected) return;
    setBusy(`status:${status}`);
    setError(null);
    try {
      const updated = await transitionStatus(selected.id, {
        status,
        user_role: REVIEWER.role,
        user_name: REVIEWER.name,
      });
      mergeDoc(updated);
      notify(`Moved to ${status.replace(/_/g, " ").toLowerCase()}.`);
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setBusy(null);
    }
  }

  async function postComment() {
    if (!selected) return;
    if (!comment.trim()) {
      setError("Write a comment first.");
      return;
    }
    setBusy("comment");
    setError(null);
    try {
      const updated = await addComment(selected.id, {
        author: REVIEWER.name,
        author_role: REVIEWER.role,
        text: comment.trim(),
      });
      mergeDoc(updated);
      setComment("");
      notify("Comment added.");
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setBusy(null);
    }
  }

  async function toggleComment(commentId: string, resolved: boolean) {
    if (!selected) return;
    setBusy(`comment:${commentId}`);
    try {
      mergeDoc(await resolveComment(selected.id, commentId, resolved));
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setBusy(null);
    }
  }

  async function openCertificate() {
    if (!selected) return;
    setBusy("certificate");
    setError(null);
    try {
      setCertificate(await getCertificate(selected.id));
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="pb-10">
      <PageHead
        title="Review and approve."
        description="Move a draft through the workflow. Every step is recorded, and approval issues a signed certificate."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Panel>
            <PanelHead label={`Queue · ${docs.length}`} />
            {loading ? (
              <p className="meta p-4 text-muted">Loading…</p>
            ) : docs.length === 0 ? (
              <div className="space-y-3 p-4">
                <p className="text-[13px] font-light text-muted">Nothing in review yet.</p>
                <Button size="sm" variant="outline" onClick={onOpenScanner}>
                  Open scanner
                </Button>
              </div>
            ) : (
              docs.map((doc) => {
                const active = selected?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      onSelectDoc(doc.id);
                      setView("draft");
                      setError(null);
                    }}
                    aria-current={active ? "true" : undefined}
                    className={[
                      "block w-full border-t border-line px-4 py-3 text-left transition-colors duration-150",
                      active ? "bg-surface" : "hover:bg-surface/60",
                    ].join(" ")}
                  >
                    <p className="text-[13px] font-normal leading-snug">{doc.title}</p>
                    <p className="meta mt-1 text-muted">
                      {doc.status.replace(/_/g, " ")} · {doc.compliance_score} ·{" "}
                      {relativeTime(doc.updated_at)}
                    </p>
                  </button>
                );
              })
            )}
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-8">
          {error ? <Notice tone="error">{error}</Notice> : null}

          {selected === null ? (
            <Panel>
              <div className="space-y-3 p-4">
                <p className="text-[13px] font-light text-muted">
                  Scan a draft and send it to review to start.
                </p>
                <Button size="sm" onClick={onOpenScanner}>
                  Open scanner
                </Button>
              </div>
            </Panel>
          ) : (
            <>
              <Panel>
                <PanelHead
                  label={selected.status.replace(/_/g, " ")}
                  right={<span className="meta text-muted">{relativeTime(selected.updated_at)}</span>}
                />
                <div className="p-4">
                  <h2 className="display text-[24px] leading-tight">{selected.title}</h2>
                  <p className="mt-1 text-[12px] font-light text-muted">
                    {selected.author} · {selected.channel} ·{" "}
                    {formatDateTime(selected.created_at)}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 border-t border-line pt-4 sm:grid-cols-2">
                    <div>
                      <ScoreReadout
                        score={selected.compliance_score}
                        grade={gradeFor(selected.compliance_score)}
                        size="sm"
                        note={scoreLabel(selected.compliance_score)}
                      />
                      <p className="mt-2 font-mono text-[10px] text-muted">
                        {shortHash(selected.cryptographic_hash)}
                      </p>
                    </div>
                    <Breakdown breakdown={selected.score_breakdown} />
                  </div>

                  <div className="mt-4 border-t border-line pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="meta text-muted">Content</span>
                      <div className="flex gap-3">
                        {(["draft", "changes"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setView(mode)}
                            aria-pressed={view === mode}
                            className={[
                              "text-[11px] font-light capitalize",
                              view === mode
                                ? "text-ink underline decoration-accent decoration-2 underline-offset-4"
                                : "text-muted hover:text-ink",
                            ].join(" ")}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2 max-h-[300px] overflow-y-auto rounded-[8px] border border-line p-3">
                      {view === "draft" ? (
                        <p className="whitespace-pre-wrap text-[13px] font-light leading-relaxed">
                          {selected.content.trim() || "Empty draft."}
                        </p>
                      ) : selected.original_content === selected.content ? (
                        <p className="text-[13px] font-light text-muted">No changes.</p>
                      ) : (
                        <div className="space-y-0.5 font-mono text-[11px] leading-relaxed">
                          {diff.map((line, index) => (
                            <p
                              key={`${index}-${line.kind}`}
                              className={[
                                "whitespace-pre-wrap",
                                line.kind === "added"
                                  ? "border-l-2 border-accent pl-2"
                                  : line.kind === "removed"
                                    ? "border-l-2 border-line pl-2 text-muted line-through"
                                    : "border-l-2 border-transparent pl-2",
                              ].join(" ")}
                            >
                              {line.text || " "}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                    {NEXT_STATUS[selected.status].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={
                          status === "APPROVED" || status === "PUBLISHED" ? "primary" : "outline"
                        }
                        onClick={() => changeStatus(status)}
                        busy={busy === `status:${status}`}
                        disabled={busy !== null}
                      >
                        {TRANSITION_LABEL[status]}
                      </Button>
                    ))}
                    {selected.status === "APPROVED" || selected.status === "PUBLISHED" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={openCertificate}
                        busy={busy === "certificate"}
                      >
                        Certificate
                      </Button>
                    ) : null}
                  </div>

                  {selected.approved_by ? (
                    <p className="mt-2 text-[11px] font-light text-muted">
                      Approved by {selected.approved_by}
                    </p>
                  ) : null}
                </div>
              </Panel>

              <Panel>
                <PanelHead
                  label={`Comments · ${selected.comments.length}`}
                  right={
                    <span className="meta text-muted">
                      {selected.comments.filter((item) => !item.resolved).length} open
                    </span>
                  }
                />
                <div className="p-4">
                  {selected.comments.length > 0 ? (
                    <ul className="space-y-3">
                      {selected.comments.map((item) => (
                        <li
                          key={item.id}
                          className={[
                            "border-l-2 pl-2",
                            item.resolved ? "border-line opacity-55" : "border-accent",
                          ].join(" ")}
                        >
                          <p className="meta text-muted">
                            {item.author} · {relativeTime(item.timestamp)}
                            {item.resolved ? " · resolved" : ""}
                          </p>
                          <p className="mt-0.5 text-[13px] font-light leading-relaxed">
                            {item.text}
                          </p>
                          <Button
                            variant="quiet"
                            className="mt-1"
                            busy={busy === `comment:${item.id}`}
                            onClick={() => toggleComment(item.id, !item.resolved)}
                          >
                            {item.resolved ? "Reopen" : "Resolve"}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-3 border-t border-line pt-3">
                    <label htmlFor="comment-body" className="meta mb-1.5 block text-muted">
                      Comment
                    </label>
                    <textarea
                      id="comment-body"
                      className="field font-light"
                      rows={2}
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Name the claim and the section."
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button size="sm" onClick={postComment} busy={busy === "comment"}>
                        Post
                      </Button>
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => setComment(SAMPLE_COMMENT)}
                      >
                        Sample comment
                      </Button>
                    </div>
                  </div>
                </div>
              </Panel>

              <details className="rounded-[8px] border border-line bg-paper">
                <summary className="cursor-pointer px-4 py-3">
                  <span className="meta text-muted">
                    History · {selected.audit_trail.length}
                  </span>
                </summary>
                <div className="border-t border-line px-4 py-2">
                  {selected.audit_trail.length === 0 ? (
                    <p className="py-2 text-[12px] font-light text-muted">
                      No transitions yet.
                    </p>
                  ) : (
                    [...selected.audit_trail]
                      .reverse()
                      .slice(0, 8)
                      .map((entry, index) => (
                        <div key={`${entry.timestamp}-${index}`} className="border-t border-line py-2 first:border-t-0">
                          <p className="meta text-muted">
                            {formatDateTime(entry.timestamp)} · {entry.user_role}
                          </p>
                          <p className="mt-0.5 text-[12px] font-light text-muted">
                            {entry.details}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </details>

              {selected.violations.length > 0 ? (
                <details className="rounded-[8px] border border-line bg-paper">
                  <summary className="cursor-pointer px-4 py-3">
                    <span className="meta text-muted">
                      Findings · {selected.violations.length}
                    </span>
                  </summary>
                  <ul className="border-t border-line px-4 py-1">
                    {selected.violations.map((violation, index) => (
                      <li
                        key={`${violation.rule_id}-${index}`}
                        className="flex flex-wrap items-baseline gap-x-2 border-t border-line py-2 first:border-t-0"
                      >
                        <span
                          className={[
                            "meta",
                            violation.severity === "CRITICAL" ? "text-accent" : "text-muted",
                          ].join(" ")}
                        >
                          {violation.severity}
                        </span>
                        <span className="min-w-0 flex-1 text-[12px] font-light">
                          {violation.rule_name}
                        </span>
                        <span className="meta text-muted">L{violation.line_number}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </>
          )}
        </div>
      </div>

      {certificate ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-label="Brand clearance certificate"
          onClick={() => setCertificate(null)}
        >
          <div
            className="mx-auto w-full max-w-[560px] rounded-[8px] border border-line bg-paper p-5 md:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
              <p className="meta text-muted">Brand clearance</p>
              <Button variant="quiet" onClick={() => setCertificate(null)}>
                Close
              </Button>
            </div>

            <h2 className="display mt-4 text-[24px] leading-tight">{certificate.title}</h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
              {certificate.certificate_id}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
              <Stat label="Status" value="Certified brand compliant" />
              <Stat label="Score" value={`${certificate.compliance_score} / 100`} />
              <Stat label="Approved by" value={certificate.approved_by} />
              <Stat label="Approved" value={formatDateTime(certificate.approved_at)} />
            </div>

            <div className="mt-4 border-t border-line pt-3">
              <p className="meta text-muted">Signature</p>
              <p className="mt-1 break-all font-mono text-[10px] leading-relaxed">
                {certificate.digital_signature_hash}
              </p>
            </div>

            <div className="mt-3 border-t border-line pt-3">
              <p className="meta text-muted">Verify</p>
              <a
                href={certificate.verification_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block break-all font-mono text-[10px] leading-relaxed underline decoration-line underline-offset-2 hover:text-accent"
              >
                {certificate.verification_url}
              </a>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(certificate.verification_url);
                    notify("Verification URL copied.");
                  } catch {
                    notify("Copy failed. Select the URL manually.", "error");
                  }
                }}
              >
                Copy URL
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
