import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

/**
 * Guard unificado.
 * AuthContext já normaliza user.role para lowercase.
 *  - Sem prop `roles`: basta estar autenticado.
 *  - Com `roles`: precisa que o user tenha uma das roles (lowercase).
 */
export default function RoleRoute({ children, roles, redirectTo = "/pedido" }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
