// src/components/dashboard/PlatformCard.jsx

import React, { useState } from 'react';
import { 
  CheckCircle, TrendingUp, Award, Star, GitBranch,
  ExternalLink, RefreshCw, BarChart2 
} from 'lucide-react';

const platformConfig = {
  codeforces: { 
    name: 'Codeforces', 
    gradient: 'from-blue-600 to-blue-800', 
    icon: 'CF', 
    accent: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  leetcode: { 
    name: 'LeetCode', 
    gradient: 'from-orange-600 to-orange-800', 
    icon: 'LC', 
    accent: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
  github: { 
    name: 'GitHub', 
    gradient: 'from-gray-600 to-gray-800', 
    icon: 'GH', 
    accent: 'text-gray-400',
    bg: 'bg-gray-500/10'
  }
};

export default function PlatformCard({ 
  platform, 
  data, 
  darkMode, 
  onConnect, 
  onViewDetails 
}) {
  const [showChart, setShowChart] = useState(false);
  const config = platformConfig[platform];
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const btnBg = darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200';
  const isGithub = platform === 'github';

  // Calculate progress percentages
  const totalProblems = isGithub 
    ? data.public_repos 
    : (data.difficulty?.easy || 0) + (data.difficulty?.medium || 0) + (data.difficulty?.hard || 0);

  return (
    <div className={`${cardBg} border rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden`}>
      
      {/* Background Gradient Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-xl shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          {config.icon}
        </div>
        {data.connected ? (
          <div className="flex flex-col items-end gap-2">
            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-500/20">
              <CheckCircle size={12} className="animate-pulse" /> 
              Connected
            </span>
            <button
              className={`p-1.5 rounded-lg ${btnBg} transition-all hover:scale-110`}
              title="Refresh data"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onConnect}
            className={`bg-gradient-to-r ${config.gradient} hover:shadow-lg text-white text-xs font-semibold px-4 py-2 rounded-full transition-all hover:scale-105 flex items-center gap-1`}
          >
            <ExternalLink size={12} />
            Connect
          </button>
        )}
      </div>

      <h3 className="font-bold text-xl mb-1">{config.name}</h3>
      {data.connected && (
        <p className={`text-xs ${textMuted} mb-4`}>@{data.handle}</p>
      )}

      {data.connected ? (
        <div className="space-y-4">
          {/* Main Stats */}
          <div className="space-y-3">
            {isGithub ? (
              <>
                <StatRow 
                  label="Contributions" 
                  value={data.total_contributions?.toLocaleString() || 0}
                  accent={config.accent} 
                  textMuted={textMuted}
                  icon={BarChart2}
                />
                <StatRow 
                  label="Repositories" 
                  value={data.public_repos} 
                  textMuted={textMuted}
                  icon={GitBranch}
                />
                <StatRow 
                  label="Current Streak" 
                  value={`${data.current_streak} days`}
                  textMuted={textMuted}
                  icon={TrendingUp}
                  accent={data.current_streak > 0 ? 'text-orange-500' : ''}
                />
              </>
            ) : (
              <>
                <StatRow 
                  label="Rating" 
                  value={data.rating || 'Unrated'}
                  accent={config.accent} 
                  textMuted={textMuted}
                  icon={Star}
                />
                <StatRow 
                  label="Max Rating" 
                  value={data.max_rating || 'N/A'}
                  textMuted={textMuted}
                  icon={Award}
                />
                <StatRow 
                  label="Problems Solved" 
                  value={data.problems_solved}
                  textMuted={textMuted}
                  icon={CheckCircle}
                />
              </>
            )}
          </div>

          {/* Difficulty Breakdown (for coding platforms) */}
          {!isGithub && data.difficulty && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={textMuted}>Difficulty</span>
                <button 
                  onClick={() => setShowChart(!showChart)}
                  className={`${textMuted} hover:text-blue-500 transition-colors`}
                >
                  {showChart ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showChart && (
                <div className="space-y-2 animate-fadeIn">
                  <DifficultyBar 
                    label="Easy" 
                    value={data.difficulty.easy} 
                    total={totalProblems}
                    color="bg-green-500"
                    darkMode={darkMode}
                  />
                  <DifficultyBar 
                    label="Medium" 
                    value={data.difficulty.medium} 
                    total={totalProblems}
                    color="bg-yellow-500"
                    darkMode={darkMode}
                  />
                  <DifficultyBar 
                    label="Hard" 
                    value={data.difficulty.hard} 
                    total={totalProblems}
                    color="bg-red-500"
                    darkMode={darkMode}
                  />
                </div>
              )}
            </div>
          )}

          {/* Extra Info */}
          {data.extraInfo?.slice(0, 1).map((item, idx) => (
            <StatRow 
              key={idx} 
              label={item.label} 
              value={item.value} 
              textMuted={textMuted}
              icon={item.icon}
            />
          ))}

          {/* View Details Button */}
          <button 
            onClick={onViewDetails}
            className={`w-full mt-4 py-2.5 text-sm font-semibold rounded-xl ${btnBg} transition-all hover:shadow-md flex items-center justify-center gap-2 group/btn`}
          >
            <span>View Full Profile</span>
            <ExternalLink size={14} className="transform group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className={`text-sm ${textMuted} leading-relaxed`}>
            Connect your {config.name} account to track your progress and achievements.
          </p>
          
          {/* Feature highlights */}
          <div className="space-y-2">
            {['Live stats sync', 'Progress tracking', 'Achievements'].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <CheckCircle size={14} className="text-emerald-500" />
                <span className={textMuted}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, accent, textMuted, icon: Icon }) {
  return (
    <div className="flex justify-between items-center text-sm group/stat">
      <span className={`flex items-center gap-2 ${textMuted} group-hover/stat:text-current transition-colors`}>
        {Icon && <Icon size={14} />}
        {label}
      </span>
      <span className={`font-bold ${accent || 'text-current'}`}>{value}</span>
    </div>
  );
}

function DifficultyBar({ label, value, total, color, darkMode }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}