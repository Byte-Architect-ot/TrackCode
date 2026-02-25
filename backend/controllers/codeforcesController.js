const CodeforcesService = require('../services/codeforcesService');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const { handle } = req.params;

        const [user, submissions] = await Promise.all([
            CodeforcesService.getUserInfo(handle),
            CodeforcesService.getUserSubmissions(handle)
        ]);

        const { solved, easy, medium, hard } = CodeforcesService.analyzeSolvedProblems(submissions);

        res.json({
            status: 'success',
            handle: user.handle,
            rating: user.rating || 0,
            max_rating: user.maxRating || 0,
            rank: user.rank || 'unrated',
            problems_solved: solved.size,
            difficulty: { easy, medium, hard },
            platform: 'codeforces'
        });
    } catch (error) {
        console.error('CF profile error:', error.message);
        res.status(500).json({ status: 'error', error: error.message });
    }
};

// Get Upsolve Data
const getUpsolveData = async (req, res) => {
    const { handle } = req.params;

    try {
        const [ratingHistory, submissions] = await Promise.all([
            CodeforcesService.getUserRating(handle),
            CodeforcesService.getUserSubmissions(handle)
        ]);

        // Group submissions by contest
        const submissionsByContest = new Map();
        submissions.forEach(sub => {
            if (!sub.problem?.contestId) return;
            const contestId = sub.problem.contestId;

            if (!submissionsByContest.has(contestId)) {
                submissionsByContest.set(contestId, new Map());
            }

            const contestSubs = submissionsByContest.get(contestId);
            const problemKey = sub.problem.index;

            if (!contestSubs.has(problemKey)) {
                contestSubs.set(problemKey, { 
                    problem: sub.problem, 
                    solved: false, 
                    firstSolveTime: null, 
                    attempts: 0 
                });
            }

            const probData = contestSubs.get(problemKey);
            if (sub.verdict === 'OK') {
                if (!probData.solved || sub.creationTimeSeconds < probData.firstSolveTime) {
                    probData.solved = true;
                    probData.firstSolveTime = sub.creationTimeSeconds;
                }
            } else if (!probData.solved) {
                probData.attempts++;
            }
        });

        const sortedContests = [...ratingHistory].reverse();
        const upsolveData = [];
        const batchSize = 5;

        for (let i = 0; i < sortedContests.length; i += batchSize) {
            const batch = sortedContests.slice(i, i + batchSize);

            const batchPromises = batch.map(async (contest) => {
                try {
                    const standings = await CodeforcesService.getContestStandings(contest.contestId);
                    const contestInfo = standings.contest;
                    const contestEndTime = contestInfo.startTimeSeconds + contestInfo.durationSeconds;
                    const contestProblems = standings.problems || [];
                    const userContestSubs = submissionsByContest.get(contest.contestId) || new Map();

                    const problems = contestProblems.map(prob => {
                        const userData = userContestSubs.get(prob.index);
                        let status = 'pending', attempts = 0;

                        if (userData) {
                            attempts = userData.attempts;
                            if (userData.solved) {
                                status = userData.firstSolveTime <= contestEndTime 
                                    ? 'solved_in_contest' 
                                    : 'upsolved';
                            } else if (userData.attempts > 0) {
                                status = 'attempted';
                            }
                        }

                        return {
                            contestId: prob.contestId,
                            index: prob.index,
                            name: prob.name,
                            rating: prob.rating || null,
                            tags: prob.tags || [],
                            status,
                            attempts,
                            problemUrl: `https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`
                        };
                    });

                    const solvedCount = problems.filter(
                        p => p.status === 'solved_in_contest' || p.status === 'upsolved'
                    ).length;

                    return {
                        contestId: contest.contestId,
                        contestName: contest.contestName,
                        rank: contest.rank,
                        ratingChange: contest.newRating - contest.oldRating,
                        newRating: contest.newRating,
                        date: new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString(),
                        totalProblems: problems.length,
                        solvedCount,
                        upsolveRemaining: problems.length - solvedCount,
                        problems,
                        contestUrl: `https://codeforces.com/contest/${contest.contestId}`
                    };
                } catch {
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            upsolveData.push(...batchResults.filter(r => r !== null));

            if (i + batchSize < sortedContests.length) {
                await delay(250);
            }
        }

        res.json({ 
            status: 'success', 
            handle, 
            platform: 'codeforces', 
            totalContests: upsolveData.length, 
            upsolveData 
        });
    } catch (error) {
        console.error('CF upsolve error:', error.message);
        res.json({ status: 'error', error: error.message, upsolveData: [] });
    }
};

// Get Tag Analysis
const getTagAnalysis = async (req, res) => {
    const { handle } = req.params;

    try {
        const submissions = await CodeforcesService.getUserSubmissions(handle);
        const tagAnalysis = CodeforcesService.analyzeTagStats(submissions);

        res.json({ 
            status: 'success', 
            handle, 
            platform: 'codeforces', 
            tagAnalysis 
        });
    } catch (error) {
        console.error('CF tags error:', error.message);
        res.json({ status: 'error', tagAnalysis: [] });
    }
};

// Get Recommendations
const getRecommendations = async (req, res) => {
    const { handle } = req.params;
    const count = Math.min(parseInt(req.query.count) || 10, 20);

    try {
        const [user, submissions, problemset] = await Promise.all([
            CodeforcesService.getUserInfo(handle),
            CodeforcesService.getUserSubmissions(handle),
            CodeforcesService.getProblemset()
        ]);

        const userRating = user.rating || 1200;
        const solvedProblems = new Set();
        const tagStats = new Map();

        submissions.forEach(sub => {
            if (!sub.problem) return;
            const problemId = `${sub.problem.contestId}-${sub.problem.index}`;

            if (sub.verdict === 'OK') {
                solvedProblems.add(problemId);
            }

            (sub.problem.tags || []).forEach(tag => {
                if (!tagStats.has(tag)) {
                    tagStats.set(tag, { total: 0, solved: 0 });
                }
                tagStats.get(tag).total++;
                if (sub.verdict === 'OK') {
                    tagStats.get(tag).solved++;
                }
            });
        });

        // Find weak tags
        const weakTags = Array.from(tagStats.entries())
            .filter(([_, stats]) => stats.total >= 5 && (stats.solved / stats.total) < 0.5)
            .map(([tag]) => tag)
            .slice(0, 5);

        const targetMin = Math.max(800, userRating - 200);
        const targetMax = userRating + 400;

        const recommendations = problemset.problems
            .filter(prob => {
                const problemId = `${prob.contestId}-${prob.index}`;
                return !solvedProblems.has(problemId) && 
                       prob.rating && 
                       prob.rating >= targetMin && 
                       prob.rating <= targetMax;
            })
            .map(prob => {
                const matchingTags = (prob.tags || []).filter(t => weakTags.includes(t));
                return {
                    contestId: prob.contestId,
                    index: prob.index,
                    name: prob.name,
                    rating: prob.rating,
                    tags: prob.tags || [],
                    reason: matchingTags[0] || (prob.rating > userRating ? 'Challenge' : 'Practice'),
                    score: matchingTags.length * 10 + (prob.rating > userRating ? 5 : 0),
                    problemUrl: `https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, count);

        res.json({ 
            status: 'success', 
            handle, 
            platform: 'codeforces', 
            recommendations, 
            weakTags 
        });
    } catch (error) {
        console.error('CF recommendations error:', error.message);
        res.json({ status: 'error', recommendations: [], weakTags: [] });
    }
};

// Get Upcoming Contests
const getUpcomingContests = async (req, res) => {
    try {
        const upcomingContests = await CodeforcesService.getUpcomingContests();

        const contests = upcomingContests
            .slice(0, 15)
            .map(c => ({
                id: c.id,
                name: c.name,
                type: c.type,
                startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
                durationSeconds: c.durationSeconds,
                url: `https://codeforces.com/contest/${c.id}`
            }))
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        res.json({ status: 'success', platform: 'codeforces', contests });
    } catch (error) {
        console.error('CF upcoming contests error:', error.message);
        res.json({ status: 'error', contests: [] });
    }
};

module.exports = {
    getUserProfile,
    getUpsolveData,
    getTagAnalysis,
    getRecommendations,
    getUpcomingContests
};