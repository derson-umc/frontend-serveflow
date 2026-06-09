import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceDot,
} from 'recharts';
import Sidebar  from '@shared/components/layout/Sidebar';
import { palette } from '@styles/ds';
import { fmtBRL, FALLBACK_METRICS } from './constants';
import StatCard       from './components/StatCard';
import { CashIcon, OrderIcon, UsersIcon, TrendIcon } from './components/icons';
import { useDashboard, useTopProducts } from './hooks/useDashboard';

/** Variação percentual arredondada; null quando não há base de comparação. */
function pct(today, yesterday) {
  const t = Number(today ?? 0);
  const y = Number(yesterday ?? 0);
  if (!y) return null;
  return Math.round(((t - y) / y) * 100);
}

function fmtDayFull(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day:     '2-digit',
    month:   'long',
  });
}

const PERIOD_OPTIONS = [
  { label: 'Hoje',  days: 1  },
  { label: '7 dias', days: 7  },
  { label: '30 dias', days: 30 },
];

function PeriodTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        /* touch target ≥ 44 × 44 px (WCAG 2.5.8) */
        height:      44,
        padding:    '0 14px',
        display:    'flex',
        alignItems: 'center',
        borderRadius: 6,
        fontSize:   11,
        fontWeight:  active ? 700 : 500,
        cursor:     'pointer',
        border:     'none',
        background:  active ? palette.green : 'transparent',
        color:       active ? palette.white : palette.textMuted,
        transition: 'background 0.15s, color 0.15s',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label}
    </button>
  );
}

function TopProductsList({ days }) {
  const { data: top = [], isLoading } = useTopProducts(days);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ height: 36, borderRadius: 8, background: '#F0F0F0', animation: 'shimmer 1.4s infinite' }} />
        ))}
      </div>
    );
  }

  if (!top.length) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: palette.textMuted, fontSize: 13 }}>
        Nenhuma venda no período.
      </div>
    );
  }

  const maxQty = Math.max(...top.map((p) => p.quantity), 1);

  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {top.map((p, i) => (
        <motion.li
          key={p.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: i * 0.045 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
            background: i === 0 ? palette.orange : palette.surface,
            color:      i === 0 ? palette.white  : palette.textMuted,
            fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {i + 1}
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: palette.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                {p.name}
              </span>
              <span style={{ fontSize: 11, color: palette.green, fontWeight: 700, flexShrink: 0, marginLeft: 4 }}>
                {fmtBRL(p.revenue)}
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 4, background: palette.surface, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width:  `${(p.quantity / maxQty) * 100}%`,
                borderRadius: 4,
                background: i === 0 ? palette.orange : palette.green,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          <span style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, flexShrink: 0, minWidth: 34, textAlign: 'right' }}>
            {p.quantity}×
          </span>
        </motion.li>
      ))}
    </ol>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:   palette.white,
      border:       `1px solid ${palette.border}`,
      borderRadius:  10,
      padding:      '8px 14px',
      boxShadow:    '0 4px 16px rgba(0,0,0,0.10)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 800, color: palette.green, margin: 0 }}>
        {fmtBRL(payload[0].value)}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { metrics, salesByDay } = useDashboard();
  const [topDays, setTopDays] = useState(30);

  const m    = metrics.data ?? FALLBACK_METRICS;
  const sales = salesByDay.data ?? [];

  const trends = {
    revenue:   pct(m.revenueToday,    m.revenueYesterday),
    orders:    pct(m.ordersToday,     m.ordersYesterday),
    customers: pct(m.customersToday,  m.customersYesterday),
    ticket:    pct(m.ticketMedio,     m.ticketMedioYesterday),
  };

  const periodTotal = useMemo(() => sales.reduce((s, d) => s + d.total, 0), [sales]);
  const peakDay     = useMemo(
    () => sales.length ? sales.reduce((max, d) => d.total > max.total ? d : max, sales[0]) : null,
    [sales],
  );

  const cards = [
    {
      label: 'Receita Hoje',
      value: fmtBRL(m.revenueToday),
      icon:  <CashIcon  color={palette.green} />,
      accent: palette.green,
      bg:     palette.greenSurface,
      trend:  trends.revenue,
      size:  'lg',
    },
    {
      label: 'Comandas Hoje',
      value: String(m.ordersToday),
      icon:  <OrderIcon color={palette.orange} />,
      accent: palette.orange,
      bg:     palette.orangeSurface,
      trend:  trends.orders,
    },
    {
      label: 'Clientes Atendidos',
      value: String(m.customersToday),
      icon:  <UsersIcon color={palette.blue} />,
      accent: palette.blue,
      bg:     palette.blueSurface,
      trend:  trends.customers,
    },
    {
      label: 'Ticket Médio',
      value: fmtBRL(m.ticketMedio),
      icon:  <TrendIcon color='#6D28D9' />,
      accent: '#6D28D9',
      bg:     '#EDE9FE',
      trend:  trends.ticket,
    },
  ];

  const panel = {
    background:   palette.white,
    border:       `1px solid ${palette.border}`,
    borderRadius:  16,
    boxShadow:    '0 2px 8px rgba(0,0,0,0.06)',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: palette.background }}
    >
      <Sidebar />
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}>
          <div style={{ gridColumn: 'span 2' }} className="xl-span-2">
            <StatCard {...cards[0]} />
          </div>
          {cards.slice(1).map((c) => <StatCard key={c.label} {...c} />)}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
          gap: 12,
          alignItems: 'stretch',
        }}>

          <div style={{ ...panel, padding: '20px 24px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.orange, margin: 0 }}>
                  Vendas
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: palette.textPrimary, margin: '2px 0 0' }}>
                  Últimos 7 dias
                </p>
              </div>
              {periodTotal > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: palette.textMuted, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Total no período
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: palette.green, margin: '2px 0 0' }}>
                    {fmtBRL(periodTotal)}
                  </p>
                </div>
              )}
            </div>

            {sales.length === 0 ? (
              <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.textMuted, fontSize: 13 }}>
                Nenhum dado disponível para o período.
              </div>
            ) : (
              <motion.div
                key={`chart-${sales.length}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{ width: '100%', height: 260, marginTop: 12 }}
              >
                <ResponsiveContainer>
                  <AreaChart data={sales} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                    <defs>
                      <linearGradient id="grad-sales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={palette.green} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={palette.green} stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke={palette.border}
                      fontSize={11}
                      tick={{ fill: palette.textMuted }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={palette.border}
                      fontSize={11}
                      tick={{ fill: palette.textMuted }}
                      tickFormatter={(v) => `R$${v}`}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: palette.border, strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke={palette.green}
                      strokeWidth={2.5}
                      fill="url(#grad-sales)"
                      dot={{ r: 3, fill: palette.green, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: palette.green, strokeWidth: 2, stroke: palette.white }}
                    />
                    {peakDay && (
                      <ReferenceDot
                        x={peakDay.day}
                        y={peakDay.total}
                        r={6}
                        fill={palette.orange}
                        stroke={palette.white}
                        strokeWidth={2}
                        label={{ value: 'pico', position: 'top', fontSize: 10, fill: palette.orange, fontWeight: 700 }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          <div style={{ ...panel, padding: '20px 20px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.orange, margin: 0 }}>
                  Top Produtos
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary, margin: '2px 0 0' }}>
                  Mais vendidos
                </p>
              </div>
              <div style={{ display: 'flex', gap: 2, background: palette.surface, borderRadius: 8, padding: 2 }}>
                {PERIOD_OPTIONS.map((opt) => (
                  <PeriodTab
                    key={opt.days}
                    label={opt.label}
                    active={topDays === opt.days}
                    onClick={() => setTopDays(opt.days)}
                  />
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, marginBottom: 4 }}>
              <TopProductsList days={topDays} />
            </div>

            {sales.length > 0 && (
              <>
                <div style={{ height: 1, background: palette.border, margin: '16px 0 14px' }} />
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.textMuted, margin: '0 0 10px' }}>
                  Resumo do período
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: palette.surface, borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 9, color: palette.textMuted, margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total 7 dias</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: palette.green, margin: 0 }}>{fmtBRL(periodTotal)}</p>
                  </div>
                  <div style={{ background: palette.surface, borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 9, color: palette.textMuted, margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Média diária</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: palette.textPrimary, margin: 0 }}>{fmtBRL(periodTotal / sales.length)}</p>
                  </div>
                  {peakDay && (
                    <div style={{ gridColumn: 'span 2', background: palette.orangeSurface, borderRadius: 10, padding: '10px 12px', border: `1px solid ${palette.orangeBorder}` }}>
                      <p style={{ fontSize: 9, color: palette.orange, margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                          <polyline points="17 6 23 6 23 12"/>
                        </svg>
                        Dia de pico
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: palette.orange, margin: 0 }}>{fmtDayFull(peakDay.date)} — {fmtBRL(peakDay.total)}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
