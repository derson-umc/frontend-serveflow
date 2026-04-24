import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function parseJwt(token) {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

export default function AdminRoute({ children, roles = ["root", "admin"] }) {
  const { isAuthenticated, user } = useAuth();
  const token = localStorage.getItem("token");
  const tokenValid = !!token && !isTokenExpired(token);
  const authenticated = (isAuthenticated || tokenValid);

  if (!authenticated) return <Navigate to="/" replace />;
  const resolvedUser = user ?? (token ? parseJwt(token) : null);
  if (!roles.includes(resolvedUser?.role)) return <Navigate to="/pedido" replace />;
  return children;
}
