const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    JUDGE_URL: import.meta.env.VITE_JUDGE_URL || 'http://localhost:5001',
    
    // Timeout settings
    TIMEOUT: 30000,
    
    // Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        PROFILE: '/auth/profile',
        
        // Contest
        CREATE_CONTEST: '/contest/create',
        ALL_CONTESTS: '/contest/all',
        MY_CONTESTS: '/contest/user/my-contests',
        JOINED_CONTESTS: '/contest/user/joined',
        UPDATE_CONTEST: '/contest/update',
        DELETE_CONTEST: '/contest/delete',
        JOIN_CONTEST: '/contest/join',
        
        // Problem
        CREATE_PROBLEM: '/problem/create',
        MY_PROBLEMS: '/problem/my-problems',
        PUBLIC_PROBLEMS: '/problem/public',
        UPDATE_PROBLEM: '/problem/update',
        DELETE_PROBLEM: '/problem/delete',
        
        // Question
        CREATE_QUESTION: '/question/create',
        ALL_QUESTIONS: '/question/all',
        UPDATE_QUESTION: '/question/update',
        DELETE_QUESTION: '/question/delete',
        
        // Submission
        SUBMIT_CODE: '/submission/submit',
        SUBMISSION_LIST: '/submission/history/list',
        SUBMISSION_DETAIL: '/submission/history/one',
        
        // Leaderboard
        LIVE_LEADERBOARD: '/leaderboard/live',
        FINAL_RESULTS: '/leaderboard/results',
        MY_RESULT: '/leaderboard/my-result',
        
        // Response
        START_TEST: '/response/start',
        SAVE_ANSWER: '/response/save-answer',
        SUBMIT_TEST: '/response/submit',
        
        // Codeforces
        CF_USER: '/codeforces',
        CF_UPSOLVE: '/codeforces/user',
        CF_TAGS: '/codeforces/user',
        CF_RECOMMENDATIONS: '/codeforces/user',
        CF_CONTESTS: '/codeforces/contests/upcoming'
    }
};

export default API_CONFIG;