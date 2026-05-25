import { palette } from "@styles/ds";

export const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 10,
  border: `1.5px solid ${palette.border}`,
  background: palette.surface,
  fontSize: 13,
  color: palette.textPrimary,
  outline: "none",
  boxSizing: "border-box",
};

export default function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 10,
          fontWeight: 700,
          color: palette.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 6,
        }}
      >
        {label} {required && <span style={{ color: palette.red }}>*</span>}
      </label>
      {children}
    </div>
  );
}
