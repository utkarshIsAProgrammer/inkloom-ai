import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "quiet" | "accent";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  busy?: boolean;
};

const BASE =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[8px] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55";

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
};

const VARIANTS: Record<Variant, string> = {
  // Primary actions wear an accent ring so the next step is obvious at a glance.
  primary: "bg-ink text-paper ring-2 ring-accent/40 hover:ring-accent",
  outline: "border border-line bg-paper text-ink hover:border-ink",
  // Sample / try-it actions: solid accent fill plus a slow glow so a
  // first-time reviewer cannot miss where to click to test the product.
  accent:
    "bg-accent text-on-accent ring-2 ring-accent/25 hover:bg-ink demo-glow",
  quiet:
    "text-muted hover:text-ink font-mono text-[11px] uppercase tracking-[0.06em] font-normal",
};

export function Button({
  variant = "primary",
  size = "md",
  busy = false,
  className,
  children,
  type = "button",
  ...rest
}: Props) {
  const locked = rest.disabled || busy;
  const showWipe = variant === "primary" && !locked;

  return (
    <button
      {...rest}
      type={type}
      disabled={locked}
      aria-busy={busy || undefined}
      className={[
        BASE,
        variant === "quiet" ? "" : SIZES[size],
        VARIANTS[variant],
        className ?? "",
      ].join(" ")}
    >
      {variant === "primary" ? (
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-0 -translate-x-full bg-accent transition-transform duration-150 ease-out motion-reduce:transition-none",
            showWipe ? "group-hover:translate-x-0" : "",
          ].join(" ")}
        />
      ) : null}
      <span className="relative inline-flex items-center gap-2">
        {busy ? <span className="spinner" aria-hidden="true" /> : null}
        {children}
      </span>
    </button>
  );
}
