import { palette } from '@styles/ds';

export function ModalHeader({ title, subtitle, onClose, accentColor }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold" style={{ color: accentColor ?? palette.textSecondary }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-sm"
        style={{ background: palette.background, color: palette.textMuted, border: 'none' }}
      >
        ✕
      </button>
    </div>
  );
}
