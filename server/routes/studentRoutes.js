const express = require('express');
const { getStudentProfile, getDashboardStats, getAttendanceDetails, getStudentFaculty, getNotifications, markAsRead, getStudentResults, applyForLeave, getMyLeaves, getStudentFees, searchAllCourses, subscribePush } = require('../controllers/studentController');
const { getStudentExams } = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.get('/profile', protect, authorize('student'), getStudentProfile);
router.put('/profile', protect, authorize('student'), require('../controllers/studentController').updateStudentProfile);
router.post('/profile/image', protect, authorize('student'), upload.single('image'), require('../controllers/studentController').uploadProfileImage);
router.delete('/profile/image', protect, authorize('student'), require('../controllers/studentController').removeProfileImage);
router.get('/dashboard-stats', protect, authorize('student'), getDashboardStats);
router.get('/attendance', protect, authorize('student'), getAttendanceDetails);
router.get('/faculty', protect, authorize('student'), getStudentFaculty);
router.get('/notifications', protect, authorize('student'), getNotifications);
router.delete('/notifications', protect, authorize('student'), require('../controllers/studentController').clearNotifications);
router.post('/notifications/:id/read', protect, authorize('student'), markAsRead);
router.get('/results', protect, authorize('student'), getStudentResults);
router.post('/leave', protect, authorize('student'), applyForLeave);
router.get('/leave', protect, authorize('student'), getMyLeaves);
router.get('/exams', protect, authorize('student'), getStudentExams);
router.post('/enroll', protect, authorize('student'), require('../controllers/studentController').enrollCourse);
router.get('/fees', protect, authorize('student'), getStudentFees);

module.exports = router;
