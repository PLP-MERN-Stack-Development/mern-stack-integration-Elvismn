// client/src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/users"; // adjust to your backend port

// Register new user
export const registerUser = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  return res.data;
};

// Login user
export const loginUser = async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);
  return res.data;
};

// Fetch user profile
export const getProfile = async (token) => {
  const res = await axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


// ✅ Register user
export const register = async (userData) => {
  const res = await fetch(API_URL + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Error registering user");
  return res.json();
};

// ✅ Login user
export const login = async (userData) => {
  const res = await fetch(API_URL + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Invalid email or password");
  const data = await res.json();
  localStorage.setItem("user", JSON.stringify(data)); // Save user + token
  return data;
};

// ✅ Logout user
export const logout = () => {
  localStorage.removeItem("user");
};
