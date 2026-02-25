import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ 
    children, 
    requireEducator = false, 
    requireAuth = true,
    fallback = null,
    setPage 
}) => {
    const { isLoading, isAuthenticated, isEducator } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        if (fallback) return fallback;
        
        // Redirect to login
        if (setPage) {
            setPage('login');
            return null;
        }
        
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Please log in to continue</p>
                    <button
                        onClick={() => setPage && setPage('login')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (requireEducator && !isEducator) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">This page requires educator access</p>
                    <button
                        onClick={() => setPage && setPage('login')}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Login as Educator
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;