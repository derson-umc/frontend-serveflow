import { PASSWORD_MIN } from '@shared/utils/validators';

export function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function passwordStrength(value = '') {
  if (!value) return 0;
  let s = 0;
  if (value.length >= PASSWORD_MIN)                          s++;
  if (value.length >= 10)                                    s++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value))           s++;
  if (/[0-9]/.test(value))                                   s++;
  if (/[^A-Za-z0-9]/.test(value))                           s++;
  return Math.min(s, 5);
}

export function getLoginError(err) {
  const s = err?.response?.status;
  if (!s) return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  if (s === 401 || s === 404 || s === 422) return 'Usuário ou senha inválidos.';
  return `Erro no servidor (${s}). Tente novamente.`;
}

export function roleToRoute(role = '') {
  const r = role.toLowerCase();
  if (r === 'cozinheiro') return '/kds';
  if (r === 'garcon')     return '/menu';
  return '/dashboard';
}
