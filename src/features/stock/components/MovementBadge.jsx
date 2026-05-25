import { MOVEMENT_LABELS } from '../constants';

export function MovementBadge({ type }) {
  const m = MOVEMENT_LABELS[type] ?? { label: type, color: '#757575', bg: '#F5F5F5' };
  return (
    <span style={{
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: m.bg,
      color: m.color,
      whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  );
}
