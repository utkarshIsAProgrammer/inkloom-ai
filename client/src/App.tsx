import { useCallback, useEffect, useState } from "react";
import type { HealthStatus, TabId } from "./types";
import { getHealth } from "./lib/api";
import { NAV_ITEMS } from "./lib/constants";
import AppHeader from "./components/layout/AppHeader";
import ScanView from "./components/ScanView";
import VisualScanView from "./components/VisualScanView";
import RulesView from "./components/RulesView";
import ReviewView from "./components/ReviewView";
import AnalyticsView from "./components/AnalyticsView";
import SecurityView from "./components/SecurityView";
import { Button } from "./components/ui/Button";
import { Notice } from "./components/ui/Panel";

const TAB_IDS = NAV_ITEMS.map((item) => item.id);

function readTab(): TabId {
  const hash = window.location.hash.replace(/^#/, "");
  return TAB_IDS.includes(hash as TabId) ? (hash as TabId) : "scan";
}

type NoticeState = { text: string; tone: "info" | "error" };

export default function App() {
  const [tab, setTab] = useState<TabId>(readTab);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [offline, setOffline] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const notify = useCallback((text: string, tone: "info" | "error" = "info") => {
    setNotice({ text, tone });
  }, []);

  // One small request on load; no polling, so an idle tab costs nothing.
  const checkApi = useCallback(async () => {
    try {
      setHealth(await getHealth());
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    void checkApi();
  }, [checkApi]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const onHashChange = () => setTab(readTab());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const go = useCallback((next: TabId) => {
    setTab(next);
    if (window.location.hash !== `#${next}`) {
      window.history.replaceState(null, "", `#${next}`);
    }
    window.scrollTo(0, 0);
  }, []);

  const onSentToReview = useCallback(
    (docId: string) => {
      setSelectedDocId(docId);
      go("review");
      void checkApi();
    },
    [go, checkApi]
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <AppHeader tab={tab} onTabChange={go} offline={offline} />

      {offline ? (
        <div className="border-b border-line bg-surface">
          <div className="shell flex items-center justify-between gap-3 py-2">
            <p className="meta text-muted">API offline · start the server on port 8000</p>
            <Button variant="quiet" onClick={() => void checkApi()}>
              Retry
            </Button>
          </div>
        </div>
      ) : null}

      <main className="shell">
        {notice ? (
          <div className="pt-4">
            <Notice tone={notice.tone}>{notice.text}</Notice>
          </div>
        ) : null}

        {tab === "scan" ? (
          <ScanView notify={notify} onSentToReview={onSentToReview} />
        ) : null}
        {tab === "visual" ? <VisualScanView notify={notify} /> : null}
        {tab === "rules" ? (
          <RulesView notify={notify} onRulesChanged={() => void checkApi()} />
        ) : null}
        {tab === "review" ? (
          <ReviewView
            selectedDocId={selectedDocId}
            onSelectDoc={setSelectedDocId}
            notify={notify}
            onOpenScanner={() => go("scan")}
          />
        ) : null}
        {tab === "insights" ? <AnalyticsView /> : null}
        {tab === "trust" ? (
          <SecurityView
            notify={notify}
            onPurged={() => {
              setSelectedDocId(null);
              void checkApi();
            }}
          />
        ) : null}
      </main>

      <footer className="mt-4 border-t border-line">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5">
          <p className="meta text-muted">
            Inkloom · free · no account required
            {health ? ` · ${health.active_rules_count} rules live` : ""}
          </p>
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-light text-muted transition-colors duration-150 hover:text-ink"
          >
            API docs
          </a>
        </div>
      </footer>
    </div>
  );
}
