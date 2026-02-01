const AttendanceQR = require('../models/AttendanceQR');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Generate QR session for attendance
exports.generateQR = async (req, res) => {
    try {
        const { courseId } = req.body;


        // Find faculty profile for the logged in user
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }
        const facultyId = faculty._id;

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        // Verify faculty teaches this course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!course.assignedFaculty || course.assignedFaculty.toString() !== facultyId.toString()) {
            console.log('--- AUTH FAILURE DEBUG ---');
            console.log('Course ID:', courseId);
            console.log('Course Name:', course.name);
            console.log('Course Assigned Faculty:', course.assignedFaculty);
            console.log('Logged In Faculty ID:', facultyId);
            console.log('Match check:', course.assignedFaculty?.toString() === facultyId?.toString());
            console.log('--------------------------');

            return res.status(403).json({ message: 'You are not authorized to take attendance for this course' });
        }

        // Close any existing active QR sessions for this faculty
        await AttendanceQR.updateMany(
            { faculty: facultyId, isActive: true },
            { isActive: false }
        );

        // Generate new QR session
        const qrToken = uuidv4();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const qrSession = new AttendanceQR({
            qrToken,
            course: courseId,
            faculty: facultyId,
            expiresAt,
            isActive: true
        });

        await qrSession.save();

        res.status(201).json({
            message: 'QR session created successfully',
            qrToken,
            expiresAt,
            courseId,
            courseName: course.name
        });

    } catch (error) {
        console.error('Generate QR error:', error);
        res.status(500).json({ message: 'Failed to generate QR code', error: error.message });
    }
};

// Close/invalidate QR session
exports.closeQR = async (req, res) => {
    try {
        const { qrToken } = req.params;


        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }
        const facultyId = faculty._id;

        const qrSession = await AttendanceQR.findOne({ qrToken, faculty: facultyId });

        if (!qrSession) {
            return res.status(404).json({ message: 'QR session not found' });
        }

        qrSession.isActive = false;
        await qrSession.save();

        res.json({
            message: 'QR session closed successfully',
            scannedCount: qrSession.scannedStudents.length
        });

    } catch (error) {
        console.error('Close QR error:', error);
        res.status(500).json({ message: 'Failed to close QR session', error: error.message });
    }
};

// Student scans QR to mark attendance
exports.scanQR = async (req, res) => {
    try {
        const { qrToken } = req.body;
        const userId = req.user._id;

        // Find student
        const student = await Student.findOne({ user: userId });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // Find and validate QR session
        const qrSession = await AttendanceQR.findOne({ qrToken }).populate('course', 'name code');

        if (!qrSession) {
            return res.status(404).json({ message: 'Invalid QR code' });
        }

        // Check if QR is active
        if (!qrSession.isActive) {
            return res.status(400).json({ message: 'This QR code has been closed by the faculty' });
        }

        // Check if expired
        if (qrSession.expiresAt < new Date()) {
            qrSession.isActive = false;
            await qrSession.save();
            return res.status(400).json({ message: 'This QR code has expired' });
        }

        // Check if student already scanned
        const alreadyScanned = qrSession.scannedStudents.some(
            s => s.student.toString() === student._id.toString()
        );

        if (alreadyScanned) {
            return res.status(400).json({ message: 'You have already marked attendance for this session' });
        }

        // Verify student is enrolled in the course
        // qrSession.course is populated, so use ._id
        const course = await Course.findById(qrSession.course._id || qrSession.course);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const isEnrolled = course.enrolledStudents && course.enrolledStudents.some(
            s => s.toString() === student._id.toString()
        );

        if (!isEnrolled) {
            const logMsg = `--- SCAN FAILURE ---\nStudent: ${student._id}\nCourse: ${qrSession.course.name} (${qrSession.course._id})\nEnrolled: ${course.enrolledStudents.join(', ')}\n----------------\n`;
            fs.appendFileSync(path.join(__dirname, '../debug_log.txt'), logMsg);

            return res.status(403).json({ message: 'You are not authorized to take attendance for this course' });
        }

        // Add student to scanned list
        qrSession.scannedStudents.push({
            student: student._id,
            scannedAt: new Date()
        });
        await qrSession.save();

        // Create/Update attendance record
        // Normalize date to midnight to match getAttendance query
        const attendDate = new Date(qrSession.date || new Date());
        attendDate.setUTCHours(0, 0, 0, 0);

        await Attendance.findOneAndUpdate(
            {
                student: student._id,
                course: qrSession.course,
                date: attendDate
            },
            {
                $set: {
                    status: 'Present',
                    markedBy: qrSession.faculty,
                    markedVia: 'QR'
                }
            },
            { upsert: true, new: true }
        );


        res.json({
            message: 'Attendance marked successfully',
            course: qrSession.course.name,
            date: qrSession.date
        });

    } catch (error) {
        console.error('Scan QR error:', error);
        res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
    }
};

// Get active QR session for faculty
exports.getActiveSession = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) {
            // If checking for session but not a faculty (e.g. admin hacking), just return false
            return res.json({ hasActiveSession: false });
        }
        const facultyId = faculty._id;

        const activeSession = await AttendanceQR.findOne({
            faculty: facultyId,
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).populate('course', 'name code');

        if (!activeSession) {
            return res.json({ hasActiveSession: false });
        }

        res.json({
            hasActiveSession: true,
            qrToken: activeSession.qrToken,
            course: activeSession.course,
            expiresAt: activeSession.expiresAt,
            scannedCount: activeSession.scannedStudents.length,
            scannedStudents: activeSession.scannedStudents
        });

    } catch (error) {
        console.error('Get active session error:', error);
        res.status(500).json({ message: 'Failed to get active session', error: error.message });
    }
};
