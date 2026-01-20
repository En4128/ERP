const express = require('express');
const {
    getDashboardStats,
    getAssignedCourses,
    getCourseStudents,
    markAttendance,
    getAttendance,
    uploadMarks,
    getCourseStats,
    createNotice,
    getFacultyProfile,
    updateFacultyProfile,
    getAttendanceHistory,
    getAllFacultyStudents,
    getStudentDetail,
    searchAllStudents,
    enrollStudent,
    unenrollStudent,
    getNotifications,
    markAsRead,
    getLeaveRequests,
    updateLeaveStatus
} = require('../controllers/facultyController');
const { getFacultyExams } = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('faculty'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/courses', getAssignedCourses);
router.get('/courses/:courseId/students', getCourseStudents);
router.get('/courses/:courseId/stats', getCourseStats);
router.get('/courses/:courseId/history', getAttendanceHistory);
router.get('/profile', getFacultyProfile);
router.put('/profile', updateFacultyProfile);
router.get('/all-students', getAllFacultyStudents);
router.get('/students/:studentId', getStudentDetail);
router.get('/search-students', searchAllStudents);
router.post('/enroll-student', enrollStudent);
router.post('/unenroll-student', unenrollStudent);
router.post('/attendance', markAttendance);
router.get('/attendance', getAttendance);
router.post('/marks', uploadMarks);
router.post('/notices', createNotice);
router.get('/notifications', getNotifications);
router.post('/notifications/:id/read', markAsRead);
router.get('/leave-requests', getLeaveRequests);
router.put('/leave-requests/:id', updateLeaveStatus);
router.get('/exams', getFacultyExams);

module.exports = router;
