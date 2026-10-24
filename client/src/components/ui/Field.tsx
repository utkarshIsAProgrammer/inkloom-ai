import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type FieldShell = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null;
};

function Label({ id, label }: { id: string; label: string }) {
  return (
    <label htmlFor={id} className="meta mb-2 block text-muted">
      {label}
    </label>
  );
}

function Foot({ hint, error }: { hint?: ReactNode; error?: string | null }) {
  if (error) {
    return (
      <p role="alert" className="mt-1.5 text-[12px] font-light text-accent">
        {error}
      </p>
    );
  }
  if (hint) {
    return <p className="mt-1.5 text-[12px] font-light leading-snug text-muted">{hint}</p>;
  }
  return null;
}

export function TextField({
  id,
  label,
  hint,
  error,
  ...rest
}: FieldShell & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label id={id} label={label} />
      <input id={id} className="field" aria-invalid={error ? true : undefined} {...rest} />
      <Foot hint={hint} error={error} />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  ...rest
}: FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <Label id={id} label={label} />
      <textarea
        id={id}
        className="field"
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      <Foot hint={hint} error={error} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  hint,
  error,
  children,
  ...rest
}: FieldShell & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label id={id} label={label} />
      <select id={id} className="field" {...rest}>
        {children}
      </select>
      <Foot hint={hint} error={error} />
    </div>
  );
}

export function Switch({
  label,
  detail,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="text-[14px] font-normal">{label}</p>
        {detail ? <p className="mt-0.5 text-[12px] font-light text-muted">{detail}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative mt-0.5 h-[22px] w-[40px] shrink-0 rounded-full border transition-colors duration-200 disabled:opacity-50",
          checked ? "border-accent bg-accent" : "border-line bg-paper",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-[3px] block h-[14px] w-[14px] rounded-full transition-transform duration-200 motion-reduce:transition-none",
            checked ? "translate-x-[21px] bg-on-accent" : "translate-x-[3px] bg-muted",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
