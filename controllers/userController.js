const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Review = require('../models/reviewModel');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID (public profile)
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email');

  if (user) {
    // Get user's products
    const products = await Product.find({ seller: user._id, isSold: false })
      .limit(10)
      .sort({ createdAt: -1 });

    // Get reviews about the user as seller
    const reviews = await Review.find({ seller: user._id })
      .populate('user', 'name profileImage')
      .populate('product', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      user,
      products,
      reviews,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update fields if provided
    user.name = req.body.name || user.name;
    user.department = req.body.department || user.department;
    user.year = req.body.year || user.year;
    user.division = req.body.division || user.division;
    user.location = req.body.location || user.location;

    // If profile image is uploaded
    if (req.file) {
      user.profileImage = req.file.path;
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      department: updatedUser.department,
      year: updatedUser.year,
      division: updatedUser.division,
      location: updatedUser.location,
      isAdmin: updatedUser.isAdmin,
      isBlockchainVerified: updatedUser.isBlockchainVerified,
      blockchainVerificationStatus: updatedUser.blockchainVerificationStatus,
      profileImage: updatedUser.profileImage,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users purchased products
// @route   GET /api/users/purchases
// @access  Private
const getUserPurchases = asyncHandler(async (req, res) => {
  const purchases = await Product.find({ buyer: req.user._id, isSold: true })
    .populate('seller', 'name profileImage isBlockchainVerified')
    .sort({ updatedAt: -1 });

  res.json(purchases);
});

// @desc    Get all users sold products
// @route   GET /api/users/sales
// @access  Private
const getUserSales = asyncHandler(async (req, res) => {
  const sales = await Product.find({ seller: req.user._id, isSold: true })
    .populate('buyer', 'name profileImage')
    .sort({ updatedAt: -1 });

  res.json(sales);
});

// @desc    Get all users listed products
// @route   GET /api/users/listings
// @access  Private
const getUserListings = asyncHandler(async (req, res) => {
  const listings = await Product.find({ seller: req.user._id, isSold: false })
    .sort({ createdAt: -1 });

  res.json(listings);
});

module.exports = {
  getUserProfile,
  getUserById,
  updateUserProfile,
  getUserPurchases,
  getUserSales,
  getUserListings,
};