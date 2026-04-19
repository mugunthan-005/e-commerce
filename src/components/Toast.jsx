import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = crypto?.randomUUID?.() || String(Date.now() + Math.random());
    const t = { id, type: "success", duration: 2400, ...toast };
    setToasts((prev) => [...prev, t]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, t.duration);

    return id;
  }, []);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}

      {/* Toast stack */}
      <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-none card px-4 py-3 shadow-md",
              "animate-[toastIn_180ms_ease-out]",
              t.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "",
              t.type === "error" ? "border-rose-200 bg-rose-50 text-rose-900" : "",
              t.type === "info" ? "border-slate-200 bg-white text-slate-900" : "",
            ].join(" ")}
          >
            <div className="text-sm font-semibold">{t.title || "Done"}</div>
            {t.message ? <div className="mt-0.5 text-sm opacity-80">{t.message}</div> : null}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}