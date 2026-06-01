import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector } from 'recharts';
import { palette } from '@styles/ds';
import { fmtBRL, PAYMENT_LABELS } from '../../dashboard/constants';
import { useCashierReport } from '../../dashboard/hooks/useDashboard';

// ─── Paleta corporativa (mais escura e profissional) ──────────────────────────
const CHART_COLORS = ['#1B5E20', '#E67E00', '#1565C0', '#6A1B9A', '#00838F', '#C62828'];

// ─── Segmento ativo (hover expande levemente) ─────────────────────────────────
function ActiveShape({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }) {
  return (
    <Sector
      cx={cx} cy={cy}
      innerRadius={innerRadius - 3}
      outerRadius={outerRadius + 7}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

// ─── Tooltip customizado com valor e % ───────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{ background: '#1B5E20', color: '#fff', padding: '8px 14px', borderRadius: 7, fontSize: 12, boxShadow: '0 3px 10px rgba(0,0,0,0.22)', pointerEvents: 'none', lineHeight: 1.6 }}>
      <p style={{ fontWeight: 700, marginBottom: 1 }}>{item.name}</p>
      <p>{fmtBRL(item.value)}&ensp;·&ensp;{item.payload.pct}%</p>
    </div>
  );
}

// ─── Card de contexto ─────────────────────────────────────────────────────────
function ContextCard({ label, value, sub, bg, color, icon }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}28`, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
        {icon}
      </div>
      <p style={{ fontSize: 19, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color, opacity: 0.65, marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

// ─── Ícones SVG minimalistas ──────────────────────────────────────────────────
const IconMoney = ({ color }) => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.75} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconTx = ({ color }) => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.75} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconTicket = ({ color }) => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.75} aria-hidden>
    <line strokeLinecap="round" x1="18" y1="20" x2="18" y2="10" />
    <line strokeLinecap="round" x1="12" y1="20" x2="12" y2="4" />
    <line strokeLinecap="round" x1="6"  y1="20" x2="6"  y2="14" />
    <line strokeLinecap="round" x1="2"  y1="20" x2="22" y2="20" />
  </svg>
);
const IconCard = ({ color }) => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.75} aria-hidden>
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line strokeLinecap="round" x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export default function TabCashierReport() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate,   setEndDate]   = useState(today);
  const [submitted, setSubmitted] = useState({ start: today, end: today });
  const [focusIdx,  setFocusIdx]  = useState(null);

  const { data: report, isFetching, refetch } = useCashierReport(submitted.start, submitted.end);

  const handleFilter = () => {
    setSubmitted({ start: startDate, end: endDate });
    refetch();
  };

  const items      = report?.byPaymentMethod ?? [];
  const grossTotal = Number(report?.grossTotal ?? 0);
  const totalCount = items.reduce((s, p) => s + Number(p.ordersCount), 0);
  const ticketMedio = totalCount > 0 ? grossTotal / totalCount : 0;
  const topMethod  = items[0];

  const pieData = items.map((p) => {
    const val = Number(p.total);
    const pct = grossTotal > 0 ? ((val / grossTotal) * 100).toFixed(1) : '0.0';
    return { name: PAYMENT_LABELS[p.method] ?? p.method, value: val, ordersCount: Number(p.ordersCount), pct, method: p.method };
  });

  return (
    <div>
      {/* ── Filtro de período ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Data início', val: startDate, set: setStartDate },
          { label: 'Data fim',    val: endDate,   set: setEndDate },
        ].map(({ label, val, set }) => (
          <div key={label} style={{ flex: '1 1 140px', minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
              {label}
            </label>
            <input
              type="date"
              value={val}
              onChange={(e) => set(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${palette.border}`, background: palette.surface, fontSize: 13, color: palette.textSecondary, outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => (e.target.style.border = `1.5px solid ${palette.green}`)}
              onBlur={(e)  => (e.target.style.border = `1.5px solid ${palette.border}`)}
            />
          </div>
        ))}
        <button
          onClick={handleFilter}
          disabled={isFetching}
          style={{ padding: '9px 22px', borderRadius: 8, background: palette.green, color: palette.white, border: 'none', fontWeight: 700, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer', opacity: isFetching ? 0.7 : 1, flexShrink: 0 }}
        >
          {isFetching ? 'Carregando...' : 'Filtrar'}
        </button>
      </div>

      {/* ── Estados de loading / vazio ── */}
      {isFetching ? (
        <div style={{ textAlign: 'center', padding: 48, color: palette.textMuted }}>Carregando...</div>
      ) : !report || items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: palette.textMuted, fontSize: 13 }}>
          Nenhuma movimentação registrada no período.
        </div>
      ) : (
        <>
          {/* ── Cards de contexto ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 24 }}>
            <ContextCard
              label="Total Bruto"
              value={fmtBRL(grossTotal)}
              bg={palette.greenSurface}
              color={palette.greenDark}
              icon={<IconMoney color={palette.greenDark} />}
            />
            <ContextCard
              label="Transações"
              value={totalCount}
              sub={totalCount === 1 ? '1 movimentação' : `${totalCount} movimentações`}
              bg={palette.blueSurface}
              color={palette.blue}
              icon={<IconTx color={palette.blue} />}
            />
            <ContextCard
              label="Ticket Médio"
              value={fmtBRL(ticketMedio)}
              bg={palette.orangeSurface}
              color={palette.orange}
              icon={<IconTicket color={palette.orange} />}
            />
            <ContextCard
              label="Método Principal"
              value={PAYMENT_LABELS[topMethod?.method] ?? topMethod?.method ?? '—'}
              sub={topMethod && grossTotal > 0 ? `${((Number(topMethod.total) / grossTotal) * 100).toFixed(1)}% do total` : ''}
              bg="#F3E5F5"
              color="#6A1B9A"
              icon={<IconCard color="#6A1B9A" />}
            />
          </div>

          {/* ── Gráfico Donut com valor no centro ── */}
          <div style={{ position: 'relative', marginBottom: 4 }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  activeIndex={focusIdx ?? undefined}
                  activeShape={ActiveShape}
                  onMouseEnter={(_, idx) => setFocusIdx(idx)}
                  onMouseLeave={() => setFocusIdx(null)}
                >
                  {pieData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      style={{
                        opacity: focusIdx !== null && focusIdx !== idx ? 0.35 : 1,
                        transition: 'opacity 200ms ease-in-out',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Valor no centro do donut */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: palette.greenDark, lineHeight: 1.15 }}>
                {fmtBRL(grossTotal)}
              </p>
              <p style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Total Bruto
              </p>
            </div>
          </div>

          {/* ── Legenda rica com interação cruzada ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pieData.map((entry, idx) => {
              const color   = CHART_COLORS[idx % CHART_COLORS.length];
              const focused = focusIdx === idx;
              return (
                <div
                  key={entry.method}
                  onMouseEnter={() => setFocusIdx(idx)}
                  onMouseLeave={() => setFocusIdx(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: focused ? `${color}12` : palette.white,
                    border: `1px solid ${focused ? color : palette.border}`,
                    cursor: 'default',
                    transition: 'background 200ms ease-in-out, border-color 200ms ease-in-out',
                  }}
                >
                  {/* Cor */}
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />

                  {/* Nome */}
                  <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: palette.textSecondary, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.name}
                  </p>

                  {/* Valor */}
                  <p style={{ fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                    {fmtBRL(entry.value)}
                  </p>

                  {/* Percentual */}
                  <p style={{ fontSize: 12, color: palette.textMuted, flexShrink: 0, minWidth: 44, textAlign: 'right' }}>
                    {entry.pct}%
                  </p>

                  {/* Qtd de movimentações */}
                  <p style={{ fontSize: 11, color: palette.textMuted, flexShrink: 0, minWidth: 60, textAlign: 'right' }}>
                    {entry.ordersCount}&nbsp;mov.
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
