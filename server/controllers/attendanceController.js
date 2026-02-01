const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
    const { courseId, students, date: reqDate } = req.body;

    // Normalize date to UTC midnight
    const date = reqDate ? new Date(reqDate) : new Date();
    date.setUTCHours(0, 0, 0, 0);

    try {
        // Find faculty profile
        const Faculty = require('../models/Faculty');
        const faculty = await Faculty.findOne({ user: req.user._id });

        // Get existing QR attendance for this course and date
        const qrAttendance = await Attendance.find({
            course: courseId,
            date: date,
            markedVia: 'QR'
        });

        const qrStudentIds = new Set(qrAttendance.map(a => a.student.toString()));

        // Filter out students who already have QR attendance
        const studentsToUpdate = students.filter(s => !qrStudentIds.has(s.studentId));

        const operations = studentsToUpdate.map(s => ({
            updateOne: {
                filter: {
                    course: courseId,
                    student: s.studentId,
                    date: date
                },
                update: {
                    $set: {
                        status: s.status,
                        markedBy: faculty ? faculty._id : req.user._id,
                        markedByType: faculty ? 'Faculty' : 'Admin',
                        markedVia: 'Manual'
                    }
                },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Attendance.bulkWrite(operations);
        }

        res.status(200).json({
            message: 'Attendance updated successfully',
            skippedCount: qrStudentIds.size
        });
    } catch (error) {
        console.error('Mark Attendance Error:', error);
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
