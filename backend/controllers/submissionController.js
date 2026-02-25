const SubmissionHistoryModel = require('../models/SubmissionHistoryModel');
const ProblemModel = require('../models/ProblemModel');
const TestModel = require('../models/TestModel');
const mongoose = require('mongoose');

// Submit Code
const submitCode = async (req, res) => {
    try {
        const { testId, problemId, code, languageId, language } = req.body;
        const userId = req.userId;

        // Validate problem exists
        const problem = await ProblemModel.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Validate test if provided
        if (testId) {
            const test = await TestModel.findById(testId);
            if (!test) {
                return res.status(404).json({ error: 'Test not found' });
            }
            if (test.phase !== 'running') {
                return res.status(400).json({ error: 'Contest is not running' });
            }
        }

        // Create submission record
        const submission = {
            testId: testId || null,
            problemId,
            code,
            language,
            languageId,
            verdict: 'Pending',
            submittedAt: new Date()
        };

        // Find or create submission history for user
        let history = await SubmissionHistoryModel.findOne({ userId });
        
        if (!history) {
            history = new SubmissionHistoryModel({
                userId,
                submissions: [submission]
            });
        } else {
            history.submissions.push(submission);
        }

        await history.save();

        const submissionId = history.submissions[history.submissions.length - 1]._id;

        // TODO: Send to judge queue for evaluation
        // This would typically involve:
        // 1. Sending to a message queue (Redis, RabbitMQ, etc.)
        // 2. Worker process picks up and evaluates
        // 3. Updates the submission verdict

        res.status(201).json({
            success: true,
            msg: 'Submission received',
            submissionId,
            status: 'Pending'
        });
    } catch (error) {
        console.error('Submit code error:', error);
        res.status(500).json({ error: 'Failed to submit code' });
    }
};

// Get Submission List
const getSubmissionList = async (req, res) => {
    try {
        const { testId, problemId } = req.body;
        const userId = req.userId;

        const history = await SubmissionHistoryModel.findOne({ userId });

        if (!history) {
            return res.json([]);
        }

        let submissions = history.submissions;

        // Filter by testId and problemId
        if (testId) {
            submissions = submissions.filter(s => 
                s.testId && s.testId.toString() === testId
            );
        }
        if (problemId) {
            submissions = submissions.filter(s => 
                s.problemId.toString() === problemId
            );
        }

        // Sort by newest first and return basic info
        const result = submissions
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .map(s => ({
                _id: s._id,
                verdict: s.verdict,
                language: s.language,
                timestamp: s.submittedAt,
                executionTime: s.executionTime,
                memoryUsed: s.memoryUsed
            }));

        res.json(result);
    } catch (error) {
        console.error('Get submission list error:', error);
        res.status(500).json({ error: 'Failed to get submissions' });
    }
};

// Get Single Submission
const getSubmission = async (req, res) => {
    try {
        const { testId, problemId, submissionId } = req.body;
        const userId = req.userId;

        const history = await SubmissionHistoryModel.findOne({ userId });

        if (!history) {
            return res.status(404).json({ error: 'No submissions found' });
        }

        const submission = history.submissions.find(s => 
            s._id.toString() === submissionId
        );

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.json({
            _id: submission._id,
            code: submission.code,
            language: submission.language,
            verdict: submission.verdict,
            timestamp: submission.submittedAt,
            executionTime: submission.executionTime,
            memoryUsed: submission.memoryUsed,
            testCasesPassed: submission.testCasesPassed,
            totalTestCases: submission.totalTestCases,
            errorMessage: submission.errorMessage
        });
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ error: 'Failed to get submission' });
    }
};

// Get All Submissions for a Problem (Admin/Creator)
const getProblemSubmissions = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const problem = await ProblemModel.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Check if user is creator
        if (problem.creatorId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const allHistories = await SubmissionHistoryModel.find({
            'submissions.problemId': problemId
        }).populate('userId', 'name email');

        // Flatten and filter submissions
        const submissions = [];
        allHistories.forEach(history => {
            history.submissions
                .filter(s => s.problemId.toString() === problemId)
                .forEach(s => {
                    submissions.push({
                        ...s.toObject(),
                        user: {
                            _id: history.userId._id,
                            name: history.userId.name,
                            email: history.userId.email
                        }
                    });
                });
        });

        // Sort and paginate
        submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const paginatedSubmissions = submissions.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            success: true,
            submissions: paginatedSubmissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: submissions.length,
                pages: Math.ceil(submissions.length / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get problem submissions error:', error);
        res.status(500).json({ error: 'Failed to get submissions' });
    }
};

// Update Submission Verdict (called by judge)
const updateVerdict = async (req, res) => {
    try {
        const { 
            userId, 
            submissionId, 
            verdict, 
            executionTime, 
            memoryUsed,
            testCasesPassed,
            totalTestCases,
            errorMessage,
            marks
        } = req.body;

        const history = await SubmissionHistoryModel.findOne({ userId });

        if (!history) {
            return res.status(404).json({ error: 'Submission history not found' });
        }

        const submission = history.submissions.id(submissionId);

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        submission.verdict = verdict;
        submission.executionTime = executionTime;
        submission.memoryUsed = memoryUsed;
        submission.testCasesPassed = testCasesPassed;
        submission.totalTestCases = totalTestCases;
        submission.errorMessage = errorMessage;
        submission.marks = marks || 0;

        await history.save();

        // Update problem stats
        if (verdict === 'Accepted') {
            await ProblemModel.findByIdAndUpdate(submission.problemId, {
                $inc: { acceptedSubmissions: 1, totalSubmissions: 1 }
            });
        } else {
            await ProblemModel.findByIdAndUpdate(submission.problemId, {
                $inc: { totalSubmissions: 1 }
            });
        }

        res.json({ success: true, msg: 'Verdict updated' });
    } catch (error) {
        console.error('Update verdict error:', error);
        res.status(500).json({ error: 'Failed to update verdict' });
    }
};

// Get User Stats
const getUserStats = async (req, res) => {
    try {
        const userId = req.userId;

        const history = await SubmissionHistoryModel.findOne({ userId });

        if (!history) {
            return res.json({
                totalSubmissions: 0,
                acceptedSubmissions: 0,
                problemsSolved: 0,
                languageStats: {}
            });
        }

        const submissions = history.submissions;
        const solvedProblems = new Set();
        const languageStats = {};

        submissions.forEach(s => {
            // Count language usage
            languageStats[s.language] = (languageStats[s.language] || 0) + 1;
            
            // Track solved problems
            if (s.verdict === 'Accepted') {
                solvedProblems.add(s.problemId.toString());
            }
        });

        res.json({
            totalSubmissions: submissions.length,
            acceptedSubmissions: submissions.filter(s => s.verdict === 'Accepted').length,
            problemsSolved: solvedProblems.size,
            languageStats
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
};

module.exports = {
    submitCode,
    getSubmissionList,
    getSubmission,
    getProblemSubmissions,
    updateVerdict,
    getUserStats
};