const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
    registerForTest,
    startTest,
    saveMcqResponse,
    saveCodingResponse,
    updateNavigation,
    submitTest,
    autoSubmitTest,
    getTestStatus,
    getMyTests
} = require('../controllers/testSessionController');

// Student routes
router.get('/my-tests', authMiddleware, getMyTests);
router.get('/:testId/status', authMiddleware, getTestStatus);
router.post('/:testId/register', authMiddleware, registerForTest);
router.post('/:testId/start', authMiddleware, startTest);
router.post('/:testId/mcq/save', authMiddleware, saveMcqResponse);
router.post('/:testId/coding/save', authMiddleware, saveCodingResponse);
router.post('/:testId/navigation', authMiddleware, updateNavigation);
router.post('/:testId/submit', authMiddleware, submitTest);
router.post('/:testId/auto-submit', authMiddleware, autoSubmitTest);

module.exports = router;