import { palette } from '@styles/ds';

export function QuantityBadge({ current, minimum, unit }) {
  const below = parseFloat(current) < parseFloat(minimum);
  return (
    <span style={{
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: below ? palette.redSurface : palette.greenSurface,
      color: below ? palette.red : palette.green,
      border: `1px solid ${below ? palette.redBorder : palette.greenBorder}`,
    }}>
      {current} {unit}
    </span>
  );
}
