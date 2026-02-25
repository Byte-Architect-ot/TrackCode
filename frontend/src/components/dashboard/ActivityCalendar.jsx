// src/components/dashboard/ActivityCalendar.jsx

import React, { useState, useMemo } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Flame, Target, 
  TrendingUp, Award, Zap, Clock 
} from 'lucide-react';

export default function ActivityCalendar({ activityData = [], darkMode }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'

  // Styles
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  // Create activity map for quick lookup
  const activityMap = useMemo(() => {
    const map = new Map();
    activityData.forEach(item => {
      const dateKey = item.date;
      const existing = map.get(dateKey) || { count: 0, problems: [] };
      map.set(dateKey, {
        count: existing.count + (item.count || item.solved || 1),
        problems: [...existing.problems, ...(item.problems || [])],
        streak: item.streak || false
      });
    });
    return map;
  }, [activityData]);

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    
    // Previous month padding
    const prevMonth = new Date(year, month, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonth.getDate() - i)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      const activity = activityMap.get(dateKey);
      
      days.push({
        day,
        isCurrentMonth: true,
        date,
        dateKey,
        count: activity?.count || 0,
        problems: activity?.problems || [],
        streak: activity?.streak || false,
        isToday: isToday(date),
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0))
      });
    }

    // Next month padding
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day)
      });
    }

    return days;
  }, [currentDate, activityMap]);

  // Helper functions
  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  function getActivityLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  function getActivityColor(level, isCurrentMonth, isPast) {
    if (!isCurrentMonth) {
      return darkMode ? 'bg-gray-800/30' : 'bg-gray-100/50';
    }
    
    if (!isPast && level === 0) {
      return darkMode ? 'bg-gray-700/50 border-2 border-dashed border-gray-600' : 'bg-gray-100 border-2 border-dashed border-gray-300';
    }
    
    const colors = {
      0: darkMode ? 'bg-gray-700/50' : 'bg-gray-100',
      1: darkMode ? 'bg-emerald-900/60 shadow-sm shadow-emerald-900/50' : 'bg-emerald-100 shadow-sm shadow-emerald-200',
      2: darkMode ? 'bg-emerald-700/70 shadow-md shadow-emerald-700/50' : 'bg-emerald-300 shadow-md shadow-emerald-300',
      3: darkMode ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-emerald-400 shadow-lg shadow-emerald-400',
      4: darkMode ? 'bg-emerald-400 shadow-xl shadow-emerald-400/60 ring-2 ring-emerald-300' : 'bg-emerald-600 shadow-xl shadow-emerald-600 ring-2 ring-emerald-400'
    };
    return colors[level];
  }

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Get display info
  const displayDate = hoveredDate || selectedDate;
  const displayInfo = displayDate ? calendarData.find(d => d.dateKey === displayDate) : null;

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const currentMonthDays = calendarData.filter(d => d.isCurrentMonth);
    const totalSolved = currentMonthDays.reduce((sum, d) => sum + d.count, 0);
    const activeDays = currentMonthDays.filter(d => d.count > 0).length;
    const maxInDay = Math.max(...currentMonthDays.map(d => d.count), 0);
    const avgPerDay = activeDays > 0 ? (totalSolved / activeDays).toFixed(1) : 0;
    
    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = currentMonthDays.length - 1; i >= 0; i--) {
      const day = currentMonthDays[i];
      if (day.date <= today) {
        if (day.count > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    return { totalSolved, activeDays, maxInDay, avgPerDay, currentStreak };
  }, [calendarData]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`${cardBg} border rounded-2xl p-6 h-full flex flex-col shadow-lg transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
            <Calendar size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Activity Calendar</h3>
            <p className={`text-xs ${textMuted}`}>Track your daily progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
            className={`text-xs px-3 py-1.5 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            {view === 'calendar' ? 'List View' : 'Calendar'}
          </button>
          <button 
            onClick={goToToday}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium ${darkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-colors`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Dynamic Stats Display */}
      <div className={`mb-6 p-5 rounded-xl ${darkMode ? 'bg-gradient-to-br from-gray-700/50 to-gray-800/50' : 'bg-gradient-to-br from-gray-50 to-gray-100'} transition-all duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {displayInfo ? (
          // Show hovered/selected date info
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${textMuted}`}>
                {formatDisplayDate(displayInfo.date)}
              </p>
              {displayInfo.isToday && (
                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  Today
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${displayInfo.count > 0 ? (darkMode ? 'bg-emerald-900/30' : 'bg-emerald-100') : (darkMode ? 'bg-gray-800' : 'bg-gray-200')}`}>
                <Target className={displayInfo.count > 0 ? 'text-emerald-500' : textMuted} size={24} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${displayInfo.count > 0 ? 'text-emerald-500' : ''}`}>
                    {displayInfo.count}
                  </span>
                  <span className={`text-sm ${textMuted}`}>
                    {displayInfo.count === 1 ? 'problem' : 'problems'}
                  </span>
                </div>
                {displayInfo.streak && (
                  <div className="flex items-center gap-1 mt-1">
                    <Flame size={14} className="text-orange-500" />
                    <span className="text-xs text-orange-500 font-medium">Active streak</span>
                  </div>
                )}
              </div>
            </div>

            {displayInfo.count > 0 && (
              <div className="flex items-center gap-1 pt-2 border-t border-gray-700/50">
                {Array.from({ length: Math.min(displayInfo.count, 10) }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full ${darkMode ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  />
                ))}
                {displayInfo.count > 10 && (
                  <span className="text-xs text-emerald-500 ml-2 font-bold">+{displayInfo.count - 10}</span>
                )}
              </div>
            )}
          </div>
        ) : (
          // Show monthly stats
          <div className="grid grid-cols-4 gap-3">
            <StatBox 
              icon={Target}
              value={monthlyStats.totalSolved}
              label="This Month"
              color="emerald"
              darkMode={darkMode}
            />
            <StatBox 
              icon={Calendar}
              value={monthlyStats.activeDays}
              label="Active Days"
              color="blue"
              darkMode={darkMode}
            />
            <StatBox 
              icon={Award}
              value={monthlyStats.maxInDay}
              label="Best Day"
              color="orange"
              darkMode={darkMode}
            />
            <StatBox 
              icon={TrendingUp}
              value={monthlyStats.avgPerDay}
              label="Avg/Day"
              color="purple"
              darkMode={darkMode}
            />
          </div>
        )}
      </div>

      {view === 'calendar' ? (
        <>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-5">
            <button 
              onClick={goToPrevMonth}
              className={`p-2 rounded-lg ${hoverBg} transition-all hover:scale-110`}
            >
              <ChevronLeft size={20} />
            </button>
            <h4 className="font-bold text-lg">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            <button 
              onClick={goToNextMonth}
              className={`p-2 rounded-lg ${hoverBg} transition-all hover:scale-110`}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {weekDays.map(day => (
              <div key={day} className={`text-xs text-center font-bold ${textMuted}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 flex-1">
            {calendarData.map((dayInfo, index) => {
              const level = getActivityLevel(dayInfo.count);
              const isSelected = selectedDate === dayInfo.dateKey;
              const isHovered = hoveredDate === dayInfo.dateKey;
              
              return (
                <div
                  key={index}
                  className={`
                    relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium
                    cursor-pointer transition-all duration-200
                    ${getActivityColor(level, dayInfo.isCurrentMonth, dayInfo.isPast)}
                    ${!dayInfo.isCurrentMonth ? `${textMuted} opacity-50` : ''}
                    ${dayInfo.isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800' : ''}
                    ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-gray-800' : ''}
                    ${isHovered && dayInfo.isCurrentMonth ? 'scale-110 shadow-2xl z-10 -translate-y-1' : ''}
                    ${dayInfo.isCurrentMonth ? 'hover:scale-105' : ''}
                  `}
                  onMouseEnter={() => dayInfo.isCurrentMonth && setHoveredDate(dayInfo.dateKey)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onClick={() => dayInfo.isCurrentMonth && setSelectedDate(
                    selectedDate === dayInfo.dateKey ? null : dayInfo.dateKey
                  )}
                >
                  <span className={`${dayInfo.count > 0 && dayInfo.isCurrentMonth ? 'font-bold' : ''}`}>
                    {dayInfo.day}
                  </span>
                  
                  {/* Streak indicator */}
                  {dayInfo.streak && dayInfo.count > 0 && (
                    <Flame 
                      size={10} 
                      className="absolute top-1 right-1 text-orange-500 animate-pulse" 
                    />
                  )}

                  {/* Activity dots */}
                  {dayInfo.count > 0 && dayInfo.isCurrentMonth && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {Array.from({ length: Math.min(level, 3) }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1 h-1 rounded-full ${darkMode ? 'bg-white/80' : 'bg-gray-900/80'}`} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        // List View
        <div className="space-y-2 overflow-y-auto flex-1">
          {calendarData
            .filter(d => d.isCurrentMonth && d.count > 0)
            .sort((a, b) => b.count - a.count)
            .map((day, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer`}
                onClick={() => setSelectedDate(day.dateKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getActivityColor(getActivityLevel(day.count), true, day.isPast)} flex items-center justify-center font-bold`}>
                      {day.day}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                      <p className={`text-xs ${textMuted}`}>
                        {day.count} {day.count === 1 ? 'problem' : 'problems'} solved
                      </p>
                    </div>
                  </div>
                  {day.streak && (
                    <Flame size={16} className="text-orange-500" />
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-gray-700/50">
        <span className={`text-xs font-medium ${textMuted}`}>Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className={`w-4 h-4 rounded-md ${getActivityColor(level, true, true)} transition-transform hover:scale-125 cursor-pointer`}
            title={`Level ${level}`}
          />
        ))}
        <span className={`text-xs font-medium ${textMuted}`}>More</span>
      </div>

      {/* Streak Info */}
      {monthlyStats.currentStreak > 0 && (
        <div className={`mt-4 p-3 rounded-lg text-center ${darkMode ? 'bg-orange-900/20 border border-orange-800/30' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-center justify-center gap-2">
            <Flame size={16} className="text-orange-500 animate-pulse" />
            <span className="text-sm font-medium text-orange-500">
              {monthlyStats.currentStreak} day streak this month!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component
function StatBox({ icon: Icon, value, label, color, darkMode }) {
  const colors = {
    emerald: darkMode ? 'from-emerald-900/30 to-emerald-800/30 border-emerald-800/30' : 'from-emerald-50 to-emerald-100 border-emerald-200',
    blue: darkMode ? 'from-blue-900/30 to-blue-800/30 border-blue-800/30' : 'from-blue-50 to-blue-100 border-blue-200',
    orange: darkMode ? 'from-orange-900/30 to-orange-800/30 border-orange-800/30' : 'from-orange-50 to-orange-100 border-orange-200',
    purple: darkMode ? 'from-purple-900/30 to-purple-800/30 border-purple-800/30' : 'from-purple-50 to-purple-100 border-purple-200'
  };

  const iconColors = {
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500'
  };

  return (
    <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} border text-center transition-transform hover:scale-105`}>
      <Icon size={16} className={`mx-auto mb-1 ${iconColors[color]}`} />
      <p className={`text-xl font-bold ${iconColors[color]}`}>{value}</p>
      <p className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>{label}</p>
    </div>
  );
}