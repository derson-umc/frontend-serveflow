import { useEffect, useState } from "react";
import { api } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Pedido() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/pedidos/delivery")
      .then((res) => setOrders(res.data))
      .catch(() => setError("Erro ao carregar pedidos."));
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
        className="absolute pointer-events-none animate-float-3"
        style={{
          width: 350, height: 350, bottom: "10%", left: "-5%",
          background: "radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 70%)",
          filter: "blur(45px)", borderRadius: "50%",
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
              Pedidos
            </h1>
          </div>
          <p className="text-sm ml-4" style={{ color: "#6b2130" }}>
            Gerenciar pedidos de mesa
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

        {!error && orders.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(225,29,72,0.08)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="#4a1525">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p style={{ color: "#6b2130" }}>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((p, i) => (
              <div
                key={p.id}
                className="card-lift flex items-center justify-between px-5 py-4 rounded-xl animate-fade-in"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(225,29,72,0.1)",
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <span className="font-medium" style={{ color: "#fff1f2" }}>{p.nome}</span>
                <span className="font-semibold" style={{ color: "#f43f5e" }}>R$ {p.total}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
