import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { uid } from "../lib/utils";

export type ToastKind = "success" | "error" | "info";

interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface ToastContextValue {
  notify: (kind: ToastKind, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const bar: Record<ToastKind, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-primary-500",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (kind: ToastKind, title: string, message?: string) => {
      const id = uid("toast");
      setToasts((prev) => [...prev.slice(-3), { id, kind, title, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 3600),
      );
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      notify,
      success: (title, message) => notify("success", title, message),
      error: (title, message) => notify("error", title, message),
      info: (title, message) => notify("info", title, message),
    }),
    [notify],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2"
      >
        {toasts.map((t) => {
          const Icon = icons[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              className="anim-dialog pointer-events-auto flex items-start gap-3 overflow-hidden rounded-md border border-gray-200 bg-white shadow-elevated dark:border-white/10 dark:bg-night-900"
            >
              <div className={`${bar[t.kind]} w-1 self-stretch`} aria-hidden="true" />
              <div className="flex flex-1 items-start gap-2.5 py-3 pr-1">
                <Icon
                  size={18}
                  strokeWidth={2}
                  className={
                    t.kind === "success"
                      ? "mt-0.5 shrink-0 text-emerald-600"
                      : t.kind === "error"
                        ? "mt-0.5 shrink-0 text-red-600"
                        : "mt-0.5 shrink-0 text-primary-600"
                  }
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="t-subheading text-[13.5px] leading-snug">{t.title}</p>
                  {t.message ? <p className="t-muted mt-0.5">{t.message}</p> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="mr-2 mt-2.5 rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
