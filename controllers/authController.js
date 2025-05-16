const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, department, year, division, location } = req.body;

  // Check email format
  if (!email.endsWith('@pccegoa.edu.in')) {
    res.status(400);
    throw new Error('Email must end with @pccegoa.edu.in');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    department,
    year,
    division,
    location,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      year: user.year,
      division: user.division,
      location: user.location,
      isAdmin: user.isAdmin,
      isBlockchainVerified: user.isBlockchainVerified,
      blockchainVerificationStatus: user.blockchainVerificationStatus,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Check if user is blacklisted
    if (user.isBlacklisted) {
      res.status(403);
      throw new Error('Your account has been blacklisted. Please contact admin.');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      year: user.year,
      division: user.division,
      location: user.location,
      isAdmin: user.isAdmin,
      isBlockchainVerified: user.isBlockchainVerified,
      blockchainVerificationStatus: user.blockchainVerificationStatus,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Apply for blockchain verification
// @route   POST /api/auth/blockchain-verification
// @access  Private
const applyBlockchainVerification = asyncHandler(async (req, res) => {
  const { metamaskId } = req.body;

  // Validate metamask ID format (15 digits)
  if (!metamaskId || !/^[0-9]{15}$/.test(metamaskId)) {
    res.status(400);
    throw new Error('Invalid Metamask ID format. Must be 15 digits.');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user already applied
  if (user.blockchainVerificationStatus !== 'not_applied' && 
      user.blockchainVerificationStatus !== 'rejected') {
    res.status(400);
    throw new Error(`You have already applied for verification (Status: ${user.blockchainVerificationStatus})`);
  }

  // Update user
  user.metamaskId = metamaskId;
  user.blockchainVerificationStatus = 'pending';
  await user.save();

  res.status(200).json({
    message: 'Blockchain verification requested successfully',
    blockchainVerificationStatus: user.blockchainVerificationStatus,
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      year: user.year,
      division: user.division,
      location: user.location,
      isAdmin: user.isAdmin,
      isBlockchainVerified: user.isBlockchainVerified,
      blockchainVerificationStatus: user.blockchainVerificationStatus,
      metamaskId: user.metamaskId,
      profileImage: user.profileImage,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  applyBlockchainVerification,
  getMe,
};