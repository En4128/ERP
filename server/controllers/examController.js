const Exam = require('../models/Exam');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// Create a new exam (Admin)
exports.createExam = async (req, res) => {
    try {
        const { courseId, title, date, time, duration, venue, type, department, semester } = req.body;

        // Basic validation
        if (!courseId || !date || !time || !venue) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const exam = new Exam({
            course: courseId,
            title,
            date,
            time,
            duration,
            venue,
            type,
            department,
            semester
        });

        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        console.error('Create Exam Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all exams (Admin)
exports.getAllExams = async (req, res) => {
    try {
        const { department, semester } = req.query;
        let query = {};
        if (department && department !== 'all') query.department = department;
        if (semester) query.semester = semester;

        const exams = await Exam.find(query)
            .populate('course', 'name code')
            .sort({ date: 1 });

        res.json(exams);
    } catch (error) {
        console.error('Get All Exams Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get exams for logged-in student
exports.getStudentExams = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        // Fetch exams for courses the student is enrolled in
        // Or fetch exams matching student's department and semester? 
        // Better to match enrolled courses accurately, but for broad schedules dept/sem is often used.
        // Let's use dept + semester logic as it's common for general schedules.
        // Or if enrolledCourses is populated, rely on that.
        // Let's rely on department and semester which is simpler and covers general timetable.

        // Use regex for case-insensitive department matching
        const deptRegex = new RegExp('^' + student.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');

        const exams = await Exam.find({
            department: deptRegex
            // Removed semester filter to show all department exams as requested
        })
            .populate('course', 'name code')
            .sort({ date: 1 });

        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get exams for logged-in faculty
exports.getFacultyExams = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user.id });
        if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

        // Find exams for courses assigned to this faculty
        // Or simply finding exams in their department
        const deptRegex = new RegExp('^' + faculty.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');

        const exams = await Exam.find({
            department: deptRegex
        })
            .populate('course', 'name code')
            .sort({ date: 1 });

        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Exam (Admin)
exports.deleteExam = async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get hall ticket data for students (Admin)
exports.getHallTicketData = async (req, res) => {
    try {
        const { department, semester } = req.query;
        if (!department || !semester || department === 'all' || semester === 'all') {
            return res.status(400).json({ message: 'Please select a specific department and semester' });
        }

        // Find students in the dept and semester
        const students = await Student.find({ department, sem: semester }).populate('user', 'name');

        // Find exams for this dept and semester
        const exams = await Exam.find({ department, semester }).populate('course', 'name code');

        res.json({ students, exams });
    } catch (error) {
        console.error('Get Hall Ticket Data Error:', error);
        res.status(500).json({ message: error.message });
    }
};
