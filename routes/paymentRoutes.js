const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  processCryptoPayment,
  getUserTransactions,
} = require('../controllers/paymentController');
const { protect, blockchainVerified } = require('../middleware/authMiddleware');

// All payment routes are protected
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/crypto', protect, blockchainVerified, processCryptoPayment);
router.get('/transactions', protect, getUserTransactions);

module.exports = router;