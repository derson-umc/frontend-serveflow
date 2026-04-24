import { useEffect, useState } from "react";
import { api } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Estoque() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/estoque")
      .then((res) => setItems(res.data))
      .catch(() => setError("Erro ao carregar estoque."));
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen" style={{ background: "#080404" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 65% 25%, #1a0008 0%, #0d0204 40%, #080404 100%)",
        }}
      />
      <div
        className="absolute pointer-events-none animate-float-2"
        style={{
          width: 300, height: 300, bottom: "15%", right: "5%",
          background: "radial-gradient(circle, rgba(225,29,72,0.09) 0%, transparent 70%)",
          filter: "blur(40px)", borderRadius: "50%",
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
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#fff1f2" }}>
              Estoque
            </h1>
          </div>
          <p className="text-sm ml-4" style={{ color: "#6b2130" }}>
            Controle de ingredientes e suprimentos
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg"
            style={{
              background: "rgba(225,29,72,0.07)",
              border: "1px solid rgba(225,29,72,0.22)",
            }}
          >
            <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
          </div>
        )}

        {!error && items.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(225,29,72,0.08)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="#4a1525">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p style={{ color: "#6b2130" }}>Nenhum item encontrado.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="card-lift flex items-center justify-between px-5 py-4 rounded-xl animate-fade-in"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(225,29,72,0.1)",
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <span className="font-medium" style={{ color: "#fff1f2" }}>{item.nome}</span>
                <span
                  className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{
                    background: "rgba(225,29,72,0.12)",
                    color: "#f43f5e",
                  }}
                >
                  Qtd: {item.quantidade}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
