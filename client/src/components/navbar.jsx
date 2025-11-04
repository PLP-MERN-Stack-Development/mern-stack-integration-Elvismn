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
    <nav className="bg-white shadow-md sticky top-0 z-50 rounded-full mb-6">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-700 hover:text-indigo-800 transition"
        >
          📰 MERN Blog
        </Link>
        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-indigo-700 font-medium transition"
          >
            Home
          </Link>
          <Link
            to="/create"
            className="text-gray-700 hover:text-indigo-700 font-medium transition"
          >
            Create
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-orange-500 bg-orange-100 px-3 py-1 rounded-full">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 text-white px-4 py-1 rounded-full hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm bg-indigo-500 text-white px-4 py-1 rounded-full hover:bg-indigo-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-gray-100 text-gray-700 px-4 py-1 rounded-full hover:bg-gray-200 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
