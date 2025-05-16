const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Check if user is admin
const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
});

module.exports = { isAdmin };