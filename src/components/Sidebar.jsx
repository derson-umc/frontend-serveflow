import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

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
    icon: null,
  },
  {
    to: "/estoque",
    label: "Estoque",
    description: "Controle de produtos e estoque",
    roles: ["admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: "/financeiro",
    label: "Financeiro",
    description: "Receitas e despesas",
    roles: ["admin", "gerente", "caixa"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

export default function Navbar() {
  const [, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = ["admin", "gerente"].includes(user?.role);

  const hasAccess = (roles) => !roles || roles.includes(user?.role);
  const handleLogout = () => { signOut(); navigate("/"); };

  
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const accessiblePages = ALL_PAGES.filter((p) => hasAccess(p.roles));
  const lockedPages = ALL_PAGES.filter((p) => !hasAccess(p.roles));

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center px-4 gap-1 flex-shrink-0"
        style={{
          height: 48,
          background: "rgba(8,4,4,0.94)",
          borderBottom: "1px solid rgba(228,96,51,0.12)",
          backdropFilter: "blur(14px)",
        }}
      >
        
        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto hide-scrollbar">
          {accessiblePages.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
                style={{
                  background: active ? "rgba(228,96,51,0.16)" : "transparent",
                  color: active ? "#fca5a5" : "#7a3518",
                  borderBottom: active ? "2px solid #e46033" : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(228,96,51,0.08)";
                    e.currentTarget.style.color = "#f87171";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#7a3518";
                  }
                }}
              >
                <span style={{ color: active ? "#f07040" : "#4a2010", flexShrink: 0 }}>{icon}</span>
                {label}
                {active && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#e46033" }}
                  />
                )}
              </Link>
            );
          })}

          
          {lockedPages.map(({ to, label, icon }) => (
            <span
              key={to}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 select-none"
              style={{ color: "#2a0810", cursor: "not-allowed", borderBottom: "2px solid transparent" }}
              title={`Acesso restrito`}
            >
              <span style={{ color: "#1a0408", flexShrink: 0 }}>{icon}</span>
              {label}
              <span style={{ color: "#2a0810" }}><LockIcon /></span>
            </span>
          ))}
        </nav>

        
        {user && (
          <div className="flex items-center gap-2 flex-shrink-0 pl-2" style={{ borderLeft: "1px solid rgba(228,96,51,0.12)" }}>
            <span className="text-sm font-semibold hidden sm:block" style={{ color: "#fecdd3" }}>
              {user.sub || user.username || "Usuário"}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: isAdmin ? "rgba(228,96,51,0.15)" : "rgba(52,211,153,0.1)",
                color: isAdmin ? "#f07040" : "#4ade80",
                border: isAdmin ? "1px solid rgba(228,96,51,0.28)" : "1px solid rgba(52,211,153,0.2)",
              }}
            >
              {ROLE_LABELS[user?.role] ?? user?.role ?? "—"}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: "rgba(228,96,51,0.08)",
                color: "#f07040",
                border: "1px solid rgba(228,96,51,0.2)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(228,96,51,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(228,96,51,0.08)")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        )}
      </div>

      
      <div className="h-12 flex-shrink-0" />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}