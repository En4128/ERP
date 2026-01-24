const express = require('express');
const router = express.Router();
const {
    createAssignment,
    getAssignments,
    getAssignmentDetails,
    submitAssignment,
    getSubmissions,
    gradeSubmission
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
    .get(getAssignments)
    .post(authorize('faculty'), upload.single('file'), createAssignment);

router.route('/:id')
    .get(getAssignmentDetails);

router.post('/:id/submit', authorize('student'), upload.single('file'), submitAssignment);

router.get('/:id/submissions', authorize('faculty'), getSubmissions);

router.put('/submissions/:id/grade', authorize('faculty'), gradeSubmission);

module.exports = router;
