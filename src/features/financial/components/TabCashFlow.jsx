import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { palette } from "@styles/ds";
import { cashierApi } from "@core/api/cashier";
import { useCashierSocket } from '../hooks/useCashierSocket';
import OpenCashier from "./OpenCashier";
import OpenCashierView from "./OpenCashierView";
import { QK } from "../constants";

export default function TabCashFlow() {
  const qc = useQueryClient();

  const { data: session, isLoading, isError, error } = useQuery({
    queryKey: QK.session,
    queryFn:  () => cashierApi.session.current(),
    staleTime: 30_000,
    retry:     1,
  });

  const handleMovement = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["cashier", "movements"] });
    qc.invalidateQueries({ queryKey: QK.pendingOrders });
  }, [qc]);

  const handleSession = useCallback(() => {
    qc.invalidateQueries({ queryKey: QK.session });
  }, [qc]);

  useCashierSocket(handleMovement, handleSession);

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: 40, color: palette.textMuted }}>Carregando...</div>;
  }

  if (isError) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: palette.red, marginBottom: 8 }}>Erro ao carregar sessão de caixa</div>
        <div style={{ fontSize: 12, color: palette.textMuted }}>
          {error?.response?.data?.error ?? error?.message ?? "Tente recarregar a página."}
        </div>
      </div>
    );
  }

  return session ? <OpenCashierView session={session} /> : <OpenCashier />;
}
