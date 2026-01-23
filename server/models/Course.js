const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    credits: {
        type: Number,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        default: 60
    },
    enrolled: {
        type: Number,
        default: 0
    },
    schedule: {
        type: String
    },
    room: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    assignedFaculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    },
    materials: [{
        title: {
            type: String,
            required: true
        },
        fileUrl: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
