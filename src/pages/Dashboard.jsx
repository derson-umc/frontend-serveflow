import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import Sidebar from "../components/ui/Sidebar";
import { dashboardApi } from "../services/api/dashboard";
import { useAuthStore } from "../store/useAuthStore";

const G  = "#2E7D32";
const GD = "#1B5E20";
const GF = "#E8F5E9";
const O  = "#F57C00";
const OF = "#FFF3E0";
const D  = "#424242";
const M  = "#757575";
const B  = "#E0E0E0";
const W  = "#FFFFFF";
const R  = "#C62828";

const fmtBRL = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const FALLBACK_METRICS = { revenueToday: 0, ordersToday: 0, customersToday: 0, netProfit: 0 };

const PAYMENT_LABELS = {
  DINHEIRO: "Dinheiro", CREDITO: "Cartão Crédito", DEBITO: "Cartão Débito",
  PIX: "PIX", VOUCHER: "Vale-refeição", MISTO: "Misto", SEM_PAGAMENTO: "Sem pgto",
};

const PIE_COLORS = [G, O, "#1565C0", "#6A1B9A", "#F57C00", "#0097A7"];

function StatCard({ label, value, icon, accent, bg }) {
  return (
    <motion.div whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl p-5"
      style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: M }}>{label}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg || GF }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: accent || D }}>{value}</p>
    </motion.div>
  );
}

function CashierReportModal({ onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate,   setEndDate]   = useState(today);
  const [report,    setReport]    = useState(null);
  const [loading,   setLoading]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.cashierReport(startDate, endDate);
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pieData = (report?.byPaymentMethod ?? []).map((p) => ({
    name: PAYMENT_LABELS[p.method] ?? p.method,
    value: Number(p.total),
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", maxWidth: 620, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${B}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: D, margin: 0 }}>Relatório de Faturamento</h3>
            <p style={{ fontSize: 11, color: M, margin: "2px 0 0" }}>Receita consolidada por forma de pagamento</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, background: "#F5F5F5", border: "none", color: M, cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>

        {/* Filters */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${B}`, display: "flex", gap: 12, alignItems: "flex-end" }}>
          {[
            { label: "Data início", val: startDate, set: setStartDate },
            { label: "Data fim",    val: endDate,   set: setEndDate },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</label>
              <input type="date" value={val} onChange={(e) => set(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${B}`, background: "#FAFAFA", fontSize: 13, color: D, outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.target.style.border = `1.5px solid ${G}`)}
                onBlur={(e)  => (e.target.style.border = `1.5px solid ${B}`)}
              />
            </div>
          ))}
          <button onClick={load} disabled={loading}
            style={{ padding: "9px 18px", borderRadius: 8, background: G, color: W, border: "none", fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, flexShrink: 0 }}>
            {loading ? "..." : "Filtrar"}
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 32, color: M }}>Carregando...</div>
          ) : !report || report.byPaymentMethod.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: M, fontSize: 13 }}>
              Nenhuma venda registrada no período.
            </div>
          ) : (
            <>
              {/* Total highlight */}
              <div style={{ background: GF, border: `1px solid ${G}30`, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: G, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Total Bruto</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: G }}>{fmtBRL(report.grossTotal)}</p>
                </div>
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke={G} strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "flex-start" }}>
                {/* Payment breakdown table */}
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Por forma de pagamento</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {report.byPaymentMethod.map((p, i) => (
                      <div key={p.method} style={{ display: "flex", alignItems: "center", gap: 10, background: "#FAFAFA", borderRadius: 8, padding: "9px 12px", border: `1px solid ${B}` }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: D }}>{PAYMENT_LABELS[p.method] ?? p.method}</p>
                          <p style={{ fontSize: 10, color: M }}>{p.ordersCount} pedido{p.ordersCount !== 1 ? "s" : ""}</p>
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: G, flexShrink: 0 }}>{fmtBRL(p.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie chart */}
                {pieData.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Distribuição</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {pieData.map((_, idx) => (
                            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => fmtBRL(v)} contentStyle={{ borderRadius: 8, border: `1px solid ${B}`, fontSize: 12 }} />
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

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const name = user?.sub || user?.username || "Usuário";
  const [metrics, setMetrics]       = useState(FALLBACK_METRICS);
  const [sales,   setSales]         = useState([]);
  const [top,     setTop]           = useState([]);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    dashboardApi.metrics().then(setMetrics).catch(() => {});
    dashboardApi.salesByDay().then((data) =>
      setSales(data.map((d) => ({
        day: new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }),
        total: Number(d.total),
      })))
    ).catch(() => {});
    dashboardApi.topProducts().then(setTop).catch(() => {});
  }, []);

  const stats = [
    { label: "Receita Hoje",       value: fmtBRL(metrics.revenueToday),  icon: <CashIcon color={G} />,   accent: G,  bg: GF },
    { label: "Comandas Hoje",      value: metrics.ordersToday,            icon: <OrderIcon color={O} />,  accent: O,  bg: OF },
    { label: "Clientes Atendidos", value: metrics.customersToday,         icon: <UsersIcon color={D} />,  accent: D,  bg: "#F5F5F5" },
    { label: "Lucro Estimado",     value: fmtBRL(metrics.netProfit),      icon: <TrendIcon color={GD} />, accent: GD, bg: GF },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen" style={{ background: "#F5F5F5" }}>
      <Sidebar />

      <div className="flex-1 p-6 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full flex-shrink-0" style={{ background: `linear-gradient(180deg, ${O}, ${G})` }} />
              <h1 className="text-2xl font-bold capitalize" style={{ color: D }}>{name}</h1>
            </div>
            <p className="text-sm ml-4" style={{ color: M }}>
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0"
            style={{ background: W, border: `1px solid ${B}`, color: D, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = GF)}
            onMouseLeave={(e) => (e.currentTarget.style.background = W)}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Relatório de Caixa
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Sales chart */}
          <div className="rounded-2xl p-6 lg:col-span-2"
            style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: O }}>Vendas</p>
            <p className="text-base font-semibold mb-4" style={{ color: D }}>Últimos 7 dias</p>
            {sales.length === 0 ? (
              <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: M, fontSize: 13 }}>
                Nenhum dado disponível para o período.
              </div>
            ) : (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <AreaChart data={sales}>
                    <defs>
                      <linearGradient id="grad-sales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={G} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={G} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="day" stroke={M} fontSize={11} tick={{ fill: M }} />
                    <YAxis stroke={M} fontSize={11} tick={{ fill: M }} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip
                      contentStyle={{ background: W, border: `1px solid ${B}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                      labelStyle={{ color: D, fontWeight: 600 }}
                      formatter={(v) => [fmtBRL(v), "Total"]}
                    />
                    <Area type="monotone" dataKey="total" stroke={G} strokeWidth={2.5} fill="url(#grad-sales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top products */}
          <div className="rounded-2xl p-6"
            style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: O }}>Top Produtos</p>
            <p className="text-base font-semibold mb-4" style={{ color: D }}>Mais vendidos (30 dias)</p>
            {top.length === 0 ? (
              <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: M, fontSize: 13 }}>
                Nenhuma venda registrada.
              </div>
            ) : (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={top} layout="vertical">
                    <CartesianGrid horizontal={false} stroke="#F0F0F0" />
                    <XAxis type="number" stroke={M} fontSize={11} tick={{ fill: M }} />
                    <YAxis type="category" dataKey="name" stroke={M} fontSize={10} width={110} tick={{ fill: M }} />
                    <Tooltip
                      contentStyle={{ background: W, border: `1px solid ${B}`, borderRadius: 10 }}
                      labelStyle={{ color: D }}
                    />
                    <Bar dataKey="quantity" fill={G} radius={[0, 6, 6, 0]} />
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

function CashIcon({ color }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function OrderIcon({ color }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
}
function UsersIcon({ color }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function TrendIcon({ color }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
}
