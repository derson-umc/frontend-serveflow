import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const G  = "#2E7D32";
const GD = "#1B5E20";
const GL = "#43A047";
const O  = "#F57C00";
const W  = "#FFFFFF";

const ROLE_LABELS = {
  root: "Root", admin: "Admin", gerente: "Gerente",
  caixa: "Caixa", garcon: "Garçom", cozinheiro: "Cozinheiro",
};

const ALL_PAGES = [
  {
    to: "/menu", label: "Menu", roles: ["root", "admin", "gerente", "garcon"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-6" />
      </svg>
    ),
  },
  {
    to: "/gestao-usuarios", label: "Gestão de Usuários", roles: ["root", "admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: "/estoque", label: "Estoque", roles: ["root", "admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: "/financeiro", label: "Financeiro", roles: ["root", "admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: "/dashboard", label: "Dashboard", roles: ["root", "admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    ),
  },
  {
    to: "/cadastro", label: "Cadastrar Usuário", roles: ["root", "admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    to: "/cadastro-produtos", label: "Cadastrar Produtos", roles: ["root", "admin", "gerente"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l3 3 4-4" />
      </svg>
    ),
  },
  {
    to: "/profile/senha", label: "Alterar Senha", roles: null,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
  const dropdownRef = useRef(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hasAccess = (roles) => !roles || roles.includes(user?.role);
  const handleLogout = () => { signOut(); navigate("/"); };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {}
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const accessiblePages = ALL_PAGES.filter((p) => hasAccess(p.roles));
  const lockedPages    = ALL_PAGES.filter((p) => !hasAccess(p.roles));
  const isPrivileged   = ["root", "admin", "gerente"].includes(user?.role);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center px-4 gap-1 flex-shrink-0"
        style={{
          height: 52,
          background: G,
          borderBottom: `3px solid ${GD}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mr-3 flex-shrink-0" style={{ borderRight: "1px solid rgba(255,255,255,0.18)", paddingRight: 12 }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: O, color: W }}>S</div>
          <span className="text-sm font-bold hidden sm:block" style={{ color: W, letterSpacing: "-0.01em" }}>ServeFlow</span>
        </div>

        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto hide-scrollbar">
          {accessiblePages.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to} to={to}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
                style={{
                  background: active ? "rgba(255,255,255,0.18)" : "transparent",
                  color: active ? W : "rgba(255,255,255,0.75)",
                  borderBottom: active ? `2px solid ${O}` : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                    e.currentTarget.style.color = W;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                  }
                }}
              >
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.8 }}>{icon}</span>
                {label}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: O }} />
                )}
              </Link>
            );
          })}

          {lockedPages.map(({ to, label, icon }) => (
            <span
              key={to}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 select-none"
              style={{ color: "rgba(255,255,255,0.28)", cursor: "not-allowed" }}
              title="Acesso restrito"
            >
              <span style={{ opacity: 0.3, flexShrink: 0 }}>{icon}</span>
              {label}
              <span style={{ opacity: 0.4 }}><LockIcon /></span>
            </span>
          ))}
        </nav>

        {user && (
          <div className="flex items-center gap-2 flex-shrink-0 pl-2" style={{ borderLeft: "1px solid rgba(255,255,255,0.18)" }}>
            <span className="text-sm font-semibold hidden sm:block" style={{ color: W }}>
              {user.sub || user.username || "Usuário"}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{
                background: isPrivileged ? O : "rgba(255,255,255,0.15)",
                color: W,
              }}
            >
              {ROLE_LABELS[user?.role] ?? user?.role ?? "—"}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.12)", color: W, border: "1px solid rgba(255,255,255,0.2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        )}
      </div>

      <div className="h-[52px] flex-shrink-0" />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
