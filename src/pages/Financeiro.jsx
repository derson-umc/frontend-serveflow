import { useEffect, useState } from "react";
import { api } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Financeiro() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/financeiro").then((res) => setEntries(res.data)).catch(() => setError("Erro ao carregar dados financeiros."));
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen" style={{ background: "#080503" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 60% at 65% 25%, #1a0a03 0%, #0d0603 40%, #080503 100%)" }} />
      <Sidebar />
      <div className="relative flex-1 p-8 page-enter">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(180deg, #f07040, #e46033)" }} />
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#fff1f2" }}>Financeiro</h1>
          </div>
          <p className="text-sm ml-4" style={{ color: "#7a3518" }}>Controle de entradas e caixa</p>
        </div>
        {error && <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg" style={{ background: "rgba(228,96,51,0.07)", border: "1px solid rgba(228,96,51,0.22)" }}><p className="text-sm" style={{ color: "#f87171" }}>{error}</p></div>}
        {!error && entries.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(228,96,51,0.08)" }}>
            <p style={{ color: "#7a3518" }}>Nenhuma entrada encontrada.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((l, i) => (
              <div key={l.id} className="flex items-center justify-between px-5 py-4 rounded-xl animate-fade-in" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(228,96,51,0.1)", animationDelay: `${i * 0.06}s` }}>
                <span className="font-medium" style={{ color: "#fff1f2" }}>{l.descricao}</span>
                <span className="font-semibold" style={{ color: "#4ade80" }}>R$ {l.valor}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}