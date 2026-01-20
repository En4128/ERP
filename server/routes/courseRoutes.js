const express = require('express');
const { createCourse, getAllCourses, getCourseById, assignFaculty, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getAllCourses)
    .post(protect, authorize('admin'), createCourse);

router.route('/:id')
    .get(protect, getCourseById)
    .put(protect, authorize('admin', 'faculty'), updateCourse)
    .delete(protect, authorize('admin'), deleteCourse);

router.put('/assign-faculty', protect, authorize('admin'), assignFaculty);

module.exports = router;
