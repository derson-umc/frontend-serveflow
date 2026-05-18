import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { kdsApi } from "../services/api/kds";
import { ordersApi } from "../services/api/orders";
import { stockApi } from "../services/api/stock";
import { useKdsSocket } from "../hooks/useKdsSocket";
import { toast } from "../components/ui/Toast";

/* ── paleta do sistema ───────────────────────────────────────────────────────── */
const GREEN      = "#2E7D32";
const GREEN_DARK = "#1B5E20";
const GREEN_FILL = "#E8F5E9";
const WHITE      = "#FFFFFF";
const BG         = "#F5F5F5";
const BORDER     = "#E0E0E0";
const DARK       = "#424242";
const MID        = "#757575";
const LIGHT      = "#9E9E9E";
const RED        = "#C62828";
const RED_FILL   = "#FFEBEE";
const ORANGE     = "#F57C00";
const BLUE       = "#1565C0";
const TEAL       = "#00838F";

/* ── status config ─────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  CREATED:          { label: "NOVO",          bg: BLUE },
  CONFIRMED:        { label: "CONFIRMADO",     bg: "#6A1B9A" },
  IN_PREPARATION:   { label: "EM PREPARO",     bg: ORANGE },
  READY:            { label: "PRONTO",         bg: GREEN },
  OUT_FOR_DELIVERY: { label: "A CAMINHO",      bg: TEAL },
  DELIVERED:        { label: "ENTREGUE",       bg: "#4E342E" },
  CANCELLED:        { label: "CANCELADO",      bg: RED },
};

/* ── wait-time colour ───────────────────────────────────────────────────────── */
function waitColor(createdAt) {
  const m = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (m >= 15) return RED;
  if (m >= 10) return ORANGE;
  if (m >= 5)  return "#F9A825";
  return GREEN;
}

function waitMinutes(createdAt) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function useElapsed(createdAt) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const s   = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
}

const CANCEL_REASONS = [
  "Sem ingrediente",
  "Produto em falta",
  "Solicitação do cliente",
  "Preparo não possível",
  "Item indisponível hoje",
  "Outro",
];

/* ── confirm cancel order modal ─────────────────────────────────────────────── */
function ConfirmCancelModal({ order, loading, onConfirm, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        style={{
          background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 24,
          maxWidth: 360, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: RED_FILL,
            border: `1px solid #EF9A9A`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 22,
          }}>⚠</div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: DARK, margin: 0 }}>Cancelar Pedido?</p>
            <p style={{ fontSize: 12, color: MID, margin: 0 }}>O estoque será restaurado automaticamente</p>
          </div>
        </div>

        <div style={{
          background: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
          padding: "10px 14px", marginBottom: 20,
        }}>
          <p style={{ fontSize: 13, color: DARK, margin: "0 0 4px" }}>
            <span style={{ color: GREEN, fontWeight: 700 }}>
              #{String(order.id).slice(-6).toUpperCase()}
            </span>
            {" — "}{order.customerName}
          </p>
          <p style={{ fontSize: 12, color: MID, margin: 0 }}>
            {order.items.length} {order.items.length === 1 ? "item" : "itens"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 10,
              border: `1px solid ${BORDER}`, background: BG,
              color: MID, fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>
            Manter Pedido
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
              background: RED, color: WHITE, fontWeight: 800, fontSize: 13,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.65 : 1,
            }}>
            {loading ? "Cancelando…" : "Sim, Cancelar"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── cancel item modal ──────────────────────────────────────────────────────── */
function CancelItemModal({ item, onConfirm, onClose }) {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        style={{
          background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 24,
          maxWidth: 340, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontWeight: 800, fontSize: 14, color: DARK, margin: "0 0 4px" }}>
          Marcar como Indisponível
        </p>
        <p style={{ fontSize: 12, color: MID, margin: "0 0 18px" }}>
          <span style={{ color: GREEN, fontWeight: 700 }}>
            {item.quantity}× {item.productName}
          </span>
        </p>

        <p style={{ fontSize: 10, color: LIGHT, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Motivo
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {CANCEL_REASONS.map((r) => (
            <button key={r} onClick={() => setReason(r)}
              style={{
                padding: "9px 12px", borderRadius: 8, textAlign: "left",
                border: reason === r ? `1.5px solid ${RED}` : `1px solid ${BORDER}`,
                background: reason === r ? RED_FILL : BG,
                color: reason === r ? RED : DARK,
                fontSize: 13, cursor: "pointer", fontWeight: reason === r ? 700 : 400,
                transition: "all 0.12s",
              }}>
              {r}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              border: `1px solid ${BORDER}`, background: BG,
              color: MID, fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>
            Voltar
          </button>
          <button onClick={() => onConfirm(reason)}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
              background: RED, color: WHITE, fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── item row ───────────────────────────────────────────────────────────────── */
function ItemRow({ item, cancelled, onCancelRequest }) {
  const [checked, setChecked] = useState(false);
  const isCancelled = !!cancelled;

  return (
    <motion.div
      animate={{
        background: isCancelled ? RED_FILL : checked ? GREEN_FILL : BG,
        borderColor: isCancelled ? "#EF9A9A" : checked ? "#A5D6A7" : BORDER,
      }}
      transition={{ duration: 0.18 }}
      style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "7px 10px", marginBottom: 5 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        {isCancelled ? (
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1, color: RED }}>⊗</span>
        ) : (
          <input
            type="checkbox" checked={checked}
            onChange={() => setChecked((v) => !v)}
            style={{ marginTop: 3, accentColor: GREEN, width: 15, height: 15, flexShrink: 0, cursor: "pointer" }}
          />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontWeight: 700, fontSize: 14,
            color: isCancelled ? LIGHT : checked ? LIGHT : "#212121",
            textDecoration: (isCancelled || checked) ? "line-through" : "none",
          }}>
            {item.quantity}× {item.productName}
          </span>

          {isCancelled && (
            <p style={{ fontSize: 11, color: RED, margin: "3px 0 0", fontStyle: "italic" }}>
              Indisponível: {cancelled}
            </p>
          )}
          {item.observation && !isCancelled && (
            <p style={{ fontSize: 11, color: RED, fontStyle: "italic", margin: "3px 0 0" }}>
              ✱ {item.observation}
            </p>
          )}
          {(item.additionals || []).map((a, i) => (
            <p key={i} style={{ fontSize: 11, color: DARK, margin: "2px 0 0" }}>
              + {typeof a === "string" ? a : `${a.quantity}× ${a.name}`}
            </p>
          ))}
        </div>

        {!isCancelled && (
          <button
            onClick={(e) => { e.stopPropagation(); onCancelRequest(item); }}
            title="Marcar como indisponível"
            style={{
              width: 22, height: 22, borderRadius: 6,
              border: `1px solid #EF9A9A`, background: RED_FILL, color: RED,
              fontSize: 13, cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── status progress bar ────────────────────────────────────────────────────── */
const PROGRESS_STEPS = ["CREATED", "CONFIRMED", "IN_PREPARATION", "READY", "OUT_FOR_DELIVERY", "DELIVERED"];

function StatusProgress({ status }) {
  const idx = PROGRESS_STEPS.indexOf(status);
  if (idx === -1) return null;
  const pct = Math.round(((idx + 1) / PROGRESS_STEPS.length) * 100);
  return (
    <div style={{ height: 3, background: BORDER, borderRadius: 2, margin: "6px 0 2px", overflow: "hidden" }}>
      <motion.div
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{ height: "100%", background: GREEN, borderRadius: 2 }}
      />
    </div>
  );
}

/* ── primary action per status ──────────────────────────────────────────────── */
function getPrimaryAction(order) {
  const id      = order.id;
  const shortId = String(id).slice(-6).toUpperCase();
  switch (order.status) {
    case "CREATED":
    case "CONFIRMED":
      return {
        label: "INICIAR",
        bg: BLUE, fg: WHITE,
        fn: () => kdsApi.prepare(id),
        msg: `Pedido ${shortId} em preparo`,
        deductsStock: true,
      };
    case "IN_PREPARATION":
      return {
        label: "PRONTO",
        bg: ORANGE, fg: WHITE,
        fn: () => kdsApi.ready(id),
        msg: `Pedido ${shortId} pronto`,
        deductsStock: false,
      };
    case "READY":
      return {
        label: order.type === "DELIVERY" ? "ENVIAR" : "ENTREGAR",
        bg: GREEN, fg: WHITE,
        fn: () => kdsApi.complete(id),
        msg: `Pedido ${shortId} ${order.type === "DELIVERY" ? "a caminho" : "entregue"}`,
        deductsStock: false,
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "CONFIRMAR ENTREGA",
        bg: TEAL, fg: WHITE,
        fn: () => kdsApi.complete(id),
        msg: `Pedido ${shortId} entregue`,
        deductsStock: false,
      };
    default:
      return null;
  }
}

/* ── stock consumption modal ─────────────────────────────────────────────────── */
function StockConsumptionModal({ movements, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        style={{
          background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24,
          maxWidth: 400, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: GREEN_FILL,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={GREEN} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 14, color: DARK, margin: 0 }}>Insumos Baixados do Estoque</p>
            <p style={{ fontSize: 11, color: MID, margin: 0 }}>Registrado automaticamente ao iniciar o preparo</p>
          </div>
        </div>

        {movements.length === 0 ? (
          <p style={{ fontSize: 13, color: MID, textAlign: "center", padding: "12px 0" }}>
            Nenhuma movimentação registrada para este pedido.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {movements.map((m, i) => {
              const insumoMatch = m.reason?.match(/Insumo:\s*([^|]+)/);
              const qtdMatch    = m.reason?.match(/Qtd:\s*([^|]+)/);
              const insumoName  = insumoMatch?.[1]?.trim() ?? (m.stockItemName || m.reason);
              const qtdInfo     = qtdMatch?.[1]?.trim() ?? Number(m.quantity).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: 8,
                  background: BG, border: `1px solid ${BORDER}`,
                }}>
                  <span style={{ fontSize: 13, color: DARK, fontWeight: 500 }}>{insumoName}</span>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, marginLeft: 8 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: RED,
                      background: RED_FILL, padding: "2px 8px", borderRadius: 6, whiteSpace: "nowrap",
                    }}>
                      − {qtdInfo}
                    </span>
                    {m.balanceAfter != null && (
                      <span style={{ fontSize: 10, color: MID, whiteSpace: "nowrap" }}>
                        saldo: {Number(m.balanceAfter).toFixed(3)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={onClose}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
            background: GREEN, color: WHITE, fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>
          Entendido
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── order card ─────────────────────────────────────────────────────────────── */
const urgentPulse = {
  animate: {
    boxShadow: [
      "0 2px 14px rgba(198,40,40,0.15)",
      "0 2px 22px rgba(198,40,40,0.40)",
      "0 2px 14px rgba(198,40,40,0.15)",
    ],
  },
  transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
};

function OrderCard({ order, position, onStatusChange }) {
  const [acting, setActing]                       = useState(false);
  const [cancelLoading, setCancelLoading]         = useState(false);
  const [cancellingOrder, setCancellingOrder]     = useState(false);
  const [cancellingItem, setCancellingItem]       = useState(null);
  const [cancelledItems, setCancelledItems]       = useState({});
  const [stockMovements, setStockMovements]       = useState(null);

  const color     = waitColor(order.createdAt);
  const minutes   = waitMinutes(order.createdAt);
  const isUrgent  = minutes >= 15;
  const shortId   = String(order.id).slice(-6).toUpperCase();
  const elapsed   = useElapsed(order.createdAt);
  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: MID };
  const primary   = getPrimaryAction(order);

  const positionBg    = position === 1 ? "#FFF8E1" : position === 2 ? "#F5F5F5" : "#FFF3E0";
  const positionColor = position === 1 ? "#F57F17" : position === 2 ? MID : "#BF360C";

  const markItemCancelled = (item, reason) => {
    setCancelledItems((prev) => ({ ...prev, [item.id]: reason }));
    setCancellingItem(null);
    toast.warning(`"${item.productName}" marcado como indisponível`);
  };

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    try {
      await ordersApi.cancel(order.id);
      toast.success(`Pedido #${shortId} cancelado`);
      setCancellingOrder(false);
      onStatusChange(order.id);
    } catch (err) {
      toast.error(err.message || "Erro ao cancelar pedido.");
    } finally {
      setCancelLoading(false);
    }
  };

  const act = async (fn, successMsg, deductsStock) => {
    setActing(true);
    try {
      await fn();
      toast.success(successMsg);
      if (deductsStock) {
        try {
          const [movements, allItems] = await Promise.all([
            stockApi.movements.listByOrder(order.id),
            stockApi.items.list(),
          ]);
          const consumed = movements.filter((m) => m.type === "ORDER_CONSUMPTION");
          const itemMap  = Object.fromEntries(allItems.map((i) => [i.id, i]));
          setStockMovements(consumed.map((m) => ({
            ...m,
            currentQuantity: itemMap[m.stockItemId]?.currentQuantity ?? null,
          })));
        } catch { /* não bloqueia o fluxo */ }
      }
      onStatusChange(order.id);
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar pedido. Verifique o estoque e as fichas técnicas.");
    } finally {
      setActing(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={
          isUrgent
            ? { opacity: 1, y: 0, scale: 1, ...urgentPulse.animate }
            : { opacity: 1, y: 0, scale: 1 }
        }
        exit={{ opacity: 0, scale: 0.88, y: -12, transition: { duration: 0.3 } }}
        transition={
          isUrgent
            ? { opacity: { duration: 0.3 }, y: { type: "spring", stiffness: 200, damping: 22 }, ...urgentPulse.transition }
            : { type: "spring", stiffness: 200, damping: 22 }
        }
        whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(0,0,0,0.14)" }}
        style={{
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderTop: `4px solid ${color}`,
          borderRadius: 14,
          boxShadow: isUrgent ? "0 2px 14px rgba(198,40,40,0.15)" : "0 2px 14px rgba(0,0,0,0.09)",
          width: 300,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* header */}
        <div style={{ padding: "12px 14px 4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              {/* position badge */}
              <span style={{
                background: positionBg, color: positionColor,
                border: `1px solid ${positionColor}40`,
                borderRadius: 7, minWidth: 28, height: 28, paddingInline: 5,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 11, flexShrink: 0,
              }}>
                #{position}
              </span>
              <span
                style={{
                  fontWeight: 700, fontSize: 15, color: "#212121",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
                title={order.customerName}
              >
                {order.customerName}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, marginLeft: 6 }}>
              <motion.span
                key={order.status}
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{
                  background: statusCfg.bg, color: WHITE,
                  padding: "3px 8px", borderRadius: 20,
                  fontWeight: 700, fontSize: 9, letterSpacing: 0.4,
                }}>
                {statusCfg.label}
              </motion.span>
              <button
                onClick={() => setCancellingOrder(true)}
                title="Cancelar pedido"
                style={{
                  width: 24, height: 24, borderRadius: 6,
                  border: `1px solid #EF9A9A`, background: RED_FILL, color: RED,
                  fontSize: 12, cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                ✕
              </button>
            </div>
          </div>

          <StatusProgress status={order.status} />

          {order.type === "DELIVERY" && (
            <span style={{
              display: "inline-block", marginTop: 4, marginBottom: 2,
              background: "#E3F2FD", color: BLUE,
              fontSize: 10, fontWeight: 700, padding: "2px 7px",
              borderRadius: 10, letterSpacing: 0.3,
            }}>🛵 DELIVERY</span>
          )}

          {/* items */}
          <div style={{ maxHeight: 250, overflowY: "auto", marginTop: 6 }}>
            {order.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                cancelled={cancelledItems[item.id]}
                onCancelRequest={(it) => setCancellingItem(it)}
              />
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{
          padding: "6px 14px 8px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: `1px solid #F0F0F0`,
        }}>
          <span style={{ fontSize: 11, color: MID }}>👤 {order.customerName}</span>
          <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color, fontWeight: 700 }}>
            ⏱ {elapsed}
          </span>
        </div>

        {/* primary action */}
        {primary && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => act(primary.fn, primary.msg, primary.deductsStock)}
            disabled={acting}
            style={{
              width: "100%", padding: "13px 0", border: "none",
              background: primary.bg, color: primary.fg,
              fontWeight: 800, fontSize: 13, letterSpacing: 0.5,
              cursor: acting ? "not-allowed" : "pointer",
              opacity: acting ? 0.65 : 1,
              transition: "opacity 0.15s",
            }}>
            {acting ? "…" : primary.label}
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {cancellingOrder && (
          <ConfirmCancelModal
            order={order}
            loading={cancelLoading}
            onConfirm={handleCancelOrder}
            onClose={() => setCancellingOrder(false)}
          />
        )}
        {cancellingItem && (
          <CancelItemModal
            item={cancellingItem}
            onConfirm={(reason) => markItemCancelled(cancellingItem, reason)}
            onClose={() => setCancellingItem(null)}
          />
        )}
        {stockMovements !== null && (
          <StockConsumptionModal
            movements={stockMovements}
            onClose={() => setStockMovements(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── section header ─────────────────────────────────────────────────────────── */
function SectionHeader({ title, count, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "0 4px 8px",
      borderBottom: `2px solid ${color}`,
      marginBottom: 12,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontWeight: 700, fontSize: 13, color: DARK }}>{title}</span>
      <span style={{
        marginLeft: "auto",
        background: color, color: WHITE,
        borderRadius: 12, padding: "1px 9px",
        fontSize: 11, fontWeight: 700,
      }}>{count}</span>
    </div>
  );
}

/* ── legend dot ─────────────────────────────────────────────────────────────── */
function LegendDot({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>{label}</span>
    </span>
  );
}

/* ── main page ──────────────────────────────────────────────────────────────── */
const VISIBLE_STATUSES = ["CREATED", "CONFIRMED", "IN_PREPARATION", "READY", "OUT_FOR_DELIVERY"];
const SECTIONS = [
  { key: "pending",     label: "Aguardando",  statuses: ["CREATED", "CONFIRMED"],        color: BLUE },
  { key: "preparation", label: "Em Preparo",  statuses: ["IN_PREPARATION"],              color: ORANGE },
  { key: "ready",       label: "Prontos",     statuses: ["READY", "OUT_FOR_DELIVERY"],   color: GREEN },
];

export default function Kds() {
  const navigate = useNavigate();
  const { orders, connected, refetch } = useKdsSocket();

  const handleStatusChange = () => refetch();
  const visibleOrders = orders.filter((o) => VISIBLE_STATUSES.includes(o.status));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: "system-ui, sans-serif" }}>

      {/* header — verde do sistema */}
      <header style={{
        background: GREEN, borderBottom: `3px solid ${GREEN_DARK}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)", flexShrink: 0,
        display: "flex", alignItems: "center", height: 48,
      }}>
        <button onClick={() => navigate("/menu")}
          style={{
            background: "rgba(255,255,255,0.12)", border: "none",
            borderRight: "1px solid rgba(255,255,255,0.15)",
            color: WHITE, cursor: "pointer", padding: "0 16px", height: "100%",
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            fontSize: 12, fontWeight: 600,
          }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
          </svg>
          Menu
        </button>

        <span style={{ color: WHITE, fontWeight: 700, fontSize: 15, padding: "0 16px", flex: 1 }}>
          KDS — Monitor de Preparo
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 16 }}>
          <motion.span
            animate={{ opacity: connected ? 1 : [1, 0.3, 1] }}
            transition={connected ? {} : { duration: 1.2, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#69F0AE" : "#FF5252" }}
          />
          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>
            {connected ? "Ao vivo" : "Polling"}
          </span>
        </div>
      </header>

      {/* content */}
      <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 24 }}>
        {visibleOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, flexDirection: "column", gap: 12 }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: 20, background: GREEN_FILL,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke={GREEN} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p style={{ color: LIGHT, fontSize: 15, fontWeight: 500 }}>Cozinha livre — nenhum pedido pendente</p>
          </motion.div>
        ) : (
          SECTIONS.map(({ key, label, statuses, color }) => {
            const sectionOrders = visibleOrders.filter((o) => statuses.includes(o.status));
            if (sectionOrders.length === 0) return null;
            return (
              <div key={key}>
                <SectionHeader title={label} count={sectionOrders.length} color={color} />
                <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6 }}>
                  <AnimatePresence mode="popLayout">
                    {sectionOrders.map((order, idx) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        position={idx + 1}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* footer */}
      <footer style={{
        background: GREEN_DARK, color: WHITE, fontSize: 12,
        padding: "8px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, gap: 16,
      }}>
        <span style={{ fontWeight: 600 }}>
          {visibleOrders.length} pedido{visibleOrders.length !== 1 ? "s" : ""} ativo{visibleOrders.length !== 1 ? "s" : ""}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <LegendDot color={GREEN}    label="< 5 min" />
          <LegendDot color="#F9A825" label="< 10 min" />
          <LegendDot color={ORANGE}  label="< 15 min" />
          <LegendDot color={RED}     label="≥ 15 min" />
        </div>
      </footer>
    </div>
  );
}
