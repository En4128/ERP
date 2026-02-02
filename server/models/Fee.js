const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    semester: {
        type: Number, // Applicable semester, 0 for all
        default: 0
    },
    department: {
        type: String, // Applicable department, 'All' for all
        default: 'All'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
