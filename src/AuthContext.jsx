import { createContext, useContext, useState, useCallback } from 'react';
import { parseJwt, isTokenExpired, loadStoredToken } from './utils/jwt';

const AuthContext = createContext(null);

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
