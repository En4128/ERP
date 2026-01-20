const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const Timetable = require('./server/models/Timetable');
require('./server/models/Course');
require('./server/models/Faculty');
require('./server/models/User');

async function simulateApi() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const slots = await Timetable.find()
            .populate({
                path: 'course',
                select: 'name code department semester'
            })
            .populate({
                path: 'faculty',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });

        const formattedSlots = slots.map(slot => ({
            id: slot._id,
            courseCode: slot.course ? slot.course.code : 'N/A',
            courseName: slot.course ? slot.course.name : 'Unknown Course',
            faculty: (slot.faculty && slot.faculty.user) ? slot.faculty.user.name : 'Unassigned',
            room: slot.room,
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: slot.type || 'lecture',
            department: slot.course ? slot.course.department : '',
            semester: slot.course ? slot.course.semester : 0
        }));

        console.log('--- Formatted Slots ---');
        console.log(JSON.stringify(formattedSlots, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

simulateApi();
