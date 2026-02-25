const TestModel = require('../models/TestModel');

const checkTestExists = async (req, res, next) => {
    try {
        const testId = req.body.testId || req.params.testId;

        if (!testId) {
            return res.status(400).json({ error: 'Test ID is required' });
        }

        const test = await TestModel.findById(testId);
        
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        req.test = test;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Error checking test' });
    }
};

const checkTestOwner = async (req, res, next) => {
    try {
        if (req.test.examTakerId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to modify this test' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Authorization check failed' });
    }
};

const checkTestPhase = (allowedPhases) => {
    return (req, res, next) => {
        if (!allowedPhases.includes(req.test.phase)) {
            return res.status(400).json({ 
                error: `Action not allowed. Contest is ${req.test.phase}` 
            });
        }
        next();
    };
};

module.exports = { checkTestExists, checkTestOwner, checkTestPhase };