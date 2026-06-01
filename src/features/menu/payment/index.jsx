import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@shared/components/layout/Sidebar";
import { palette } from "@styles/ds";
import { METODOS } from "./constants";
import { formatEndereco } from "../utils/formatEndereco";

function IconBanknote({ size = 18 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconCreditCard({ size = 18 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
      <line x1="6" y1="14" x2="10" y2="14" />
    </svg>
  );
}
function IconQr({ size = 18 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3M19 14v3h-2M14 19h3" />
    </svg>
  );
}
function IconClock({ size = 18 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  );
}

const METHOD_ICONS = { dinheiro: IconBanknote, cartao: IconCreditCard, pix: IconQr, prazo: IconClock };

function InlineAlert({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background: palette.redSurface, border: `1px solid ${palette.redBorder}`, color: palette.red, borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
      {msg}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
      {children}
    </p>
  );
}

function escapeHtml(str) {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}


export default function Payment() {
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [prazoDias,       setPrazoDias]       = useState("");
  const [tipoVenda]    = useState(sessionStorage.getItem("tipoVenda") || "");
  const [detalhesVenda]= useState(JSON.parse(sessionStorage.getItem("detalhesVenda") || "{}"));
  const [itensVenda]   = useState(JSON.parse(sessionStorage.getItem("itensVenda")   || "[]"));
  const [totalVenda]   = useState(parseFloat(sessionStorage.getItem("totalVenda")   || "0"));
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

  const salvarVenda = () => {
    try {
      const ant = JSON.parse(sessionStorage.getItem("historicoVendas") || "[]");
      ant.push({
        id: Date.now(), data: new Date().toISOString(), dataFormatada: new Date().toLocaleString(),
        tipo: tipoVenda, detalhes: detalhesVenda,
        itens: itensVenda.map((i) => ({ id: i.id, nome: i.name, quantidade: i.quantity, precoUnitario: i.price, subtotal: i.price * i.quantity })),
        total: totalVenda,
        pagamento: { metodo: metodoPagamento, formaCartao: metodoPagamento === "cartao" ? formaCartao : null, parcelas: metodoPagamento === "cartao" && formaCartao === "credito" ? parcelas : null, prazoDias: metodoPagamento === "prazo" ? prazoDias : null, valorPago: metodoPagamento === "dinheiro" ? parseFloat(valorPago) : null, troco },
        status: "finalizado",
      });
      sessionStorage.setItem("historicoVendas", JSON.stringify(ant));
      return true;
    } catch { return false; }
  };

  const handleImprimir = () => {
    const lista = itensVenda.map((i) => `${escapeHtml(i.quantity)}x ${escapeHtml(i.name)} — R$ ${(i.price * i.quantity).toFixed(2)}`).join("\n");
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(
        `<html><head><title>Comprovante</title>` +
        `<style>body{font-family:'Courier New',monospace;padding:24px;background:white}pre{white-space:pre-wrap;font-size:13px}button{margin-top:16px;padding:10px 20px;width:100%;background:#2E7D32;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:bold}</style></head>` +
        `<body><pre>RESTAURANTE — COMPROVANTE\n${"═".repeat(36)}\n` +
        `Data: ${escapeHtml(new Date().toLocaleString())}\nTipo: ${escapeHtml(getTipoLabel())}\n\n${"─".repeat(36)}\nITENS:\n${lista}\n${"─".repeat(36)}\n\n` +
        `TOTAL: R$ ${escapeHtml(totalVenda.toFixed(2))}\nPAGAMENTO: ${escapeHtml(getMetodoLabel())}\n` +
        `${troco !== null ? `Troco: R$ ${escapeHtml(troco.toFixed(2))}` : ""}\n${"═".repeat(36)}\nObrigado!</pre>` +
        `<button onclick="window.print();window.close()">Imprimir</button></body></html>`
      );
      w.document.close();
    }
  };

  const handleFinalizar = () => {
    setFinalizarError("");
    if (!metodoPagamento)                                                               return setFinalizarError("Selecione um método de pagamento.");
    if (metodoPagamento === "dinheiro" && (!valorPago || parseFloat(valorPago) < totalVenda)) return setFinalizarError("Valor pago insuficiente.");
    if (metodoPagamento === "prazo"   && !prazoDias)                                   return setFinalizarError("Selecione o prazo em dias.");
    if (metodoPagamento === "cartao"  && !formaCartao)                                 return setFinalizarError("Selecione débito ou crédito.");
    if (!salvarVenda()) return setFinalizarError("Erro ao processar a venda. Tente novamente.");
    setVendaFinalizada(true);
    sessionStorage.removeItem("tipoVenda"); sessionStorage.removeItem("detalhesVenda");
    sessionStorage.removeItem("totalVenda"); sessionStorage.removeItem("itensVenda");
    setTimeout(() => setShowPrintDialog(true), 1200);
  };

  const handlePrintDecision = (imprimir) => {
    setShowPrintDialog(false);
    if (imprimir) handleImprimir();
    setTimeout(() => navigate("/menu", { state: { pedidoFechado: true } }), 400);
  };

  const getTipoLabel    = () => ({ comanda: "Comanda", delivery: "Delivery" }[tipoVenda] || "Pagamento Direto");
  const getMetodoLabel  = () => ({ dinheiro: "Dinheiro", pix: "PIX", cartao: `Cartão${formaCartao ? ` (${formaCartao})` : ""}`, prazo: `A Prazo (${prazoDias} dias)` }[metodoPagamento] || "");

  const fieldLabel = (lbl) => (
    <p style={{ fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{lbl}</p>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: palette.background }}>
      <Sidebar />

      <motion.div
        style={{ flex: 1, padding: "24px 28px" }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        {/* ── Cabeçalho ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 4, height: 28, borderRadius: 4, background: `linear-gradient(180deg, ${palette.orange}, ${palette.green})`, flexShrink: 0 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: palette.textPrimary, margin: 0 }}>Finalizar Pagamento</h1>
          </div>
          <p style={{ fontSize: 13, color: palette.textMuted, marginLeft: 16 }}>Confira os itens e escolha a forma de pagamento</p>
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* ── Painel esquerdo — Resumo ── */}
          <div style={{ flex: "0 0 360px", minWidth: 280, background: palette.white, borderRadius: 16, border: `1px solid ${palette.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "20px 24px" }}>
            <SectionLabel>Resumo do Pedido</SectionLabel>

            {/* Tipo / mesa / cliente */}
            <div style={{ background: palette.background, border: `1px solid ${palette.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: tipoVenda !== "pagamento" ? 6 : 0 }}>
                <span style={{ color: palette.textMuted }}>Tipo</span>
                <span style={{ fontWeight: 600, color: palette.orange }}>{getTipoLabel()}</span>
              </div>
              {tipoVenda === "comanda" && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ color: palette.textMuted, flexShrink: 0 }}>Mesa</span>
                  <span style={{ fontWeight: 600, color: palette.textSecondary, textAlign: "right" }}>
                    {detalhesVenda.nome || detalhesVenda.numero || "N/A"}
                  </span>
                </div>
              )}
              {tipoVenda === "delivery" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                    <span style={{ color: palette.textMuted, flexShrink: 0 }}>Cliente</span>
                    <span style={{ fontWeight: 600, color: palette.textSecondary, textAlign: "right" }}>
                      {detalhesVenda.nome || "N/A"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: palette.textMuted, flexShrink: 0 }}>Endereço</span>
                    <span style={{ fontWeight: 600, color: palette.textSecondary, textAlign: "right" }}>
                      {formatEndereco(detalhesVenda.numero) || "N/A"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Lista de itens */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 260, overflowY: "auto" }}>
              {itensVenda.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 10, padding: "10px 14px" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: palette.textSecondary, marginBottom: 2 }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: palette.textMuted }}>{item.quantity}x R$ {item.price.toFixed(2)}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: palette.orange, flexShrink: 0, marginLeft: 12 }}>
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: `1px solid ${palette.border}` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: palette.textSecondary }}>Total</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: palette.green }}>R$ {totalVenda.toFixed(2)}</span>
            </div>
          </div>

          {/* ── Painel direito — Pagamento ── */}
          <div style={{ flex: 1, minWidth: 280, background: palette.white, borderRadius: 16, border: `1px solid ${palette.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "20px 24px" }}>
            <SectionLabel>Método de Pagamento</SectionLabel>

            {/* Botões de método */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {METODOS.map(({ val, label, color, bg, border }) => {
                const Icon = METHOD_ICONS[val];
                const active = metodoPagamento === val;
                return (
                  <button
                    key={val}
                    onClick={() => { setMetodoPagamento(val); setValorPago(""); setTroco(null); setFormaCartao(""); setParcelas(1); setPrazoDias(""); setFinalizarError(""); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "13px 12px",
                      borderRadius: 10,
                      fontSize: 13, fontWeight: 600,
                      color: active ? color : palette.textMuted,
                      background: active ? bg : palette.surface,
                      border: `1.5px solid ${active ? border : palette.border}`,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Icon />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* ── Dinheiro ── */}
            {metodoPagamento === "dinheiro" && (
              <div style={{ background: palette.greenSurface, border: `1px solid ${palette.greenBorder}`, borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                {fieldLabel("Valor Recebido")}
                <input
                  type="number"
                  placeholder="0,00"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: palette.white, border: `1.5px solid ${palette.border}`, color: palette.textSecondary }}
                />
                {troco !== null && troco >= 0 && (
                  <div style={{ textAlign: "center", background: palette.white, borderRadius: 8, padding: "12px", marginTop: 10 }}>
                    <p style={{ fontSize: 11, color: palette.textMuted, marginBottom: 2 }}>Troco</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: palette.green }}>R$ {troco.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Cartão ── */}
            {metodoPagamento === "cartao" && (
              <div style={{ background: palette.blueSurface, border: `1px solid ${palette.blueBorder}`, borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                {fieldLabel("Forma")}
                <div style={{ display: "flex", gap: 8, marginBottom: formaCartao === "credito" ? 14 : 0 }}>
                  {["debito", "credito"].map((f) => (
                    <button key={f} onClick={() => { setFormaCartao(f); setParcelas(1); }}
                      style={{ flex: 1, padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: formaCartao === f ? palette.blue : palette.white, color: formaCartao === f ? palette.white : palette.textMuted, border: `1.5px solid ${formaCartao === f ? palette.blue : palette.border}` }}>
                      {f === "debito" ? "Débito" : "Crédito"}
                    </button>
                  ))}
                </div>
                {formaCartao === "credito" && (
                  <>
                    {fieldLabel("Parcelas")}
                    <select value={parcelas} onChange={(e) => setParcelas(parseInt(e.target.value))}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13, outline: "none", background: palette.white, border: `1.5px solid ${palette.border}`, color: palette.textSecondary }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <option key={n} value={n}>{n}x {n > 1 ? `R$ ${(totalVenda / n).toFixed(2)}/mês` : `(à vista R$ ${totalVenda.toFixed(2)})`}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            )}

            {/* ── PIX ── */}
            {metodoPagamento === "pix" && (
              <div style={{ background: "#F3E5F5", border: "1px solid #CE93D8", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: palette.white, display: "flex", alignItems: "center", justifyContent: "center", color: "#6A1B9A", flexShrink: 0 }}>
                    <IconQr size={26} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#6A1B9A", marginBottom: 3 }}>PIX Copia e Cola</p>
                    <p style={{ fontSize: 12, color: palette.textMuted, marginBottom: 2 }}>Chave: restaurante@email.com</p>
                    <p style={{ fontSize: 12, color: palette.textMuted }}>QR Code disponível no caixa</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── A Prazo ── */}
            {metodoPagamento === "prazo" && (
              <div style={{ background: palette.orangeSurface, border: `1px solid ${palette.orangeBorder}`, borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                {fieldLabel("Prazo")}
                <div style={{ display: "flex", gap: 8 }}>
                  {["30", "60", "90"].map((d) => (
                    <button key={d} onClick={() => setPrazoDias(d)}
                      style={{ flex: 1, padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: prazoDias === d ? palette.orange : palette.white, color: prazoDias === d ? palette.white : palette.textMuted, border: `1.5px solid ${prazoDias === d ? palette.orange : palette.border}` }}>
                      {d} dias
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmação */}
            {vendaFinalizada && (
              <div style={{ background: palette.greenSurface, border: `1px solid ${palette.greenBorder}`, color: palette.green, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, textAlign: "center", marginBottom: 14 }}>
                Pagamento confirmado com sucesso!
              </div>
            )}

            <InlineAlert msg={finalizarError} />

            {/* Finalizar */}
            <button
              onClick={handleFinalizar}
              disabled={vendaFinalizada}
              style={{
                width: "100%", padding: "14px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                border: "none", cursor: vendaFinalizada ? "default" : "pointer", marginBottom: 10,
                background: vendaFinalizada ? palette.greenSurface : palette.green,
                color: vendaFinalizada ? palette.green : palette.white,
                boxShadow: vendaFinalizada ? "none" : "0 4px 16px rgba(46,125,50,0.28)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!vendaFinalizada) e.currentTarget.style.background = palette.greenDark; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = vendaFinalizada ? palette.greenSurface : palette.green; }}
            >
              {vendaFinalizada ? "Venda Finalizada" : "Finalizar Pagamento"}
            </button>

            {/* Voltar */}
            <button
              onClick={() => navigate("/menu")}
              style={{ width: "100%", padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: palette.background, color: palette.textMuted, border: `1px solid ${palette.border}`, transition: "background 0.15s, color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = palette.border; e.currentTarget.style.color = palette.textSecondary; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = palette.background; e.currentTarget.style.color = palette.textMuted; }}
            >
              Voltar ao Menu
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Modal de impressão ── */}
      <AnimatePresence>
        {showPrintDialog && (
          <motion.div
            style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16, background: "rgba(0,0,0,0.48)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              style={{ width: "100%", maxWidth: 360, background: palette.white, borderRadius: 18, padding: 28, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: `1px solid ${palette.border}` }}
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            >
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: palette.greenSurface, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={palette.green} strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: palette.textPrimary, marginBottom: 6 }}>Venda Finalizada!</h3>
              <p style={{ fontSize: 13, color: palette.textMuted, marginBottom: 22 }}>Deseja imprimir o comprovante?</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => handlePrintDecision(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: palette.background, color: palette.textMuted, border: `1px solid ${palette.border}` }}>
                  Não
                </button>
                <button onClick={() => handlePrintDecision(true)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", background: palette.green, color: palette.white, border: "none", boxShadow: "0 4px 12px rgba(46,125,50,0.28)" }}>
                  Imprimir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
