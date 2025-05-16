const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
  const { name, category, description, price, condition, location } = req.body;

  // Check if images are uploaded
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please upload at least one image');
  }

  // Get image paths
  const images = req.files.map((file) => file.path);

  // Set acceptsCrypto based on user's blockchain verification
  const acceptsCrypto = req.user.isBlockchainVerified || false;

  const product = await Product.create({
    name,
    seller: req.user._id,
    category,
    description,
    price,
    images,
    condition,
    location,
    acceptsCrypto,
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error('Invalid product data');
  }
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};
  
  const condition = req.query.condition ? { condition: req.query.condition } : {};

  // Only show unsold products
  const filter = { ...keyword, ...category, ...condition, isSold: false };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('seller', 'name profileImage isBlockchainVerified location')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name email department year division location isBlockchainVerified profileImage')
    .populate('reviews');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, description, price, condition, location } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user is the seller
  if (product.seller.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this product');
  }

  // Check if product is already sold
  if (product.isSold) {
    res.status(400);
    throw new Error('Cannot update a sold product');
  }

  // Update fields
  product.name = name || product.name;
  product.category = category || product.category;
  product.description = description || product.description;
  product.price = price || product.price;
  product.condition = condition || product.condition;
  product.location = location || product.location;

  // If new images are uploaded
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => file.path);
    product.images = newImages;
  }

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user is the seller or admin
  if (
    product.seller.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error('Not authorized to delete this product');
  }

  // Check if product is already sold
  if (product.isSold) {
    res.status(400);
    throw new Error('Cannot delete a sold product');
  }

  await product.remove();
  res.json({ message: 'Product removed' });
});

// @desc    Mark product as sold (Internal use by payment controller)
// @route   PUT /api/products/:id/mark-sold
// @access  Private
const markProductAsSold = asyncHandler(async (req, res) => {
  const { buyerId, transactionId } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if product is already sold
  if (product.isSold) {
    res.status(400);
    throw new Error('Product is already sold');
  }

  // Update product
  product.isSold = true;
  product.buyer = buyerId;
  product.transactionId = transactionId;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  markProductAsSold,
};