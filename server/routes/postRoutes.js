// routes/postRoutes.js

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect }  = require('../middleware/authMiddleware'); // if using JWT auth


// Public routes
router.get('/', postController.getAllPosts);
router.get('/:slug', postController.getPostBySlug);

// Protected routes (uncomment `protect` once auth is ready)
router.post('/', protect,  postController.createPost);
router.put('/:id',  protect,  postController.updatePost);
router.delete('/:id',  protect,  postController.deletePost);
router.post('/:id/comments',  protect,  postController.addComment);

module.exports = router;
