import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function isTokenExpired(token) {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, "=");
    const payload = JSON.parse(atob(padded));
    if (!payload?.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem("token");
  const valid = (isAuthenticated || !!token) && !isTokenExpired(token ?? "");
  return valid ? children : <Navigate to="/" replace />;
}
