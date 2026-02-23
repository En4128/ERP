const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const dotenv = require('dotenv');

dotenv.config();

const checkTimetable = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });

        console.log('\n--- TIMETABLE CHECK START ---');

        const now = new Date();
        const tenMinutesLater = new Date(now.getTime() + 10 * 60000);

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];

        const hours = String(tenMinutesLater.getHours()).padStart(2, '0');
        const minutes = String(tenMinutesLater.getMinutes()).padStart(2, '0');
        const targetTime = `${hours}:${minutes}`;

        console.log(`Current Time (Local): ${now.toLocaleTimeString()}`);
        console.log(`Checking for classes on: ${currentDay}`);
        console.log(`Looking for startTime: ${targetTime}`);

        const timetables = await Timetable.find({ day: currentDay });

        if (timetables.length === 0) {
            console.log(`No classes found for ${currentDay}.`);
        } else {
            console.log(`Found ${timetables.length} classes for ${currentDay}:`);
            timetables.forEach(t => {
                console.log(`- Course: ${t.course} | Time: ${t.startTime} - ${t.endTime} | Room: ${t.room}`);
            });
        }

        console.log('--- TIMETABLE CHECK END ---\n');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkTimetable();
