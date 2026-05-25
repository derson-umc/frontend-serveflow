import { palette } from "@styles/ds";

export const QK = {
  session:       ["cashier", "session"],
  sessions:      ["cashier", "sessions"],
  movements:     (id) => ["cashier", "movements", id],
  pendingOrders: ["cashier", "orders", "pending"],
  receivables:   ["financial", "receivables"],
  payables:      ["financial", "payables"],
};

export const fmtBRL = (v) =>
  Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDate = (s) => {
  if (!s) return "—";
  const [y, m, d] = String(s).split("-");
  return `${d}/${m}/${y}`;
};

export const toDate = (v) => {
  if (!v) return null;
  if (Array.isArray(v)) return new Date(v[0], v[1] - 1, v[2], v[3] ?? 0, v[4] ?? 0);
  return new Date(v);
};

export const toDateStr = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v.slice(0, 10);
  if (Array.isArray(v)) {
    const [y, m, d] = v;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return new Date(v).toISOString().slice(0, 10);
};

export const fmtDateTime = (s) => {
  const d = toDate(s);
  if (!d) return "—";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const GY  = "#546E7A";
const GYF = "#ECEFF1";

export const STATUS_CFG = {
  PENDING:   { label: "Pendente",  color: palette.orange, bg: palette.orangeSurface, border: palette.orangeBorder },
  RECEIVED:  { label: "Recebida",  color: palette.green,  bg: palette.greenSurface,  border: palette.greenBorder  },
  PAID:      { label: "Paga",      color: palette.green,  bg: palette.greenSurface,  border: palette.greenBorder  },
  OVERDUE:   { label: "Vencida",   color: palette.red,    bg: palette.redSurface,    border: palette.redBorder    },
  CANCELLED: { label: "Cancelada", color: GY,             bg: GYF,                   border: "#B0BEC5"            },
};

export const PAYMENT_LABELS = {
  DINHEIRO:       "Dinheiro",
  CARTAO_DEBITO:  "Cartão Débito",
  CARTAO_CREDITO: "Cartão Crédito",
  PIX:            "Pix",
  CHEQUE:         "Cheque",
  TICKET:         "Ticket",
};

export const PAYMENT_ICONS = {
  DINHEIRO:       "R$",
  CARTAO_DEBITO:  "DB",
  CARTAO_CREDITO: "CC",
  PIX:            "PIX",
  CHEQUE:         "CHQ",
  TICKET:         "TKT",
};

export const PAYMENT_KEYS = Object.keys(PAYMENT_LABELS);

export const TYPE_CFG = {
  MESA:     { label: "Mesa",     bg: "#E3F2FD", color: "#1565C0", border: "#90CAF9" },
  DELIVERY: { label: "Delivery", bg: "#F3E5F5", color: "#6A1B9A", border: "#CE93D8" },
  BALCAO:   { label: "Balcão",   bg: "#E8F5E9", color: "#1B5E20", border: "#A5D6A7" },
};

export function normPayment(cat) {
  return cat?.toUpperCase().replace(/[-\s]/g, "_") ?? "";
}

export function groupByPayment(movements, type) {
  const result = {};
  PAYMENT_KEYS.forEach((k) => { result[k] = 0; });
  result["OUTROS"] = 0;
  movements.filter((m) => m.type === type).forEach((m) => {
    const key = normPayment(m.category);
    if (PAYMENT_KEYS.includes(key)) result[key] += Number(m.amount);
    else result["OUTROS"] += Number(m.amount);
  });
  return result;
}

export function detectOrderType(description) {
  if (!description) return null;
  const d = description.toLowerCase();
  if (d.includes("delivery"))                        return "DELIVERY";
  if (d.includes("mesa"))                            return "MESA";
  if (d.includes("balcão") || d.includes("balcao")) return "BALCAO";
  return null;
}

export function detectShift(hour) {
  if (hour >= 6  && hour < 12) return "MANHÃ";
  if (hour >= 12 && hour < 18) return "TARDE";
  return "NOITE";
}
