import { useState } from "react";
import { palette } from "@styles/ds";
import { Modal } from "@shared/components/ui/Modal";
import { toast } from "@shared/components/feedback/Toast";
import { fmtBRL, fmtDateTime, PAYMENT_KEYS, PAYMENT_LABELS, TYPE_CFG } from "../constants";

function elapsed(createdAt) {
  if (!createdAt) return null;
  try {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (diff < 1)  return "agora";
    if (diff < 60) return `${diff} min`;
    return `${Math.floor(diff / 60)}h${diff % 60 > 0 ? ` ${diff % 60}m` : ""}`;
  } catch { return null; }
}

function elapsedColor(createdAt) {
  if (!createdAt) return palette.textMuted;
  try {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (diff >= 30) return "#b91c1c";
    if (diff >= 15) return "#c2410c";
    return "#15803d";
  } catch { return palette.textMuted; }
}

export default function PendingOrdersModal({
  open, onClose,
  orders, orderPayment, setOrderPayment,
  settleOrder, cancelOrder,
}) {
  const [cardErrors,    setCardErrors]    = useState({});
  const [confirmCancel, setConfirmCancel] = useState(null);

  const totalPending = (orders ?? []).reduce((s, o) => s + Number(o.totalValue ?? 0), 0);
  const count        = (orders ?? []).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth={700}
      title="Aguardando Pagamento"
      subtitle={`${count} ${count === 1 ? "pedido" : "pedidos"} · Total em aberto: ${fmtBRL(totalPending)}`}
    >
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {count === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px",
            background: "#F1F5F1", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#90A4AE" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: palette.textMuted }}>Nenhum pedido aguardando pagamento</p>
          <p style={{ fontSize: 12, color: palette.textMuted, marginTop: 4 }}>Quando o garçom fechar uma conta, ela aparecerá aqui.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(orders ?? []).map((order) => {
            const selected     = orderPayment[order.id] ?? "";
            const isSettling   = settleOrder.isPending && settleOrder.variables?.id === order.id;
            const isCancelling = cancelOrder.isPending && cancelOrder.variables     === order.id;
            const cardErr      = cardErrors[order.id];
            const typeCfg      = TYPE_CFG[order.type] ?? { label: order.type ?? "—", bg: "#F3F4F6", color: "#374151", border: "#D1D5DB" };
            const items        = Array.isArray(order.items) ? order.items : [];
            const wait         = elapsed(order.createdAt);
            const waitColor    = elapsedColor(order.createdAt);

            return (
              <div
                key={order.id}
                style={{
                  border: `1.5px solid ${cardErr ? palette.redBorder : palette.border}`,
                  borderRadius: 14, overflow: "hidden",
                  background: palette.white,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Cabeçalho do card */}
                <div style={{
                  padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 10,
                  background: "#FAFAFA",
                  borderBottom: `1px solid ${palette.border}`,
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 6,
                    background: typeCfg.bg, color: typeCfg.color, border: `1px solid ${typeCfg.border}`,
                    flexShrink: 0,
                  }}>
                    {typeCfg.label}
                  </span>

                  <span style={{ fontSize: 14, fontWeight: 800, color: palette.textPrimary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.customerName || "—"}
                  </span>

                  {/* Tempo de espera */}
                  {wait && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: waitColor, flexShrink: 0 }}>
                      ⏱ {wait}
                    </span>
                  )}

                  <span style={{ fontSize: 11, color: palette.textMuted, flexShrink: 0, whiteSpace: "nowrap" }}>
                    {fmtDateTime(order.createdAt)}
                  </span>
                </div>

                {/* Itens do pedido */}
                <div style={{ padding: "12px 14px" }}>
                  {items.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                      {items.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 4,
                            background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB",
                            flexShrink: 0,
                          }}>
                            {item.quantity}×
                          </span>
                          <span style={{ fontSize: 13, color: palette.textPrimary, flex: 1 }}>
                            {item.productName}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: palette.textMuted, flexShrink: 0 }}>
                            {fmtBRL(item.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 11, color: palette.textMuted, marginBottom: 12 }}>Sem itens registrados</p>
                  )}

                  {/* Alerta de erro */}
                  {cardErr && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "7px 10px", marginBottom: 10,
                      background: palette.redSurface, border: `1px solid ${palette.redBorder}`,
                      borderRadius: 8,
                    }}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={palette.red} strokeWidth={2} style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span style={{ fontSize: 11, color: palette.red, fontWeight: 600 }}>{cardErr}</span>
                    </div>
                  )}

                  {/* Rodapé: total + ações */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    paddingTop: 10, borderTop: `1px solid ${palette.border}`,
                    flexWrap: "wrap",
                  }}>
                    {/* Total */}
                    <span style={{ fontSize: 18, fontWeight: 900, color: palette.green, marginRight: "auto" }}>
                      {fmtBRL(order.totalValue)}
                    </span>

                    {/* Cancelar (com confirmação) */}
                    {confirmCancel === order.id ? (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 10px", background: palette.redSurface,
                        border: `1px solid ${palette.redBorder}`, borderRadius: 8, flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 11, color: palette.red, fontWeight: 600, whiteSpace: "nowrap" }}>
                          Confirmar cancelamento?
                        </span>
                        <button
                          onClick={() => {
                            setConfirmCancel(null);
                            cancelOrder.mutate(order.id, {
                              onSuccess: () => toast.success("Pedido cancelado!"),
                              onError: (e) => {
                                const msg = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? "Erro ao cancelar pedido.";
                                toast.error(msg);
                              },
                            });
                          }}
                          style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: palette.red, color: "#fff", border: "none", cursor: "pointer" }}
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmCancel(null)}
                          style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "#fff", color: palette.textMuted, border: `1px solid ${palette.border}`, cursor: "pointer" }}
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancel(order.id)}
                        disabled={isCancelling || isSettling}
                        style={{
                          padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                          whiteSpace: "nowrap", background: palette.redSurface,
                          color: palette.red, border: `1px solid ${palette.redBorder}`,
                          cursor: isCancelling || isSettling ? "not-allowed" : "pointer",
                          flexShrink: 0, opacity: isCancelling ? 0.6 : 1,
                        }}
                      >
                        {isCancelling ? "Cancelando..." : "Cancelar"}
                      </button>
                    )}

                    {/* Forma de pagamento */}
                    <select
                      value={selected}
                      onChange={(e) => {
                        setOrderPayment((p) => ({ ...p, [order.id]: e.target.value }));
                        setCardErrors((p) => { const n = { ...p }; delete n[order.id]; return n; });
                      }}
                      disabled={isSettling || isCancelling}
                      style={{
                        padding: "7px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: `1.5px solid ${selected ? palette.green : palette.border}`,
                        background: palette.white, color: palette.textPrimary,
                        outline: "none", minWidth: 170, cursor: "pointer",
                      }}
                    >
                      <option value="">Forma de pagamento…</option>
                      {PAYMENT_KEYS.map((k) => (
                        <option key={k} value={k}>{PAYMENT_LABELS[k]}</option>
                      ))}
                    </select>

                    {/* Confirmar pagamento */}
                    <button
                      onClick={() => {
                        if (!selected) {
                          setCardErrors((p) => ({ ...p, [order.id]: "Selecione a forma de pagamento antes de confirmar." }));
                          return;
                        }
                        setCardErrors((p) => { const n = { ...p }; delete n[order.id]; return n; });
                        settleOrder.mutate({ id: order.id, paymentMethod: selected }, {
                          onError: (e) => {
                            const msg = e?.response?.data?.error ?? "Não foi possível confirmar o pagamento.";
                            setCardErrors((p) => ({ ...p, [order.id]: msg }));
                          },
                        });
                      }}
                      disabled={isSettling || isCancelling || !selected}
                      style={{
                        padding: "7px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                        whiteSpace: "nowrap", border: "none", flexShrink: 0,
                        background: isSettling || !selected ? "#E0E0E0" : palette.green,
                        color: isSettling || !selected ? palette.textMuted : palette.white,
                        cursor: isSettling || isCancelling || !selected ? "not-allowed" : "pointer",
                        boxShadow: !isSettling && selected ? "0 2px 6px rgba(46,125,50,0.3)" : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      {isSettling ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animation: "spin 0.8s linear infinite" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Confirmando...
                        </span>
                      ) : "Confirmar Pagamento"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
