const LiveResponseModel = require('../models/LiveResponseModel');
const TestResultModel = require('../models/TestResultModel');
const TestModel = require('../models/TestModel');

// Get Live Leaderboard
const getLiveLeaderboard = async (req, res) => {
    try {
        const { testId } = req.params;

        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        if (!test.showLeaderboard && test.phase !== 'completed') {
            return res.status(403).json({ error: 'Leaderboard is hidden' });
        }

        const responses = await LiveResponseModel.find({ testId })
            .populate('userId', 'name email')
            .sort({ obtainedMarks: -1, submittedAt: 1 });

        const leaderboard = responses.map((r, index) => ({
            rank: index + 1,
            userId: r.userId._id,
            name: r.userId.name,
            score: r.obtainedMarks,
            totalMarks: r.totalMarks,
            correctCount: r.correctCount,
            wrongCount: r.wrongCount,
            submittedAt: r.submittedAt
        }));

        res.json({
            success: true,
            contestName: test.title,
            leaderboard
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
};

// Get Final Results
const getFinalResults = async (req, res) => {
    try {
        const { testId } = req.params;

        const result = await TestResultModel.findOne({ testId })
            .populate('results.userId', 'name email');

        if (!result) {
            return res.status(404).json({ error: 'Results not found' });
        }

        if (!result.isPublished) {
            return res.status(403).json({ error: 'Results not published yet' });
        }

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ error: 'Failed to get results' });
    }
};

// Publish Results (Contest Creator)
const publishResults = async (req, res) => {
    try {
        const { testId } = req.params;

        const test = await TestModel.findOne({
            _id: testId,
            examTakerId: req.userId
        });

        if (!test) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        if (test.phase !== 'completed') {
            return res.status(400).json({ error: 'Contest has not ended yet' });
        }

        // Get all responses
        const responses = await LiveResponseModel.find({ testId })
            .sort({ obtainedMarks: -1, submittedAt: 1 });

        const results = responses.map((r, index) => ({
            userId: r.userId,
            mcqMarks: r.obtainedMarks,
            codingMarks: 0, // TODO: Add coding marks
            totalMarks: r.obtainedMarks,
            rank: index + 1,
            timeTaken: r.submittedAt ? 
                Math.floor((r.submittedAt - r.startedAt) / 1000) : 0,
            submittedAt: r.submittedAt,
            mcqCorrect: r.correctCount,
            mcqWrong: r.wrongCount,
            mcqUnanswered: r.unansweredCount
        }));

        // Calculate stats
        const scores = results.map(r => r.totalMarks);
        const avgScore = scores.length > 0 ? 
            scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        // Calculate percentiles
        results.forEach((r, i) => {
            r.percentile = Math.round(((results.length - i - 1) / results.length) * 100);
        });

        // Create or update result
        let testResult = await TestResultModel.findOne({ testId });
        
        if (testResult) {
            testResult.results = results;
            testResult.totalParticipants = results.length;
            testResult.averageScore = avgScore;
            testResult.highestScore = Math.max(...scores, 0);
            testResult.lowestScore = Math.min(...scores, 0);
            testResult.isPublished = true;
            testResult.publishedAt = new Date();
        } else {
            testResult = new TestResultModel({
                testId,
                totalParticipants: results.length,
                averageScore: avgScore,
                highestScore: Math.max(...scores, 0),
                lowestScore: Math.min(...scores, 0),
                results,
                isPublished: true,
                publishedAt: new Date()
            });
        }

        await testResult.save();

        // Update test
        test.publishResult = true;
        await test.save();

        res.json({
            success: true,
            msg: 'Results published successfully',
            totalParticipants: results.length
        });
    } catch (error) {
        console.error('Publish results error:', error);
        res.status(500).json({ error: 'Failed to publish results' });
    }
};

// Get My Result
const getMyResult = async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;

        const result = await TestResultModel.findOne({ testId });

        if (!result) {
            return res.status(404).json({ error: 'Results not found' });
        }

        if (!result.isPublished) {
            return res.status(403).json({ error: 'Results not published yet' });
        }

        const myResult = result.results.find(r => 
            r.userId.toString() === userId
        );

        if (!myResult) {
            return res.status(404).json({ error: 'Your result not found' });
        }

        res.json({
            success: true,
            result: myResult,
            totalParticipants: result.totalParticipants,
            averageScore: result.averageScore
        });
    } catch (error) {
        console.error('Get my result error:', error);
        res.status(500).json({ error: 'Failed to get result' });
    }
};

module.exports = {
    getLiveLeaderboard,
    getFinalResults,
    publishResults,
    getMyResult
};