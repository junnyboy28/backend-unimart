const express = require('express');
const router = express.Router();
const {
  accessChat,
  fetchChats,
  sendMessage,
  getMessages,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All chat routes are protected
router.post('/', protect, accessChat);
router.get('/', protect, fetchChats);
router.post('/message', protect, sendMessage);
router.get('/:chatId/messages', protect, getMessages);

module.exports = router;