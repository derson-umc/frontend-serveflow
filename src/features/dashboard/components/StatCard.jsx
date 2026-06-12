import { useState } from 'react';
import { motion } from 'framer-motion';
import { palette } from '@styles/ds';

const brl = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

function Sparkline({ values }) {
  if (!values?.length || values.length < 2) return null;
  const w = 76, h = 26;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 2) - 1,
  }));
  const linePts = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPts = `0,${h} ` + linePts + ` ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id="sp-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.green} stopOpacity={0.18} />
          <stop offset="100%" stopColor={palette.green} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill="url(#sp-grad)" />
      <polyline
        points={linePts}
        stroke={palette.green}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function DoughnutProgress({ pct, accent }) {
  const r = 12, cx = 17, cy = 17, sw = 3;
  const circ = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, (pct ?? 0) / 100)) * circ;
  return (
    <svg width={34} height={34} viewBox="0 0 34 34">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${accent}22`} strokeWidth={sw} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={accent} strokeWidth={sw}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 17 17)"
        style={{ transition: 'stroke-dasharray 0.55s ease' }}
      />
    </svg>
  );
}

export default function StatCard({
  label, value, icon, accent, bg,
  todayRaw        = null,
  compareYesterday = null,
  compareLastWeek  = null,
  formatDiff      = 'pct',
  sparkline       = null,
  doughnutPct     = null,
  size            = 'sm',
}) {
  const [localCompare, setLocalCompare] = useState('yesterday');
  const isLg = size === 'lg';

  const base  = Number(localCompare === 'yesterday' ? (compareYesterday ?? 0) : (compareLastWeek ?? 0));
  const today = Number(todayRaw ?? 0);
  const diff  = base !== 0 ? today - base : null;
  const pctVal = diff !== null ? Math.round((diff / base) * 100) : null;

  const isUp   = diff !== null && diff > 0;
  const isDown = diff !== null && diff < 0;
  const color  = isUp ? palette.green : isDown ? palette.red : palette.textMuted;
  const bg2    = isUp ? `${palette.green}1A` : isDown ? '#FEE2E2' : palette.surface;
  const arrow  = isUp ? '↑' : isDown ? '↓' : '—';

  const pillText = diff === null
    ? null
    : formatDiff === 'brl'
    ? `${arrow} ${diff >= 0 ? '+' : ''}${brl(Math.abs(diff))}`
    : `${arrow} ${diff >= 0 ? '+' : ''}${pctVal}%`;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(0,0,0,0.09)' }}
      transition={{ duration: 0.15 }}
      style={{
        background:   palette.white,
        borderTop:    `1px solid ${palette.border}`,
        borderRight:  `1px solid ${palette.border}`,
        borderBottom: `1px solid ${palette.border}`,
        borderLeft:   `4px solid ${accent}`,
        borderRadius:  16,
        boxShadow:    '0 4px 20px rgba(0,0,0,0.04)',
        padding:       isLg ? '22px 24px' : '18px 20px',
        display:      'flex',
        flexDirection:'column',
        gap:           6,
        height:       '100%',
        overflow:     'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{
          fontSize:      12,
          fontWeight:    700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color:          palette.textMuted,
        }}>
          {label}
        </span>
        <div style={{
          width:          isLg ? 42 : 34,
          height:         isLg ? 42 : 34,
          borderRadius:   10,
          background:     doughnutPct !== null ? 'transparent' : bg,
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          flexShrink:     0,
        }}>
          {doughnutPct !== null ? <DoughnutProgress pct={doughnutPct} accent={accent} /> : icon}
        </div>
      </div>

      <p style={{
        fontSize:   isLg ? 28 : 22,
        fontWeight:  800,
        color:       accent,
        lineHeight:  1,
        margin:      0,
      }}>
        {value}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flex: 1 }}>
        {pillText ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' }}>
            <span style={{
              display:    'inline-flex',
              alignItems: 'center',
              padding:    '3px 9px',
              borderRadius: 20,
              background:  bg2,
              fontSize:    11,
              fontWeight:  700,
              color,
            }}>
              {pillText}
            </span>
            <span style={{ fontSize: 10, color: palette.textMuted }}>
              vs {localCompare === 'yesterday' ? 'ontem' : 'semana ant.'}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: palette.textMuted }}>sem dados</span>
        )}
        {isLg && sparkline && (
          <div style={{ opacity: 0.85, flexShrink: 0 }}>
            <Sparkline values={sparkline} />
          </div>
        )}
      </div>

      <div style={{
        display:    'flex',
        gap:         2,
        borderTop:  `1px solid ${palette.border}`,
        paddingTop:  8,
        marginTop:   2,
      }}>
        {[
          { mode: 'yesterday', label: 'Ontem' },
          { mode: 'lastWeek',  label: 'Semana ant.' },
        ].map(({ mode, label: lbl }) => (
          <button
            key={mode}
            onClick={() => setLocalCompare(mode)}
            style={{
              background:   'none',
              border:       'none',
              padding:      '0 6px 2px',
              fontSize:      10,
              fontWeight:    localCompare === mode ? 700 : 500,
              color:         localCompare === mode ? accent : palette.textMuted,
              cursor:       'pointer',
              borderBottom:  localCompare === mode ? `2px solid ${accent}` : '2px solid transparent',
              transition:   'all 0.12s',
              whiteSpace:   'nowrap',
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
