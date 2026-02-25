// src/api/practiceApi.js

import { API_BASE } from './config';

const fetchJson = async (url) => {
    console.log('Fetching:', url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
};

const endpoints = {
    codeforces: {
        upsolve: (handle) => `${API_BASE}/api/codeforces/user/${handle}/upsolve`,
        tags: (handle) => `${API_BASE}/api/codeforces/user/${handle}/tags`,
        recommendations: (handle) => `${API_BASE}/api/codeforces/user/${handle}/recommendations`,
        upcoming: () => `${API_BASE}/api/codeforces/contests/upcoming`
    },
    leetcode: {
        upsolve: (handle) => `${API_BASE}/api/leetcode/user/${handle}/upsolve`,
        tags: (handle) => `${API_BASE}/api/leetcode/user/${handle}/tags`,
        recommendations: (handle) => `${API_BASE}/api/leetcode/user/${handle}/recommendations`,
        upcoming: () => `${API_BASE}/api/leetcode/contests/upcoming`
    }
};

export const fetchUpsolveList = async (handle, platform = 'codeforces') => {
    try {
        return await fetchJson(endpoints[platform].upsolve(handle));
    } catch (e) {
        return { status: 'error', error: e.message, upsolveData: [] };
    }
};

export const fetchTagAnalysis = async (handle, platform = 'codeforces') => {
    try {
        return await fetchJson(endpoints[platform].tags(handle));
    } catch (e) {
        return { status: 'error', tagAnalysis: [] };
    }
};

export const fetchRecommendations = async (handle, platform = 'codeforces') => {
    try {
        return await fetchJson(endpoints[platform].recommendations(handle));
    } catch (e) {
        return { status: 'error', recommendations: [], weakTags: [] };
    }
};

export const fetchUpcomingContests = async (platform = 'codeforces') => {
    try {
        return await fetchJson(endpoints[platform].upcoming());
    } catch (e) {
        return { status: 'error', contests: [] };
    }
};

export const fetchAllUpcomingContests = async () => {
    try {
        const [cf, lc] = await Promise.all([
            fetchUpcomingContests('codeforces').catch(() => ({ contests: [] })),
            fetchUpcomingContests('leetcode').catch(() => ({ contests: [] }))
        ]);

        return {
            status: 'success',
            contests: [
                ...(cf.contests || []).map(c => ({ ...c, platform: 'codeforces' })),
                ...(lc.contests || []).map(c => ({ ...c, platform: 'leetcode' }))
            ].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        };
    } catch (e) {
        return { status: 'error', contests: [] };
    }
};