const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');
const Leave = require('../models/Leave');
const Exam = require('../models/Exam');
const User = require('../models/User');

/**
 * Query database based on user intent and keywords
 */
async function queryDatabase(message, userId = null) {
    const lowerMessage = message.toLowerCase();
    const results = {
        personalContext: {}
    };

    try {
        // --- 1. ALWAYS-AVAILABLE PERSONAL CONTEXT ---
        // If user is logged in, we provide their core identity and schedule context automatically
        if (userId) {
            const student = await Student.findOne({ user: userId }).populate('enrolledCourses');
            const faculty = await Faculty.findOne({ user: userId });

            if (student) {
                results.personalContext.type = 'Student';
                results.personalContext.profile = {
                    dept: student.department,
                    sem: student.sem,
                    section: student.section,
                    admission: student.admissionNumber
                };

                // Personal Courses
                if (student.enrolledCourses && student.enrolledCourses.length > 0) {
                    results.personalContext.courses = student.enrolledCourses.map(c => ({
                        name: c.name,
                        code: c.code,
                        instructor: 'Fetching...' // Will populate below
                    }));
                }

                // Personal Timetable
                const courseIds = student.enrolledCourses?.map(c => c._id) || [];
                let timetables = [];
                if (courseIds.length > 0) {
                    timetables = await Timetable.find({ course: { $in: courseIds } }).populate('course', 'name code');
                } else {
                    // Fallback to dept/sem
                    const deptCourses = await Course.find({ department: student.department, semester: student.sem });
                    const deptCourseIds = deptCourses.map(c => c._id);
                    timetables = await Timetable.find({ course: { $in: deptCourseIds } }).populate('course', 'name code');
                }

                results.personalContext.timetable = timetables.map(tt => ({
                    day: tt.day,
                    time: `${tt.startTime} - ${tt.endTime}`,
                    course: tt.course?.name,
                    room: tt.room
                }));

                // Basic Attendance Stats
                const attendanceStats = await Attendance.aggregate([
                    { $match: { student: student._id } },
                    {
                        $group: {
                            _id: "$course",
                            present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                            total: { $sum: 1 }
                        }
                    },
                    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseInfo' } }
                ]);

                results.personalContext.attendanceOverview = attendanceStats.map(stat => ({
                    course: stat.courseInfo[0]?.name || 'Unknown',
                    percentage: ((stat.present / stat.total) * 100).toFixed(1) + '%'
                }));
            } else if (faculty) {
                results.personalContext.type = 'Faculty';
                results.personalContext.profile = {
                    dept: faculty.department,
                    designation: faculty.designation
                };

                // Faculty Timetable
                const tt = await Timetable.find({ faculty: faculty._id }).populate('course', 'name code');
                results.personalContext.timetable = tt.map(tt => ({
                    day: tt.day,
                    time: `${tt.startTime} - ${tt.endTime}`,
                    course: tt.course?.name,
                    room: tt.room
                }));
            }
        }

        // --- 2. INTENT-BASED DEEP QUERIES ---
        const isAttendanceQuery = /attendance|present|absent|attendance rate|atendance|classes attended/i.test(message);
        const isGradeQuery = /grade|mark|score|result|cgpa|gpa|marksheet|how did i do/i.test(message);
        const isCourseQuery = /course|subject|class|enrolled|what do i study|my subjects|syllabus|listing of subjects/i.test(message);
        const isAssignmentQuery = /assignment|homework|task|submission|pending work|deadline/i.test(message);
        const isTimetableQuery = /timetable|schedule|timing|when|when is my class|period|routine|classes today/i.test(message);
        const isLeaveQuery = /leave|holiday|vacation|absent request|apply for leave/i.test(message);
        const isExamQuery = /exam|test|examination|date sheet|exam info/i.test(message);
        const isStudentQuery = /student|total student|how many student|student count/i.test(message);
        const isFacultyQuery = /faculty|teacher|professor|instructor|who teaches|who is my professor|staff/i.test(message);

        // Specific Student/Faculty info if requested
        if (isStudentQuery) {
            const count = await Student.countDocuments();
            results.studentStats = { totalCount: count };
        }

        if (isFacultyQuery) {
            const faculty = await Faculty.find().populate('user', 'name email').limit(20);
            results.facultyList = faculty.map(f => ({
                name: f.user?.name,
                email: f.user?.email,
                dept: f.department,
                subjects: f.subjects // if field exists
            }));
        }

        if (isCourseQuery && !results.personalContext.courses) {
            results.allCourses = await Course.find({}).limit(10).select('name code department semester');
        }

        if (isGradeQuery && userId) {
            const student = await Student.findOne({ user: userId });
            if (student) {
                results.detailedGrades = await Mark.find({ student: student._id }).populate('course', 'name code');
            }
        }

        if (isAssignmentQuery && userId) {
            results.activeAssignments = await Assignment.find().populate('course', 'name code').sort({ dueDate: 1 }).limit(10);
        }

        if (isLeaveQuery && userId) {
            results.myLeaves = await Leave.find({ user: userId }).sort({ createdAt: -1 }).limit(5);
        }

        if (isExamQuery) {
            results.upcomingExams = await Exam.find().populate('course', 'name code').sort({ date: 1 }).limit(10);
        }

        return results;

    } catch (error) {
        console.error('Database query error:', error);
        return { error: 'Failed to fetch data from database' };
    }
}

/**
 * Build context string from database results
 */
function buildDatabaseContext(results) {
    if (!results || Object.keys(results).length === 0) {
        return null;
    }

    let context = '\n\n=== ERP DATABASE CONTEXT ===\n';

    // 1. Personal Context (Highest Priority)
    if (results.personalContext && results.personalContext.type) {
        const pc = results.personalContext;
        context += `\nUSER PROFILE: ${pc.type} (${pc.profile?.dept}, Sem: ${pc.profile?.sem || 'N/A'})\n`;

        if (pc.timetable && pc.timetable.length > 0) {
            context += `CURRENT TIMETABLE:\n`;
            pc.timetable.forEach(tt => {
                context += `- ${tt.day} ${tt.time}: ${tt.course} [Room ${tt.room}]\n`;
            });
        }

        if (pc.attendanceOverview && pc.attendanceOverview.length > 0) {
            context += `ATTENDANCE SUMMARY:\n`;
            pc.attendanceOverview.forEach(att => {
                context += `- ${att.course}: ${att.percentage}\n`;
            });
        }
    }

    // 2. Intent-specific Data
    if (results.facultyList) {
        context += `\nFACULTY INFORMATION:\n`;
        results.facultyList.forEach(f => {
            context += `- Prof. ${f.name} (${f.dept}) - ${f.email || 'No email'}\n`;
        });
    }

    if (results.detailedGrades) {
        context += `\nDETAILED GRADES:\n`;
        results.detailedGrades.forEach(g => {
            context += `- ${g.course?.name}: ${g.marksObtained}/${g.totalMarks} (Grade: ${g.grade})\n`;
        });
    }

    if (results.activeAssignments) {
        context += `\nPENDING ASSIGNMENTS:\n`;
        results.activeAssignments.forEach(a => {
            context += `- ${a.title} [${a.course?.name}] due ${new Date(a.dueDate).toLocaleDateString()}\n`;
        });
    }

    if (results.upcomingExams) {
        context += `\nEXAM SCHEDULE:\n`;
        results.upcomingExams.forEach(e => {
            context += `- ${e.course?.name} on ${new Date(e.date).toLocaleDateString()} at ${e.startTime}\n`;
        });
    }

    if (results.allCourses) {
        context += `\nSYSTEM COURSES:\n`;
        results.allCourses.forEach(c => {
            context += `- ${c.name} (${c.code}) - Dept: ${c.department}\n`;
        });
    }

    context += '\n=== END ERP DATA ===\n';
    return context;
}

module.exports = {
    queryDatabase,
    buildDatabaseContext
};
