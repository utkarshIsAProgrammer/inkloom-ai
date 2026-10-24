import { useEffect, useMemo, useRef, useState } from "react";
import type { BrandRule, RuleCategory, RuleCategoryOrAll, Severity } from "../types";
import {
  createRule,
  deleteRule,
  exportRules,
  getRules,
  importRules,
  updateRule,
} from "../lib/api";
import { CATEGORY_FILTERS, CATEGORY_OPTIONS, SEVERITY_OPTIONS } from "../lib/constants";
import { messageOf } from "../lib/errors";
import { CATEGORY_LABEL } from "../lib/format";
import PageHead from "./PageHead";
import { Button } from "./ui/Button";
import { SelectField, Switch, TextAreaField, TextField } from "./ui/Field";
import { Notice, Panel, PanelHead } from "./ui/Panel";

type RuleDraft = {
  name: string;
  category: RuleCategory;
  severity: Severity;
  guideline_section: string;
  guideline_text: string;
  terms: string;
  rationale: string;
  suggested_fix: string;
  active: boolean;
};

const EMPTY_DRAFT: RuleDraft = {
  name: "",
  category: "PRODUCT_FACTS",
  severity: "WARNING",
  guideline_section: "",
  guideline_text: "",
  terms: "",
  rationale: "",
  suggested_fix: "",
  active: true,
};

/** One click fills the whole form so a reviewer can add a rule without typing. */
const SAMPLE_RULE_DRAFT: RuleDraft = {
  name: "Unverified absolute performance claim",
  category: "PRODUCT_FACTS",
  severity: "CRITICAL",
  guideline_section: "Section 4.2 — Legal Disclaimers & Warranties",
  guideline_text:
    "Performance claims must be qualified and traceable to a published source. Absolute guarantees — 100% uptime, zero downtime, never fails — are prohibited in commercial collateral.",
  terms: "100% uptime\nzero downtime\nnever fails",
  rationale:
    "Absolute warranties forfeit standard liability protection and create strict legal exposure in commercial disputes.",
  suggested_fix: "verified availability under standard service terms",
  active: true,
};

function toDraft(rule: BrandRule): RuleDraft {
  return {
    name: rule.name,
    category: rule.category,
    severity: rule.severity,
    guideline_section: rule.guideline_section,
    guideline_text: rule.guideline_text,
    terms: rule.pattern_or_terms.join("\n"),
    rationale: rule.rationale,
    suggested_fix: rule.suggested_fix,
    active: rule.active,
  };
}

function RuleForm({
  initial,
  busy,
  onCancel,
  onSubmit,
}: {
  initial: BrandRule | null;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (rule: BrandRule) => void;
}) {
  const [draft, setDraft] = useState<RuleDraft>(initial ? toDraft(initial) : EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const patch = (next: Partial<RuleDraft>) => setDraft((current) => ({ ...current, ...next }));

  function submit() {
    const terms = draft.terms
      .split(/[\n,]/)
      .map((term) => term.trim())
      .filter(Boolean);

    if (!draft.name.trim()) return setError("Name the rule.");
    if (terms.length === 0) return setError("Add at least one term to flag.");
    if (!draft.guideline_text.trim()) return setError("Add the guideline text.");

    onSubmit({
      id: initial?.id ?? "",
      name: draft.name.trim(),
      category: draft.category,
      severity: draft.severity,
      guideline_section: draft.guideline_section.trim() || "Section — Unfiled",
      guideline_text: draft.guideline_text.trim(),
      pattern_or_terms: terms,
      rationale: draft.rationale.trim() || "This phrasing conflicts with the brand manual.",
      suggested_fix: draft.suggested_fix.trim() || "Rewrite the sentence without the flagged claim.",
      active: draft.active,
      created_at: initial?.created_at ?? Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    });
  }

  return (
    <Panel>
      <PanelHead label={initial ? `Edit · ${initial.id}` : "New rule"} />
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            id="rule-name"
            label="Name"
            value={draft.name}
            onChange={(event) => patch({ name: event.target.value })}
            placeholder="Unverified uptime guarantee"
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              id="rule-category"
              label="Category"
              value={draft.category}
              onChange={(event) => patch({ category: event.target.value as RuleCategory })}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              id="rule-severity"
              label="Severity"
              value={draft.severity}
              onChange={(event) => patch({ severity: event.target.value as Severity })}
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        <div className="mt-3">
          <TextField
            id="rule-section"
            label="Citation"
            value={draft.guideline_section}
            onChange={(event) => patch({ guideline_section: event.target.value })}
            placeholder="Section 4.1 — Operational Disclosures"
          />
        </div>

        <div className="mt-3">
          <TextAreaField
            id="rule-text"
            label="Guideline"
            rows={2}
            value={draft.guideline_text}
            onChange={(event) => patch({ guideline_text: event.target.value })}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextAreaField
            id="rule-terms"
            label="Terms to flag"
            rows={4}
            value={draft.terms}
            onChange={(event) => patch({ terms: event.target.value })}
            placeholder={"100% uptime\nzero downtime"}
            hint="One per line, matched literally."
          />
          <TextAreaField
            id="rule-rationale"
            label="Risk"
            rows={4}
            value={draft.rationale}
            onChange={(event) => patch({ rationale: event.target.value })}
          />
        </div>

        <div className="mt-3">
          <TextField
            id="rule-fix"
            label="Suggested rewrite"
            value={draft.suggested_fix}
            onChange={(event) => patch({ suggested_fix: event.target.value })}
          />
        </div>

        <div className="mt-4 border-t border-line pt-3">
          <Switch
            label="Active"
            checked={draft.active}
            onChange={(next) => patch({ active: next })}
          />
        </div>

        {error ? (
          <div className="mt-3">
            <Notice tone="error">{error}</Notice>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={submit} busy={busy}>
            {initial ? "Save" : "Add rule"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {initial ? null : (
            <Button
              variant="accent"
              onClick={() => {
                setError(null);
                setDraft({ ...SAMPLE_RULE_DRAFT });
              }}
            >
              Fill sample rule
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}

export default function RulesView({
  notify,
  onRulesChanged,
}: {
  notify: (text: string, tone?: "info" | "error") => void;
  onRulesChanged: () => void;
}) {
  const [rules, setRules] = useState<BrandRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [category, setCategory] = useState<RuleCategoryOrAll>("ALL");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<BrandRule | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const importInput = useRef<HTMLInputElement>(null);

  async function refresh() {
    try {
      setRules(await getRules());
      setLoadError(null);
    } catch (cause) {
      setLoadError(messageOf(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rules.filter((rule) => {
      if (category !== "ALL" && rule.category !== category) return false;
      if (!needle) return true;
      return [rule.id, rule.name, rule.guideline_text, ...rule.pattern_or_terms]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [rules, category, query]);

  async function save(rule: BrandRule) {
    setSaving(true);
    try {
      if (editing) {
        await updateRule(editing.id, rule);
        notify("Rule updated.");
      } else {
        await createRule(rule);
        notify("Rule added.");
      }
      setFormOpen(false);
      setEditing(null);
      await refresh();
      onRulesChanged();
    } catch (cause) {
      notify(messageOf(cause), "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(rule: BrandRule) {
    setBusyId(rule.id);
    try {
      const updated = await updateRule(rule.id, { ...rule, active: !rule.active });
      setRules((current) => current.map((item) => (item.id === rule.id ? updated : item)));
      notify(updated.active ? "Rule activated." : "Rule deactivated.");
      onRulesChanged();
    } catch (cause) {
      notify(messageOf(cause), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(rule: BrandRule) {
    setBusyId(rule.id);
    try {
      await deleteRule(rule.id);
      setRules((current) => current.filter((item) => item.id !== rule.id));
      setConfirmDelete(null);
      notify("Rule deleted.");
      onRulesChanged();
    } catch (cause) {
      notify(messageOf(cause), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function download() {
    try {
      const data = await exportRules();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "inkloom-brand-rules.json";
      anchor.click();
      URL.revokeObjectURL(url);
      notify(`${data.length} rules exported.`);
    } catch (cause) {
      notify(messageOf(cause), "error");
    }
  }

  async function upload(file: File | null) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as BrandRule[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("That file does not contain a rule list.");
      }
      const response = await importRules(parsed);
      await refresh();
      onRulesChanged();
      notify(response.message);
    } catch (cause) {
      notify(messageOf(cause), "error");
    } finally {
      if (importInput.current) importInput.current.value = "";
    }
  }

  return (
    <div className="pb-10">
      <PageHead
        title="The manual, as rules."
        description="Every scan reads this list. Each rule carries its citation, risk and rewrite."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              New rule
            </Button>
            <Button variant="outline" onClick={download}>
              Export
            </Button>
            <input
              ref={importInput}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              id="rules-import"
              onChange={(event) => void upload(event.target.files?.[0] ?? null)}
            />
            <label
              htmlFor="rules-import"
              className="inline-flex h-10 cursor-pointer items-center rounded-[8px] border border-line px-4 text-[14px] transition-colors hover:border-ink"
            >
              Import
            </label>
          </div>
        }
      />

      <div className="mt-5 space-y-4">
        {formOpen ? (
          <RuleForm
            key={editing?.id ?? "new"}
            initial={editing}
            busy={saving}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSubmit={save}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-4">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setCategory(filter.id)}
                aria-pressed={category === filter.id}
                className={[
                  "text-[12px] font-light transition-colors duration-150",
                  category === filter.id
                    ? "text-ink underline decoration-accent decoration-2 underline-offset-4"
                    : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <input
            className="field h-8 max-w-[200px] text-[13px]"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search rules"
          />
        </div>

        {loadError ? <Notice tone="error">{loadError}</Notice> : null}

        {loading ? (
          <p className="meta py-5 text-muted">Loading rules…</p>
        ) : (
          <Panel>
            <PanelHead
              label={`Rules · ${filtered.length}`}
              right={<span className="meta text-muted">{rules.filter((r) => r.active).length} active</span>}
            />
            <div className="px-4">
              {filtered.length === 0 ? (
                <p className="py-6 text-[13px] font-light text-muted">No rule matches.</p>
              ) : (
                filtered.map((rule) => (
                  <div
                    key={rule.id}
                    className={[
                      "border-t border-line py-3.5 first:border-t-0",
                      rule.active ? "" : "opacity-55",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <span className="font-mono text-[10px] uppercase text-muted">
                            {rule.id}
                          </span>
                          <span
                            className={[
                              "meta",
                              rule.severity === "CRITICAL" ? "text-accent" : "text-muted",
                            ].join(" ")}
                          >
                            {rule.severity}
                          </span>
                          <span className="meta text-muted">
                            {CATEGORY_LABEL[rule.category]}
                          </span>
                        </div>
                        <h2 className="mt-1 text-[14px] font-normal leading-snug">{rule.name}</h2>
                        <p className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted">
                          {rule.guideline_section}
                        </p>
                        <ul className="mt-1.5 flex flex-wrap gap-1.5">
                          {rule.pattern_or_terms.map((term) => (
                            <li
                              key={term}
                              className="border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted"
                            >
                              {term}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3 sm:flex-col sm:items-end sm:gap-1">
                        <Button
                          variant="quiet"
                          onClick={() => toggleActive(rule)}
                          busy={busyId === rule.id}
                        >
                          {rule.active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="quiet"
                          onClick={() => {
                            setEditing(rule);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="quiet"
                          className="text-accent hover:text-accent"
                          onClick={() => setConfirmDelete(rule.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {confirmDelete === rule.id ? (
                      <div className="mt-2 flex flex-wrap items-center gap-3 border-l-2 border-accent pl-2 text-[12px]">
                        Delete this rule?
                        <Button
                          variant="quiet"
                          className="text-accent hover:text-accent"
                          onClick={() => remove(rule)}
                          busy={busyId === rule.id}
                        >
                          Confirm
                        </Button>
                        <Button variant="quiet" onClick={() => setConfirmDelete(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
