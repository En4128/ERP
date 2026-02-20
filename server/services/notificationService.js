const cron = require('node-cron');
const webpush = require('web-push');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const logToFile = (msg) => {
    try {
        const now = new Date();
        console.log(`[${now.toLocaleTimeString()}] [PushService] ${msg}`);
        const logPath = path.join(__dirname, '..', 'push_debug.log');
        const timestamp = now.toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        console.error('Logging failed:', e);
    }
};

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
const checkUpcomingClasses = async (io, mockDate = null) => {
    try {
        const now = mockDate || new Date();
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

        logToFile(`Running check for classes starting at ${targetTime} on ${currentDay}`);

        const upcomingClasses = await Timetable.find({
            day: currentDay,
            startTime: targetTime
        }).populate({
            path: 'course',
            populate: { path: 'enrolledStudents' }
        }).populate({
            path: 'faculty',
            populate: { path: 'user' }
        });

        if (upcomingClasses.length > 0) {
            logToFile(`Found ${upcomingClasses.length} upcoming classes.`);
        }

        for (const session of upcomingClasses) {
            const course = session.course;
            if (!course) {
                logToFile(`Session ${session._id} has no course details populated.`);
                continue;
            }

            logToFile(`Processing class: ${course.name}`);
            const facultyName = session.faculty?.user?.name || 'Professor';
            const message = `Upcoming Class: ${course.name} starts in 10 mins in Room ${session.room} with Prof. ${facultyName}.`;

            // Collect all user IDs who should receive this
            const studentUserIds = (course.enrolledStudents || [])
                .map(s => s.user)
                .filter(id => id);

            const facultyUserId = session.faculty?.user?._id || session.faculty?.user;

            const recipients = [...studentUserIds];
            if (facultyUserId) recipients.push(facultyUserId);

            // Deduplicate and convert to string
            const uniqueRecipients = [...new Set(recipients.map(id => id.toString()))];
            logToFile(`Total unique recipients: ${uniqueRecipients.length}`);

            for (const userId of uniqueRecipients) {
                try {
                    const user = await User.findById(userId);
                    if (!user) continue;

                    // 1. Log to Database for History
                    const notification = new Notification({
                        recipient: userId,
                        title: 'Upcoming Class',
                        message: message,
                        type: 'info'
                    });
                    await notification.save();

                    // 2. Real-time In-App Notification (Socket)
                    io.to(userId).emit('notification', notification);

                    // 3. Native Background Push (Web Push)
                    if (user.pushSubscription && user.pushSubscription.endpoint) {
                        logToFile(`Attempting Web Push to ${user.name}`);
                        const payload = JSON.stringify({
                            title: 'Upcoming Class',
                            body: message,
                            icon: '/logo-light.jpg',
                            data: {
                                url: `/${user.role}/notifications`
                            }
                        });

                        webpush.sendNotification(user.pushSubscription, payload).then(() => {
                            logToFile(`SUCCESS: Web Push delivered to ${user.name}`);
                        }).catch(err => {
                            logToFile(`FAILED: Web Push for ${user.name}. Status: ${err.statusCode}. Message: ${err.message}`);
                            if (err.statusCode === 410 || err.statusCode === 404) {
                                logToFile(`Removing invalid subscription for ${user.name}`);
                                User.findByIdAndUpdate(user._id, { $unset: { pushSubscription: 1 } }).exec();
                            }
                        });
                    }
                } catch (userErr) {
                    logToFile(`Error processing recipient ${userId}: ${userErr.message}`);
                }
            }
        }
    } catch (error) {
        logToFile(`CRITICAL Error in notification check: ${error.message}`);
    }
};

const initNotificationService = (io) => {
    // Check every minute
    cron.schedule('* * * * *', () => {
        checkUpcomingClasses(io);
    });
    console.log('[NotificationService] Timetable push scheduler initiated.');
};

module.exports = { initNotificationService, checkUpcomingClasses };
