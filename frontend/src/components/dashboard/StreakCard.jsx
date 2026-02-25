// src/components/dashboard/StreakCard.jsx

import React, { useState, useEffect } from 'react';
import { 
  Flame, Trophy, Calendar, Code, Award, Zap, 
  TrendingUp, Target, Star, Crown 
} from 'lucide-react';

export default function StreakCard({ stats = {}, darkMode }) {
  const { 
    currentStreak = 0, 
    longestStreak = 0, 
    activeDays = 0, 
    uniqueProblemsSolved = 0,
    totalSubmissions = 0
  } = stats;
  
  const [celebrating, setCelebrating] = useState(false);
  
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  // Celebration trigger
  useEffect(() => {
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  // Get streak message
  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your streak today!";
    if (currentStreak >= longestStreak) return "🔥 You're on your best streak ever!";
    const diff = longestStreak - currentStreak;
    if (diff === 1) return "Just 1 more day to beat your record!";
    return `${diff} more days to beat your record!`;
  };

  // Get achievement level
  const getAchievementLevel = () => {
    if (currentStreak >= 100) return { icon: Crown, label: 'Legendary', color: 'text-yellow-500', bg: 'from-yellow-900/30 to-orange-900/30' };
    if (currentStreak >= 50) return { icon: Trophy, label: 'Master', color: 'text-purple-500', bg: 'from-purple-900/30 to-pink-900/30' };
    if (currentStreak >= 30) return { icon: Award, label: 'Expert', color: 'text-blue-500', bg: 'from-blue-900/30 to-cyan-900/30' };
    if (currentStreak >= 14) return { icon: Star, label: 'Advanced', color: 'text-emerald-500', bg: 'from-emerald-900/30 to-teal-900/30' };
    if (currentStreak >= 7) return { icon: Zap, label: 'Intermediate', color: 'text-orange-500', bg: 'from-orange-900/30 to-red-900/30' };
    return { icon: Target, label: 'Beginner', color: 'text-gray-500', bg: 'from-gray-800/30 to-gray-700/30' };
  };

  const achievement = getAchievementLevel();
  const AchievementIcon = achievement.icon;

  const mainStats = [
    { 
      label: 'Current Streak', 
      value: currentStreak, 
      unit: 'days',
      icon: Flame, 
      color: 'text-orange-500',
      bg: darkMode ? 'from-orange-900/30 to-red-900/30' : 'from-orange-50 to-red-50',
      border: darkMode ? 'border-orange-800/30' : 'border-orange-200',
      large: true,
      animate: currentStreak > 0
    },
    { 
      label: 'Longest Streak', 
      value: longestStreak, 
      unit: 'days',
      icon: Trophy, 
      color: 'text-purple-500',
      bg: darkMode ? 'from-purple-900/30 to-pink-900/30' : 'from-purple-50 to-pink-50',
      border: darkMode ? 'border-purple-800/30' : 'border-purple-200',
      large: true
    }
  ];

  const secondaryStats = [
    { 
      label: 'Active Days', 
      value: activeDays, 
      icon: Calendar, 
      color: 'text-blue-500'
    },
    { 
      label: 'Problems Solved', 
      value: uniqueProblemsSolved, 
      icon: Code, 
      color: 'text-emerald-500'
    },
    { 
      label: 'Total Submissions', 
      value: totalSubmissions, 
      icon: TrendingUp, 
      color: 'text-cyan-500'
    },
    { 
      label: 'Success Rate', 
      value: totalSubmissions > 0 ? `${Math.round((uniqueProblemsSolved / totalSubmissions) * 100)}%` : '0%',
      icon: Target, 
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className={`rounded-2xl p-6 ${cardBg} border h-full relative overflow-hidden shadow-lg`}>
      
      {/* Celebration confetti effect */}
      {celebrating && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${darkMode ? 'from-orange-900/30 to-red-900/30' : 'from-orange-100 to-red-100'}`}>
            <Flame size={24} className={`text-orange-500 ${currentStreak > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Your Streak</h3>
            <p className={`text-xs ${textMuted}`}>Keep the momentum going</p>
          </div>
        </div>

        {/* Achievement Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${achievement.bg} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <AchievementIcon size={14} className={achievement.color} />
          <span className={`text-xs font-semibold ${achievement.color}`}>
            {achievement.label}
          </span>
        </div>
      </div>

      {/* Main Streak Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {mainStats.map((item, idx) => (
          <div 
            key={idx}
            className={`p-5 rounded-xl bg-gradient-to-br ${item.bg} border ${item.border} relative overflow-hidden group hover:scale-105 transition-transform`}
          >
            {/* Background icon */}
            <item.icon 
              size={60} 
              className={`absolute -bottom-2 -right-2 ${item.color} opacity-10 group-hover:opacity-20 transition-opacity`} 
            />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <item.icon size={20} className={`${item.color} ${item.animate ? 'animate-pulse' : ''}`} />
                <span className={`text-xs font-medium ${textMuted}`}>{item.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${item.color}`}>
                  {item.value}
                </span>
                {item.unit && (
                  <span className={`text-sm ${textMuted}`}>{item.unit}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {secondaryStats.map((item, idx) => (
          <div 
            key={idx}
            className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} hover:shadow-md transition-all`}
          >
            <div className="flex items-center gap-2 mb-1">
              <item.icon size={16} className={item.color} />
              <span className={`text-xs ${textMuted}`}>{item.label}</span>
            </div>
            <span className={`text-xl font-bold ${item.color}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Motivational Message */}
      <div className={`p-4 rounded-xl text-center text-sm border ${
        currentStreak > 0 
          ? darkMode 
            ? 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-800/30 text-emerald-400' 
            : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700'
          : darkMode 
            ? 'bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-800/30 text-blue-400' 
            : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700'
      }`}>
        <p className="font-semibold">{getStreakMessage()}</p>
      </div>

      {/* Progress to next milestone */}
      {currentStreak > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={textMuted}>Next milestone</span>
            <span className="font-semibold">
              {currentStreak >= 7 ? 
                currentStreak >= 14 ? 
                  currentStreak >= 30 ? 
                    currentStreak >= 50 ? 
                      currentStreak >= 100 ? '∞ Legend' : '100 days' 
                    : '50 days' 
                  : '30 days' 
                : '14 days' 
              : '7 days'}
            </span>
          </div>
          <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000"
              style={{ 
                width: `${
                  currentStreak < 7 ? (currentStreak / 7) * 100 :
                  currentStreak < 14 ? ((currentStreak - 7) / 7) * 100 :
                  currentStreak < 30 ? ((currentStreak - 14) / 16) * 100 :
                  currentStreak < 50 ? ((currentStreak - 30) / 20) * 100 :
                  currentStreak < 100 ? ((currentStreak - 50) / 50) * 100 :
                  100
                }%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Streak visualization (flame levels) */}
      {currentStreak > 0 && (
        <div className="mt-5 flex items-center justify-center gap-1">
          {[...Array(Math.min(currentStreak, 10))].map((_, i) => (
            <Flame 
              key={i}
              size={16}
              className={`${
                i < 3 ? 'text-orange-500' :
                i < 7 ? 'text-orange-400' :
                'text-orange-300'
              } animate-pulse`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
          {currentStreak > 10 && (
            <span className="text-xs font-bold text-orange-500 ml-1">
              +{currentStreak - 10}
            </span>
          )}
        </div>
      )}
    </div>
  );
}