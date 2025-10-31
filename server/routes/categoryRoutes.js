// routes/categoryRoutes.js

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
// const { protect } = require('../middleware/authMiddleware'); // Optional for admin-only routes

// Public
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected (uncomment protect if you have authentication)
router.post('/', /* protect, */ categoryController.createCategory);
router.put('/:id', /* protect, */ categoryController.updateCategory);
router.delete('/:id', /* protect, */ categoryController.deleteCategory);

module.exports = router;
