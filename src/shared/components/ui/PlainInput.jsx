import { palette } from '@styles/ds';

export function PlainInput({ style, ...props }) {
  return (
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        background: palette.surface,
        border: `1.5px solid ${palette.border}`,
        color: palette.textSecondary,
        ...style,
      }}
    />
  );
}
