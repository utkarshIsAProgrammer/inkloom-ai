import type { ReactNode } from "react";

export default function PageHead({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line py-7">
      <div>
        <h1 className="display text-[28px] md:text-[36px]">{title}</h1>
        <p className="mt-2 max-w-[68ch] text-[14px] font-light text-muted">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
