import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { palette } from '@styles/ds';
import { fmtBRL, PAYMENT_LABELS, PIE_COLORS } from '../constants';
import { useCashierReport } from '../hooks/useDashboard';

export default function CashierReportModal({ onClose }) {
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
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ background: palette.white, border: `1px solid ${palette.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.18)', maxWidth: 620, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: palette.textSecondary, margin: 0 }}>Relatório de Faturamento</h3>
            <p style={{ fontSize: 11, color: palette.textMuted, margin: '2px 0 0' }}>Receita consolidada por forma de pagamento</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, background: palette.background, border: 'none', color: palette.textMuted, cursor: 'pointer', fontSize: 13 }}>x</button>
        </div>

        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${palette.border}`, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          {[
            { label: 'Data início', val: startDate, set: setStartDate },
            { label: 'Data fim',    val: endDate,   set: setEndDate },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</label>
              <input type="date" value={val} onChange={(e) => set(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${palette.border}`, background: palette.surface, fontSize: 13, color: palette.textSecondary, outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.border = `1.5px solid ${palette.green}`)}
                onBlur={(e)  => (e.target.style.border = `1.5px solid ${palette.border}`)}
              />
            </div>
          ))}
          <button onClick={handleFilter} disabled={isFetching}
            style={{ padding: '9px 18px', borderRadius: 8, background: palette.green, color: palette.white, border: 'none', fontWeight: 700, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer', opacity: isFetching ? 0.7 : 1, flexShrink: 0 }}>
            {isFetching ? '...' : 'Filtrar'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {isFetching ? (
            <div style={{ textAlign: 'center', padding: 32, color: palette.textMuted }}>Carregando...</div>
          ) : !report || report.byPaymentMethod.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: palette.textMuted, fontSize: 13 }}>
              Nenhuma venda registrada no período.
            </div>
          ) : (
            <>
              <div style={{ background: palette.greenSurface, border: `1px solid ${palette.green}30`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: palette.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Total Bruto</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: palette.green }}>{fmtBRL(report.grossTotal)}</p>
                </div>
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke={palette.green} strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Por forma de pagamento</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {report.byPaymentMethod.map((p, i) => (
                      <div key={p.method} style={{ display: 'flex', alignItems: 'center', gap: 10, background: palette.surface, borderRadius: 8, padding: '9px 12px', border: `1px solid ${palette.border}` }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: palette.textSecondary }}>{PAYMENT_LABELS[p.method] ?? p.method}</p>
                          <p style={{ fontSize: 10, color: palette.textMuted }}>{p.ordersCount} pedido{p.ordersCount !== 1 ? 's' : ''}</p>
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: palette.green, flexShrink: 0 }}>{fmtBRL(p.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {pieData.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Distribuição</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
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
      </motion.div>
    </motion.div>
  );
}
