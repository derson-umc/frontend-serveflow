import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import Sidebar from '@shared/components/layout/Sidebar';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { palette } from '@styles/ds';
import { fmtBRL, FALLBACK_METRICS } from './constants';
import StatCard from './components/StatCard';
import CashierReportModal from './components/CashierReportModal';
import { CashIcon, OrderIcon, UsersIcon, TrendIcon } from './components/icons';
import { useDashboard } from './hooks/useDashboard';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const name = user?.sub || user?.username || 'Usuário';
  const [showReport, setShowReport] = useState(false);

  const { metrics, salesByDay, topProducts } = useDashboard();

  const metricsData = metrics.data ?? FALLBACK_METRICS;
  const sales       = salesByDay.data ?? [];
  const top         = topProducts.data ?? [];

  const stats = [
    { label: 'Receita Hoje',       value: fmtBRL(metricsData.revenueToday),   icon: <CashIcon  color={palette.green} />,        accent: palette.green,        bg: palette.greenSurface },
    { label: 'Comandas Hoje',      value: metricsData.ordersToday,             icon: <OrderIcon color={palette.orange} />,       accent: palette.orange,       bg: palette.orangeSurface },
    { label: 'Clientes Atendidos', value: metricsData.customersToday,          icon: <UsersIcon color={palette.textSecondary} />,accent: palette.textSecondary,bg: palette.background },
    { label: 'Lucro Estimado',     value: fmtBRL(metricsData.netProfit),       icon: <TrendIcon color={palette.greenDark} />,    accent: palette.greenDark,    bg: palette.greenSurface },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen" style={{ background: palette.background }}>
      <Sidebar />

      <div className="flex-1 p-6 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full flex-shrink-0"
                style={{ background: `linear-gradient(180deg, ${palette.orange}, ${palette.green})` }} />
              <h1 className="text-2xl font-bold capitalize" style={{ color: palette.textSecondary }}>{name}</h1>
            </div>
            <p className="text-sm ml-4" style={{ color: palette.textMuted }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0"
            style={{ background: palette.white, border: `1px solid ${palette.border}`, color: palette.textSecondary, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = palette.greenSurface)}
            onMouseLeave={(e) => (e.currentTarget.style.background = palette.white)}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Relatório de Caixa
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="rounded-2xl p-6 lg:col-span-2"
            style={{ background: palette.white, border: `1px solid ${palette.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: palette.orange }}>Vendas</p>
            <p className="text-base font-semibold mb-4" style={{ color: palette.textSecondary }}>Últimos 7 dias</p>
            {sales.length === 0 ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.textMuted, fontSize: 13 }}>
                Nenhum dado disponível para o período.
              </div>
            ) : (
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <AreaChart data={sales}>
                    <defs>
                      <linearGradient id="grad-sales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={palette.green} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={palette.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="day" stroke={palette.textMuted} fontSize={11} tick={{ fill: palette.textMuted }} />
                    <YAxis stroke={palette.textMuted} fontSize={11} tick={{ fill: palette.textMuted }} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip
                      contentStyle={{ background: palette.white, border: `1px solid ${palette.border}`, borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                      labelStyle={{ color: palette.textSecondary, fontWeight: 600 }}
                      formatter={(v) => [fmtBRL(v), 'Total']}
                    />
                    <Area type="monotone" dataKey="total" stroke={palette.green} strokeWidth={2.5} fill="url(#grad-sales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-2xl p-6"
            style={{ background: palette.white, border: `1px solid ${palette.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: palette.orange }}>Top Produtos</p>
            <p className="text-base font-semibold mb-4" style={{ color: palette.textSecondary }}>Mais vendidos (30 dias)</p>
            {top.length === 0 ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.textMuted, fontSize: 13 }}>
                Nenhuma venda registrada.
              </div>
            ) : (
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={top} layout="vertical">
                    <CartesianGrid horizontal={false} stroke="#F0F0F0" />
                    <XAxis type="number"   stroke={palette.textMuted} fontSize={11} tick={{ fill: palette.textMuted }} />
                    <YAxis type="category" dataKey="name" stroke={palette.textMuted} fontSize={10} width={110} tick={{ fill: palette.textMuted }} />
                    <Tooltip
                      contentStyle={{ background: palette.white, border: `1px solid ${palette.border}`, borderRadius: 10 }}
                      labelStyle={{ color: palette.textSecondary }}
                    />
                    <Bar dataKey="quantity" fill={palette.green} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReport && <CashierReportModal onClose={() => setShowReport(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
