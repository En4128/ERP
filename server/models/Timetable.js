const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
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
    day: {
        type: String, // e.g., 'Monday'
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
        type: String, // e.g., '09:00'
        required: true
    },
    endTime: {
        type: String, // e.g., '10:00'
        required: true
    },
    room: {
        type: String,
        required: true
    },
    building: {
        type: String,
        required: true,
        default: 'Main Block'
    },
    type: {
        type: String,
        enum: ['lecture', 'lab', 'tutorial'],
        default: 'lecture'
    }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
