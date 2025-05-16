const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Transaction = require('../models/transactionModel');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Get user details by ID
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Blacklist a user
// @route   PUT /api/admin/users/:id/blacklist
// @access  Admin
const blacklistUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  if (!reason) {
    res.status(400);
    throw new Error('Please provide a reason for blacklisting');
  }

  const user = await User.findById(req.params.id);

  if (user) {
    // Cannot blacklist an admin
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Cannot blacklist an admin');
    }

    user.isBlacklisted = true;
    user.blacklistReason = reason;
    
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Remove user from blacklist
// @route   PUT /api/admin/users/:id/unblacklist
// @access  Admin
const unblacklistUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isBlacklisted = false;
    user.blacklistReason = '';
    
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Approve blockchain verification
// @route   PUT /api/admin/users/:id/approve-blockchain
// @access  Admin
const approveBlockchainVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.blockchainVerificationStatus !== 'pending') {
    res.status(400);
    throw new Error('User has not applied for blockchain verification');
  }

  user.blockchainVerificationStatus = 'approved';
  user.isBlockchainVerified = true;
  
  const updatedUser = await user.save();
  res.json(updatedUser);
});

// @desc    Reject blockchain verification
// @route   PUT /api/admin/users/:id/reject-blockchain
// @access  Admin
const rejectBlockchainVerification = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  if (!reason) {
    res.status(400);
    throw new Error('Please provide a reason for rejection');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.blockchainVerificationStatus !== 'pending') {
    res.status(400);
    throw new Error('User has not applied for blockchain verification');
  }

  user.blockchainVerificationStatus = 'rejected';
  
  const updatedUser = await user.save();
  res.json({
    message: `Blockchain verification rejected: ${reason}`,
    user: updatedUser
  });
});

// @desc    Get all pending blockchain verifications
// @route   GET /api/admin/blockchain-verifications
// @access  Admin
const getPendingVerifications = asyncHandler(async (req, res) => {
  const users = await User.find({ 
    blockchainVerificationStatus: 'pending' 
  }).select('-password');
  
  res.json(users);
});

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Admin
const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({})
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .populate('product', 'name price')
    .sort({ createdAt: -1 });
  
  res.json(transactions);
});

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const soldProducts = await Product.countDocuments({ isSold: true });
  const activeProducts = await Product.countDocuments({ isSold: false });
  const transactions = await Transaction.countDocuments();
  
  const recentTransactions = await Transaction.find({})
    .populate('buyer', 'name')
    .populate('seller', 'name')
    .populate('product', 'name price')
    .sort({ createdAt: -1 })
    .limit(5);

  const newUsers = await User.find({})
    .select('name email createdAt')
    .sort({ createdAt: -1 })
    .limit(5);
  
  res.json({
    stats: {
      totalUsers,
      totalProducts,
      soldProducts,
      activeProducts,
      transactions
    },
    recentTransactions,
    newUsers
  });
});

module.exports = {
  getUsers,
  getUserById,
  blacklistUser,
  unblacklistUser,
  approveBlockchainVerification,
  rejectBlockchainVerification,
  getPendingVerifications,
  getAllTransactions,
  getDashboardStats
};