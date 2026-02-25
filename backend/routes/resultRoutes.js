const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/adminMiddleware');
const {
    getTestResults,
    toggleResultVisibility,
    downloadResultsCSV,
    getMyResult,
    getAnswerReview
} = require('../controllers/resultController');

// Educator routes
router.get('/admin/:testId', adminMiddleware, getTestResults);
router.post('/admin/:testId/toggle-visibility', adminMiddleware, toggleResultVisibility);
router.get('/admin/:testId/download-csv', adminMiddleware, downloadResultsCSV);

// Student routes
router.get('/my/:testId', authMiddleware, getMyResult);
router.get('/review/:testId', authMiddleware, getAnswerReview);

module.exports = router;