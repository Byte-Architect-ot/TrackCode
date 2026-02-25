const TestModel = require('../models/TestModel');
const TestRegistrationModel = require('../models/TestRegistrationModel');
const LiveResponseModel = require('../models/LiveResponseModel');
const QuestionModel = require('../models/QuestionModel');
const ProblemModel = require('../models/ProblemModel');
const SubmissionHistoryModel = require('../models/SubmissionHistoryModel');
const TestResultModel = require('../models/TestResultModel');

// Register for a test
const registerForTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { accessCode } = req.body;
        const userId = req.userId;

        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        // Check if test is upcoming or running
        if (test.phase === 'completed') {
            return res.status(400).json({ error: 'Test has already ended' });
        }

        // Check access code if test is private
        if (test.isPrivate && test.accessCode) {
            if (accessCode !== test.accessCode) {
                return res.status(403).json({ error: 'Invalid access code' });
            }
        }

        // Check if already registered
        const existingReg = await TestRegistrationModel.findOne({ testId, userId });
        if (existingReg) {
            return res.status(400).json({ error: 'Already registered for this test' });
        }

        // Create registration
        const registration = await TestRegistrationModel.create({
            testId,
            userId,
            accessCodeUsed: accessCode,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        // Also add to test.students array for backward compatibility
        await TestModel.findByIdAndUpdate(testId, {
            $addToSet: { students: userId }
        });

        res.status(201).json({
            success: true,
            msg: 'Successfully registered for test',
            registration: {
                id: registration._id,
                status: registration.status,
                registeredAt: registration.registeredAt
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Already registered for this test' });
        }
        console.error('Register for test error:', error);
        res.status(500).json({ error: 'Failed to register for test' });
    }
};

// Start test - called when student clicks "Start Test"
const startTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;

        const test = await TestModel.findById(testId)
            .populate('questions')
            .populate('problems');

        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        if (test.phase !== 'running') {
            return res.status(400).json({ 
                error: test.phase === 'upcoming' 
                    ? 'Test has not started yet' 
                    : 'Test has ended'
            });
        }

        // Find registration
        const registration = await TestRegistrationModel.findOne({ testId, userId });
        if (!registration) {
            return res.status(403).json({ error: 'Not registered for this test' });
        }

        // Check if already submitted
        if (registration.status === 'submitted' || registration.status === 'auto-submitted') {
            return res.status(400).json({ error: 'Already submitted this test' });
        }

        // Initialize or get live response
        let liveResponse = await LiveResponseModel.findOne({ testId, userId });

        if (!liveResponse) {
            // Initialize MCQ responses
            const mcqResponses = test.questions.map(q => ({
                questionId: q._id,
                selectedOptionId: null,
                selectedOptionIds: [],
                isAnswered: false,
                isMarkedForReview: false,
                timeSpent: 0
            }));

            // Initialize coding responses
            const codingResponses = test.problems.map(p => ({
                problemId: p._id,
                code: p.starterCodes?.find(sc => sc.language === 'cpp')?.code || '',
                language: 'cpp',
                languageId: 54,
                isAttempted: false,
                isMarkedForReview: false,
                sampleTestResults: [],
                timeSpent: 0
            }));

            liveResponse = await LiveResponseModel.create({
                testId,
                userId,
                registrationId: registration._id,
                mcqResponses,
                codingResponses
            });

            // Update registration status
            registration.status = 'started';
            registration.startedAt = new Date();
            await registration.save();
        }

        // Calculate remaining time
        const endTime = new Date(test.testTime.getTime() + test.totalTime * 60000);
        const remainingTime = Math.max(0, Math.floor((endTime - new Date()) / 1000));

        // Prepare questions (hide correct answers)
        const questions = test.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options.map(opt => ({
                _id: opt._id,
                text: opt.text
            })),
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            imageUrl: q.imageUrl
        }));

        // Prepare problems (hide hidden test cases and solution)
        const problems = test.problems.map(p => ({
            _id: p._id,
            title: p.title,
            slug: p.slug,
            difficulty: p.difficulty,
            statement: p.statement,
            inputFormat: p.inputFormat,
            outputFormat: p.outputFormat,
            constraints: p.constraints,
            timeLimit: p.timeLimit,
            memoryLimit: p.memoryLimit,
            testCases: p.testCases.filter(tc => tc.isSample || !tc.isHidden),
            starterCodes: p.starterCodes,
            maxScore: p.maxScore
        }));

        res.json({
            success: true,
            test: {
                _id: test._id,
                title: test.title,
                description: test.description,
                totalTime: test.totalTime,
                remainingTime,
                endTime,
                contestType: test.contestType,
                shuffleQuestions: test.shuffleQuestions
            },
            questions,
            problems,
            liveResponse: {
                _id: liveResponse._id,
                mcqResponses: liveResponse.mcqResponses,
                codingResponses: liveResponse.codingResponses,
                currentQuestionIndex: liveResponse.currentQuestionIndex,
                currentSection: liveResponse.currentSection
            }
        });
    } catch (error) {
        console.error('Start test error:', error);
        res.status(500).json({ error: 'Failed to start test' });
    }
};

// Save MCQ response (autosave)
const saveMcqResponse = async (req, res) => {
    try {
        const { testId } = req.params;
        const { questionId, selectedOptionId, selectedOptionIds, isMarkedForReview } = req.body;
        const userId = req.userId;

        const liveResponse = await LiveResponseModel.findOne({ testId, userId });
        if (!liveResponse) {
            return res.status(404).json({ error: 'Test session not found' });
        }

        if (liveResponse.isSubmitted) {
            return res.status(400).json({ error: 'Test already submitted' });
        }

        // Find and update the MCQ response
        const mcqResponse = liveResponse.mcqResponses.find(
            r => r.questionId.toString() === questionId
        );

        if (!mcqResponse) {
            return res.status(404).json({ error: 'Question not found in test' });
        }

        if (selectedOptionId !== undefined) {
            mcqResponse.selectedOptionId = selectedOptionId;
            mcqResponse.isAnswered = selectedOptionId !== null;
        }
        if (selectedOptionIds !== undefined) {
            mcqResponse.selectedOptionIds = selectedOptionIds;
            mcqResponse.isAnswered = selectedOptionIds.length > 0;
        }
        if (isMarkedForReview !== undefined) {
            mcqResponse.isMarkedForReview = isMarkedForReview;
        }
        mcqResponse.lastUpdated = new Date();

        liveResponse.lastActiveAt = new Date();
        await liveResponse.save();

        res.json({
            success: true,
            msg: 'Response saved',
            savedAt: mcqResponse.lastUpdated
        });
    } catch (error) {
        console.error('Save MCQ response error:', error);
        res.status(500).json({ error: 'Failed to save response' });
    }
};

// Save coding response (autosave)
const saveCodingResponse = async (req, res) => {
    try {
        const { testId } = req.params;
        const { problemId, code, language, languageId, isMarkedForReview } = req.body;
        const userId = req.userId;

        const liveResponse = await LiveResponseModel.findOne({ testId, userId });
        if (!liveResponse) {
            return res.status(404).json({ error: 'Test session not found' });
        }

        if (liveResponse.isSubmitted) {
            return res.status(400).json({ error: 'Test already submitted' });
        }

        // Find and update the coding response
        const codingResponse = liveResponse.codingResponses.find(
            r => r.problemId.toString() === problemId
        );

        if (!codingResponse) {
            return res.status(404).json({ error: 'Problem not found in test' });
        }

        if (code !== undefined) {
            codingResponse.code = code;
            codingResponse.isAttempted = code.trim().length > 0;
        }
        if (language !== undefined) {
            codingResponse.language = language;
        }
        if (languageId !== undefined) {
            codingResponse.languageId = languageId;
        }
        if (isMarkedForReview !== undefined) {
            codingResponse.isMarkedForReview = isMarkedForReview;
        }
        codingResponse.lastUpdated = new Date();
        codingResponse.lastAutoSaved = new Date();

        liveResponse.lastActiveAt = new Date();
        await liveResponse.save();

        res.json({
            success: true,
            msg: 'Code saved',
            savedAt: codingResponse.lastAutoSaved
        });
    } catch (error) {
        console.error('Save coding response error:', error);
        res.status(500).json({ error: 'Failed to save code' });
    }
};

// Update navigation state
const updateNavigation = async (req, res) => {
    try {
        const { testId } = req.params;
        const { currentQuestionIndex, currentSection, tabSwitchCount, focusLostCount } = req.body;
        const userId = req.userId;

        const liveResponse = await LiveResponseModel.findOne({ testId, userId });
        if (!liveResponse) {
            return res.status(404).json({ error: 'Test session not found' });
        }

        if (currentQuestionIndex !== undefined) {
            liveResponse.currentQuestionIndex = currentQuestionIndex;
        }
        if (currentSection !== undefined) {
            liveResponse.currentSection = currentSection;
        }
        if (tabSwitchCount !== undefined) {
            liveResponse.tabSwitchCount = tabSwitchCount;
        }
        if (focusLostCount !== undefined) {
            liveResponse.focusLostCount = focusLostCount;
        }
        liveResponse.lastActiveAt = new Date();

        await liveResponse.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Update navigation error:', error);
        res.status(500).json({ error: 'Failed to update navigation' });
    }
};

// Submit test (manual submission)
const submitTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;

        const result = await processSubmission(testId, userId, 'manual');

        res.json({
            success: true,
            msg: 'Test submitted successfully',
            result
        });
    } catch (error) {
        console.error('Submit test error:', error);
        res.status(500).json({ error: error.message || 'Failed to submit test' });
    }
};

// Auto-submit test (called by scheduler or when timer ends)
const autoSubmitTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;

        const result = await processSubmission(testId, userId, 'auto');

        res.json({
            success: true,
            msg: 'Test auto-submitted',
            result
        });
    } catch (error) {
        console.error('Auto-submit test error:', error);
        res.status(500).json({ error: error.message || 'Failed to auto-submit test' });
    }
};

// Process submission (shared logic)
async function processSubmission(testId, userId, submissionType) {
    const test = await TestModel.findById(testId);
    if (!test) {
        throw new Error('Test not found');
    }

    const registration = await TestRegistrationModel.findOne({ testId, userId });
    if (!registration) {
        throw new Error('Not registered for this test');
    }

    if (registration.status === 'submitted' || registration.status === 'auto-submitted') {
        throw new Error('Test already submitted');
    }

    const liveResponse = await LiveResponseModel.findOne({ testId, userId });
    if (!liveResponse) {
        throw new Error('No test session found');
    }

    // Calculate MCQ score
    const mcqResult = await liveResponse.calculateMcqScore();

    // Process coding submissions and calculate scores
    let codingMarks = 0;
    let problemsSolved = 0;
    let problemsAttempted = 0;

    for (const codingResponse of liveResponse.codingResponses) {
        if (codingResponse.isAttempted) {
            problemsAttempted++;

            // Create submission record
            const problem = await ProblemModel.findById(codingResponse.problemId);
            
            // Add to submission history
            let history = await SubmissionHistoryModel.findOne({ userId });
            if (!history) {
                history = new SubmissionHistoryModel({ userId, submissions: [] });
            }

            const submission = {
                testId,
                problemId: codingResponse.problemId,
                code: codingResponse.code,
                language: codingResponse.language,
                languageId: codingResponse.languageId,
                verdict: 'Pending', // Will be updated by judge
                submittedAt: new Date()
            };

            history.submissions.push(submission);
            await history.save();

            // TODO: Trigger judge evaluation for hidden test cases
            // This would be done via message queue to backend-ts
        }
    }

    // Calculate total time taken
    const timeTaken = registration.startedAt 
        ? Math.floor((new Date() - registration.startedAt) / 1000)
        : 0;

    // Update registration
    registration.status = submissionType === 'auto' ? 'auto-submitted' : 'submitted';
    registration.submittedAt = new Date();
    registration.submissionType = submissionType;
    await registration.save();

    // Update live response
    liveResponse.isSubmitted = true;
    liveResponse.submittedAt = new Date();
    await liveResponse.save();

    // Update or create test result
    let testResult = await TestResultModel.findOne({ testId });
    if (!testResult) {
        testResult = new TestResultModel({
            testId,
            results: []
        });
    }

    // Check if user result already exists
    const existingResultIndex = testResult.results.findIndex(
        r => r.userId.toString() === userId.toString()
    );

    const userResult = {
        userId,
        mcqMarks: mcqResult.score,
        codingMarks,
        totalMarks: mcqResult.score + codingMarks,
        timeTaken,
        submittedAt: new Date(),
        mcqCorrect: mcqResult.correct,
        mcqWrong: mcqResult.wrong,
        mcqUnanswered: mcqResult.unanswered,
        problemsSolved,
        problemsAttempted
    };

    if (existingResultIndex >= 0) {
        testResult.results[existingResultIndex] = userResult;
    } else {
        testResult.results.push(userResult);
    }

    // Recalculate aggregate stats
    testResult.totalParticipants = testResult.results.length;
    const scores = testResult.results.map(r => r.totalMarks);
    testResult.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    testResult.highestScore = Math.max(...scores);
    testResult.lowestScore = Math.min(...scores);

    // Calculate ranks
    testResult.results.sort((a, b) => {
        if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks;
        return a.timeTaken - b.timeTaken; // Faster time wins tie
    });

    testResult.results.forEach((r, index) => {
        r.rank = index + 1;
        r.percentile = Math.round(((testResult.results.length - r.rank) / testResult.results.length) * 100);
    });

    await testResult.save();

    return {
        mcqMarks: mcqResult.score,
        mcqCorrect: mcqResult.correct,
        mcqWrong: mcqResult.wrong,
        mcqUnanswered: mcqResult.unanswered,
        codingMarks,
        totalMarks: mcqResult.score + codingMarks,
        timeTaken,
        submissionType
    };
}

// Get test status for student
const getTestStatus = async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;

        const test = await TestModel.findById(testId).select('title phase testTime totalTime');
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        const registration = await TestRegistrationModel.findOne({ testId, userId });
        const liveResponse = await LiveResponseModel.findOne({ testId, userId });

        const endTime = new Date(test.testTime.getTime() + test.totalTime * 60000);
        const remainingTime = Math.max(0, Math.floor((endTime - new Date()) / 1000));

        res.json({
            success: true,
            test: {
                _id: test._id,
                title: test.title,
                phase: test.phase,
                remainingTime,
                endTime
            },
            registration: registration ? {
                status: registration.status,
                registeredAt: registration.registeredAt,
                startedAt: registration.startedAt,
                submittedAt: registration.submittedAt
            } : null,
            hasLiveSession: !!liveResponse,
            isSubmitted: liveResponse?.isSubmitted || false
        });
    } catch (error) {
        console.error('Get test status error:', error);
        res.status(500).json({ error: 'Failed to get test status' });
    }
};

// Get student's registered tests grouped by status
const getMyTests = async (req, res) => {
    try {
        const userId = req.userId;

        const registrations = await TestRegistrationModel.find({ userId })
            .populate({
                path: 'testId',
                populate: { path: 'examTakerId', select: 'name email' }
            })
            .sort({ registeredAt: -1 });

        const now = new Date();
        const tests = {
            upcoming: [],
            running: [],
            previous: []
        };

        for (const reg of registrations) {
            if (!reg.testId) continue;

            const test = reg.testId;
            const endTime = new Date(test.testTime.getTime() + test.totalTime * 60000);

            const testData = {
                _id: test._id,
                title: test.title,
                description: test.description,
                startTime: test.testTime,
                endTime,
                duration: test.totalTime,
                creator: test.examTakerId,
                registrationStatus: reg.status,
                registeredAt: reg.registeredAt
            };

            if (now < test.testTime) {
                tests.upcoming.push(testData);
            } else if (now >= test.testTime && now < endTime && test.phase === 'running') {
                tests.running.push(testData);
            } else {
                tests.previous.push(testData);
            }
        }

        res.json({ success: true, tests });
    } catch (error) {
        console.error('Get my tests error:', error);
        res.status(500).json({ error: 'Failed to get tests' });
    }
};

module.exports = {
    registerForTest,
    startTest,
    saveMcqResponse,
    saveCodingResponse,
    updateNavigation,
    submitTest,
    autoSubmitTest,
    getTestStatus,
    getMyTests,
    processSubmission
};