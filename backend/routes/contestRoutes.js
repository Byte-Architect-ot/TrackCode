const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { educatorMiddleware } = require('../middlewares/educatorMiddleware');
const {
    createContest,
    getAllContests,
    getMyContests,
    getContestById,
    updateContest,
    deleteContest,
    joinContest,
    leaveContest,
    getJoinedContests
} = require('../controllers/contestController');

// Public routes
router.get('/all', getAllContests);
router.get('/:id', getContestById);

// Educator-only routes (create, update, delete - admin token required)
router.post('/create', educatorMiddleware, createContest);
router.put('/update/:id', educatorMiddleware, updateContest);
router.delete('/delete/:id', educatorMiddleware, deleteContest);

// Educator my-contests (uses admin token)
router.get('/user/my-contests', educatorMiddleware, getMyContests);

// Student routes (user token)
router.get('/user/joined', authMiddleware, getJoinedContests);
router.post('/join/:id', authMiddleware, joinContest);
router.post('/leave/:id', authMiddleware, leaveContest);

module.exports = router;