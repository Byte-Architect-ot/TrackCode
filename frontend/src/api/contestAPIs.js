import { API_BASE } from './config';

// Helper to get auth headers (student token)
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Helper for educator operations (admin token)
const getEducatorHeaders = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.warn('No adminToken found - educator operations will fail');
    }
    return {
        'Content-Type': 'application/json',
        ...(token && {
            'Authorization': `Bearer ${token}`,
            'token': token  // Backend checks req.headers.token first
        })
    };
};

// Generic API call wrapper - uses options.headers if provided, else getHeaders()
const apiCall = async (endpoint, options = {}) => {
    try {
        // If options.headers is provided, use it directly; otherwise use getHeaders()
        const headers = options.headers || getHeaders();
        
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

//  CONTEST/TEST APIs 

export const contestApi = {
    // Get all public contests
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/contest/all${query ? `?${query}` : ''}`);
    },

    // Get contest by ID
    getById: (id) => apiCall(`/contest/${id}`),

    // Create contest (educator - uses admin token)
    create: (data) => apiCall('/contest/create', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: getEducatorHeaders()
    }),

    // Update contest (educator - uses admin token)
    update: (id, data) => apiCall(`/contest/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: getEducatorHeaders()
    }),

    // Delete contest (educator - uses admin token)
    delete: (id) => apiCall(`/contest/delete/${id}`, {
        method: 'DELETE',
        headers: getEducatorHeaders()
    }),

    // Get my created contests (educator - uses admin token)
    getMyContests: () => apiCall('/contest/user/my-contests', {
        headers: getEducatorHeaders()
    }),

    // Get joined contests (student)
    getJoinedContests: () => apiCall('/contest/user/joined'),

    // Join contest (student)
    join: (id, accessCode) => apiCall(`/contest/join/${id}`, {
        method: 'POST',
        body: JSON.stringify({ accessCode })
    }),

    // Leave contest (student)
    leave: (id) => apiCall(`/contest/leave/${id}`, {
        method: 'POST'
    })
};

//  TEST SESSION APIs 

export const testSessionApi = {
    // Get my tests categorized (student)
    getMyTests: () => apiCall('/test-session/my-tests'),

    // Get test status
    getStatus: (testId) => apiCall(`/test-session/${testId}/status`),

    // Register for test (student)
    register: (testId, accessCode) => apiCall(`/test-session/${testId}/register`, {
        method: 'POST',
        body: JSON.stringify({ accessCode })
    }),

    // Start test (student)
    start: (testId) => apiCall(`/test-session/${testId}/start`, {
        method: 'POST'
    }),

    // Save MCQ response (student)
    saveMcq: (testId, data) => apiCall(`/test-session/${testId}/mcq/save`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Save coding response (student)
    saveCoding: (testId, data) => apiCall(`/test-session/${testId}/coding/save`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Update navigation state
    updateNavigation: (testId, data) => apiCall(`/test-session/${testId}/navigation`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Submit test (student)
    submit: (testId) => apiCall(`/test-session/${testId}/submit`, {
        method: 'POST'
    }),

    // Auto-submit (called by timer)
    autoSubmit: (testId) => apiCall(`/test-session/${testId}/auto-submit`, {
        method: 'POST'
    })
};

//  PROBLEM APIs 

export const problemApi = {
    // Get public problems
    getPublic: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/problem/public${query ? `?${query}` : ''}`);
    },

    // Get my problems (no token required - returns dummy educator's problems)
    getMyProblems: () => apiCall('/problem/my-problems'),

    // Get problem by ID (no token required)
    getById: (id) => apiCall(`/problem/${id}`),

    // Create problem (no token required - basic save)
    create: (data) => apiCall('/problem/create', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Update problem (no token required)
    update: (id, data) => apiCall(`/problem/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // Delete problem (no token required)
    delete: (id) => apiCall(`/problem/delete/${id}`, {
        method: 'DELETE'
    })
};

//  MCQ/QUESTION APIs 

export const questionApi = {
    // Create question (no token required - basic save)
    create: (data) => apiCall('/question/create', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Get questions by test (no token required)
    getByTest: (testId) => apiCall('/question/all', {
        method: 'POST',
        body: JSON.stringify({ testId })
    }),

    // Update question (no token required)
    update: (id, data) => apiCall(`/question/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // Delete question (no token required)
    delete: (id) => apiCall(`/question/delete/${id}`, {
        method: 'DELETE'
    })
};

//  RESULT APIs 

export const resultApi = {
    // Get my result (student)
    getMyResult: (testId) => apiCall(`/results/my/${testId}`),

    // Get answer review (student)
    getReview: (testId) => apiCall(`/results/review/${testId}`),

    // Get test results (educator) - requires admin token
    getTestResults: (testId) => {
        const adminToken = localStorage.getItem('adminToken');
        return fetch(`${API_BASE}/results/admin/${testId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            }
        }).then(res => res.json());
    },

    // Toggle result visibility (educator)
    toggleVisibility: (testId, publish) => {
        const adminToken = localStorage.getItem('adminToken');
        return fetch(`${API_BASE}/results/admin/${testId}/toggle-visibility`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ publish })
        }).then(res => res.json());
    },

    // Download CSV (educator)
    downloadCSV: (testId) => {
        const adminToken = localStorage.getItem('adminToken');
        return `${API_BASE}/results/admin/${testId}/download-csv?token=${adminToken}`;
    }
};

//  SUBMISSION APIs 

export const submissionApi = {
    // Submit code
    submit: (data) => apiCall('/submission/submit', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Get submission history
    getHistory: (testId, problemId) => apiCall('/submission/history/list', {
        method: 'POST',
        body: JSON.stringify({ testId, problemId })
    }),

    // Get single submission
    getOne: (submissionId, testId, problemId) => apiCall('/submission/history/one', {
        method: 'POST',
        body: JSON.stringify({ submissionId, testId, problemId })
    }),

    // Get user stats
    getStats: () => apiCall('/submission/stats')
};