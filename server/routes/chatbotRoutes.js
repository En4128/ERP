const express = require('express');
const { askChatbot } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Optional authentication - works with or without login
const optionalAuth = (req, res, next) => {
    // Try to authenticate, but don't fail if no token
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        return protect(req, res, next);
    }
    next();
};

router.post('/', optionalAuth, askChatbot);

module.exports = router;
