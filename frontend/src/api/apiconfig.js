/**
 * API config - central config for API endpoints.
 * Used by Contest, CreateContest, EditContest and contest components.
 */
import config from './config';

const isDev = import.meta.env?.DEV ?? false;
const SERVER_BASE = import.meta.env.VITE_API_URL === '' ? '' : (import.meta.env.VITE_API_URL ||
    (isDev ? 'http://localhost:5001' : 'https://track-code-v7ms.vercel.app'));
const JUDGE_BASE = import.meta.env.VITE_JUDGE_URL ||
    (isDev ? 'http://localhost:5001' : 'https://track-code-v7ms.vercel.app');

export default {
    BASE_URL: config.BASE_URL,
    JudgeBackend_url: JUDGE_BASE,
    JUDGE_URL: JUDGE_BASE,
    TIMEOUT: config.TIMEOUT,
    ENDPOINTS: {
        ...config.AUTH,
        CREATE_CONTEST: config.CONTEST.CREATE,
        ALL_CONTESTS: config.CONTEST.ALL,
        MY_CONTESTS: config.CONTEST.MY_CONTESTS,
        JOINED_CONTESTS: config.CONTEST.JOINED,
        UPDATE_CONTEST: config.CONTEST.UPDATE,
        DELETE_CONTEST: config.CONTEST.DELETE,
        JOIN_CONTEST: config.CONTEST.JOIN,
        CREATE_PROBLEM: config.PROBLEM.CREATE,
        MY_PROBLEMS: config.PROBLEM.MY_PROBLEMS,
        PUBLIC_PROBLEMS: config.PROBLEM.PUBLIC,
        UPDATE_PROBLEM: config.PROBLEM.UPDATE,
        DELETE_PROBLEM: config.PROBLEM.DELETE,
        CREATE_QUESTION: config.QUESTION.CREATE,
        ALL_QUESTIONS: config.QUESTION.ALL,
        UPDATE_QUESTION: config.QUESTION.UPDATE,
        DELETE_QUESTION: config.QUESTION.DELETE,
        START_TEST: config.TEST.START,
        SAVE_ANSWER: config.TEST.SAVE_ANSWER,
        SUBMIT_TEST: config.TEST.SUBMIT,
        LIVE_LEADERBOARD: config.LEADERBOARD.LIVE,
        FINAL_RESULTS: config.LEADERBOARD.RESULTS,
        MY_RESULT: config.LEADERBOARD.MY_RESULT,
        SUBMIT_CODE: config.SUBMISSION.SUBMIT,
        SUBMISSION_LIST: config.SUBMISSION.HISTORY_LIST,
        SUBMISSION_DETAIL: config.SUBMISSION.HISTORY_ONE,
        CF_USER: config.CODEFORCES.USER,
        CF_UPSOLVE: config.CODEFORCES.UPSOLVE,
        CF_TAGS: config.CODEFORCES.TAGS,
        CF_RECOMMENDATIONS: config.CODEFORCES.RECOMMENDATIONS,
        CF_CONTESTS: config.CODEFORCES.CONTESTS
    }
};
