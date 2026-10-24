import { useEffect, useState } from "react";
import type { Analytics } from "../types";
import { getAnalytics } from "../lib/api";
import { messageOf } from "../lib/errors";
import { CATEGORY_LABEL, CATEGORY_ORDER, formatNumber } from "../lib/format";
import PageHead from "./PageHead";
import { Notice, Panel, PanelHead } from "./ui/Panel";

export default function AnalyticsView() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getAnalytics()
      .then((response) => {
        if (live) setData(response);
      })
      .catch((cause) => {
        if (live) setError(messageOf(cause));
      });
    return () => {
      live = false;
    };
  }, []);

  const maxCategory = data
    ? Math.max(1, ...CATEGORY_ORDER.map((category) => data.category_distribution[category] ?? 0))
    : 1;
  const maxRule =
    data && data.top_violated_rules.length > 0
      ? Math.max(1, ...data.top_violated_rules.map((rule) => rule.violations))
      : 1;

  return (
    <div className="pb-10">
      <PageHead
        title="Where the manual slips."
        description="Live totals from the same store the scanner writes to."
      />

      {error ? (
        <div className="mt-4">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}

      {data === null ? (
        <p className="meta mt-6 text-muted">Loading…</p>
      ) : (
        <div className="mt-6 space-y-6">
          <dl className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
            {[
              ["Brand health", String(data.brand_health_index), "/100"],
              ["Scans", formatNumber(data.total_scans), ""],
              ["Findings", formatNumber(data.violations_intercepted), ""],
              ["Hours saved", data.editorial_hours_saved.toFixed(1), ""],
            ].map(([label, value, unit]) => (
              <div key={label} className="bg-paper py-4 pr-4">
                <dt className="meta text-muted">{label}</dt>
                <dd className="mt-1 flex items-baseline gap-1">
                  <span className="display text-[30px] leading-none md:text-[36px]">
                    {value}
                  </span>
                  {unit ? <span className="meta text-muted">{unit}</span> : null}
                </dd>
              </div>
            ))}
          </dl>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel>
              <PanelHead label="By category" />
              <div className="p-4">
                <dl className="space-y-3">
                  {CATEGORY_ORDER.map((category) => {
                    const value = data.category_distribution[category] ?? 0;
                    return (
                      <div key={category}>
                        <div className="flex items-baseline justify-between gap-4">
                          <dt className="text-[12px] font-light">
                            {CATEGORY_LABEL[category]}
                          </dt>
                          <dd className="font-mono text-[10px] text-muted">{value}</dd>
                        </div>
                        <div className="bar mt-1 text-ink">
                          <span
                            style={{ width: `${(value / maxCategory) * 100}%` }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </Panel>

            <Panel>
              <PanelHead label="Rules that fire most" />
              <div className="px-4 py-1">
                <ul className="divide-y divide-line">
                  {data.top_violated_rules.map((rule, index) => (
                    <li key={rule.id} className="py-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="meta text-muted">{index + 1}</span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-light">
                          {rule.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted">
                          {rule.violations}
                        </span>
                      </div>
                      <div className="bar mt-1.5 text-ink">
                        <span
                          style={{ width: `${(rule.violations / maxRule) * 100}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          </div>

          <p className="text-[12px] font-light text-muted">
            Guideline clarity {data.guideline_clarity_index} · {data.clarity_recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
