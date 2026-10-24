import type { ViolationItem } from "../types";
import { CATEGORY_LABEL } from "../lib/format";
import { Button } from "./ui/Button";

export default function ViolationRow({
  violation,
  disabled = false,
  onApply,
}: {
  violation: ViolationItem;
  disabled?: boolean;
  onApply?: (violation: ViolationItem) => void;
}) {
  const critical = violation.severity === "CRITICAL";

  return (
    <article className="border-t border-line py-4 first:border-t-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={["meta", critical ? "text-accent" : "text-muted"].join(" ")}>
          {violation.severity}
        </span>
        <span className="meta text-muted">{CATEGORY_LABEL[violation.category]}</span>
        <span className="meta text-muted">Line {violation.line_number}</span>
      </div>

      <h3 className="mt-1.5 text-[14px] font-normal leading-snug">{violation.rule_name}</h3>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted">
        {violation.guideline_citation}
      </p>
      <p className="mt-2 text-[13px] font-light leading-relaxed text-muted">
        {violation.ai_rationale}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] sm:grid-cols-2">
        <p className="border-l-2 border-line pl-2">
          <span className="meta mr-2 text-muted">Flagged</span>
          <span className="font-mono break-words">{violation.flagged_text}</span>
        </p>
        <p className="border-l-2 border-accent pl-2">
          <span className="meta mr-2 text-muted">Fix</span>
          <span className="font-mono break-words">{violation.suggested_fix}</span>
        </p>
      </div>

      {onApply ? (
        <Button variant="quiet" className="mt-3" disabled={disabled} onClick={() => onApply(violation)}>
          Apply fix
        </Button>
      ) : null}
    </article>
  );
}
