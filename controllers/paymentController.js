const asyncHandler = require('express-async-handler');
const Transaction = require('../models/transactionModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const razorpayInstance = require('../config/razorpay');
const { verifyBlockchainTransaction } = require('../utils/blockchainUtils');

// @desc    Create Razorpay order for product
// @route   POST /api/payment/razorpay
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  // Get the product details
  const product = await Product.findById(productId).populate('seller');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if product is already sold
  if (product.isSold) {
    res.status(400);
    throw new Error('Product is already sold');
  }

  // Prevent buying own product
  if (product.seller._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot buy your own product');
  }

  // Create Razorpay order
  const options = {
    amount: Math.round(product.price * 100), // amount in smallest currency unit (paise for INR)
    currency: "INR",
    receipt: `receipt_order_${new Date().getTime()}`,
    notes: {
      productId: product._id.toString(),
      buyerId: req.user._id.toString(),
      sellerId: product.seller._id.toString()
    }
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      notes: order.notes,
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        seller: {
          id: product.seller._id,
          name: product.seller.name
        }
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
});

// @desc    Verify and complete Razorpay payment
// @route   POST /api/payment/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, productId } = req.body;
  
  // Simple verification (in production, validate signature cryptographically)
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed: Missing parameters');
  }

  try {
    // Get the order details from Razorpay
    const order = await razorpayInstance.orders.fetch(razorpay_order_id);
    
    // Get the product details
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.isSold) {
      res.status(400);
      throw new Error('Product has already been sold');
    }

    // Create transaction record
    const transaction = await Transaction.create({
      buyer: req.user._id,
      seller: product.seller,
      product: product._id,
      amount: order.amount / 100, // Convert back from paise to rupees
      paymentMethod: 'razorpay',
      paymentId: razorpay_payment_id,
      status: 'completed'
    });

    // Mark product as sold
    product.isSold = true;
    product.buyer = req.user._id;
    product.transactionId = transaction._id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      transaction
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
});

// @desc    Process crypto payment
// @route   POST /api/payment/crypto
// @access  Private (blockchain verified users only)
const processCryptoPayment = asyncHandler(async (req, res) => {
  const { productId, transactionHash } = req.body;

  if (!transactionHash) {
    res.status(400);
    throw new Error('Transaction hash is required');
  }

  // Get the product details
  const product = await Product.findById(productId).populate('seller');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if product is already sold
  if (product.isSold) {
    res.status(400);
    throw new Error('Product is already sold');
  }

  // Check if product accepts crypto
  if (!product.acceptsCrypto) {
    res.status(400);
    throw new Error('This product does not accept cryptocurrency payments');
  }

  // Prevent buying own product
  if (product.seller._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot buy your own product');
  }

  try {
    // Verify the blockchain transaction
    const isValid = await verifyBlockchainTransaction(
      transactionHash, 
      product.price,
      req.user.metamaskId,
      product.seller.metamaskId
    );

    if (!isValid) {
      res.status(400);
      throw new Error('Blockchain transaction verification failed');
    }
    
    // Create transaction record
    const transaction = await Transaction.create({
      buyer: req.user._id,
      seller: product.seller._id,
      product: product._id,
      amount: product.price,
      paymentMethod: 'crypto',
      paymentId: 'crypto_' + Date.now(),
      cryptoTransactionHash: transactionHash,
      status: 'completed'
    });

    // Mark product as sold
    product.isSold = true;
    product.buyer = req.user._id;
    product.transactionId = transaction._id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Crypto payment successful',
      transaction
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Crypto payment processing failed: ${error.message}`);
  }
});

// @desc    Get user's transactions
// @route   GET /api/payment/transactions
// @access  Private
const getUserTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    $or: [
      { buyer: req.user._id },
      { seller: req.user._id }
    ]
  })
    .populate('product', 'name images price')
    .populate('buyer', 'name profileImage')
    .populate('seller', 'name profileImage')
    .sort({ createdAt: -1 });
  
  res.json(transactions);
});

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  processCryptoPayment,
  getUserTransactions
};