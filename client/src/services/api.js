// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  // Don't set a global Content-Type header: let axios/browser set it,
  // especially for multipart/form-data (it needs the boundary).
});

// Attach token if present
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("user");
    let token = localStorage.getItem("token");

    if (!token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        token = parsedUser?.token;
      } catch (err) {
        console.warn("Failed to parse user from localStorage:", err);
      }
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper: detect FormData
const isFormData = (v) => typeof FormData !== "undefined" && v instanceof FormData;

export const postService = {
  getAllPosts: async (page = 1, limit = 10, category = null) => {
    let url = `/posts?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    const res = await api.get(url);
    return res.data;
  },

  // get by slug
  getPost: async (slug) => {
    const res = await api.get(`/posts/${slug}`);
    return res.data;
  },

  // Create - accepts FormData OR plain object.
  createPost: async (postData) => {
    let payload;
    let config = {};
    if (isFormData(postData)) {
      payload = postData;
      // don't set Content-Type; browser/axios will set the boundary
    } else {
      // build FormData from plain object (handles file objects too if passed)
      payload = new FormData();
      Object.keys(postData || {}).forEach((k) => {
        const val = postData[k];
        if (val === undefined || val === null) return;
        // If an array, append each (tags etc)
        if (Array.isArray(val)) {
          val.forEach((v) => payload.append(k, v));
        } else {
          payload.append(k, val);
        }
      });
    }

    const res = await api.post("/posts", payload, config);
    // backend returns { post }
    return res.data;
  },

  updatePost: async (id, postData) => {
    // Accept FormData or JSON
    if (isFormData(postData)) {
      const res = await api.put(`/posts/${id}`, postData);
      return res.data;
    } else {
      const res = await api.put(`/posts/${id}`, postData);
      return res.data;
    }
  },

  deletePost: async (id) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },

  addComment: async (postId, commentData) => {
    const res = await api.post(`/posts/${postId}/comments`, commentData);
    return res.data;
  },

  searchPosts: async (q) => {
    const res = await api.get(`/posts/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },
};

export const categoryService = {
  getAllCategories: async () => {
    const res = await api.get("/categories");
    return res.data;
  },
  createCategory: async (catData) => {
    const res = await api.post("/categories", catData);
    return res.data;
  },
  deleteCategory: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

export const authService = {
  register: async (userData) => {
    const res = await api.post("/users/register", userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post("/users/login", credentials);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({ ...res.data.user, token: res.data.token }));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default api;
