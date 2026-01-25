const mongoose = require('mongoose');

const attendanceQRSchema = new mongoose.Schema({
    qrToken: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    scannedStudents: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        scannedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
attendanceQRSchema.index({ faculty: 1, isActive: 1 });
attendanceQRSchema.index({ expiresAt: 1 });

// Auto-expire inactive QRs
attendanceQRSchema.pre('save', function (next) {
    if (this.expiresAt < new Date()) {
        this.isActive = false;
    }
    next();
});

module.exports = mongoose.model('AttendanceQR', attendanceQRSchema);
