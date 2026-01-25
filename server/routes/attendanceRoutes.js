const express = require('express');
const { markAttendance, getAttendanceByCourse, getStudentAttendance } = require('../controllers/attendanceController');
const { generateQR, closeQR, scanQR, getActiveSession } = require('../controllers/qrAttendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Traditional attendance routes
router.post('/', protect, authorize('faculty', 'admin'), markAttendance);
router.get('/course/:courseId', protect, authorize('faculty', 'admin'), getAttendanceByCourse);
router.get('/student/:studentId', protect, getStudentAttendance);

// QR-based attendance routes
router.post('/qr/generate', protect, authorize('faculty'), generateQR);
router.post('/qr/close/:qrToken', protect, authorize('faculty'), closeQR);
router.post('/qr/scan', protect, authorize('student'), scanQR);
router.get('/qr/active', protect, authorize('faculty'), getActiveSession);

module.exports = router;

