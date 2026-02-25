const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

// MCQ Response subdocument
const mcqResponseSchema = new Schema({
    questionId: {
        type: ObjectId,
        ref: 'Question',
        required: true
    },
    selectedOptionId: {
        type: ObjectId,
        default: null
    },
    // For multiple choice questions
    selectedOptionIds: [{
        type: ObjectId
    }],
    isAnswered: {
        type: Boolean,
        default: false
    },
    isMarkedForReview: {
        type: Boolean,
        default: false
    },
    timeSpent: {
        type: Number, // seconds spent on this question
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

// Coding Response subdocument
const codingResponseSchema = new Schema({
    problemId: {
        type: ObjectId,
        ref: 'Problem',
        required: true
    },
    code: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        default: 'cpp'
    },
    languageId: {
        type: Number,
        default: 54 // C++ in Judge0
    },
    isAttempted: {
        type: Boolean,
        default: false
    },
    isMarkedForReview: {
        type: Boolean,
        default: false
    },
    // Track sample test runs
    sampleTestResults: [{
        testCaseIndex: Number,
        passed: Boolean,
        output: String,
        expectedOutput: String,
        executionTime: Number,
        runAt: { type: Date, default: Date.now }
    }],
    timeSpent: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    // Last autosave timestamp
    lastAutoSaved: {
        type: Date
    }
}, { _id: false });

const LiveResponseSchema = new Schema({
    testId: {
        type: ObjectId,
        ref: 'Test',
        required: true
    },
    userId: {
        type: ObjectId,
        ref: 'users',
        required: true
    },
    registrationId: {
        type: ObjectId,
        ref: 'TestRegistration',
        required: true
    },
    // MCQ Responses
    mcqResponses: [mcqResponseSchema],
    // Coding Responses
    codingResponses: [codingResponseSchema],
    // Current question tracking
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    currentSection: {
        type: String,
        enum: ['mcq', 'coding'],
        default: 'mcq'
    },
    // Time tracking
    totalTimeSpent: {
        type: Number, // in seconds
        default: 0
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    // Tab switch / focus tracking (for proctoring)
    tabSwitchCount: {
        type: Number,
        default: 0
    },
    focusLostCount: {
        type: Number,
        default: 0
    },
    // Final submission status
    isSubmitted: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index - one live response per user per test
LiveResponseSchema.index({ testId: 1, userId: 1 }, { unique: true });
LiveResponseSchema.index({ registrationId: 1 });

// Method to get MCQ response by questionId
LiveResponseSchema.methods.getMcqResponse = function(questionId) {
    return this.mcqResponses.find(r => r.questionId.toString() === questionId.toString());
};

// Method to get coding response by problemId
LiveResponseSchema.methods.getCodingResponse = function(problemId) {
    return this.codingResponses.find(r => r.problemId.toString() === problemId.toString());
};

// Method to calculate current score (without hidden test results)
LiveResponseSchema.methods.calculateMcqScore = async function() {
    const Question = mongoose.model('Question');
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    for (const response of this.mcqResponses) {
        if (!response.isAnswered) {
            unanswered++;
            continue;
        }

        const question = await Question.findById(response.questionId);
        if (!question) continue;

        if (question.questionType === 'multiple') {
            // Multiple correct answers
            const correctSet = new Set(question.correctAnswers.map(id => id.toString()));
            const selectedSet = new Set(response.selectedOptionIds.map(id => id.toString()));
            
            if (correctSet.size === selectedSet.size && 
                [...correctSet].every(id => selectedSet.has(id))) {
                score += question.marks;
                correct++;
            } else {
                score -= question.negativeMarks || 0;
                wrong++;
            }
        } else {
            // Single correct answer
            if (response.selectedOptionId && 
                response.selectedOptionId.toString() === question.correctAnswer.toString()) {
                score += question.marks;
                correct++;
            } else {
                score -= question.negativeMarks || 0;
                wrong++;
            }
        }
    }

    return { score, correct, wrong, unanswered };
};

module.exports = mongoose.model('LiveResponse', LiveResponseSchema);