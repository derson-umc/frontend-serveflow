import { palette } from '@styles/ds';

export function StatusBadge({ status }) {
  const active = status === 'ACTIVE';
  return (
    <span style={{
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: active ? palette.greenSurface : palette.background,
      color: active ? palette.green : palette.textMuted,
      border: `1px solid ${active ? palette.greenBorder : palette.border}`,
    }}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}
