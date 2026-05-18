import { useEffect, useState, useCallback, useRef } from "react";

let _dispatch = null;

export function toast(message, type = "info", duration = 3500) {
  if (_dispatch) _dispatch({ message, type, duration, id: Date.now() });
}
toast.success = (m, d) => toast(m, "success", d);
toast.error   = (m, d) => toast(m, "error",   d);
toast.warning = (m, d) => toast(m, "warning",  d);

const COLORS = {
  success: { bg: "#2E7D32", border: "#1B5E20", icon: "✓" },
  error:   { bg: "#C62828", border: "#B71C1C", icon: "✕" },
  warning: { bg: "#F57C00", border: "#E65100", icon: "⚠" },
  info:    { bg: "#1565C0", border: "#0D47A1", icon: "i" },
};

function ToastItem({ id, message, type, duration, onRemove }) {
  const [visible, setVisible] = useState(true);
  const c = COLORS[type] ?? COLORS.info;

  useEffect(() => {
    const hide  = setTimeout(() => setVisible(false), duration - 400);
    const close = setTimeout(() => onRemove(id), duration);
    return () => { clearTimeout(hide); clearTimeout(close); };
  }, [id, duration, onRemove]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: 500,
        maxWidth: 360,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        pointerEvents: "auto",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 14, lineHeight: 1, marginTop: 1 }}>{c.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      <button
        onClick={() => onRemove(id)}
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}
      >×</button>
    </div>
  );
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([]);
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  useEffect(() => {
    _dispatch = (t) => setToasts((p) => [...p, t]);
    return () => { _dispatch = null; };
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
    }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={remove} />
      ))}
    </div>
  );
}
