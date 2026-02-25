const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
    getLiveLeaderboard,
    getFinalResults,
    publishResults,
    getMyResult
} = require('../controllers/leaderboardController');

router.get('/live/:testId', getLiveLeaderboard);
router.get('/results/:testId', getFinalResults);
router.post('/publish/:testId', authMiddleware, publishResults);
router.get('/my-result/:testId', authMiddleware, getMyResult);

module.exports = router;