const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const Course = require('./models/Course');
const Student = require('./models/Student');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const testSpecificMatch = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });

        // Mock "Now" as Today 2:20 PM (So 10 mins later is 2:30 PM)
        const now = new Date();
        now.setHours(14, 20, 0, 0); // 14:20 is 2:20 PM

        const tenMinutesLater = new Date(now.getTime() + 10 * 60000);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];

        let hours = tenMinutesLater.getHours();
        const minutes = String(tenMinutesLater.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const targetTime = `${hours}:${minutes} ${ampm}`;

        console.log(`Mock Time: ${now.toLocaleTimeString()}`);
        console.log(`Searching for: Day=${currentDay}, Time=${targetTime}`);

        const upcomingClasses = await Timetable.find({
            day: currentDay,
            startTime: targetTime
        });

        console.log(`Found ${upcomingClasses.length} classes.`);
        for (const session of upcomingClasses) {
            console.log(`Match found: ${session.startTime} Room ${session.room}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

testSpecificMatch();
