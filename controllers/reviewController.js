const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, productId } = req.body;

  // Check if all fields are provided
  if (!rating || !comment || !productId) {
    res.status(400);
    throw new Error('Please provide rating, comment and productId');
  }

  // Check if product exists and is sold
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if product is sold
  if (!product.isSold) {
    res.status(400);
    throw new Error('You can only review purchased products');
  }

  // Verify that user is the buyer
  if (product.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only review products you have purchased');
  }

  // Check if user has already reviewed this product
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    seller: product.seller,
    product: productId,
    rating: Number(rating),
    comment,
  });

  // Populate user info for the response
  const populatedReview = await Review.findById(review._id)
    .populate('user', 'name profileImage')
    .populate('product', 'name images')
    .populate('seller', 'name');

  res.status(201).json(populatedReview);
});

// @desc    Get reviews for a seller
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
const getSellerReviews = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  // Check if seller exists
  const seller = await User.findById(sellerId);
  if (!seller) {
    res.status(404);
    throw new Error('Seller not found');
  }

  // Get reviews for the seller
  const reviews = await Review.find({ seller: sellerId })
    .populate('user', 'name profileImage')
    .populate('product', 'name images')
    .sort({ createdAt: -1 });

  // Calculate average rating
  let avgRating = 0;
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    avgRating = totalRating / reviews.length;
  }

  res.json({
    reviews,
    avgRating,
    numReviews: reviews.length,
  });
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Get reviews for the product
  const reviews = await Review.find({ product: productId })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  // Get reviews made by the user
  const reviews = await Review.find({ user: req.user._id })
    .populate('product', 'name images')
    .populate('seller', 'name profileImage')
    .sort({ createdAt: -1 });

  res.json(reviews);
});

module.exports = {
  createReview,
  getSellerReviews,
  getProductReviews,
  getUserReviews,
};