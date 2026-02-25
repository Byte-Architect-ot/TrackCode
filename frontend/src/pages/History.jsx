// src/components/History.jsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
    fetchCodeforcesHistory, 
    fetchLeetCodeHistory
} from "../api/platformAPIs"; 
import { 
    Search, TrendingUp, TrendingDown, Activity, Calendar, Hash, 
    Zap, AlertCircle, Target, Code, Award, Star, RefreshCw,
    ChevronDown, ChevronUp, ExternalLink, Trophy, Info,
    BarChart2, ArrowUpRight, ArrowDownRight, Minus, BookOpen
} from 'lucide-react';
import * as Chart from 'chart.js/auto';

// Platform Configuration
const PLATFORM_CONFIG = {
    codeforces: {
        name: 'Codeforces',
        shortName: 'CF',
        icon: Code,
        color: '#3B82F6',
        bgGradient: 'from-blue-500 to-blue-700',
        lightBg: 'bg-blue-50 dark:bg-blue-900/20',
        fetchHistory: fetchCodeforcesHistory,
        contestUrl: (id) => `https://codeforces.com/contest/${id}`,
        hasContestHistory: true
    },
    leetcode: {
        name: 'LeetCode',
        shortName: 'LC',
        icon: Star,
        color: '#F59E0B',
        bgGradient: 'from-orange-500 to-orange-700',
        lightBg: 'bg-orange-50 dark:bg-orange-900/20',
        fetchHistory: fetchLeetCodeHistory,
        contestUrl: (id) => `https://leetcode.com/contest/${id}`,
        hasContestHistory: true
    },
};

const History = ({ handle: propHandle, darkMode = true }) => {
    // State
    const [platform, setPlatform] = useState('codeforces');
    const [searchInput, setSearchInput] = useState('');
    const [activeHandle, setActiveHandle] = useState(propHandle || null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [message, setMessage] = useState(null);
    const [expandedContest, setExpandedContest] = useState(null);
    const [sortOrder, setSortOrder] = useState('newest');
    const [filterPositive, setFilterPositive] = useState(null);

    // Chart Refs
    const ratingChartRef = useRef(null);
    const ratingChartInstance = useRef(null);
    const distributionChartRef = useRef(null);
    const distributionChartInstance = useRef(null);

    // Get current platform config
    const config = PLATFORM_CONFIG[platform];
    const PlatformIcon = config.icon;

    // Load initial handle
    useEffect(() => {
        if (propHandle) {
            setSearchInput(propHandle);
            setActiveHandle(propHandle);
        } else {
            const savedHandle = localStorage.getItem(`${platform}_handle`);
            if (savedHandle) setSearchInput(savedHandle);
        }
    }, [propHandle]);

    // Handle platform change
    useEffect(() => {
        const savedHandle = localStorage.getItem(`${platform}_handle`);
        setSearchInput(savedHandle || '');
        setActiveHandle(null);
        setHistory([]);
        setError(null);
        setStats(null);
        setMessage(null);
    }, [platform]);

    // Search Handler
    const handleSearch = useCallback(async (handleToSearch = searchInput) => {
        if (!handleToSearch?.trim()) return;

        setLoading(true);
        setError(null);
        setMessage(null);
        setActiveHandle(null);
        setHistory([]);
        setStats(null);

        try {
            localStorage.setItem(`${platform}_handle`, handleToSearch);
            
            const data = await config.fetchHistory(handleToSearch);
            console.log(`${platform} response:`, data);

            if (data.status === 'success') {
                setHistory(data.history || []);
                setActiveHandle(handleToSearch);
                setMessage(data.message || null);
                setStats({
                    totalContests: data.totalContests || data.history?.length || 0,
                    currentRating: data.currentRating || 0,
                    maxRating: data.maxRating || 0,
                    minRating: data.minRating || 0,
                    globalRanking: data.globalRanking || 0,
                    topPercentage: data.topPercentage || 0,
                    currentRank: data.currentRank || '',
                    currentStars: data.currentStars || 0,
                    codingScore: data.codingScore || 0,
                    problemsSolved: data.problemsSolved || 0,
                    currentStreak: data.currentStreak || 0,
                    difficulty: data.difficulty || null
                });
            } else {
                setError(data.error || 'Failed to fetch data');
            }
        } catch (err) {
            setError('Failed to fetch data. Please check the username and try again.');
        } finally {
            setLoading(false);
        }
    }, [searchInput, platform, config]);

    // Filter and sort history
    const filteredHistory = React.useMemo(() => {
        let result = [...history];

        if (filterPositive === true) {
            result = result.filter(h => h.ratingChange > 0);
        } else if (filterPositive === false) {
            result = result.filter(h => h.ratingChange < 0);
        }

        if (sortOrder === 'oldest') {
            result.reverse();
        } else if (sortOrder === 'best') {
            result.sort((a, b) => b.ratingChange - a.ratingChange);
        } else if (sortOrder === 'worst') {
            result.sort((a, b) => a.ratingChange - b.ratingChange);
        }

        return result;
    }, [history, sortOrder, filterPositive]);

    // Calculate derived stats
    const derivedStats = React.useMemo(() => {
        if (history.length === 0) return null;

        const positiveChanges = history.filter(h => h.ratingChange > 0);
        const negativeChanges = history.filter(h => h.ratingChange < 0);
        const avgChange = history.reduce((sum, h) => sum + h.ratingChange, 0) / history.length;
        const avgPositive = positiveChanges.length > 0
            ? positiveChanges.reduce((sum, h) => sum + h.ratingChange, 0) / positiveChanges.length
            : 0;
        const avgNegative = negativeChanges.length > 0
            ? negativeChanges.reduce((sum, h) => sum + h.ratingChange, 0) / negativeChanges.length
            : 0;
        const bestRank = Math.min(...history.filter(h => h.rank > 0).map(h => h.rank));
        const recentForm = history.slice(0, 5).reduce((sum, h) => sum + h.ratingChange, 0);

        return {
            winRate: ((positiveChanges.length / history.length) * 100).toFixed(1),
            avgChange: avgChange.toFixed(1),
            avgPositive: avgPositive.toFixed(0),
            avgNegative: avgNegative.toFixed(0),
            bestRank: bestRank === Infinity ? 'N/A' : bestRank,
            recentForm,
            totalGain: positiveChanges.reduce((sum, h) => sum + h.ratingChange, 0),
            totalLoss: Math.abs(negativeChanges.reduce((sum, h) => sum + h.ratingChange, 0))
        };
    }, [history]);

    // Rating Chart
    useEffect(() => {
        if (!ratingChartRef.current || history.length === 0) return;

        if (ratingChartInstance.current) {
            ratingChartInstance.current.destroy();
        }

        const reversedData = [...history].reverse();

        ratingChartInstance.current = new Chart.Chart(ratingChartRef.current, {
            type: 'line',
            data: {
                labels: reversedData.map((d, i) => {
                    if (d.date) {
                        return new Date(d.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                        });
                    }
                    return `#${i + 1}`;
                }),
                datasets: [{
                    label: 'Rating',
                    data: reversedData.map(d => d.newRating || 0),
                    borderColor: config.color,
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, `${config.color}40`);
                        gradient.addColorStop(1, `${config.color}05`);
                        return gradient;
                    },
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 8,
                    pointBackgroundColor: config.color,
                    pointBorderColor: darkMode ? '#1F2937' : '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: darkMode ? '#1F2937' : '#fff',
                        titleColor: darkMode ? '#F9FAFB' : '#111827',
                        bodyColor: darkMode ? '#D1D5DB' : '#4B5563',
                        borderColor: darkMode ? '#374151' : '#E5E7EB',
                        borderWidth: 1,
                        cornerRadius: 12,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                const idx = context.dataIndex;
                                const contest = reversedData[idx];
                                return [
                                    `Rating: ${contest.newRating}`,
                                    `Change: ${contest.ratingChange >= 0 ? '+' : ''}${contest.ratingChange}`,
                                    `Rank: #${contest.rank || 'N/A'}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxTicksLimit: 8,
                            color: darkMode ? '#9CA3AF' : '#6B7280'
                        }
                    },
                    y: {
                        grid: { color: darkMode ? '#374151' : '#E5E7EB' },
                        ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    }, [history, darkMode, config.color]);

    // Distribution Chart
    useEffect(() => {
        if (!distributionChartRef.current || history.length === 0) return;

        if (distributionChartInstance.current) {
            distributionChartInstance.current.destroy();
        }

        const positive = history.filter(h => h.ratingChange > 0).length;
        const negative = history.filter(h => h.ratingChange < 0).length;
        const neutral = history.filter(h => h.ratingChange === 0).length;

        distributionChartInstance.current = new Chart.Chart(distributionChartRef.current, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Negative', 'No Change'],
                datasets: [{
                    data: [positive, negative, neutral],
                    backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            color: darkMode ? '#9CA3AF' : '#6B7280',
                            padding: 10
                        }
                    }
                }
            }
        });
    }, [history, darkMode]);

    // Styles
    const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
    const inputBg = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200';

    return (
        <div className={`max-w-7xl mx-auto p-4 lg:p-6 space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            
            {/* Header */}
            <div className="text-center space-y-2 py-4">
                <h1 className={`text-3xl lg:text-4xl font-bold ${textPrimary}`}>
                    Contest History
                </h1>
                <p className={textSecondary}>
                    Track your competitive programming journey across platforms
                </p>
            </div>

            {/* Search Section */}
            <div className={`${cardBg} border rounded-2xl p-4 lg:p-6`}>
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Platform Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => {
                            const Icon = cfg.icon;
                            const isActive = platform === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setPlatform(key)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                                        isActive
                                            ? `bg-gradient-to-r ${cfg.bgGradient} text-white shadow-lg`
                                            : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${textPrimary}`
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span className="hidden sm:inline">{cfg.name}</span>
                                    <span className="sm:hidden">{cfg.shortName}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="flex-1 flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={`Enter ${config.name} username...`}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className={`w-full px-4 py-3 rounded-xl border-2 ${inputBg} ${textPrimary} placeholder-gray-500 outline-none focus:border-blue-500 transition-colors`}
                            />
                        </div>
                        <button
                            onClick={() => handleSearch()}
                            disabled={loading}
                            style={{ backgroundColor: config.color }}
                            className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <Search size={20} />
                            )}
                            <span className="hidden sm:inline">Search</span>
                        </button>
                    </div>
                </div>

                {/* Platform Notice */}
                {!config.hasContestHistory && (
                    <div className={`mt-4 flex items-start gap-2 ${darkMode ? 'text-amber-400 bg-amber-900/20' : 'text-amber-600 bg-amber-50'} px-4 py-3 rounded-xl`}>
                        <Info size={18} className="mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                            {config.name} does not provide public contest history API. Profile stats will be shown instead.
                        </span>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-3 rounded-xl border border-red-800">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {activeHandle && !loading && stats && (
                <div className="space-y-6 animate-fadeIn">
                    
                    {/* User Badge */}
                    <div className="flex items-center justify-center">
                        <div 
                            className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full ${config.lightBg} border`}
                            style={{ borderColor: `${config.color}40` }}
                        >
                            <PlatformIcon size={24} style={{ color: config.color }} />
                            <span className={`font-bold text-lg ${textPrimary}`}>{activeHandle}</span>
                            {stats.currentRating > 0 && (
                                <>
                                    <span className={textSecondary}>|</span>
                                    <span style={{ color: config.color }} className="font-semibold">
                                        {stats.currentRating} Rating
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className={`flex items-start gap-2 ${darkMode ? 'text-blue-400 bg-blue-900/20' : 'text-blue-600 bg-blue-50'} px-4 py-3 rounded-xl`}>
                            <Info size={18} className="mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{message}</span>
                        </div>
                    )}

                    {/* Stats Grid - For all platforms */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {stats.currentRating > 0 && (
                            <StatCard
                                label="Current Rating"
                                value={stats.currentRating}
                                icon={Zap}
                                color={config.color}
                                darkMode={darkMode}
                            />
                        )}
                        {stats.maxRating > 0 && (
                            <StatCard
                                label="Max Rating"
                                value={stats.maxRating}
                                icon={Trophy}
                                color="#F59E0B"
                                darkMode={darkMode}
                            />
                        )}
                        {stats.totalContests > 0 && (
                            <StatCard
                                label="Contests"
                                value={stats.totalContests}
                                icon={Hash}
                                color="#8B5CF6"
                                darkMode={darkMode}
                            />
                        )}
                        {derivedStats && history.length > 0 && (
                            <StatCard
                                label="Win Rate"
                                value={`${derivedStats.winRate}%`}
                                icon={Target}
                                color="#10B981"
                                darkMode={darkMode}
                            />
                        )}
                        {stats.problemsSolved > 0 && (
                            <StatCard
                                label="Problems Solved"
                                value={stats.problemsSolved}
                                icon={BookOpen}
                                color="#EC4899"
                                darkMode={darkMode}
                            />
                        )}
                        {stats.codingScore > 0 && (
                            <StatCard
                                label="Coding Score"
                                value={stats.codingScore}
                                icon={Award}
                                color="#10B981"
                                darkMode={darkMode}
                            />
                        )}
                        {stats.currentStreak > 0 && (
                            <StatCard
                                label="Current Streak"
                                value={`${stats.currentStreak} days`}
                                icon={Activity}
                                color="#F59E0B"
                                darkMode={darkMode}
                            />
                        )}
                        {stats.globalRanking > 0 && (
                            <StatCard
                                label="Global Ranking"
                                value={`#${stats.globalRanking}`}
                                icon={Trophy}
                                color="#8B5CF6"
                                darkMode={darkMode}
                            />
                        )}
                        {derivedStats && derivedStats.bestRank !== 'N/A' && (
                            <StatCard
                                label="Best Rank"
                                value={`#${derivedStats.bestRank}`}
                                icon={Award}
                                color="#EC4899"
                                darkMode={darkMode}
                            />
                        )}
                        {derivedStats && (
                            <StatCard
                                label="Recent Form"
                                value={`${derivedStats.recentForm >= 0 ? '+' : ''}${derivedStats.recentForm}`}
                                icon={Activity}
                                color={derivedStats.recentForm >= 0 ? '#10B981' : '#EF4444'}
                                darkMode={darkMode}
                                trend={derivedStats.recentForm >= 0 ? 'up' : 'down'}
                            />
                        )}
                    </div>


                    {/* Charts Section - Only if has contest history */}
                    {history.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Rating Chart */}
                            <div className={`lg:col-span-2 ${cardBg} border rounded-2xl p-6`}>
                                <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textPrimary}`}>
                                    <TrendingUp style={{ color: config.color }} size={20} />
                                    Rating Trajectory
                                </h3>
                                <div className="h-72">
                                    <canvas ref={ratingChartRef} />
                                </div>
                            </div>

                            {/* Distribution Chart */}
                            <div className={`${cardBg} border rounded-2xl p-6`}>
                                <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textPrimary}`}>
                                    <BarChart2 style={{ color: config.color }} size={20} />
                                    Performance Split
                                </h3>
                                <div className="h-48">
                                    <canvas ref={distributionChartRef} />
                                </div>
                                {derivedStats && (
                                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-green-500" />
                                            <span className={textSecondary}>Avg Gain:</span>
                                            <span className="text-green-500 font-bold">+{derivedStats.avgPositive}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-red-500" />
                                            <span className={textSecondary}>Avg Loss:</span>
                                            <span className="text-red-500 font-bold">{derivedStats.avgNegative}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contest List - Only if has history */}
                    {history.length > 0 && (
                        <div className={`${cardBg} border rounded-2xl overflow-hidden`}>
                            {/* List Header */}
                            <div className={`p-4 lg:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col lg:flex-row lg:items-center justify-between gap-4`}>
                                <h3 className={`font-bold text-lg flex items-center gap-2 ${textPrimary}`}>
                                    <Code style={{ color: config.color }} size={20} />
                                    Contest History
                                    <span className={`text-sm font-normal ${textSecondary}`}>
                                        ({filteredHistory.length} contests)
                                    </span>
                                </h3>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Filter Buttons */}
                                    <div className={`flex items-center gap-1 p-1 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                        <button
                                            onClick={() => setFilterPositive(null)}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                filterPositive === null
                                                    ? `${darkMode ? 'bg-gray-600' : 'bg-white shadow'} ${textPrimary}`
                                                    : textSecondary
                                            }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setFilterPositive(true)}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                                                filterPositive === true
                                                    ? 'bg-green-600 text-white'
                                                    : textSecondary
                                            }`}
                                        >
                                            <ArrowUpRight size={14} /> Gains
                                        </button>
                                        <button
                                            onClick={() => setFilterPositive(false)}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                                                filterPositive === false
                                                    ? 'bg-red-600 text-white'
                                                    : textSecondary
                                            }`}
                                        >
                                            <ArrowDownRight size={14} /> Losses
                                        </button>
                                    </div>

                                    {/* Sort Dropdown */}
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium ${inputBg} ${textPrimary} border outline-none cursor-pointer`}
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="best">Best Performance</option>
                                        <option value="worst">Worst Performance</option>
                                    </select>
                                </div>
                            </div>

                            {/* Contest List */}
                            <div className={`divide-y ${darkMode ? 'divide-gray-700/50' : 'divide-gray-100'} max-h-[600px] overflow-y-auto`}>
                                {filteredHistory.map((contest, idx) => (
                                    <ContestRow
                                        key={contest.contestId || idx}
                                        contest={contest}
                                        platform={platform}
                                        config={config}
                                        darkMode={darkMode}
                                        isExpanded={expandedContest === idx}
                                        onToggle={() => setExpandedContest(expandedContest === idx ? null : idx)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State - No contest history */}
                    {history.length === 0 && !message && !error && (
                        <div className={`${cardBg} border rounded-2xl p-12 text-center`}>
                            <Trophy size={48} className={`mx-auto mb-4 ${textSecondary}`} />
                            <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>No Contest History</h3>
                            <p className={textSecondary}>
                                This user hasn't participated in any rated contests yet.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className={`${cardBg} border rounded-2xl p-12 flex flex-col items-center justify-center`}>
                    <RefreshCw 
                        className="animate-spin mb-4" 
                        size={48} 
                        style={{ color: config.color }} 
                    />
                    <p className={textSecondary}>Fetching data from {config.name}...</p>
                </div>
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color, darkMode, trend }) => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4 relative overflow-hidden group hover:scale-105 transition-transform`}>
        <div 
            className="absolute top-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity"
            style={{ color }}
        >
            <Icon size={64} />
        </div>
        <div className="relative z-10">
            <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {label}
            </p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold" style={{ color }}>
                    {value}
                </span>
                {trend === 'up' && <TrendingUp size={18} className="text-green-500" />}
                {trend === 'down' && <TrendingDown size={18} className="text-red-500" />}
            </div>
        </div>
    </div>
);

// Contest Row Component
const ContestRow = ({ contest, platform, config, darkMode, isExpanded, onToggle }) => {
    const ratingChange = contest.ratingChange || 0;
    const isPositive = ratingChange > 0;
    const isNegative = ratingChange < 0;

    const formattedDate = contest.date
        ? new Date(contest.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
        : 'N/A';

    const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';

    return (
        <div className={`${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'} transition-colors`}>
            {/* Main Row */}
            <div 
                className="p-4 lg:px-6 flex items-center gap-4 cursor-pointer"
                onClick={onToggle}
            >
                {/* Rank Badge */}
                <div 
                    className="hidden sm:flex w-12 h-12 rounded-xl items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    style={{ backgroundColor: contest.color || config.color }}
                >
                    #{contest.rank || '-'}
                </div>

                {/* Contest Info */}
                <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold truncate ${textPrimary}`}>
                        {contest.contestName}
                    </h4>
                    <div className={`flex items-center gap-3 text-sm ${textSecondary}`}>
                        <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formattedDate}
                        </span>
                        <span className="sm:hidden">
                            Rank #{contest.rank || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Rating Info */}
                <div className="flex items-center gap-4">
                    {/* Rating Change */}
                    <div className={`flex items-center gap-1 font-bold ${
                        isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : textSecondary
                    }`}>
                        {isPositive && <ArrowUpRight size={18} />}
                        {isNegative && <ArrowDownRight size={18} />}
                        {!isPositive && !isNegative && <Minus size={18} />}
                        <span className="text-lg">
                            {isPositive ? '+' : ''}{ratingChange}
                        </span>
                    </div>

                    {/* New Rating */}
                    <div className="text-right hidden md:block">
                        <p className={`text-sm ${textSecondary}`}>Rating</p>
                        <p className={`font-bold ${textPrimary}`} style={{ color: contest.color }}>
                            {contest.newRating}
                        </p>
                    </div>

                    {/* Expand Icon */}
                    <div className={textSecondary}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className={`px-4 lg:px-6 pb-4 pt-0 ${darkMode ? 'bg-gray-700/20' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        <div>
                            <p className={`text-xs uppercase font-semibold ${textSecondary}`}>Old Rating</p>
                            <p className={`text-lg font-bold ${textPrimary}`}>{contest.oldRating}</p>
                        </div>
                        <div>
                            <p className={`text-xs uppercase font-semibold ${textSecondary}`}>New Rating</p>
                            <p className="text-lg font-bold" style={{ color: contest.color }}>
                                {contest.newRating}
                            </p>
                        </div>
                        <div>
                            <p className={`text-xs uppercase font-semibold ${textSecondary}`}>Rank</p>
                            <p className={`text-lg font-bold ${textPrimary}`}>#{contest.rank || 'N/A'}</p>
                        </div>
                        {contest.problemsSolved !== undefined && (
                            <div>
                                <p className={`text-xs uppercase font-semibold ${textSecondary}`}>Problems</p>
                                <p className={`text-lg font-bold ${textPrimary}`}>
                                    {contest.problemsSolved}
                                    {contest.totalProblems ? `/${contest.totalProblems}` : ''}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Contest Link */}
                    <a
                        href={config.contestUrl(contest.contestId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                        style={{ color: config.color }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        View Contest <ExternalLink size={14} />
                    </a>
                </div>
            )}
        </div>
    );
};

export default History;