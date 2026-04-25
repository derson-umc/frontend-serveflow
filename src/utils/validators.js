export const USERNAME_MIN = 3;
export const USERNAME_MAX = 64;
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 128;

export function validateUsername(value) {
  const v = (value || "").trim();
  if (!v) return { valid: false, hint: "Usuário é obrigatório" };
  if (v.length < USERNAME_MIN) return { valid: false, hint: `Mínimo ${USERNAME_MIN} caracteres` };
  if (v.length > USERNAME_MAX) return { valid: false, hint: "Usuário muito longo" };
  if (!/^[a-zA-Z0-9._-]+$/.test(v)) return { valid: false, hint: "Use apenas letras, números, . _ -" };
  return { valid: true, hint: "Disponível" };
}

export function validatePassword(value) {
  const v = value || "";
  if (!v) return { valid: false, hint: "Senha é obrigatória", strength: 0 };
  if (v.length > PASSWORD_MAX) return { valid: false, hint: "Senha muito longa", strength: 0 };

  let strength = 0;
  if (v.length >= PASSWORD_MIN) strength++;
  if (v.length >= 10) strength++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) strength++;
  if (/[0-9]/.test(v)) strength++;
  if (/[^A-Za-z0-9]/.test(v)) strength++;

  const labels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte", "Excelente"];
  return {
    valid: v.length >= PASSWORD_MIN,
    hint: v.length < PASSWORD_MIN ? `Mínimo ${PASSWORD_MIN} caracteres` : labels[strength],
    strength: Math.min(strength, 5),
  };
}
