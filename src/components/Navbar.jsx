import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">ServeFlow</span>
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}