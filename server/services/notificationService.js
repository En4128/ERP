const cron = require('node-cron');
const webpush = require('web-push');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const Course = require('../models/Course');
const Student = require('../models/Student');
const User = require('../models/User');

// Configure VAPID keys
// Ideally these should be in environment variables
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(
        'mailto:admin@learnex.com',
        publicVapidKey,
        privateVapidKey
    );
}

const checkUpcomingClasses = async (io) => {
    try {
        const now = new Date();
        // Calculate 10 minutes from now
        const tenMinutesLater = new Date(now.getTime() + 10 * 60000);

        // Get current day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];

        // Format time to HH:mm
        // Format time to 12-hour format (h:mm AM/PM)
        let hours = tenMinutesLater.getHours();
        const minutes = String(tenMinutesLater.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        const targetTime = `${hours}:${minutes} ${ampm}`;

        // Find classes starting exactly 10 minutes from now
        const upcomingClasses = await Timetable.find({
            day: currentDay,
            startTime: targetTime
        }).populate('course faculty');

        if (upcomingClasses.length > 0) {
            console.log(`Found ${upcomingClasses.length} upcoming classes for ${targetTime}`);
        }

        for (const session of upcomingClasses) {
            if (!session.course) continue;

            const course = await Course.findById(session.course._id)
                .populate({
                    path: 'enrolledStudents',
                    populate: {
                        path: 'user'
                    }
                });

            if (!course || !course.enrolledStudents) continue;

            const notificationData = {
                title: 'Upcoming Class Alert',
                message: `You have ${course.name} (${course.code}) with Prof. ${session.faculty.name} in Room ${session.room} at ${session.startTime}.`,
                type: 'info'
            };

            for (const student of course.enrolledStudents) {
                if (!student.user) continue;

                const userId = student.user._id;

                // 1. Create Notification in DB
                const notification = new Notification({
                    recipient: userId,
                    title: notificationData.title,
                    message: notificationData.message,
                    type: notificationData.type
                });
                await notification.save();

                // 2. Send Real-time Notification via Socket.io
                // The user room is usually their userId
                io.to(userId.toString()).emit('notification', notification);

                // 3. Send Web Push Notification
                const user = await User.findById(userId);
                if (user && user.pushSubscription && user.pushSubscription.endpoint) {
                    const payload = JSON.stringify({
                        title: notificationData.title,
                        body: notificationData.message,
                        icon: '/logo-light.jpg',
                        badge: '/logo-light.jpg',
                        tag: `class-${session._id}`,
                        data: {
                            url: '/student/notifications',
                            sessionId: session._id
                        }
                    });

                    try {
                        await webpush.sendNotification(user.pushSubscription, payload);
                    } catch (error) {
                        console.error(`Error sending push notification to user ${userId}:`, error);
                        // If endpoint is invalid (410 or 404), remove subscription?
                        if (error.statusCode === 410 || error.statusCode === 404) {
                            user.pushSubscription = undefined;
                            await user.save();
                        }
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error in checkUpcomingClasses:', error);
    }
};

const initNotificationService = (io) => {
    console.log('Notification Service Initialized');
    // Run every minute
    cron.schedule('* * * * *', () => {
        checkUpcomingClasses(io);
    });
};

module.exports = initNotificationService;
