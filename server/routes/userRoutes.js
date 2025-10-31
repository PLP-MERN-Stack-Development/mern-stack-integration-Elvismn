// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // We'll define this next

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', protect, userController.getProfile);

module.exports = router;
