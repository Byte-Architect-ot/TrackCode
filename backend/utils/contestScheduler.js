const cron = require('node-cron');
const TestModel = require('../models/TestModel');
const TestRegistrationModel = require('../models/TestRegistrationModel');
const { processSubmission } = require('../controllers/testSessionController');

// Update contest phases every minute
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();

        // Start upcoming contests
        const startedCount = await TestModel.updateMany(
            { 
                phase: 'upcoming', 
                testTime: { $lte: now } 
            },
            { $set: { phase: 'running' } }
        );

        if (startedCount.modifiedCount > 0) {
            console.log(`[Scheduler] Started ${startedCount.modifiedCount} contest(s)`);
        }

        // End running contests and auto-submit
        const runningContests = await TestModel.find({ phase: 'running' });
        let endedCount = 0;

        for (const contest of runningContests) {
            const endTime = new Date(contest.testTime.getTime() + contest.totalTime * 60000);
            
            if (now >= endTime) {
                // Auto-submit all active students
                const activeRegistrations = await TestRegistrationModel.find({
                    testId: contest._id,
                    status: 'started'
                });

                for (const reg of activeRegistrations) {
                    try {
                        await processSubmission(contest._id.toString(), reg.userId.toString(), 'auto');
                        console.log(`[Scheduler] Auto-submitted for user ${reg.userId} in contest ${contest._id}`);
                    } catch (err) {
                        console.error(`[Scheduler] Failed to auto-submit for user ${reg.userId}:`, err.message);
                    }
                }

                contest.phase = 'completed';
                await contest.save();
                endedCount++;
            }
        }

        if (endedCount > 0) {
            console.log(`[Scheduler] Ended ${endedCount} contest(s)`);
        }
    } catch (error) {
        console.error('[Scheduler] Error:', error.message);
    }
});

// Clean up stale sessions every hour
cron.schedule('0 * * * *', async () => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        // Log inactive sessions (could be extended to notify users)
        const staleSessions = await TestRegistrationModel.countDocuments({
            status: 'started',
            updatedAt: { $lt: oneHourAgo }
        });

        if (staleSessions > 0) {
            console.log(`[Scheduler] Found ${staleSessions} stale test sessions`);
        }
    } catch (error) {
        console.error('[Scheduler] Cleanup error:', error.message);
    }
});

console.log('[Scheduler] Contest scheduler initialized');

module.exports = cron;