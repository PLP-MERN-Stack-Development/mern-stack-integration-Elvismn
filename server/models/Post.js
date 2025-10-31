// Post.js - Mongoose model for blog posts
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide content"],
    },
    featuredImage: {
      type: String,
      default: "default-post.jpg",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    excerpt: {
      type: String,
      maxlength: [200, "Excerpt cannot be more than 200 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Create slug automatically from title before saving
PostSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("title")) {
      console.log("🧠 [DEBUG] Title not modified — skipping slug generation");
      return next();
    }

    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");

    // Check for existing slug and make it unique
    const existingPost = await mongoose.models.Post.findOne({ slug: this.slug });
    if (existingPost) {
      const randomSuffix = Math.floor(Math.random() * 10000);
      this.slug = `${this.slug}-${randomSuffix}`;
      console.log("⚠️ [DEBUG] Duplicate slug found, generated new slug:", this.slug);
    } else {
      console.log("✅ [DEBUG] Slug generated successfully:", this.slug);
    }

    next();
  } catch (error) {
    console.error("🔥 [ERROR] Slug generation failed:", error.message);
    next(error);
  }
});

// ✅ Virtual for post URL
PostSchema.virtual("url").get(function () {
  return `/posts/${this.slug}`;
});

// ✅ Method to add a comment
PostSchema.methods.addComment = function (userId, content) {
  this.comments.push({ user: userId, content });
  console.log("💬 [DEBUG] New comment added by:", userId);
  return this.save();
};

// ✅ Method to increment view count
PostSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  console.log("👁️ [DEBUG] View count incremented for post:", this._id);
  return this.save();
};

module.exports = mongoose.model("Post", PostSchema);
