const API_BASE = '/api';

// Helper for making auth requests
const authRequest = async (endpoint, data) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Request failed');
    }

    return result;
};

// Student Auth
export const studentAuth = {
    login: (email, password) => authRequest('/auth/login', { email, password }),
    
    register: (name, email, password) => authRequest('/auth/register', { name, email, password }),
    
    googleAuth: (token) => authRequest('/auth/google', { token }),
    
    getProfile: async () => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');
        
        const response = await fetch(`${API_BASE}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to get profile');
        return response.json();
    }
};

// Educator/Admin Auth
export const educatorAuth = {
    login: (email, password) => authRequest('/admin/auth/login', { email, password }),
    
    // secretKey handling commented out for now — keep registration basic
    register: (name, email, password /*, secretKey */) => 
        authRequest('/admin/auth/register', { name, email, password }),

    googleAuth: (token) => authRequest('/admin/auth/google', { token }),
    
    getProfile: async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('No token');
        
        const response = await fetch(`${API_BASE}/admin/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to get profile');
        return response.json();
    }
};

// Auth utilities
export const authUtils = {
    isLoggedIn: () => !!localStorage.getItem('token'),
    
    isEducator: () => !!localStorage.getItem('adminToken'),
    
    getUser: () => {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
    },
    
    saveStudentAuth: (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'student');
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);
        }
    },
    
    saveEducatorAuth: (data) => {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userRole', 'educator');
        if (data.admin) {
            localStorage.setItem('user', JSON.stringify(data.admin));
            localStorage.setItem('userName', data.admin.name);
            localStorage.setItem('userEmail', data.admin.email);
        }
    }
};