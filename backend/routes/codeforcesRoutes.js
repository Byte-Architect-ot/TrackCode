const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    getUpsolveData,
    getTagAnalysis,
    getRecommendations,
    getUpcomingContests
} = require('../controllers/codeforcesController');

router.get('/:handle', getUserProfile);
router.get('/user/:handle/upsolve', getUpsolveData);
router.get('/user/:handle/tags', getTagAnalysis);
router.get('/user/:handle/recommendations', getRecommendations);
router.get('/contests/upcoming', getUpcomingContests);

module.exports = router;