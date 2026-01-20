const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const Attendance = require('./models/Attendance');
const Student = require('./models/Student');
const Course = require('./models/Course');

async function checkAttendanceData() {
    try {
        // Count total attendance records
        const totalAttendance = await Attendance.countDocuments();
        console.log(`\nTotal Attendance Records: ${totalAttendance}`);

        // Get all students
        const students = await Student.find().populate('user', 'name email');
        console.log(`\nTotal Students: ${students.length}`);

        // Check attendance for each student
        for (const student of students) {
            const attendanceCount = await Attendance.countDocuments({ student: student._id });
            console.log(`\nStudent: ${student.user?.name || 'Unknown'} (${student.admissionNumber})`);
            console.log(`  Department: ${student.department}`);
            console.log(`  Attendance Records: ${attendanceCount}`);

            if (attendanceCount > 0) {
                const records = await Attendance.find({ student: student._id })
                    .populate('course', 'name')
                    .limit(3);
                console.log(`  Sample Records:`);
                records.forEach(r => {
                    console.log(`    - ${r.course?.name || 'Unknown Course'}: ${r.status} on ${r.date.toISOString().split('T')[0]}`);
                });
            }
        }

        // Check courses
        const courses = await Course.find();
        console.log(`\n\nTotal Courses: ${courses.length}`);
        courses.forEach(c => {
            console.log(`  - ${c.name} (${c.code}) - Dept: ${c.department}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkAttendanceData();
