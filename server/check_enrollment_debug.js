const mongoose = require('mongoose');
require('./models/Student'); // Register Student model
require('./models/User');    // Register User model
const Timetable = require('./models/Timetable');
const Course = require('./models/Course');
const dotenv = require('dotenv');
dotenv.config();

const checkEnrollment = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });
        const tt = await Timetable.find({ day: 'Wednesday' }).limit(1);
        if (tt.length > 0) {
            const course = await Course.findById(tt[0].course).populate('enrolledStudents');
            console.log(`Course: ${course.name}`);
            console.log(`Enrolled Students count: ${course.enrolledStudents ? course.enrolledStudents.length : 0}`);
        } else {
            console.log('No classes found for Wednesday.');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkEnrollment();
