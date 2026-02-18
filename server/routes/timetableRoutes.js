const express = require('express');
const { getTimetable, addSlot, updateSlot, deleteSlot, getConfig, getTodaySchedule } = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getTimetable)
    .post(protect, authorize('admin'), addSlot);

router.route('/:id')
    .put(protect, authorize('admin'), updateSlot)
    .delete(protect, authorize('admin'), deleteSlot);

router.get('/settings/:key', protect, getConfig);
router.get('/today', protect, getTodaySchedule);

module.exports = router;
