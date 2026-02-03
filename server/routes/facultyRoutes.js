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
    updateLeaveStatus,
    searchAllCourses,
    joinCourse,
    uploadMaterial,
    deleteMaterial,
    sendStudentAlert,
    getMarks,
    clearMarks,
    uploadProfileImage
} = require('../controllers/facultyController');

const upload = require('../middleware/uploadMiddleware');
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
router.post('/profile/image', upload.single('image'), uploadProfileImage);
router.delete('/profile/image', require('../controllers/facultyController').removeProfileImage);
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
router.delete('/notifications', require('../controllers/facultyController').clearNotifications);
router.post('/notifications/:id/read', markAsRead);
router.get('/leave-requests', getLeaveRequests);
router.put('/leave-requests/:id', updateLeaveStatus);
router.get('/exams', getFacultyExams);
router.get('/search-courses', searchAllCourses);
router.post('/join-course', joinCourse);
router.post('/send-alert', sendStudentAlert);
router.get('/marks', getMarks);
router.delete('/marks', clearMarks);

// Course Materials
router.post('/courses/:courseId/materials', upload.single('file'), uploadMaterial);
router.delete('/courses/:courseId/materials/:materialId', deleteMaterial);

module.exports = router;
