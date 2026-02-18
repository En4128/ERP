const mongoose = require('mongoose');
require('./models/Course');
require('./models/Faculty');
require('./models/User');
const Timetable = require('./models/Timetable');
const dotenv = require('dotenv');
dotenv.config();

const checkConnectivity = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });

        const tt = await Timetable.find({ day: 'Wednesday' }).populate('course faculty');
        console.log(`Found ${tt.length} Wednesday classes.`);
        tt.forEach(t => {
            console.log(`- Time: ${t.startTime}, Course: ${t.course ? t.course.name : 'MISSING'}, Faculty: ${t.faculty ? t.faculty.name : 'MISSING'}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkConnectivity();
