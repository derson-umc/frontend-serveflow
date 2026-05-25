import { palette } from '@styles/ds';

export function Field({ label, required, error, children }) {
  return (
    <div>
      <label
        className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
        style={{ color: palette.textMuted }}
      >
        {label}{required && <span style={{ color: palette.red }}> *</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: palette.red }}>{error}</p>}
    </div>
  );
}
