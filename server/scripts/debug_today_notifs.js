const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const dotenv = require('dotenv');
dotenv.config();

const checkTodayNotifs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const count = await Notification.countDocuments({
            createdAt: { $gte: startOfDay }
        });

        console.log(`Total notifications created today: ${count}`);

        const recent = await Notification.find({
            createdAt: { $gte: startOfDay }
        }).sort({ createdAt: -1 }).limit(5).populate('recipient');

        recent.forEach(n => {
            console.log(`[${n.createdAt.toLocaleTimeString()}] To: ${n.recipient ? n.recipient.name : 'Unknown'} - ${n.message}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkTodayNotifs();
