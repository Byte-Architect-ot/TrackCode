// src/pages/ContestsList.jsx - Browse and Join Contests

import React, { useState, useEffect } from 'react';
import {
    Trophy, Calendar, Clock, Users, Play, LogIn,
    Search, Filter, Loader, AlertCircle, ChevronRight,
    CheckCircle, PlusCircle, FileEdit, FileText, Code
} from 'lucide-react';
import { contestApi } from '../api/contestAPIs';

const ContestsList = ({ darkMode, setPage, isEducator = false }) => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPhase, setFilterPhase] = useState('all');
    const [sortBy, setSortBy] = useState('upcoming');

    useEffect(() => {
        loadContests();
    }, [filterPhase, sortBy]);

    const loadContests = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {};
            if (filterPhase !== 'all') {
                params.phase = filterPhase;
            }
            
            const response = await contestApi.getAll(params);
            let allContests = response.contests || [];
            
            // Apply sorting
            if (sortBy === 'upcoming') {
                allContests.sort((a, b) => new Date(a.testTime) - new Date(b.testTime));
            } else if (sortBy === 'recent') {
                allContests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (sortBy === 'popular') {
                allContests.sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0));
            }
            
            setContests(allContests);
        } catch (err) {
            setError(err.message || 'Failed to load contests');
            console.error('Load contests error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinContest = async (contestId) => {
        try {
            await contestApi.join(contestId);
            loadContests(); // Refresh to show joined status
            if (typeof window?.showToast === 'function') {
                window.showToast('Successfully registered for the contest!', 'success');
            } else {
                alert('Successfully registered for the contest!');
            }
        } catch (err) {
            alert('Failed to join contest: ' + (err.message || 'Unknown error'));
        }
    };

    const handleStartContest = (contestId) => {
        setPage('take-test', { testId: contestId });
    };

    const handleCreateContest = () => {
        setPage('practice'); // Practice page has educator create flow
    };

    const filteredContests = contests.filter(contest =>
        contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contest.description && contest.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const phaseConfig = {
        'upcoming': { label: 'Upcoming', color: 'blue', bgColor: 'blue-100 dark:blue-900' },
        'running': { label: 'Running', color: 'green', bgColor: 'green-100 dark:green-900' },
        'completed': { label: 'Completed', color: 'gray', bgColor: 'gray-100 dark:gray-700' }
    };

    const getPhaseLabel = (phase) => {
        return phaseConfig[phase]?.label || phase;
    };

    const getPhaseColor = (phase) => {
        const config = phaseConfig[phase];
        if (!config) return 'gray';
        return config.color;
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className={`min-h-screen py-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy size={32} className="text-yellow-500" />
                                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Contests
                                </h1>
                            </div>
                            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {isEducator
                                    ? 'Create tests or browse and manage contests'
                                    : 'Browse and participate in coding contests'}
                            </p>
                        </div>
                        {isEducator && (
                            <button
                                onClick={handleCreateContest}
                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${
                                    darkMode
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                <PlusCircle size={20} />
                                Create Test
                            </button>
                        )}
                    </div>
                </div>

                {/* Join / Create options for educators - show both */}
                {isEducator && (
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div
                            onClick={handleCreateContest}
                            className={`rounded-xl p-4 cursor-pointer border-2 transition-all ${
                                darkMode
                                    ? 'bg-gray-800 border-blue-500/50 hover:border-blue-400 hover:bg-gray-700/80'
                                    : 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                    <FileEdit size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Create Test
                                    </h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Set up tests with MCQs, coding problems, timing & visibility
                                    </p>
                                </div>
                                <ChevronRight size={20} className={`ml-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            </div>
                        </div>
                        <div className={`rounded-xl p-4 border ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                                    <LogIn size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Join / Browse
                                    </h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Participate in other contests or manage your created tests below
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className={`rounded-xl border p-4 mb-6 ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search size={18} className={`absolute left-3 top-3 ${
                                darkMode ? 'text-gray-500' : 'text-gray-400'
                            }`} />
                            <input
                                type="text"
                                placeholder="Search contests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                                    darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex items-center gap-2">
                            <Filter size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                            <select
                                value={filterPhase}
                                onChange={(e) => setFilterPhase(e.target.value)}
                                className={`flex-1 px-4 py-2 rounded-lg border ${
                                    darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            >
                                <option value="all">All Phases</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="running">Running</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={`px-4 py-2 rounded-lg border ${
                                darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="upcoming">Upcoming First</option>
                            <option value="recent">Most Recent</option>
                            <option value="popular">Most Popular</option>
                        </select>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <Loader size={32} className={`animate-spin mx-auto mb-4 ${
                                darkMode ? 'text-blue-400' : 'text-blue-600'
                            }`} />
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Loading contests...
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    <div className={`rounded-xl border p-6 ${
                        darkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex items-start gap-3">
                            <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-900'}`}>
                                    Error Loading Contests
                                </h3>
                                <p className={`text-sm mt-1 ${
                                    darkMode ? 'text-red-300' : 'text-red-700'
                                }`}>
                                    {error}
                                </p>
                                <button
                                    onClick={loadContests}
                                    className={`mt-3 px-4 py-2 rounded-lg font-medium ${
                                        darkMode
                                            ? 'bg-red-700 text-white hover:bg-red-600'
                                            : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                ) : filteredContests.length === 0 ? (
                    <div className={`rounded-xl border p-12 text-center ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <Trophy size={48} className={`mx-auto mb-4 opacity-50 ${
                            darkMode ? 'text-gray-600' : 'text-gray-300'
                        }`} />
                        <h3 className={`text-xl font-bold mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            No contests found
                        </h3>
                        <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                            {searchTerm ? 'Try adjusting your search filters' : 'Check back later for new contests'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredContests.map(contest => (
                            <ContestCard
                                key={contest._id}
                                contest={contest}
                                darkMode={darkMode}
                                onJoin={() => handleJoinContest(contest._id)}
                                onStart={() => handleStartContest(contest._id)}
                                formatDateTime={formatDateTime}
                                formatDuration={formatDuration}
                                getPhaseLabel={getPhaseLabel}
                                getPhaseColor={getPhaseColor}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ContestCard = ({
    contest,
    darkMode,
    onJoin,
    onStart,
    formatDateTime,
    formatDuration,
    getPhaseLabel,
    getPhaseColor
}) => {
    const phaseConfig = {
        'upcoming': { bgColor: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
        'running': { bgColor: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
        'completed': { bgColor: 'bg-gray-500', textColor: 'text-gray-600 dark:text-gray-400' }
    };

    const config = phaseConfig[contest.phase] || phaseConfig.upcoming;
    const canParticipate = contest.phase === 'running' || contest.phase === 'upcoming';

    return (
        <div className={`rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {/* Title and Phase */}
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {contest.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                darkMode
                                    ? `bg-${getPhaseColor(contest.phase)}-900/30 text-${getPhaseColor(contest.phase)}-400`
                                    : `bg-${getPhaseColor(contest.phase)}-100 text-${getPhaseColor(contest.phase)}-700`
                            }`}>
                                {getPhaseLabel(contest.phase)}
                            </span>
                        </div>

                        {/* Description */}
                        {contest.description && (
                            <p className={`text-sm mb-4 line-clamp-2 ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {contest.description}
                            </p>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            {/* Date/Time */}
                            <div>
                                <div className={`text-xs font-medium mb-1 ${
                                    darkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                    Start Time
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                                    <span className={`text-sm font-semibold ${
                                        darkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        {formatDateTime(contest.testTime)}
                                    </span>
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <div className={`text-xs font-medium mb-1 ${
                                    darkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                    Duration
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                                    <span className={`text-sm font-semibold ${
                                        darkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        {formatDuration(contest.totalTime)}
                                    </span>
                                </div>
                            </div>

                            {/* Creator */}
                            <div>
                                <div className={`text-xs font-medium mb-1 ${
                                    darkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                    Creator
                                </div>
                                <span className={`text-sm font-semibold ${
                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    {contest.examTakerId?.name || 'Unknown'}
                                </span>
                            </div>

                            {/* Participants */}
                            <div>
                                <div className={`text-xs font-medium mb-1 ${
                                    darkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                    Participants
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                                    <span className={`text-sm font-semibold ${
                                        darkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        {contest.students?.length || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Questions Count */}
                            <div>
                                <div className={`text-xs font-medium mb-1 ${
                                    darkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                    Questions
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                                    <span className={`text-sm font-semibold ${
                                        darkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        {(contest.questions?.length || 0) + (contest.problems?.length || 0)}
                                    </span>
                                    <span className={`text-xs ${
                                        darkMode ? 'text-gray-500' : 'text-gray-500'
                                    }`}>
                                        ({contest.questions?.length || 0} MCQ, {contest.problems?.length || 0} Coding)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col gap-2">
                        {canParticipate ? (
                            <>
                                <button
                                    onClick={onStart}
                                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        contest.phase === 'running'
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                    title={contest.phase === 'running' ? 'Start test' : 'View contest'}
                                >
                                    {contest.phase === 'running' ? (
                                        <>
                                            <Play size={16} />
                                            <span>Start</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={16} />
                                            <span>Join</span>
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                disabled
                                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed ${
                                    darkMode
                                        ? 'bg-gray-700 text-gray-400'
                                        : 'bg-gray-200 text-gray-500'
                                }`}
                            >
                                <CheckCircle size={16} />
                                <span>Completed</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestsList;
