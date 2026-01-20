const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

exports.createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const { department, semester, status } = req.query;
        let query = {};

        if (department && department !== 'all') query.department = department;
        if (semester && semester !== 'all') query.semester = semester;
        if (status && status !== 'all') query.status = status;

        const courses = await Course.find(query).populate({
            path: 'assignedFaculty',
            populate: { path: 'user', select: 'name' }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('assignedFaculty');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.assignFaculty = async (req, res) => {
    try {
        const { courseId, facultyId } = req.body;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        course.assignedFaculty = facultyId;
        await course.save();

        // Also update Faculty's assignedCourses
        await Faculty.findByIdAndUpdate(facultyId, { $addToSet: { assignedCourses: courseId } });

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
