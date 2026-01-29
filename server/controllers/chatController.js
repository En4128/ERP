const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all messages between two users
// @route   GET /api/chat/:userId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all conversations for the current user
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Find unique users that current user has exchanged messages with
        const messageHistory = await Message.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        }).sort({ createdAt: -1 });

        const conversationPartners = new Set();
        const conversations = [];

        for (const msg of messageHistory) {
            const partnerId = msg.sender.toString() === currentUserId.toString()
                ? msg.receiver.toString()
                : msg.sender.toString();

            if (!conversationPartners.has(partnerId)) {
                conversationPartners.add(partnerId);
                const partner = await User.findById(partnerId).select('name email role');
                if (partner) {
                    // Format last message preview based on message type
                    let lastMessagePreview = msg.content;
                    if (msg.messageType === 'file') {
                        lastMessagePreview = `📎 ${msg.fileName}`;
                    } else if (msg.messageType === 'text-with-file') {
                        lastMessagePreview = `📎 ${msg.content}`;
                    }

                    conversations.push({
                        user: partner,
                        lastMessage: lastMessagePreview,
                        lastMessageDate: msg.createdAt,
                        unread: !msg.read && msg.receiver.toString() === currentUserId.toString()
                    });
                }
            }
        }

        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload file and create message with attachment
// @route   POST /api/chat/upload
// @access  Private
exports.uploadChatFile = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const currentUserId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        // Create message with file attachment
        const messageType = content ? 'text-with-file' : 'file';

        const message = await Message.create({
            sender: currentUserId,
            receiver: receiverId,
            content: content || '',
            messageType: messageType,
            fileUrl: req.file.path,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search users by name or email
// @route   GET /api/chat/search?q=query
// @access  Private
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const users = await User.find({
            $and: [
                { _id: { $ne: req.user._id } },
                {
                    $or: [
                        { name: { $regex: q, $options: 'i' } },
                        { email: { $regex: q, $options: 'i' } }
                    ]
                }
            ]
        }).select('name email role profileImage').limit(10);

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get recommended users to chat with (e.g., faculty for students)
// @route   GET /api/chat/recommended
// @access  Private
exports.getRecommendedUsers = async (req, res) => {
    try {
        const userRole = req.user.role;
        let users = [];

        if (userRole === 'student') {
            // Students see faculty
            users = await User.find({ role: 'faculty' }).select('name email role profileImage');
        } else if (userRole === 'faculty') {
            // Faculty see students
            users = await User.find({ role: 'student' }).select('name email role profileImage');
        }

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Clear all messages in a conversation
// @route   DELETE /api/chat/:userId
// @access  Private
exports.clearChat = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // Delete all messages between the two users
        await Message.deleteMany({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        });

        res.json({ message: 'Chat cleared successfully' });
    } catch (error) {
        console.error('Clear chat error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

