const express = require('express');
const router = express.Router();
const {
    createProblem,
    getMyProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
    getPublicProblems
} = require('../controllers/problemController');

// Public routes
router.get('/public', getPublicProblems);

// No auth required - basic save operations
router.post('/create', createProblem);
router.get('/my-problems', getMyProblems);
router.get('/:id', getProblemById);
router.put('/update/:id', updateProblem);
router.delete('/delete/:id', deleteProblem);

module.exports = router;