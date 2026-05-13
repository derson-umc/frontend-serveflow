import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";

const G  = "#2E7D32";
const GD = "#1B5E20";
const GF = "#E8F5E9";
const O  = "#F57C00";
const OD = "#E65100";
const OF = "#FFF3E0";
const D  = "#424242";
const M  = "#757575";
const B  = "#E0E0E0";
const W  = "#FFFFFF";
const R  = "#C62828";

function InlineAlert({ msg }) {
  if (!msg) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl text-sm mb-4"
      style={{ background: "#FFEBEE", border: "1px solid #EF9A9A", color: R }}>
      {msg}
    </div>
  );
}

const METODOS = [
  { val: "dinheiro", label: "Dinheiro", emoji: "💵", color: G,  bg: GF, border: "#A5D6A7" },
  { val: "cartao",   label: "Cartão",   emoji: "💳", color: "#1565C0", bg: "#E3F2FD", border: "#90CAF9" },
  { val: "pix",      label: "PIX",      emoji: "📱", color: "#6A1B9A", bg: "#F3E5F5", border: "#CE93D8" },
  { val: "prazo",    label: "A Prazo",  emoji: "📅", color: O,  bg: OF, border: "#FFCC80" },
];

export default function Pagamento() {
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [prazoDias,       setPrazoDias]       = useState("");
  const [tipoVenda]       = useState(localStorage.getItem("tipoVenda") || "");
  const [detalhesVenda]   = useState(JSON.parse(localStorage.getItem("detalhesVenda") || "{}"));
  const [itensVenda]      = useState(JSON.parse(localStorage.getItem("itensVenda") || "[]"));
  const [totalVenda]      = useState(parseFloat(localStorage.getItem("totalVenda") || "0"));
  const [valorPago,       setValorPago]       = useState("");
  const [troco,           setTroco]           = useState(null);
  const [formaCartao,     setFormaCartao]     = useState("");
  const [parcelas,        setParcelas]        = useState(1);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [vendaFinalizada, setVendaFinalizada] = useState(false);
  const [finalizarError,  setFinalizarError]  = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (valorPago && metodoPagamento === "dinheiro") {
      const pago = parseFloat(valorPago);
      setTroco(!isNaN(pago) && pago >= totalVenda ? pago - totalVenda : null);
    }
  }, [valorPago, totalVenda, metodoPagamento]);

  const darBaixaEstoque = () => {
    try {
      const est = JSON.parse(localStorage.getItem("estoque") || "[]");
      const novo = [...est];
      itensVenda.forEach((item) => {
        const idx = novo.findIndex((p) => p.id === item.id);
        if (idx !== -1) novo[idx].quantidade = Math.max(0, novo[idx].quantidade - item.quantity);
      });
      localStorage.setItem("estoque", JSON.stringify(novo));
      return true;
    } catch { return false; }
  };

  const salvarVenda = () => {
    try {
      const ant = JSON.parse(localStorage.getItem("historicoVendas") || "[]");
      ant.push({
        id: Date.now(), data: new Date().toISOString(), dataFormatada: new Date().toLocaleString(),
        tipo: tipoVenda, detalhes: detalhesVenda,
        itens: itensVenda.map((i) => ({ id: i.id, nome: i.name, quantidade: i.quantity, precoUnitario: i.price, subtotal: i.price * i.quantity })),
        total: totalVenda,
        pagamento: { metodo: metodoPagamento, formaCartao: metodoPagamento === "cartao" ? formaCartao : null, parcelas: metodoPagamento === "cartao" && formaCartao === "credito" ? parcelas : null, prazoDias: metodoPagamento === "prazo" ? prazoDias : null, valorPago: metodoPagamento === "dinheiro" ? parseFloat(valorPago) : null, troco },
        status: "finalizado",
      });
      localStorage.setItem("historicoVendas", JSON.stringify(ant));
      return true;
    } catch { return false; }
  };

  const handleImprimir = () => {
    const lista = itensVenda.map((i) => `${i.quantity}x ${i.name} — R$ ${(i.price * i.quantity).toFixed(2)}`).join("\n");
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<html><head><title>Comprovante</title><style>body{font-family:'Courier New',monospace;padding:24px;background:white}pre{white-space:pre-wrap;font-size:13px}button{margin-top:16px;padding:10px 20px;width:100%;background:#2E7D32;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:bold}</style></head><body><pre>RESTAURANTE — COMPROVANTE\n${"═".repeat(36)}\nData: ${new Date().toLocaleString()}\nTipo: ${getTipoLabel()}\n\n${"─".repeat(36)}\nITENS:\n${lista}\n${"─".repeat(36)}\n\nTOTAL: R$ ${totalVenda.toFixed(2)}\nPAGAMENTO: ${getMetodoLabel()}\n${troco !== null ? `Troco: R$ ${troco.toFixed(2)}` : ""}\n${"═".repeat(36)}\nObrigado!</pre><button onclick="window.print();window.close()">🖨️ Imprimir</button></body></html>`);
      w.document.close();
    }
  };

  const handleFinalizar = () => {
    setFinalizarError("");
    if (!metodoPagamento) return setFinalizarError("Selecione um método de pagamento.");
    if (metodoPagamento === "dinheiro" && (!valorPago || parseFloat(valorPago) < totalVenda)) return setFinalizarError("Valor pago insuficiente.");
    if (metodoPagamento === "prazo" && !prazoDias) return setFinalizarError("Selecione o prazo em dias.");
    if (metodoPagamento === "cartao" && !formaCartao) return setFinalizarError("Selecione débito ou crédito.");
    if (!darBaixaEstoque() || !salvarVenda()) return setFinalizarError("Erro ao processar a venda. Tente novamente.");
    setVendaFinalizada(true);
    localStorage.removeItem("tipoVenda"); localStorage.removeItem("detalhesVenda");
    localStorage.removeItem("totalVenda"); localStorage.removeItem("carrinho"); localStorage.removeItem("itensVenda");
    setTimeout(() => setShowPrintDialog(true), 1200);
  };

  const handlePrintDecision = (imprimir) => {
    setShowPrintDialog(false);
    if (imprimir) handleImprimir();
    setTimeout(() => navigate("/menu", { state: { pedidoFechado: true } }), 400);
  };

  const getTipoLabel  = () => ({ comanda: "Comanda", delivery: "Delivery" }[tipoVenda] || "Pagamento Direto");
  const getMetodoLabel = () => ({ dinheiro: "Dinheiro", pix: "PIX", cartao: `Cartão${formaCartao ? ` (${formaCartao})` : ""}`, prazo: `A Prazo (${prazoDias} dias)` }[metodoPagamento] || "");

  const field = (lbl, content) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: M }}>{lbl}</label>
      {content}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F5F5F5" }}>
      <Sidebar />

      <motion.div className="flex-1 p-6 pt-4"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${O}, ${G})` }} />
            <h1 className="text-2xl font-bold" style={{ color: D }}>Finalizar Pagamento</h1>
          </div>
          <p className="text-sm ml-4" style={{ color: M }}>Confira os itens e escolha a forma de pagamento</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Resumo */}
          <div className="lg:w-[38%] rounded-2xl p-5"
            style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: M }}>Resumo do Pedido</p>

            <div className="rounded-xl px-4 py-3 mb-4 text-sm"
              style={{ background: "#F5F5F5", border: `1px solid ${B}` }}>
              <div className="flex justify-between mb-1">
                <span style={{ color: M }}>Tipo</span>
                <span className="font-semibold" style={{ color: O }}>{getTipoLabel()}</span>
              </div>
              {tipoVenda === "comanda" && (
                <div className="flex justify-between">
                  <span style={{ color: M }}>Mesa</span>
                  <span className="font-semibold" style={{ color: D }}>{detalhesVenda.nome || detalhesVenda.numero || "N/A"}</span>
                </div>
              )}
              {tipoVenda === "delivery" && <>
                <div className="flex justify-between mb-1"><span style={{ color: M }}>Cliente</span><span className="font-semibold" style={{ color: D }}>{detalhesVenda.nome || "N/A"}</span></div>
                <div className="flex justify-between"><span style={{ color: M }}>Endereço</span><span className="font-semibold" style={{ color: D }}>{detalhesVenda.numero || "N/A"}</span></div>
              </>}
            </div>

            <div className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto">
              {itensVenda.map((item, i) => (
                <div key={i} className="flex justify-between items-center px-3 py-2.5 rounded-xl"
                  style={{ background: "#FAFAFA", border: `1px solid ${B}` }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: D }}>{item.name}</p>
                    <p className="text-xs" style={{ color: M }}>{item.quantity}x R$ {item.price.toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: O }}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3" style={{ borderTop: `1px solid ${B}` }}>
              <span className="font-bold" style={{ color: D }}>Total</span>
              <span className="text-2xl font-black" style={{ color: G }}>R$ {totalVenda.toFixed(2)}</span>
            </div>
          </div>

          {/* Pagamento */}
          <div className="flex-1 rounded-2xl p-5"
            style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: M }}>Método de Pagamento</p>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {METODOS.map(({ val, label, emoji, color, bg, border }) => (
                <button key={val}
                  onClick={() => { setMetodoPagamento(val); setValorPago(""); setTroco(null); setFormaCartao(""); setParcelas(1); setPrazoDias(""); setFinalizarError(""); }}
                  className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: metodoPagamento === val ? bg : "#FAFAFA",
                    color: metodoPagamento === val ? color : M,
                    border: `1.5px solid ${metodoPagamento === val ? border : B}`,
                  }}>
                  <span>{emoji}</span>{label}
                </button>
              ))}
            </div>

            {metodoPagamento === "dinheiro" && (
              <div className="rounded-xl p-4 mb-4" style={{ background: GF, border: `1px solid #A5D6A7` }}>
                {field("Valor Recebido",
                  <input type="number" placeholder="0,00" value={valorPago} onChange={(e) => setValorPago(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: W, border: `1.5px solid ${B}`, color: D }} />
                )}
                {troco !== null && troco >= 0 && (
                  <div className="text-center rounded-xl py-3 mt-2" style={{ background: W }}>
                    <p className="text-xs mb-1" style={{ color: M }}>Troco</p>
                    <p className="text-xl font-bold" style={{ color: G }}>R$ {troco.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}

            {metodoPagamento === "cartao" && (
              <div className="rounded-xl p-4 mb-4" style={{ background: "#E3F2FD", border: "1px solid #90CAF9" }}>
                {field("Forma",
                  <div className="flex gap-2">
                    {["debito","credito"].map((f) => (
                      <button key={f} onClick={() => { setFormaCartao(f); setParcelas(1); }}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                        style={{ background: formaCartao === f ? "#1565C0" : W, color: formaCartao === f ? W : M, border: `1.5px solid ${formaCartao === f ? "#1565C0" : B}` }}>
                        {f === "debito" ? "Débito" : "Crédito"}
                      </button>
                    ))}
                  </div>
                )}
                {formaCartao === "credito" && field("Parcelas",
                  <select value={parcelas} onChange={(e) => setParcelas(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: W, border: `1.5px solid ${B}`, color: D }}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => (
                      <option key={n} value={n}>{n}x {n > 1 ? `R$ ${(totalVenda/n).toFixed(2)}/mês` : `(à vista R$ ${totalVenda.toFixed(2)})`}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {metodoPagamento === "pix" && (
              <div className="rounded-xl p-4 mb-4 text-center" style={{ background: "#F3E5F5", border: "1px solid #CE93D8" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3" style={{ background: W }}>📱</div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#6A1B9A" }}>PIX Copia e Cola</p>
                <p className="text-xs" style={{ color: M }}>Chave: restaurante@email.com</p>
                <p className="text-xs mt-1" style={{ color: M }}>QR Code disponível no caixa</p>
              </div>
            )}

            {metodoPagamento === "prazo" && (
              <div className="rounded-xl p-4 mb-4" style={{ background: OF, border: "1px solid #FFCC80" }}>
                {field("Prazo",
                  <div className="flex gap-2">
                    {["30","60","90"].map((d) => (
                      <button key={d} onClick={() => setPrazoDias(d)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: prazoDias === d ? O : W, color: prazoDias === d ? W : M, border: `1.5px solid ${prazoDias === d ? O : B}` }}>
                        {d} dias
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {vendaFinalizada && (
              <div className="rounded-xl px-4 py-3 mb-4 text-center text-sm font-semibold"
                style={{ background: GF, border: "1px solid #A5D6A7", color: G }}>
                ✓ Pagamento confirmado com sucesso!
              </div>
            )}

            <InlineAlert msg={finalizarError} />

            <button onClick={handleFinalizar} disabled={vendaFinalizada}
              className="w-full py-3 rounded-xl text-sm font-bold mb-3 transition-all"
              style={{
                background: vendaFinalizada ? GF : G,
                color: vendaFinalizada ? G : W, border: "none",
                boxShadow: vendaFinalizada ? "none" : "0 4px 16px rgba(46,125,50,0.3)",
              }}
              onMouseEnter={(e) => { if (!vendaFinalizada) e.currentTarget.style.background = GD; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = vendaFinalizada ? GF : G; }}>
              {vendaFinalizada ? "✓ Venda Finalizada" : "Finalizar Pagamento"}
            </button>

            <button onClick={() => navigate("/menu")}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "#F5F5F5", color: M, border: `1px solid ${B}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = B; e.currentTarget.style.color = D; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#F5F5F5"; e.currentTarget.style.color = M; }}>
              ← Voltar ao Menu
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPrintDialog && (
          <motion.div className="fixed inset-0 flex items-center justify-center z-50 px-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: W, border: `1px solid ${B}`, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: GF }}>✓</div>
              <h3 className="text-xl font-bold mb-1" style={{ color: D }}>Venda Finalizada!</h3>
              <p className="text-sm mb-5" style={{ color: M }}>Deseja imprimir o comprovante?</p>
              <div className="flex gap-3">
                <button onClick={() => handlePrintDecision(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#F5F5F5", color: M, border: `1px solid ${B}` }}>
                  Não
                </button>
                <button onClick={() => handlePrintDecision(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: G, color: W, border: "none", boxShadow: "0 4px 12px rgba(46,125,50,0.3)" }}>
                  🖨️ Imprimir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
