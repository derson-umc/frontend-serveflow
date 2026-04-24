import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

function loadStoredToken() {
  const t = localStorage.getItem('token');
  if (!t) return null;
  if (isTokenExpired(t)) {
    localStorage.removeItem('token');
    return null;
  }
  return t;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(loadStoredToken);
  const [user, setUser] = useState(() => {
    const t = loadStoredToken();
    return t ? parseJwt(t) : null;
  });

  const signIn = useCallback((jwt) => {
    const tokenString = typeof jwt === 'object' ? jwt.token : jwt;
    if (!tokenString) return;
    if (isTokenExpired(tokenString)) return;
    localStorage.setItem('token', tokenString);
    setToken(tokenString);
    setUser(parseJwt(tokenString));
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, signIn, signOut, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(nullable = false) {
  const context = useContext(AuthContext);
  if (!context && !nullable) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
