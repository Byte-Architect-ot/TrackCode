const QuestionModel = require('../models/QuestionModel');
const TestModel = require('../models/TestModel');
const { AdminModel } = require('../models/AdminModel');
const mongoose = require('mongoose');

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

// Create Question - SUPER SIMPLE: just push to array
const createQuestion = async (req, res) => {
    try {
        const { testId, questionText, options, correctAnswerText, marks } = req.body;

        console.log('Create question request:', { testId, questionText: questionText?.substring(0, 50), optionsCount: options?.length, correctAnswerText });

        if (!testId || !questionText || !options || !correctAnswerText) {
            return res.status(400).json({ error: 'Missing required fields', received: { testId: !!testId, questionText: !!questionText, options: !!options, correctAnswerText: !!correctAnswerText } });
        }

        // Get test and educator - basic lookup
        const [test, educatorId] = await Promise.all([
            TestModel.findById(testId),
            getDummyEducatorId()
        ]);

        if (!test) {
            return res.status(404).json({ error: `Test not found with ID: ${testId}` });
        }
        if (!educatorId) {
            return res.status(500).json({ error: 'System error: educator not found' });
        }

        // Create options with IDs - handle both {text: '...'} and plain strings
        const optionsWithIds = options.map(opt => ({
            _id: new mongoose.Types.ObjectId(),
            text: (typeof opt === 'string' ? opt : (opt.text || opt)).trim()
        }));

        // Find correct answer
        const correctAnswerTrimmed = correctAnswerText.trim();
        const correctOption = optionsWithIds.find(opt => 
            opt.text === correctAnswerTrimmed
        );
        
        if (!correctOption) {
            console.error('Correct answer mismatch:', { 
                correctAnswerText, 
                options: optionsWithIds.map(o => o.text) 
            });
            return res.status(400).json({ 
                error: 'Correct answer must match an option exactly',
                received: correctAnswerText,
                available: optionsWithIds.map(o => o.text)
            });
        }

        // Create question - super simple
        const question = new QuestionModel({
            examTakerId: educatorId,
            examTakerModel: 'admins',
            testId,
            questionText: questionText.trim(),
            options: optionsWithIds,
            correctAnswer: correctOption._id,
            marks: marks || 1
        });

        await question.save();

        // Push to array - THAT'S IT!
        test.questions.push(question._id);
        test.totalMarks = (test.totalMarks || 0) + (marks || 1);
        await test.save();

        console.log('Question created successfully:', question._id);

        res.status(201).json({
            success: true,
            msg: 'Question added successfully',
            question
        });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ error: 'Failed to create question: ' + error.message });
    }
};

// Get All Questions for a Test
const getQuestionsByTest = async (req, res) => {
    try {
        const { testId } = req.body;

        const questions = await QuestionModel.find({ testId })
            .sort({ createdAt: 1 });

        res.json({ success: true, questions });
    } catch (error) {
        console.error('Fetch questions error:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
};

// Update Question - simplified: just find by ID
const updateQuestion = async (req, res) => {
    try {
        const { questionText, options, correctAnswerText, marks } = req.body;

        const question = await QuestionModel.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        if (questionText) question.questionText = questionText;
        if (options) question.options = options;
        if (marks) question.marks = marks;

        if (correctAnswerText && options) {
            const correctOption = options.find(opt => opt.text.trim() === correctAnswerText.trim());
            if (!correctOption) {
                return res.status(400).json({ error: 'Correct answer must match one of the options' });
            }
            question.correctAnswer = correctOption._id;
        }

        await question.save();

        res.json({ success: true, msg: 'Question updated successfully', question });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
};

// Delete Question - simplified: just find by ID
const deleteQuestion = async (req, res) => {
    try {
        const question = await QuestionModel.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Remove from test
        await TestModel.updateOne(
            { _id: question.testId },
            { 
                $pull: { questions: question._id },
                $inc: { totalMarks: -(question.marks || 1) }
            }
        );

        res.json({ success: true, msg: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
};

module.exports = {
    createQuestion,
    getQuestionsByTest,
    updateQuestion,
    deleteQuestion
};