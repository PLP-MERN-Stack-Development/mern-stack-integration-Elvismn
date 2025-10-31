// api.js - Unified API service for communicating with backend

import axios from "axios";

// =========================
// ⚙️ Create Axios Instance
// =========================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// 🔐 Request Interceptor
// =========================
api.interceptors.request.use(
  (config) => {
    // ✅ Get token from localStorage
    const storedUser = localStorage.getItem("user");
    let token = localStorage.getItem("token");

    // ✅ If token not directly saved, try extracting from user object
    if (!token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        token = parsedUser?.token;
      } catch (err) {
        console.warn("Failed to parse user from localStorage:", err);
      }
    }

    // ✅ Attach Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// ⚠️ Response Interceptor
// =========================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Auto-logout on 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// =========================
// 📝 POST API SERVICES
// =========================
export const postService = {
  // Get all posts (with optional pagination and category)
  getAllPosts: async (page = 1, limit = 10, category = null) => {
    let url = `/posts?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get a single post by ID or slug
  getPost: async (idOrSlug) => {
    const response = await api.get(`/posts/${idOrSlug}`);
    return response.data;
  },

  // ✅ Create a new post (protected)
  createPost: async (postData) => {
    const response = await api.post("/posts", postData);
    return response.data;
  },

  // ✅ Update an existing post (protected)
  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  // ✅ Delete a post (protected)
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Add a comment to a post
  addComment: async (postId, commentData) => {
    const response = await api.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  },

  // Search posts
  searchPosts: async (query) => {
    const response = await api.get(`/posts/search?q=${query}`);
    return response.data;
  },
};

// =========================
// 🗂️ CATEGORY API SERVICES
// =========================
export const categoryService = {
  // ✅ Get all categories
  getAllCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  // ✅ Create a new category (for admin)
  createCategory: async (categoryData) => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  // ✅ Delete a category (optional)
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// =========================
// 👤 AUTH API SERVICES
// =========================
export const authService = {
  // ✅ Register a new user
  register: async (userData) => {
    const response = await api.post("/users/register", userData);
    return response.data;
  },

  // ✅ Login and persist token
  login: async (credentials) => {
    const response = await api.post("/users/login", credentials);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...response.data.user, token: response.data.token })
      );
    }

    return response.data;
  },

  // ✅ Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // ✅ Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// ✅ Default export
export default api;
