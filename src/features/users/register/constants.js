import { z } from "zod";

export const ROLES = [
  { value: "gerente",    label: "Gerente",    desc: "Acesso administrativo", icon: "🏢" },
  { value: "caixa",      label: "Caixa",      desc: "Pagamentos e vendas",   icon: "💳" },
  { value: "garcon",     label: "Garçom",     desc: "Atendimento e pedidos", icon: "🍽️" },
  { value: "cozinheiro", label: "Cozinheiro", desc: "Preparo e produção",    icon: "👨‍🍳" },
];

export const schema = z.object({
  username:    z.string().min(3, "Mínimo 3 caracteres").max(64, "Máximo 64 caracteres").regex(/^[a-zA-Z0-9._-]+$/, "Use apenas letras, números, . _ -"),
  password:    z.string().min(8, "Mínimo 8 caracteres").max(128, "Senha muito longa"),
  role:        z.enum(["gerente", "caixa", "garcon", "cozinheiro"]),
  jobposition: z.string().min(2, "Informe o cargo").max(100, "Cargo muito longo"),
});
