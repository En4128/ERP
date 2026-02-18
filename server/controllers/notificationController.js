const User = require('../models/User');
const Notification = require('../models/Notification');
const webpush = require('web-push');

exports.getVapidPublicKey = (req, res) => {
    res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

exports.subscribe = async (req, res) => {
    const subscription = req.body;
    try {
        req.user.pushSubscription = subscription;
        await req.user.save();
        res.status(201).json({ message: 'Subscribed to notifications successfully' });
    } catch (error) {
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
