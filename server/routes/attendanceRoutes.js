const express = require('express');
const { markAttendance, getAttendanceByCourse, getStudentAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, authorize('faculty', 'admin'), markAttendance);
router.get('/course/:courseId', protect, authorize('faculty', 'admin'), getAttendanceByCourse);
router.get('/student/:studentId', protect, getStudentAttendance);

module.exports = router;
