import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@features/auth/store/useAuthStore";

const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((m) => ({ default: m.ReactQueryDevtools }))
);

/* ── Tokens ─────────────────────────────────────────────────────── */
const G  = "#2E7D32";
const O  = "#F57C00";
const W  = "#FFFFFF";
const BG = "rgba(255,255,255,0.12)";
const BH = "rgba(255,255,255,0.18)";
const WT = "rgba(255,255,255,0.82)";
const WM = "rgba(255,255,255,0.55)";

const NAVBAR_H = 64;

const ROLE_LABELS = {
  root: "Root", admin: "Admin", gerente: "Gerente",
  caixa: "Caixa", garcon: "Garçom", cozinheiro: "Cozinheiro",
};

const ALL_PAGES = [
  {
    to: "/ficha-tecnica", label: "Fichas Técnicas", roles: ["root", "admin", "gerente"],
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    to: "/kds", label: "Monitor KDS", roles: ["root", "admin", "gerente", "cozinheiro"],
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: "/menu", label: "Menu", roles: ["root", "admin", "gerente", "garcon"],
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: "/gestao-usuarios", label: "Usuários", roles: ["root", "admin", "gerente"],
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: "/estoque", label: "Estoque", roles: ["root", "admin", "gerente"],
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: "/financeiro", label: "Financeiro", roles: ["root", "admin", "gerente", "caixa"],
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: "/dashboard", label: "Dashboard", roles: ["root", "admin", "gerente"],
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    ),
  },
  {
    to: "/cadastro-produtos", label: "Produtos", roles: ["root", "admin", "gerente", "cozinheiro", "garcon"],
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l3 3 4-4" />
      </svg>
    ),
  },
];


function BurgerIcon({ open }) {
  return open ? (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [devOpen,    setDevOpen]    = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [hovered,    setHovered]    = useState(false);

  const user    = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const location = useLocation();

  /* true quando o navbar está em modo expandido */
  const expanded = !scrolled || hovered;

  // DevTools acessível apenas para admin/root — sem restrição de ambiente
  const isDevAllowed = user?.role === "admin" || user?.role === "root";

  const hasAccess    = (roles) => !roles || roles.includes(user?.role);
  const handleLogout = () => { signOut(); navigate("/"); };

  const accessiblePages = ALL_PAGES.filter((p) => hasAccess(p.roles));
  const isPrivileged    = ["root", "admin", "gerente"].includes(user?.role);
  const displayName     = user?.sub || user?.username || "Usuário";

  /* compacta ao sair do topo da página */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* fechar drawer ao trocar de rota */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* fechar drawer ao clicar fora */
  useEffect(() => {
    if (!mobileOpen) return;
    const close = (e) => {
      if (!e.target.closest("[data-drawer]") && !e.target.closest("[data-burger]"))
        setMobileOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [mobileOpen]);

  /* fade compartilhado: nav links + user area */
  const fadeStyle = {
    opacity:       expanded ? 1 : 0,
    transform:     expanded ? "translateY(0)" : "translateY(-5px)",
    pointerEvents: expanded ? "auto" : "none",
    transition:    "opacity 0.25s ease, transform 0.25s ease",
  };

  return (
    <>
      {/* ══════════════════════ HEADER ══════════════════════════════ */}
      <header
        style={{
          position:   "fixed",
          top: 0, left: 0, right: 0,
          height:     NAVBAR_H,
          background: G,
          boxShadow:  scrolled && !hovered
            ? "0 4px 24px rgba(0,0,0,0.24)"
            : "0 2px 8px rgba(0,0,0,0.10)",
          display:    "flex",
          alignItems: "center",
          padding:    "0 20px",
          gap:        12,
          zIndex:     50,
          transition: "box-shadow 0.3s ease",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Logo ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "rgba(255,255,255,0.18)",
            border: "1.5px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ color: W, fontWeight: 900, fontSize: 17, lineHeight: 1 }}>S</span>
          </div>
          <span style={{ color: W, fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            ServeFlow
          </span>
        </div>

        {/* ── Divider (some com nav links) ────────────────────────── */}
        <div style={{
          width: 1, height: 22,
          background: "rgba(255,255,255,0.25)",
          flexShrink: 0,
          ...fadeStyle,
        }} />

        {/* ── Nav links (desktop) ────────────────────────────────── */}
        <nav
          className="sf-desktop-nav"
          style={{
            display: "flex", alignItems: "center", gap: 2,
            flex: 1, overflowX: "auto", scrollbarWidth: "none",
            ...fadeStyle,
          }}
        >
          {accessiblePages.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 8,
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  color: active ? W : WT,
                  background: active ? BH : "transparent",
                  textDecoration: "none",
                  whiteSpace: "nowrap", flexShrink: 0,
                  transition: "all 0.2s ease",
                  position: "relative",
                  outline: "none",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = BG; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ display: "flex", color: active ? W : WM, flexShrink: 0 }}>{icon}</span>
                {label}
                {active && (
                  <span style={{
                    position: "absolute", bottom: -9,
                    left: "50%", transform: "translateX(-50%)",
                    width: "55%", height: 2,
                    background: "rgba(255,255,255,0.65)", borderRadius: 2,
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Lado direito ───────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: "auto" }}>

          {/* Usuário + role (desktop, some com scroll) */}
          <div className="sf-desktop-only" style={{ display: "flex", alignItems: "center", gap: 8, ...fadeStyle }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: WT, whiteSpace: "nowrap" }}>
              {displayName}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
              background: isPrivileged ? O : "rgba(255,255,255,0.2)",
              color: W,
            }}>
              {ROLE_LABELS[user?.role] ?? user?.role ?? "—"}
            </span>
          </div>

          {/* Dev Tools */}
          {isDevAllowed && (
            <button
              onClick={() => setDevOpen((p) => !p)}
              title="Dev Tools"
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: "1.5px solid rgba(255,255,255,0.25)",
                background: devOpen ? BH : "transparent",
                color: W, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease", flexShrink: 0,
                ...fadeStyle,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = BH; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = devOpen ? BH : "transparent"; }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          {/* Botão Sair */}
          <button
            onClick={handleLogout}
            title="Sair"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 12px", borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              background: "rgba(255,255,255,0.10)",
              color: WT,
              border: "1.5px solid rgba(255,255,255,0.20)",
              cursor: "pointer",
              transition: "all 0.2s ease", flexShrink: 0,
              ...fadeStyle,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = W; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = WT; }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="sf-desktop-only">Sair</span>
          </button>

          {/* Hamburger (mobile) */}
          <button
            data-burger
            onClick={() => setMobileOpen((p) => !p)}
            className="sf-mobile-only"
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: "1.5px solid rgba(255,255,255,0.28)",
              background: mobileOpen ? BH : "transparent",
              color: W, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease", flexShrink: 0,
            }}
          >
            <BurgerIcon open={mobileOpen} />
          </button>
        </div>

        {/* Traço sutil quando compacto — indica que é interativo */}
        {scrolled && !hovered && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: 2, background: "rgba(255,255,255,0.12)",
          }} />
        )}
      </header>

      {/* ══════════════════════ MOBILE OVERLAY ══════════════════════ */}
      <div
        onClick={() => setMobileOpen(false)}
        style={{
          position: "fixed", inset: 0, top: NAVBAR_H,
          background: "rgba(0,0,0,0.42)",
          zIndex: 45, backdropFilter: "blur(3px)",
          opacity:       mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition:    "opacity 0.3s ease",
        }}
      />

      {/* ══════════════════════ MOBILE DRAWER ═══════════════════════ */}
      <aside
        data-drawer
        style={{
          position:  "fixed",
          top: NAVBAR_H, left: 0,
          width: 272, height: `calc(100vh - ${NAVBAR_H}px)`,
          background: W,
          borderRight: "1px solid #E4E6EA",
          boxShadow:   "4px 0 24px rgba(0,0,0,0.12)",
          transform:   mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition:  "transform 0.3s ease",
          zIndex: 46, overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #E4E6EA", background: "#FAFAFA" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{displayName}</div>
          <span style={{
            display: "inline-block", marginTop: 5,
            fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
            background: isPrivileged ? O : G, color: W,
          }}>
            {ROLE_LABELS[user?.role] ?? user?.role ?? "—"}
          </span>
        </div>

        <nav style={{ flex: 1, padding: "8px 0" }}>
          {accessiblePages.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 20px", fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? G : "#374151",
                  background: active ? "#E8F5E9" : "transparent",
                  textDecoration: "none",
                  borderLeft: `3px solid ${active ? G : "transparent"}`,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#F5F5F5"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ display: "flex", color: active ? G : "#6B7280", flexShrink: 0 }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "12px 20px", borderTop: "1px solid #E4E6EA" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "11px 14px", borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              background: "#FFF5F5", color: "#EF5350",
              border: "1.5px solid #FFCDD2",
              cursor: "pointer", transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#FFEBEE"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FFF5F5"; }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* ══════════════════════ DEV TOOLS ════════════════════════════ */}
      {isDevAllowed && devOpen && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </Suspense>
      )}

      {/* ══════════════════════ SPACER ═══════════════════════════════ */}
      <div style={{ height: NAVBAR_H, flexShrink: 0 }} />

      {/* ══════════════════════ STYLES ═══════════════════════════════ */}
      <style>{`
        .sf-desktop-nav  { display: flex !important; }
        .sf-desktop-only { display: flex !important; }
        .sf-mobile-only  { display: none  !important; }

        @media (max-width: 768px) {
          .sf-desktop-nav  { display: none  !important; }
          .sf-desktop-only { display: none  !important; }
          .sf-mobile-only  { display: flex  !important; }
        }

        .sf-desktop-nav::-webkit-scrollbar { display: none; }
        .sf-desktop-nav { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
