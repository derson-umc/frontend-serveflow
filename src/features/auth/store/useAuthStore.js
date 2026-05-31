import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { parseJwt, isTokenExpired } from '@shared/utils/jwt';
import { clearTokens, setToken, setRefreshToken, SESSION_GUARD_KEY } from '@core/api/client';
import { authApi } from '../services/authApi';

function writeSessionGuard(username) {
  const id = crypto.randomUUID?.() ?? Date.now().toString(36);
  localStorage.setItem(SESSION_GUARD_KEY, JSON.stringify({ id, username }));
}

function readSessionGuard() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_GUARD_KEY));
  } catch {
    return null;
  }
}

const sessionStorageAdapter = createJSONStorage(() => sessionStorage);

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

        const payload = parseJwt(tokenString);
        setToken(tokenString);
        if (refresh) setRefreshToken(refresh);
        writeSessionGuard(payload?.sub);

        set({
          token: tokenString,
          refreshToken: refresh,
          user: normalizeUser(payload),
        });
      },

      signOut() {
        authApi.logout().catch(() => {});
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

        const payload = parseJwt(token);
        const guard   = readSessionGuard();

        // Se existe um guard com usuário diferente, outra sessão tomou conta do navegador.
        if (guard && guard.username !== payload?.sub) {
          clearTokens();
          set({ token: null, refreshToken: null, user: null });
          return;
        }

        setToken(token);
        set({ user: normalizeUser(payload) });
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
      storage: sessionStorageAdapter,
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
