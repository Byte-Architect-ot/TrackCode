// Environment detection
const isDev = import.meta.env?.DEV ?? false;

// VITE_API_URL: when empty string, use relative /api (for same-origin proxy e.g. Docker nginx)
const VITE_API = import.meta.env.VITE_API_URL;
const SERVER_BASE = VITE_API === '' ? '' : (VITE_API ||
    (isDev ? 'http://localhost:5001' : 'https://track-code-v7ms.vercel.app'));

const JUDGE_BASE = import.meta.env.VITE_JUDGE_URL ||
    (isDev ? 'http://localhost:5001' : 'https://track-code-v7ms.vercel.app');

// API_BASE = full API root (relative /api when same-origin, else SERVER_BASE/api)
export const API_BASE = SERVER_BASE ? `${SERVER_BASE}/api` : '/api';

const config = {
    // Base URLs
    BASE_URL: API_BASE,
    JUDGE_URL: JUDGE_BASE,
    API_BASE: API_BASE,
    
    // Timeout
    TIMEOUT: 30000,
    
    // Auth Endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        PROFILE: '/auth/profile',
        LOGOUT: '/auth/logout',
    },
    
    // Contest Endpoints
    CONTEST: {
        CREATE: '/contest/create',
        ALL: '/contest/all',
        MY_CONTESTS: '/contest/user/my-contests',
        JOINED: '/contest/user/joined',
        UPDATE: '/contest/update',
        DELETE: '/contest/delete',
        JOIN: '/contest/join',
        GET_ONE: '/contest', // /contest/:id
    },
    
    // Question (MCQ) Endpoints
    QUESTION: {
        CREATE: '/question/create',
        ALL: '/question/all',
        GET_ONE: '/question',
        UPDATE: '/question/update',
        DELETE: '/question/delete',
        LIVE: '/liveQuestion',
        RESPONSE: '/studentResponse',
    },
    
    // Problem (Coding) Endpoints
    PROBLEM: {
        CREATE: '/problem/create',
        MY_PROBLEMS: '/problem/my-problems',
        PUBLIC: '/problem/public',
        UPDATE: '/problem/update',
        DELETE: '/problem/delete',
    },
    
    // Test Session Endpoints
    TEST: {
        START: '/response/start',
        SAVE_ANSWER: '/response/save-answer',
        SUBMIT: '/response/submit',
        AUTO_SUBMIT: '/response/auto-submit',
    },
    
    // Submission Endpoints (Judge)
    SUBMISSION: {
        SUBMIT: '/submitCodeUser',
        RUN: '/runUserTestCase',
        HISTORY_LIST: '/history/list',
        HISTORY_ONE: '/history/one',
        GET_USER_CODE: '/getUserCode',
        UPLOAD_CODE: '/uploadUserCode',
        GET_SAMPLE_TC: '/getSampleTestCase',
        GET_BOILERPLATE: '/get-boilerplates',
    },
    
    // Admin Endpoints (Judge)
    ADMIN: {
        TEST_PROBLEMS: '/admin/test-problems',
        CREATE_CODE: '/createTestCode',
        GET_MARKDOWN: '/adminMarkdown',
        UPDATE_MARKDOWN: '/updateAdminMarkdown',
        DEFAULT_MARKDOWN: '/getDefaultMarkdown',
    },
    
    // Leaderboard Endpoints
    LEADERBOARD: {
        LIVE: '/leaderboard/live',
        RESULTS: '/leaderboard/results',
        MY_RESULT: '/leaderboard/my-result',
    },
    
    // Codeforces Endpoints
    CODEFORCES: {
        USER: '/codeforces',
        UPSOLVE: '/codeforces/user',
        TAGS: '/codeforces/user',
        RECOMMENDATIONS: '/codeforces/user',
        CONTESTS: '/codeforces/contests/upcoming',
    },
};

export default config;