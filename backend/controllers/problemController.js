const ProblemModel = require('../models/ProblemModel');
const TestModel = require('../models/TestModel');
const { AdminModel } = require('../models/AdminModel');

// Get dummy educator ID - cache it
let cachedEducatorId = null;
const getDummyEducatorId = async () => {
    if (cachedEducatorId) return cachedEducatorId;
    try {
        const dummy = await AdminModel.findOne({ email: 'educator@demo.com' }).select('_id');
        if (dummy) cachedEducatorId = dummy._id;
        return cachedEducatorId;
    } catch {
        return null;
    }
};

// Create Problem - SUPER SIMPLE: just push to array
const createProblem = async (req, res) => {
    try {
        const { 
            title, testId, markdown, statement,
            difficulty, timeLimit, memoryLimit, tags,
            inputFormat, outputFormat, constraints,
            testCases, starterCode, isPublic
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Get educator - basic lookup
        const educatorId = await getDummyEducatorId();
        if (!educatorId) {
            return res.status(500).json({ error: 'System error: educator not found' });
        }

        // Use markdown as statement if provided
        const problemStatement = statement || markdown || '';

        // Create problem - super simple
        const problem = new ProblemModel({
            creatorId: educatorId,
            creatorModel: 'admins',
            title,
            statement: problemStatement,
            difficulty: difficulty || 'easy',
            timeLimit: timeLimit || 1000,
            memoryLimit: memoryLimit || 256,
            tags: tags || [],
            inputFormat: inputFormat || '',
            outputFormat: outputFormat || '',
            constraints: constraints || '',
            testCases: testCases || [],
            starterCode: starterCode || {},
            isPublic: isPublic || false
        });

        await problem.save();

        // Push to array if testId provided - THAT'S IT!
        if (testId) {
            const test = await TestModel.findById(testId);
            if (test) {
                test.problems.push(problem._id);
                await test.save();
            }
        }

        res.status(201).json({
            success: true,
            msg: 'Problem created successfully',
            problem
        });
    } catch (error) {
        console.error('Create problem error:', error);
        res.status(500).json({ error: 'Failed to create problem: ' + error.message });
    }
};

// Get My Problems - no token required, returns all problems from dummy educator
const getMyProblems = async (req, res) => {
    try {
        const dummyEducatorId = await getDummyEducatorId();
        if (!dummyEducatorId) {
            return res.json({ success: true, problems: [] });
        }

        const problems = await ProblemModel.find({ 
            creatorId: dummyEducatorId,
            creatorModel: 'admins'
        })
            .sort({ createdAt: -1 });

        res.json({ success: true, problems });
    } catch (error) {
        console.error('Fetch problems error:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
};

// Get Problem by ID - no token required
const getProblemById = async (req, res) => {
    try {
        const problem = await ProblemModel.findById(req.params.id)
            .populate('creatorId', 'name email');

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Show all test cases (no auth check)
        res.json({ success: true, problem });
    } catch (error) {
        console.error('Get problem error:', error);
        res.status(500).json({ error: 'Failed to get problem' });
    }
};

// Update Problem - simplified: just find by ID
const updateProblem = async (req, res) => {
    try {
        const problem = await ProblemModel.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const allowedUpdates = [
            'title', 'difficulty', 'timeLimit', 'memoryLimit',
            'tags', 'statement', 'inputFormat', 'outputFormat',
            'constraints', 'testCases', 'starterCode', 'isPublic'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                problem[field] = req.body[field];
            }
        });

        await problem.save();

        res.json({ success: true, msg: 'Problem updated successfully', problem });
    } catch (error) {
        console.error('Update problem error:', error);
        res.status(500).json({ error: 'Failed to update problem' });
    }
};

// Delete Problem - simplified: just find by ID
const deleteProblem = async (req, res) => {
    try {
        const problem = await ProblemModel.findByIdAndDelete(req.params.id);

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        res.json({ success: true, msg: 'Problem deleted successfully' });
    } catch (error) {
        console.error('Delete problem error:', error);
        res.status(500).json({ error: 'Failed to delete problem' });
    }
};

// Get Public Problems
const getPublicProblems = async (req, res) => {
    try {
        const { difficulty, tags, page = 1, limit = 20 } = req.query;

        const query = { isPublic: true };

        if (difficulty) query.difficulty = difficulty;
        if (tags) query.tags = { $in: tags.split(',') };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [problems, total] = await Promise.all([
            ProblemModel.find(query)
                .select('-testCases')
                .populate('creatorId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ProblemModel.countDocuments(query)
        ]);

        res.json({
            success: true,
            problems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Fetch public problems error:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
};

module.exports = {
    createProblem,
    getMyProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
    getPublicProblems
};