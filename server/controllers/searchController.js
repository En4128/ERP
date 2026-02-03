const Course = require('../models/Course');
const Document = require('../models/Document');
const Notice = require('../models/Notice');

// @desc    Global search across courses, documents and notices
// @route   GET /api/search
// @access  Private
exports.globalSearch = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) {
            return res.json({ courses: [], documents: [], notices: [] });
        }

        const searchRegex = new RegExp(query, 'i');

        // 1. Search Courses
        const courses = await Course.find({
            $or: [
                { name: searchRegex },
                { code: searchRegex },
                { department: searchRegex }
            ]
        }).limit(5).select('name code department');

        // 2. Search Documents (Accessible to user)
        const documents = await Document.find({
            user: req.user.id,
            title: searchRegex
        }).limit(5).select('title type fileUrl');

        // 3. Search Notices (Filtered by role)
        const noticeFilter = {
            title: searchRegex,
            isPublished: true
        };

        if (req.user.role === 'student') {
            noticeFilter.targetAudience = { $in: ['all', 'student'] };
        } else if (req.user.role === 'faculty') {
            noticeFilter.targetAudience = { $in: ['all', 'faculty'] };
        }

        const notices = await Notice.find(noticeFilter).limit(5).select('title type');

        res.json({
            courses,
            documents,
            notices
        });
    } catch (error) {
        console.error('Global Search Error:', error);
        res.status(500).json({ message: 'Internal server error during search' });
    }
};
