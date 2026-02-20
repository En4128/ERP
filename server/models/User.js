const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        default: 'student'
    },
    profileImage: {
        type: String, // URL or path
        default: ''
    },
    // New Profile Fields
    phone: { type: String },
    address: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
    dob: { type: Date },
    bio: { type: String },
    socialLinks: {
        linkedin: { type: String },
        github: { type: String },
        website: { type: String }
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    pushSubscription: {
        endpoint: String,
        keys: {
            p256dh: String,
            auth: String
        }
    }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
