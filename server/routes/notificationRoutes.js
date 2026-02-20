const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getVapidPublicKey, subscribe, getNotifications, markAsRead } = require('../controllers/notificationController');

router.get('/vapid-key', protect, getVapidPublicKey); // Changed to match likely frontend call
router.post('/subscribe', protect, subscribe);
router.post('/test-push', protect, require('../controllers/notificationController').sendTestPush); // For debugging
router.get('/', protect, getNotifications); // History
router.post('/:id/read', protect, markAsRead);
router.put('/read', protect, markAsRead);

module.exports = router;
