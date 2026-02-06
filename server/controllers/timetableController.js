const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const SystemConfig = require('../models/SystemConfig');

// @desc    Get all timetable slots
// @route   GET /api/timetable
// @access  Public (or Protected)
exports.getTimetable = async (req, res) => {
    try {
        const slots = await Timetable.find()
            .populate({
                path: 'course',
                select: 'name code department semester'
            })
            .populate({
                path: 'faculty',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });

        // Transform data to match frontend expectation
        const formattedSlots = slots.map(slot => {
            const course = slot.course || {};
            const faculty = slot.faculty || {};
            const user = faculty.user || {};

            return {
                id: slot._id,
                courseCode: course.code || 'N/A',
                courseName: course.name || 'Unknown Course',
                faculty: user.name || 'Unassigned',
                facultyId: faculty._id || null,
                room: slot.room,
                building: slot.building || 'Main Block',
                day: slot.day,
                startTime: slot.startTime,
                endTime: slot.endTime,
                type: slot.type || 'lecture',
                department: course.department || '',
                semester: course.semester !== undefined ? String(course.semester) : '0'
            };
        });

        console.log(`DEBUG: Sending ${formattedSlots.length} formatted slots`);
        res.json(formattedSlots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a timetable slot
// @route   POST /api/timetable
// @access  Admin
exports.addSlot = async (req, res) => {
    try {
        const { courseCode, day, startTime, endTime, room, building, type, facultyId, assignToCourse } = req.body;

        // 1. Find Course
        const course = await Course.findOne({ code: courseCode }).populate('assignedFaculty');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // 2. Validate Faculty Assignment
        // Use provided facultyId if exists, otherwise fallback to course's assignedFaculty
        const finalFacultyId = facultyId || (course.assignedFaculty ? course.assignedFaculty._id : null);

        if (!finalFacultyId) {
            return res.status(400).json({ message: 'No faculty assigned to this slot or course.' });
        }

        // 2b. Global Assignment
        if (assignToCourse && facultyId) {
            course.assignedFaculty = facultyId;
            await course.save();
            // Optional: update Faculty.assignedCourses if needed by other components
            await Faculty.findByIdAndUpdate(facultyId, { $addToSet: { assignedCourses: course._id } });
        }

        // 3. Create Slot
        const newSlot = new Timetable({
            course: course._id,
            faculty: finalFacultyId,
            day,
            startTime,
            endTime,
            room,
            building: building || 'Main Block',
            type: type || 'lecture'
        });

        await newSlot.save();

        // Return formatted slot
        const populatedSlot = await Timetable.findById(newSlot._id)
            .populate('course')
            .populate({
                path: 'faculty',
                populate: { path: 'user' }
            });

        res.status(201).json({
            id: populatedSlot._id,
            courseCode: course.code,
            courseName: course.name,
            faculty: populatedSlot.faculty.user.name,
            facultyId: populatedSlot.faculty._id,
            room: populatedSlot.room,
            building: populatedSlot.building,
            day: populatedSlot.day,
            startTime: populatedSlot.startTime,
            endTime: populatedSlot.endTime,
            type: populatedSlot.type || type || 'lecture',
            department: course.department,
            semester: course.semester
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a timetable slot
// @route   PUT /api/timetable/:id
// @access  Admin
exports.updateSlot = async (req, res) => {
    try {
        const { courseCode, day, startTime, endTime, room, building, type, facultyId, assignToCourse } = req.body;

        let slot = await Timetable.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        // 1. Find Course (if code changed)
        const course = await Course.findOne({ code: courseCode });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // 2. Update fields
        slot.course = course._id;
        slot.day = day;
        slot.startTime = startTime;
        slot.endTime = endTime;
        slot.room = room;
        slot.building = building;
        slot.type = type;
        if (facultyId) slot.faculty = facultyId;

        // 2b. Global Assignment
        if (assignToCourse && facultyId) {
            course.assignedFaculty = facultyId;
            await course.save();
            await Faculty.findByIdAndUpdate(facultyId, { $addToSet: { assignedCourses: course._id } });
        }

        await slot.save();

        // Return formatted slot
        const populatedSlot = await Timetable.findById(slot._id)
            .populate('course')
            .populate({
                path: 'faculty',
                populate: { path: 'user' }
            });

        res.json({
            id: populatedSlot._id,
            courseCode: course.code,
            courseName: course.name,
            faculty: populatedSlot.faculty.user.name,
            facultyId: populatedSlot.faculty._id,
            room: populatedSlot.room,
            building: populatedSlot.building,
            day: populatedSlot.day,
            startTime: populatedSlot.startTime,
            endTime: populatedSlot.endTime,
            type: populatedSlot.type,
            department: course.department,
            semester: course.semester
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a timetable slot
// @route   DELETE /api/timetable/:id
// @access  Admin
exports.deleteSlot = async (req, res) => {
    try {
        const slot = await Timetable.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        await slot.deleteOne();
        res.json({ message: 'Slot removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get system setting by key (common access)
// @route   GET /api/timetable/settings/:key
// @access  Private
exports.getConfig = async (req, res) => {
    try {
        const config = await SystemConfig.findOne({ key: req.params.key });
        if (!config) return res.status(404).json({ message: 'Setting not found' });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
