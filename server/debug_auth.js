const mongoose = require('mongoose');
const Course = require('./models/Course');
const Faculty = require('./models/Faculty');
const User = require('./models/User');
require('dotenv').config();

async function debugAuth() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Get the logged in user (Venni)
        // I'll search by name since I saw "Welcome Back, Venni" in the screenshot
        const user = await User.findOne({ name: { $regex: 'Venni', $options: 'i' } });
        if (!user) {
            console.log('User Venni not found');
            return;
        }
        console.log('User found:', user.name, user._id);

        // 2. Get the Faculty profile for this user
        const faculty = await Faculty.findOne({ user: user._id });
        if (!faculty) {
            console.log('Faculty profile not found for user');
            return;
        }
        console.log('Faculty found:', faculty._id, 'Department:', faculty.department);

        // 3. Get the course "CS330" (seen in screenshot "Devops (CS330)")
        const course = await Course.findOne({ code: 'CS330' });
        if (!course) {
            // Try searching by name if code fails
            const courseByName = await Course.findOne({ name: { $regex: 'Devops', $options: 'i' } });
            if (courseByName) {
                console.log('Course found by name:', courseByName.name, courseByName.code, courseByName._id);
                console.log('Assigned Faculty ID:', courseByName.assignedFaculty);
                console.log('Match?', courseByName.assignedFaculty?.toString() === faculty._id.toString());
            } else {
                console.log('Course CS330 / Devops not found');
            }
            return;
        }

        console.log('Course found:', course.name, course.code, course._id);
        console.log('Assigned Faculty ID:', course.assignedFaculty);

        if (!course.assignedFaculty) {
            console.log('ERROR: Course has no assigned faculty!');
        } else {
            console.log('Match?', course.assignedFaculty.toString() === faculty._id.toString());
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

debugAuth();
