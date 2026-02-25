// src/components/dashboard/QuickStats.jsx

import React, { useMemo } from 'react';
import { 
  Target, Calendar, Star, TrendingUp, TrendingDown, 
  Minus, Zap, Award, Clock, CheckCircle2 
} from 'lucide-react';

export default function QuickStats({ activityData = [], darkMode }) {
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const progressBg = darkMode ? 'bg-gray-700' : 'bg-gray-200';

  // Calculate all stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const monthStart = new Date();
    monthStart.setDate(1);
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1, 1);
    const lastMonthEnd = new Date(monthStart - 1);

    // Today's stats
    const todaySolved = activityData.find(a => a.date === today)?.solved || 0;
    const yesterdaySolved = activityData.find(a => a.date === yesterday)?.solved || 0;
    const todayGoal = 3;
    const todayProgress = Math.min((todaySolved / todayGoal) * 100, 100);

    // Week stats
    const thisWeekSolved = activityData
      .filter(a => new Date(a.date) >= weekAgo)
      .reduce((sum, a) => sum + (a.solved || 0), 0);
    
    const lastWeekSolved = activityData
      .filter(a => new Date(a.date) >= twoWeeksAgo && new Date(a.date) < weekAgo)
      .reduce((sum, a) => sum + (a.solved || 0), 0);
    
    const weekTrend = lastWeekSolved > 0 
      ? ((thisWeekSolved - lastWeekSolved) / lastWeekSolved) * 100 
      : 0;

    // Month stats
    const thisMonthSolved = activityData
      .filter(a => new Date(a.date) >= monthStart)
      .reduce((sum, a) => sum + (a.solved || 0), 0);
    
    const lastMonthSolved = activityData
      .filter(a => new Date(a.date) >= lastMonthStart && new Date(a.date) <= lastMonthEnd)
      .reduce((sum, a) => sum + (a.solved || 0), 0);
    
    const monthTrend = lastMonthSolved > 0 
      ? ((thisMonthSolved - lastMonthSolved) / lastMonthSolved) * 100 
      : 0;

    // Upsolving stats
    const upsolvingDays = activityData
      .filter(a => new Date(a.date) >= weekAgo && a.upsolving)
      .length;
    
    const totalUpsolvingDays = activityData
      .filter(a => a.upsolving)
      .length;

    // Consistency (active days this month)
    const activeDaysThisMonth = activityData
      .filter(a => new Date(a.date) >= monthStart && (a.solved || 0) > 0)
      .length;
    
    const daysInMonth = new Date().getDate();
    const consistencyRate = daysInMonth > 0 ? (activeDaysThisMonth / daysInMonth) * 100 : 0;

    return {
      today: {
        value: todaySolved,
        goal: todayGoal,
        progress: todayProgress,
        yesterday: yesterdaySolved,
        change: todaySolved - yesterdaySolved
      },
      week: {
        value: thisWeekSolved,
        trend: weekTrend,
        last: lastWeekSolved
      },
      month: {
        value: thisMonthSolved,
        trend: monthTrend,
        last: lastMonthSolved,
        activeDays: activeDaysThisMonth,
        consistency: consistencyRate
      },
      upsolving: {
        recent: upsolvingDays,
        total: totalUpsolvingDays
      }
    };
  }, [activityData]);

  const statCards = [
    {
      title: "Today's Progress",
      value: stats.today.value,
      goal: stats.today.goal,
      icon: Target,
      gradient: 'from-emerald-500 to-teal-600',
      color: 'text-emerald-500',
      bgColor: darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50',
      showProgress: true,
      progress: stats.today.progress,
      subtitle: `Goal: ${stats.today.goal}`,
      trend: stats.today.change,
      trendLabel: 'vs yesterday'
    },
    {
      title: 'This Week',
      value: stats.week.value,
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-600',
      color: 'text-blue-500',
      bgColor: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
      suffix: 'solved',
      trend: stats.week.trend,
      trendLabel: 'vs last week',
      subtitle: `Last week: ${stats.week.last}`
    },
    {
      title: 'This Month',
      value: stats.month.value,
      icon: Star,
      gradient: 'from-purple-500 to-pink-600',
      color: 'text-purple-500',
      bgColor: darkMode ? 'bg-purple-900/20' : 'bg-purple-50',
      suffix: 'solved',
      trend: stats.month.trend,
      trendLabel: 'vs last month',
      subtitle: `${stats.month.activeDays} active days`,
      extraInfo: {
        label: 'Consistency',
        value: `${Math.round(stats.month.consistency)}%`
      }
    },
    {
      title: 'Upsolving',
      value: stats.upsolving.recent,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-600',
      color: 'text-orange-500',
      bgColor: darkMode ? 'bg-orange-900/20' : 'bg-orange-50',
      suffix: 'days this week',
      subtitle: `${stats.upsolving.total} total days`,
      badge: stats.upsolving.recent >= 3 ? 'On Track!' : null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {statCards.map((stat, idx) => (
        <StatCard 
          key={idx} 
          stat={stat} 
          darkMode={darkMode}
          progressBg={progressBg}
          textMuted={textMuted}
        />
      ))}
    </div>
  );
}

function StatCard({ stat, darkMode, progressBg, textMuted }) {
  const getTrendIcon = (trend) => {
    if (trend > 0) return TrendingUp;
    if (trend < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-emerald-500';
    if (trend < 0) return 'text-red-500';
    return textMuted;
  };

  const TrendIcon = stat.trend !== undefined ? getTrendIcon(stat.trend) : null;
  const trendColor = stat.trend !== undefined ? getTrendColor(stat.trend) : '';

  return (
    <div className={`
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
      border rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden
    `}>
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
            <stat.icon size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{stat.title}</h3>
            {stat.subtitle && (
              <p className={`text-xs ${textMuted}`}>{stat.subtitle}</p>
            )}
          </div>
        </div>

        {/* Badge */}
        {stat.badge && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.bgColor} ${stat.color} animate-pulse`}>
            {stat.badge}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {stat.showProgress ? (
          <div className="space-y-3">
            {/* Value Display */}
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
              <span className={`text-lg ${textMuted}`}>/ {stat.goal}</span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className={`h-3 rounded-full ${progressBg} overflow-hidden`}>
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out relative overflow-hidden`}
                  style={{ width: `${stat.progress}%` }}
                >
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              
              {/* Progress percentage */}
              <div className="flex items-center justify-between text-xs">
                <span className={textMuted}>
                  {Math.round(stat.progress)}% complete
                </span>
                {stat.value >= stat.goal && (
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold animate-fadeIn">
                    <CheckCircle2 size={12} />
                    Goal reached!
                  </span>
                )}
              </div>
            </div>

            {/* Trend indicator */}
            {stat.trend !== undefined && TrendIcon && (
              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-700/30">
                <TrendIcon size={14} className={trendColor} />
                <span className={`text-xs font-semibold ${trendColor}`}>
                  {stat.trend > 0 ? '+' : ''}{Math.abs(stat.trend).toFixed(0)}
                </span>
                <span className={`text-xs ${textMuted}`}>
                  {stat.trendLabel}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Value Display */}
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
              {stat.suffix && (
                <span className={`text-sm ${textMuted}`}>{stat.suffix}</span>
              )}
            </div>

            {/* Extra Info */}
            {stat.extraInfo && (
              <div className={`flex items-center justify-between p-2 rounded-lg ${stat.bgColor} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={`text-xs ${textMuted}`}>{stat.extraInfo.label}</span>
                <span className={`text-sm font-bold ${stat.color}`}>{stat.extraInfo.value}</span>
              </div>
            )}

            {/* Trend indicator */}
            {stat.trend !== undefined && TrendIcon && (
              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-700/30">
                <TrendIcon size={14} className={trendColor} />
                <span className={`text-xs font-semibold ${trendColor}`}>
                  {stat.trend > 0 ? '+' : ''}{Math.abs(stat.trend).toFixed(1)}%
                </span>
                <span className={`text-xs ${textMuted}`}>
                  {stat.trendLabel}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
    </div>
  );
}