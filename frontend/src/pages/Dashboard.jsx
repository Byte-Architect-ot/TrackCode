// src/pages/Dashboard.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, CheckCircle, TrendingUp, Trophy, Globe, Target, Loader, Award, 
  Activity, Zap, Flame, BarChart3
} from 'lucide-react';
import * as Chart from 'chart.js/auto';

import { fetchCodeforcesStats } from "../api/platformAPIs";
import { fetchCodeforcesActivity } from "../api/activityAPIs";

import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import ActivityCalendar from '../components/dashboard/ActivityCalendar';
import StreakCard from '../components/dashboard/StreakCard';
import QuickStats from '../components/dashboard/QuickStats';
import PlatformCard from '../components/dashboard/PlatformCard';
import Footer from "./Footer";
import History from './History';
import Blog from "./Blog";

const PLATFORMS = ['codeforces']; // Only Codeforces now

const PLATFORM_CONFIG = {
  codeforces: { 
    name: 'Codeforces', 
    gradient: 'from-blue-600 to-blue-800', 
    icon: 'CF', 
    accent: 'text-blue-500' 
  }
};

const INITIAL_PLATFORM = {
  handle: '', 
  connected: false, 
  rating: 0, 
  max_rating: 0, 
  rank: 'Newbie',
  problems_solved: 0, 
  difficulty: { easy: 0, medium: 0, hard: 0 },
  rating_history: [], 
  extraInfo: []
};

export default function Dashboard({ onLogout }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState('');
  const [handleInput, setHandleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [activityData, setActivityData] = useState([]);
  const [activityStats, setActivityStats] = useState({
    totalSubmissions: 0, 
    uniqueProblemsSolved: 0, 
    activeDays: 0,
    currentStreak: 0, 
    longestStreak: 0
  });
  const [activityLoading, setActivityLoading] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    codeforces: { ...INITIAL_PLATFORM }
  });

  const historyChartRef = useRef(null);
  const historyChartInstance = useRef(null);

  const bgMain = darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  const toNumber = (val) => isNaN(Number(val)) ? 0 : Number(val);
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchActivityData = useCallback(async () => {
    const cfHandle = localStorage.getItem('codeforces_handle');
    if (!cfHandle) return;

    setActivityLoading(true);
    try {
      const response = await fetchCodeforcesActivity(cfHandle, 365);
      if (response.status === 'success') {
        setActivityData(response.activityData || []);
        setActivityStats(response.stats || activityStats);
      }
    } catch (error) {
      console.error('Activity fetch error:', error);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData, dashboardData.codeforces.connected]);

  const normalizeData = (platform, apiData, inputHandle) => {
    if (!apiData) return null;

    const base = {
      handle: apiData.handle || inputHandle,
      connected: true,
      rating: toNumber(apiData.rating),
      max_rating: toNumber(apiData.max_rating || apiData.maxRating),
      rank: apiData.rank || 'Newbie',
      problems_solved: toNumber(apiData.problems_solved),
      difficulty: {
        easy: toNumber(apiData.difficulty?.easy),
        medium: toNumber(apiData.difficulty?.medium),
        hard: toNumber(apiData.difficulty?.hard)
      },
      rating_history: apiData.rating_history || [],
      extraInfo: []
    };

    const extras = [];
    if (platform === 'codeforces') {
      if (apiData.rank) extras.push({ label: 'Rank', value: apiData.rank, icon: Award });
      if (apiData.contribution) extras.push({ label: 'Contribution', value: apiData.contribution, icon: Zap });
      if (apiData.maxRank) extras.push({ label: 'Max Rank', value: apiData.maxRank, icon: Trophy });
    }

    base.extraInfo = extras;
    base.global_rank = apiData.global_rank;
    base.country_rank = apiData.country_rank;
    base.institution_rank = apiData.institution_rank;
    return base;
  };

  const fetchFunctions = {
    codeforces: fetchCodeforcesStats
  };

  const handleConnect = async () => {
    if (!handleInput.trim()) return;
    setIsLoading(true);

    try {
      const rawData = await fetchFunctions[currentPlatform](handleInput);

      if (rawData && rawData.status !== 'error') {
        const processed = normalizeData(currentPlatform, rawData, handleInput);
        setDashboardData(prev => ({ ...prev, [currentPlatform]: processed }));
        localStorage.setItem(`${currentPlatform}_handle`, handleInput);
        showNotification(`Connected ${PLATFORM_CONFIG[currentPlatform].name}`);
        setModalOpen(false);
        if (currentPlatform === 'codeforces') fetchActivityData();
      } else {
        showNotification(rawData?.error || 'Connection failed', 'error');
      }
    } catch (err) {
      showNotification('Connection failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const restore = async () => {
      const promises = PLATFORMS.map(async (platform) => {
        const handle = localStorage.getItem(`${platform}_handle`);
        if (!handle) return null;

        try {
          const rawData = await fetchFunctions[platform](handle);
          if (rawData && rawData.status !== 'error') {
            return { platform, data: normalizeData(platform, rawData, handle) };
          }
        } catch (e) {
          console.error(`Failed to restore ${platform}`);
        }
        return null;
      });

      const results = await Promise.all(promises);
      setDashboardData(prev => {
        const next = { ...prev };
        results.forEach(r => r && (next[r.platform] = r.data));
        return next;
      });
    };
    restore();
  }, []);

  const totalSolved = PLATFORMS.reduce(
    (acc, p) => acc + (dashboardData[p].problems_solved || 0), 
    0
  );

  useEffect(() => {
    if (!historyChartRef.current) return;
    if (historyChartInstance.current) historyChartInstance.current.destroy();

    const datasets = PLATFORMS.map(key => {
      const p = dashboardData[key];
      if (!p.connected || !p.rating_history?.length) return null;
      return {
        label: PLATFORM_CONFIG[key].name,
        data: p.rating_history.map(h => h.rating),
        borderColor: '#3b82f6',
        tension: 0.3,
        pointRadius: 2
      };
    }).filter(Boolean);

    const maxLen = Math.max(...datasets.map(d => d.data.length), 1);

    historyChartInstance.current = new Chart.Chart(historyChartRef.current, {
      type: 'line',
      data: {
        labels: Array.from({ length: maxLen }, (_, i) => i + 1),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { labels: { color: darkMode ? '#9ca3af' : '#4b5563' } } 
        },
        scales: {
          y: { 
            grid: { color: darkMode ? '#374151' : '#e5e7eb' }, 
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280' } 
          },
          x: { display: false }
        }
      }
    });
  }, [dashboardData, darkMode]);

  return (
    <div className={`min-h-screen ${bgMain} transition-colors`}>
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          <CheckCircle size={18} />
          {notification.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <h2 className="text-lg font-medium opacity-90">Total Problems Solved</h2>
            <div className="text-6xl font-bold mt-2">{totalSolved}</div>
            <p className="mt-4 text-sm opacity-80 flex items-center gap-2">
              <Globe size={16} />
              Codeforces Platform
            </p>
            <Trophy className="absolute -bottom-8 -right-8 opacity-10" size={200} />
          </div>

          <StreakCard stats={activityStats} darkMode={darkMode} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {dashboardData.codeforces.connected ? (
              activityLoading ? (
                <div className={`${cardBg} border rounded-2xl p-12 flex items-center justify-center`}>
                  <Loader className="animate-spin text-blue-500" size={32} />
                  <span className="ml-3">Loading activity...</span>
                </div>
              ) : (
                <ActivityHeatmap activityData={activityData} darkMode={darkMode} />
              )
            ) : (
              <div className={`${cardBg} border rounded-2xl p-12 text-center`}>
                <BarChart3 size={48} className={`mx-auto mb-4 ${textMuted}`} />
                <h3 className="text-xl font-bold mb-2">Connect Codeforces</h3>
                <p className={textMuted}>Connect your account to see activity</p>
              </div>
            )}
          </div>

          <ActivityCalendar activityData={activityData} darkMode={darkMode} />
        </section>

        <QuickStats activityData={activityData} darkMode={darkMode} />

        <h2 className="text-xl font-bold flex items-center gap-2">
          <Target className="text-blue-500" /> Platforms
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLATFORMS.map(platform => (
            <PlatformCard
              key={platform}
              platform={platform}
              data={dashboardData[platform]}
              darkMode={darkMode}
              onConnect={() => { 
                setCurrentPlatform(platform); 
                setHandleInput(''); 
                setModalOpen(true); 
              }}
              onViewDetails={() => { 
                setCurrentPlatform(platform); 
                setDetailsModalOpen(true); 
              }}
            />
          ))}
        </div>

        <section className={`${cardBg} border rounded-2xl p-6`}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" /> Rating History
          </h3>
          <div className="h-72">
            <canvas ref={historyChartRef} />
          </div>
        </section>

        <Blog />
        <Footer />
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} border rounded-2xl p-6 w-full max-w-sm`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">
                Connect {PLATFORM_CONFIG[currentPlatform]?.name}
              </h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-1 rounded hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-xs font-semibold uppercase ${textMuted} mb-1 block`}>
                  Username
                </label>
                <input
                  type="text"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="Enter handle"
                  className={`w-full p-3 rounded-lg border-2 outline-none focus:border-blue-500 bg-transparent ${
                    darkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}
                />
              </div>
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"
              >
                {isLoading && <Loader className="animate-spin" size={18} />}
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center sticky top-0 ${cardBg} z-10`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${PLATFORM_CONFIG[currentPlatform].gradient} flex items-center justify-center text-white font-bold text-xl`}>
                  {PLATFORM_CONFIG[currentPlatform].icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {PLATFORM_CONFIG[currentPlatform].name}
                  </h2>
                  <p className={textMuted}>@{dashboardData[currentPlatform].handle}</p>
                </div>
              </div>
              <button 
                onClick={() => setDetailsModalOpen(false)} 
                className="p-2 rounded-full hover:bg-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-4 mb-6 border-b border-gray-700 pb-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 text-sm font-bold border-b-2 ${
                    activeTab === 'overview' 
                      ? 'text-blue-500 border-blue-500' 
                      : 'text-gray-400 border-transparent'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 text-sm font-bold border-b-2 ${
                    activeTab === 'history' 
                      ? 'text-blue-500 border-blue-500' 
                      : 'text-gray-400 border-transparent'
                  }`}
                >
                  Contest History
                </button>
              </div>

              {activeTab === 'overview' ? (
                <OverviewContent 
                  data={dashboardData[currentPlatform]} 
                  darkMode={darkMode} 
                />
              ) : (
                <History handle={dashboardData[currentPlatform].handle} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewContent({ data, darkMode }) {
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const statBg = darkMode ? 'bg-gray-700/50' : 'bg-gray-100';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Rating', value: data.rating },
          { label: 'Max Rating', value: data.max_rating },
          { label: 'Rank', value: data.rank },
          { label: 'Problems', value: data.problems_solved }
        ].map(item => (
          <div key={item.label} className={`${statBg} p-4 rounded-xl`}>
            <p className={`text-xs uppercase ${textMuted}`}>{item.label}</p>
            <p className="text-2xl font-bold">{item.value || 'N/A'}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <Activity size={18} /> Difficulty
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {['easy', 'medium', 'hard'].map(level => (
            <div key={level}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{level}</span>
                <span className="font-bold">{data.difficulty[level]}</span>
              </div>
              <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-full rounded-full ${
                    level === 'easy' 
                      ? 'bg-green-500' 
                      : level === 'medium' 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${(data.difficulty[level] / (data.problems_solved || 1)) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}