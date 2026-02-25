import { useState, useEffect, useCallback } from 'react';
import { contestAPI } from '../services/api';

export const useContests = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchContests = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await contestAPI.getAll(params);
            setContests(response.data.contests || []);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch contests');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { contests, loading, error, fetchContests, setContests };
};

export const useMyContests = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMyContests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await contestAPI.getMy();
            setContests(response.data.contests || []);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch contests');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createContest = async (data) => {
        try {
            const response = await contestAPI.create(data);
            await fetchMyContests();
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateContest = async (id, data) => {
        try {
            const response = await contestAPI.update(id, data);
            await fetchMyContests();
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteContest = async (id) => {
        try {
            await contestAPI.delete(id);
            setContests(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            throw err;
        }
    };

    return {
        contests,
        loading,
        error,
        fetchMyContests,
        createContest,
        updateContest,
        deleteContest
    };
};

export const useJoinContest = () => {
    const [loading, setLoading] = useState(false);

    const joinContest = async (contestId) => {
        setLoading(true);
        try {
            const response = await contestAPI.join(contestId);
            return response.data;
        } finally {
            setLoading(false);
        }
    };

    const leaveContest = async (contestId) => {
        setLoading(true);
        try {
            const response = await contestAPI.leave(contestId);
            return response.data;
        } finally {
            setLoading(false);
        }
    };

    return { joinContest, leaveContest, loading };
};