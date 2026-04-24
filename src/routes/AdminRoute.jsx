import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ADMIN_ROLES } from '../constants/roles';

export default function AdminRoute({ children, roles = ADMIN_ROLES }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!roles.includes(user?.role?.toLowerCase())) return <Navigate to="/pedido" replace />;
  return children;
}
