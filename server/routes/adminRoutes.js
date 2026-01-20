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
    updateFaculty
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getAdminStats);
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

module.exports = router;
