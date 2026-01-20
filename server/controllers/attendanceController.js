const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
    const { courseId, students } = req.body; // students: [{ studentId, status }]
    const date = new Date();

    try {
        const records = students.map(s => ({
            course: courseId,
            student: s.studentId,
            date: date,
            status: s.status
        }));

        await Attendance.insertMany(records);
        res.status(201).json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAttendanceByCourse = async (req, res) => {
    try {
        const attendance = await Attendance.find({ course: req.params.courseId })
            .populate('student', 'admissionNumber name')
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentAttendance = async (req, res) => {
    try {
        // Assuming req.user.id is linked to Student, or passed as param
        // If logged in as student:
        // First find Student profile by User ID (omitted for brevity, assume passed logic)
        // For now, assume studentId is passed in params
        const attendance = await Attendance.find({ student: req.params.studentId }).populate('course');
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
