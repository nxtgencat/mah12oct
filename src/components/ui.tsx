import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { AlertCircle, Inbox, Loader2, SearchX } from "lucide-react";

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type BtnSize = "sm" | "md" | "lg";

const btnBase =
  "inline-flex items-center justify-center gap-1.5 font-semibold rounded-sm transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 active:scale-[0.98]";

const btnVariant: Record<BtnVariant, string> = {
  primary: "bg-primary-700 text-white hover:bg-primary-800 shadow-subtle",
  secondary: "bg-white text-ink-900 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-subtle",
  ghost: "bg-transparent text-ink-700 hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-subtle",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-subtle",
};

const btnSize: Record<BtnSize, string> = {
  sm: "text-[12.5px] px-3 py-1.5 gap-1",
  md: "text-[13.5px] px-4 py-2",
  lg: "text-[14.5px] px-5 py-2.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, children, disabled, className = "", ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${btnBase} ${btnVariant[variant]} ${btnSize[size]} ${className}`}
      disabled={disabled ?? loading}
      {...rest}
    >
      {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, error, hint, required, children }: FieldProps) {
  return (
    <label className="block">
      <span className="t-label mb-1.5 flex items-center gap-1 text-ink-700">
        {label}
        {required ? <span className="text-red-500" aria-hidden="true">*</span> : null}
      </span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 flex items-center gap-1 text-[12.5px] font-medium text-red-600">
          <AlertCircle size={13} aria-hidden="true" /> {error}
        </span>
      ) : hint ? (
        <span className="t-caption mt-1 block">{hint}</span>
      ) : null}
    </label>
  );
}

const inputCls = (error?: string) =>
  `w-full rounded-sm border bg-white px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-400 transition shadow-subtle disabled:bg-gray-50 disabled:text-gray-500 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
  } outline-none`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  fieldError?: string;
}

export function Input({ fieldError, className = "", ...rest }: InputProps) {
  return <input className={`${inputCls(fieldError)} ${className}`} {...rest} />;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  fieldError?: string;
}

export function Select({ fieldError, className = "", children, ...rest }: SelectProps) {
  return (
    <select className={`${inputCls(fieldError)} ${className}`} {...rest}>
      {children}
    </select>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  fieldError?: string;
}

export function TextArea({ fieldError, className = "", ...rest }: TextAreaProps) {
  return <textarea className={`${inputCls(fieldError)} min-h-[84px] resize-y ${className}`} {...rest} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-gray-200 bg-white shadow-subtle ${className}`}>{children}</div>
  );
}

type BadgeTone = "gray" | "blue" | "green" | "amber" | "red" | "violet" | "teal";

const badgeCls: Record<BadgeTone, string> = {
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
  blue: "bg-primary-50 text-primary-800 ring-primary-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
};

export function Badge({ tone = "gray", children, className = "" }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ring-1 ring-inset ${badgeCls[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="t-display">{title}</h1>
        {subtitle ? <p className="t-muted mt-1 max-w-[62ch]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        {icon ?? <Inbox size={22} aria-hidden="true" />}
      </div>
      <p className="t-subheading">{title}</p>
      {message ? <p className="t-muted mt-1 max-w-[44ch]">{message}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-red-200 bg-red-50/60 px-6 py-10 text-center">
      <AlertCircle size={24} className="mb-2 text-red-500" aria-hidden="true" />
      <p className="t-subheading text-red-800">Something went wrong</p>
      <p className="t-muted mt-1 max-w-[52ch]">{message}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center gap-2 py-10 text-ink-500">
      <Loader2 size={20} className="animate-spin text-primary-600" aria-hidden="true" />
      <span className="t-muted">{label}</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded ${className}`} />;
}

export function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[5/3] w-full !rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </Card>
  );
}

export function NoResults({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon={<SearchX size={22} aria-hidden="true" />}
      title={query ? `No results for “${query}”` : "No results found"}
      message="Try a different keyword, or clear the filters to see everything."
      action={
        onClear ? (
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear search & filters
          </Button>
        ) : undefined
      }
    />
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <nav aria-label="Pagination" className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        Prev
      </Button>
      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`e${idx}`} className="px-1 text-gray-400" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={`min-w-[34px] rounded-sm border px-2.5 py-1.5 text-[13px] font-semibold transition ${
              p === page
                ? "border-primary-700 bg-primary-700 text-white"
                : "border-gray-300 bg-white text-ink-700 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        Next
      </Button>
    </nav>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "violet" | "teal" | "gray";
}) {
  const tones: Record<string, string> = {
    blue: "bg-primary-50 text-primary-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    violet: "bg-violet-50 text-violet-700",
    teal: "bg-teal-50 text-teal-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <Card className="p-4 transition-shadow hover:shadow-medium">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="t-label uppercase tracking-wide text-ink-500">{label}</p>
          <p className="mt-1 text-[26px] font-bold leading-none tracking-tight">{value}</p>
          {sub ? <p className="t-caption mt-1.5">{sub}</p> : null}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tones[tone]}`} aria-hidden="true">
          {icon}
        </div>
      </div>
    </Card>
  );
}
