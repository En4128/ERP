const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const adminOnly = authorize('admin');

// ==================== ADMIN ROUTES ====================
// All admin routes require admin role

// Placement drive management
router.post('/admin/drives', protect, adminOnly, placementController.createPlacementDrive);
router.put('/admin/drives/:id', protect, adminOnly, placementController.updatePlacementDrive);
router.delete('/admin/drives/:id', protect, adminOnly, placementController.deletePlacementDrive);
router.get('/admin/drives', protect, adminOnly, placementController.getAllDrives);

// Application management
router.get('/admin/applications', protect, adminOnly, placementController.getAllApplications);
router.put('/admin/applications/:id', protect, adminOnly, placementController.updateApplicationStatus);

// Statistics
router.get('/admin/statistics', protect, adminOnly, placementController.getPlacementStatistics);

// ==================== STUDENT ROUTES ====================
// All student routes require authentication

// View drives
router.get('/student/drives', protect, placementController.getAvailableDrives);
router.get('/student/drives/:id', protect, placementController.getDriveDetails);

// Applications
router.post('/student/apply', protect, upload.single('resume'), placementController.applyToDrive);
router.get('/student/applications', protect, placementController.getMyApplications);

// Statistics
router.get('/student/statistics', protect, placementController.getMyPlacementStats);

module.exports = router;
