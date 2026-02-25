import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { studentAuth, educatorAuth, authUtils } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isEducator, setIsEducator] = useState(false);

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setIsLoading(true);
        
        try {
            const adminToken = localStorage.getItem('adminToken');
            const studentToken = localStorage.getItem('token');

            if (adminToken) {
                // Try educator auth
                try {
                    const data = await educatorAuth.getProfile();
                    setUser(data.admin);
                    setIsEducator(true);
                    setIsAuthenticated(true);
                } catch (error) {
                    // Invalid admin token
                    localStorage.removeItem('adminToken');
                }
            } else if (studentToken) {
                // Try student auth
                try {
                    const data = await studentAuth.getProfile();
                    setUser(data.user);
                    setIsEducator(false);
                    setIsAuthenticated(true);
                } catch (error) {
                    // Invalid student token
                    localStorage.removeItem('token');
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loginAsStudent = useCallback(async (email, password) => {
        const data = await studentAuth.login(email, password);
        authUtils.saveStudentAuth(data);
        setUser(data.user);
        setIsEducator(false);
        setIsAuthenticated(true);
        return data;
    }, []);

    const loginAsEducator = useCallback(async (email, password) => {
        const data = await educatorAuth.login(email, password);
        authUtils.saveEducatorAuth(data);
        setUser(data.admin);
        setIsEducator(true);
        setIsAuthenticated(true);
        return data;
    }, []);

    const registerAsStudent = useCallback(async (name, email, password) => {
        const data = await studentAuth.register(name, email, password);
        authUtils.saveStudentAuth(data);
        setUser(data.user);
        setIsEducator(false);
        setIsAuthenticated(true);
        return data;
    }, []);

    const registerAsEducator = useCallback(async (name, email, password /*, secretKey */) => {
        // secretKey removed from flow — keep registration basic
        const data = await educatorAuth.register(name, email, password);
        authUtils.saveEducatorAuth(data);
        setUser(data.admin);
        setIsEducator(true);
        setIsAuthenticated(true);
        return data;
    }, []);

    const googleLogin = useCallback(async (token) => {
        const data = await studentAuth.googleAuth(token);
        authUtils.saveStudentAuth(data);
        setUser(data.user);
        setIsEducator(false);
        setIsAuthenticated(true);
        return data;
    }, []);

    const googleLoginEducator = useCallback(async (token) => {
        const data = await educatorAuth.googleAuth(token);
        authUtils.saveEducatorAuth(data);
        setUser(data.admin);
        setIsEducator(true);
        setIsAuthenticated(true);
        return data;
    }, []);

    const logout = useCallback(() => {
        authUtils.logout();
        setUser(null);
        setIsEducator(false);
        setIsAuthenticated(false);
    }, []);

    const value = {
        user,
        isLoading,
        isAuthenticated,
        isEducator,
        loginAsStudent,
        loginAsEducator,
        registerAsStudent,
        registerAsEducator,
        googleLogin,
        googleLoginEducator,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;