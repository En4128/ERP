const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const users = require('./data/users'); // Removed unused import
const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-erp');

const importData = async () => {
    try {
        await User.deleteMany();
        await Student.deleteMany();
        await Faculty.deleteMany();
        await Course.deleteMany();

        console.log('Data Destroyed...');

        const salt = await bcrypt.genSalt(10);
        const hashPassword = async (pwd) => await bcrypt.hash(pwd, salt);

        // Create Users
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@gmail.com',
            password: await hashPassword('admin123'),
            role: 'admin'
        });

        const facultyUser = await User.create({
            name: 'John Professor',
            email: 'faculty@gmail.com',
            password: await hashPassword('faculty123'),
            role: 'faculty'
        });

        const studentUser = await User.create({
            name: 'Jane Student',
            email: 'student@gmail.com',
            password: await hashPassword('student123'),
            role: 'student'
        });

        // Create Profiles
        const facultyProfile = await Faculty.create({
            user: facultyUser._id,
            employeeId: 'FAC001',
            department: 'Computer Science',
            designation: 'Professor'
        });

        const studentProfile = await Student.create({
            user: studentUser._id,
            admissionNumber: 'STU001',
            department: 'Computer Science',
            sem: 3,
            section: 'A'
        });

        // Create Courses
        const course1 = await Course.create({
            name: 'Introduction to Computer Science',
            code: 'CS101',
            credits: 4,
            department: 'Computer Science',
            assignedFaculty: facultyProfile._id
        });

        const course2 = await Course.create({
            name: 'Data Structures',
            code: 'CS202',
            credits: 3,
            department: 'Computer Science',
            assignedFaculty: facultyProfile._id
        });

        // Update Faculty Assigned Courses
        facultyProfile.assignedCourses.push(course1._id, course2._id);
        await facultyProfile.save();

        // Enroll Student (Simulated)
        studentProfile.enrolledCourses.push(course1._id);
        await studentProfile.save();

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Student.deleteMany();
        await Faculty.deleteMany();
        await Course.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
