const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add the transaction amount'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Please add payment method'],
      enum: ['razorpay', 'crypto'],
    },
    paymentId: {
      type: String,
      required: [true, 'Please add payment ID'],
    },
    cryptoTransactionHash: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);