const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, // e.g., "10:00 AM"
        required: true
    },
    duration: {
        type: String, // e.g., "3 hrs"
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['midterm', 'final', 'practical', 'other'],
        default: 'midterm'
    },
    totalMarks: {
        type: Number,
        default: 100
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
