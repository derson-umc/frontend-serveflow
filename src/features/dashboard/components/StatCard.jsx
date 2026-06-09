import { motion } from 'framer-motion';
import { palette } from '@styles/ds';

/**
 * StatCard — card de métrica com indicador de tendência.
 *
 * Props:
 *  label    string   — título do KPI
 *  value    string   — valor formatado
 *  icon     ReactNode
 *  accent   string   — cor do valor e da borda lateral
 *  bg       string   — background do ícone
 *  trend    number|null — percentual vs ontem (positivo / negativo / null)
 *  size     'sm'|'lg'  — 'lg' para o card de destaque (Receita)
 */
export default function StatCard({ label, value, icon, accent, bg, trend = null, size = 'sm' }) {
  const isLg = size === 'lg';

  const trendUp    = trend !== null && trend > 0;
  const trendDown  = trend !== null && trend < 0;
  const trendColor = trendUp ? palette.green : trendDown ? palette.red : palette.textMuted;
  const trendArrow = trendUp ? '↑' : trendDown ? '↓' : '—';
  const trendLabel = trend !== null
    ? `${trendArrow} ${trendUp ? '+' : ''}${trend}% vs ontem`
    : null;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.11)' }}
      transition={{ duration: 0.15 }}
      style={{
        background:    palette.white,
        border:        `1px solid ${palette.border}`,
        borderLeft:    `4px solid ${accent}`,
        borderRadius:   16,
        boxShadow:     '0 2px 8px rgba(0,0,0,0.06)',
        padding:        isLg ? '20px 24px' : '16px 20px',
        display:       'flex',
        flexDirection: 'column',
        gap:            isLg ? 10 : 8,
        height:        '100%',
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize:       10,
          fontWeight:     700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color:          palette.textMuted,
        }}>
          {label}
        </span>
        <div style={{
          width:           isLg ? 42 : 34,
          height:          isLg ? 42 : 34,
          borderRadius:    10,
          background:      bg,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:      0,
        }}>
          {icon}
        </div>
      </div>

      {/* valor */}
      <p style={{
        fontSize:   isLg ? 28 : 22,
        fontWeight: 800,
        color:      accent,
        lineHeight:  1,
        margin:      0,
      }}>
        {value}
      </p>

      {/* tendência */}
      {trendLabel ? (
        <span style={{
          fontSize:   11,
          fontWeight: 600,
          color:      trendColor,
          display:   'flex',
          alignItems: 'center',
          gap:         3,
        }}>
          {trendLabel}
        </span>
      ) : (
        <span style={{ fontSize: 11, color: palette.textDisabled }}>Sem dados de ontem</span>
      )}
    </motion.div>
  );
}
