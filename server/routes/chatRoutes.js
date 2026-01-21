const express = require('express');
const router = express.Router();
const { getMessages, getConversations, searchUsers, getRecommendedUsers } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/search', protect, searchUsers);
router.get('/recommended', protect, getRecommendedUsers);
router.get('/:userId', protect, getMessages);

module.exports = router;
