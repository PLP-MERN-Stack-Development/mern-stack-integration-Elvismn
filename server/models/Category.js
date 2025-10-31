const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a category name"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
  },
  { timestamps: true }
);

// 🧠 Generate slug automatically before saving
CategorySchema.pre("save", function (next) {
  try {
    console.log("🛠️ [DEBUG] Category pre-save hook triggered for:", this.name);

    if (!this.isModified("name")) {
      console.log("ℹ️ [DEBUG] Category name not modified, skipping slug update");
      return next();
    }

    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");

    // Fallback in case slug is missing
    if (!this.slug || this.slug.trim() === "") {
      this.slug = `category-${Date.now()}`;
      console.warn("⚠️ [WARN] Slug was empty. Generated fallback slug:", this.slug);
    }

    console.log("✅ [DEBUG] Final slug generated:", this.slug);
    next();
  } catch (error) {
    console.error("🔥 [ERROR] Error generating category slug:", error);
    next(error);
  }
});

// ✅ Log whenever a category is successfully saved
CategorySchema.post("save", function (doc) {
  console.log("💾 [INFO] Category saved successfully:", {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
  });
});

module.exports = mongoose.model("Category", CategorySchema);
