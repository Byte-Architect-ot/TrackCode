const LiveResponseModel = require('../models/LiveResponseModel');
const QuestionModel = require('../models/QuestionModel');
const TestModel = require('../models/TestModel');

// Start Test (Initialize Response)
const startTest = async (req, res) => {
    try {
        const { testId } = req.body;
        const userId = req.userId;

        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        if (test.phase !== 'running') {
            return res.status(400).json({ error: 'Test is not running' });
        }

        // Check if already started
        let response = await LiveResponseModel.findOne({ testId, userId });

        if (response) {
            if (response.isSubmitted) {
                return res.status(400).json({ error: 'You have already submitted this test' });
            }
            return res.json({
                success: true,
                msg: 'Resuming test',
                responseId: response._id,
                responses: response.responses
            });
        }

        // Get questions
        const questions = await QuestionModel.find({ testId });

        // Initialize response
        response = new LiveResponseModel({
            testId,
            userId,
            totalMarks: test.totalMarks,
            responses: questions.map(q => ({
                questionId: q._id,
                selectedOptionId: null,
                correctAnswer: q.correctAnswer,
                status: 'unanswered',
                marks: 0
            })),
            unansweredCount: questions.length
        });

        await response.save();

        res.status(201).json({
            success: true,
            msg: 'Test started',
            responseId: response._id
        });
    } catch (error) {
        console.error('Start test error:', error);
        res.status(500).json({ error: 'Failed to start test' });
    }
};

// Save Answer
const saveAnswer = async (req, res) => {
    try {
        const { testId, questionId, optionId } = req.body;
        const userId = req.userId;

        const response = await LiveResponseModel.findOne({ testId, userId });

        if (!response) {
            return res.status(404).json({ error: 'Test not started' });
        }

        if (response.isSubmitted) {
            return res.status(400).json({ error: 'Test already submitted' });
        }

        // Find the question response
        const questionResponse = response.responses.find(r => 
            r.questionId.toString() === questionId
        );

        if (!questionResponse) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Update the answer
        questionResponse.selectedOptionId = optionId;
        questionResponse.answeredAt = new Date();

        await response.save();

        res.json({
            success: true,
            msg: 'Answer saved'
        });
    } catch (error) {
        console.error('Save answer error:', error);
        res.status(500).json({ error: 'Failed to save answer' });
    }
};

// Submit Test
const submitTest = async (req, res) => {
    try {
        const { testId } = req.body;
        const userId = req.userId;

        const response = await LiveResponseModel.findOne({ testId, userId });

        if (!response) {
            return res.status(404).json({ error: 'Test not started' });
        }

        if (response.isSubmitted) {
            return res.status(400).json({ error: 'Test already submitted' });
        }

        // Get questions for evaluation
        const questions = await QuestionModel.find({ testId });
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        let obtainedMarks = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let unansweredCount = 0;

        // Evaluate each response
        response.responses.forEach(r => {
            const question = questionMap.get(r.questionId.toString());
            
            if (!question) return;

            if (!r.selectedOptionId) {
                r.status = 'unanswered';
                r.marks = 0;
                unansweredCount++;
            } else if (r.selectedOptionId.toString() === question.correctAnswer.toString()) {
                r.status = 'correct';
                r.marks = question.marks;
                obtainedMarks += question.marks;
                correctCount++;
            } else {
                r.status = 'wrong';
                r.marks = -question.negativeMarks || 0;
                obtainedMarks += r.marks;
                wrongCount++;
            }
        });

        response.obtainedMarks = Math.max(0, obtainedMarks);
        response.correctCount = correctCount;
        response.wrongCount = wrongCount;
        response.unansweredCount = unansweredCount;
        response.isSubmitted = true;
        response.submittedAt = new Date();

        await response.save();

        res.json({
            success: true,
            msg: 'Test submitted successfully',
            result: {
                obtainedMarks: response.obtainedMarks,
                totalMarks: response.totalMarks,
                correctCount,
                wrongCount,
                unansweredCount
            }
        });
    } catch (error) {
        console.error('Submit test error:', error);
        res.status(500).json({ error: 'Failed to submit test' });
    }
};

// Get My Response
const getMyResponse = async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;

        const response = await LiveResponseModel.findOne({ testId, userId })
            .populate('responses.questionId');

        if (!response) {
            return res.status(404).json({ error: 'Response not found' });
        }

        res.json({
            success: true,
            response
        });
    } catch (error) {
        console.error('Get response error:', error);
        res.status(500).json({ error: 'Failed to get response' });
    }
};

module.exports = {
    startTest,
    saveAnswer,
    submitTest,
    getMyResponse
};