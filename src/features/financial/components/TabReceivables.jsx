import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { palette } from "@styles/ds";
import { financialApi } from "@core/api/financial";
import { toast } from "@shared/components/feedback/Toast";
import { Modal } from "@shared/components/ui/Modal";
import FormField, { inputStyle } from "./FormField";
import StatusBadge from "./StatusBadge";
import { QK, fmtBRL, fmtDate } from "../constants";

export default function TabReceivables() {
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [showSettle, setShowSettle] = useState(null);
  const [form,       setForm]       = useState({ description: "", dueDate: "", amount: "", category: "" });
  const [settleAmt,  setSettleAmt]  = useState("");
  const [search,     setSearch]     = useState("");

  const { data: list = [], isLoading } = useQuery({
    queryKey: QK.receivables,
    queryFn:  () => financialApi.receivables.list(),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => financialApi.receivables.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.receivables });
      toast.success("Conta a receber criada!");
      setShowCreate(false);
      setForm({ description: "", dueDate: "", amount: "", category: "" });
    },
    onError: (e) => toast.error(e?.response?.data?.error ?? "Erro ao criar conta."),
  });

  const settleMutation = useMutation({
    mutationFn: ({ id, amount }) => financialApi.receivables.settle(id, { amount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.receivables });
      toast.success("Recebimento registrado!");
      setShowSettle(null);
      setSettleAmt("");
    },
    onError: (e) => toast.error(e?.response?.data?.error ?? "Erro ao registrar baixa."),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => financialApi.receivables.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.receivables });
      toast.success("Conta cancelada.");
    },
    onError: (e) => toast.error(e?.response?.data?.error ?? "Erro ao cancelar."),
  });

  const handleCreate = () => {
    if (!form.description || !form.dueDate || !form.amount) { toast.error("Preencha todos os campos obrigatórios."); return; }
    createMutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  const handleSettle = () => {
    if (!settleAmt) { toast.error("Informe o valor recebido."); return; }
    settleMutation.mutate({ id: showSettle.id, amount: parseFloat(settleAmt) });
  };

  const filtered = list.filter((r) => r.description?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." style={{ flex: 1, ...inputStyle, minWidth: 180 }} />
        <button onClick={() => setShowCreate(true)} style={{ padding: "9px 18px", borderRadius: 10, background: palette.green, color: palette.white, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(46,125,50,0.28)" }}>
          + Nova Conta
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 32, color: palette.textMuted }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, color: palette.textMuted, fontSize: 13 }}>
          {search ? "Nenhuma conta encontrada." : "Nenhuma conta a receber cadastrada."}
        </div>
      ) : (
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${palette.border}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: palette.surface, borderBottom: `1px solid ${palette.border}` }}>
                {["Descrição", "Vencimento", "Valor", "Status", "Categoria", "Ações"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((r, idx) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                    style={{ borderBottom: `1px solid ${palette.border}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = palette.surface)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: palette.textPrimary }}>{r.description}</td>
                    <td style={{ padding: "10px 14px", color: palette.textMuted }}>{fmtDate(r.dueDate)}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: palette.green }}>{fmtBRL(r.amount)}</td>
                    <td style={{ padding: "10px 14px" }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: "10px 14px", color: palette.textMuted }}>{r.category || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {r.status === "PENDING" && (
                          <button onClick={() => { setShowSettle(r); setSettleAmt(String(r.amount)); }}
                            style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: palette.greenSurface, color: palette.green, border: `1px solid ${palette.greenBorder}`, cursor: "pointer" }}>
                            Baixar
                          </button>
                        )}
                        {(r.status === "PENDING" || r.status === "OVERDUE") && (
                          <button onClick={() => { if (window.confirm("Cancelar esta conta?")) cancelMutation.mutate(r.id); }}
                            style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: palette.redSurface, color: palette.red, border: `1px solid ${palette.redBorder}`, cursor: "pointer" }}>
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Conta a Receber">
        <FormField label="Descrição" required>
          <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Ex: Venda mesa 5" style={inputStyle} />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Vencimento" required>
            <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} style={inputStyle} />
          </FormField>
          <FormField label="Valor (R$)" required>
            <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0,00" style={inputStyle} />
          </FormField>
        </div>
        <FormField label="Categoria">
          <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Ex: VENDA, SERVICO..." style={inputStyle} />
        </FormField>
        <button onClick={handleCreate} disabled={createMutation.isPending}
          style={{ width: "100%", padding: "11px", borderRadius: 10, background: createMutation.isPending ? palette.border : palette.green, color: palette.white, border: "none", fontWeight: 700, fontSize: 14, cursor: createMutation.isPending ? "not-allowed" : "pointer" }}>
          {createMutation.isPending ? "Salvando..." : "Criar Conta a Receber"}
        </button>
      </Modal>

      <Modal open={!!showSettle} onClose={() => setShowSettle(null)} title="Registrar Recebimento" subtitle={showSettle?.description}>
        <FormField label="Valor Recebido (R$)" required>
          <input type="number" step="0.01" value={settleAmt} onChange={(e) => setSettleAmt(e.target.value)} style={inputStyle} />
        </FormField>
        <button onClick={handleSettle} disabled={settleMutation.isPending}
          style={{ width: "100%", padding: "11px", borderRadius: 10, background: settleMutation.isPending ? palette.border : palette.green, color: palette.white, border: "none", fontWeight: 700, fontSize: 14, cursor: settleMutation.isPending ? "not-allowed" : "pointer" }}>
          {settleMutation.isPending ? "Registrando..." : "Confirmar Recebimento"}
        </button>
      </Modal>
    </div>
  );
}
