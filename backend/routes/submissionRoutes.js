const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
    submitCode,
    getSubmissionList,
    getSubmission,
    getProblemSubmissions,
    getUserStats
} = require('../controllers/submissionController');

router.post('/submit', authMiddleware, submitCode);
router.post('/history/list', authMiddleware, getSubmissionList);
router.post('/history/one', authMiddleware, getSubmission);
router.get('/problem/:problemId', authMiddleware, getProblemSubmissions);
router.get('/stats', authMiddleware, getUserStats);

module.exports = router;