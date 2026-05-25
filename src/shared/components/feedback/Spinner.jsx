import { palette } from '@styles/ds';

export function Spinner({ size = 20, color = palette.green }) {
  return (
    <div
      className="rounded-full border-2 animate-spin flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderColor: `${color}30`,
        borderTopColor: color,
      }}
    />
  );
}
