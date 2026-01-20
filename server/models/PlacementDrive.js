const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    companyLogo: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        required: true
    },
    package: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: ''
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Internship', 'Part-time', 'Contract'],
        default: 'Full-time'
    },
    eligibilityCriteria: {
        departments: [{
            type: String
        }],
        minCGPA: {
            type: Number,
            default: 0
        },
        maxBacklogs: {
            type: Number,
            default: 0
        }
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    driveDate: {
        type: Date,
        required: true
    },
    applicationDeadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    rounds: [{
        type: String
    }],
    selectedCount: {
        type: Number,
        default: 0
    },
    totalApplicants: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
