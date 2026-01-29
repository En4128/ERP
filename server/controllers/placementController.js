const PlacementDrive = require('../models/PlacementDrive');
const PlacementApplication = require('../models/PlacementApplication');
const Student = require('../models/Student');

// ==================== ADMIN FUNCTIONS ====================

// Create new placement drive
exports.createPlacementDrive = async (req, res) => {
    try {
        const drive = new PlacementDrive({
            ...req.body,
            createdBy: req.user.id
        });
        await drive.save();
        res.status(201).json({ message: 'Placement drive created successfully', drive });
    } catch (error) {
        console.error('Create drive error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update placement drive
exports.updatePlacementDrive = async (req, res) => {
    try {
        const drive = await PlacementDrive.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!drive) return res.status(404).json({ message: 'Drive not found' });
        res.json({ message: 'Drive updated successfully', drive });
    } catch (error) {
        console.error('Update drive error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete placement drive
exports.deletePlacementDrive = async (req, res) => {
    try {
        const drive = await PlacementDrive.findByIdAndDelete(req.params.id);
        if (!drive) return res.status(404).json({ message: 'Drive not found' });

        // Also delete all applications for this drive
        await PlacementApplication.deleteMany({ drive: req.params.id });

        res.json({ message: 'Drive deleted successfully' });
    } catch (error) {
        console.error('Delete drive error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all drives (admin view)
exports.getAllDrives = async (req, res) => {
    try {
        const drives = await PlacementDrive.find().sort({ createdAt: -1 });
        res.json(drives);
    } catch (error) {
        console.error('Get all drives error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all applications for admin
exports.getAllApplications = async (req, res) => {
    try {
        const applications = await PlacementApplication.find()
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name email' }
            })
            .populate('drive', 'companyName role package')
            .sort({ appliedDate: -1 });

        const formattedApplications = applications.map(app => ({
            id: app._id,
            studentId: app.student?.admissionNumber || 'N/A',
            studentName: app.student?.user?.name || 'Unknown',
            driveId: app.drive?._id,
            company: app.drive?.companyName || 'N/A',
            role: app.drive?.role || 'N/A',
            appliedDate: app.appliedDate.toISOString().split('T')[0],
            status: app.status,
            resumeUrl: app.resumeUrl,
            coverLetter: app.coverLetter
        }));

        res.json(formattedApplications);
    } catch (error) {
        console.error('Get all applications error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const application = await PlacementApplication.findByIdAndUpdate(
            req.params.id,
            { status, remarks },
            { new: true }
        ).populate('drive');

        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Update drive counts
        if (status === 'selected') {
            await PlacementDrive.findByIdAndUpdate(application.drive._id, {
                $inc: { selectedCount: 1 }
            });
        }

        res.json({ message: 'Application status updated', application });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get placement statistics for admin
exports.getPlacementStatistics = async (req, res) => {
    try {
        const totalDrives = await PlacementDrive.countDocuments();
        const totalApplications = await PlacementApplication.countDocuments();

        const placedStudents = await PlacementApplication.countDocuments({ status: 'selected' });
        const pendingApplications = await PlacementApplication.countDocuments({ status: 'pending' });

        const drives = await PlacementDrive.find();

        // Calculate average package (simplified - assumes package format like "₹12 LPA")
        let totalPackage = 0;
        let packageCount = 0;
        drives.forEach(drive => {
            const match = drive.package.match(/(\d+)/);
            if (match) {
                totalPackage += parseInt(match[1]);
                packageCount++;
            }
        });
        const avgPackage = packageCount > 0 ? `₹${(totalPackage / packageCount).toFixed(1)} LPA` : '₹0 LPA';

        // Get highest package
        let highestPackage = 0;
        drives.forEach(drive => {
            const match = drive.package.match(/(\d+)/);
            if (match && parseInt(match[1]) > highestPackage) {
                highestPackage = parseInt(match[1]);
            }
        });

        res.json({
            totalDrives,
            totalApplications,
            placedStudents,
            pendingApplications,
            avgPackage,
            highestPackage: `₹${highestPackage} LPA`
        });
    } catch (error) {
        console.error('Get placement statistics error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ==================== STUDENT FUNCTIONS ====================

// Get available drives for students (with eligibility filtering)
exports.getAvailableDrives = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const currentDate = new Date();

        // Get all active drives
        let drives = await PlacementDrive.find({
            status: { $in: ['upcoming', 'ongoing'] },
            applicationDeadline: { $gte: currentDate }
        }).sort({ driveDate: 1 });

        // Filter by eligibility
        drives = drives.filter(drive => {
            const criteria = drive.eligibilityCriteria;

            // Check department
            if (criteria.departments && criteria.departments.length > 0) {
                const deptMatch = criteria.departments.some(dept =>
                    student.department.toLowerCase().includes(dept.toLowerCase()) ||
                    dept.toLowerCase().includes(student.department.toLowerCase())
                );
                if (!deptMatch) return false;
            }

            // Check CGPA (if student has CGPA field)
            // Note: You may need to add CGPA to Student model
            // if (criteria.minCGPA && student.cgpa < criteria.minCGPA) return false;

            return true;
        });

        // Check which drives the student has already applied to
        const studentApplications = await PlacementApplication.find({
            student: student._id
        }).select('drive');

        const appliedDriveIds = studentApplications.map(app => app.drive.toString());

        const drivesWithApplicationStatus = drives.map(drive => ({
            ...drive.toObject(),
            hasApplied: appliedDriveIds.includes(drive._id.toString())
        }));

        res.json(drivesWithApplicationStatus);
    } catch (error) {
        console.error('Get available drives error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get drive details
exports.getDriveDetails = async (req, res) => {
    try {
        const drive = await PlacementDrive.findById(req.params.id);
        if (!drive) return res.status(404).json({ message: 'Drive not found' });
        res.json(drive);
    } catch (error) {
        console.error('Get drive details error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Apply to placement drive
exports.applyToDrive = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const { driveId, coverLetter } = req.body;
        const resumeUrl = req.file ? req.file.path.replace(/\\/g, '/') : '';

        // Check if drive exists and is still accepting applications
        const drive = await PlacementDrive.findById(driveId);
        if (!drive) return res.status(404).json({ message: 'Drive not found' });

        if (drive.status === 'completed' || drive.status === 'cancelled') {
            return res.status(400).json({ message: 'This drive is no longer accepting applications' });
        }

        if (new Date() > drive.applicationDeadline) {
            return res.status(400).json({ message: 'Application deadline has passed' });
        }

        // Check if already applied
        const existingApplication = await PlacementApplication.findOne({
            student: student._id,
            drive: driveId
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied to this drive' });
        }

        // Create application
        const application = new PlacementApplication({
            student: student._id,
            drive: driveId,
            resumeUrl: resumeUrl || '',
            coverLetter: coverLetter || '',
            status: 'pending'
        });

        await application.save();

        // Update drive applicant count
        await PlacementDrive.findByIdAndUpdate(driveId, {
            $inc: { totalApplicants: 1 }
        });

        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        console.error('Apply to drive error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already applied to this drive' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get student's applications
exports.getMyApplications = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const applications = await PlacementApplication.find({ student: student._id })
            .populate('drive')
            .sort({ appliedDate: -1 });

        const formattedApplications = applications.map(app => ({
            id: app._id,
            company: app.drive?.companyName || 'N/A',
            role: app.drive?.role || 'N/A',
            package: app.drive?.package || 'N/A',
            appliedDate: app.appliedDate.toISOString().split('T')[0],
            status: app.status,
            remarks: app.remarks,
            driveStatus: app.drive?.status
        }));

        res.json(formattedApplications);
    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get student's placement statistics
exports.getMyPlacementStats = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const totalApplications = await PlacementApplication.countDocuments({ student: student._id });
        const pending = await PlacementApplication.countDocuments({ student: student._id, status: 'pending' });
        const shortlisted = await PlacementApplication.countDocuments({ student: student._id, status: 'shortlisted' });
        const selected = await PlacementApplication.countDocuments({ student: student._id, status: 'selected' });
        const rejected = await PlacementApplication.countDocuments({ student: student._id, status: 'rejected' });

        const availableDrives = await PlacementDrive.countDocuments({
            status: { $in: ['upcoming', 'ongoing'] },
            applicationDeadline: { $gte: new Date() }
        });

        res.json({
            totalApplications,
            pending,
            shortlisted,
            selected,
            rejected,
            availableDrives,
            placementStatus: selected > 0 ? 'Placed' : pending > 0 || shortlisted > 0 ? 'In Process' : 'Not Placed'
        });
    } catch (error) {
        console.error('Get my placement stats error:', error);
        res.status(500).json({ message: error.message });
    }
};
