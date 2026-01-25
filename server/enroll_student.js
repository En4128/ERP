const mongoose = require('mongoose');
const Student = require('./models/Student');
const Course = require('./models/Course');
const User = require('./models/User');
require('dotenv').config();

async function enroll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Find ALL students
        const students = await Student.find({});
        console.log(`Found ${students.length} students`);

        const courses = await Course.find({ status: 'active' });
        console.log(`Found ${courses.length} active courses`);

        let enrollCount = 0;

        for (const student of students) {
            // Get user name for logging
            const user = await User.findById(student.user);
            const studentName = user ? user.name : 'Unknown';

            console.log(`Checking enrollment for ${studentName}...`);

            for (const c of courses) {
                // Initialize array if undefined (safety)
                if (!c.enrolledStudents) c.enrolledStudents = [];

                if (!c.enrolledStudents.includes(student._id)) {
                    c.enrolledStudents.push(student._id);
                    await c.save();
                    enrollCount++;
                    // console.log(`  -> Enrolled in ${c.name}`);
                }
            }
        }
        console.log(`Enrollment complete. Added ${enrollCount} new enrollments for ${students.length} students.`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

enroll();
