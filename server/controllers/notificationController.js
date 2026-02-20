const User = require('../models/User');
const Notification = require('../models/Notification');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const logToFile = (msg) => {
    try {
        const logPath = path.join(__dirname, '..', 'push_debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] [Controller] ${msg}\n`);
    } catch (e) {
        console.error('Logging failed:', e);
    }
};

exports.getVapidPublicKey = (req, res) => {
    res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

exports.subscribe = async (req, res) => {
    const subscription = req.body;
    try {
        req.user.pushSubscription = subscription;
        await req.user.save();
        logToFile(`User ${req.user.name} (${req.user.role}) successfully subscribed.`);
        res.status(201).json({ message: 'Subscribed to notifications successfully' });
    } catch (error) {
        logToFile(`Subscription failed for user ${req.user.name}: ${error.message}`);
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });

        // Transform for frontend compatibility (some pages expect .id, others ._id)
        const transformed = notifications.map(n => ({
            ...n.toObject(),
            id: n._id,
            content: n.message, // Some components use .content, others .message
            date: n.createdAt,
            author: 'System'
        }));

        res.status(200).json(transformed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        if (id) {
            await Notification.findByIdAndUpdate(id, { read: true });
        } else {
            await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        }
        res.status(200).json({ message: 'Notification(s) marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.sendTestPush = async (req, res) => {
    try {
        const user = req.user;
        if (!user.pushSubscription || !user.pushSubscription.endpoint) {
            return res.status(400).json({ message: 'You are not subscribed to push notifications.' });
        }

        const payload = JSON.stringify({
            title: 'Test Notification',
            body: 'If you see this, native Push Notifications are working! 🚀',
            icon: '/logo-light.jpg'
        });

        await webpush.sendNotification(user.pushSubscription, payload);
        res.status(200).json({ message: 'Test notification sent!' });
    } catch (error) {
        console.error('Test push failed:', error);
        res.status(500).json({ message: 'Failed to send test push.', error: error.message });
    }
};
