import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { roleToRoute } from '@features/auth/utils';

export default function RoleRoute({ children, roles, redirectTo }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user            = useAuthStore((s) => s.user);
  const location        = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    const target = redirectTo ?? roleToRoute(user?.role ?? '');
    return <Navigate to={target} replace />;
  }

  return children;
}
