const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const dotenv = require('dotenv');

dotenv.config();

const checkTimeFormat = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });

        const timetables = await Timetable.find({}, 'startTime endTime');
        console.log('Total entries:', timetables.length);
        const formats = new Set();
        timetables.forEach(t => {
            formats.add(t.startTime);
        });

        console.log('Unique Start Times in DB:', Array.from(formats));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkTimeFormat();
