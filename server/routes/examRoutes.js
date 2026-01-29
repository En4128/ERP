const express = require('express');
const { createExam, getAllExams, deleteExam, getHallTicketData } = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/', createExam);
router.get('/', getAllExams);
router.get('/hall-tickets', getHallTicketData);
router.delete('/:id', deleteExam);

module.exports = router;
