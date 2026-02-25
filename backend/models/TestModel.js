const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const TestSchema = new Schema({
    examTakerId: {
        type: ObjectId,
        refPath: 'examTakerModel',
        required: true
    },
    examTakerModel: {
        type: String,
        enum: ['users', 'admins'],
        default: 'users'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    // MCQ Questions
    questions: [{
        type: ObjectId,
        ref: 'Question'
    }],
    // Coding Problems
    problems: [{
        type: ObjectId,
        ref: 'Problem'
    }],
    // Enrolled students
    students: [{
        type: ObjectId,
        ref: 'users'
    }],
    totalMarks: {
        type: Number,
        default: 0
    },
    passingMarks: {
        type: Number,
        default: 0
    },
    // Timing
    testTime: {
        type: Date,
        required: true
    },
    totalTime: {
        type: Number,
        required: true,
        min: 1 // in minutes
    },
    // Contest phases
    phase: {
        type: String,
        enum: ['upcoming', 'running', 'completed'],
        default: 'upcoming'
    },
    examTakerPhase: {
        type: String,
        enum: ['draft', 'finalized'],
        default: 'draft'
    },
    // Settings
    publishResult: {
        type: Boolean,
        default: false
    },
    allowLateSubmission: {
        type: Boolean,
        default: false
    },
    shuffleQuestions: {
        type: Boolean,
        default: false
    },
    showLeaderboard: {
        type: Boolean,
        default: true
    },
    // Contest type
    contestType: {
        type: String,
        enum: ['mcq', 'coding', 'mixed'],
        default: 'mixed'
    },
    // Access control
    accessCode: {
        type: String,
        default: null
    },
    isPrivate: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual for end time
TestSchema.virtual('endTime').get(function() {
    if (this.testTime && this.totalTime) {
        return new Date(this.testTime.getTime() + this.totalTime * 60000);
    }
    return null;
});

// Virtual for contest status
TestSchema.virtual('status').get(function() {
    const now = new Date();
    if (now < this.testTime) return 'upcoming';
    if (now > this.endTime) return 'completed';
    return 'running';
});

// Index for efficient queries
TestSchema.index({ examTakerId: 1, phase: 1 });
TestSchema.index({ testTime: 1, phase: 1 });
TestSchema.index({ publishResult: 1, phase: 1 });

module.exports = mongoose.model('Test', TestSchema);