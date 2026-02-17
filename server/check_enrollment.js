const mongoose = require('mongoose');
const User = require('./models/User'); // Required for Student
const Student = require('./models/Student'); // Required for Course
const Course = require('./models/Course');
const dotenv = require('dotenv');

dotenv.config();

const checkEnrollment = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });

        const courses = await Course.find({}).populate('enrolledStudents');
        console.log(`Checking ${courses.length} courses for enrollment...`);

        let totalEnrolled = 0;
        courses.forEach(c => {
            const count = c.enrolledStudents ? c.enrolledStudents.length : 0;
            if (count > 0) {
                console.log(`Course ${c.code} (${c.name}): ${count} students enrolled.`);
                totalEnrolled += count;
                // c.enrolledStudents.forEach(st => console.log(' - ' + st._id));
            }
        });

        if (totalEnrolled === 0) {
            console.log("WARNING: No students found in 'enrolledStudents' array for any course!");
        } else {
            console.log(`Total students enrolled across all courses: ${totalEnrolled}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkEnrollment();
