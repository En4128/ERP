const express = require('express');
const { getStudentProfile, getDashboardStats, getAttendanceDetails, getStudentFaculty, getNotifications, markAsRead, getStudentResults, applyForLeave, getMyLeaves } = require('../controllers/studentController');
const { getStudentExams } = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', protect, authorize('student'), getStudentProfile);
router.put('/profile', protect, authorize('student'), require('../controllers/studentController').updateStudentProfile);
router.get('/dashboard-stats', protect, authorize('student'), getDashboardStats);
router.get('/attendance', protect, authorize('student'), getAttendanceDetails);
router.get('/faculty', protect, authorize('student'), getStudentFaculty);
router.get('/notifications', protect, authorize('student'), getNotifications);
router.post('/notifications/:id/read', protect, authorize('student'), markAsRead);
router.get('/results', protect, authorize('student'), getStudentResults);
router.post('/leave', protect, authorize('student'), applyForLeave);
router.get('/leave', protect, authorize('student'), getMyLeaves);
router.get('/exams', protect, authorize('student'), getStudentExams);
router.post('/enroll', protect, authorize('student'), require('../controllers/studentController').enrollCourse);

module.exports = router;
