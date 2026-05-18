import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseJwt, isTokenExpired } from '../utils/jwt';
import { clearTokens, setToken, setRefreshToken } from '../services/api/client';

function normalizeUser(payload) {
  if (!payload) return null;
  return {
    ...payload,
    role: typeof payload.role === 'string' ? payload.role.toLowerCase() : payload.role,
  };
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,

      signIn(jwt, refresh = null) {
        const tokenString = typeof jwt === 'object' ? jwt.token : jwt;
        if (!tokenString || isTokenExpired(tokenString)) return;

        setToken(tokenString);
        if (refresh) setRefreshToken(refresh);

        set({
          token: tokenString,
          refreshToken: refresh,
          user: normalizeUser(parseJwt(tokenString)),
        });
      },

      signOut() {
        clearTokens();
        set({ token: null, refreshToken: null, user: null });
      },

      hydrate() {
        const { token } = get();
        if (!token || isTokenExpired(token)) {
          clearTokens();
          set({ token: null, refreshToken: null, user: null });
          return;
        }
        setToken(token);
      },

      isAuthenticated() {
        const { token } = get();
        return !!token && !isTokenExpired(token);
      },

      hasRole(...roles) {
        const { user } = get();
        if (!user) return false;
        return roles.some((r) => r.toLowerCase() === user.role);
      },
    }),
    {
      name: 'serveflow-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
