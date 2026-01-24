const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'graded'],
        default: 'submitted'
    },
    grade: {
        type: Number
    },
    feedback: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
