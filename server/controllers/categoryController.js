// controllers/categoryController.js
import Category from "../models/Category.js";
import slugify from "slugify";

// ✅ Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const slug = slugify(name, { lower: true });
    const category = await Category.create({ name, description, slug });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({
      message: "Error creating category",
      error: err.message,
    });
  }
};

// ✅ Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching categories",
      error: err.message,
    });
  }
};

// ✅ Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching category",
      error: err.message,
    });
  }
};

// ✅ Update category
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name ? slugify(name, { lower: true }) : undefined;

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, ...(slug && { slug }) },
      { new: true, runValidators: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Category not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: "Error updating category",
      error: err.message,
    });
  }
};

// ✅ Delete category
export const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting category",
      error: err.message,
    });
  }
};
