import { dsCard, palette } from '@styles/ds';

export function StatCard({ label, value, accent }) {
  return (
    <div style={{ ...dsCard, padding: '16px 20px', borderTop: `3px solid ${accent}` }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: palette.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: palette.textPrimary }}>
        {value}
      </div>
    </div>
  );
}
