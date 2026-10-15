import type { ReactNode } from "react";
import { Link } from "react-router";
import { BookOpen, ShieldCheck, Sparkles } from "lucide-react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-900 lg:block" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(720px 420px at 20% 15%, rgba(63,111,240,0.5), transparent 60%), radial-gradient(620px 460px at 85% 80%, rgba(20,184,166,0.4), transparent 60%), linear-gradient(180deg, #0f1b33 0%, #101828 100%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20">
              <BookOpen size={20} />
            </span>
            <span className="leading-tight">
              <span className="block text-[16px] font-bold">Athena Library</span>
              <span className="block text-[12.5px] text-white/60">Management System</span>
            </span>
          </div>
          <div className="max-w-md">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/85 ring-1 ring-white/15">
              <Sparkles size={13} /> Trusted by modern librarians
            </p>
            <h1 className="mt-4 text-[34px] font-bold leading-[1.15] tracking-tight">
              Every book, member & fine — in one calm workspace.
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-white/65">
              Issue and return in seconds, track overdue fines automatically, and keep the catalog
              in sync with a live third-party API.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              {[
                ["30+", "Live API titles"],
                ["14-day", "Smart loans"],
                ["$2/day", "Auto fines"],
              ].map(([k, v]) => (
                <div key={v} className="rounded-md bg-white/[0.06] p-3 ring-1 ring-white/10">
                  <dt className="text-[19px] font-bold">{k}</dt>
                  <dd className="text-[12px] text-white/60">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="flex items-center gap-1.5 text-[12.5px] text-white/50">
            <ShieldCheck size={14} /> Demo auth — accounts are stored locally in your browser.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-paper px-4 py-10 dark:bg-night-950 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-700 text-white">
              <BookOpen size={18} />
            </span>
            <span className="text-[15px] font-bold">Athena Library</span>
          </div>
          <h1 className="t-display">{title}</h1>
          <p className="t-muted mt-1.5">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthFooter({ text, linkText, to }: { text: string; linkText: string; to: string }) {
  return (
    <p className="t-muted mt-6 text-center">
      {text}{" "}
      <Link to={to} className="font-semibold text-primary-700 hover:text-primary-800 hover:underline dark:text-primary-300 dark:hover:text-primary-200">
        {linkText}
      </Link>
    </p>
  );
}
