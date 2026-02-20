const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admissionNumber: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    },
    sem: {
        type: Number,
        required: true
    },
    section: {
        type: String
    },
    // New Fields
    batch: { type: String }, // e.g., "2023-2027"
    guardianName: { type: String },
    guardianPhone: { type: String },
    // References for relational data
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
}, { timestamps: true });

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
