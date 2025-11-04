// client/src/pages/Register.jsx
import React, { useState } from "react";
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser(form);
      login(data); // save user and token
      setMessage("Registration successful!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error registering user.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow italic">
      <h2 className="text-2xl font-bold mb-4 text-center">Create an Account with US!</h2>
      {message && <p className="text-center text-sm text-red-500 mb-2">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Enter your Full Name here"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="Enter your Email here"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded italic"
        />
        <input
          name="password"
          type="password"
          placeholder="Enter your Password here"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded italic"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition italic"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Register;
