const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

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

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No user found with that email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset URL
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // Send Email via Resend
        try {
            await resend.emails.send({
                from: 'ERP Portal <onboarding@resend.dev>',
                to: [email],
                subject: 'Password Reset Request',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                        <h2 style="color: #4f46e5; text-align: center;">Reset Your Password</h2>
                        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                        <p>Please click on the following button, or paste the link into your browser to complete the process within 10 minutes of receiving it:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="text-align: center; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} ERP Portal. All rights reserved.</p>
                    </div>
                `
            });
            console.log('Email sent successfully via Resend');
        } catch (emailError) {
            console.error('Failed to send email via Resend:', emailError);
            // We still return success to the user, but they might not receive the mail if API key is missing
        }

        // Fallback: Log reset URL to console
        console.log('--- PASSWORD RESET URL ---');
        console.log(resetUrl);
        console.log('--------------------------');

        res.status(200).json({
            success: true,
            message: 'Password reset link has been sent to your email.',
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    try {
        // Hash token and find user
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message });
    }
};
