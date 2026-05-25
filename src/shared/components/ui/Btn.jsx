import { palette } from '@styles/ds';

const VARIANT_STYLES = {
  primary:   { background: palette.green,      color: palette.white,    border: 'none',                         boxShadow: '0 4px 12px rgba(46,125,50,0.3)'  },
  secondary: { background: palette.background, color: palette.textMuted, border: `1px solid ${palette.border}`, boxShadow: 'none'                             },
  danger:    { background: palette.red,        color: palette.white,    border: 'none',                         boxShadow: '0 4px 12px rgba(198,40,40,0.2)'  },
  ghost:     { background: 'transparent',      color: palette.textMuted, border: `1px solid ${palette.border}`, boxShadow: 'none'                             },
};

export function Btn({ children, variant = 'primary', type = 'button', style, ...props }) {
  return (
    <button
      type={type}
      {...props}
      className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      style={{ ...VARIANT_STYLES[variant], ...style }}
    >
      {children}
    </button>
  );
}
