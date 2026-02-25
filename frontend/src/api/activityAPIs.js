// src/api/activityAPIs.js

import { API_BASE } from './config';

const defaultStats = {
    totalSubmissions: 0,
    uniqueProblemsSolved: 0,
    activeDays: 0,
    currentStreak: 0,
    longestStreak: 0
};

export const fetchCodeforcesActivity = async (handle, days = 365) => {
    try {
        const response = await fetch(`${API_BASE}/api/activity/${handle}?days=${days}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Activity fetch error:', error.message);
        return { status: 'error', error: error.message, activityData: [], stats: defaultStats };
    }
};

export const recordLogin = async (token) => {
    try {
        const response = await fetch(`${API_BASE}/api/user/activity/login`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Record login error:', error.message);
        return { status: 'error', error: error.message };
    }
};

export const fetchUserActivity = async (token) => {
    try {
        const response = await fetch(`${API_BASE}/api/user/activity`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('User activity error:', error.message);
        return { status: 'error', loginDates: [] };
    }
};