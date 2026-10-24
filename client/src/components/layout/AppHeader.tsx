import type { TabId } from "../../types";
import { NAV_ITEMS } from "../../lib/constants";

export default function AppHeader({
  tab,
  onTabChange,
  offline,
}: {
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  offline: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="shell flex h-[56px] items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onTabChange("scan")}
          className="display text-[18px]"
          aria-label="Inkloom, go to scanner"
        >
          INKLOOM
        </button>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={["h-1.5 w-1.5 rounded-full", offline ? "bg-muted" : "bg-accent"].join(
              " "
            )}
          />
          <span className="meta text-muted">{offline ? "Offline" : "Live"}</span>
        </span>
      </div>

      <nav aria-label="Workspace" className="border-t border-line">
        <div className="shell flex gap-5 overflow-x-auto md:gap-7">
          {NAV_ITEMS.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                aria-current={active ? "page" : undefined}
                className={[
                  "shrink-0 border-b-2 py-2.5 text-[12px] font-light transition-colors duration-150",
                  active
                    ? "border-accent text-ink"
                    : "border-transparent text-muted hover:text-ink",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
