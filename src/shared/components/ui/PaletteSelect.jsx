import { palette } from '@styles/ds';

export function PaletteSelect({ children, style, ...props }) {
  return (
    <select
      {...props}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
      style={{
        background: palette.surface,
        border: `1.5px solid ${palette.border}`,
        color: palette.textSecondary,
        ...style,
      }}
    >
      {children}
    </select>
  );
}
