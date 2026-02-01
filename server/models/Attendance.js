const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Excused'], // Valid statuses
        default: 'Absent'
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'markedByType'
    },
    markedByType: {
        type: String,
        enum: ['Faculty', 'Admin', 'System'],
        default: 'Faculty'
    },
    markedVia: {
        type: String,
        enum: ['Manual', 'QR', 'External'],
        default: 'Manual'
    }
}, { timestamps: true });


// Prevent duplicate attendance for same student, course, and date
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

