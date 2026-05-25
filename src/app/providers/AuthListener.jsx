import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/useAuthStore';

export function AuthListener() {
  const signOut  = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  useEffect(() => {
    function handleLogout() {
      signOut();
      navigate('/login', { replace: true });
    }
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [signOut, navigate]);

  return null;
}
