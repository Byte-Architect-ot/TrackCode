import axios from 'axios';
import API_CONFIG from '../config/api';

// Create axios instance
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.token = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post(API_CONFIG.ENDPOINTS.LOGIN, data),
    register: (data) => api.post(API_CONFIG.ENDPOINTS.REGISTER, data),
    getProfile: () => api.get(API_CONFIG.ENDPOINTS.PROFILE)
};

// Contest API
export const contestAPI = {
    create: (data) => api.post(API_CONFIG.ENDPOINTS.CREATE_CONTEST, data),
    getAll: (params) => api.get(API_CONFIG.ENDPOINTS.ALL_CONTESTS, { params }),
    getMy: () => api.get(API_CONFIG.ENDPOINTS.MY_CONTESTS),
    getJoined: () => api.get(API_CONFIG.ENDPOINTS.JOINED_CONTESTS),
    getById: (id) => api.get(`/contest/${id}`),
    update: (id, data) => api.put(`${API_CONFIG.ENDPOINTS.UPDATE_CONTEST}/${id}`, data),
    delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.DELETE_CONTEST}/${id}`),
    join: (id) => api.post(`${API_CONFIG.ENDPOINTS.JOIN_CONTEST}/${id}`),
    leave: (id) => api.post(`/contest/leave/${id}`)
};

// Problem API
export const problemAPI = {
    create: (data) => api.post(API_CONFIG.ENDPOINTS.CREATE_PROBLEM, data),
    getMy: () => api.get(API_CONFIG.ENDPOINTS.MY_PROBLEMS),
    getPublic: (params) => api.get(API_CONFIG.ENDPOINTS.PUBLIC_PROBLEMS, { params }),
    getById: (id) => api.get(`/problem/${id}`),
    update: (id, data) => api.put(`${API_CONFIG.ENDPOINTS.UPDATE_PROBLEM}/${id}`, data),
    delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.DELETE_PROBLEM}/${id}`)
};

// Question API
export const questionAPI = {
    create: (data) => api.post(API_CONFIG.ENDPOINTS.CREATE_QUESTION, data),
    getByTest: (testId) => api.post(API_CONFIG.ENDPOINTS.ALL_QUESTIONS, { testId }),
    update: (id, data) => api.put(`${API_CONFIG.ENDPOINTS.UPDATE_QUESTION}/${id}`, data),
    delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.DELETE_QUESTION}/${id}`)
};

// Submission API
export const submissionAPI = {
    submit: (data) => api.post(API_CONFIG.ENDPOINTS.SUBMIT_CODE, data),
    getList: (data) => api.post(API_CONFIG.ENDPOINTS.SUBMISSION_LIST, data),
    getOne: (data) => api.post(API_CONFIG.ENDPOINTS.SUBMISSION_DETAIL, data),
    getStats: () => api.get('/submission/stats')
};

// Leaderboard API
export const leaderboardAPI = {
    getLive: (testId) => api.get(`${API_CONFIG.ENDPOINTS.LIVE_LEADERBOARD}/${testId}`),
    getResults: (testId) => api.get(`${API_CONFIG.ENDPOINTS.FINAL_RESULTS}/${testId}`),
    getMyResult: (testId) => api.get(`${API_CONFIG.ENDPOINTS.MY_RESULT}/${testId}`),
    publish: (testId) => api.post(`/leaderboard/publish/${testId}`)
};

// Response API
export const responseAPI = {
    start: (testId) => api.post(API_CONFIG.ENDPOINTS.START_TEST, { testId }),
    saveAnswer: (data) => api.post(API_CONFIG.ENDPOINTS.SAVE_ANSWER, data),
    submit: (testId) => api.post(API_CONFIG.ENDPOINTS.SUBMIT_TEST, { testId }),
    getMy: (testId) => api.get(`/response/${testId}`)
};

// Codeforces API
export const codeforcesAPI = {
    getUser: (handle) => api.get(`${API_CONFIG.ENDPOINTS.CF_USER}/${handle}`),
    getUpsolve: (handle) => api.get(`${API_CONFIG.ENDPOINTS.CF_UPSOLVE}/${handle}/upsolve`),
    getTags: (handle) => api.get(`${API_CONFIG.ENDPOINTS.CF_TAGS}/${handle}/tags`),
    getRecommendations: (handle, count) => 
        api.get(`${API_CONFIG.ENDPOINTS.CF_RECOMMENDATIONS}/${handle}/recommendations`, { params: { count } }),
    getUpcoming: () => api.get(API_CONFIG.ENDPOINTS.CF_CONTESTS)
};

export default api;