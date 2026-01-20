const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    type: {
        type: String,
        enum: ['Sick Leave', 'Casual Leave', 'Duty Leave', 'Other'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    facultyComment: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
