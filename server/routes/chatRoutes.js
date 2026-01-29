const express = require('express');
const router = express.Router();
const { getMessages, getConversations, searchUsers, getRecommendedUsers, uploadChatFile, clearChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/search', protect, searchUsers);
router.get('/recommended', protect, getRecommendedUsers);
router.get('/:userId', protect, getMessages);
router.post('/upload', protect, upload.single('file'), uploadChatFile);
router.delete('/:userId', protect, clearChat);

module.exports = router;
