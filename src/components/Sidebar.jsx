import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Logo from "./Logo";

const ROLE_LABELS = {
  admin: "Admin",
  gerente: "Gerente",
  caixa: "Caixa",
  garcon: "Garçom",
  cozinheiro: "Cozinheiro",
};

const ALL_PAGES = [
  {
    to: "/menu",
    label: "Menu",
    description: "Catálogo e novo pedido",
    roles: ["admin", "gerente", "garcon", "cozinheiro"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5h18M3 12h18M3 19h12" />
      </svg>
    ),
  },
  {
    to: "/pedido",
    label: "Pedidos",
    description: "Gerenciar pedidos de mesa",
    roles: null,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: "/vendas",
    label: "Vendas",
    description: "Histórico de vendas e faturamento",
    roles: ["admin", "gerente", "caixa"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: "/estoque",
    label: "Estoque",
    description: "Controle de produtos e estoque",
    roles: ["admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: "/financeiro",
    label: "Financeiro",
    description: "Receitas e despesas",
    roles: ["admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: "/dashboard",
    label: "Dashboard",
    description: "Visão geral operacional",
    roles: ["admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    ),
  },
  {
    to: "/cadastro",
    label: "Cadastrar Usuário",
    description: "Criar e gerenciar usuários",
    roles: ["admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    to: "/usuarios",
    label: "Usuários",
    description: "Listar e redefinir senhas",
    roles: ["admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: "/profile/senha",
    label: "Alterar Senha",
    description: "Atualize sua senha de acesso",
    roles: null,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "admin" || user?.role === "gerente";

  const hasAccess = (roles) => !roles || roles.includes(user?.role);
  const handleLogout = () => { signOut(); navigate("/"); };

  return (
    <>
      
      <div
        className="fixed top-0 left-0 right-0 h-12 z-40 flex items-center px-4 gap-3 flex-shrink-0"
        style={{
          background: "rgba(8,4,4,0.94)",
          borderBottom: "1px solid rgba(225,29,72,0.12)",
          backdropFilter: "blur(14px)",
        }}
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all flex-shrink-0"
          style={{ color: "#6b2130" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(225,29,72,0.12)"; e.currentTarget.style.color = "#f43f5e"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b2130"; }}
          aria-label="Abrir menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Logo size={24} textSize="sm" />

        <div className="flex-1" />

        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "#fecdd3" }}>
              {user.sub || user.username || "Usuário"}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: isAdmin ? "rgba(225,29,72,0.15)" : "rgba(52,211,153,0.1)",
                color: isAdmin ? "#f43f5e" : "#4ade80",
                border: isAdmin ? "1px solid rgba(225,29,72,0.28)" : "1px solid rgba(52,211,153,0.2)",
              }}
            >
              {ROLE_LABELS[user?.role] ?? user?.role ?? "—"}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: "rgba(225,29,72,0.08)",
            color: "#f43f5e",
            border: "1px solid rgba(225,29,72,0.2)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(225,29,72,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(225,29,72,0.08)")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>

      
      <div className="h-12 flex-shrink-0" />

      <div
        className="fixed inset-0 z-40"
        style={{
          background: open ? "rgba(0,0,0,0.65)" : "transparent",
          backdropFilter: open ? "blur(4px)" : "none",
          pointerEvents: open ? "auto" : "none",
          transition: "background 0.28s, backdrop-filter 0.28s",
        }}
        onClick={() => setOpen(false)}
      />

   
      <div
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: 288,
          background: "linear-gradient(180deg, #0a0204 0%, #080404 100%)",
          borderRight: "1px solid rgba(225,29,72,0.14)",
          boxShadow: open ? "6px 0 48px rgba(0,0,0,0.85), 2px 0 24px rgba(225,29,72,0.06)" : "none",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
       
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(225,29,72,0.1)" }}
        >
          <Logo size={34} textSize="lg" />
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
            style={{ color: "#4a1525" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(225,29,72,0.1)"; e.currentTarget.style.color = "#f43f5e"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4a1525"; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p
          className="px-5 mt-5 mb-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "#3d0f18", letterSpacing: "0.14em" }}
        >
          Navegação
        </p>

       
        <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
          {ALL_PAGES.map(({ to, label, description, roles, icon }) => {
            const accessible = hasAccess(roles);
            const active = location.pathname === to;

            if (accessible) {
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: active ? "rgba(225,29,72,0.14)" : "transparent",
                    color: active ? "#fca5a5" : "#6b2130",
                    borderLeft: active ? "2px solid #e11d48" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(225,29,72,0.07)";
                      e.currentTarget.style.color = "#f87171";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#6b2130";
                    }
                  }}
                >
                  <span style={{ color: active ? "#f43f5e" : "#4a1525", flexShrink: 0 }}>{icon}</span>
                  <div className="min-w-0">
                    <p className="leading-tight">{label}</p>
                    <p
                      className="text-xs leading-tight mt-0.5 truncate"
                      style={{ color: active ? "#e11d48" : "#3d0f18" }}
                    >
                      {description}
                    </p>
                  </div>
                  {active && (
                    <span
                      className="ml-auto w-2 h-2 rounded-full flex-shrink-0 animate-pulse-glow"
                      style={{ background: "#e11d48" }}
                    />
                  )}
                </Link>
              );
            }

            return (
              <div
                key={to}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium select-none"
                style={{ color: "#2a0810", cursor: "not-allowed", borderLeft: "2px solid transparent" }}
                title={`Acesso restrito — requer ${roles?.join(" ou ") ?? "autenticação"}`}
              >
                <span style={{ color: "#1a0408", flexShrink: 0 }}>{icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="leading-tight">{label}</p>
                  <p className="text-xs leading-tight mt-0.5" style={{ color: "#1a0408" }}>
                    {description}
                  </p>
                </div>
                <span className="ml-auto flex-shrink-0" style={{ color: "#2a0810" }}>
                  <LockIcon />
                </span>
              </div>
            );
          })}
        </nav>

        
        {user && (
          <div
            className="px-3 pb-5 pt-4 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(225,29,72,0.1)" }}
          >
            <div
              className="flex items-center gap-3 px-3 py-3 rounded-xl"
              style={{
                background: "rgba(225,29,72,0.06)",
                border: "1px solid rgba(225,29,72,0.12)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: "rgba(225,29,72,0.18)", color: "#f43f5e" }}
              >
                {(user.sub || user.username || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: "#fecdd3" }}>
                  {user.sub || user.username || "Usuário"}
                </p>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isAdmin ? "rgba(225,29,72,0.18)" : "rgba(52,211,153,0.12)",
                    color: isAdmin ? "#f43f5e" : "#4ade80",
                  }}
                >
                  {ROLE_LABELS[user?.role] ?? user?.role ?? "—"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all flex-shrink-0"
                style={{ color: "#f43f5e", background: "rgba(225,29,72,0.08)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(225,29,72,0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(225,29,72,0.08)")}
                title="Sair"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
