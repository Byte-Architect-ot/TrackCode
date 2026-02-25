const TestModel = require('../models/TestModel');
const TestResultModel = require('../models/TestResultModel');
const TestRegistrationModel = require('../models/TestRegistrationModel');
const LiveResponseModel = require('../models/LiveResponseModel');
const QuestionModel = require('../models/QuestionModel');
const { UserModel } = require('../models/UserModel');
const { generateCSV } = require('../services/csvService');

// Get test results (for educator)
const getTestResults = async (req, res) => {
    try {
        const { testId } = req.params;
        const adminId = req.adminId;

        const test = await TestModel.findOne({ _id: testId, examTakerId: adminId });
        if (!test) {
            return res.status(404).json({ error: 'Test not found or unauthorized' });
        }

        const testResult = await TestResultModel.findOne({ testId })
            .populate('results.userId', 'name email');

        if (!testResult) {
            return res.json({
                success: true,
                test: { _id: test._id, title: test.title },
                results: [],
                stats: {
                    totalParticipants: 0,
                    averageScore: 0,
                    highestScore: 0,
                    lowestScore: 0
                }
            });
        }

        res.json({
            success: true,
            test: { _id: test._id, title: test.title, totalMarks: test.totalMarks },
            results: testResult.results,
            stats: {
                totalParticipants: testResult.totalParticipants,
                averageScore: testResult.averageScore,
                highestScore: testResult.highestScore,
                lowestScore: testResult.lowestScore
            },
            isPublished: testResult.isPublished
        });
    } catch (error) {
        console.error('Get test results error:', error);
        res.status(500).json({ error: 'Failed to get results' });
    }
};

// Publish/unpublish results
const toggleResultVisibility = async (req, res) => {
    try {
        const { testId } = req.params;
        const { publish } = req.body;
        const adminId = req.adminId;

        const test = await TestModel.findOne({ _id: testId, examTakerId: adminId });
        if (!test) {
            return res.status(404).json({ error: 'Test not found or unauthorized' });
        }

        const testResult = await TestResultModel.findOne({ testId });
        if (!testResult) {
            return res.status(404).json({ error: 'No results found for this test' });
        }

        testResult.isPublished = publish;
        if (publish && !testResult.publishedAt) {
            testResult.publishedAt = new Date();
        }
        await testResult.save();

        // Also update test model
        test.publishResult = publish;
        await test.save();

        res.json({
            success: true,
            msg: publish ? 'Results published' : 'Results hidden',
            isPublished: testResult.isPublished
        });
    } catch (error) {
        console.error('Toggle result visibility error:', error);
        res.status(500).json({ error: 'Failed to update result visibility' });
    }
};

// Download results as CSV
const downloadResultsCSV = async (req, res) => {
    try {
        const { testId } = req.params;
        const adminId = req.adminId;

        const test = await TestModel.findOne({ _id: testId, examTakerId: adminId });
        if (!test) {
            return res.status(404).json({ error: 'Test not found or unauthorized' });
        }

        const testResult = await TestResultModel.findOne({ testId })
            .populate('results.userId', 'name email');

        if (!testResult || testResult.results.length === 0) {
            return res.status(404).json({ error: 'No results to export' });
        }

        // Prepare data for CSV - includes Test name, Total marks, and user scores per spec
        const totalMarks = test.totalMarks || testResult.results.reduce((max, r) => Math.max(max, r.totalMarks || 0), 0);
        const csvData = testResult.results.map(r => ({
            'Test Name': test.title,
            'Total Marks': totalMarks,
            'Rank': r.rank,
            'Name': r.userId?.name || 'Unknown',
            'Email': r.userId?.email || 'Unknown',
            'Score': r.totalMarks,
            'MCQ Score': r.mcqMarks,
            'MCQ Correct': r.mcqCorrect,
            'MCQ Wrong': r.mcqWrong,
            'MCQ Unanswered': r.mcqUnanswered,
            'Coding Score': r.codingMarks,
            'Problems Solved': r.problemsSolved,
            'Problems Attempted': r.problemsAttempted,
            'Time Taken (seconds)': r.timeTaken,
            'Percentile': r.percentile,
            'Submitted At': r.submittedAt ? new Date(r.submittedAt).toISOString() : ''
        }));

        const csv = generateCSV(csvData);

        const filename = `${test.title.replace(/[^a-z0-9]/gi, '_')}_results_${Date.now()}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    } catch (error) {
        console.error('Download CSV error:', error);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
};

// Get student's own result (if published)
const getMyResult = async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;

        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        const testResult = await TestResultModel.findOne({ testId });
        if (!testResult) {
            return res.status(404).json({ error: 'Results not available yet' });
        }

        if (!testResult.isPublished) {
            return res.status(403).json({ error: 'Results have not been published yet' });
        }

        const myResult = testResult.results.find(
            r => r.userId.toString() === userId.toString()
        );

        if (!myResult) {
            return res.status(404).json({ error: 'Your result was not found' });
        }

        res.json({
            success: true,
            test: { _id: test._id, title: test.title, totalMarks: test.totalMarks },
            result: myResult,
            stats: {
                totalParticipants: testResult.totalParticipants,
                averageScore: testResult.averageScore,
                highestScore: testResult.highestScore
            }
        });
    } catch (error) {
        console.error('Get my result error:', error);
        res.status(500).json({ error: 'Failed to get result' });
    }
};

// Get detailed answer review (if allowed by educator)
const getAnswerReview = async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;

        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        const testResult = await TestResultModel.findOne({ testId });
        if (!testResult || !testResult.isPublished) {
            return res.status(403).json({ error: 'Results not published' });
        }

        const liveResponse = await LiveResponseModel.findOne({ testId, userId });
        if (!liveResponse) {
            return res.status(404).json({ error: 'No submission found' });
        }

        // Get questions with correct answers
        const questions = await QuestionModel.find({ testId });

        const mcqReview = liveResponse.mcqResponses.map(response => {
            const question = questions.find(
                q => q._id.toString() === response.questionId.toString()
            );

            if (!question) return null;

            const isCorrect = question.questionType === 'multiple'
                ? JSON.stringify([...response.selectedOptionIds].sort()) === 
                  JSON.stringify([...question.correctAnswers].sort())
                : response.selectedOptionId?.toString() === question.correctAnswer.toString();

            return {
                questionId: question._id,
                questionText: question.questionText,
                options: question.options,
                yourAnswer: question.questionType === 'multiple' 
                    ? response.selectedOptionIds 
                    : response.selectedOptionId,
                correctAnswer: question.questionType === 'multiple'
                    ? question.correctAnswers
                    : question.correctAnswer,
                isCorrect,
                marks: question.marks,
                explanation: question.explanation
            };
        }).filter(Boolean);

        res.json({
            success: true,
            mcqReview
            // Note: Coding review would include submission history with verdicts
        });
    } catch (error) {
        console.error('Get answer review error:', error);
        res.status(500).json({ error: 'Failed to get answer review' });
    }
};

module.exports = {
    getTestResults,
    toggleResultVisibility,
    downloadResultsCSV,
    getMyResult,
    getAnswerReview
};