const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const dotenv = require('dotenv');
dotenv.config();

const findTodayDetail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });
        const tt = await Timetable.find({ day: 'Wednesday' });
        console.log(`Found ${tt.length} entries for Wednesday:`);
        tt.forEach(t => {
            console.log(`- "${t.startTime}" (Length: ${t.startTime.length})`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

findTodayDetail();
