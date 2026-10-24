import type { ReactNode } from "react";
import type { ScoreBreakdown } from "../../types";
import { scoreLabel } from "../../lib/format";

type Point = { label: string; value: number };

export function Breakdown({
  breakdown,
  className,
}: {
  breakdown: ScoreBreakdown;
  className?: string;
}) {
  const points: Point[] = [
    { label: "Tone", value: breakdown.tone },
    { label: "Facts", value: breakdown.facts },
    { label: "Terminology", value: breakdown.terminology },
    { label: "Clarity", value: breakdown.clarity },
  ];

  return (
    <dl className={["space-y-3", className ?? ""].join(" ")}>
      {points.map((point) => {
        const low = point.value < 78;
        return (
          <div key={point.label}>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="meta text-muted">{point.label}</dt>
              <dd
                className={[
                  "font-mono text-[11px] tracking-[0.06em]",
                  low ? "text-accent" : "text-ink",
                ].join(" ")}
              >
                {point.value}
              </dd>
            </div>
            <div className={["bar mt-1.5", low ? "text-accent" : "text-ink"].join(" ")}>
              <span
                style={{ width: `${Math.min(100, Math.max(0, point.value))}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        );
      })}
    </dl>
  );
}

export function Stat({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="meta text-muted">{label}</dt>
      <dd
        className={[
          "mt-1 text-[13px] font-light",
          mono ? "break-all font-mono text-[12px] leading-relaxed" : "",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}

export function ScoreReadout({
  score,
  grade,
  size = "lg",
  note,
}: {
  score: number;
  grade: string;
  size?: "lg" | "sm";
  note?: string;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span
            className={[
              "display leading-none",
              size === "lg" ? "text-[64px]" : "text-[44px]",
            ].join(" ")}
          >
            {score}
          </span>
          <span className="meta text-muted">/ 100</span>
        </div>
        <span className={["display", size === "lg" ? "text-[32px]" : "text-[24px]"].join(" ")}>
          {grade}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-light text-muted">{note ?? scoreLabel(score)}</p>
    </div>
  );
}
