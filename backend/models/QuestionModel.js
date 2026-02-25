const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const optionSchema = new Schema({
    _id: {
        type: ObjectId,
        default: () => new Types.ObjectId()
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    isCorrect: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const QuestionSchema = new Schema({
    examTakerId: {
        type: ObjectId,
        required: true,
        refPath: 'examTakerModel'
    },
    examTakerModel: {
        type: String,
        enum: ['users', 'admins'],
        default: 'admins'
    },
    testId: {
        type: ObjectId,
        required: true,
        ref: 'Test'
    },
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    questionType: {
        type: String,
        enum: ['single', 'multiple', 'true_false'],
        default: 'single'
    },
    options: {
        type: [optionSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v.length >= 2 && v.length <= 6;
            },
            message: 'Options must be between 2 and 6'
        }
    },
    correctAnswer: {
        type: ObjectId,
        required: true,
        validate: {
            validator: function(val) {
                return this.options.some(opt => opt._id.equals(val));
            },
            message: 'Correct answer must be from options'
        }
    },
    // For multiple correct answers
    correctAnswers: [{
        type: ObjectId
    }],
    marks: {
        type: Number,
        required: true,
        default: 1,
        min: 0
    },
    negativeMarks: {
        type: Number,
        default: 0,
        min: 0
    },
    explanation: {
        type: String,
        default: ''
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    tags: [{
        type: String,
        trim: true
    }],
    imageUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for efficient queries
QuestionSchema.index({ testId: 1 });
QuestionSchema.index({ examTakerId: 1 });

module.exports = mongoose.model('Question', QuestionSchema);