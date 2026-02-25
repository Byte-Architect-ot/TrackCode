const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate contest times
const validateContestTimes = (startTime, endTime) => {
    const errors = [];
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime())) {
        errors.push('Invalid start time');
    }
    if (isNaN(end.getTime())) {
        errors.push('Invalid end time');
    }
    if (start <= now) {
        errors.push('Start time must be in the future');
    }
    if (end <= start) {
        errors.push('End time must be after start time');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Validate problem data
const validateProblem = (data) => {
    const errors = [];

    if (!data.title?.trim()) {
        errors.push('Title is required');
    }
    if (!data.statement?.trim()) {
        errors.push('Problem statement is required');
    }
    if (data.timeLimit && (data.timeLimit < 100 || data.timeLimit > 10000)) {
        errors.push('Time limit must be between 100ms and 10000ms');
    }
    if (data.memoryLimit && (data.memoryLimit < 16 || data.memoryLimit > 1024)) {
        errors.push('Memory limit must be between 16MB and 1024MB');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    isValidObjectId,
    isValidEmail,
    validateContestTimes,
    validateProblem
};