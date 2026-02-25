import axios from 'axios';
import config from './config';

// Create axios instance for main API
const api = axios.create({
    baseURL: config.BASE_URL,
    timeout: config.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create axios instance for Judge API
const judgeApi = axios.create({
    baseURL: config.JUDGE_URL,
    timeout: config.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
const addAuthToken = (config) => {
    const token = localStorage.getItem('usertoken') || localStorage.getItem('token');
    if (token) {
        config.headers.token = token;
    }
    return config;
};

api.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
judgeApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// Response interceptor - Handle errors
const handleResponseError = (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usertoken');
        window.location.href = '/login';
    }
    return Promise.reject(error);
};

api.interceptors.response.use((response) => response, handleResponseError);
judgeApi.interceptors.response.use((response) => response, handleResponseError);

// AUTH API
export const authApi = {
    login: (data) => api.post(config.AUTH.LOGIN, data),
    register: (data) => api.post(config.AUTH.REGISTER, data),
    getProfile: () => api.get(config.AUTH.PROFILE),
    logout: () => api.post(config.AUTH.LOGOUT),
};

// CONTEST API
export const contestApi = {
    create: (data) => api.post(config.CONTEST.CREATE, data),
    getAll: () => api.get(config.CONTEST.ALL),
    getMyContests: () => api.get(config.CONTEST.MY_CONTESTS),
    getJoined: () => api.get(config.CONTEST.JOINED),
    getOne: (contestId) => api.get(`${config.CONTEST.GET_ONE}/${contestId}`),
    update: (contestId, data) => api.put(`${config.CONTEST.UPDATE}/${contestId}`, data),
    delete: (contestId) => api.delete(`${config.CONTEST.DELETE}/${contestId}`),
    join: (data) => api.post(config.CONTEST.JOIN, data),
};

// QUESTION (MCQ) API
export const questionApi = {
    create: (data) => api.post(config.QUESTION.CREATE, data),
    getAll: (testId) => api.post(config.QUESTION.ALL, { testId }),
    getOne: (questionId) => api.post('/getQuestion', { questionId }),
    update: (data) => api.put(config.QUESTION.UPDATE, data),
    delete: (data) => api.post('/deleteQuestion', data),
    getLive: (data) => api.post(config.QUESTION.LIVE, data),
    saveResponse: (data) => api.post(config.QUESTION.RESPONSE, data),
};

// PROBLEM (CODING) API
export const problemApi = {
    create: (data) => api.post(config.PROBLEM.CREATE, data),
    getMyProblems: () => api.get(config.PROBLEM.MY_PROBLEMS),
    getPublic: () => api.get(config.PROBLEM.PUBLIC),
    update: (problemId, data) => api.put(`${config.PROBLEM.UPDATE}/${problemId}`, data),
    delete: (problemId) => api.delete(`${config.PROBLEM.DELETE}/${problemId}`),
};

// TEST SESSION API
export const testSessionApi = {
    start: (testId) => api.post(config.TEST.START, { testId }),
    saveAnswer: (data) => api.post(config.TEST.SAVE_ANSWER, data),
    submit: (testId) => api.post(config.TEST.SUBMIT, { testId }),
    autoSubmit: (testId) => api.post(config.TEST.AUTO_SUBMIT, { testId }),
};

// SUBMISSION (JUDGE) API
export const submissionApi = {
    submitCode: (data) => judgeApi.post(config.SUBMISSION.SUBMIT, data),
    runCode: (data) => judgeApi.post(config.SUBMISSION.RUN, data),
    getHistoryList: (data) => judgeApi.post(config.SUBMISSION.HISTORY_LIST, data),
    getHistoryOne: (data) => judgeApi.post(config.SUBMISSION.HISTORY_ONE, data),
    getUserCode: (data) => judgeApi.post(config.SUBMISSION.GET_USER_CODE, data),
    uploadUserCode: (data) => judgeApi.post(config.SUBMISSION.UPLOAD_CODE, data),
    getSampleTestCases: (data) => judgeApi.post(config.SUBMISSION.GET_SAMPLE_TC, data),
    getBoilerplate: (data) => judgeApi.post(config.SUBMISSION.GET_BOILERPLATE, data),
};

// ADMIN (JUDGE) API
export const adminApi = {
    getTestProblems: (data) => judgeApi.post(config.ADMIN.TEST_PROBLEMS, data),
    createCodingQuestion: (data) => judgeApi.post(config.ADMIN.CREATE_CODE, data),
    getMarkdown: (data) => judgeApi.post(config.ADMIN.GET_MARKDOWN, data),
    updateMarkdown: (data) => judgeApi.post(config.ADMIN.UPDATE_MARKDOWN, data),
    getDefaultMarkdown: () => judgeApi.get(config.ADMIN.DEFAULT_MARKDOWN),
};

// LEADERBOARD API
export const leaderboardApi = {
    getLive: (contestId) => api.get(`${config.LEADERBOARD.LIVE}/${contestId}`),
    getResults: (contestId) => api.get(`${config.LEADERBOARD.RESULTS}/${contestId}`),
    getMyResult: (contestId) => api.get(`${config.LEADERBOARD.MY_RESULT}/${contestId}`),
};

// CODEFORCES API
export const codeforcesApi = {
    getUser: (handle) => api.get(`${config.CODEFORCES.USER}/${handle}`),
    getUpsolve: (handle) => api.get(`${config.CODEFORCES.UPSOLVE}/${handle}/upsolve`),
    getTags: (handle) => api.get(`${config.CODEFORCES.TAGS}/${handle}/tags`),
    getRecommendations: (handle) => api.get(`${config.CODEFORCES.RECOMMENDATIONS}/${handle}/recommendations`),
    getUpcomingContests: () => api.get(config.CODEFORCES.CONTESTS),
};

// Export instances for custom requests
export { api, judgeApi };
export default config;