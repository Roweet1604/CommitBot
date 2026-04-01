const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createChatbot,
  getChatbots,
  getChatbot,
  updateChatbot,
  deleteChatbot,
  saveApiKey,
  deleteApiKey
} = require('../controllers/chatbotController');

router.post('/', protect, createChatbot);
router.get('/', protect, getChatbots);
router.get('/:id', protect, getChatbot);
router.put('/:id', protect, updateChatbot);
router.delete('/:id', protect, deleteChatbot);
router.post('/:id/apikey', protect, saveApiKey);
router.delete('/:id/apikey', protect, deleteApiKey);

module.exports = router;