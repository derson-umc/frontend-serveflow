import { z } from "zod";
import { palette } from "@styles/ds";
import { PASSWORD_MIN, PASSWORD_MAX } from "@shared/utils/validators";

export { PASSWORD_MIN, PASSWORD_MAX };

export const STRENGTH_COLORS = [palette.border, "#EF9A9A", "#EF5350", "#43A047", palette.green, palette.greenDark];

export const schema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(PASSWORD_MIN, `Mínimo ${PASSWORD_MIN} caracteres`)
      .max(PASSWORD_MAX, "Senha muito longa"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "A nova senha deve ser diferente da atual",
    path: ["newPassword"],
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export function passwordStrength(value = "") {
  if (!value) return 0;
  let s = 0;
  if (value.length >= PASSWORD_MIN) s++;
  if (value.length >= 10) s++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
  if (/[0-9]/.test(value)) s++;
  if (/[^A-Za-z0-9]/.test(value)) s++;
  return Math.min(s, 5);
}
