const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const submissionSchema = new Schema({
    testId: {
        type: ObjectId,
        ref: 'Test',
        required: true
    },
    problemId: {
        type: ObjectId,
        ref: 'Problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    languageId: {
        type: Number,
        required: true
    },
    s3Url: {
        type: String
    },
    verdict: {
        type: String,
        required: true,
        enum: [
            'Accepted',
            'Wrong Answer',
            'Time Limit Exceeded',
            'Memory Limit Exceeded',
            'Runtime Error',
            'Compilation Error',
            'Pending'
        ]
    },
    executionTime: {
        type: Number // in ms
    },
    memoryUsed: {
        type: Number // in KB
    },
    marks: {
        type: Number,
        default: 0
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    totalTestCases: {
        type: Number,
        default: 0
    },
    errorMessage: {
        type: String
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const SubmissionHistorySchema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'users',
        required: true
    },
    submissions: [submissionSchema]
}, {
    timestamps: true
});

// Index for efficient queries
SubmissionHistorySchema.index({ userId: 1 });
SubmissionHistorySchema.index({ 'submissions.testId': 1 });
SubmissionHistorySchema.index({ 'submissions.problemId': 1 });

module.exports = mongoose.model('SubmissionHistory', SubmissionHistorySchema);