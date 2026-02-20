const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    },
    designation: {
        type: String, // e.g., Professor, Assistant Professor
        required: true
    },
    // New Fields
    qualifications: [{ type: String }], // e.g., ["PhD in CS", "MTech"]
    experience: { type: Number }, // in years
    joiningDate: { type: Date },
    researchArea: { type: String },
    // References
    assignedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]

}, { timestamps: true });

module.exports = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);
