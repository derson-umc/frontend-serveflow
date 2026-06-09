import { palette } from "@styles/ds";

export const fmtBRL = (v) => {
  const n = parseFloat(v ?? 0);
  return (isNaN(n) ? 0 : n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const FALLBACK_METRICS = {
  revenueToday: 0, ordersToday: 0, customersToday: 0, ticketMedio: 0,
  revenueYesterday: 0, ordersYesterday: 0, customersYesterday: 0, ticketMedioYesterday: 0,
};

export const PAYMENT_LABELS = {
  DINHEIRO: "Dinheiro",
  CREDITO: "Cartão Crédito",
  DEBITO: "Cartão Débito",
  PIX: "PIX",
  VOUCHER: "Vale-refeição",
  MISTO: "Misto",
  SEM_PAGAMENTO: "Sem pgto",
};

export const PIE_COLORS = [palette.green, palette.orange, palette.blue, "#6A1B9A", "#F57C00", "#0097A7"];
