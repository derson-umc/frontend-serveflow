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
    <div className="h-14 bg-blue-800 flex items-center justify-between px-6 shadow">
      <span className="text-white font-bold text-lg">ServeFlow</span>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 transition text-white text-sm px-3 py-1 rounded"
      >
        Log Out
      </button>
    </div>
  );
}