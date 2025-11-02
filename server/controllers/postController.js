// server/controllers/postController.js
const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');
const Category = require('../models/Category');
const User = require('../models/User');
const mongoose = require('mongoose');

const UPLOADS_BASE = 'posts'; // store as 'posts/<filename>' so public path becomes /uploads/posts/<filename>

async function generateUniqueSlug(title, excludeId = null) {
  let base = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-').slice(0, 120);
  let slug = base;
  let counter = 0;
  while (true) {
    const q = { slug };
    if (excludeId) q._id = { $ne: excludeId };
    const existing = await mongoose.models.Post.findOne(q);
    if (!existing) return slug;
    counter++;
    slug = `${base}-${Math.floor(Math.random() * 10000)}-${counter}`;
    if (counter > 50) break;
  }
  return slug + '-' + Date.now();
}

function removeUploadedFile(filePath) {
  try {
    if (!filePath) return;
    if (filePath.includes('default-post.jpg')) return;
    const full = path.join(process.cwd(), 'server', 'uploads', filePath);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      console.log('🗑️ Removed file:', full);
    }
  } catch (err) {
    console.warn('⚠️ Failed to remove file:', err.message);
  }
}

exports.createPost = async (req, res) => {
  console.log('🧠 Incoming POST /api/posts', { bodyType: typeof req.body, file: req.file && req.file.filename });
  try {
    // Note: when multipart/form-data, req.body values are strings
    const title = req.body.title;
    const content = req.body.content;
    const category = req.body.category;
    const excerpt = req.body.excerpt;
    const tags = req.body.tags; // can be CSV or array depending on client
    const isPublishedRaw = req.body.isPublished;

    const userId = req.user && (req.user._id || req.user.id);
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    const foundCategory = await Category.findById(category);
    if (!foundCategory) return res.status(404).json({ message: 'Category not found' });

    const foundUser = await User.findById(userId);
    if (!foundUser) return res.status(404).json({ message: 'User not found' });

    const slug = await generateUniqueSlug(title);

    // featuredImage: if multer stored a file, save as 'posts/<filename>'
    let featuredImage = 'default-post.jpg';
    if (req.file && req.file.filename) {
      featuredImage = `${UPLOADS_BASE}/${req.file.filename}`;
    }

    // parse tags
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) tagsArray = tags;
      else if (typeof tags === 'string') tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const newPost = new Post({
      title,
      content,
      category: foundCategory._id,
      tags: tagsArray,
      excerpt,
      author: foundUser._id,
      slug,
      featuredImage,
      isPublished: isPublishedRaw === 'true' || isPublishedRaw === true || isPublishedRaw === '1',
    });

    const saved = await newPost.save();
    console.log('💾 Post saved', { id: saved._id.toString(), slug: saved.slug });
    return res.status(201).json({ post: saved });
  } catch (err) {
    console.error('🔥 Error creating post:', err);
    return res.status(500).json({ message: 'Server error while creating post', error: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.author) filter.author = req.query.author;

    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json(posts);
  } catch (err) {
    console.error('🔥 Error getting posts:', err);
    return res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
};

exports.getPostBySlug = async (req, res) => {
  const slug = req.params.slug;
  try {
    if (!slug) return res.status(400).json({ message: 'Slug is required' });
    const post = await Post.findOne({ slug }).populate('author', 'name email').populate('category', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (typeof post.incrementViewCount === 'function') {
      try {
        await post.incrementViewCount();
      } catch (incErr) {
        console.warn('Failed increment view', incErr.message);
      }
    }
    return res.json(post);
  } catch (err) {
    console.error('🔥 Error fetching post by slug:', err);
    return res.status(500).json({ message: 'Error fetching post', error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const { title, content, category, excerpt, tags, isPublished } = req.body;

    if (req.file && req.file.filename) {
      // remove old file if non-default
      if (post.featuredImage && !post.featuredImage.includes('default-post.jpg')) {
        removeUploadedFile(post.featuredImage);
      }
      post.featuredImage = `posts/${req.file.filename}`;
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.excerpt = excerpt || post.excerpt;
    post.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : post.tags);
    post.isPublished = isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : post.isPublished;

    if (title && title !== post.title) {
      post.slug = await generateUniqueSlug(title, post._id);
    }

    const updated = await post.save();
    return res.json({ post: updated });
  } catch (err) {
    console.error('🔥 Error updating post:', err);
    return res.status(500).json({ message: 'Error updating post', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.featuredImage && !post.featuredImage.includes('default-post.jpg')) {
      removeUploadedFile(post.featuredImage);
    }

    return res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('🔥 Error deleting post:', err);
    return res.status(500).json({ message: 'Error deleting post', error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Comment cannot be empty' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (typeof post.addComment === 'function') {
      await post.addComment(req.user._id, content);
    }
    return res.status(201).json({ post });
  } catch (err) {
    console.error('🔥 Error adding comment:', err);
    return res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
};
