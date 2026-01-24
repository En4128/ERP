const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private/Faculty
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, courseId, dueDate, points } = req.body;

        // Check if course exists and faculty is assigned to it
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }

        const assignment = await Assignment.create({
            title,
            description,
            course: courseId,
            faculty: faculty._id,
            dueDate,
            points,
            fileUrl: req.file ? `/uploads/assignments/${req.file.filename}` : null
        });

        res.status(201).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'faculty') {
            const faculty = await Faculty.findOne({ user: req.user._id });
            query.faculty = faculty._id;
        } else if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id });
            // Get assignments for courses the student is enrolled in
            query.course = { $in: student.enrolledCourses };
        }

        const assignments = await Assignment.find(query)
            .populate('course', 'name code')
            .populate({
                path: 'faculty',
                populate: { path: 'user', select: 'name' }
            })
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single assignment details
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignmentDetails = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('course', 'name code')
            .populate({
                path: 'faculty',
                populate: { path: 'user', select: 'name' }
            });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        let submission = null;
        if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id });
            submission = await Submission.findOne({
                assignment: assignment._id,
                student: student._id
            });
        }

        res.status(200).json({
            success: true,
            data: assignment,
            submission
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        // Check if already submitted
        let submission = await Submission.findOne({
            assignment: assignment._id,
            student: student._id
        });

        if (submission) {
            submission.fileUrl = `/uploads/submissions/${req.file.filename}`;
            submission.submittedAt = Date.now();
            await submission.save();
        } else {
            submission = await Submission.create({
                assignment: assignment._id,
                student: student._id,
                fileUrl: `/uploads/submissions/${req.file.filename}`,
                status: 'submitted'
            });
        }

        res.status(200).json({
            success: true,
            data: submission
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private/Faculty
exports.getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.id })
            .populate({
                path: 'student',
                select: 'admissionNumber',
                populate: { path: 'user', select: 'name' }
            })
            .sort('-submittedAt');

        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Grade submission
// @route   PUT /api/assignments/submissions/:id/grade
// @access  Private/Faculty
exports.gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';

        await submission.save();

        res.status(200).json({
            success: true,
            data: submission
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
