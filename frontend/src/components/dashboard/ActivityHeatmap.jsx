// src/components/dashboard/ActivityHeatmap.jsx

import React, { useState, useMemo, useRef } from 'react';
import { 
  BarChart3, Flame, ChevronLeft, ChevronRight, Calendar, 
  TrendingUp, Award, Zap, Target, Download, Share2 
} from 'lucide-react';

export default function ActivityHeatmap({ activityData = [], darkMode }) {
  const [tooltip, setTooltip] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [viewMode, setViewMode] = useState('year'); // 'year' or 'comparison'
  const containerRef = useRef(null);

  const currentYear = new Date().getFullYear();
  
  // Enhanced configuration
  const CELL_SIZE = 14;
  const CELL_GAP = 3;
  const CELL_RADIUS = 3;

  const years = useMemo(() => {
    const yrs = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      yrs.push(y);
    }
    return yrs;
  }, [currentYear]);

  // Calculate data
  const { weeks, stats, monthlyBreakdown, streakInfo } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);

    const startDayOfWeek = yearStart.getDay();
    const startDate = new Date(yearStart);
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const endDayOfWeek = yearEnd.getDay();
    const endDate = new Date(yearEnd);
    endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));

    const allDays = [];
    const currentDate = new Date(startDate);
    const monthlyData = Array(12).fill(0).map(() => ({ count: 0, days: 0 }));

    while (currentDate <= endDate) {
      const dateStr = [
        currentDate.getFullYear(),
        String(currentDate.getMonth() + 1).padStart(2, '0'),
        String(currentDate.getDate()).padStart(2, '0')
      ].join('-');

      const activity = activityData.find(a => a.date === dateStr);
      const isInYear = currentDate.getFullYear() === selectedYear;
      const isFuture = currentDate > today;
      const count = activity?.solved || activity?.count || 0;

      if (isInYear && !isFuture && count > 0) {
        const month = currentDate.getMonth();
        monthlyData[month].count += count;
        monthlyData[month].days += 1;
      }

      allDays.push({
        date: dateStr,
        count,
        dayOfWeek: currentDate.getDay(),
        month: currentDate.getMonth(),
        isToday: currentDate.getTime() === today.getTime(),
        isInYear,
        isFuture,
        weekOfYear: Math.floor((currentDate - startDate) / (7 * 24 * 60 * 60 * 1000))
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const weeksArr = [];
    for (let i = 0; i < allDays.length; i += 7) {
      const week = allDays.slice(i, Math.min(i + 7, allDays.length));
      const weekTotal = week.reduce((sum, d) => sum + (d.isInYear && !d.isFuture ? d.count : 0), 0);
      weeksArr.push({
        days: week,
        total: weekTotal,
        index: Math.floor(i / 7)
      });
    }

    // Stats
    const yearDays = allDays.filter(d => d.isInYear && !d.isFuture);
    const totalSolved = yearDays.reduce((sum, d) => sum + d.count, 0);
    const activeDays = yearDays.filter(d => d.count > 0).length;
    const maxInDay = Math.max(...yearDays.map(d => d.count), 0);
    const avgPerDay = activeDays > 0 ? (totalSolved / activeDays).toFixed(1) : 0;

    // Streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let streakStart = null;
    let longestStreakDates = { start: null, end: null };

    const reversedDays = [...allDays].filter(d => !d.isFuture && d.isInYear).reverse();
    for (const day of reversedDays) {
      if (day.count > 0) currentStreak++;
      else break;
    }

    for (let i = 0; i < yearDays.length; i++) {
      const day = yearDays[i];
      if (day.count > 0) {
        if (tempStreak === 0) streakStart = day.date;
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
          longestStreakDates = { start: streakStart, end: day.date };
        }
      } else {
        tempStreak = 0;
        streakStart = null;
      }
    }

    return {
      weeks: weeksArr,
      stats: { totalSolved, activeDays, currentStreak, longestStreak, maxInDay, avgPerDay },
      monthlyBreakdown: monthlyData,
      streakInfo: longestStreakDates
    };
  }, [activityData, selectedYear]);

  // Month positions
  const monthPositions = useMemo(() => {
    const positions = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIdx) => {
      const firstDayInYear = week.days.find(d => d.isInYear);
      if (firstDayInYear) {
        const month = firstDayInYear.month;
        if (month !== lastMonth && weekIdx < weeks.length - 2) {
          positions.push({ month, weekIdx });
          lastMonth = month;
        }
      }
    });
    return positions;
  }, [weeks]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Color functions
  const getCellColor = (day) => {
    if (!day.isInYear) return darkMode ? 'bg-gray-800/20' : 'bg-gray-100/40';
    if (day.isFuture) return darkMode ? 'bg-gray-800/20' : 'bg-gray-100/40';
    
    if (day.count === 0) return darkMode ? 'bg-gray-800' : 'bg-gray-200';
    
    const intensity = Math.min(day.count, 10);
    if (intensity === 1) return darkMode ? 'bg-emerald-900/70' : 'bg-emerald-100';
    if (intensity <= 3) return darkMode ? 'bg-emerald-700/80' : 'bg-emerald-300';
    if (intensity <= 5) return darkMode ? 'bg-emerald-600/90' : 'bg-emerald-400';
    if (intensity <= 8) return darkMode ? 'bg-emerald-500' : 'bg-emerald-500';
    return darkMode ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' : 'bg-emerald-600 shadow-lg shadow-emerald-600/50';
  };

  const getBorderEffect = (day) => {
    if (day.count > 10) return 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-gray-900';
    if (day.count > 5) return 'ring-1 ring-emerald-500/50';
    return '';
  };

  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900';

  // Best month
  const bestMonth = useMemo(() => {
    const max = Math.max(...monthlyBreakdown.map(m => m.count));
    const idx = monthlyBreakdown.findIndex(m => m.count === max);
    return { month: monthNames[idx], count: max };
  }, [monthlyBreakdown]);

  return (
    <div className={`rounded-2xl p-6 ${cardBg} border shadow-xl w-full max-w-6xl mx-auto`}>
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        
        {/* Stats Block */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
              <BarChart3 size={24} className="text-emerald-500" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${textPrimary}`}>
                {stats.totalSolved.toLocaleString()} 
                <span className={`text-base font-normal ml-2 ${textColor}`}>problems solved</span>
              </h3>
              <p className={`text-sm ${textColor}`}>
                in {selectedYear} • {stats.activeDays} active days
              </p>
            </div>
          </div>
          
          {/* Mini Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <MiniStat 
              icon={Flame} 
              value={stats.currentStreak} 
              label="Current"
              color="orange"
              darkMode={darkMode}
              animate={stats.currentStreak > 0}
            />
            <MiniStat 
              icon={Award} 
              value={stats.longestStreak} 
              label="Longest"
              color="purple"
              darkMode={darkMode}
            />
            <MiniStat 
              icon={Zap} 
              value={stats.maxInDay} 
              label="Best Day"
              color="yellow"
              darkMode={darkMode}
            />
            <MiniStat 
              icon={TrendingUp} 
              value={stats.avgPerDay} 
              label="Avg/Day"
              color="blue"
              darkMode={darkMode}
            />
          </div>

          {/* Best Month Badge */}
          {bestMonth.count > 0 && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-yellow-900/20 border border-yellow-800/30' : 'bg-yellow-50 border border-yellow-200'}`}>
              <Trophy size={16} className="text-yellow-500" />
              <span className={`text-sm font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                Best month: {bestMonth.month} ({bestMonth.count} solved)
              </span>
            </div>
          )}
        </div>

        {/* Controls Block */}
        <div className="flex flex-col gap-3">
          {/* Year Selector */}
          <div className={`flex items-center rounded-xl border p-1 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <button
              onClick={() => setSelectedYear(y => Math.max(y - 1, currentYear - 5))}
              disabled={selectedYear <= currentYear - 5}
              className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all ${textColor}`}
            >
              <ChevronLeft size={18} />
            </button>
            
            <span className={`px-4 text-base font-bold ${textPrimary} min-w-[80px] text-center`}>
              {selectedYear}
            </span>

            <button
              onClick={() => setSelectedYear(y => Math.min(y + 1, currentYear))}
              disabled={selectedYear >= currentYear}
              className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all ${textColor}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
              <Share2 size={14} />
              Share
            </button>
            <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
              <Download size={14} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Container */}
      <div 
        ref={containerRef} 
        className="w-full overflow-x-auto pb-4 custom-scrollbar"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="min-w-fit pr-4">
          
          {/* Month Labels */}
          <div className="flex relative mb-3 h-5 ml-7">
            {monthPositions.map((item, idx) => (
              <span
                key={idx}
                className={`absolute text-xs font-semibold ${textColor}`}
                style={{ 
                  left: `${(item.weekIdx * (CELL_SIZE + CELL_GAP))}px`,
                }}
              >
                {monthNames[item.month]}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* Day Labels */}
            <div className="flex flex-col pr-2 justify-between" style={{ height: `${7 * (CELL_SIZE + CELL_GAP) - CELL_GAP}px` }}>
              {dayLabels.map((day, idx) => (
                <div
                  key={idx}
                  className="text-xs font-bold text-center w-5 flex items-center justify-center"
                  style={{ 
                    height: `${CELL_SIZE}px`,
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* The Grid */}
            <div className="flex" style={{ gap: `${CELL_GAP}px` }}>
              {weeks.map((week, weekIdx) => {
                const isWeekHovered = hoveredWeek === weekIdx;
                
                return (
                  <div 
                    key={weekIdx} 
                    className={`flex flex-col transition-all duration-200 ${isWeekHovered ? 'scale-105' : ''}`} 
                    style={{ gap: `${CELL_GAP}px` }}
                    onMouseEnter={() => setHoveredWeek(weekIdx)}
                    onMouseLeave={() => setHoveredWeek(null)}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                      const day = week.days[dayIdx];
                      if (!day) return <div key={dayIdx} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;

                      const isInteractive = day.isInYear && !day.isFuture;
                      
                      return (
                        <div
                          key={dayIdx}
                          className={`
                            transition-all duration-300 ease-out
                            ${getCellColor(day)}
                            ${getBorderEffect(day)}
                            ${isInteractive ? 'hover:scale-150 hover:z-20 cursor-pointer hover:rotate-3' : ''}
                            ${day.isToday ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900' : ''}
                            ${isWeekHovered && day.count > 0 ? 'scale-110' : ''}
                          `}
                          style={{ 
                            width: `${CELL_SIZE}px`, 
                            height: `${CELL_SIZE}px`,
                            borderRadius: `${CELL_RADIUS}px`
                          }}
                          onMouseEnter={(e) => {
                            if (!isInteractive) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                              day,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 10
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Legend */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/50">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={textColor}>Less</span>
          <div className="flex gap-1.5">
            {[0, 1, 3, 5, 8, 10].map((level, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-md transition-transform hover:scale-125 cursor-pointer ${
                  level === 0 ? (darkMode ? 'bg-gray-800' : 'bg-gray-200')
                  : level === 1 ? (darkMode ? 'bg-emerald-900/70' : 'bg-emerald-100')
                  : level <= 3 ? (darkMode ? 'bg-emerald-700/80' : 'bg-emerald-300')
                  : level <= 5 ? (darkMode ? 'bg-emerald-600/90' : 'bg-emerald-400')
                  : level <= 8 ? (darkMode ? 'bg-emerald-500' : 'bg-emerald-500')
                  : (darkMode ? 'bg-emerald-400' : 'bg-emerald-600')
                }`}
                title={`${level}+ submissions`}
              />
            ))}
          </div>
          <span className={textColor}>More</span>
        </div>

        {/* Weekly Avg */}
        {hoveredWeek !== null && weeks[hoveredWeek] && (
          <div className={`text-xs ${textColor} animate-fadeIn`}>
            Week {hoveredWeek + 1}: <span className="font-bold text-emerald-500">{weeks[hoveredWeek].total}</span> solved
          </div>
        )}
      </div>

      {/* Enhanced Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className={`
            flex flex-col px-4 py-3 rounded-xl shadow-2xl text-sm whitespace-nowrap mb-3
            backdrop-blur-md border-2 transition-all duration-200
            ${darkMode 
              ? 'bg-gray-900/95 text-white border-emerald-500/50' 
              : 'bg-white/95 text-gray-900 border-emerald-400'}
          `}>
            {/* Count with icon */}
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className={tooltip.day.count > 0 ? 'text-emerald-500' : 'text-gray-400'} />
              <span className="font-bold text-lg">
                {tooltip.day.count} {tooltip.day.count === 1 ? 'problem' : 'problems'}
              </span>
            </div>
            
            {/* Date */}
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(tooltip.day.date).toLocaleDateString(undefined, {
                weekday: 'long', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric'
              })}
            </span>

            {/* Special badges */}
            {tooltip.day.isToday && (
              <span className="mt-2 text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full self-start">
                Today
              </span>
            )}
            {tooltip.day.count > 10 && (
              <span className="mt-2 text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full self-start flex items-center gap-1">
                <Zap size={12} /> On fire!
              </span>
            )}
            
            {/* Arrow */}
            <div className={`
              absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r-2 border-b-2
              ${darkMode 
                ? 'bg-gray-900 border-emerald-500/50' 
                : 'bg-white border-emerald-400'}
            `}/>
          </div>
        </div>
      )}

      {/* Streak Achievement Banner */}
      {stats.currentStreak > 7 && (
        <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-800/30' : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200'} animate-fadeIn`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Flame size={24} className="text-orange-500 animate-pulse" />
            </div>
            <div>
              <p className={`font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                🔥 {stats.currentStreak} Day Streak!
              </p>
              <p className={`text-sm ${textColor}`}>
                {stats.currentStreak >= stats.longestStreak 
                  ? "You're on your personal record!" 
                  : `Just ${stats.longestStreak - stats.currentStreak} more days to beat your record!`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mini Stat Component
function MiniStat({ icon: Icon, value, label, color, darkMode, animate }) {
  const colors = {
    orange: darkMode ? 'from-orange-900/30 to-orange-800/30 border-orange-800/30 text-orange-400' : 'from-orange-50 to-orange-100 border-orange-200 text-orange-600',
    purple: darkMode ? 'from-purple-900/30 to-purple-800/30 border-purple-800/30 text-purple-400' : 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    yellow: darkMode ? 'from-yellow-900/30 to-yellow-800/30 border-yellow-800/30 text-yellow-400' : 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-600',
    blue: darkMode ? 'from-blue-900/30 to-blue-800/30 border-blue-800/30 text-blue-400' : 'from-blue-50 to-blue-100 border-blue-200 text-blue-600'
  };

  return (
    <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} border transition-transform hover:scale-105`}>
      <Icon size={18} className={`mb-1 ${animate ? 'animate-pulse' : ''}`} />
      <p className="text-xl font-bold">{value}</p>
      <p className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
    </div>
  );
}

// Trophy Icon Component
function Trophy({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      className={className}
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}