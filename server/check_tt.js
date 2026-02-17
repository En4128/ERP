const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const dotenv = require('dotenv');

dotenv.config();

const checkTimetable = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', {
            family: 4
        });

        const day = 'Tuesday'; // Today is Tuesday
        const timetables = await Timetable.find({ day });

        console.log(`Found ${timetables.length} classes on ${day}:`);
        timetables.forEach(t => {
            console.log(`- ${t.startTime} to ${t.endTime}: Room ${t.room}`);
        });

        const tenMinutesLater = new Date(Date.now() + 10 * 60000);
        const hours = String(tenMinutesLater.getHours()).padStart(2, '0');
        const minutes = String(tenMinutesLater.getMinutes()).padStart(2, '0');
        const targetTime = `${hours}:${minutes}`;
        console.log(`Checking for target time: ${targetTime}`);

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkTimetable();
