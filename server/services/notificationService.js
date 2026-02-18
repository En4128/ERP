const cron = require('node-cron');
const webpush = require('web-push');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const Course = require('../models/Course');
const User = require('../models/User');

// Configure VAPID keys
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(
        'mailto:admin@learnex.com',
        publicVapidKey,
        privateVapidKey
    );
}

/**
 * Check for classes starting in 10 minutes and send notifications
 */
const checkUpcomingClasses = async (io) => {
    try {
        const now = new Date();
        const tenMinutesLater = new Date(now.getTime() + 10 * 60000);

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[tenMinutesLater.getDay()];

        // Format time to match DB format (h:mm AM/PM)
        let hours = tenMinutesLater.getHours();
        const minutes = String(tenMinutesLater.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const targetTime = `${hours}:${minutes} ${ampm}`;

        console.log(`[PushService] Checking for classes at ${targetTime} on ${currentDay}`);

        const upcomingClasses = await Timetable.find({
            day: currentDay,
            startTime: targetTime
        }).populate('course faculty');

        for (const session of upcomingClasses) {
            if (!session.course) continue;

            const course = await Course.findById(session.course._id).populate('enrolledStudents');
            if (!course) continue;

            const facultyName = session.faculty?.user?.name || 'Professor';
            const message = `Class Alert: ${course.name} starts in 10 mins in Room ${session.room} with Prof. ${facultyName}.`;

            // Prepare list of user IDs (students + faculty)
            const recipients = course.enrolledStudents.map(s => s.user).filter(id => id);
            if (session.faculty?.user) recipients.push(session.faculty.user);

            // Send to all recipients
            for (const userId of recipients) {
                // 1. Save to DB
                const notification = new Notification({
                    recipient: userId,
                    title: 'Upcoming Class',
                    message: message,
                    type: 'info'
                });
                await notification.save();

                // 2. Real-time Socket alert
                io.to(userId.toString()).emit('notification', notification);

                // 3. Web Push Notification
                const user = await User.findById(userId);
                if (user && user.pushSubscription && user.pushSubscription.endpoint) {
                    const payload = JSON.stringify({
                        title: 'Upcoming Class',
                        body: message,
                        icon: '/logo-light.jpg',
                        data: {
                            url: `/${user.role}/notifications`
                        }
                    });

                    webpush.sendNotification(user.pushSubscription, payload).catch(err => {
                        console.error(`Error sending push to ${user.name}:`, err.statusCode);
                        if (err.statusCode === 410) {
                            user.pushSubscription = undefined;
                            user.save();
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error('Push notification check failed:', error);
    }
};

const initNotificationService = (io) => {
    // Run every minute
    cron.schedule('* * * * *', () => {
        checkUpcomingClasses(io);
    });
    console.log('[PushService] Scheduled timetable checks every minute.');
};

module.exports = initNotificationService;
