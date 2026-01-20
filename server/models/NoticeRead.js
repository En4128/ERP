const mongoose = require('mongoose');

const noticeReadSchema = new mongoose.Schema({
    noticeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notice',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    readAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure a user can only have one read record per notice
noticeReadSchema.index({ noticeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('NoticeRead', noticeReadSchema);
