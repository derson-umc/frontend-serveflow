import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { palette } from "@styles/ds";
import { useAuthStore } from "@features/auth/store/useAuthStore";
import { cashierApi } from "@core/api/cashier";
import { toast } from "@shared/components/feedback/Toast";
import FormField, { inputStyle } from "./FormField";
import { QK, fmtBRL, fmtDateTime, detectShift } from "../constants";

export default function OpenCashier() {
  const qc       = useQueryClient();
  const { user } = useAuthStore();
  const now      = useMemo(() => new Date(), []);
  const autoShift = useMemo(() => detectShift(now.getHours()), [now]);

  const [form,   setForm]   = useState({ initialBalance: "", turno: autoShift, observation: "" });
  const [errors, setErrors] = useState({});

  const { data: sessions = [] } = useQuery({
    queryKey: QK.sessions,
    queryFn:  () => cashierApi.session.list(),
    staleTime: 60_000,
  });

  const lastSession = useMemo(
    () => sessions.find((s) => s.status === "CLOSED") ?? null,
    [sessions]
  );

  const openSession = useMutation({
    mutationFn: (data) => cashierApi.session.open(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.session });
      toast.success("Caixa aberto com sucesso!");
    },
    onError: (e) => toast.error(e?.response?.data?.error ?? "Erro ao abrir caixa."),
  });

  const validate = () => {
    const errs = {};
    const val  = form.initialBalance;
    if (val === "" || val == null) errs.initialBalance = "Informe o fundo de caixa.";
    else if (parseFloat(val) < 0) errs.initialBalance = "O valor não pode ser negativo.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || openSession.isPending) return;
    const parts = [`Turno: ${form.turno}`, form.observation.trim()].filter(Boolean);
    openSession.mutate({
      initialBalance: parseFloat(form.initialBalance),
      observation:    parts.join(" · ") || null,
    });
  };

  const dateLabel     = now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const timeLabel     = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const operatorLabel = user?.sub ?? user?.username ?? "—";
  const roStyle       = { ...inputStyle, background: palette.surface, color: palette.textMuted, cursor: "default", userSelect: "none" };

  return (
    <div style={{ maxWidth: 540, margin: "20px auto" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: palette.white, border: `1px solid ${palette.border}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: palette.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            Última Sessão
          </div>
          {lastSession ? (
            <>
              <div style={{ fontSize: 17, fontWeight: 800, color: palette.textPrimary }}>{fmtBRL(lastSession.initialBalance)}</div>
              <div style={{ fontSize: 11, color: palette.textMuted, marginTop: 3 }}>Fundo inicial · {lastSession.openedBy}</div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: palette.textMuted }}>Sem registros anteriores</div>
          )}
        </div>

        <div style={{ background: palette.white, border: `1px solid ${palette.border}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: palette.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            Último Fechamento
          </div>
          {lastSession?.closedAt ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary }}>{fmtDateTime(lastSession.closedAt)}</div>
              <div style={{ fontSize: 11, color: palette.textMuted, marginTop: 3 }}>Encerrado por {lastSession.closedBy ?? "—"}</div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: palette.textMuted }}>Sem fechamento anterior</div>
          )}
        </div>
      </div>

      <div style={{ background: palette.white, borderRadius: 12, border: `1px solid ${palette.border}`, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${palette.border}`, background: palette.surface, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: palette.greenSurface, border: `1px solid ${palette.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={palette.green} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: palette.textPrimary }}>Abertura de Caixa</div>
            <div style={{ fontSize: 11, color: palette.textMuted }}>Preencha os dados para iniciar o turno</div>
          </div>
        </div>

        <div style={{ padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Responsável</div>
              <div style={{ ...roStyle, display: "flex", alignItems: "center", gap: 7 }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {operatorLabel}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Data / Hora</div>
              <div style={{ ...roStyle, display: "flex", alignItems: "center", gap: 7, overflow: "hidden" }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {dateLabel} · {timeLabel}
                </span>
              </div>
            </div>
          </div>

          <FormField label="Turno" required>
            <select value={form.turno} onChange={(e) => setForm((p) => ({ ...p, turno: e.target.value }))} style={inputStyle}>
              <option value="MANHÃ">Manhã  —  06:00 às 12:00</option>
              <option value="TARDE">Tarde  —  12:00 às 18:00</option>
              <option value="NOITE">Noite  —  18:00 às 06:00</option>
            </select>
          </FormField>

          <FormField label="Fundo de Caixa (R$)" required>
            <input
              type="number" step="0.01" min="0"
              value={form.initialBalance}
              onChange={(e) => {
                setForm((p) => ({ ...p, initialBalance: e.target.value }));
                setErrors((p) => ({ ...p, initialBalance: undefined }));
              }}
              placeholder="0,00"
              style={{ ...inputStyle, borderColor: errors.initialBalance ? palette.red : undefined }}
              autoFocus
            />
            {errors.initialBalance && (
              <div style={{ fontSize: 11, color: palette.red, marginTop: 4 }}>{errors.initialBalance}</div>
            )}
          </FormField>

          <FormField label="Observação">
            <textarea
              value={form.observation}
              onChange={(e) => setForm((p) => ({ ...p, observation: e.target.value }))}
              placeholder="Informações adicionais sobre a abertura (opcional)"
              rows={2}
              style={{ ...inputStyle, resize: "none" }}
            />
          </FormField>

          <button
            onClick={handleSubmit}
            disabled={openSession.isPending}
            style={{
              width: "100%", padding: "11px", borderRadius: 10, border: "none",
              background: openSession.isPending ? palette.border : palette.green,
              color: palette.white, fontWeight: 700, fontSize: 14,
              cursor: openSession.isPending ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {openSession.isPending ? (
              <>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animation: "spin 0.8s linear infinite" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Abrindo...
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Abrir Caixa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
