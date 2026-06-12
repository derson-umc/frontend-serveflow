import { useMemo, useState } from 'react';
import { useDashboard, useSalesByDay, useTopProducts } from './hooks/useDashboard';
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


function fmtDayFull(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day:     '2-digit',
    month:   'long',
  });
}

const PERIOD_OPTIONS = [
  { label: 'Hoje',   days: 1  },
  { label: '7 dias', days: 7  },
  { label: '30 dias', days: 30 },
];

const CHART_PERIODS = [
  { label: 'Últimos 7 dias',  days: 7  },
  { label: 'Últimos 15 dias', days: 15 },
  { label: 'Últimos 30 dias', days: 30 },
];

function ChartPeriodTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        height:      28,
        padding:    '0 10px',
        display:    'flex',
        alignItems: 'center',
        borderRadius: 5,
        fontSize:   11,
        fontWeight:  active ? 700 : 500,
        cursor:     'pointer',
        border:     'none',
        background:  active ? palette.green : 'transparent',
        color:       active ? palette.white : palette.textMuted,
        transition: 'background 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label}
    </button>
  );
}

function PeriodTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
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



function ProductThumb({ name, imageUrl, accent }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
      overflow: 'hidden', background: `${accent}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {imageUrl ? (
        <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{initials}</span>
      )}
    </div>
  );
}

function TopProductsList({ days }) {
  const { data: rawTop = [], isLoading } = useTopProducts(days);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ height: 44, borderRadius: 10, background: '#F0F0F0', animation: 'shimmer 1.4s infinite' }} />
        ))}
      </div>
    );
  }

  if (!rawTop.length) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: palette.textMuted, fontSize: 13 }}>
        Nenhuma venda no período.
      </div>
    );
  }

  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {rawTop.map((p, i) => (
        <motion.li
          key={p.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: i * 0.04 }}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:           10,
            padding:      '6px 8px',
            borderRadius:  10,
            background:    i === 0 ? `${palette.orange}0D` : 'transparent',
          }}
        >
          <span style={{
            minWidth:       22,
            fontSize:        10,
            fontWeight:      800,
            color:           i === 0 ? palette.orange : palette.textMuted,
            flexShrink:      0,
            textAlign:      'center',
          }}>
            #{i + 1}
          </span>

          <ProductThumb name={p.name} imageUrl={p.imageUrl} accent={i === 0 ? palette.orange : palette.blue} />

          <span style={{
            flex:          1,
            minWidth:      0,
            fontSize:      12,
            fontWeight:    600,
            color:         palette.textPrimary,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {p.name}
          </span>

          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: palette.green, display: 'block' }}>
              {fmtBRL(p.revenue)}
            </span>
            <span style={{ fontSize: 10, color: palette.textMuted, fontWeight: 500 }}>
              • {p.quantity} vendas
            </span>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const current  = payload.find((p) => p.dataKey === 'total');
  const previous = payload.find((p) => p.dataKey === 'prevTotal');
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
        {fmtBRL(current?.value ?? 0)}
      </p>
      {previous?.value != null && (
        <p style={{ fontSize: 11, color: palette.textMuted, margin: '3px 0 0', fontWeight: 600 }}>
          Semana anterior: {fmtBRL(previous.value)}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { metrics }  = useDashboard();
  const [topDays,   setTopDays]   = useState(30);
  const [chartDays, setChartDays] = useState(7);

  const m          = metrics.data ?? FALLBACK_METRICS;
  const salesQuery = useSalesByDay(chartDays);
  const salesData  = salesQuery.data;
  const sales      = useMemo(() => salesData ?? [], [salesData]);

  const periodTotal = useMemo(() => sales.reduce((s, d) => s + d.total, 0), [sales]);
  const peakDay     = useMemo(
    () => sales.length ? sales.reduce((max, d) => d.total > max.total ? d : max, sales[0]) : null,
    [sales],
  );

  const peakVsAvg = useMemo(() => {
    if (!sales.length || !peakDay) return null;
    const avg = periodTotal / sales.length;
    if (!avg) return null;
    return Math.round(((peakDay.total - avg) / avg) * 100);
  }, [sales, peakDay, periodTotal]);

  const completedPct = m.ordersToday > 0
    ? Math.round(((m.ordersToday - m.openOrdersToday) / m.ordersToday) * 100)
    : 0;

  const cards = [
    {
      label:            'Receita Hoje',
      value:             fmtBRL(m.revenueToday),
      todayRaw:          m.revenueToday,
      compareYesterday:  m.revenueYesterday,
      compareLastWeek:   m.revenueSameDayLastWeek,
      formatDiff:       'brl',
      icon:              <CashIcon  color={palette.green} />,
      accent:             palette.green,
      bg:                 palette.greenSurface,
      sparkline:          sales.map((d) => d.total),
      size:              'lg',
    },
    {
      label:            'Comandas Hoje',
      value:             String(m.ordersToday),
      todayRaw:          m.ordersToday,
      compareYesterday:  m.ordersYesterday,
      compareLastWeek:   m.ordersSameDayLastWeek,
      formatDiff:       'pct',
      icon:              <OrderIcon color={palette.orange} />,
      accent:             palette.orange,
      bg:                 palette.orangeSurface,
      doughnutPct:        completedPct,
    },
    {
      label:            'Clientes Atendidos',
      value:             String(m.customersToday),
      todayRaw:          m.customersToday,
      compareYesterday:  m.customersYesterday,
      compareLastWeek:   m.customersSameDayLastWeek,
      formatDiff:       'pct',
      icon:              <UsersIcon color={palette.blue} />,
      accent:             palette.blue,
      bg:                 palette.blueSurface,
    },
    {
      label:            'Ticket Médio',
      value:             fmtBRL(m.ticketMedio),
      todayRaw:          m.ticketMedio,
      compareYesterday:  m.ticketMedioYesterday,
      compareLastWeek:   m.ticketMedioSameDayLastWeek,
      formatDiff:       'brl',
      icon:              <TrendIcon color='#6D28D9' />,
      accent:            '#6D28D9',
      bg:                '#EDE9FE',
    },
  ];

  const panel = {
    background:   palette.white,
    borderRadius:  16,
    boxShadow:    '0 4px 20px rgba(0,0,0,0.04)',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8F9FA' }}
    >
      <Sidebar />
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, width: '100%', boxSizing: 'border-box' }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}>
          <div style={{ gridColumn: 'span 2' }} className="xl-span-2">
            <StatCard {...cards[0]} />
          </div>
          {cards.slice(1).map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
          gap: 12,
          alignItems: 'stretch',
        }}>

          <div style={{ ...panel, padding: '20px 24px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.orange, margin: 0 }}>
                  Vendas
                </p>
                <div style={{ display: 'flex', gap: 2, background: palette.surface, borderRadius: 8, padding: 2, marginTop: 6 }}>
                  {CHART_PERIODS.map((opt) => (
                    <ChartPeriodTab
                      key={opt.days}
                      label={opt.label}
                      active={chartDays === opt.days}
                      onClick={() => setChartDays(opt.days)}
                    />
                  ))}
                </div>
              </div>
              {periodTotal > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {[
                    { key: 'total',  label: 'Total',    value: fmtBRL(periodTotal),                   color: palette.green       },
                    { key: 'avg',    label: 'Média/dia', value: fmtBRL(periodTotal / sales.length),    color: palette.textPrimary },
                    peakDay && { key: 'peak', label: 'Pico', value: fmtDayFull(peakDay.date), color: palette.orange },
                  ].filter(Boolean).map(({ key, label, value, color }) => (
                    <div key={key} style={{ background: palette.surface, borderRadius: 10, padding: '7px 12px', textAlign: 'right' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: palette.textMuted, margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color, margin: '2px 0 0' }}>{value}</p>
                    </div>
                  ))}
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
                        <stop offset="0%"   stopColor={palette.green} stopOpacity={0.22} />
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
                      dataKey="prevTotal"
                      stroke={palette.textMuted}
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      fill="none"
                      dot={false}
                      activeDot={false}
                      connectNulls
                      opacity={0.45}
                    />
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
                        label={{
                          value: peakVsAvg != null ? `pico, +${peakVsAvg}% acima da média` : 'pico',
                          position: 'top',
                          fontSize: 10,
                          fill: palette.orange,
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          <div style={{ ...panel, padding: '20px 20px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.orange, margin: 0 }}>
                  Ranking de Produtos
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: palette.textPrimary, margin: '2px 0 0' }}>
                  Mais Vendidos
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

            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, marginTop: 10 }}>
              <TopProductsList days={topDays} />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
