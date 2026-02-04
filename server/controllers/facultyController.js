const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Notice = require('../models/Notice');
const NoticeRead = require('../models/NoticeRead');
const Mark = require('../models/Mark');
const Notification = require('../models/Notification');

// @desc    Get faculty dashboard stats
// @route   GET /api/faculty/dashboard-stats
// @access  Private (Faculty)
exports.getDashboardStats = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user.id }).populate('user', 'name');
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const deptRegex = new RegExp('^' + faculty.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        const assignedCourses = await Course.find({
            $or: [
                { assignedFaculty: faculty._id },
                { department: deptRegex }
            ]
        });
        const uniqueDepartments = new Set(assignedCourses.map(c => c.department));

        // Today's classes
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const Timetable = require('../models/Timetable');
        const todayClasses = await Timetable.find({
            faculty: faculty._id,
            day: today
        }).populate('course');

        // Recent Announcements
        const announcements = await Notice.find({
            targetAudience: { $in: ['all', 'faculty'] },
            isPublished: true
        }).sort({ createdAt: -1 }).limit(5).populate('postedBy', 'name');

        // Pending Evaluations (Students in relevant department/course without marks)
        let pendingEvaluations = 0;
        for (const course of assignedCourses) {
            const enrolledStudentIds = await Student.find({ enrolledCourses: course._id }).distinct('_id');
            const deptRegex = new RegExp('^' + course.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
            const deptStudentIds = await Student.find({ department: deptRegex }).distinct('_id');
            const allStudentIds = [...new Set([...enrolledStudentIds.map(id => id.toString()), ...deptStudentIds.map(id => id.toString())])];

            const studentCount = allStudentIds.length;
            const markCount = await Mark.countDocuments({ course: course._id });
            if (studentCount > markCount) {
                pendingEvaluations += (studentCount - markCount);
            }
        }

        res.json({
            facultyName: faculty.user.name,
            stats: {
                totalCourses: {
                    value: assignedCourses.length,
                    subtitle: `In ${uniqueDepartments.size} Department(s)`
                },
                classesToday: {
                    value: todayClasses.length,
                    subtitle: `${todayClasses.length} Active sessions today`
                },
                pendingEvaluations: {
                    value: pendingEvaluations,
                    subtitle: "Pending mark uploads"
                }
            },
            todayClasses: todayClasses.map(c => ({
                id: c._id,
                courseId: c.course._id,
                subject: c.course.name,
                time: `${c.startTime} - ${c.endTime}`,
                room: c.room,
                type: 'Lecture'
            })),
            announcements: announcements.map(a => ({
                id: a._id,
                title: a.title,
                content: a.content,
                author: a.postedBy.name,
                date: a.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assigned courses with today's marking status
// @route   GET /api/faculty/courses
// @access  Private (Faculty)
exports.getAssignedCourses = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user.id });
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const deptRegex = new RegExp('^' + faculty.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        const courses = await Course.find({
            $or: [
                { assignedFaculty: faculty._id },
                { department: deptRegex }
            ]
        });

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const coursesWithStatus = await Promise.all(courses.map(async (course) => {
            const marked = await Attendance.findOne({
                course: course._id,
                date: today
            });
            return {
                ...course.toObject(),
                isMarkedToday: !!marked
            };
        }));


        res.json(coursesWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students for a course with attendance stats
// @route   GET /api/faculty/courses/:courseId/students
// @access  Private (Faculty)
exports.getCourseStudents = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // 1. Students explicitly enrolled
        const enrolledStudentIds = await Student.find({ enrolledCourses: courseId }).distinct('_id');

        // 2. Students in same department as the course
        // We use a case-insensitive regex for robust matching
        const deptRegex = new RegExp('^' + course.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        const deptStudentIds = await Student.find({ department: deptRegex }).distinct('_id');

        // Merge and get unique IDs
        const allStudentIds = [...new Set([...enrolledStudentIds.map(id => id.toString()), ...deptStudentIds.map(id => id.toString())])];

        const students = await Student.find({ _id: { $in: allStudentIds } }).populate('user', 'name email');

        const studentsWithStats = await Promise.all(students.map(async (student) => {
            const history = await Attendance.find({
                course: courseId,
                student: student._id
            });
            const total = history.length;
            const present = history.filter(a => a.status === 'Present').length;
            const percentage = total > 0 ? (present / total) * 100 : 0;

            return {
                ...student.toObject(),
                attendancePercentage: percentage.toFixed(1)
            };
        }));

        res.json(studentsWithStats);
    } catch (error) {
        console.error('Error in getCourseStudents:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students enrolled in any course taught by this faculty
// @route   GET /api/faculty/all-students
// @access  Private (Faculty)
exports.getAllFacultyStudents = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user.id });
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const courses = await Course.find({ assignedFaculty: faculty._id });
        const courseIds = courses.map(c => c._id);

        // 1. Students enrolled in faculty's courses
        const enrolledStudentIds = await Student.find({ enrolledCourses: { $in: courseIds } }).distinct('_id');

        // 2. Students in the same department
        const deptRegex = new RegExp('^' + faculty.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        const deptStudentIds = await Student.find({ department: deptRegex }).distinct('_id');

        // Merge and get unique IDs
        const allStudentIds = [...new Set([...enrolledStudentIds, ...deptStudentIds])];

        const students = await Student.find({ _id: { $in: allStudentIds } })
            .populate('user', 'name email profileImage')
            .populate('enrolledCourses', 'name code');

        // Add attendance and marks summary for each student
        const studentData = await Promise.all(students.map(async (student) => {
            const attendance = await Attendance.find({ student: student._id, course: { $in: courseIds } });
            const total = attendance.length;
            const present = attendance.filter(a => a.status === 'Present').length;
            const attendPercent = total > 0 ? (present / total) * 100 : 0;

            const marks = await Mark.find({ student: student._id, course: { $in: courseIds } });

            return {
                ...student.toObject(),
                summary: {
                    attendancePercentage: attendPercent.toFixed(1),
                    totalMarksUploaded: marks.length,
                    coursesEnrolled: student.enrolledCourses.filter(c => courseIds.some(id => id.equals(c._id))).length
                }
            };
        }));

        res.json(studentData);
    } catch (error) {
        console.error('getAllFacultyStudents Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed progress for a specific student in faculty's context
// @route   GET /api/faculty/students/:studentId
// @access  Private (Faculty)
exports.getStudentDetail = async (req, res) => {
    try {
        const { studentId } = req.params;
        const faculty = await Faculty.findOne({ user: req.user.id });
        const courses = await Course.find({ assignedFaculty: faculty._id });
        const courseIds = courses.map(c => c._id);

        const student = await Student.findById(studentId)
            .populate('user', 'name email profileImage phone address gender dob bio socialLinks')
            .populate('enrolledCourses', 'name code');

        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Filter student's courses to only those taught by this faculty
        const sharedCourses = student.enrolledCourses.filter(c => courseIds.some(id => id.equals(c._id)));

        const details = await Promise.all(sharedCourses.map(async (course) => {
            const attendance = await Attendance.find({ student: studentId, course: course._id });
            const marks = await Mark.find({ student: studentId, course: course._id });

            return {
                courseName: course.name,
                courseCode: course.code,
                attendance: {
                    total: attendance.length,
                    present: attendance.filter(a => a.status === 'Present').length,
                    absent: attendance.filter(a => a.status === 'Absent').length
                },
                marks: marks.map(m => ({
                    examType: m.examType,
                    obtained: m.marksObtained,
                    max: m.maxMarks
                }))
            };
        }));

        res.json({
            profile: student,
            courseDetails: details
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark attendance for a class (Upsert supported)
// @route   POST /api/faculty/attendance
// @access  Private (Faculty)
exports.markAttendance = async (req, res) => {
    const { courseId, date, attendanceData } = req.body; // attendanceData: [{ studentId, status }]

    try {
        const dateObj = new Date(date);
        dateObj.setUTCHours(0, 0, 0, 0);

        // Get existing QR attendance for this course and date
        const qrAttendance = await Attendance.find({
            course: courseId,
            date: dateObj,
            markedVia: 'QR'
        });

        const qrStudentIds = new Set(qrAttendance.map(a => a.student.toString()));

        // Filter out students who already have QR attendance
        const studentsToUpdate = attendanceData.filter(s => !qrStudentIds.has(s.studentId));

        if (studentsToUpdate.length === 0 && attendanceData.length > 0) {
            return res.status(200).json({ message: 'Attendance skipped for students with QR records', skippedCount: qrStudentIds.size });
        }

        const operations = studentsToUpdate.map(item => ({
            updateOne: {
                filter: {
                    course: courseId,
                    student: item.studentId,
                    date: dateObj
                },
                update: {
                    $set: {
                        status: item.status,
                        markedBy: req.user.id,
                        markedByType: 'Faculty',
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
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get attendance records for a specific course and date
// @route   GET /api/faculty/attendance
// @access  Private (Faculty)
exports.getAttendance = async (req, res) => {
    const { courseId, date } = req.query;

    try {
        const dateObj = new Date(date);
        dateObj.setUTCHours(0, 0, 0, 0);

        const attendance = await Attendance.find({
            course: courseId,
            date: dateObj
        });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Upload marks for a course
// @route   POST /api/faculty/marks
// @access  Private (Faculty)
exports.uploadMarks = async (req, res) => {
    const { courseId, studentId, examType, marksObtained, maxMarks } = req.body;

    try {
        const mark = await Mark.findOneAndUpdate(
            { course: courseId, student: studentId, examType },
            { marksObtained, maxMarks },
            { upsert: true, new: true }
        );
        res.status(201).json(mark);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance analytics for a course
// @route   GET /api/faculty/courses/:courseId/stats
// @access  Private (Faculty)
exports.getCourseStats = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const enrolledStudentIds = await Student.find({ enrolledCourses: courseId }).distinct('_id');
        const deptRegex = new RegExp('^' + course.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        const deptStudentIds = await Student.find({ department: deptRegex }).distinct('_id');
        const allStudentIds = [...new Set([...enrolledStudentIds.map(id => id.toString()), ...deptStudentIds.map(id => id.toString())])];

        const totalStudents = allStudentIds.length;
        const attendanceRecords = await Attendance.find({ course: courseId });

        // Simple aggregation for average attendance
        const totalEntries = attendanceRecords.length;
        const presentEntries = attendanceRecords.filter(r => r.status === 'Present').length;
        const avgAttendance = totalEntries > 0 ? (presentEntries / totalEntries) * 100 : 0;

        res.json({
            totalStudents,
            avgAttendance: avgAttendance.toFixed(1),
            totalClasses: 0 // Placeholder or calculate from unique dates
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a notice
// @route   POST /api/faculty/notices
// @access  Private (Faculty)
exports.createNotice = async (req, res) => {
    const { title, content, targetAudience } = req.body;

    try {
        const notice = await Notice.create({
            title,
            content,
            postedBy: req.user.id,
            targetAudience: targetAudience || 'student'
        });
        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance history (summary by date) for a course
// @route   GET /api/faculty/courses/:courseId/history
// @access  Private (Faculty)
exports.getAttendanceHistory = async (req, res) => {
    try {
        const history = await Attendance.aggregate([
            { $match: { course: new (require('mongoose').Types.ObjectId)(req.params.courseId) } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "UTC" } },
                    present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
                    total: { $sum: 1 }
                }
            },
            { $sort: { "_id": -1 } },
            { $limit: 10 }
        ]);

        res.json(history.map(h => ({
            date: h._id,
            present: h.present,
            absent: h.absent,
            total: h.total
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get faculty profile
// @route   GET /api/faculty/profile
// @access  Private (Faculty)
exports.getFacultyProfile = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user.id })
            .populate('user', 'name email profileImage phone address gender dob bio socialLinks')
            .populate('assignedCourses', 'name code');
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Update faculty profile
// @route   PUT /api/faculty/profile
// @access  Private (Faculty)
exports.updateFacultyProfile = async (req, res) => {
    try {
        const {
            department, designation, employeeId,
            qualifications, experience, joiningDate, researchArea,
            phone, address, gender, dob, bio, socialLinks
        } = req.body;


        const faculty = await Faculty.findOne({ user: req.user.id });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }

        // Update Faculty specific fields
        if (department) faculty.department = department;
        if (designation) faculty.designation = designation;
        if (employeeId) faculty.employeeId = employeeId;
        if (qualifications) faculty.qualifications = qualifications;
        if (experience) faculty.experience = experience;
        if (joiningDate) faculty.joiningDate = joiningDate;
        if (researchArea !== undefined) faculty.researchArea = researchArea;


        await faculty.save();

        // Update User common fields
        const userUpdate = {};
        if (phone) userUpdate.phone = phone;
        if (address) userUpdate.address = address;
        if (gender) userUpdate.gender = gender;
        if (dob) userUpdate.dob = dob;
        if (bio) userUpdate.bio = bio;
        if (socialLinks) userUpdate.socialLinks = socialLinks;

        await require('../models/User').findByIdAndUpdate(req.user.id, userUpdate);

        const updatedProfile = await Faculty.findOne({ user: req.user.id })
            .populate('user', '-password')
            .populate('assignedCourses', 'name code');
        res.json(updatedProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload faculty profile image
// @route   POST /api/faculty/profile/image
// @access  Private (Faculty)
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const profileImageUrl = `/uploads/profile/${req.file.filename}`;

        await require('../models/User').findByIdAndUpdate(req.user.id, {
            profileImage: profileImageUrl
        });

        res.json({
            message: 'Profile image updated successfully',
            profileImage: profileImageUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeProfileImage = async (req, res) => {
    try {
        await require('../models/User').findByIdAndUpdate(req.user.id, {
            $unset: { profileImage: "" }
        });

        res.json({ message: 'Profile image removed successfully' });
    } catch (error) {
        console.error('Remove Profile Image Error:', error);
        res.status(500).json({ message: error.message });
    }
};



// @desc    Search all students in the system (for enrollment)
// @route   GET /api/faculty/search-students
// @access  Private (Faculty)
exports.searchAllStudents = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        // Find user IDs first for name search
        const users = await require('../models/User').find({
            name: { $regex: query, $options: 'i' },
            role: 'student'
        }).select('_id');
        const userIds = users.map(u => u._id);

        const studentsByBoth = await Student.find({
            $or: [
                { admissionNumber: { $regex: query, $options: 'i' } },
                { user: { $in: userIds } },
                { department: { $regex: query, $options: 'i' } } // Also allow searching by department
            ]
        }).populate('user', 'name email profileImage').limit(20);

        res.json(studentsByBoth);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enroll a student into a faculty's course
// @route   POST /api/faculty/enroll-student
// @access  Private (Faculty)
exports.enrollStudent = async (req, res) => {
    const { studentId, courseId } = req.body;
    try {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        if (student.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ message: 'Student already enrolled in this course' });
        }

        student.enrolledCourses.push(courseId);
        await student.save();

        res.json({ message: 'Student enrolled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unenroll a student from a faculty's course
// @route   POST /api/faculty/unenroll-student
// @access  Private (Faculty)
exports.unenrollStudent = async (req, res) => {
    const { studentId, courseId } = req.body;
    try {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        student.enrolledCourses = student.enrolledCourses.filter(c => c.toString() !== courseId);
        await student.save();

        res.json({ message: 'Student unenrolled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notices = await Notice.find({
            targetAudience: { $in: ['all', 'faculty'] },
            isPublished: true
        }).sort({ createdAt: -1 }).populate('postedBy', 'name');

        const readNotices = await NoticeRead.find({ userId: req.user._id });
        const readNoticeIds = readNotices.map(rn => rn.noticeId.toString());

        const formattedNotices = notices.map(notice => ({
            id: notice._id,
            title: notice.title,
            content: notice.content,
            type: notice.type || 'general',
            author: notice.postedBy?.name || 'Admin',
            date: notice.createdAt,
            targetAudience: notice.targetAudience,
            read: readNoticeIds.includes(notice._id.toString())
        }));

        res.json(formattedNotices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await NoticeRead.findOneAndUpdate(
            { noticeId: req.params.id, userId: req.user._id },
            { noticeId: req.params.id, userId: req.user._id },
            { upsert: true, new: true }
        );
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Leave = require('../models/Leave');

exports.getLeaveRequests = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user.id });
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const leaves = await Leave.find({ faculty: faculty._id })
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name admissionNumber' }
            })
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error) {
        console.error('Get Leave Requests Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, facultyComment } = req.body;

        // Basic validation
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status, facultyComment },
            { new: true }
        );

        if (!leave) return res.status(404).json({ message: 'Leave application not found' });

        res.json({ message: 'Leave status updated successfully', leave });
    } catch (error) {
        console.error('Update Leave Status Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search all courses in the system
// @route   GET /api/faculty/search-courses
// @access  Private (Faculty)
exports.searchAllCourses = async (req, res) => {
    try {
        const { query } = req.query;
        let filter = {};
        if (query) {
            filter = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { code: { $regex: query, $options: 'i' } },
                    { department: { $regex: query, $options: 'i' } }
                ]
            };
        }

        const courses = await Course.find(filter).populate('assignedFaculty', 'user').limit(20);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a course (self-assignment)
// @route   POST /api/faculty/join-course
// @access  Private (Faculty)
exports.joinCourse = async (req, res) => {
    const { courseId } = req.body;
    try {
        const faculty = await Faculty.findOne({ user: req.user.id });
        if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Add to faculty's assignedCourses if not already there
        if (!faculty.assignedCourses) faculty.assignedCourses = [];
        if (!faculty.assignedCourses.includes(courseId)) {
            faculty.assignedCourses.push(courseId);
            await faculty.save();
        }

        // Also update course's assignedFaculty if it's currently empty
        if (!course.assignedFaculty) {
            course.assignedFaculty = faculty._id;
            await course.save();
        }

        res.json({ message: 'Successfully joined course', course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload course material
// @route   POST /api/faculty/courses/:courseId/materials
// @access  Private (Faculty)
exports.uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title } = req.body;
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const material = {
            title: title || req.file.originalname,
            fileUrl: `/uploads/materials/${req.file.filename}`
        };

        course.materials.push(material);
        await course.save();

        res.status(201).json(course.materials[course.materials.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete course material
// @route   DELETE /api/faculty/courses/:courseId/materials/:materialId
// @access  Private (Faculty)
exports.deleteMaterial = async (req, res) => {
    try {
        const { courseId, materialId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const material = course.materials.id(materialId);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        // Delete from filesystem
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', material.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        course.materials.pull(materialId);
        await course.save();

        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send alert to a specific student
// @route   POST /api/faculty/send-alert
// @access  Private (Faculty)
exports.sendStudentAlert = async (req, res) => {
    try {
        const { studentId, message } = req.body;
        const faculty = await Faculty.findOne({ user: req.user.id }).populate('user', 'name');

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await Notification.create({
            recipient: student.user,
            title: `Alert from Prof. ${faculty.user.name.split(' ').pop()}`,
            message: message,
            type: 'alert'
        });

        res.json({ message: 'Alert sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get marks for a course and exam type
// @route   GET /api/faculty/marks
// @access  Private (Faculty)
exports.getMarks = async (req, res) => {
    try {
        const { courseId, examType } = req.query;
        if (!courseId || !examType) {
            return res.status(400).json({ message: 'Course ID and Exam Type are required' });
        }

        const marks = await Mark.find({ course: courseId, examType });
        res.json(marks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear marks for a course and exam type
// @route   DELETE /api/faculty/marks
// @access  Private (Faculty)
exports.clearMarks = async (req, res) => {
    try {
        const { courseId, examType } = req.query;
        if (!courseId || !examType) {
            return res.status(400).json({ message: 'Course ID and Exam Type are required' });
        }

        await Mark.deleteMany({ course: courseId, examType });
        res.json({ message: 'Marks cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.clearNotifications = async (req, res) => {
    try {
        // 1. Delete all direct notifications
        await Notification.deleteMany({ recipient: req.user._id });

        // 2. Mark all notices as read for this user
        const notices = await Notice.find({
            targetAudience: { $in: ['all', 'faculty'] },
            isPublished: true
        });

        const readOperations = notices.map(notice => ({
            updateOne: {
                filter: { noticeId: notice._id, userId: req.user._id },
                update: { noticeId: notice._id, userId: req.user._id },
                upsert: true
            }
        }));

        if (readOperations.length > 0) {
            await NoticeRead.bulkWrite(readOperations);
        }

        res.json({ message: 'Notifications cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
