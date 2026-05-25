import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@features/auth/store/useAuthStore";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  
  const isAdmin = ["root", "admin"].includes(user?.role);
  const isActive = location.pathname === "/cadastro-produtos";

  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">ServeFlow</span>
        
        <div className="d-flex gap-2 align-items-center">          
          {isAdmin && (
            <Link
              to="/cadastro-produtos"
              className={`btn ${isActive ? 'btn-primary' : 'btn-outline-light'}`}
              style={{ borderColor: "#e46033" }}
            >
               Produtos
            </Link>
          )}
          
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}