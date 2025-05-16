const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure participants are always 2 users
chatSchema.pre('save', function (next) {
  if (this.participants.length !== 2) {
    throw new Error('Chat must have exactly 2 participants');
  }
  next();
});

module.exports = mongoose.model('Chat', chatSchema);