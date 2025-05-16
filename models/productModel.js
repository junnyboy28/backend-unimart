const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Stationary', 'Books', 'Electronics', 'Project Materials', 'Others'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    images: [
      {
        type: String,
        required: [true, 'Please add at least one image'],
      },
    ],
    condition: {
      type: String,
      required: [true, 'Please select a condition'],
      enum: ['New', 'Like New', 'Slightly Used', 'Used', 'Heavily Used'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    acceptsCrypto: {
      type: Boolean,
      default: false,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

module.exports = mongoose.model('Product', productSchema);