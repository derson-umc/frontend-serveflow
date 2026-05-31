import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { palette } from '@styles/ds';
import { fmtBRL, PAYMENT_LABELS, PIE_COLORS } from '../../dashboard/constants';
import { useCashierReport } from '../../dashboard/hooks/useDashboard';

export default function TabCashierReport() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate,   setEndDate]   = useState(today);
  const [submitted, setSubmitted] = useState({ start: today, end: today });

  const { data: report, isFetching, refetch } = useCashierReport(submitted.start, submitted.end);

  const handleFilter = () => {
    setSubmitted({ start: startDate, end: endDate });
    refetch();
  };

  const pieData = (report?.byPaymentMethod ?? []).map((p) => ({
    name:  PAYMENT_LABELS[p.method] ?? p.method,
    value: Number(p.total),
  }));

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Data início', val: startDate, set: setStartDate },
          { label: 'Data fim',    val: endDate,   set: setEndDate },
        ].map(({ label, val, set }) => (
          <div key={label} style={{ flex: '1 1 140px', minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</label>
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

      {isFetching ? (
        <div style={{ textAlign: 'center', padding: 48, color: palette.textMuted }}>Carregando...</div>
      ) : !report || report.byPaymentMethod.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: palette.textMuted, fontSize: 13 }}>
          Nenhuma venda registrada no período.
        </div>
      ) : (
        <>
          <div style={{ background: palette.greenSurface, border: `1px solid ${palette.green}30`, borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: palette.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Total Bruto</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: palette.green }}>{fmtBRL(report.grossTotal)}</p>
            </div>
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke={palette.green} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Por forma de pagamento</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.byPaymentMethod.map((p, i) => (
                  <div key={p.method} style={{ display: 'flex', alignItems: 'center', gap: 10, background: palette.surface, borderRadius: 10, padding: '10px 14px', border: `1px solid ${palette.border}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: palette.textSecondary }}>{PAYMENT_LABELS[p.method] ?? p.method}</p>
                      <p style={{ fontSize: 11, color: palette.textMuted }}>{p.ordersCount} pedido{p.ordersCount !== 1 ? 's' : ''}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: palette.green, flexShrink: 0 }}>{fmtBRL(p.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            {pieData.length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Distribuição</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmtBRL(v)} contentStyle={{ borderRadius: 8, border: `1px solid ${palette.border}`, fontSize: 12 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
