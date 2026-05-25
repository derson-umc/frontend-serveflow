import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@shared/components/layout/Sidebar";
import { palette } from "@styles/ds";
import TabCashFlow from "./components/TabCashFlow";
import TabReceivables from "./components/TabReceivables";
import TabPayables from "./components/TabPayables";

const TABS = [
  {
    key: "fluxo",
    label: "Fluxo de Caixa",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    key: "receber",
    label: "Contas a Receber",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    key: "pagar",
    label: "Contas a Pagar",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
      </svg>
    ),
  },
];

const TAB_CONTENT = {
  fluxo:   <TabCashFlow />,
  receber: <TabReceivables />,
  pagar:   <TabPayables />,
};

export default function Financial() {
  const [tab, setTab] = useState("fluxo");

  return (
    <div className="flex flex-col min-h-screen" style={{ background: palette.background, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <Sidebar />

      <motion.div
        className="flex-1 p-6 pt-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 4, height: 28, borderRadius: 4, background: `linear-gradient(180deg, ${palette.orange}, ${palette.green})` }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: palette.textPrimary, margin: 0 }}>Financeiro</h1>
          </div>
          <p style={{ fontSize: 13, color: palette.textMuted, marginLeft: 16 }}>Contas a receber, contas a pagar e fluxo de caixa</p>
        </div>

        <div style={{ background: palette.white, borderRadius: 16, border: `1px solid ${palette.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${palette.border}`, overflowX: "auto" }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "13px 20px", fontSize: 13, fontWeight: 600,
                  color: tab === t.key ? palette.green : palette.textMuted,
                  background: "transparent", border: "none",
                  borderBottom: tab === t.key ? `2.5px solid ${palette.green}` : "2.5px solid transparent",
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  transition: "color 0.15s, border-bottom-color 0.15s",
                }}
                onMouseEnter={(e) => { if (tab !== t.key) e.currentTarget.style.color = palette.textPrimary; }}
                onMouseLeave={(e) => { if (tab !== t.key) e.currentTarget.style.color = palette.textMuted; }}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {TAB_CONTENT[tab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
