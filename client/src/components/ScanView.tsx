import { useEffect, useMemo, useState } from "react";
import type { ScanResult, ViolationItem } from "../types";
import { fixAll, saveDocument, scanContent } from "../lib/api";
import { CHANNELS, SAMPLE_DRAFTS } from "../lib/constants";
import { messageOf } from "../lib/errors";
import { shortHash } from "../lib/format";
import PageHead from "./PageHead";
import ViolationRow from "./ViolationRow";
import { Button } from "./ui/Button";
import { SelectField, Switch, TextField } from "./ui/Field";
import { Notice, Panel, PanelHead } from "./ui/Panel";
import { Breakdown, ScoreReadout, Stat } from "./ui/Readout";

const DRAFT_KEY = "inkloom_scan_draft";

type Draft = {
  title: string;
  channel: string;
  content: string;
  ephemeral: boolean;
  scrubPii: boolean;
};

const EMPTY_DRAFT: Draft = {
  title: "Q4 launch announcement",
  channel: CHANNELS[0],
  content: "",
  ephemeral: false,
  scrubPii: true,
};

const MAX_TEXT_FILE = 90 * 1024;
const MAX_CONTENT = 100_000;

function loadDraft(): Draft {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return {
      title: parsed.title ?? EMPTY_DRAFT.title,
      channel: parsed.channel ?? EMPTY_DRAFT.channel,
      content: parsed.content ?? "",
      ephemeral: Boolean(parsed.ephemeral),
      scrubPii: parsed.scrubPii ?? true,
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

const keyOf = (violation: ViolationItem) =>
  `${violation.rule_id}-${violation.start_char}-${violation.end_char}`;

export default function ScanView({
  notify,
  onSentToReview,
}: {
  notify: (text: string, tone?: "info" | "error") => void;
  onSentToReview: (docId: string) => void;
}) {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [selectedSample, setSelectedSample] = useState<number>(-1);
  const [baseline, setBaseline] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { title, channel, content, ephemeral, scrubPii } = draft;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // The draft still lives in memory when storage is blocked.
    }
  }, [draft]);

  const words = useMemo(() => content.match(/[A-Za-z0-9'-]+/g)?.length ?? 0, [content]);
  const dirty = result !== null && content !== baseline;

  const patch = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));

  async function runScan() {
    if (!content.trim()) {
      setError("Paste or upload a draft first.");
      return;
    }
    if (content.length > MAX_CONTENT) {
      setError("Drafts are limited to 100,000 characters.");
      return;
    }
    setError(null);
    setScanning(true);
    try {
      const response = await scanContent({
        title,
        channel,
        content,
        ephemeral,
        scrub_pii: scrubPii,
      });
      // When the scrubber masked secrets, keep the masked copy as the draft so
      // offsets, fixes and anything sent to review all match what was analyzed.
      const analyzed = response.scrubbed_content ?? content;
      if (analyzed !== content) {
        patch({ content: analyzed });
      }
      setResult(response);
      setBaseline(analyzed);
      notify(
        response.scrubbed_content
          ? `Scanned ${response.total_words} words in ${response.processing_time_ms.toFixed(1)} ms. Secrets masked in the draft.`
          : `Scanned ${response.total_words} words in ${response.processing_time_ms.toFixed(1)} ms.`
      );
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setScanning(false);
    }
  }

  async function applyAllFixes() {
    if (!result) return;
    setError(null);
    setFixing(true);
    try {
      const fixed = await fixAll(content, result.violations);
      patch({ content: fixed.content });
      notify(
        fixed.mode === "ai"
          ? `AI rewrote the draft to clear ${fixed.applied_count} findings. Re-scan to confirm.`
          : `${fixed.applied_count} fixes applied. Re-scan to confirm.`
      );
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setFixing(false);
    }
  }

  async function sendToReview() {
    if (!content.trim()) {
      setError("There is nothing to send yet.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const document = await saveDocument({
        title: title.trim() || "Untitled draft",
        author: "Inkloom reviewer",
        author_role: "CREATOR",
        channel,
        content,
        original_content: baseline || content,
        status: "IN_REVIEW",
        compliance_score: result?.compliance_score ?? 0,
        score_breakdown: result?.score_breakdown,
        violations: result?.violations ?? [],
        cryptographic_hash: result?.cryptographic_hash ?? null,
      });
      notify(`“${document.title}” sent to review.`);
      onSentToReview(document.id);
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setSending(false);
    }
  }

  function uploadTextFile(file: File | null) {
    if (!file) return;
    if (file.size > MAX_TEXT_FILE) {
      setError("Text uploads are limited to 90 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      const text = typeof reader.result === "string" ? reader.result : "";
      patch({ content: text, title: file.name.replace(/\.(md|markdown|txt)$/i, "") });
    };
    reader.onerror = () => setError("That file could not be read.");
    reader.readAsText(file);
  }

  return (
    <div className="pb-10">
      <PageHead
        title="Scan copy against the manual."
        description="Paste or upload a draft. Every finding cites the guideline and proposes a fix."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-7">
          <Panel>
            <PanelHead
              label="Draft"
              right={
                <label className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.06em] text-muted transition-colors hover:text-ink">
                  Upload .md / .txt
                  <input
                    type="file"
                    accept=".md,.markdown,.txt,text/plain,text/markdown"
                    className="sr-only"
                    onChange={(event) => uploadTextFile(event.target.files?.[0] ?? null)}
                  />
                </label>
              }
            />
            <div className="p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  id="scan-title"
                  label="Title"
                  value={title}
                  onChange={(event) => patch({ title: event.target.value })}
                  placeholder="Q4 launch announcement"
                />
                <SelectField
                  id="scan-channel"
                  label="Channel"
                  value={channel}
                  onChange={(event) => patch({ channel: event.target.value })}
                >
                  {CHANNELS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-3">
                <label htmlFor="scan-content" className="meta text-muted">
                  Content
                </label>
                <span className="meta text-muted">{words} words</span>
              </div>
              <textarea
                id="scan-content"
                className="field mt-1.5 font-light"
                rows={10}
                spellCheck
                maxLength={MAX_CONTENT}
                value={content}
                onChange={(event) => patch({ content: event.target.value })}
                placeholder="Paste the copy you are about to publish…"
              />

              <div className="mt-4 space-y-3 border-t border-line pt-4">
                <Switch
                  label="Ephemeral scan"
                  detail="Nothing is written to disk."
                  checked={ephemeral}
                  onChange={(next) => patch({ ephemeral: next })}
                />
                <Switch
                  label="Scrub secrets and PII"
                  detail="Masks keys, tokens and emails."
                  checked={scrubPii}
                  onChange={(next) => patch({ scrubPii: next })}
                />
              </div>

              {error ? (
                <div className="mt-4">
                  <Notice tone="error">{error}</Notice>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={runScan} busy={scanning}>
                    {scanning ? "Scanning" : "Scan draft"}
                  </Button>
                  <Button
                    variant="accent"
                    onClick={() => {
                      const next = (selectedSample + 1) % SAMPLE_DRAFTS.length;
                      const sample = SAMPLE_DRAFTS[next];
                      setError(null);
                      setSelectedSample(next);
                      patch({
                        content: sample.content,
                        title: sample.title,
                        channel: sample.channel,
                      });
                    }}
                  >
                    {selectedSample < 0
                      ? "Try a sample"
                      : SAMPLE_DRAFTS[selectedSample]?.label ?? "Try another sample"}
                  </Button>
                </div>
            </div>
          </Panel>

          {result ? (
            <Panel>
              <PanelHead
                label={`Findings · ${result.violations.length}`}
                right={
                  result.pii_detected.length > 0 ? (
                    <span className="meta text-accent">
                      {result.pii_detected.length} secrets
                    </span>
                  ) : undefined
                }
              />
              <div className="px-4">
                {result.violations.length === 0 ? (
                  <p className="py-5 text-[13px] font-light text-muted">
                    No rule was triggered.
                  </p>
                ) : (
                  result.violations.map((violation) => (
                    <ViolationRow
                      key={keyOf(violation)}
                      violation={violation}
                      disabled={dirty}
                      onApply={(item) => {
                        if (dirty) return;
                        patch({
                          content:
                            content.slice(0, item.start_char) +
                            item.suggested_fix +
                            content.slice(item.end_char),
                        });
                      }}
                    />
                  ))
                )}
              </div>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-4 xl:col-span-5">
          {result === null ? (
            <Panel>
              <PanelHead label="Result" />
              <div className="p-4">
                <p className="text-[13px] font-light text-muted">
                  Run a scan to see the score, citations and fixes here.
                </p>
              </div>
            </Panel>
          ) : (
            <>
              <Panel>
                <PanelHead
                  label="Result"
                  right={
                    <span className="meta text-muted">
                      {result.ephemeral ? "Nothing stored" : "Score"}
                    </span>
                  }
                />
                <div className="p-4">
                  <ScoreReadout score={result.compliance_score} grade={result.grade} />
                  <Breakdown breakdown={result.score_breakdown} className="mt-4" />

                  {result.rule_coverage && result.rule_coverage.length > 0 ? (
                    <p className="mt-3 text-[12px] font-light text-muted">
                      {result.rule_coverage.filter((check) => check.status !== "NOT_APPLICABLE")
                        .length}{' '}
                      of {result.rule_coverage.length} rules evaluated ·{' '}
                      <span
                        className={
                          result.rule_coverage.some((check) => check.status === "VIOLATED")
                            ? "text-accent"
                            : ""
                        }
                      >
                        {
                          result.rule_coverage.filter((check) => check.status === "VIOLATED")
                            .length
                        }{' '}
                        violated
                      </span>
                    </p>
                  ) : null}

                  <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-line pt-4">
                    <Stat label="Words" value={result.total_words} />
                    <Stat label="Read" value={`${result.reading_time_seconds}s`} />
                    <Stat
                      label="Engine"
                      value={
                        result.analysis_mode === "ai"
                          ? `AI · ${result.processing_time_ms.toFixed(1)} ms`
                          : `Local · ${result.processing_time_ms.toFixed(1)} ms`
                      }
                    />
                  </dl>
                  <p className="mt-3 text-[12px] font-light text-muted">
                    {result.sentiment_label} · {result.formality_label}
                  </p>
                  <p className="mt-1 break-all font-mono text-[10px] text-muted">
                    SHA-256 {shortHash(result.cryptographic_hash)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                    <Button
                      size="sm"
                      onClick={applyAllFixes}
                      busy={fixing}
                      disabled={result.violations.length === 0 || dirty}
                    >
                      Fix all
                    </Button>
                    <Button size="sm" variant="outline" onClick={sendToReview} busy={sending}>
                      Send to review
                    </Button>
                  </div>

                  {dirty ? (
                    <p className="mt-3 text-[12px] font-light text-muted">
                      Draft changed since this scan. Re-scan to refresh the score.{" "}
                      <Button variant="quiet" onClick={runScan}>
                        Re-scan
                      </Button>
                    </p>
                  ) : null}
                </div>
              </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
