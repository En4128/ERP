const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const dotenv = require('dotenv');

dotenv.config();

const checkMorningTimes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });

        const timetables = await Timetable.find({});
        console.log('Sample Start Times:');
        const times = timetables.map(t => t.startTime);
        console.log(times.slice(0, 20)); // Show first 20 to see variety

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkMorningTimes();
