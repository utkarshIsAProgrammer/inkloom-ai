import type { ReactNode } from "react";

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={["rounded-[8px] border border-line bg-paper", className ?? ""].join(" ")}>
      {children}
    </section>
  );
}

export function PanelHead({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3">
      <p className="meta text-muted">{label}</p>
      {right}
    </div>
  );
}

export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "error";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={[
        "border-l-2 bg-surface px-4 py-3 text-[13px] font-light",
        tone === "error" ? "border-accent" : "border-ink",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="border-t border-line py-6 text-[13px] font-light leading-relaxed text-muted">
      {children}
    </p>
  );
}
