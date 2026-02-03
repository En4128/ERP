const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const User = require('../models/User');
const Notice = require('../models/Notice');
const Mark = require('../models/Mark');
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// @desc    Get counts for dashboard
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const facultyCount = await Faculty.countDocuments();
        const courseCount = await Course.countDocuments();
        const resultsCount = await Mark.distinct('course').then(courses => courses.length);

        res.json({
            stats: {
                totalStudents: studentCount,
                totalFaculty: facultyCount,
                totalCourses: courseCount,
                resultsPublished: resultsCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin)
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('user', 'name email').populate('enrolledCourses', 'name');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all faculty
// @route   GET /api/admin/faculty
// @access  Private (Admin)
exports.getAllFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find().populate('user', 'name email');
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student and associated user
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await User.findByIdAndDelete(student.user);
        await Student.findByIdAndDelete(req.params.id);

        res.json({ message: 'Student and user account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete faculty and associated user
// @route   DELETE /api/admin/faculty/:id
// @access  Private (Admin)
exports.deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        await User.findByIdAndDelete(faculty.user);
        await Faculty.findByIdAndDelete(req.params.id);

        res.json({ message: 'Faculty and user account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (students and faculty)
// @route   GET /api/admin/users-all
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user block status
// @route   PATCH /api/admin/users/:id/toggle-block
// @access  Private (Admin)
exports.toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper to normalize department names
const normalizeDept = (dept) => {
    if (!dept) return '';
    return dept.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

// @desc    Register a new student
// @route   POST /api/admin/students
// @access  Private (Admin)
exports.registerStudent = async (req, res) => {
    const { name, email, password, admissionNumber, department, sem, section } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'student'
        });

        const student = await Student.create({
            user: user._id,
            admissionNumber,
            department: normalizeDept(department),
            sem: sem || 1,
            section
        });

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student details
// @route   PUT /api/admin/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res) => {
    const { name, email, admissionNumber, department, sem, section } = req.body;
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const user = await User.findById(student.user);
        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            await user.save();
        }

        student.admissionNumber = admissionNumber || student.admissionNumber;
        if (department) student.department = normalizeDept(department);
        student.sem = sem || student.sem;
        student.section = section || student.section;
        await student.save();

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new faculty
// @route   POST /api/admin/faculty
// @access  Private (Admin)
exports.registerFaculty = async (req, res) => {
    const { name, email, password, employeeId, department, designation } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'faculty'
        });

        const faculty = await Faculty.create({
            user: user._id,
            employeeId,
            department: normalizeDept(department),
            designation
        });

        res.status(201).json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update faculty details
// @route   PUT /api/admin/faculty/:id
// @access  Private (Admin)
exports.updateFaculty = async (req, res) => {
    const { name, email, employeeId, department, designation } = req.body;
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const user = await User.findById(faculty.user);
        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            await user.save();
        }

        faculty.employeeId = employeeId || faculty.employeeId;
        if (department) faculty.department = normalizeDept(department);
        faculty.designation = designation || faculty.designation;
        await faculty.save();

        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all notices
// @route   GET /api/admin/notices
// @access  Private (Admin)
exports.getAllNotices = async (req, res) => {
    try {
        const notices = await Notice.find().populate('postedBy', 'name').sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a notice
// @route   POST /api/admin/notices
// @access  Private (Admin)
exports.createNotice = async (req, res) => {
    try {
        const { title, content, targetAudience, type, isPublished } = req.body;
        const notice = await Notice.create({
            title,
            content,
            targetAudience: targetAudience || ['all'],
            type: type || 'general',
            isPublished: isPublished !== undefined ? isPublished : true,
            postedBy: req.user.id
        });
        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a notice
// @route   PUT /api/admin/notices/:id
// @access  Private (Admin)
exports.updateNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a notice
// @route   DELETE /api/admin/notices/:id
// @access  Private (Admin)
exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all fees
// @route   GET /api/admin/fees
// @access  Private (Admin)
exports.getAllFees = async (req, res) => {
    try {
        const fees = await Fee.find().sort({ createdAt: -1 });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new fee
// @route   POST /api/admin/fees
// @access  Private (Admin)
exports.createFee = async (req, res) => {
    try {
        const { title, description, amount, dueDate, semester, department, status } = req.body;
        const fee = await Fee.create({
            title,
            description,
            amount,
            dueDate,
            semester: semester || 0,
            department: department || 'All',
            status: status || 'active'
        });

        // Send notifications to targeted students
        const query = {};
        if (fee.semester !== 0) query.sem = fee.semester;
        if (fee.department !== 'All') query.department = fee.department;

        const students = await Student.find(query);
        const notifications = students.map(student => ({
            recipient: student.user,
            title: 'New Fee Added',
            message: `A new fee "${fee.title}" of ₹${fee.amount} has been added. Due date: ${new Date(fee.dueDate).toLocaleDateString()}.`,
            type: 'alert'
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json(fee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a fee
// @route   PUT /api/admin/fees/:id
// @access  Private (Admin)
exports.updateFee = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!fee) return res.status(404).json({ message: 'Fee not found' });
        res.json(fee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a fee
// @route   DELETE /api/admin/fees/:id
// @access  Private (Admin)
exports.deleteFee = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndDelete(req.params.id);
        if (!fee) return res.status(404).json({ message: 'Fee not found' });
        res.json({ message: 'Fee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get recent activity (Users, Courses, Notices)
// @route   GET /api/admin/activity
// @access  Private (Admin)
exports.getRecentActivity = async (req, res) => {
    try {
        const [users, courses, notices] = await Promise.all([
            User.find().sort({ createdAt: -1 }).limit(5).select('name role createdAt'),
            Course.find().sort({ createdAt: -1 }).limit(5).select('name code createdAt'),
            Notice.find().sort({ createdAt: -1 }).limit(5).select('title type createdAt')
        ]);

        const activities = [
            ...users.map(u => ({
                id: u._id,
                text: `New ${u.role} registered: ${u.name}`,
                time: u.createdAt,
                type: 'user'
            })),
            ...courses.map(c => ({
                id: c._id,
                text: `Course added: ${c.name} (${c.code})`,
                time: c.createdAt,
                type: 'course'
            })),
            ...notices.map(n => ({
                id: n._id,
                text: `Notice posted: ${n.title}`,
                time: n.createdAt,
                type: 'system' // Mapping notice to 'system' or similar icon
            }))
        ];

        // Sort by time (newest first) and take top 10
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(activities.slice(0, 10));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
