const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const userResultSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'users',
        required: true
    },
    mcqMarks: {
        type: Number,
        default: 0
    },
    codingMarks: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number
    },
    percentile: {
        type: Number
    },
    timeTaken: {
        type: Number, // in seconds
        default: 0
    },
    submittedAt: {
        type: Date
    },
    // Detailed breakdown
    mcqCorrect: {
        type: Number,
        default: 0
    },
    mcqWrong: {
        type: Number,
        default: 0
    },
    mcqUnanswered: {
        type: Number,
        default: 0
    },
    problemsSolved: {
        type: Number,
        default: 0
    },
    problemsAttempted: {
        type: Number,
        default: 0
    }
}, { _id: false });

const TestResultSchema = new Schema({
    testId: {
        type: ObjectId,
        ref: 'Test',
        required: true,
        unique: true
    },
    totalParticipants: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    },
    highestScore: {
        type: Number,
        default: 0
    },
    lowestScore: {
        type: Number,
        default: 0
    },
    results: [userResultSchema],
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// testId already has unique: true in schema

module.exports = mongoose.model('TestResult', TestResultSchema);