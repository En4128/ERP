const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
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
    examType: {
        type: String, // e.g., 'Midterm', 'Final', 'Assignment'
        required: true
    },
    marksObtained: {
        type: Number,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Mark', markSchema);
