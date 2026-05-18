import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ADMIN_ROLES } from '../constants/roles';

export default function AdminRoute({ children, roles = ADMIN_ROLES }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!roles.includes(user?.role?.toLowerCase())) return <Navigate to="/pedido" replace />;
  return children;
}
