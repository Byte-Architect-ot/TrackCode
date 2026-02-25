import { useState, useCallback } from 'react';
import { problemAPI } from '../services/api';

export const useProblems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMyProblems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await problemAPI.getMy();
            setProblems(response.data.problems || []);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch problems');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createProblem = async (data) => {
        try {
            const response = await problemAPI.create(data);
            await fetchMyProblems();
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateProblem = async (id, data) => {
        try {
            const response = await problemAPI.update(id, data);
            await fetchMyProblems();
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteProblem = async (id) => {
        try {
            await problemAPI.delete(id);
            setProblems(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            throw err;
        }
    };

    return {
        problems,
        loading,
        error,
        fetchMyProblems,
        createProblem,
        updateProblem,
        deleteProblem
    };
};