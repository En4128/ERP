const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const dotenv = require('dotenv');
dotenv.config();

const checkUserNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-erp', { family: 4 });

        // Find a recent notification
        const recent = await Notification.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent Notifications:');
        recent.forEach(n => {
            console.log(`[${n.createdAt}] To: ${n.recipient} Content: ${n.message.substring(0, 50)}...`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkUserNotifications();
