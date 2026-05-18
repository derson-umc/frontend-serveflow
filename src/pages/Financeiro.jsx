import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/ui/Sidebar";
import { financialApi } from "../services/api/financial";
import { cashierApi } from "../services/api/cashier";
import { toast } from "../components/ui/Toast";
import { useAuthStore } from "../store/useAuthStore";

const G  = "#2E7D32"; const GF = "#E8F5E9"; const GD = "#1B5E20";
const O  = "#F57C00"; const OF = "#FFF3E0";
const R  = "#C62828"; const RF = "#FFEBEE";
const BL = "#1565C0"; const BLF = "#E3F2FD";
const D  = "#212121"; const M  = "#757575"; const B  = "#E0E0E0"; const W = "#FFFFFF";
const GY = "#546E7A"; const GYF = "#ECEFF1";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmtBRL = (v) =>
  Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (s) => {
  if (!s) return "—";
  const [y, m, d] = String(s).split("-");
  return `${d}/${m}/${y}`;
};

const fmtDateTime = (s) => {
  if (!s) return "—";
  const dt = new Date(s);
  return dt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const STATUS_CFG = {
  PENDING:   { label: "Pendente",  color: O,  bg: OF,  border: "#FFCC80" },
  RECEIVED:  { label: "Recebida",  color: G,  bg: GF,  border: "#A5D6A7" },
  PAID:      { label: "Paga",      color: G,  bg: GF,  border: "#A5D6A7" },
  OVERDUE:   { label: "Vencida",   color: R,  bg: RF,  border: "#EF9A9A" },
  CANCELLED: { label: "Cancelada", color: GY, bg: GYF, border: "#B0BEC5" },
};

const ACTION_CFG = {
  CREATE: { label: "Criado",    color: G,  bg: GF  },
  SETTLE: { label: "Baixado",   color: BL, bg: BLF },
  CANCEL: { label: "Cancelado", color: R,  bg: RF  },
  REOPEN: { label: "Reaberto",  color: O,  bg: OF  },
};

// ── sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, color: M, bg: "#F5F5F5", border: B };
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  );
}

function Modal({ open, onClose, title, subtitle, children, maxWidth = 480 }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div style={{ background: W, borderRadius: 16, border: `1px solid ${B}`, width: "100%", maxWidth, maxHeight: "90vh", overflowY: "auto", padding: 24, boxShadow: "0 24px 48px rgba(0,0,0,0.18)" }}
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: D, margin: 0 }}>{title}</h3>
                {subtitle && <p style={{ fontSize: 12, color: M, margin: "3px 0 0" }}>{subtitle}</p>}
              </div>
              <button onClick={onClose}
                style={{ width: 28, height: 28, borderRadius: 8, background: "#F5F5F5", border: "none", color: M, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
        {label} {required && <span style={{ color: R }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 10,
  border: `1.5px solid ${B}`, background: "#FAFAFA",
  fontSize: 13, color: D, outline: "none", boxSizing: "border-box",
};

// ── Tab Fluxo de Caixa ────────────────────────────────────────────────────────

function AberturaCaixa({ onOpened }) {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ initialBalance: "", observation: "" });
  const [busy, setBusy] = useState(false);

  const handleOpen = async () => {
    setBusy(true);
    try {
      await cashierApi.session.open({
        initialBalance: parseFloat(form.initialBalance || 0),
        observation: form.observation || null,
        openedBy: user?.name ?? user?.username ?? "sistema",
      });
      toast.success("Caixa aberto com sucesso!");
      onOpened();
    } catch (e) {
      toast.error(e?.response?.data?.error ?? "Erro ao abrir caixa.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "36px auto" }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: D, margin: 0 }}>Abertura de Caixa</h2>
        <p style={{ fontSize: 12, color: M, marginTop: 4 }}>
          Informe o fundo disponível para iniciar o turno.
        </p>
      </div>
      <div style={{ background: W, borderRadius: 12, border: `1px solid ${B}`, padding: 20 }}>
        <FormField label="Fundo de Caixa (R$)">
          <input
            type="number" step="0.01" min="0"
            value={form.initialBalance}
            onChange={e => setForm(p => ({ ...p, initialBalance: e.target.value }))}
            placeholder="0,00"
            style={inputStyle}
            autoFocus
          />
        </FormField>
        <FormField label="Observação">
          <textarea
            value={form.observation}
            onChange={e => setForm(p => ({ ...p, observation: e.target.value }))}
            placeholder="Observação (opcional)"
            rows={2}
            style={{ ...inputStyle, resize: "none" }}
          />
        </FormField>
        <button
          onClick={handleOpen} disabled={busy}
          style={{
            width: "100%", padding: "11px", borderRadius: 10,
            background: busy ? B : G, color: W, border: "none",
            fontWeight: 700, fontSize: 14, cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Abrindo..." : "Abrir Caixa"}
        </button>
      </div>
    </div>
  );
}

function CaixaAberto({ session, onRefresh }) {
  const user = useAuthStore((s) => s.user);
  const [movements, setMovements] = useState([]);
  const [loadingMov, setLoadingMov] = useState(true);
  const [showMovModal, setShowMovModal] = useState(null); // 'INCOME' | 'EXPENSE'
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [movForm, setMovForm] = useState({ amount: "", description: "", category: "" });
  const [closeForm, setCloseForm] = useState({ closingObservation: "" });
  const [busy, setBusy] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  const loadMovements = useCallback(() => {
    setLoadingMov(true);
    cashierApi.movements.list(session.id)
      .then(setMovements)
      .catch(() => setMovements([]))
      .finally(() => setLoadingMov(false));
  }, [session.id]);

  useEffect(() => { loadMovements(); }, [loadMovements]);

  const totalIncome   = useMemo(() => movements.filter(m => m.type === "INCOME").reduce((s, m) => s + Number(m.amount), 0), [movements]);
  const totalExpense  = useMemo(() => movements.filter(m => m.type === "EXPENSE").reduce((s, m) => s + Number(m.amount), 0), [movements]);
  const currentBalance = useMemo(() => Number(session.initialBalance ?? 0) + totalIncome - totalExpense, [session, totalIncome, totalExpense]);

  const filteredMovements = useMemo(() => {
    if (!dateFilter) return movements;
    return movements.filter(m => m.createdAt?.startsWith(dateFilter));
  }, [movements, dateFilter]);

  const handleAddMovement = async () => {
    if (!movForm.amount || !movForm.description) { toast.error("Preencha valor e descrição."); return; }
    setBusy(true);
    try {
      await cashierApi.movements.create(session.id, {
        type: showMovModal,
        amount: parseFloat(movForm.amount),
        description: movForm.description,
        category: movForm.category || null,
        performedBy: user?.name ?? user?.username ?? "sistema",
      });
      toast.success(showMovModal === "INCOME" ? "Entrada registrada!" : "Saída registrada!");
      setShowMovModal(null);
      setMovForm({ amount: "", description: "", category: "" });
      loadMovements();
    } catch (e) {
      toast.error(e?.response?.data?.error ?? "Erro ao registrar movimento.");
    } finally {
      setBusy(false);
    }
  };

  const handleClose = async () => {
    setBusy(true);
    try {
      await cashierApi.session.close(session.id, {
        closedBy: user?.name ?? user?.username ?? "sistema",
        closingObservation: closeForm.closingObservation || null,
      });
      toast.success("Caixa fechado com sucesso!");
      setShowCloseModal(false);
      onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.error ?? "Erro ao fechar caixa.");
    } finally {
      setBusy(false);
    }
  };

  const balancePositive = currentBalance >= 0;

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: G, display: "inline-block" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: D }}>Caixa aberto</span>
          </div>
          <span style={{ fontSize: 11, color: M }}>
            {session.openedBy} · {fmtDateTime(session.openedAt)}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowMovModal("INCOME")}
            style={{ padding: "8px 14px", borderRadius: 8, background: G, color: W, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            + Entrada
          </button>
          <button onClick={() => setShowMovModal("EXPENSE")}
            style={{ padding: "8px 14px", borderRadius: 8, background: R, color: W, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            − Saída
          </button>
          <button onClick={() => setShowCloseModal(true)}
            style={{ padding: "8px 14px", borderRadius: 8, background: "#455A64", color: W, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            Fechar Caixa
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1, background: B, border: `1px solid ${B}`,
        borderRadius: 10, overflow: "hidden", marginBottom: 20,
      }}>
        {[
          { label: "Fundo de caixa", value: session.initialBalance, color: M },
          { label: "Entradas", value: totalIncome, color: G },
          { label: "Saídas", value: totalExpense, color: R },
          { label: "Saldo atual", value: currentBalance, color: balancePositive ? G : R },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: W, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: M, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
              {label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color }}>{fmtBRL(value)}</div>
          </div>
        ))}
      </div>

      {/* History */}
      <div style={{ background: W, borderRadius: 14, border: `1px solid ${B}`, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${B}`, flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: D }}>Histórico de Movimentos</span>
          <input
            type="date" value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 12 }}
          />
        </div>

        {loadingMov ? (
          <div style={{ textAlign: "center", padding: 28, color: M }}>Carregando...</div>
        ) : filteredMovements.length === 0 ? (
          <div style={{ textAlign: "center", padding: 28, color: M, fontSize: 13 }}>
            {dateFilter ? "Nenhum movimento nesta data." : "Nenhum movimento registrado."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#FAFAFA" }}>
                {["Tipo", "Descrição", "Categoria", "Valor", "Realizado por", "Hora"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((m, idx) => (
                <tr key={m.id}
                  style={{ borderTop: `1px solid ${B}`, background: idx % 2 === 0 ? W : "#FAFAFA" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: m.type === "INCOME" ? GF : RF,
                      color: m.type === "INCOME" ? G : R,
                      border: `1px solid ${m.type === "INCOME" ? "#A5D6A7" : "#EF9A9A"}`,
                    }}>
                      {m.type === "INCOME" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: D }}>{m.description}</td>
                  <td style={{ padding: "10px 14px", color: M }}>{m.category || "—"}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: m.type === "INCOME" ? G : R }}>
                    {m.type === "INCOME" ? "+" : "−"}{fmtBRL(m.amount)}
                  </td>
                  <td style={{ padding: "10px 14px", color: M }}>{m.performedBy}</td>
                  <td style={{ padding: "10px 14px", color: M, whiteSpace: "nowrap" }}>{fmtDateTime(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add movement modal */}
      <Modal
        open={!!showMovModal}
        onClose={() => setShowMovModal(null)}
        title={showMovModal === "INCOME" ? "Adicionar Entrada" : "Adicionar Saída"}
        subtitle={showMovModal === "INCOME" ? "Registre um recebimento no caixa" : "Registre uma despesa no caixa"}
      >
        <FormField label="Valor (R$)" required>
          <input
            type="number" step="0.01" min="0.01"
            value={movForm.amount}
            onChange={e => setMovForm(p => ({ ...p, amount: e.target.value }))}
            placeholder="0,00"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Descrição" required>
          <input
            value={movForm.description}
            onChange={e => setMovForm(p => ({ ...p, description: e.target.value }))}
            placeholder={showMovModal === "INCOME" ? "Ex: Venda mesa 3" : "Ex: Compra de insumos"}
            style={inputStyle}
          />
        </FormField>
        <FormField label="Categoria">
          <input
            value={movForm.category}
            onChange={e => setMovForm(p => ({ ...p, category: e.target.value }))}
            placeholder="Ex: VENDA, DESPESA_FIXA..."
            style={inputStyle}
          />
        </FormField>
        <button
          onClick={handleAddMovement} disabled={busy}
          style={{
            width: "100%", padding: "11px", borderRadius: 10,
            background: busy ? B : showMovModal === "INCOME" ? G : R,
            color: W, border: "none", fontWeight: 700, fontSize: 14,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Registrando..." : showMovModal === "INCOME" ? "Confirmar Entrada" : "Confirmar Saída"}
        </button>
      </Modal>

      {/* Close session modal */}
      <Modal open={showCloseModal} onClose={() => setShowCloseModal(false)} title="Fechar Caixa" subtitle="Confirme o fechamento do caixa">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
          <div style={{ background: GF, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: G, textTransform: "uppercase", marginBottom: 4 }}>Entradas</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: G }}>{fmtBRL(totalIncome)}</div>
          </div>
          <div style={{ background: RF, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: R, textTransform: "uppercase", marginBottom: 4 }}>Saídas</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: R }}>{fmtBRL(totalExpense)}</div>
          </div>
          <div style={{ background: balancePositive ? GF : RF, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: balancePositive ? G : R, textTransform: "uppercase", marginBottom: 4 }}>Saldo Final</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: balancePositive ? G : R }}>{fmtBRL(currentBalance)}</div>
          </div>
        </div>
        <FormField label="Observação de Fechamento">
          <textarea
            value={closeForm.closingObservation}
            onChange={e => setCloseForm(p => ({ ...p, closingObservation: e.target.value }))}
            placeholder="Observações sobre o fechamento (opcional)"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </FormField>
        <button
          onClick={handleClose} disabled={busy}
          style={{
            width: "100%", padding: "11px", borderRadius: 10,
            background: busy ? B : "#37474F", color: W, border: "none",
            fontWeight: 700, fontSize: 14, cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Fechando..." : "Confirmar Fechamento"}
        </button>
      </Modal>
    </div>
  );
}

function TabFluxo() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    cashierApi.session.current()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: M }}>Carregando...</div>;

  return session ? (
    <CaixaAberto session={session} onRefresh={load} />
  ) : (
    <AberturaCaixa onOpened={load} />
  );
}

// ── Tab Contas a Receber ──────────────────────────────────────────────────────

function TabRecebiveis() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSettle, setShowSettle] = useState(null);
  const [form, setForm]         = useState({ description: "", dueDate: "", amount: "", category: "" });
  const [settlementAmount, setSettlementAmount] = useState("");
  const [busy, setBusy]         = useState(false);
  const [search, setSearch]     = useState("");

  const load = useCallback(() => {
    setLoading(true);
    financialApi.receivables.list().then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.description || !form.dueDate || !form.amount) { toast.error("Preencha todos os campos obrigatórios."); return; }
    setBusy(true);
    try {
      await financialApi.receivables.create({ ...form, amount: parseFloat(form.amount) });
      toast.success("Conta a receber criada!");
      setShowCreate(false);
      setForm({ description: "", dueDate: "", amount: "", category: "" });
      load();
    } catch (e) { toast.error(e?.response?.data?.error ?? "Erro ao criar conta."); }
    finally { setBusy(false); }
  };

  const handleSettle = async () => {
    if (!settlementAmount) { toast.error("Informe o valor recebido."); return; }
    setBusy(true);
    try {
      await financialApi.receivables.settle(showSettle.id, { amount: parseFloat(settlementAmount), performedBy: "system" });
      toast.success("Recebimento registrado!");
      setShowSettle(null);
      setSettlementAmount("");
      load();
    } catch (e) { toast.error(e?.response?.data?.error ?? "Erro ao registrar baixa."); }
    finally { setBusy(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancelar esta conta a receber?")) return;
    try {
      await financialApi.receivables.cancel(id, "system");
      toast.success("Conta cancelada.");
      load();
    } catch (e) { toast.error(e?.response?.data?.error ?? "Erro ao cancelar."); }
  };

  const filtered = list.filter(r => r.description?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
          style={{ flex: 1, ...inputStyle, minWidth: 180 }} />
        <button onClick={() => setShowCreate(true)}
          style={{ padding: "9px 18px", borderRadius: 10, background: G, color: W, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(46,125,50,0.28)" }}>
          + Nova Conta
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: M }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, color: M, fontSize: 13 }}>
          {search ? "Nenhuma conta encontrada." : "Nenhuma conta a receber cadastrada."}
        </div>
      ) : (
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${B}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#FAFAFA", borderBottom: `1px solid ${B}` }}>
                {["Descrição", "Vencimento", "Valor", "Status", "Categoria", "Ações"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((r, idx) => (
                  <motion.tr key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                    style={{ borderBottom: `1px solid ${B}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: D }}>{r.description}</td>
                    <td style={{ padding: "10px 14px", color: M }}>{fmtDate(r.dueDate)}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: G }}>{fmtBRL(r.amount)}</td>
                    <td style={{ padding: "10px 14px" }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: "10px 14px", color: M }}>{r.category || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {r.status === "PENDING" && (
                          <button onClick={() => { setShowSettle(r); setSettlementAmount(String(r.amount)); }}
                            style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: GF, color: G, border: `1px solid #A5D6A7`, cursor: "pointer" }}>
                            Baixar
                          </button>
                        )}
                        {(r.status === "PENDING" || r.status === "OVERDUE") && (
                          <button onClick={() => handleCancel(r.id)}
                            style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: RF, color: R, border: `1px solid #EF9A9A`, cursor: "pointer" }}>
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criar */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Conta a Receber" subtitle="Preencha os dados da receita">
        <FormField label="Descrição" required>
          <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Ex: Venda mesa 5" style={inputStyle} />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Vencimento" required>
            <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
              style={inputStyle} />
          </FormField>
          <FormField label="Valor (R$)" required>
            <input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="0,00" style={inputStyle} />
          </FormField>
        </div>
        <FormField label="Categoria">
          <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            placeholder="Ex: VENDA, SERVICO..." style={inputStyle} />
        </FormField>
        <button onClick={handleCreate} disabled={busy}
          style={{ width: "100%", padding: "11px", borderRadius: 10, background: busy ? B : G, color: W, border: "none", fontWeight: 700, fontSize: 14, cursor: busy ? "not-allowed" : "pointer" }}>
          {busy ? "Salvando..." : "Criar Conta a Receber"}
        </button>
      </Modal>

      {/* Modal baixar */}
      <Modal open={!!showSettle} onClose={() => setShowSettle(null)} title="Registrar Recebimento" subtitle={showSettle?.description}>
        <FormField label="Valor Recebido (R$)" required>
          <input type="number" step="0.01" value={settlementAmount} onChange={e => setSettlementAmount(e.target.value)}
            style={inputStyle} />
        </FormField>
        <button onClick={handleSettle} disabled={busy}
          style={{ width: "100%", padding: "11px", borderRadius: 10, background: busy ? B : G, color: W, border: "none", fontWeight: 700, fontSize: 14, cursor: busy ? "not-allowed" : "pointer" }}>
          {busy ? "Registrando..." : "Confirmar Recebimento"}
        </button>
      </Modal>
    </div>
  );
}

// ── Tab Contas a Pagar ────────────────────────────────────────────────────────

function TabPagaveis() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSettle, setShowSettle] = useState(null);
  const [form, setForm]         = useState({ description: "", dueDate: "", amount: "", category: "", supplier: "" });
  const [settlementAmount, setSettlementAmount] = useState("");
  const [busy, setBusy]         = useState(false);
  const [search, setSearch]     = useState("");

  const load = useCallback(() => {
    setLoading(true);
    financialApi.payables.list().then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.description || !form.dueDate || !form.amount) { toast.error("Preencha todos os campos obrigatórios."); return; }
    setBusy(true);
    try {
      await financialApi.payables.create({ ...form, amount: parseFloat(form.amount) });
      toast.success("Conta a pagar criada!");
      setShowCreate(false);
      setForm({ description: "", dueDate: "", amount: "", category: "", supplier: "" });
      load();
    } catch (e) { toast.error(e?.response?.data?.error ?? "Erro ao criar conta."); }
    finally { setBusy(false); }
  };

  const handleSettle = async () => {
    if (!settlementAmount) { toast.error("Informe o valor pago."); return; }
    setBusy(true);
    try {
      await financialApi.payables.settle(showSettle.id, { amount: parseFloat(settlementAmount), performedBy: "system" });
      toast.success("Pagamento registrado!");
      setShowSettle(null);
      setSettlementAmount("");
      load();
    } catch (e) { toast.error(e?.response?.data?.error ?? "Erro ao registrar pagamento."); }
    finally { setBusy(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancelar esta conta a pagar?")) return;
    try {
      await financialApi.payables.cancel(id, "system");
      toast.success("Conta cancelada.");
      load();
    } catch (e) { toast.error(e?.response?.data?.error ?? "Erro ao cancelar."); }
  };

  const filtered = list.filter(r => r.description?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
          style={{ flex: 1, ...inputStyle, minWidth: 180 }} />
        <button onClick={() => setShowCreate(true)}
          style={{ padding: "9px 18px", borderRadius: 10, background: R, color: W, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(198,40,40,0.22)" }}>
          + Nova Conta
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: M }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, color: M, fontSize: 13 }}>
          {search ? "Nenhuma conta encontrada." : "Nenhuma conta a pagar cadastrada."}
        </div>
      ) : (
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${B}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#FAFAFA", borderBottom: `1px solid ${B}` }}>
                {["Descrição", "Vencimento", "Valor", "Status", "Fornecedor", "Ações"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: M, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((r, idx) => (
                  <motion.tr key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                    style={{ borderBottom: `1px solid ${B}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: D }}>{r.description}</td>
                    <td style={{ padding: "10px 14px", color: M }}>{fmtDate(r.dueDate)}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: R }}>{fmtBRL(r.amount)}</td>
                    <td style={{ padding: "10px 14px" }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: "10px 14px", color: M }}>{r.supplier || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {r.status === "PENDING" && (
                          <button onClick={() => { setShowSettle(r); setSettlementAmount(String(r.amount)); }}
                            style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: GF, color: G, border: `1px solid #A5D6A7`, cursor: "pointer" }}>
                            Pagar
                          </button>
                        )}
                        {(r.status === "PENDING" || r.status === "OVERDUE") && (
                          <button onClick={() => handleCancel(r.id)}
                            style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: RF, color: R, border: `1px solid #EF9A9A`, cursor: "pointer" }}>
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criar */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Conta a Pagar" subtitle="Preencha os dados da despesa">
        <FormField label="Descrição" required>
          <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Ex: Compra de insumos" style={inputStyle} />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Vencimento" required>
            <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
              style={inputStyle} />
          </FormField>
          <FormField label="Valor (R$)" required>
            <input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="0,00" style={inputStyle} />
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Categoria">
            <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              placeholder="Ex: INSUMO, ALUGUEL..." style={inputStyle} />
          </FormField>
          <FormField label="Fornecedor">
            <input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))}
              placeholder="Nome do fornecedor" style={inputStyle} />
          </FormField>
        </div>
        <button onClick={handleCreate} disabled={busy}
          style={{ width: "100%", padding: "11px", borderRadius: 10, background: busy ? B : R, color: W, border: "none", fontWeight: 700, fontSize: 14, cursor: busy ? "not-allowed" : "pointer" }}>
          {busy ? "Salvando..." : "Criar Conta a Pagar"}
        </button>
      </Modal>

      {/* Modal pagar */}
      <Modal open={!!showSettle} onClose={() => setShowSettle(null)} title="Registrar Pagamento" subtitle={showSettle?.description}>
        <FormField label="Valor Pago (R$)" required>
          <input type="number" step="0.01" value={settlementAmount} onChange={e => setSettlementAmount(e.target.value)}
            style={inputStyle} />
        </FormField>
        <button onClick={handleSettle} disabled={busy}
          style={{ width: "100%", padding: "11px", borderRadius: 10, background: busy ? B : G, color: W, border: "none", fontWeight: 700, fontSize: 14, cursor: busy ? "not-allowed" : "pointer" }}>
          {busy ? "Registrando..." : "Confirmar Pagamento"}
        </button>
      </Modal>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  {
    key: "fluxo", label: "Fluxo de Caixa",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
  {
    key: "receber", label: "Contas a Receber",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  },
  {
    key: "pagar", label: "Contas a Pagar",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>,
  },
];

export default function Financeiro() {
  const [tab, setTab] = useState("fluxo");

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F5F5F5", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <Sidebar />

      <motion.div className="flex-1 p-6 pt-4"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 4, height: 28, borderRadius: 4, background: `linear-gradient(180deg, ${O}, ${G})` }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: D, margin: 0 }}>Financeiro</h1>
          </div>
          <p style={{ fontSize: 13, color: M, marginLeft: 16 }}>Contas a receber, contas a pagar e fluxo de caixa</p>
        </div>

        {/* Card container com tabs */}
        <div style={{ background: W, borderRadius: 16, border: `1px solid ${B}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: `1px solid ${B}`, overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "13px 20px", fontSize: 13, fontWeight: 600,
                  color: tab === t.key ? G : M, background: "transparent", border: "none",
                  borderBottom: tab === t.key ? `2.5px solid ${G}` : "2.5px solid transparent",
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  transition: "color 0.15s, border-bottom-color 0.15s",
                }}
                onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.color = D; }}
                onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.color = M; }}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: 20 }}>
            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}>
                {tab === "fluxo"   && <TabFluxo />}
                {tab === "receber" && <TabRecebiveis />}
                {tab === "pagar"   && <TabPagaveis />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
