const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user is trying to wishlist their own product
  if (product.seller.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot add your own product to wishlist');
  }

  // Find user's wishlist or create if doesn't exist
  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId],
    });
  } else {
    // Check if product is already in the wishlist
    if (wishlist.products.includes(productId)) {
      res.status(400);
      throw new Error('Product already in wishlist');
    }

    // Add product to wishlist
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.status(201).json({
    message: 'Product added to wishlist',
    wishlist,
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Find user's wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  // Check if product is in the wishlist
  if (!wishlist.products.includes(productId)) {
    res.status(400);
    throw new Error('Product not in wishlist');
  }

  // Remove product from wishlist
  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );
  await wishlist.save();

  res.json({
    message: 'Product removed from wishlist',
    wishlist,
  });
});

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  // Find user's wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'products',
    select: 'name images price condition isSold',
    populate: {
      path: 'seller',
      select: 'name profileImage',
    },
  });

  if (!wishlist) {
    // Return empty wishlist if not found
    return res.json({ products: [] });
  }

  // Filter out sold products
  const availableProducts = wishlist.products.filter(product => !product.isSold);

  res.json({
    products: availableProducts,
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Find user's wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return res.json({ inWishlist: false });
  }

  // Check if product is in the wishlist
  const inWishlist = wishlist.products.includes(productId);

  res.json({ inWishlist });
});

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlist,
};