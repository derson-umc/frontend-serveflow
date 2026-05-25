import { palette } from "@styles/ds";
import { STATUS_CFG } from "../constants";

export default function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? {
    label: status,
    color: palette.textMuted,
    bg: palette.background,
    border: palette.border,
  };
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
}
