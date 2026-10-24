import { useEffect, useState } from "react";
import type { SecuritySpecs } from "../types";
import { getSecuritySpecs, purgeAll } from "../lib/api";
import { messageOf } from "../lib/errors";
import PageHead from "./PageHead";
import { Button } from "./ui/Button";
import { Notice, Panel, PanelHead } from "./ui/Panel";

export default function SecurityView({
  notify,
  onPurged,
}: {
  notify: (text: string, tone?: "info" | "error") => void;
  onPurged: () => void;
}) {
  const [specs, setSpecs] = useState<SecuritySpecs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    let live = true;
    getSecuritySpecs()
      .then((response) => {
        if (live) setSpecs(response);
      })
      .catch((cause) => {
        if (live) setError(messageOf(cause));
      });
    return () => {
      live = false;
    };
  }, []);

  async function purge() {
    setPurging(true);
    setError(null);
    try {
      await purgeAll();
      setConfirming(false);
      notify("Stored drafts purged.");
      onPurged();
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setPurging(false);
    }
  }

  return (
    <div className="pb-10">
      <PageHead
        title="Nothing kept."
        description="Scans are deterministic and can run in volatile memory. Data is only stored when you send a draft to review."
      />

      {error ? (
        <div className="mt-4">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}

      {specs === null ? (
        <p className="meta mt-6 text-muted">Loading…</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <Panel>
              <PanelHead label="Architecture" />
              <dl className="divide-y divide-line px-4">
                {[
                  ["Model", specs.architecture],
                  ["Signatures", specs.client_crypto],
                  ["Encryption", specs.server_encryption],
                  ["Ephemeral mode", specs.ephemeral_mode.description],
                ].map(([label, value]) => (
                  <div key={label} className="py-3">
                    <dt className="meta text-muted">{label}</dt>
                    <dd className="mt-0.5 text-[13px] font-light leading-relaxed">{value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>

            <Panel>
              <PanelHead label={`Masked patterns · ${specs.pii_scrubber.patterns.length}`} />
              <ul className="flex flex-wrap gap-2 p-4">
                {specs.pii_scrubber.patterns.map((pattern) => (
                  <li
                    key={pattern}
                    className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.04em] text-muted"
                  >
                    {pattern}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <Panel>
              <PanelHead label="Compliance" />
              <ul className="divide-y divide-line px-4">
                {specs.compliance_standards.map((standard) => (
                  <li key={standard} className="py-2.5 text-[13px] font-light">
                    {standard}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <PanelHead label="Purge stored data" />
              <div className="p-4">
                <p className="text-[12px] font-light text-muted">
                  Deletes every draft, comment and audit entry. Rules are kept. No undo.
                </p>
                {confirming ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={purge} busy={purging}>
                      Confirm purge
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => setConfirming(true)}
                  >
                    Purge
                  </Button>
                )}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
