// Pagamento.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/Sidebar";

export default function Pagamento() {
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [prazoDias, setPrazoDias] = useState("");
  const [tipoVenda, _setTipoVenda] = useState(localStorage.getItem("tipoVenda") || "");
  const [detalhesVenda, _setDetalhesVenda] = useState(JSON.parse(localStorage.getItem("detalhesVenda") || "{}"));
  const [totalVenda, _setTotalVenda] = useState(parseFloat(localStorage.getItem("totalVenda") || "0"));
  const navigate = useNavigate();

  const handleFinalizar = () => {
    if (!metodoPagamento) {
      alert("Selecione um método de pagamento.");
      return;
    }
    if (metodoPagamento === "prazo" && !prazoDias) {
      alert("Selecione o prazo em dias.");
      return;
    }
    // Lógica para finalizar pagamento
    alert(`Pagamento finalizado via ${metodoPagamento}${metodoPagamento === "prazo" ? ` em ${prazoDias} dias` : ""}!`);
    localStorage.removeItem("tipoVenda");
    localStorage.removeItem("detalhesVenda");
    localStorage.removeItem("totalVenda");
    navigate("/menu", { state: { pedidoFechado: true } });
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "#080503" }}>
      <div
        className="position-absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 65% 25%, #1a0a03 0%, #0d0603 40%, #080503 100%)",
          pointerEvents: "none",
        }}
      />
      <Sidebar />
      <div className="relative flex-1 p-5 page-enter">
        <div className="mb-5">
          <div className="d-flex align-items-center gap-3 mb-1">
            <div
              className="w-1 h-7 rounded"
              style={{ background: "linear-gradient(180deg, #f07040, #e46033)" }}
            />
            <h1 className="display-4 font-weight-bold tracking-tight" style={{ color: "#fff1f2" }}>
              Pagamento
            </h1>
          </div>
          <p className="ml-4 small" style={{ color: "#7a3518" }}>
            Finalizar pagamento do pedido
          </p>
        </div>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div
                className="card shadow-sm mb-4"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(228,96,51,0.08)",
                }}
              >
                <div className="card-body">
                  <h5 className="card-title mb-4" style={{ color: "#fff1f2" }}>Resumo do Pedido</h5>
                  <p style={{ color: "#7a3518" }}>Tipo: {tipoVenda === "comanda" ? "Comanda" : tipoVenda === "delivery" ? "Delivery" : "Pagamento Direto"}</p>
                  {tipoVenda === "comanda" && (
                    <p style={{ color: "#7a3518" }}>Mesa: {detalhesVenda.nome || detalhesVenda.numero}</p>
                  )}
                  {tipoVenda === "delivery" && (
                    <>
                      <p style={{ color: "#7a3518" }}>Cliente: {detalhesVenda.nome}</p>
                      <p style={{ color: "#7a3518" }}>Endereço: {detalhesVenda.numero}</p>
                    </>
                  )}
                  <p style={{ color: "#7a3518" }}>Total: R$ {totalVenda.toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small font-weight-semibold" style={{ color: "#fff1f2" }}>Método de Pagamento</label>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className={`btn ${metodoPagamento === "dinheiro" ? "" : "btn-outline-secondary"}`}
                    style={metodoPagamento === "dinheiro" ? { background: "linear-gradient(180deg, #f07040, #e46033)", border: "none", color: "#fff1f2" } : { borderColor: "#f07040", color: "#f07040" }}
                    onClick={() => setMetodoPagamento("dinheiro")}
                  >
                    Dinheiro
                  </button>
                  <button
                    className={`btn ${metodoPagamento === "cartao" ? "" : "btn-outline-secondary"}`}
                    style={metodoPagamento === "cartao" ? { background: "linear-gradient(180deg, #f07040, #e46033)", border: "none", color: "#fff1f2" } : { borderColor: "#f07040", color: "#f07040" }}
                    onClick={() => setMetodoPagamento("cartao")}
                  >
                    Cartão
                  </button>
                  <button
                    className={`btn ${metodoPagamento === "pix" ? "" : "btn-outline-secondary"}`}
                    style={metodoPagamento === "pix" ? { background: "linear-gradient(180deg, #f07040, #e46033)", border: "none", color: "#fff1f2" } : { borderColor: "#f07040", color: "#f07040" }}
                    onClick={() => setMetodoPagamento("pix")}
                  >
                    PIX
                  </button>
                  <button
                    className={`btn ${metodoPagamento === "prazo" ? "" : "btn-outline-secondary"}`}
                    style={metodoPagamento === "prazo" ? { background: "linear-gradient(180deg, #f07040, #e46033)", border: "none", color: "#fff1f2" } : { borderColor: "#f07040", color: "#f07040" }}
                    onClick={() => setMetodoPagamento("prazo")}
                  >
                    A Prazo
                  </button>
                </div>
                {metodoPagamento === "prazo" && (
                  <div className="mt-3">
                    <label className="form-label small font-weight-semibold" style={{ color: "#fff1f2" }}>Prazo (dias)</label>
                    <select
                      className="form-select"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(228,96,51,0.2)",
                        color: "#fff1f2",
                      }}
                      value={prazoDias}
                      onChange={(e) => setPrazoDias(e.target.value)}
                    >
                      <option value="" style={{ background: "#080503", color: "#fff1f2" }}>Selecione</option>
                      <option value="30" style={{ background: "#080503", color: "#fff1f2" }}>30 dias</option>
                      <option value="60" style={{ background: "#080503", color: "#fff1f2" }}>60 dias</option>
                      <option value="90" style={{ background: "#080503", color: "#fff1f2" }}>90 dias</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                className="btn btn-lg w-100 text-white font-weight-semibold"
                style={{ background: "linear-gradient(180deg, #f07040, #e46033)", border: "none" }}
                onClick={handleFinalizar}
                disabled={!metodoPagamento || (metodoPagamento === "prazo" && !prazoDias)}
              >
                Finalizar Pagamento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}