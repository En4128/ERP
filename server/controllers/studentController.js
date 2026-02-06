const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../../dashboard_debug.log');
const Course = require('../models/Course');
const Mark = require('../models/Mark');
const Timetable = require('../models/Timetable');
const Notice = require('../models/Notice');
const NoticeRead = require('../models/NoticeRead');
const Assignment = require('../models/Assignment');
const Leave = require('../models/Leave');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');
const Fee = require('../models/Fee');

exports.getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id })
            .populate('user', '-password')
            .populate('enrolledCourses');
        if (!student) return res.status(404).json({ message: 'Student profile not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStudentProfile = async (req, res) => {
    try {
        const {
            phone, address, gender, dob, bio, socialLinks,
            batch, guardianName, guardianPhone
        } = req.body;

        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Update Student specific fields
        if (batch) student.batch = batch;
        if (guardianName) student.guardianName = guardianName;
        if (guardianPhone) student.guardianPhone = guardianPhone;

        await student.save();

        // Update User common fields
        const userUpdate = {};
        if (phone) userUpdate.phone = phone;
        if (address) userUpdate.address = address;
        if (gender) userUpdate.gender = gender;
        if (dob) userUpdate.dob = dob;
        if (bio) userUpdate.bio = bio;
        if (socialLinks) userUpdate.socialLinks = socialLinks;

        await require('../models/User').findByIdAndUpdate(req.user.id, userUpdate);

        const updatedStudent = await Student.findOne({ user: req.user.id }).populate('user', '-password');
        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id }).populate('enrolledCourses');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // 1. Attendance Calculation
        const attendanceRecords = await Attendance.find({ student: student._id }).populate('course');

        let totalClasses = 0;
        let presentClasses = 0;
        const attendanceBySubject = {};

        attendanceRecords.forEach(record => {
            if (!record.course) return;
            const courseName = record.course.name;
            if (!attendanceBySubject[courseName]) {
                attendanceBySubject[courseName] = { attended: 0, total: 0 };
            }
            attendanceBySubject[courseName].total++;
            totalClasses++;

            if (record.status === 'Present') {
                attendanceBySubject[courseName].attended++;
                presentClasses++;
            }
        });

        const overallAttendance = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(1) : 0;

        const subjectWiseAttendance = Object.keys(attendanceBySubject).map(subject => ({
            subject,
            attended: attendanceBySubject[subject].attended,
            total: attendanceBySubject[subject].total
        }));

        // 2. Timetable for Today with "isNext" logic
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();
        const today = days[now.getDay()];
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const deptRegex = new RegExp('^' + student.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        const deptCourses = await Course.find({ department: deptRegex });
        const validEnrolledCourses = (student.enrolledCourses || []).filter(c => c);
        const allCourseIds = [...new Set([...validEnrolledCourses.map(c => c._id), ...deptCourses.map(c => c._id)])];

        const timetable = await Timetable.find({
            course: { $in: allCourseIds },
            day: today
        }).populate('course').populate({
            path: 'faculty',
            populate: { path: 'user', select: 'name' }
        });

        let nextFound = false;
        const formattedTimetable = timetable.filter(slot => slot.course).map(slot => {
            const [startHour, startMin] = slot.startTime.split(':').map(Number);
            const slotStartTime = startHour * 60 + startMin;

            let isNext = false;
            if (!nextFound && slotStartTime > currentTime) {
                isNext = true;
                nextFound = true;
            }

            return {
                id: slot._id,
                subject: slot.course.name,
                time: `${slot.startTime} - ${slot.endTime}`,
                room: slot.room,
                faculty: slot.faculty?.user?.name || 'TBA',
                type: slot.type || 'lecture',
                isNext,
                startTimeMinutes: slotStartTime
            };
        }).sort((a, b) => a.startTimeMinutes - b.startTimeMinutes);

        // 3. Recent Announcements & Direct Alerts
        const notices = await Notice.find({
            targetAudience: { $in: ['all', 'student'] },
            isPublished: true
        }).sort({ createdAt: -1 }).limit(5).populate('postedBy', 'name');

        const directAlerts = await Notification.find({
            recipient: req.user._id
        }).sort({ createdAt: -1 }).limit(5);

        const formattedNotices = notices.map(notice => ({
            id: notice._id,
            title: notice.title,
            content: notice.content,
            type: notice.type || 'general',
            author: notice.postedBy?.name || 'Admin',
            date: notice.date || notice.createdAt,
            isGlobal: true
        }));

        const formattedDirect = directAlerts.map(notif => ({
            id: notif._id,
            title: notif.title,
            content: notif.message,
            type: notif.type || 'alert',
            author: notif.title.includes('Alert from') ? notif.title.replace('Alert from ', '') : 'Faculty',
            date: notif.createdAt,
            isGlobal: false
        }));

        const combinedAnnouncements = [...formattedNotices, ...formattedDirect]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        // 4. Grades/CGPA
        const marks = await Mark.find({ student: student._id }).populate('course');

        let totalWeightedPoints = 0;
        let totalCredits = 0;

        const recentGrades = marks.map(mark => {
            if (!mark.course) return null;

            const percentage = mark.maxMarks > 0 ? (mark.marksObtained / mark.maxMarks) * 100 : 0;
            let grade = 'F';
            let gradePoint = 0;

            if (percentage >= 90) { grade = 'O'; gradePoint = 10; }
            else if (percentage >= 80) { grade = 'A+'; gradePoint = 9; }
            else if (percentage >= 70) { grade = 'A'; gradePoint = 8; }
            else if (percentage >= 60) { grade = 'B+'; gradePoint = 7; }
            else if (percentage >= 50) { grade = 'B'; gradePoint = 6; }
            else if (percentage >= 40) { grade = 'C'; gradePoint = 5; }

            const credits = mark.course.credits || 3;
            totalWeightedPoints += (gradePoint * credits);
            totalCredits += credits;

            return {
                subject: mark.course.name,
                marks: mark.marksObtained,
                maxMarks: mark.maxMarks,
                grade,
                percentage: percentage.toFixed(1)
            };
        }).filter(g => g).slice(0, 4);

        const cgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "0.00";

        // 5. Pending Assignments (Detailed List)
        const assignments = await Assignment.find({
            course: { $in: validEnrolledCourses.map(c => c._id) },
            dueDate: { $gte: new Date() },
            status: 'active'
        }).populate('course', 'name').populate({
            path: 'faculty',
            populate: { path: 'user', select: 'name' }
        }).sort({ dueDate: 1 }).limit(3);

        const formattedAssignments = assignments.map(a => ({
            id: a._id,
            title: a.title,
            course: a.course?.name || 'Unknown',
            dueDate: a.dueDate,
            faculty: a.faculty?.user?.name || 'TBA'
        }));
        // 6. Leave Stats
        const leaveStats = {
            pending: await Leave.countDocuments({ student: student._id, status: 'Pending' }),
            approved: await Leave.countDocuments({ student: student._id, status: 'Approved' }),
            rejected: await Leave.countDocuments({ student: student._id, status: 'Rejected' })
        };

        // 7. Dynamic Fee Calculation
        const fees = await Fee.find({
            status: 'active',
            $and: [
                { $or: [{ semester: student.sem }, { semester: 0 }] },
                { $or: [{ department: student.department }, { department: 'All' }] }
            ]
        });
        const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);

        res.json({
            studentName: req.user.name,
            stats: {
                enrolledCourses: validEnrolledCourses.length,
                attendance: parseFloat(overallAttendance),
                cgpa: cgpa,
                pendingAssignmentsCount: formattedAssignments.length,
                pendingAssignments: formattedAssignments,
                leaveStats,
                totalFees
            },
            timetable: formattedTimetable,
            announcements: combinedAnnouncements,
            recentGrades,
            attendanceOverview: subjectWiseAttendance
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAttendanceDetails = async (req, res) => {
    try {
        // Helper for file logging
        const log = (msg) => {
            const logLine = `[${new Date().toISOString()}] ${msg}\n`;
            fs.appendFileSync(logFile, logLine);
            console.log(msg);
        };

        log('=== getAttendanceDetails called ===');
        log(`User ID: ${req.user.id}`);

        const student = await Student.findOne({ user: req.user.id }).populate('enrolledCourses');
        if (!student) {
            log(`Student not found for user: ${req.user.id}`);
            return res.status(404).json({ message: 'Student not found' });
        }

        log(`Student found: ${student.admissionNumber} ${student.department}`);
        log(`Enrolled courses count: ${student.enrolledCourses?.length || 0}`);

        const deptRegex = new RegExp('^' + student.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        const deptCourses = await Course.find({ department: deptRegex });
        log(`Department courses found: ${deptCourses.length}`);

        const allCourseIds = [...new Set([...student.enrolledCourses.map(c => c._id.toString()), ...deptCourses.map(c => c._id.toString())])];
        log(`Total unique course IDs: ${allCourseIds.length}`);

        const allCourses = await Course.find({ _id: { $in: allCourseIds } });
        log(`All courses fetched: ${allCourses.length}`);

        // Fetch all attendance records
        const rawAttendanceRecords = await Attendance.find({ student: student._id })
            .populate({
                path: 'course',
                populate: { path: 'assignedFaculty', populate: { path: 'user' } }
            })
            .sort({ date: -1 });

        log(`Raw attendance records found: ${rawAttendanceRecords.length}`);

        // Filter out orphaned records and log them
        const attendanceRecords = rawAttendanceRecords.filter(record => {
            if (!record.course) {
                log(`Found orphan record (null course): ${record._id}`);
                return false;
            }
            return true;
        });

        log(`Valid attendance records found: ${attendanceRecords.length}`);

        // 1. Subject-wise Stats
        const subjectStatsMap = {};

        // Initialize with all visible courses (enrolled + department)
        for (const course of allCourses) {
            // Fetch full course details with deeply populated faculty and user data
            const fullCourse = await Course.findById(course._id).populate({
                path: 'assignedFaculty',
                populate: { path: 'user', select: 'name email' }
            });

            // Extract faculty name with proper null checks
            let facultyName = 'TBA';
            if (fullCourse && fullCourse.assignedFaculty) {
                if (fullCourse.assignedFaculty.user && fullCourse.assignedFaculty.user.name) {
                    facultyName = fullCourse.assignedFaculty.user.name;
                }
            }

            const courseIdStr = course._id.toString();
            subjectStatsMap[courseIdStr] = {
                id: course._id,
                name: course.name,
                faculty: facultyName,
                total: 0,
                attended: 0,
                color: 'blue' // You might want to assign this dynamically or randomly
            };
        }

        const history = [];

        attendanceRecords.forEach((record, index) => {
            // Use toString() for safe key lookup
            const cId = record.course._id.toString();

            // Debug log for the first record
            if (index === 0) {
                log(`First record Date raw: ${record.date}`);
                log(`First record ISO: ${record.date.toISOString()}`);
                log(`First record LocaleTime: ${record.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
            }

            if (subjectStatsMap[cId]) {
                subjectStatsMap[cId].total++;
                if (record.status === 'Present') {
                    subjectStatsMap[cId].attended++;
                }
            } else {
                log(`Record for course ${record.course.name} (${cId}) not in visible subjects map`);
            }

            history.push({
                id: record._id,
                date: record.date.toLocaleDateString('en-CA'),
                time: record.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                subject: record.course.name,
                status: record.status,
                mode: record.markedVia === 'QR' ? 'QR Scan' : record.markedVia === 'Manual' ? 'Manual' : record.markedVia || 'Manual'
            });
        });

        const subjects = Object.values(subjectStatsMap);
        log(`Subjects to return: ${subjects.length}`);

        // Log one subject's stats as validatino
        if (subjects.length > 0) {
            const s = subjects[0];
            log(`Sample subject ${s.name}: ${s.attended}/${s.total}`);
        }

        // 2. Overall Stats
        let totalAttended = 0;
        let totalClasses = 0;
        const safeZone = { safe: 0, warning: 0, critical: 0 };

        subjects.forEach(sub => {
            totalAttended += sub.attended;
            totalClasses += sub.total;

            const percentage = sub.total > 0 ? (sub.attended / sub.total) * 100 : 0;
            if (percentage >= 75) safeZone.safe++;
            else if (percentage >= 65) safeZone.warning++;
            else safeZone.critical++;
        });

        const averageAttendance = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;

        // 3. Heatmap Data (Last 30 days)
        const heatmapData = [];
        const today = new Date();
        log(`Generating heatmap from ${today.toISOString()}`);

        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-CA');

            // Find records for this date
            const daysClasses = attendanceRecords.filter(r => r.date.toLocaleDateString('en-CA') === dateStr);

            let status = 'holiday'; // Default
            let classes = [];

            if (daysClasses.length > 0) {
                const presentCount = daysClasses.filter(c => c.status === 'Present').length;
                if (presentCount === daysClasses.length) status = 'present';
                else if (presentCount === 0) status = 'absent';
                else status = 'partial';

                classes = daysClasses.map(c => ({
                    name: c.course.name,
                    time: c.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    status: c.status
                }));
            } else {
                // If it's weekend, keep as holiday, else maybe 'no-class' or just holiday
                const dayOfWeek = d.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) status = 'holiday';
                else status = 'holiday'; // Assuming no data means no class
            }

            heatmapData.push({
                date: dateStr,
                status,
                classes
            });
        }

        console.log('Returning response with', subjects.length, 'subjects');
        res.json({
            subjects,
            history,
            stats: {
                averageAttendance,
                safeZone
            },
            heatmap: heatmapData
        });

    } catch (error) {
        console.error('Attendance Details Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentFaculty = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id }).populate('enrolledCourses');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // 1. Get faculty from enrolled courses
        const enrolledCourseFacultyIds = await Course.find({ _id: { $in: student.enrolledCourses } }).distinct('assignedFaculty');

        // 2. Get faculty from the same department
        const deptRegex = new RegExp('^' + student.department.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        const deptFacultyIds = await Faculty.find({ department: deptRegex }).distinct('_id');

        // Merge and get unique IDs
        const allFacultyIds = [...new Set([...enrolledCourseFacultyIds, ...deptFacultyIds])];

        const faculty = await Faculty.find({ _id: { $in: allFacultyIds } })
            .populate('user', 'name email profileImage bio socialLinks')
            .populate('assignedCourses', 'name code');

        // Format for frontend
        const formattedFaculty = faculty.map(f => {
            // Find subjects taught by this faculty that the student is enrolled in
            const sharedSubjects = f.assignedCourses
                .filter(c => student.enrolledCourses.some(ec => ec._id.equals(c._id)))
                .map(c => c.name);

            return {
                _id: f._id, // Actual MongoDB ID for linking
                id: f.employeeId, // Display ID
                name: f.user.name,
                image: f.user.profileImage ? f.user.profileImage : `https://ui-avatars.com/api/?name=${encodeURIComponent(f.user.name)}&background=random`,
                designation: f.designation,
                department: f.department,
                email: f.user.email,
                phone: f.user.phone || 'Not Shared',
                subjects: sharedSubjects.length > 0 ? sharedSubjects : [f.department + " Faculty"],
                availability: 'Available',
                researchArea: f.researchArea || 'General Academics',
                bio: f.user.bio || f.researchArea || `${f.designation} in ${f.department}`,
                socialLinks: f.user.socialLinks || {},
                experience: f.experience || '5+' // Mock default if missing for display
            };

        });

        res.json(formattedFaculty);
    } catch (error) {
        console.error('getStudentFaculty Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notices = await Notice.find({
            targetAudience: { $in: ['all', 'student'] },
            isPublished: true
        }).sort({ createdAt: -1 }).populate('postedBy', 'name');

        const notifications = await Notification.find({
            recipient: req.user._id
        }).sort({ createdAt: -1 });

        const readNotices = await NoticeRead.find({ userId: req.user._id });
        const readNoticeIds = readNotices.map(rn => rn.noticeId.toString());

        const formattedNotices = notices.map(notice => ({
            id: notice._id,
            title: notice.title,
            content: notice.content,
            type: notice.type || 'general',
            author: notice.postedBy?.name || 'Admin',
            date: notice.createdAt,
            read: readNoticeIds.includes(notice._id.toString()),
            isGlobal: true
        }));

        const formattedDirect = notifications.map(notif => ({
            id: notif._id,
            title: notif.title,
            content: notif.message,
            type: notif.type || 'alert',
            author: notif.title.includes('Alert from') ? notif.title.replace('Alert from ', '') : 'Faculty',
            date: notif.createdAt,
            read: notif.read,
            isGlobal: false
        }));

        const merged = [...formattedNotices, ...formattedDirect].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(merged);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const id = req.params.id;

        // Try finding it as a direct notification first
        const directNotif = await Notification.findById(id);
        if (directNotif) {
            directNotif.read = true;
            await directNotif.save();
            return res.json({ message: 'Notification marked as read' });
        }

        // Otherwise assume it's a Notice and use NoticeRead
        await NoticeRead.findOneAndUpdate(
            { noticeId: id, userId: req.user._id },
            { noticeId: id, userId: req.user._id },
            { upsert: true, new: true }
        );
        res.json({ message: 'Marked as read' });
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
            targetAudience: { $in: ['all', 'student'] },
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

exports.getStudentResults = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id }).populate('enrolledCourses');
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const marks = await Mark.find({ student: student._id })
            .populate('course', 'name code semester credits')
            .sort({ createdAt: -1 });

        // Group by Semester
        const resultsBySemester = {};

        marks.forEach(mark => {
            if (!mark.course) return;
            const sem = `Semester ${mark.course.semester || 'Unknown'}`;

            if (!resultsBySemester[sem]) {
                resultsBySemester[sem] = [];
            }

            // Calculate grade (Simple logic, can be customized)
            const percentage = mark.maxMarks > 0 ? (mark.marksObtained / mark.maxMarks) * 100 : 0;
            let grade = 'F';
            let gradePoint = 0;
            if (percentage >= 90) { grade = 'O'; gradePoint = 10; }
            else if (percentage >= 80) { grade = 'A+'; gradePoint = 9; }
            else if (percentage >= 70) { grade = 'A'; gradePoint = 8; }
            else if (percentage >= 60) { grade = 'B+'; gradePoint = 7; }
            else if (percentage >= 50) { grade = 'B'; gradePoint = 6; }
            else if (percentage >= 40) { grade = 'C'; gradePoint = 5; }
            else { grade = 'F'; gradePoint = 0; }

            resultsBySemester[sem].push({
                courseName: mark.course.name,
                courseCode: mark.course.code,
                examType: mark.examType,
                marksObtained: mark.marksObtained,
                maxMarks: mark.maxMarks,
                percentage: percentage.toFixed(2),
                grade,
                gradePoint,
                credits: mark.course.credits || 3 // Default credits if missing
            });
        });

        // Calculate SGPA for each semester
        const semesterSummary = Object.keys(resultsBySemester).map(sem => {
            const subjects = resultsBySemester[sem];
            const totalCredits = subjects.reduce((sum, sub) => sum + sub.credits, 0);
            const totalWeightedPoints = subjects.reduce((sum, sub) => sum + (sub.gradePoint * sub.credits), 0);
            const sgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : 0;

            return {
                semester: sem,
                sgpa,
                results: subjects
            };
        });

        res.json({
            studentName: req.user.name,
            admissionNumber: student.admissionNumber,
            department: student.department,
            results: semesterSummary
        });

    } catch (error) {
        console.error('Get Student Results Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.applyForLeave = async (req, res) => {
    try {
        const { facultyId, type, from, to, reason } = req.body;
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        // Basic validation
        if (!facultyId || !type || !from || !to || !reason) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Verify faculty exists
        const targetFaculty = await Faculty.findById(facultyId);
        if (!targetFaculty) {
            return res.status(404).json({ message: 'Selected faculty not found' });
        }

        const leave = new Leave({
            student: student._id,
            faculty: targetFaculty._id,
            type,
            startDate: from,
            endDate: to,
            reason
        });

        await leave.save();
        res.status(201).json({ message: 'Leave application submitted successfully', leave });
    } catch (error) {
        console.error('Apply Leave Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const leaves = await Leave.find({ student: student._id })
            .populate({
                path: 'faculty',
                populate: { path: 'user', select: 'name' }
            })
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error) {
        console.error('Get My Leaves Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (student.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ message: 'Already enrolled' });
        }

        // Check seat limit
        if (course.seats <= course.enrolled) {
            return res.status(400).json({ message: 'Course is full' });
        }

        student.enrolledCourses.push(courseId);
        await student.save();

        course.enrolled = (course.enrolled || 0) + 1;
        await course.save();

        res.json({ message: 'Enrolled successfully' });
    } catch (error) {
        console.error('Enroll Course Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentFees = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const fees = await Fee.find({
            status: 'active',
            $and: [
                { $or: [{ semester: student.sem }, { semester: 0 }] },
                { $or: [{ department: student.department }, { department: 'All' }] }
            ]
        }).sort({ dueDate: 1 });

        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
        console.error('Upload Profile Image Error:', error);
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
