import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, PlusCircle, Trophy, Clock, Code, FileText, ArrowRight } from 'lucide-react';
import axios from 'axios';
import API_CONFIG from '../api/apiconfig';

export default function Contest({ darkMode: propDarkMode }) {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return propDarkMode !== undefined ? propDarkMode : (saved ? JSON.parse(saved) : false);
    });
    const [activeTab, setActiveTab] = useState('join');
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const token = localStorage.getItem('usertoken') || localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchContests();
    }, [activeTab]);

    const fetchContests = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'my' 
                ? API_CONFIG.ENDPOINTS.MY_CONTESTS 
                : API_CONFIG.ENDPOINTS.ALL_CONTESTS;
            
            const response = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`, {
                headers: { token }
            });
            setContests(response.data.contests || []);
        } catch (error) {
            console.error('Failed to fetch contests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinContest = async (contestId) => {
        try {
            await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOIN_CONTEST}`, 
                { contestId }, 
                { headers: { token } }
            );
            navigate(`/contest/live/${contestId}`);
        } catch (error) {
            alert('Failed to join contest');
        }
    };

    const handleJoinWithCode = async () => {
        if (!joinCode.trim()) {
            alert('Please enter a contest code');
            return;
        }
        try {
            await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOIN_CONTEST}`, 
                { contestCode: joinCode }, 
                { headers: { token } }
            );
            // Navigate to the contest
            navigate(`/contest/live/${joinCode}`);
        } catch (error) {
            alert('Invalid contest code');
        }
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className={`rounded-xl p-6 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Contest Arena
                    </h1>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Create your own contests or join existing ones to test your skills
                    </p>
                </div>

                {/* Action Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Create Contest Card */}
                    <div 
                        onClick={() => navigate('/contest/create')}
                        className={`rounded-xl p-6 cursor-pointer transition-all hover:scale-105 ${
                            darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600' 
                                     : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                        } text-white shadow-xl`}
                    >
                        <PlusCircle size={48} className="mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Create Contest</h2>
                        <p className="mb-4 opacity-90">
                            Set up your own programming contest with custom problems and rules
                        </p>
                        <div className="flex items-center text-sm opacity-75">
                            <ArrowRight size={20} className="ml-auto" />
                        </div>
                    </div>

                    {/* Join Contest Card */}
                    <div className={`rounded-xl p-6 ${
                        darkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-xl`}>
                        <Users size={48} className={`mb-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Join Contest
                        </h2>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Enter contest code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300'
                                }`}
                            />
                            <button
                                onClick={handleJoinWithCode}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Join with Code
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contest Lists */}
                <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        {['join', 'my', 'joined'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 font-medium transition-colors ${
                                    activeTab === tab
                                        ? darkMode 
                                            ? 'text-blue-400 border-b-2 border-blue-400' 
                                            : 'text-blue-600 border-b-2 border-blue-600'
                                        : darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                            >
                                {tab === 'join' ? 'Available Contests' : 
                                 tab === 'my' ? 'My Contests' : 'Joined Contests'}
                            </button>
                        ))}
                    </div>

                    {/* Contest List */}
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            </div>
                        ) : contests.length === 0 ? (
                            <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                No contests available
                            </p>
                        ) : (
                            <div className="grid gap-4">
                                {contests.map((contest) => (
                                    <ContestCard 
                                        key={contest._id} 
                                        contest={contest} 
                                        darkMode={darkMode}
                                        onJoin={() => handleJoinContest(contest._id)}
                                        isOwner={activeTab === 'my'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Contest Card Component
function ContestCard({ contest, darkMode, onJoin, isOwner }) {
    const navigate = useNavigate();
    
    return (
        <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {contest.title}
                    </h3>
                    <div className={`flex items-center gap-4 mt-2 text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {contest.duration} mins
                        </span>
                        <span className="flex items-center gap-1">
                            <FileText size={14} />
                            {contest.mcqCount || 0} MCQs
                        </span>
                        <span className="flex items-center gap-1">
                            <Code size={14} />
                            {contest.codingCount || 0} Coding
                        </span>
                        <span className="flex items-center gap-1">
                            <Users size={14} />
                            {contest.participants || 0} joined
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isOwner ? (
                        <>
                            <button
                                onClick={() => navigate(`/contest/edit/${contest._id}`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => navigate(`/contest/results/${contest._id}`)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Results
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onJoin}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Join Contest
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}