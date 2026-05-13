import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import Sidebar from "../components/Sidebar";

const G = "#2E7D32";
const O = "#F57C00";
const D = "#424242";
const M = "#757575";
const B = "#E0E0E0";
const W = "#FFFFFF";

export default function Financeiro() {
  const [entries, setEntries] = useState([]);
  const [error, setError]     = useState("");

  useEffect(() => {
    api.get("/financeiro")
      .then((res) => setEntries(res.data))
      .catch(() => setError("Erro ao carregar dados financeiros."));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-screen" style={{ background: "#F5F5F5" }}>
      <Sidebar />

      <div className="flex-1 p-6 pt-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${O}, ${G})` }} />
            <h1 className="text-2xl font-bold" style={{ color: D }}>Financeiro</h1>
          </div>
          <p className="text-sm ml-4" style={{ color: M }}>Controle de entradas e caixa</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "#FFEBEE", border: "1px solid #EF9A9A", color: "#C62828" }}>
            {error}
          </div>
        )}

        {!error && entries.length === 0 ? (
          <div className="rounded-2xl p-16 text-center"
            style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <span style={{ fontSize: 48 }}>💰</span>
            <p className="mt-4 font-semibold" style={{ color: D }}>Nenhuma entrada encontrada.</p>
            <p className="text-sm mt-1" style={{ color: M }}>As entradas financeiras aparecerão aqui.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${B}` }}>
              <p className="text-sm font-bold" style={{ color: D }}>Entradas</p>
            </div>
            <div className="divide-y" style={{ borderColor: B }}>
              {entries.map((l, i) => (
                <motion.div key={l.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-5 py-4"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "#E8F5E9" }}>💵</div>
                    <span className="font-medium text-sm" style={{ color: D }}>{l.descricao}</span>
                  </div>
                  <span className="font-bold text-sm" style={{ color: G }}>R$ {l.valor}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
