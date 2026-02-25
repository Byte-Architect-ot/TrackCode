// src/api/platformAPIs.js

import { API_BASE } from './config';

const fetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
    }
    return response.json();
};

const handleError = (platform, error) => {
    console.error(`${platform} Error:`, error.message);
    return { status: 'error', error: error.message };
};

// CODEFORCES

export const fetchCodeforcesStats = async (handle) => {
    try {
        return await fetchJson(`${API_BASE}/api/codeforces/${handle}`);
    } catch (e) {
        return handleError('Codeforces', e);
    }
};

// In src/api/platformAPIs.js

export const fetchCodeforcesHistory = async (handle) => {
  try {
    const response = await fetch(`/api/codeforces/user/${handle}/upsolve`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        status: 'success',
        history: data.upsolveData.map(contest => ({
          contestId: contest.contestId,
          contestName: contest.contestName,
          date: contest.date,
          rank: contest.rank,
          oldRating: contest.newRating - contest.ratingChange,
          newRating: contest.newRating,
          ratingChange: contest.ratingChange,
          problemsSolved: contest.solvedCount,
          totalProblems: contest.totalProblems
        })),
        totalContests: data.totalContests,
        currentRating: data.upsolveData[0]?.newRating || 0,
        maxRating: Math.max(...data.upsolveData.map(c => c.newRating)),
        minRating: Math.min(...data.upsolveData.map(c => c.newRating))
      };
    }
    
    return { status: 'error', error: 'Failed to fetch history' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};

// LEETCODE
export const fetchLeetCodeHistory = async (handle) => {
  try {
    const response = await fetch(`${API_BASE}/api/leetcode/user/${handle}/upsolve`);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        status: 'success',
        history: data.upsolveData.map(contest => ({
          contestId: contest.contestId,
          contestName: contest.contestName,
          date: contest.date,
          rank: contest.rank,
          oldRating: contest.newRating - (contest.ratingChange || 0),
          newRating: contest.newRating,
          ratingChange: contest.ratingChange || 0,
          problemsSolved: contest.solvedCount,
          totalProblems: contest.totalProblems
        })),
        totalContests: data.totalContests,
        currentRating: data.upsolveData[0]?.newRating || 0,
        maxRating: Math.max(...(data.upsolveData || []).map(c => c.newRating || 0)),
        minRating: Math.min(...(data.upsolveData || []).map(c => c.newRating || 0))
      };
    }

    return { status: 'error', error: 'Failed to fetch history' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};
