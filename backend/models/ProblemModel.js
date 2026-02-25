const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const testCaseSchema = new Schema({
    input: { 
        type: String, 
        required: true 
    },
    expectedOutput: { 
        type: String, 
        required: true 
    },
    isHidden: { 
        type: Boolean, 
        default: false 
    },
    isSample: {
        type: Boolean,
        default: false
    },
    explanation: { 
        type: String,
        default: ''
    },
    weight: {
        type: Number,
        default: 1 // For partial scoring
    }
}, { _id: true });

const starterCodeSchema = new Schema({
    language: {
        type: String,
        required: true
    },
    languageId: {
        type: Number,
        required: true
    },
    code: {
        type: String,
        required: true
    }
}, { _id: false });

const ProblemSchema = new Schema({
    creatorId: {
        type: Types.ObjectId,
        refPath: 'creatorModel',
        required: true
    },
    creatorModel: {
        type: String,
        enum: ['users', 'admins'],
        default: 'admins'
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'easy'
    },
    timeLimit: {
        type: Number,
        default: 1000, // in ms
        min: 100,
        max: 10000
    },
    memoryLimit: {
        type: Number,
        default: 256, // in MB
        min: 16,
        max: 1024
    },
    tags: [{
        type: String,
        trim: true
    }],
    // Problem content
    statement: {
        type: String,
        required: true
    },
    inputFormat: {
        type: String,
        default: ''
    },
    outputFormat: {
        type: String,
        default: ''
    },
    constraints: {
        type: String,
        default: ''
    },
    // Test cases
    testCases: [testCaseSchema],
    // Starter code for different languages
    starterCodes: [starterCodeSchema],
    // Solution (hidden)
    solution: {
        type: String,
        default: ''
    },
    solutionLanguage: {
        type: String,
        default: 'cpp'
    },
    // Editorial
    editorial: {
        type: String,
        default: ''
    },
    // Hints
    hints: [{
        type: String
    }],
    // Stats
    totalSubmissions: {
        type: Number,
        default: 0
    },
    acceptedSubmissions: {
        type: Number,
        default: 0
    },
    // Visibility
    isPublic: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Scoring
    maxScore: {
        type: Number,
        default: 100
    },
    partialScoring: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Generate slug from title
ProblemSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
    }
    next();
});

// Virtual for acceptance rate
ProblemSchema.virtual('acceptanceRate').get(function() {
    if (this.totalSubmissions === 0) return 0;
    return Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100);
});

// Index for search (tags excluded - array fields incompatible with text index)
ProblemSchema.index({ title: 'text' });
ProblemSchema.index({ creatorId: 1 });
ProblemSchema.index({ difficulty: 1, isPublic: 1 });
// slug already has unique: true in schema

module.exports = mongoose.model('Problem', ProblemSchema);