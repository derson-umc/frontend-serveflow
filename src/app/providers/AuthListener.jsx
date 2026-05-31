import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { SESSION_GUARD_KEY } from '@core/api/client';

export function AuthListener() {
  const signOut  = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  useEffect(() => {
    function handleLogout() {
      signOut();
      navigate('/', { replace: true });
    }
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [signOut, navigate]);

  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key !== SESSION_GUARD_KEY) return;

      const store = useAuthStore.getState();
      if (!store.isAuthenticated()) return;

      let newGuard = null;
      try { newGuard = e.newValue ? JSON.parse(e.newValue) : null; } catch { /* ignore */ }

      // Outro usuário fez login (ou alguém fez logout) nesta mesma janela do navegador
      const sameUser = newGuard?.username === store.user?.sub;
      if (!sameUser) {
        store.signOut();
        navigate('/', { replace: true });
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  return null;
}
