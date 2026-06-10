export function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const atIndex = email.indexOf('@');
  const local = email.substring(0, atIndex);
  const domain = email.substring(atIndex);
  const visible = Math.min(3, Math.max(1, local.length - 1));
  return local.substring(0, visible) + '***' + domain;
}
