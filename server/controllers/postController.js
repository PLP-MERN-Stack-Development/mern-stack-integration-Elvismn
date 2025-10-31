const Post = require("../models/Post");
const Category = require("../models/Category");
const User = require("../models/User");

// ✅ Create a new post
exports.createPost = async (req, res) => {
  console.log("🧠 [DEBUG] Incoming POST request to /api/posts");
  console.log("📥 [DEBUG] Request body:", req.body);

  try {
    const { title, content, category, excerpt, tags, isPublished } = req.body;
    const userId = req.user?._id;

    if (!title || !category) {
      console.warn("⚠️ [WARN] Missing required fields: title or category");
      return res.status(400).json({ message: "Title and category are required" });
    }

    console.log("🔍 [DEBUG] Checking if category exists:", category);
    const foundCategory = await Category.findById(category);
    if (!foundCategory) {
      console.log("❌ [DEBUG] Category not found");
      return res.status(404).json({ message: "Category not found" });
    }

    console.log("👤 [DEBUG] Checking if user exists:", userId);
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      console.log("❌ [DEBUG] User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Generate slug manually before saving (fixes slug validation error)
    const slug = title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");

    // ✅ Create new post document
    const post = new Post({
      title,
      content,
      category: foundCategory._id,
      tags,
      excerpt,
      author: foundUser._id,
      slug,
      isPublished: isPublished ?? false, // default false if not provided
    });

    console.log("🧩 [DEBUG] New post object created:", {
      title: post.title,
      author: post.author.toString(),
      category: post.category.toString(),
      slug: post.slug,
    });

    const savedPost = await post.save();

    console.log("💾 [INFO] Post saved successfully:", {
      id: savedPost._id.toString(),
      title: savedPost.title,
      slug: savedPost.slug,
    });

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    console.error("🔥 [ERROR] Error creating post:", error);
    res.status(500).json({
      message: "Server error while creating post",
      error: error.message,
    });
  }
};

// ✅ Get all posts (optionally filtered by category or author)
exports.getAllPosts = async (req, res) => {
  console.log("📡 [DEBUG] Fetching posts with filters:", req.query);
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.author) filter.author = req.query.author;

    const posts = await Post.find(filter)
      .populate("author", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    console.log(`✅ [INFO] Fetched ${posts.length} posts`);
    res.json(posts);
  } catch (err) {
    console.error("🔥 [ERROR] Error fetching posts:", err);
    res.status(500).json({ message: "Error fetching posts", error: err.message });
  }
};

// ✅ Get single post by slug
exports.getPostBySlug = async (req, res) => {
  console.log("🔍 [DEBUG] Fetching post by slug:", req.params.slug);
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate("author", "name email")
      .populate("category", "name");

    if (!post) {
      console.warn("🚫 [WARN] Post not found for slug:", req.params.slug);
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count (if you have this method in your model)
    if (post.incrementViewCount) {
      await post.incrementViewCount();
      console.log("👀 [INFO] View count incremented for post:", post.slug);
    }

    res.json(post);
  } catch (err) {
    console.error("🔥 [ERROR] Error fetching post:", err);
    res.status(500).json({ message: "Error fetching post", error: err.message });
  }
};

// ✅ Update post
exports.updatePost = async (req, res) => {
  console.log("✏️ [DEBUG] Updating post:", req.params.id);
  try {
    const { title, content, category, tags, excerpt, isPublished } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      console.warn("🚫 [WARN] Post not found for update:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.excerpt = excerpt || post.excerpt;
    post.isPublished = isPublished !== undefined ? isPublished : post.isPublished;

    // ✅ regenerate slug if title changed
    if (title) {
      post.slug = title
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
    }

    const updated = await post.save();

    console.log("💾 [INFO] Post updated successfully:", updated._id.toString());
    res.json(updated);
  } catch (err) {
    console.error("🔥 [ERROR] Error updating post:", err);
    res.status(500).json({ message: "Error updating post", error: err.message });
  }
};

// ✅ Delete post
exports.deletePost = async (req, res) => {
  console.log("🗑️ [DEBUG] Deleting post:", req.params.id);
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      console.warn("🚫 [WARN] Post not found for deletion:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    console.log("✅ [INFO] Post deleted successfully:", post._id.toString());
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("🔥 [ERROR] Error deleting post:", err);
    res.status(500).json({ message: "Error deleting post", error: err.message });
  }
};

// ✅ Add comment
exports.addComment = async (req, res) => {
  console.log("💬 [DEBUG] Adding comment to post:", req.params.id);
  try {
    const { content } = req.body;
    if (!content) {
      console.warn("⚠️ [WARN] Comment content missing");
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      console.warn("🚫 [WARN] Post not found for comment:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    if (typeof post.addComment === "function") {
      await post.addComment(req.user._id, content);
      console.log("✅ [INFO] Comment added successfully to post:", post._id.toString());
    }

    res.status(201).json({ message: "Comment added successfully", post });
  } catch (err) {
    console.error("🔥 [ERROR] Error adding comment:", err);
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
};
