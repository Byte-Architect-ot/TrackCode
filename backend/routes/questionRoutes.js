const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getQuestionsByTest,
    updateQuestion,
    deleteQuestion
} = require('../controllers/questionController');

// No auth required - basic save operations
router.post('/create', createQuestion);
router.post('/all', getQuestionsByTest);
router.put('/update/:id', updateQuestion);
router.delete('/delete/:id', deleteQuestion);

module.exports = router;