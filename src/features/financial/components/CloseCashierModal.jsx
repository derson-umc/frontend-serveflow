import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { palette } from "@styles/ds";
import { Modal } from "@shared/components/ui/Modal";
import { toast } from "@shared/components/feedback/Toast";
import { cashierApi } from "@core/api/cashier";
import FormField, { inputStyle } from "./FormField";
import { QK, fmtBRL } from "../constants";

export default function CloseCashierModal({ open, onClose, sessionId, totalIncome, totalExpense, currentBalance }) {
  const qc               = useQueryClient();
  const [closeObs, setCloseObs] = useState("");
  const balancePos       = currentBalance >= 0;

  const closeSession = useMutation({
    mutationFn: (obs) => cashierApi.session.close(sessionId, { closingObservation: obs || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.session });
      toast.success("Caixa fechado com sucesso!");
      onClose();
    },
    onError: (e) => toast.error(e?.response?.data?.error ?? "Erro ao fechar caixa."),
  });

  const summary = [
    { label: "Entradas",    value: totalIncome,    color: palette.green, bg: palette.greenSurface },
    { label: "Saídas",      value: totalExpense,   color: palette.red,   bg: palette.redSurface   },
    { label: "Saldo Final", value: currentBalance, color: balancePos ? palette.green : palette.red, bg: balancePos ? palette.greenSurface : palette.redSurface },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth={520}
      title="Fechar Caixa"
      subtitle="Revise o resumo antes de encerrar o turno"
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {summary.map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: bg, borderRadius: 10, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color }}>{fmtBRL(value)}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#E3F2FD", border: "1px solid #90CAF9", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 11, color: "#1565C0" }}>
        <strong>Aviso:</strong> Movimentos automáticos de pedidos estão incluídos no saldo.
      </div>

      <FormField label="Observação de Fechamento">
        <textarea
          value={closeObs}
          onChange={(e) => setCloseObs(e.target.value)}
          placeholder="Observações sobre o fechamento (opcional)"
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </FormField>

      <button
        onClick={() => closeSession.mutate(closeObs)}
        disabled={closeSession.isPending}
        style={{
          width: "100%", padding: "11px", borderRadius: 10,
          background: closeSession.isPending ? palette.border : "#37474F",
          color: palette.white, border: "none", fontWeight: 700, fontSize: 14,
          cursor: closeSession.isPending ? "not-allowed" : "pointer",
        }}
      >
        {closeSession.isPending ? "Fechando..." : "Confirmar Fechamento"}
      </button>
    </Modal>
  );
}
