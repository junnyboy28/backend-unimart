const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

// @desc    Create or get a chat
// @route   POST /api/chat
// @access  Private
const accessChat = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error('UserId parameter not sent with request');
  }

  // Check if chat exists
  let condition = {
    participants: {
      $all: [req.user._id, userId],
    },
  };

  // If productId provided, include it in the condition
  if (productId) {
    condition.product = productId;
  }

  let chat = await Chat.findOne(condition)
    .populate('participants', 'name profileImage')
    .populate('product', 'name images price')
    .populate('lastMessage');

  if (chat) {
    return res.json(chat);
  }

  // If chat doesn't exist, create it
  try {
    // Verify product exists if productId is provided
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404);
        throw new Error('Product not found');
      }
    }

    // Create new chat
    const chatData = {
      participants: [req.user._id, userId],
      product: productId || null,
    };

    chat = await Chat.create(chatData);
    chat = await Chat.findById(chat._id)
      .populate('participants', 'name profileImage')
      .populate('product', 'name images price');

    res.status(201).json(chat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get all chats for a user
// @route   GET /api/chat
// @access  Private
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } },
      isActive: true,
    })
      .populate('participants', 'name profileImage')
      .populate('product', 'name images price')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Send a message
// @route   POST /api/chat/message
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.status(400);
    throw new Error('Please provide content and chatId');
  }

  // Check if chat exists and user is a participant
  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Check if user is part of the chat
  if (!chat.participants.includes(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to send message in this chat');
  }

  // Create and save message
  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  let message = await Message.create(newMessage);

  // Populate message with sender info
  message = await Message.findById(message._id)
    .populate('sender', 'name profileImage')
    .populate('chat');

  // Update last message in the chat
  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

  res.json(message);
});

// @desc    Get all messages for a chat
// @route   GET /api/chat/:chatId/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // Check if chat exists
  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Check if user is part of the chat
  if (!chat.participants.includes(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to access messages in this chat');
  }

  // Get messages
  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'name profileImage')
    .sort({ createdAt: 1 });

  // Mark all unread messages as read
  await Message.updateMany(
    {
      chat: chatId,
      sender: { $ne: req.user._id },
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  res.json(messages);
});

module.exports = {
  accessChat,
  fetchChats,
  sendMessage,
  getMessages,
};