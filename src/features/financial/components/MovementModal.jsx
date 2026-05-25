import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { palette } from "@styles/ds";
import { Modal } from "@shared/components/ui/Modal";
import { toast } from "@shared/components/feedback/Toast";
import { cashierApi } from "@core/api/cashier";
import FormField, { inputStyle } from "./FormField";
import { QK, PAYMENT_KEYS, PAYMENT_LABELS } from "../constants";

const EMPTY_FORM = { amount: "", description: "", category: "" };

export default function MovementModal({ open, onClose, type, sessionId }) {
  const qc             = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);

  const addMovement = useMutation({
    mutationFn: (data) => cashierApi.movements.create(sessionId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QK.movements(sessionId) });
      toast.success(vars.type === "INCOME" ? "Entrada registrada!" : "Saída registrada!");
      onClose();
      setForm(EMPTY_FORM);
    },
    onError: (e) => toast.error(e?.response?.data?.error ?? "Erro ao registrar movimento."),
  });

  const handleSubmit = () => {
    if (!form.amount || !form.description) { toast.error("Preencha valor e descrição."); return; }
    addMovement.mutate({ type, amount: parseFloat(form.amount), description: form.description, category: form.category || null });
  };

  const isIncome = type === "INCOME";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isIncome ? "Entrada Manual" : "Sangria / Saída"}
      subtitle={isIncome ? "Use apenas para ajustes. Pedidos são lançados automaticamente." : "Registre retiradas de caixa ou despesas operacionais."}
    >
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ background: "#FFF8E1", border: "1px solid #FFE082", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 11, color: "#795548" }}>
        <strong>Atenção:</strong>{" "}
        {isIncome ? "Pedidos finalizados são registrados automaticamente." : "Use para despesas como troco, sangria ou compras emergenciais."}
      </div>

      <FormField label="Valor (R$)" required>
        <input
          type="number" step="0.01" min="0.01"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          placeholder="0,00"
          style={inputStyle}
          autoFocus
        />
      </FormField>

      <FormField label="Descrição" required>
        <input
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder={isIncome ? "Ex: Reforço de troco" : "Ex: Compra de gás"}
          style={inputStyle}
        />
      </FormField>

      <FormField label="Forma de Pagamento">
        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} style={inputStyle}>
          <option value="">Selecione...</option>
          {PAYMENT_KEYS.map((k) => <option key={k} value={k}>{PAYMENT_LABELS[k]}</option>)}
        </select>
      </FormField>

      <button
        onClick={handleSubmit}
        disabled={addMovement.isPending}
        style={{
          width: "100%", padding: "11px", borderRadius: 10,
          background: addMovement.isPending ? palette.border : isIncome ? palette.green : palette.red,
          color: palette.white, border: "none", fontWeight: 700, fontSize: 14,
          cursor: addMovement.isPending ? "not-allowed" : "pointer",
        }}
      >
        {addMovement.isPending ? "Registrando..." : isIncome ? "Confirmar Entrada" : "Confirmar Saída"}
      </button>
    </Modal>
  );
}
