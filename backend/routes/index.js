const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const adminAuthRoutes = require('./adminAuthRoutes');
const contestRoutes = require('./contestRoutes');
const problemRoutes = require('./problemRoutes');
const questionRoutes = require('./questionRoutes');
const submissionRoutes = require('./submissionRoutes');
const codeforcesRoutes = require('./codeforcesRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const responseRoutes = require('./responseRoutes');
const testSessionRoutes = require('./testSessionRoutes');
const resultRoutes = require('./resultRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/contest', contestRoutes);
router.use('/problem', problemRoutes);
router.use('/question', questionRoutes);
router.use('/submission', submissionRoutes);
router.use('/codeforces', codeforcesRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/response', responseRoutes);
router.use('/test-session', testSessionRoutes);
router.use('/results', resultRoutes);

// API info
router.get('/', (req, res) => {
    res.json({
        name: 'Contest Platform API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            adminAuth: '/api/admin/auth',
            contest: '/api/contest',
            problem: '/api/problem',
            question: '/api/question',
            submission: '/api/submission',
            codeforces: '/api/codeforces',
            leaderboard: '/api/leaderboard',
            response: '/api/response',
            testSession: '/api/test-session',
            results: '/api/results'
        }
    });
});

module.exports = router;