const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Could be Admin or Faculty
        required: true
    },
    targetAudience: [{
        type: String,
        enum: ['all', 'student', 'faculty'],
    }],
    type: {
        type: String,
        enum: ['general', 'exam', 'event', 'urgent', 'holiday'],
        default: 'general'
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
