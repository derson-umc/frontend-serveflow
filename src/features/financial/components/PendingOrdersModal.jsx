import { useState } from "react";
import { palette } from "@styles/ds";
import { Modal } from "@shared/components/ui/Modal";
import { toast } from "@shared/components/feedback/Toast";
import { fmtBRL, fmtDateTime, PAYMENT_KEYS, PAYMENT_LABELS, TYPE_CFG } from "../constants";

export default function PendingOrdersModal({ open, onClose, orders, orderPayment, setOrderPayment, settleOrder, cancelOrder }) {
  const [cardErrors,    setCardErrors]    = useState({});
  const [confirmCancel, setConfirmCancel] = useState(null);

  const totalPending = (orders ?? []).reduce((s, o) => s + Number(o.totalValue ?? 0), 0);
  const count        = (orders ?? []).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth={680}
      title="Aguardando Pagamento"
      subtitle={`${count} ${count === 1 ? "pedido" : "pedidos"} · Total em aberto: ${fmtBRL(totalPending)}`}
    >
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {count === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: palette.textMuted, fontSize: 13 }}>
          Nenhum pedido aguardando pagamento.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(orders ?? []).map((order) => {
            const selected     = orderPayment[order.id] ?? "";
            const isSettling   = settleOrder.isPending && settleOrder.variables?.id  === order.id;
            const isCancelling = cancelOrder.isPending && cancelOrder.variables      === order.id;
            const cardErr      = cardErrors[order.id];
            const typeCfg      = TYPE_CFG[order.type] ?? { label: order.type ?? "—", bg: "#F3F4F6", color: "#374151", border: "#D1D5DB" };
            const items        = Array.isArray(order.items) ? order.items : [];

            return (
              <div key={order.id} style={{ border: `1px solid ${cardErr ? palette.redBorder : palette.border}`, borderRadius: 12, overflow: "hidden", background: palette.white, transition: "border-color 0.2s" }}>
                <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: palette.surface, borderBottom: `1px solid ${palette.border}` }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 6, background: typeCfg.bg, color: typeCfg.color, border: `1px solid ${typeCfg.border}` }}>
                    {typeCfg.label}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary, flex: 1 }}>{order.customerName || "—"}</span>
                  <span style={{ fontSize: 11, color: palette.textMuted, whiteSpace: "nowrap" }}>{fmtDateTime(order.createdAt)}</span>
                </div>

                <div style={{ padding: "10px 14px" }}>
                  {items.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
                      {items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: palette.textPrimary }}>
                            <span style={{ fontWeight: 700, color: palette.textMuted, marginRight: 5 }}>{item.quantity}×</span>
                            {item.productName}
                          </span>
                          <span style={{ color: palette.textMuted }}>{fmtBRL(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: palette.textMuted, marginBottom: 10 }}>Sem itens registrados</div>
                  )}

                  {cardErr && (
                    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", background: palette.redSurface, border: `1px solid ${palette.redBorder}`, borderRadius: 8, marginBottom: 10 }}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={palette.red} strokeWidth={2} style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span style={{ fontSize: 11, color: palette.red, fontWeight: 600 }}>{cardErr}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 8, borderTop: `1px solid ${palette.border}`, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: palette.green, marginRight: "auto" }}>
                      {fmtBRL(order.totalValue)}
                    </span>

                    {confirmCancel === order.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: palette.redSurface, border: `1px solid ${palette.redBorder}`, borderRadius: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: palette.red, fontWeight: 600, whiteSpace: "nowrap" }}>Confirmar cancelamento?</span>
                        <button
                          onClick={() => {
                            setConfirmCancel(null);
                            cancelOrder.mutate(order.id, {
                              onSuccess: () => toast.success("Pedido cancelado com sucesso!"),
                              onError: (e) => {
                                const status = e?.response?.status;
                                const msg = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? "Erro ao cancelar pedido.";
                                toast.error(status ? `(${status}) ${msg}` : msg);
                              },
                            });
                          }}
                          style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: palette.red, color: "#fff", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmCancel(null)}
                          style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: palette.surface, color: palette.textMuted, border: `1px solid ${palette.border}`, cursor: "pointer" }}
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancel(order.id)}
                        disabled={isCancelling || isSettling}
                        style={{ padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", background: palette.redSurface, color: palette.red, border: `1px solid ${palette.redBorder}`, cursor: isCancelling || isSettling ? "not-allowed" : "pointer", flexShrink: 0, opacity: isCancelling ? 0.6 : 1 }}
                      >
                        {isCancelling ? "Cancelando..." : "Cancelar Pedido"}
                      </button>
                    )}

                    <select
                      value={selected}
                      onChange={(e) => {
                        setOrderPayment((p) => ({ ...p, [order.id]: e.target.value }));
                        setCardErrors((p) => { const n = { ...p }; delete n[order.id]; return n; });
                      }}
                      disabled={isSettling || isCancelling}
                      style={{ padding: "7px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1.5px solid ${selected ? palette.green : palette.border}`, background: palette.white, color: palette.textPrimary, outline: "none", minWidth: 165 }}
                    >
                      <option value="">Forma de pagamento...</option>
                      {PAYMENT_KEYS.map((k) => (
                        <option key={k} value={k}>{PAYMENT_LABELS[k]}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        if (!selected) {
                          setCardErrors((p) => ({ ...p, [order.id]: "Selecione a forma de pagamento antes de confirmar." }));
                          return;
                        }
                        setCardErrors((p) => { const n = { ...p }; delete n[order.id]; return n; });
                        settleOrder.mutate({ id: order.id, paymentMethod: selected }, {
                          onError: (e) => {
                            const msg = e?.response?.data?.error ?? "Não foi possível confirmar o pagamento. Tente novamente.";
                            setCardErrors((p) => ({ ...p, [order.id]: msg }));
                          },
                        });
                      }}
                      disabled={isSettling || isCancelling || !selected}
                      style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", background: isSettling || !selected ? "#E0E0E0" : palette.green, color: isSettling || !selected ? palette.textMuted : palette.white, border: "none", cursor: isSettling || isCancelling || !selected ? "not-allowed" : "pointer", flexShrink: 0 }}
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
