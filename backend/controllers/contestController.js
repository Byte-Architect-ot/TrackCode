const TestModel = require('../models/TestModel');
const QuestionModel = require('../models/QuestionModel');
const mongoose = require('mongoose');

// Create Contest
const createContest = async (req, res) => {
    try {
        const { name, description, startTime, endTime, problems, isPublic } = req.body;

        // Validate required fields
        if (!name || !startTime || !endTime) {
            return res.status(400).json({ error: 'Name, start time, and end time are required' });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        // Validate times
        if (start <= now) {
            return res.status(400).json({ error: 'Start time must be in the future' });
        }

        if (end <= start) {
            return res.status(400).json({ error: 'End time must be after start time' });
        }

        const totalTime = Math.floor((end - start) / 60000); // in minutes

        const contest = new TestModel({
            examTakerId: req.userId,
            examTakerModel: req.creatorType === 'admin' ? 'admins' : 'users',
            title: name,
            description: description || '',
            testTime: start,
            totalTime,
            questions: problems || [],
            phase: 'upcoming',
            examTakerPhase: 'finalized',
            publishResult: isPublic ?? true,
            accessCode: req.body.accessCode || null,
            isPrivate: !!req.body.accessCode,
            showLeaderboard: req.body.showLeaderboard ?? true,
            shuffleQuestions: req.body.shuffleQuestions || false,
            contestType: req.body.contestType || 'mixed'
        });

        await contest.save();

        res.status(201).json({ 
            success: true, 
            msg: 'Contest created successfully',
            contest: {
                id: contest._id,
                title: contest.title,
                phase: contest.phase
            }
        });
    } catch (error) {
        console.error('Create contest error:', error);
        res.status(500).json({ error: 'Failed to create contest' });
    }
};

// Get All Public Contests
const getAllContests = async (req, res) => {
    try {
        const { phase, page = 1, limit = 10 } = req.query;
        
        const query = { 
            examTakerPhase: 'finalized',
            publishResult: true 
        };

        if (phase && ['upcoming', 'running', 'completed'].includes(phase)) {
            query.phase = phase;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [contests, total] = await Promise.all([
            TestModel.find(query)
                .populate('examTakerId', 'name email')
                .select('title description testTime totalTime examTakerId students questions problems phase publishResult examTakerPhase createdAt')
                .sort({ testTime: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            TestModel.countDocuments(query)
        ]);

        res.json({ 
            success: true,
            contests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Fetch contests error:', error);
        res.status(500).json({ error: 'Failed to fetch contests' });
    }
};

// Get My Contests - simplified: just find by creator ID
const getMyContests = async (req, res) => {
    try {
        const contests = await TestModel.find({ 
            examTakerId: req.userId,
            examTakerModel: req.creatorType === 'admin' ? 'admins' : 'users'
        })
            .populate('questions')
            .populate('problems')
            .sort({ createdAt: -1 });

        res.json({ success: true, contests });
    } catch (error) {
        console.error('Fetch my contests error:', error);
        res.status(500).json({ error: 'Failed to fetch your contests' });
    }
};

// Get Contest by ID
const getContestById = async (req, res) => {
    try {
        const contest = await TestModel.findById(req.params.id)
            .populate('examTakerId', 'name email')
            .populate('questions')
            .populate('problems')
            .populate('students', 'name email');

        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        res.json({ success: true, contest });
    } catch (error) {
        console.error('Get contest error:', error);
        res.status(500).json({ error: 'Failed to get contest' });
    }
};

// Update Contest - simplified: just find by ID and update
const updateContest = async (req, res) => {
    try {
        const { name, description, startTime, endTime, problems, isPublic } = req.body;
        
        const contest = await TestModel.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        if (contest.phase === 'running') {
            return res.status(400).json({ error: 'Cannot edit a running contest' });
        }

        if (contest.phase === 'completed') {
            return res.status(400).json({ error: 'Cannot edit a completed contest' });
        }

        // Validate times if provided
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const now = new Date();

            if (start <= now) {
                return res.status(400).json({ error: 'Start time must be in the future' });
            }

            if (end <= start) {
                return res.status(400).json({ error: 'End time must be after start time' });
            }

            contest.testTime = start;
            contest.totalTime = Math.floor((end - start) / 60000);
        }

        if (name) contest.title = name;
        if (description !== undefined) contest.description = description;
        if (problems && Array.isArray(problems)) contest.problems = problems; // Update problems array
        if (isPublic !== undefined) contest.publishResult = isPublic;

        await contest.save();

        res.json({ success: true, msg: 'Contest updated successfully', contest });
    } catch (error) {
        console.error('Update contest error:', error);
        res.status(500).json({ error: 'Failed to update contest' });
    }
};

// Delete Contest - simplified: just find by ID
const deleteContest = async (req, res) => {
    try {
        const contest = await TestModel.findByIdAndDelete(req.params.id);

        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        // Optionally delete associated questions
        await QuestionModel.deleteMany({ testId: req.params.id });

        res.json({ success: true, msg: 'Contest deleted successfully' });
    } catch (error) {
        console.error('Delete contest error:', error);
        res.status(500).json({ error: 'Failed to delete contest' });
    }
};

// Join Contest
const joinContest = async (req, res) => {
    try {
        const contest = await TestModel.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        if (contest.phase === 'completed') {
            return res.status(400).json({ error: 'Contest has ended' });
        }

        if (!contest.publishResult) {
            return res.status(400).json({ error: 'This contest is not public' });
        }

        // Check if already joined
        const alreadyJoined = contest.students.some(
            studentId => studentId.toString() === req.userId
        );

        if (alreadyJoined) {
            return res.status(400).json({ error: 'You have already joined this contest' });
        }

        contest.students.push(req.userId);
        await contest.save();

        res.json({ success: true, msg: 'Successfully joined the contest' });
    } catch (error) {
        console.error('Join contest error:', error);
        res.status(500).json({ error: 'Failed to join contest' });
    }
};

// Leave Contest
const leaveContest = async (req, res) => {
    try {
        const contest = await TestModel.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        if (contest.phase === 'running') {
            return res.status(400).json({ error: 'Cannot leave a running contest' });
        }

        contest.students = contest.students.filter(
            studentId => studentId.toString() !== req.userId
        );
        
        await contest.save();

        res.json({ success: true, msg: 'Successfully left the contest' });
    } catch (error) {
        console.error('Leave contest error:', error);
        res.status(500).json({ error: 'Failed to leave contest' });
    }
};

// Get Joined Contests
const getJoinedContests = async (req, res) => {
    try {
        const contests = await TestModel.find({ 
            students: req.userId,
            publishResult: true
        })
        .populate('examTakerId', 'name email')
        .sort({ testTime: -1 });

        res.json({ success: true, contests });
    } catch (error) {
        console.error('Get joined contests error:', error);
        res.status(500).json({ error: 'Failed to get joined contests' });
    }
};

module.exports = {
    createContest,
    getAllContests,
    getMyContests,
    getContestById,
    updateContest,
    deleteContest,
    joinContest,
    leaveContest,
    getJoinedContests
};