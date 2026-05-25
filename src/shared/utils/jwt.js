export function parseJwt(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

export function loadStoredToken() {
  const token = sessionStorage.getItem('token');
  if (!token) return null;
  if (isTokenExpired(token)) {
    sessionStorage.removeItem('token');
    return null;
  }
  return token;
}
