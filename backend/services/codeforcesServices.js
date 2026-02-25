const axios = require('axios');

const CF_API_BASE = 'https://codeforces.com/api';
const TIMEOUT = 15001;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CodeforcesService {
    static async getUserInfo(handle) {
        const response = await axios.get(
            `${CF_API_BASE}/user.info?handles=${handle}`,
            { timeout: TIMEOUT }
        );
        return response.data.result[0];
    }

    static async getUserSubmissions(handle) {
        const response = await axios.get(
            `${CF_API_BASE}/user.status?handle=${handle}`,
            { timeout: TIMEOUT }
        );
        return response.data.result;
    }

    static async getUserRating(handle) {
        const response = await axios.get(
            `${CF_API_BASE}/user.rating?handle=${handle}`,
            { timeout: 20000 }
        );
        return response.data.result;
    }

    static async getContestStandings(contestId) {
        const response = await axios.get(
            `${CF_API_BASE}/contest.standings?contestId=${contestId}&from=1&count=1`,
            { timeout: TIMEOUT }
        );
        return response.data.result;
    }

    static async getProblemset() {
        const response = await axios.get(
            `${CF_API_BASE}/problemset.problems`,
            { timeout: TIMEOUT }
        );
        return response.data.result;
    }

    static async getUpcomingContests() {
        const response = await axios.get(
            `${CF_API_BASE}/contest.list?gym=false`,
            { timeout: TIMEOUT }
        );
        return response.data.result.filter(c => c.phase === 'BEFORE');
    }

    static analyzeSolvedProblems(submissions) {
        const solved = new Set();
        let easy = 0, medium = 0, hard = 0;

        submissions.forEach(s => {
            if (s.verdict === 'OK' && s.problem.rating) {
                const id = `${s.problem.contestId}-${s.problem.index}`;
                if (!solved.has(id)) {
                    solved.add(id);
                    if (s.problem.rating < 1200) easy++;
                    else if (s.problem.rating < 1600) medium++;
                    else hard++;
                }
            }
        });

        return { solved, easy, medium, hard };
    }

    static analyzeTagStats(submissions) {
        const tagStats = new Map();

        submissions.forEach(sub => {
            if (!sub.problem) return;
            const problemId = `${sub.problem.contestId}-${sub.problem.index}`;

            (sub.problem.tags || []).forEach(tag => {
                if (!tagStats.has(tag)) {
                    tagStats.set(tag, { 
                        tag, 
                        attempted: new Set(), 
                        solved: new Set(), 
                        solvedRating: 0 
                    });
                }

                const stats = tagStats.get(tag);
                stats.attempted.add(problemId);

                if (sub.verdict === 'OK' && !stats.solved.has(problemId)) {
                    stats.solved.add(problemId);
                    stats.solvedRating += sub.problem.rating || 0;
                }
            });
        });

        return Array.from(tagStats.values())
            .map(stat => ({
                tag: stat.tag,
                total: stat.attempted.size,
                solved: stat.solved.size,
                successRate: stat.attempted.size > 0 
                    ? Math.round((stat.solved.size / stat.attempted.size) * 100) 
                    : 0,
                avgRating: stat.solved.size > 0 
                    ? Math.round(stat.solvedRating / stat.solved.size) 
                    : 0
            }))
            .filter(t => t.total >= 2)
            .sort((a, b) => b.total - a.total);
    }
}

module.exports = CodeforcesService;