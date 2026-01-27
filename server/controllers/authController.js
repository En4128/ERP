const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.register = async (req, res) => {
    const { name, email, password, role, ...profileData } = req.body;

    try {
        console.log('Registration attempt:', { name, email, role });

        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('Creating new user...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });
        console.log('User created successfully:', user.email);

        if (role === 'student') {
            console.log('Creating student profile...');
            await Student.create({
                user: user._id,
                admissionNumber: profileData.admissionNumber || `STU${Math.floor(1000 + Math.random() * 9000)}`,
                department: profileData.department || 'General',
                sem: profileData.sem || 1,
                ...profileData
            });
            console.log('Student profile created');
        } else if (role === 'faculty') {
            console.log('Creating faculty profile...');
            await Faculty.create({
                user: user._id,
                employeeId: profileData.employeeId || `FAC${Math.floor(1000 + Math.random() * 9000)}`,
                department: profileData.department || 'General',
                designation: profileData.designation || 'Lecturer',
                ...profileData
            });
            console.log('Faculty profile created');
        }

        console.log('Registration successful, generating token...');
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login attempt for email:', email);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('User found:', user.email, 'Role:', user.role);

        if (user.isBlocked) {
            console.log('User is blocked:', user.email);
            return res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isPasswordMatch);

        if (isPasswordMatch) {
            console.log('Login successful for:', user.email);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            console.log('Password mismatch for:', user.email);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};
