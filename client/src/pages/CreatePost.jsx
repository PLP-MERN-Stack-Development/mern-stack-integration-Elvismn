import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postService, categoryService } from "../services/api";

export default function CreatePost() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    excerpt: "",
    isPublished: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // ✅ Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        setCategories(res);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Could not load categories. Please try again.");
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.content.trim() || !form.category) {
      setError("Title, content, and category are required.");
      return;
    }

    try {
      setLoading(true);
      const created = await postService.createPost(form);
      navigate(`/posts/${created._id}`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Post</h2>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium">Category</label>
          {categoryLoading ? (
            <p className="text-gray-500 text-sm mt-2">Loading categories...</p>
          ) : (
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            >
              <option value="">Choose category</option>
              {categories.length > 0 ? (
                categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium">Excerpt</label>
          <input
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium">Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows="8"
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Publish Checkbox */}
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
              className="mr-2"
            />
            Publish immediately
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          >
            {loading ? "Creating…" : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}