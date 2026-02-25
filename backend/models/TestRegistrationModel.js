const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const TestRegistrationSchema = new Schema({
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
    registeredAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['registered', 'started', 'submitted', 'auto-submitted', 'disqualified'],
        default: 'registered'
    },
    startedAt: {
        type: Date
    },
    submittedAt: {
        type: Date
    },
    // Track if submission was manual or auto
    submissionType: {
        type: String,
        enum: ['manual', 'auto', 'none'],
        default: 'none'
    },
    // Access code used (if test requires one)
    accessCodeUsed: {
        type: String
    },
    // IP tracking for proctoring (optional)
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index - one registration per user per test
TestRegistrationSchema.index({ testId: 1, userId: 1 }, { unique: true });
TestRegistrationSchema.index({ testId: 1, status: 1 });
TestRegistrationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('TestRegistration', TestRegistrationSchema);