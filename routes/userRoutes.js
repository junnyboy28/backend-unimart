const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getUserById,
  updateUserProfile,
  getUserPurchases,
  getUserSales,
  getUserListings,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/fileUpload');

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('profileImage'), updateUserProfile);
router.get('/purchases', protect, getUserPurchases);
router.get('/sales', protect, getUserSales);
router.get('/listings', protect, getUserListings);
router.get('/:id', protect, getUserById);

module.exports = router;