import { StrictMode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import SinglePost from "./pages/SinglePost";
import "./App.css";

export default function App() {
  return (
    <StrictMode>
      <AuthProvider>
        <Router>
          <Navbar /> {/* ✅ Navbar always visible */}
          <div className="min-h-screen flex flex-col bg-lightblue text-gray-800">
            <Routes className="flex-grow container mx-auto px-4 py-6">
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/posts/:slug" element={<SinglePost />} />
              <Route path="/create" element={<CreatePost />} />
              {/* redirect all unknown routes */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </StrictMode>
  );
}
