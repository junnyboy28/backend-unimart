const express = require('express');
const router = express.Router();
const {
  createReview,
  getSellerReviews,
  getProductReviews,
  getUserReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/seller/:sellerId', getSellerReviews);
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/user', protect, getUserReviews);

module.exports = router;