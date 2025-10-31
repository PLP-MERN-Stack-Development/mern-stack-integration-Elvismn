import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-bold text-orange-400 hover:text-orange-300">
        📰 MERN Blog
      </Link>

      <div className="space-x-6">
        <Link to="/" className="hover:text-orange-300 transition">Home</Link>
        <Link to="/create" className="hover:text-orange-300 transition">Create</Link>

        {isAuthenticated ? (
          <>
            <span className="text-orange-400">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="hover:text-red-400 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-orange-300 transition">Login</Link>
            <Link to="/register" className="hover:text-orange-300 transition">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
