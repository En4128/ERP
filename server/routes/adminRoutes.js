const express = require('express');
const {
    getAdminStats,
    getAllStudents,
    getAllFaculty,
    deleteStudent,
    deleteFaculty,
    getAllNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    registerStudent,
    updateStudent,
    registerFaculty,
    updateFaculty,
    getAllUsers,
    toggleUserBlock,
    getAllFees,
    createFee,
    updateFee,
    deleteFee,
    getRecentActivity
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getAdminStats);
router.get('/activity', getRecentActivity);
router.get('/students', getAllStudents);
router.post('/students', registerStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

router.get('/faculty', getAllFaculty);
router.post('/faculty', registerFaculty);
router.put('/faculty/:id', updateFaculty);
router.delete('/faculty/:id', deleteFaculty);
router.get('/notices', getAllNotices);
router.post('/notices', createNotice);
router.put('/notices/:id', updateNotice);
router.delete('/notices/:id', deleteNotice);

router.get('/users-all', getAllUsers);
router.patch('/users/:id/toggle-block', toggleUserBlock);

// Fee Management
router.get('/fees', getAllFees);
router.post('/fees', createFee);
router.put('/fees/:id', updateFee);
router.delete('/fees/:id', deleteFee);

module.exports = router;
