import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import { useAuth } from "../AuthContext";

const G  = "#2E7D32";
const GD = "#1B5E20";
const GF = "#E8F5E9";
const O  = "#F57C00";
const OF = "#FFF3E0";
const D  = "#424242";
const M  = "#757575";
const B  = "#E0E0E0";
const W  = "#FFFFFF";

const fmtBRL = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const FALLBACK_METRICS = { revenueToday: 0, ordersToday: 0, customersToday: 0, netProfit: 0 };

function StatCard({ label, value, icon, accent, bg }) {
  return (
    <motion.div whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl p-5"
      style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: M }}>{label}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: bg || GF }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: accent || D }}>{value}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.sub || user?.username || "Usuário";
  const [metrics, setMetrics] = useState(FALLBACK_METRICS);
  const [sales, setSales]     = useState([]);
  const [top, setTop]         = useState([]);

  useEffect(() => {
    api.get("/dashboard/metrics").then((r) => setMetrics(r.data)).catch(() => {});
    api.get("/dashboard/sales-by-day").then((r) =>
      setSales(r.data.map((d) => ({ day: new Date(d.date).toLocaleDateString("pt-BR", { weekday: "short" }), total: Number(d.total) })))
    ).catch(() => {});
    api.get("/dashboard/top-products").then((r) => setTop(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: "Receita Hoje",          value: fmtBRL(metrics.revenueToday),  icon: "💰", accent: G, bg: GF },
    { label: "Comandas Hoje",         value: metrics.ordersToday,            icon: "🧾", accent: O, bg: OF },
    { label: "Clientes Atendidos",    value: metrics.customersToday,         icon: "👥", accent: D, bg: "#F5F5F5" },
    { label: "Lucro Líquido",         value: fmtBRL(metrics.netProfit),      icon: "📈", accent: GD, bg: GF },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen" style={{ background: "#F5F5F5" }}>
      <Sidebar />

      <div className="flex-1 p-6 pt-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${O}, ${G})` }} />
            <h1 className="text-2xl font-bold capitalize" style={{ color: D }}>{name}</h1>
          </div>
          <p className="text-sm ml-4" style={{ color: M }}>
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Sales chart */}
          <div className="rounded-2xl p-6 lg:col-span-2"
            style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: O }}>Vendas</p>
            <p className="text-base font-semibold mb-4" style={{ color: D }}>Últimos 7 dias</p>
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
                  <YAxis stroke={M} fontSize={11} tick={{ fill: M }} />
                  <Tooltip
                    contentStyle={{ background: W, border: `1px solid ${B}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                    labelStyle={{ color: D, fontWeight: 600 }}
                    formatter={(v) => [fmtBRL(v), "Total"]}
                  />
                  <Area type="monotone" dataKey="total" stroke={G} strokeWidth={2.5} fill="url(#grad-sales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top products */}
          <div className="rounded-2xl p-6"
            style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: O }}>Top Produtos</p>
            <p className="text-base font-semibold mb-4" style={{ color: D }}>Mais vendidos</p>
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}
