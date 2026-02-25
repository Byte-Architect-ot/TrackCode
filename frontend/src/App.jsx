import React, { useState, useEffect, useCallback } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Pages
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import StudentDashboard from "./pages/Dashboard";
import CodingSheetsPage from "./pages/Sheets";
import History from "./pages/History";
import Contest from "./pages/Contest";
import ContestsList from "./pages/ContestsList";
import Practice from "./pages/Practice";

// Components
import Header from "./pages/Header";

// API
import { authUtils } from './api/authApi';

// Google OAuth Client ID - move to .env in production
const GOOGLE_CLIENT_ID = "1008193498749-9v7ebuopc9agl9ojkikn6cnfk89if7kt.apps.googleusercontent.com";

export default function App() {
    //  AUTH STATE 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isEducator, setIsEducator] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    //  PAGE STATE 
    const [page, setPage] = useState("login");

    //  THEME STATE 
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            return saved ? JSON.parse(saved) : true;
        }
        return true;
    });

    //  USER PROFILE STATE 
    const [profileData, setProfileData] = useState({
        name: 'User',
        email: '',
        role: 'student'
    });

    //  CONTEST/TEST STATE 
    const [activeTestId, setActiveTestId] = useState(null);

    //  INITIALIZATION 
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = useCallback(() => {
        setIsLoading(true);

        try {
            const studentToken = localStorage.getItem('token');
            const adminToken = localStorage.getItem('adminToken');
            const userRole = localStorage.getItem('userRole');

            if (adminToken) {
                // Educator is logged in
                setIsAuthenticated(true);
                setIsEducator(true);
                setProfileData({
                    name: localStorage.getItem('userName') || 'Educator',
                    email: localStorage.getItem('userEmail') || '',
                    role: 'educator'
                });
                setPage('practice'); // Educators go to practice hub by default
            } else if (studentToken) {
                // Student is logged in
                setIsAuthenticated(true);
                setIsEducator(false);
                setProfileData({
                    name: localStorage.getItem('userName') || 'User',
                    email: localStorage.getItem('userEmail') || '',
                    role: 'student'
                });
                setPage('dashboard');
            } else {
                // No one is logged in
                setIsAuthenticated(false);
                setIsEducator(false);
                setPage('login');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
            setPage('login');
        } finally {
            setIsLoading(false);
        }
    }, []);

    //  THEME PERSISTENCE 
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('darkMode', JSON.stringify(darkMode));
            
            if (darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [darkMode]);

    //  UPDATE PROFILE ON PAGE CHANGE 
    useEffect(() => {
        if (isAuthenticated) {
            setProfileData({
                name: localStorage.getItem('userName') || 'User',
                email: localStorage.getItem('userEmail') || '',
                role: localStorage.getItem('userRole') || 'student'
            });
        }
    }, [page, isAuthenticated]);

    //  HANDLERS 
    const handleLogout = useCallback(() => {
        // Clear all auth data
        authUtils.logout();
        
        // Also clear any additional data
        if (typeof window !== 'undefined') {
            localStorage.removeItem("codeforces_handle");
            localStorage.removeItem("leetcode_handle");
        }

        // Reset state
        setIsAuthenticated(false);
        setIsEducator(false);
        setProfileData({ name: 'User', email: '', role: 'student' });
        setPage("login");
    }, []);

    const handleLoginSuccess = useCallback(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const handlePageChange = useCallback((newPage, data = null) => {
        // Handle special page transitions
        if (newPage === 'take-test' && data?.testId) {
            setActiveTestId(data.testId);
            setPage('take-test');
            return;
        }

        // Protect educator-only pages (removed 'create-contest' to allow all users)
        const educatorOnlyPages = ['admin-results', 'manage-problems'];
        if (educatorOnlyPages.includes(newPage) && !isEducator) {
            console.warn('Access denied: Educator only page');
            return;
        }

        setPage(newPage);
    }, [isEducator]);

    //  RENDER CONTENT 
    const renderContent = () => {
        // Loading state
        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
                            darkMode ? 'border-blue-400' : 'border-blue-600'
                        }`} />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                            Loading...
                        </p>
                    </div>
                </div>
            );
        }

        switch (page) {
            case "dashboard":
                return (
                    <StudentDashboard
                        onLogout={handleLogout}
                        setPage={handlePageChange}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        isEducator={isEducator}
                    />
                );

            case "sheets":
                return (
                    <CodingSheetsPage
                        darkMode={darkMode}
                        setPage={handlePageChange}
                    />
                );

            case "contests":
                return (
                    <ContestsList
                        darkMode={darkMode}
                        setPage={handlePageChange}
                        isEducator={isEducator}
                    />
                );

            case "history":
                return (
                    <History
                        darkMode={darkMode}
                        setPage={handlePageChange}
                    />
                );

            case "practice":
                return (
                    <Practice
                        darkMode={darkMode}
                        setPage={handlePageChange}
                        isEducator={isEducator}
                    />
                );

            case "take-test":
                // Dynamic import would be better for code splitting
                return (
                    <TakeTest
                        testId={activeTestId}
                        darkMode={darkMode}
                        setPage={handlePageChange}
                        onSubmit={() => handlePageChange('practice')}
                    />
                );

            case "roadmaps":
                return (
                    <div className={`p-10 text-center rounded-xl border ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <h2 className="text-2xl font-bold mb-4">Roadmaps</h2>
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                            Coming Soon...
                        </p>
                    </div>
                );

            default:
                // Unknown page - redirect to appropriate default
                return isEducator ? (
                    <Practice darkMode={darkMode} setPage={handlePageChange} isEducator={true} />
                ) : (
                    <StudentDashboard
                        onLogout={handleLogout}
                        setPage={handlePageChange}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                    />
                );
        }
    };

    //  AUTH PAGES (FULL SCREEN) 
    const isAuthPage = page === "login" || page === "signup";

    if (isAuthPage && !isAuthenticated) {
        return (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <div className={`min-h-screen transition-colors duration-200 ${
                    darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
                }`}>
                    {page === "signup" ? (
                        <Signup
                            setPage={setPage}
                            onSignupSuccess={handleLoginSuccess}
                        />
                    ) : (
                        <Login
                            setPage={setPage}
                            onLoginSuccess={handleLoginSuccess}
                        />
                    )}
                </div>
            </GoogleOAuthProvider>
        );
    }

    //  PROTECTED APP 
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className={`min-h-screen transition-colors duration-200 ${
                darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
            }`}>
                {/* Enhanced Header with Role Indicator */}
                <Header
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    setPage={handlePageChange}
                    profileData={profileData}
                    onLogout={handleLogout}
                    isEducator={isEducator}
                    currentPage={page}
                />

                {/* Main Content Area */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {renderContent()}
                </main>

                {/* Toast Container (for notifications) */}
                <ToastContainer darkMode={darkMode} />
            </div>
        </GoogleOAuthProvider>
    );
}

//  TAKE TEST COMPONENT (INLINE FOR SIMPLICITY) 
// In production, move this to a separate file
const TakeTest = ({ testId, darkMode, setPage, onSubmit }) => {
    // Import the full Contest component with test-taking mode
    const Contest = React.lazy(() => import('./pages/Contest'));

    return (
        <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${
                    darkMode ? 'border-blue-400' : 'border-blue-600'
                }`} />
            </div>
        }>
            <Contest
                testId={testId}
                darkMode={darkMode}
                setPage={setPage}
                onSubmit={onSubmit}
                mode="take-test"
            />
        </React.Suspense>
    );
};

//  TOAST CONTAINER 
const ToastContainer = ({ darkMode }) => {
    const [toasts, setToasts] = useState([]);

    // Expose global toast function
    useEffect(() => {
        window.showToast = (message, type = 'info', duration = 3000) => {
            const id = Date.now();
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        };

        return () => {
            delete window.showToast;
        };
    }, []);

    if (toasts.length === 0) return null;

    const typeStyles = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-600',
        info: 'bg-blue-600'
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`${typeStyles[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up`}
                >
                    {toast.message}
                    <button
                        onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                        className="ml-2 hover:opacity-80"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};