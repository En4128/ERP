const mongoose = require('mongoose');

const placementApplicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    drive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlacementDrive',
        required: true
    },
    resumeUrl: {
        type: String,
        default: ''
    },
    coverLetter: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'shortlisted', 'selected', 'rejected'],
        default: 'pending'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    remarks: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Compound index to prevent duplicate applications
placementApplicationSchema.index({ student: 1, drive: 1 }, { unique: true });

module.exports = mongoose.model('PlacementApplication', placementApplicationSchema);
