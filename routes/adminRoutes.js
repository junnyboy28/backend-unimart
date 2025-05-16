const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  blacklistUser,
  unblacklistUser,
  approveBlockchainVerification,
  rejectBlockchainVerification,
  getPendingVerifications,
  getAllTransactions,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// All admin routes require both auth and admin permissions
router.use(protect, isAdmin);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/blacklist', blacklistUser);
router.put('/users/:id/unblacklist', unblacklistUser);
router.put('/users/:id/approve-blockchain', approveBlockchainVerification);
router.put('/users/:id/reject-blockchain', rejectBlockchainVerification);
router.get('/blockchain-verifications', getPendingVerifications);
router.get('/transactions', getAllTransactions);
router.get('/dashboard', getDashboardStats);

module.exports = router;