import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { ADMIN_ROLES } from '@core/constants/roles';

export default function AdminRoute({ children, roles = ADMIN_ROLES }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user            = useAuthStore((s) => s.user);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!roles.includes(user?.role)) return <Navigate to="/menu" replace />;
  return children;
}
