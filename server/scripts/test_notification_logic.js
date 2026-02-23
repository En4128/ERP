const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const Course = require('./models/Course');
const Faculty = require('./models/User'); // Faculty is a User with role 'faculty'? No, typical schema has Faculty model or User.
// Wait, Timetable schema refs 'Faculty'. Let's check if Faculty model exists or is it User?
// In notificationService.js: .populate('faculty')
// In Timetable.js: ref: 'Faculty'
// Let's check models directory.

const dotenv = require('dotenv');
dotenv.config();

const checkLogic = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });

        // Mock "Now" as Today 3:20 PM
        const now = new Date();
        now.setHours(15, 20, 0, 0); // 3:20 PM

        console.log('Mock Now:', now.toLocaleTimeString());

        const tenMinutesLater = new Date(now.getTime() + 10 * 60000);
        console.log('10 Minutes Later:', tenMinutesLater.toLocaleTimeString());

        // Logic from notificationService.js
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];

        let hours = tenMinutesLater.getHours();
        const minutes = String(tenMinutesLater.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;

        const targetTime = `${hours}:${minutes} ${ampm}`;
        console.log('Target Time to Search:', targetTime);

        const upcomingClasses = await Timetable.find({
            day: currentDay,
            startTime: targetTime
        });

        console.log(`Found ${upcomingClasses.length} matches.`);
        upcomingClasses.forEach(c => console.log(c));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkLogic();
