const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const dotenv = require('dotenv');
dotenv.config();

const simulateToday = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = 'Wednesday'; // Simulate for today

        console.log(`--- Simulation for ${currentDay} ---`);

        const allThisDay = await Timetable.find({ day: currentDay }).sort({ startTime: 1 });
        console.log(`Found ${allThisDay.length} classes scheduled for today.`);

        allThisDay.forEach(session => {
            // Calculate when the notification SHOULD have triggered
            // startTime is like "9:00 AM" or "10:00 AM" or "12:30 PM"
            console.log(`Class: ${session.startTime} -> Notification should trigger at 10 minutes prior.`);

            // Logic check: Can we parse the startTime and subtract 10 mins?
            // Actually, we do it the other way: We check every minute and add 10 mins.
        });

        // Test specific known slots
        const slots = ["9:00 AM", "10:00 AM", "11:30 AM", "12:30 PM", "2:30 PM", "3:30 PM"];
        for (const slot of slots) {
            const matches = await Timetable.find({ day: currentDay, startTime: slot });
            if (matches.length > 0) {
                console.log(`[PASS] Found entry for ${slot}`);
            } else {
                console.log(`[FAIL] No entry found for ${slot}`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

simulateToday();
