const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// All wishlist routes are protected
router.post('/', protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);
router.get('/', protect, getWishlist);
router.get('/check/:productId', protect, checkWishlist);

module.exports = router;