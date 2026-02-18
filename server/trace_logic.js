const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const Course = require('./models/Course');
const Student = require('./models/Student');
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Notification = require('./models/Notification');
const dotenv = require('dotenv');
dotenv.config();

const testSpecificTime = async (mockTimeStr) => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });

        // Mock "Now"
        const now = new Date();
        const [h, m] = mockTimeStr.split(':');
        now.setHours(parseInt(h), parseInt(m), 0, 0);

        console.log(`Testing logic for Mock Now: ${now.toLocaleTimeString()}`);

        const tenMinutesLater = new Date(now.getTime() + 10 * 60000);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];

        let hours = tenMinutesLater.getHours();
        const minutes = String(tenMinutesLater.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const targetTime = `${hours}:${minutes} ${ampm}`;

        console.log(`Searching for: Day=${currentDay}, Time=${targetTime}`);

        const upcomingClasses = await Timetable.find({
            day: currentDay,
            startTime: targetTime
        }).populate('course faculty');

        console.log(`Found ${upcomingClasses.length} matches.`);

        for (const session of upcomingClasses) {
            console.log(`Processing session for course: ${session.course ? session.course.name : 'Unknown'}`);

            const course = await Course.findById(session.course._id)
                .populate({
                    path: 'enrolledStudents',
                    populate: {
                        path: 'user'
                    }
                });

            if (!course) {
                console.log('Course not found in DB!');
                continue;
            }

            console.log(`Enrolled students count: ${course.enrolledStudents ? course.enrolledStudents.length : 0}`);

            const recipients = [];
            if (course.enrolledStudents) {
                for (const student of course.enrolledStudents) {
                    if (student.user && student.user._id) {
                        recipients.push(student.user._id);
                    } else {
                        console.log(`Student ${student._id} has NO user or user._id!`);
                    }
                }
            }

            console.log(`Total recipients identified: ${recipients.length}`);

            // Just simulate notification creation
            for (const userId of recipients) {
                console.log(`WOULD send notification to user: ${userId}`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

testSpecificTime('12:20'); // Test for the 12:30 PM class
