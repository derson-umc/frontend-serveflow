import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import { useAuth } from "../AuthContext";

const fmtBRL = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const FALLBACK_METRICS = { revenueToday: 0, ordersToday: 0, customersToday: 0, netProfit: 0 };

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.sub || user?.username || "Usuário";
  const [metrics, setMetrics] = useState(FALLBACK_METRICS);
  const [sales, setSales] = useState([]);
  const [top, setTop] = useState([]);

  useEffect(() => {
    api.get("/dashboard/metrics").then((r) => setMetrics(r.data)).catch(() => {});
    api.get("/dashboard/sales-by-day").then((r) => setSales(r.data.map((d) => ({ day: new Date(d.date).toLocaleDateString("pt-BR", { weekday: "short" }), total: Number(d.total) })))).catch(() => {});
    api.get("/dashboard/top-products").then((r) => setTop(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: "Receita Hoje", value: fmtBRL(metrics.revenueToday), icon: "💰" },
    { label: "Pedidos Hoje", value: metrics.ordersToday, icon: "📦" },
    { label: "Clientes Atendidos", value: metrics.customersToday, icon: "👥" },
    { label: "Lucro Líquido", value: fmtBRL(metrics.netProfit), icon: "📈" }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex flex-col min-h-screen" style={{ background: "#080503" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 60% at 65% 25%, #1a0a03 0%, #0d0603 40%, #080503 100%)" }} />
      <Sidebar />
      <div className="relative flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(180deg, #f07040, #e46033)" }} />
            <h1 className="text-3xl font-bold tracking-tight capitalize" style={{ color: "#fff1f2" }}>{name}</h1>
          </div>
          <p className="text-sm ml-4" style={{ color: "#7a3518" }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(228,96,51,0.1)" }}>
              <div className="flex items-center justify-between mb-4"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4a2010" }}>{s.label}</span><div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "rgba(228,96,51,0.1)" }}>{s.icon}</div></div>
              <p className="text-2xl font-bold" style={{ color: "#fff1f2" }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="rounded-2xl p-6 lg:col-span-2" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(228,96,51,0.1)" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#b84020" }}>Vendas</h3>
            <p className="text-base font-semibold mb-4" style={{ color: "#fff1f2" }}>Últimos 7 dias</p>
            <div style={{ width: "100%", height: 260 }}><ResponsiveContainer><AreaChart data={sales}><defs><linearGradient id="grad-sales" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f07040" stopOpacity={0.55} /><stop offset="100%" stopColor="#f07040" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(228,96,51,0.08)" /><XAxis dataKey="day" stroke="#7a3518" fontSize={11} /><YAxis stroke="#7a3518" fontSize={11} /><Tooltip contentStyle={{ background: "rgba(10,2,4,0.95)", border: "1px solid rgba(228,96,51,0.3)", borderRadius: 8 }} formatter={(v) => fmtBRL(v)} /><Area type="monotone" dataKey="total" stroke="#f07040" strokeWidth={2} fill="url(#grad-sales)" /></AreaChart></ResponsiveContainer></div>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(228,96,51,0.1)" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#b84020" }}>Top Produtos</h3>
            <p className="text-base font-semibold mb-4" style={{ color: "#fff1f2" }}>Mais vendidos</p>
            <div style={{ width: "100%", height: 260 }}><ResponsiveContainer><BarChart data={top} layout="vertical"><CartesianGrid horizontal={false} stroke="rgba(228,96,51,0.06)" /><XAxis type="number" stroke="#7a3518" fontSize={11} /><YAxis type="category" dataKey="name" stroke="#7a3518" fontSize={11} width={120} /><Tooltip contentStyle={{ background: "rgba(10,2,4,0.95)", border: "1px solid rgba(228,96,51,0.3)", borderRadius: 8 }} /><Bar dataKey="quantity" fill="#e46033" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}