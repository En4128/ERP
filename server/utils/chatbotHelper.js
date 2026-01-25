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
    const results = {};

    try {
        // Detect query intent
        const isAttendanceQuery = /attendance|present|absent|attendance rate/i.test(message);
        const isGradeQuery = /grade|mark|score|result|cgpa|gpa/i.test(message);
        const isCourseQuery = /course|subject|class|enrolled/i.test(message);
        const isAssignmentQuery = /assignment|homework|task|submission/i.test(message);
        const isTimetableQuery = /timetable|schedule|timing|when/i.test(message);
        const isLeaveQuery = /leave|holiday|vacation|absent request/i.test(message);
        const isExamQuery = /exam|test|examination/i.test(message);
        const isStudentQuery = /student|how many student|total student/i.test(message);
        const isFacultyQuery = /faculty|teacher|professor|instructor/i.test(message);

        // Query Students
        if (isStudentQuery) {
            const students = await Student.find().populate('user', 'name email');
            results.students = {
                total: students.length,
                byDepartment: {},
                bySemester: {}
            };

            students.forEach(student => {
                // Count by department
                results.students.byDepartment[student.department] =
                    (results.students.byDepartment[student.department] || 0) + 1;

                // Count by semester
                results.students.bySemester[student.semester] =
                    (results.students.bySemester[student.semester] || 0) + 1;
            });
        }

        // Query Faculty
        if (isFacultyQuery) {
            const faculty = await Faculty.find().populate('user', 'name email');
            results.faculty = {
                total: faculty.length,
                byDepartment: {}
            };

            faculty.forEach(fac => {
                results.faculty.byDepartment[fac.department] =
                    (results.faculty.byDepartment[fac.department] || 0) + 1;
            });
        }

        // Query Courses
        if (isCourseQuery) {
            const courses = await Course.find()
                .populate('instructor', 'name')
                .populate('enrolledStudents', 'name');

            results.courses = courses.map(course => ({
                name: course.name,
                code: course.code,
                department: course.department,
                semester: course.semester,
                credits: course.credits,
                instructor: course.instructor?.name,
                enrolledCount: course.enrolledStudents?.length || 0
            }));
        }

        // Query Attendance (if userId provided)
        if (isAttendanceQuery && userId) {
            const student = await Student.findOne({ user: userId });
            if (student) {
                const attendanceRecords = await Attendance.find({ student: student._id })
                    .populate('course', 'name code')
                    .sort({ date: -1 })
                    .limit(50);

                const attendanceStats = {};
                attendanceRecords.forEach(record => {
                    const courseKey = record.course?.name || 'Unknown';
                    if (!attendanceStats[courseKey]) {
                        attendanceStats[courseKey] = { present: 0, total: 0 };
                    }
                    attendanceStats[courseKey].total++;
                    // Check for Present status (case-insensitive)
                    if (record.status && record.status.toLowerCase() === 'present') {
                        attendanceStats[courseKey].present++;
                    }
                });

                results.attendance = {
                    records: attendanceRecords.slice(0, 10).map(r => ({
                        course: r.course?.name,
                        date: r.date,
                        status: r.status
                    })),
                    statistics: Object.entries(attendanceStats).map(([course, stats]) => ({
                        course,
                        percentage: ((stats.present / stats.total) * 100).toFixed(2),
                        present: stats.present,
                        total: stats.total
                    }))
                };
            }
        }

        // Query Marks/Grades (if userId provided)
        if (isGradeQuery && userId) {
            const student = await Student.findOne({ user: userId });
            if (student) {
                const marks = await Mark.find({ student: student._id })
                    .populate('course', 'name code credits')
                    .sort({ createdAt: -1 });

                results.marks = marks.map(mark => ({
                    course: mark.course?.name,
                    courseCode: mark.course?.code,
                    marksObtained: mark.marksObtained,
                    totalMarks: mark.totalMarks,
                    percentage: ((mark.marksObtained / mark.totalMarks) * 100).toFixed(2),
                    grade: mark.grade
                }));

                // Calculate overall stats
                if (marks.length > 0) {
                    const totalPercentage = marks.reduce((sum, m) =>
                        sum + (m.marksObtained / m.totalMarks) * 100, 0);
                    results.overallPercentage = (totalPercentage / marks.length).toFixed(2);
                }
            }
        }

        // Query Assignments
        if (isAssignmentQuery && userId) {
            const student = await Student.findOne({ user: userId });
            if (student) {
                const assignments = await Assignment.find()
                    .populate('course', 'name code')
                    .sort({ dueDate: -1 })
                    .limit(10);

                results.assignments = assignments.map(assignment => ({
                    title: assignment.title,
                    course: assignment.course?.name,
                    dueDate: assignment.dueDate,
                    totalMarks: assignment.totalMarks,
                    description: assignment.description
                }));
            }
        }

        // Query Timetable
        if (isTimetableQuery && userId) {
            const student = await Student.findOne({ user: userId });
            if (student) {
                const timetables = await Timetable.find({
                    department: student.department,
                    semester: student.semester
                }).populate('course', 'name code');

                results.timetable = timetables.map(tt => ({
                    day: tt.day,
                    startTime: tt.startTime,
                    endTime: tt.endTime,
                    course: tt.course?.name,
                    room: tt.room
                }));
            }
        }

        // Query Leave Requests
        if (isLeaveQuery && userId) {
            const leaves = await Leave.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(5);

            results.leaves = leaves.map(leave => ({
                reason: leave.reason,
                startDate: leave.startDate,
                endDate: leave.endDate,
                status: leave.status,
                days: leave.days
            }));
        }

        // Query Exams
        if (isExamQuery) {
            const exams = await Exam.find()
                .populate('course', 'name code')
                .sort({ date: -1 })
                .limit(10);

            results.exams = exams.map(exam => ({
                course: exam.course?.name,
                date: exam.date,
                startTime: exam.startTime,
                endTime: exam.endTime,
                room: exam.room,
                totalMarks: exam.totalMarks
            }));
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

    let context = '\n\n=== DATABASE INFORMATION ===\n';

    if (results.students) {
        context += `\nSTUDENT STATISTICS:\n`;
        context += `- Total Students: ${results.students.total}\n`;
        if (Object.keys(results.students.byDepartment).length > 0) {
            context += `- By Department:\n`;
            Object.entries(results.students.byDepartment).forEach(([dept, count]) => {
                context += `  * ${dept}: ${count} students\n`;
            });
        }
    }

    if (results.faculty) {
        context += `\nFACULTY STATISTICS:\n`;
        context += `- Total Faculty: ${results.faculty.total}\n`;
        if (Object.keys(results.faculty.byDepartment).length > 0) {
            context += `- By Department:\n`;
            Object.entries(results.faculty.byDepartment).forEach(([dept, count]) => {
                context += `  * ${dept}: ${count} faculty members\n`;
            });
        }
    }

    if (results.courses) {
        context += `\nCOURSES:\n`;
        results.courses.slice(0, 10).forEach(course => {
            context += `- ${course.name} (${course.code}) - ${course.department}, Semester ${course.semester}\n`;
            context += `  Instructor: ${course.instructor || 'Not assigned'}, Students: ${course.enrolledCount}\n`;
        });
    }

    if (results.attendance) {
        context += `\nATTENDANCE INFORMATION:\n`;
        if (results.attendance.statistics) {
            results.attendance.statistics.forEach(stat => {
                context += `- ${stat.course}: ${stat.percentage}% (${stat.present}/${stat.total} classes)\n`;
            });
        }
    }

    if (results.marks) {
        context += `\nGRADES/MARKS:\n`;
        results.marks.forEach(mark => {
            context += `- ${mark.course}: ${mark.marksObtained}/${mark.totalMarks} (${mark.percentage}%) - Grade: ${mark.grade || 'N/A'}\n`;
        });
        if (results.overallPercentage) {
            context += `\nOverall Percentage: ${results.overallPercentage}%\n`;
        }
    }

    if (results.assignments && results.assignments.length > 0) {
        context += `\nASSIGNMENTS:\n`;
        results.assignments.forEach(assignment => {
            context += `- ${assignment.title} (${assignment.course})\n`;
            context += `  Due: ${new Date(assignment.dueDate).toLocaleDateString()}\n`;
        });
    }

    if (results.timetable && results.timetable.length > 0) {
        context += `\nTIMETABLE:\n`;
        results.timetable.forEach(tt => {
            context += `- ${tt.day}: ${tt.course} (${tt.startTime} - ${tt.endTime}) in ${tt.room}\n`;
        });
    }

    if (results.leaves && results.leaves.length > 0) {
        context += `\nLEAVE REQUESTS:\n`;
        results.leaves.forEach(leave => {
            context += `- ${leave.reason}: ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}\n`;
            context += `  Status: ${leave.status}\n`;
        });
    }

    if (results.exams && results.exams.length > 0) {
        context += `\nUPCOMING EXAMS:\n`;
        results.exams.forEach(exam => {
            context += `- ${exam.course}: ${new Date(exam.date).toLocaleDateString()} at ${exam.startTime}\n`;
            context += `  Room: ${exam.room}, Total Marks: ${exam.totalMarks}\n`;
        });
    }

    context += '\n=== END DATABASE INFORMATION ===\n';

    return context;
}

module.exports = {
    queryDatabase,
    buildDatabaseContext
};
