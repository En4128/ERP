const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const dotenv = require('dotenv');

dotenv.config();

const checkTimetable = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', {
            family: 4
        });

        const now = new Date();
        const tenMinutesLater = new Date(now.getTime() + 10 * 60000);

        const day = 'Tuesday'; // Today is Tuesday
        const timetables = await Timetable.find({ day });

        const result = {
            currentTime: now.toISOString(),
            targetTime: tenMinutesLater.toISOString(),
            day: day,
            classes: timetables.map(t => ({
                startTime: t.startTime,
                endTime: t.endTime,
                room: t.room
            }))
        };

        console.log(JSON.stringify(result, null, 2));

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkTimetable();
