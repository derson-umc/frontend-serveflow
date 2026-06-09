import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { palette } from "@styles/ds";
import { useAuthStore } from "@features/auth/store/useAuthStore";
import { cashierApi } from "@core/api/cashier";
import { toast } from "@shared/components/feedback/Toast";
import { useSessionTimer } from "../hooks/useSessionTimer";
import PayBadge from "./PayBadge";
import PendingOrdersModal from "./PendingOrdersModal";
import MovementModal from "./MovementModal";
import CloseCashierModal from "./CloseCashierModal";
import { inputStyle } from "./FormField";
import { Paginator } from "@features/stock/components/Paginator";
import {
  QK, fmtBRL, fmtDateTime, toDate, toDateStr,
  normPayment, groupByPayment, detectOrderType, TYPE_CFG,
  PAYMENT_KEYS, PAYMENT_LABELS, PAYMENT_ICONS,
} from "../constants";

function InfoField({ label, value, mono, accent }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: palette.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: mono ? 15 : 13, fontWeight: 700, fontFamily: mono ? "monospace" : "inherit", color: accent ? palette.green : palette.textPrimary, letterSpacing: mono ? 1 : 0 }}>
        {value}
      </div>
    </div>
  );
}

function Skeleton({ w = "100%", h = 14, radius = 6, mb = 0 }) {
  return (
    <div style={{ width: w, height: h, borderRadius: radius, marginBottom: mb, background: "linear-gradient(90deg,#e8e8e8 25%,#f4f4f4 50%,#e8e8e8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
  );
}

function SummaryRow({ icon, label, value, bold, color = palette.textMuted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: bold ? "6px 0" : "3px 0", borderTop: bold ? `1px solid ${palette.border}` : "none", marginTop: bold ? 4 : 0 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: bold ? color : palette.textMuted, fontWeight: bold ? 700 : 400 }}>
        {icon && <span>{icon}</span>}
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: bold ? 800 : 500, color: bold ? color : palette.textPrimary }}>{fmtBRL(value)}</span>
    </div>
  );
}

export default function OpenCashierView({ session }) {
  const qc       = useQueryClient();
  const { user } = useAuthStore();
  const elapsed  = useSessionTimer(session.openedAt);

  const { data: movements = [], isLoading: loadingMov } = useQuery({
    queryKey: QK.movements(session.id),
    queryFn:  () => cashierApi.movements.list(session.id),
    refetchInterval: 15_000,
    staleTime:       10_000,
  });

  const { data: pendingOrders = [] } = useQuery({
    queryKey: QK.pendingOrders,
    queryFn:  () => cashierApi.orders.pending(),
    refetchInterval: 15_000,
    staleTime:       10_000,
  });

  const [orderPayment,     setOrderPayment]     = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMovModal,     setShowMovModal]     = useState(null);
  const [showCloseModal,   setShowCloseModal]   = useState(false);

  const settleOrder = useMutation({
    mutationFn: ({ id, paymentMethod }) => cashierApi.orders.settle(id, { paymentMethod }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QK.pendingOrders });
      qc.invalidateQueries({ queryKey: QK.movements(session.id) });
      toast.success("Pagamento confirmado!");
      setOrderPayment((p) => { const n = { ...p }; delete n[vars.id]; return n; });
      // Persiste o ID liquidado para o Menu consumir ao remontar (navegação entre rotas).
      try {
        const prev = JSON.parse(sessionStorage.getItem('sf-settled-orders') || '[]');
        sessionStorage.setItem('sf-settled-orders', JSON.stringify([...prev, String(vars.id)]));
      } catch {}
      // Notifica o módulo Menu para remover a comanda imediatamente,
      // sem depender de WebSocket ou polling.
      window.dispatchEvent(
        new CustomEvent('sf:order-settled', { detail: { orderId: vars.id } }),
      );
    },
  });

  const cancelOrder = useMutation({
    mutationFn: (id) => cashierApi.orders.cancel(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: QK.pendingOrders }); },
  });

  const prevIds = useRef(new Set());
  const [newIds, setNewIds] = useState(new Set());
  useEffect(() => {
    const added = movements.filter((m) => !prevIds.current.has(m.id));
    if (added.length) {
      setNewIds((s) => { const n = new Set(s); added.forEach((m) => n.add(m.id)); return n; });
      setTimeout(() => setNewIds((s) => { const n = new Set(s); added.forEach((m) => n.delete(m.id)); return n; }), 4000);
    }
    prevIds.current = new Set(movements.map((m) => m.id));
  }, [movements]);

  const [fDate,    setFDate]    = useState("");
  const [fOrigem,  setFOrigem]  = useState("");
  const [fTipo,    setFTipo]    = useState("");
  const [fPayment, setFPayment] = useState("");

  // Paginação — 10 por página por padrão
  const PAGE_SIZE_OPTIONS = [10, 25, 50];
  const [pageSize, setPageSize] = useState(10);
  const [page,     setPage]     = useState(1);

  const totalIncome    = useMemo(() => movements.filter((m) => m.type === "INCOME").reduce((s, m) => s + Number(m.amount), 0),  [movements]);
  const totalExpense   = useMemo(() => movements.filter((m) => m.type === "EXPENSE").reduce((s, m) => s + Number(m.amount), 0), [movements]);
  const currentBalance = useMemo(() => Number(session.initialBalance ?? 0) + totalIncome - totalExpense, [session, totalIncome, totalExpense]);
  const incomeByPay    = useMemo(() => groupByPayment(movements, "INCOME"),  [movements]);
  const expenseByPay   = useMemo(() => groupByPayment(movements, "EXPENSE"), [movements]);
  const balancePos     = currentBalance >= 0;

  // Filtrado + ordenado descendente (mais recente primeiro)
  const filtered = useMemo(() => {
    const result = movements.filter((m) => {
      if (fDate    && toDateStr(m.createdAt) !== fDate)          return false;
      if (fOrigem  && m.origem !== fOrigem)                      return false;
      if (fPayment && normPayment(m.category) !== fPayment)      return false;
      if (fTipo    && detectOrderType(m.description) !== fTipo)  return false;
      return true;
    });
    return result.slice().sort((a, b) => {
      const ta = Array.isArray(a.createdAt) ? new Date(a.createdAt[0], a.createdAt[1]-1, a.createdAt[2], a.createdAt[3]??0, a.createdAt[4]??0).getTime() : new Date(a.createdAt).getTime();
      const tb = Array.isArray(b.createdAt) ? new Date(b.createdAt[0], b.createdAt[1]-1, b.createdAt[2], b.createdAt[3]??0, b.createdAt[4]??0).getTime() : new Date(b.createdAt).getTime();
      return tb - ta; // descendente
    });
  }, [movements, fDate, fOrigem, fTipo, fPayment]);

  // Reset página quando filtros ou pageSize mudam
  useEffect(() => { setPage(1); }, [fDate, fOrigem, fTipo, fPayment, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const panel    = { background: palette.white, border: `1px solid ${palette.border}`, borderRadius: 12, overflow: "hidden" };
  const TH       = { padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", background: "#F8FAF8", borderBottom: `1.5px solid ${palette.border}`, whiteSpace: "nowrap" };
  const selStyle = { ...inputStyle, padding: "5px 8px", fontSize: 11, width: "auto", flex: "none" };
  const operatorName = user?.sub ?? session.openedBy ?? "—";

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>


      <PendingOrdersModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orders={pendingOrders}
        orderPayment={orderPayment}
        setOrderPayment={setOrderPayment}
        settleOrder={settleOrder}
        cancelOrder={cancelOrder}
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(180px,200px) minmax(0,1fr) minmax(220px,260px)", gap: 12, alignItems: "start", overflowX: "auto" }}>
        <div style={{ ...panel, padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, background: palette.greenSurface, border: `1px solid ${palette.greenBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: palette.green, boxShadow: `0 0 0 2px ${palette.greenBorder}` }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: palette.green, letterSpacing: 0.5 }}>ABERTO</span>
            </div>
            <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: palette.green, letterSpacing: 1 }}>{elapsed}</span>
          </div>
          <InfoField label="Operador"        value={operatorName} />
          <InfoField label="Fundo de Caixa"  value={fmtBRL(session.initialBalance)} />
          <InfoField label="Abertura"        value={fmtDateTime(session.openedAt)} />
          {session.observation && (
            <div style={{ padding: "8px 10px", borderRadius: 8, background: "#FFF8E1", border: "1px solid #FFE082", fontSize: 11, color: "#795548", lineHeight: 1.5 }}>
              {session.observation}
            </div>
          )}
        </div>

        <div style={{ ...panel }}>
          {/* ── Cabeçalho: título + botão Aguardando ── */}
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${palette.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary }}>Movimentação do Caixa</span>
            <button
              onClick={() => pendingOrders.length > 0 && setShowPaymentModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                cursor:     pendingOrders.length > 0 ? "pointer" : "default",
                background: pendingOrders.length > 0 ? "#FFF8E1" : "#F5F5F5",
                color:      pendingOrders.length > 0 ? "#E65100" : "#9E9E9E",
                border:     `1.5px solid ${pendingOrders.length > 0 ? "#FFB300" : "#E0E0E0"}`,
              }}
            >
              Aguardando Pagamento
              <span style={{ borderRadius: 20, fontSize: 10, fontWeight: 800, padding: "1px 6px", background: pendingOrders.length > 0 ? "#F57C00" : "#BDBDBD", color: "#fff" }}>
                {pendingOrders.length}
              </span>
            </button>
          </div>

          {/* ── Filtros + controles de paginação ── */}
          <div style={{ padding: "8px 16px", borderBottom: `1px solid ${palette.border}`, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "#FAFAFA" }}>
            <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} style={{ ...selStyle, minWidth: 130 }} />
            <select value={fOrigem} onChange={(e) => setFOrigem(e.target.value)} style={selStyle}>
              <option value="">Origem: Todas</option>
              <option value="AUTOMATICO">Auto</option>
              <option value="MANUAL">Manual</option>
            </select>
            <select value={fTipo} onChange={(e) => setFTipo(e.target.value)} style={selStyle}>
              <option value="">Tipo: Todos</option>
              <option value="LOCAL">Local</option>
              <option value="DELIVERY">Delivery</option>
              <option value="BALCAO">Balcão</option>
            </select>
            <select value={fPayment} onChange={(e) => setFPayment(e.target.value)} style={selStyle}>
              <option value="">Pagamento: Todos</option>
              {PAYMENT_KEYS.map((k) => <option key={k} value={k}>{PAYMENT_LABELS[k]}</option>)}
            </select>
            {(fDate || fOrigem || fTipo || fPayment) && (
              <button onClick={() => { setFDate(""); setFOrigem(""); setFTipo(""); setFPayment(""); }}
                style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: palette.redSurface, color: palette.red, border: `1px solid ${palette.redBorder}`, cursor: "pointer" }}>
                Limpar
              </button>
            )}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: palette.textMuted, whiteSpace: "nowrap" }}>{filtered.length} reg.</span>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ ...selStyle, fontSize: 11 }}>
                {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s} / pág.</option>)}
              </select>
            </div>
          </div>

          {loadingMov ? (
            <div style={{ padding: 16 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <Skeleton w={80} h={12} /><Skeleton w="35%" h={12} /><Skeleton w={60} h={12} /><Skeleton w={70} h={12} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 20px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ECEFF1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#90A4AE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><line x1="12" y1="12" x2="12" y2="16"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: palette.textMuted }}>
                {movements.length === 0 ? "Nenhum movimento ainda" : "Sem resultados para os filtros"}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Hora", "Tipo", "Origem", "Descrição", "Pagamento"].map((h) => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                    <th style={{ ...TH, textAlign: "right" }}>Entrada</th>
                    <th style={{ ...TH, textAlign: "right" }}>Saída</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {paginated.map((m, idx) => {
                      const isNew     = newIds.has(m.id);
                      const isAuto    = m.origem === "AUTOMATICO";
                      const orderType = detectOrderType(m.description);
                      const payKey    = normPayment(m.category);
                      return (
                        <motion.tr key={m.id}
                          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                          style={{ background: isNew ? "#E8F5E9" : idx % 2 === 0 ? palette.white : "#FAFAFA", borderBottom: `1px solid ${palette.border}`, transition: "background 1.5s ease" }}>
                          <td style={{ padding: "8px 14px", color: palette.textMuted, whiteSpace: "nowrap", fontSize: 11 }}>
                            {(() => {
                              const raw = m.createdAt;
                              if (!raw) return "—";
                              const d = Array.isArray(raw) ? new Date(raw[0], raw[1]-1, raw[2], raw[3]??0, raw[4]??0) : new Date(raw);
                              return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                            })()}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            {orderType ? (
                              <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: TYPE_CFG[orderType]?.bg ?? "#F3F4F6", color: TYPE_CFG[orderType]?.color ?? "#374151", border: `1px solid ${TYPE_CFG[orderType]?.border ?? "#D1D5DB"}` }}>{TYPE_CFG[orderType]?.label ?? orderType}</span>
                            ) : <span style={{ fontSize: 11, color: palette.textMuted }}>—</span>}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: isAuto ? "#E3F2FD" : "#FFFDE7", color: isAuto ? "#1565C0" : "#F57F17", border: `1px solid ${isAuto ? "#90CAF9" : "#FFE082"}` }}>
                              {isAuto ? "AUTO" : "MANUAL"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 14px", color: palette.textPrimary, fontWeight: 500, width: "100%", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.description}</td>
                          <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                            {payKey && PAYMENT_ICONS[payKey] ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                <PayBadge k={payKey} />
                                <span style={{ fontSize: 11, color: palette.textMuted }}>{PAYMENT_LABELS[payKey]}</span>
                              </span>
                            ) : (
                              <span style={{ fontSize: 11, color: palette.textDisabled || "#BDBDBD" }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "8px 14px", fontWeight: 800, color: palette.green, textAlign: "right", whiteSpace: "nowrap" }}>
                            {m.type === "INCOME" ? `+ ${fmtBRL(m.amount)}` : ""}
                          </td>
                          <td style={{ padding: "8px 14px", fontWeight: 800, color: palette.red, textAlign: "right", whiteSpace: "nowrap" }}>
                            {m.type === "EXPENSE" ? `− ${fmtBRL(m.amount)}` : ""}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
                <tfoot>
                  <tr style={{ background: "#F1F5F1", borderTop: `2px solid ${palette.border}` }}>
                    <td colSpan={5} style={{ padding: "8px 14px", fontSize: 11, fontWeight: 700, color: palette.textMuted }}>TOTAL ({filtered.length})</td>
                    <td style={{ padding: "8px 14px", fontWeight: 900, color: palette.green, textAlign: "right", whiteSpace: "nowrap" }}>
                      +&nbsp;{fmtBRL(filtered.filter((m) => m.type === "INCOME").reduce((s, m) => s + Number(m.amount), 0))}
                    </td>
                    <td style={{ padding: "8px 14px", fontWeight: 900, color: palette.red, textAlign: "right", whiteSpace: "nowrap" }}>
                      −&nbsp;{fmtBRL(filtered.filter((m) => m.type === "EXPENSE").reduce((s, m) => s + Number(m.amount), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
              <Paginator
                page={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={pageSize}
                label="movimentos"
                onChange={setPage}
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...panel, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: palette.textPrimary, marginBottom: 10 }}>Resumo</div>
            <SummaryRow label="Fundo inicial" value={session.initialBalance} />
            <div style={{ margin: "8px 0 5px", fontSize: 10, fontWeight: 700, color: palette.green }}>+ Entradas</div>
            {PAYMENT_KEYS.filter((k) => incomeByPay[k] > 0).map((k) => (
              <SummaryRow key={k} icon={<PayBadge k={k} />} label={PAYMENT_LABELS[k]} value={incomeByPay[k]} />
            ))}
            {incomeByPay["OUTROS"] > 0 && <SummaryRow label="Outros" value={incomeByPay["OUTROS"]} />}
            <SummaryRow label="Total Entradas" value={totalIncome} bold color={palette.green} />
            <div style={{ margin: "8px 0 5px", fontSize: 10, fontWeight: 700, color: palette.red }}>− Saídas</div>
            {PAYMENT_KEYS.filter((k) => expenseByPay[k] > 0).map((k) => (
              <SummaryRow key={k} icon={<PayBadge k={k} />} label={PAYMENT_LABELS[k]} value={expenseByPay[k]} />
            ))}
            {expenseByPay["OUTROS"] > 0 && <SummaryRow label="Outros" value={expenseByPay["OUTROS"]} />}
            <SummaryRow label="Total Saídas" value={totalExpense} bold color={palette.red} />
          </div>

          <div style={{ ...panel, padding: 14, background: balancePos ? palette.greenSurface : palette.redSurface, border: `1.5px solid ${balancePos ? palette.greenBorder : palette.redBorder}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: balancePos ? palette.green : palette.red, marginBottom: 2 }}>Saldo Dinheiro</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary, marginBottom: 10 }}>
              {fmtBRL(Number(session.initialBalance ?? 0) + incomeByPay["DINHEIRO"] - expenseByPay["DINHEIRO"])}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: balancePos ? palette.green : palette.red, marginBottom: 2 }}>Saldo Final</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: balancePos ? palette.green : palette.red }}>{fmtBRL(currentBalance)}</div>
          </div>

          <button onClick={() => setShowMovModal("INCOME")} style={{ padding: "10px", borderRadius: 10, background: palette.green, color: palette.white, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 3px 10px rgba(46,125,50,0.25)" }}>
            + Entrada Manual
          </button>
          <button onClick={() => setShowMovModal("EXPENSE")} style={{ padding: "10px", borderRadius: 10, background: palette.red, color: palette.white, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            − Saída / Sangria
          </button>
          <button onClick={() => setShowCloseModal(true)} style={{ padding: "10px", borderRadius: 10, background: "#37474F", color: palette.white, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Fechar Caixa
          </button>
        </div>
      </div>

      <MovementModal
        open={!!showMovModal}
        onClose={() => setShowMovModal(null)}
        type={showMovModal}
        sessionId={session.id}
      />

      <CloseCashierModal
        open={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        sessionId={session.id}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        currentBalance={currentBalance}
      />
    </>
  );
}
