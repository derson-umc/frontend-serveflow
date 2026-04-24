import Sidebar from "../components/Sidebar";
import { useAuth } from "../AuthContext";

const stats = [
  {
    label: "Receita Diária",
    value: "R$ —",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "#f43f5e",
    bg: "rgba(225,29,72,0.12)",
    delay: "0s",
  },
  {
    label: "Pedidos Hoje",
    value: "0",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: "#fca5a5",
    bg: "rgba(225,29,72,0.08)",
    delay: "0.1s",
  },
  {
    label: "Clientes Atendidos",
    value: "0",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "#fda4af",
    bg: "rgba(225,29,72,0.08)",
    delay: "0.2s",
  },
  {
    label: "Lucro Líquido",
    value: "R$ —",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: "#4ade80",
    bg: "rgba(52,211,153,0.1)",
    delay: "0.3s",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.sub || user?.username || "Usuário";

  return (
    <div className="relative flex flex-col min-h-screen" style={{ background: "#080404" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 90% 60% at 65% 25%, #1a0008 0%, #0d0204 40%, #080404 100%)",
        }}
      />
      
      <div
        className="absolute pointer-events-none animate-float-2"
        style={{
          width: 450, height: 450, top: "-5%", right: "5%",
          background: "radial-gradient(circle, rgba(225,29,72,0.09) 0%, transparent 70%)",
          filter: "blur(55px)", borderRadius: "50%",
        }}
      />
      <Sidebar />

      <div className="relative flex-1 p-8 page-enter">
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-1 h-7 rounded-full"
              style={{ background: "linear-gradient(180deg, #f43f5e, #e11d48)" }}
            />
            <h1 className="text-3xl font-bold tracking-tight capitalize" style={{ color: "#fff1f2" }}>
              {name}
            </h1>
          </div>
          <p className="text-sm ml-4" style={{ color: "#6b2130" }}>
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

       
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          {stats.map(({ label, value, icon, color, bg, delay }) => (
            <div
              key={label}
              className="card-lift rounded-2xl p-5 animate-count-up"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(225,29,72,0.1)",
                animationDelay: delay,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#4a1525" }}
                >
                  {label}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: bg, color }}
                >
                  {icon}
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: "#fff1f2" }}>{value}</p>
            </div>
          ))}
        </div>

       
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(225,29,72,0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-px" style={{ background: "#e11d48" }} />
            <h2
              className="text-base font-semibold tracking-wide uppercase"
              style={{ color: "#4a1525", fontSize: "0.8rem", letterSpacing: "0.1em" }}
            >
              Visão Geral
            </h2>
          </div>
          <p className="text-lg font-semibold mb-1" style={{ color: "#fff1f2" }}>
            Resumo Operacional
          </p>
          <p className="text-sm mb-4" style={{ color: "#4a1525" }}>
            Monitore as operações do restaurante em tempo real.
          </p>
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(225,29,72,0.05)",
              border: "1px solid rgba(225,29,72,0.12)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#e11d48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm" style={{ color: "#6b2130" }}>
              Use o menu superior para navegar entre Pedidos, Estoque, Financeiro e Vendas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
