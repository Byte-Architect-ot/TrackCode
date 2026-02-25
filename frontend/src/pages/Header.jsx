import React, { useState, useEffect, useRef } from 'react';
import {
    Sun, Moon, LogOut, User, MessageSquare, Bell,
    ChevronDown, Settings, GraduationCap, Users,
    Menu, X, Home, BookOpen, Trophy, Clock,
    Code, Sparkles, BarChart3, Shield, HelpCircle
} from 'lucide-react';

const Header = ({
    darkMode,
    setDarkMode,
    setPage,
    onLogout,
    profileData: propProfileData,
    isEducator: propIsEducator,
    currentPage
}) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [profileData, setProfileData] = useState(propProfileData || null);
    const [isEducator, setIsEducator] = useState(propIsEducator || false);
    const [notifications, setNotifications] = useState([]);

    const profileMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);

    // Sync with props or localStorage
    useEffect(() => {
        if (propProfileData) {
            setProfileData(propProfileData);
        } else {
            const userName = localStorage.getItem('userName');
            const userEmail = localStorage.getItem('userEmail');
            if (userName || userEmail) {
                setProfileData({ name: userName || 'User', email: userEmail || '' });
            }
        }

        if (propIsEducator !== undefined) {
            setIsEducator(propIsEducator);
        } else {
            const adminToken = localStorage.getItem('adminToken');
            const userRole = localStorage.getItem('userRole');
            setIsEducator(!!adminToken || userRole === 'educator');
        }
    }, [propProfileData, propIsEducator]);

    // Mock notifications (replace with real API call)
    useEffect(() => {
        // Simulate fetching notifications
        const mockNotifications = [
            // { id: 1, type: 'contest', message: 'Weekly Contest #5 starts in 1 hour', time: '1h ago', unread: true },
            // { id: 2, type: 'result', message: 'Your result for "DSA Challenge" is ready', time: '2h ago', unread: true },
        ];
        setNotifications(mockNotifications);
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on page change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [currentPage]);

    // Navigation items based on role
    const studentNavItems = [
        { name: 'Dashboard', id: 'dashboard', icon: Home },
        { name: 'Practice', id: 'practice', icon: Sparkles },
        { name: 'Contests', id: 'contests', icon: Trophy },
        { name: 'Sheets', id: 'sheets', icon: BookOpen },
        { name: 'History', id: 'history', icon: Clock }
    ];

    const educatorNavItems = [
        { name: 'Contest Manager', id: 'practice', icon: Sparkles },
        { name: 'Analytics', id: 'dashboard', icon: BarChart3 },
        { name: 'All Contests', id: 'contests', icon: Trophy },
        { name: 'Problem Bank', id: 'problems', icon: Code }
    ];

    const navItems = isEducator ? educatorNavItems : studentNavItems;

    // Styles
    const cardBg = darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200';
    const textMain = darkMode ? 'text-gray-100' : 'text-gray-900';
    const textMuted = darkMode ? 'text-gray-400' : 'text-gray-600';
    const hoverBg = darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <header className={`${cardBg} border-b sticky top-0 z-50 backdrop-blur transition-colors duration-200`}>
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Left Section: Logo & Navigation */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <button
                            onClick={() => setPage(isEducator ? 'practice' : 'dashboard')}
                            className="flex items-center gap-2 group"
                        >
                            <span className="text-2xl font-bold text-blue-600 group-hover:opacity-80 transition-opacity">
                                Skill
                                <span className={darkMode ? 'text-gray-200' : 'text-slate-800'}>
                                    Graph
                                </span>
                            </span>
                            {isEducator && (
                                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                                    EDUCATOR
                                </span>
                            )}
                        </button>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = currentPage === item.id;
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setPage(item.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                                : `${textMuted} ${hoverBg} hover:text-blue-500`
                                        }`}
                                    >
                                        <Icon size={16} />
                                        {item.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-lg transition-colors ${
                                darkMode
                                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notificationMenuRef}>
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-2 rounded-lg transition-colors ${
                                    darkMode
                                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {isNotificationsOpen && (
                                <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl border overflow-hidden ${
                                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                }`}>
                                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <h3 className={`font-semibold ${textMain}`}>Notifications</h3>
                                    </div>

                                    {notifications.length > 0 ? (
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.map(notification => (
                                                <button
                                                    key={notification.id}
                                                    className={`w-full text-left px-4 py-3 border-b transition-colors ${
                                                        darkMode
                                                            ? 'border-gray-700 hover:bg-gray-700'
                                                            : 'border-gray-100 hover:bg-gray-50'
                                                    } ${notification.unread ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                                                >
                                                    <p className={`text-sm ${textMain}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className={`text-xs mt-1 ${textMuted}`}>
                                                        {notification.time}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-8 text-center">
                                            <Bell size={32} className={`mx-auto mb-2 ${textMuted} opacity-50`} />
                                            <p className={`text-sm ${textMuted}`}>No notifications</p>
                                        </div>
                                    )}

                                    <button className={`w-full px-4 py-2 text-sm font-medium text-blue-500 ${hoverBg}`}>
                                        View all notifications
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Feedback Button (Desktop) */}
                        <button
                            className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                darkMode
                                    ? 'text-gray-300 bg-gray-800 border-gray-700 hover:bg-gray-700'
                                    : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <MessageSquare size={16} />
                            Feedback
                        </button>

                        {/* Profile Menu */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${hoverBg}`}
                            >
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold shadow-md ${
                                    isEducator
                                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                }`}>
                                    {isEducator ? (
                                        <Users size={18} />
                                    ) : profileData?.name ? (
                                        profileData.name.charAt(0).toUpperCase()
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className={`text-sm font-medium leading-tight ${textMain}`}>
                                        {profileData?.name || 'User'}
                                    </p>
                                    <p className={`text-xs leading-tight ${textMuted}`}>
                                        {isEducator ? 'Educator' : 'Student'}
                                    </p>
                                </div>
                                <ChevronDown size={16} className={`hidden md:block ${textMuted}`} />
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border overflow-hidden ${
                                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                }`}>
                                    {/* User Info */}
                                    <div className={`px-4 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                                isEducator
                                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                            }`}>
                                                {profileData?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold truncate ${textMain}`}>
                                                    {profileData?.name || 'User'}
                                                </p>
                                                <p className={`text-sm truncate ${textMuted}`}>
                                                    {profileData?.email}
                                                </p>
                                                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                                                    isEducator
                                                        ? 'bg-purple-500/20 text-purple-400'
                                                        : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                    {isEducator ? (
                                                        <><Shield size={10} /> Educator</>
                                                    ) : (
                                                        <><GraduationCap size={10} /> Student</>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                setPage('profile');
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                darkMode
                                                    ? 'text-gray-300 hover:bg-gray-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <User size={16} />
                                            Your Profile
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                setPage('settings');
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                darkMode
                                                    ? 'text-gray-300 hover:bg-gray-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Settings size={16} />
                                            Settings
                                        </button>

                                        {/* Upgrade to Educator (Students only) */}
                                        {!isEducator && (
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    // Could open a modal or redirect
                                                    alert('Contact admin to become an educator');
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                    darkMode
                                                        ? 'text-purple-400 hover:bg-gray-700'
                                                        : 'text-purple-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                <GraduationCap size={16} />
                                                Become an Educator
                                            </button>
                                        )}

                                        <button
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                darkMode
                                                    ? 'text-gray-300 hover:bg-gray-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <HelpCircle size={16} />
                                            Help & Support
                                        </button>
                                    </div>

                                    {/* Logout */}
                                    <div className={`py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                if (onLogout) onLogout();
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                                                darkMode
                                                    ? 'text-red-400 hover:bg-red-900/20'
                                                    : 'text-red-600 hover:bg-red-50'
                                            }`}
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`lg:hidden p-2 rounded-lg transition-colors ${
                                darkMode
                                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className={`lg:hidden py-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = currentPage === item.id;
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setPage(item.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                            isActive
                                                ? 'bg-blue-600 text-white'
                                                : darkMode
                                                    ? 'text-gray-300 hover:bg-gray-800'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{item.name}</span>
                                        {isActive && (
                                            <span className="ml-auto w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Mobile Feedback Button */}
                        <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                            <button
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium border transition-colors ${
                                    darkMode
                                        ? 'text-gray-300 border-gray-700 hover:bg-gray-800'
                                        : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <MessageSquare size={18} />
                                Send Feedback
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;