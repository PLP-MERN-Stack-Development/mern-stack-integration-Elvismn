// server/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// prepare uploads dir
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'posts');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

// public
router.get('/', postController.getAllPosts);
router.get('/:slug', postController.getPostBySlug);

// protected (image upload allowed)
router.post('/', protect, upload.single('featuredImage'), postController.createPost);
router.put('/:id', protect, upload.single('featuredImage'), postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.post('/:id/comments', protect, postController.addComment);

module.exports = router;
