export const ROLE_LABELS = {
  ADMIN: "Admin",
  GERENTE: "Gerente",
  CAIXA: "Caixa",
  GARCON: "Garçom",
  COZINHEIRO: "Cozinheiro",
  USER: "Usuário",
};

export const ROLE_OPTIONS = [
  { value: "GERENTE", label: "Gerente" },
  { value: "CAIXA", label: "Caixa" },
  { value: "GARCON", label: "Garçom" },
  { value: "COZINHEIRO", label: "Cozinheiro" },
  { value: "USER", label: "Usuário" },
  { value: "ADMIN", label: "Admin" },
];

export const ROLE_COLORS = {
  ADMIN: { bg: "rgba(228,96,51,0.15)", color: "#f07040", border: "rgba(228,96,51,0.3)" },
  GERENTE: { bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.3)" },
  CAIXA: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  GARCON: { bg: "rgba(52,211,153,0.1)", color: "#4ade80", border: "rgba(52,211,153,0.25)" },
  COZINHEIRO: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  USER: { bg: "rgba(255,255,255,0.05)", color: "#a8a29e", border: "rgba(255,255,255,0.1)" },
};

export const EMPTY_FORM = { username: "", email: "", jobposition: "", role: "GARCON", password: "", confirmPassword: "" };
