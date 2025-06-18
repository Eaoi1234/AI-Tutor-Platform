import React, { useState } from 'react';
import { 
  Calendar, BarChart3, Clock, BookOpen, Award, 
  TrendingUp, Flame, Target
} from 'lucide-react';

interface StudyDashboardProps {
  onBack: () => void;
  darkMode: boolean;
}

export const StudyDashboard: React.FC<StudyDashboardProps> = ({ onBack, darkMode }) => {
  // Mock data for the analytics
  const todayStudyTime = 145; // minutes
  const totalStudyTime = 2840; // minutes
  const dayStreak = 12;
  const allSubjects = 6;
  const finishedSubjects = 2;

  // Mock data for the last 7 days of study time
  const weeklyData = [
    { day: 'Mon', minutes: 120, date: '12/9' },
    { day: 'Tue', minutes: 95, date: '12/10' },
    { day: 'Wed', minutes: 180, date: '12/11' },
    { day: 'Thu', minutes: 75, date: '12/12' },
    { day: 'Fri', minutes: 160, date: '12/13' },
    { day: 'Sat', minutes: 200, date: '12/14' },
    { day: 'Sun', minutes: 145, date: '12/15' }
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const maxStudyTime = Math.max(...weeklyData.map(d => d.minutes));

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className={`text-xl font-semibold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Study Analytics</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Today's Study Time */}
          <div className={`border rounded-xl p-6 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{formatTime(todayStudyTime)}</span>
            </div>
            <h3 className={`font-semibold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Today's Study Time</h3>
            <p className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Current session progress</p>
          </div>

          {/* Total Study Time */}
          <div className={`border rounded-xl p-6 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{Math.floor(totalStudyTime / 60)}h</span>
            </div>
            <h3 className={`font-semibold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Total Study Time</h3>
            <p className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>All time accumulated</p>
          </div>

          {/* Day Streak */}
          <div className={`border rounded-xl p-6 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">{dayStreak}</span>
            </div>
            <h3 className={`font-semibold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Day Streak</h3>
            <p className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Consecutive study days</p>
          </div>

          {/* All Subjects */}
          <div className={`border rounded-xl p-6 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">{allSubjects}</span>
            </div>
            <h3 className={`font-semibold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>All Subjects</h3>
            <p className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total enrolled</p>
          </div>

          {/* Finished Subjects */}
          <div className={`border rounded-xl p-6 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-yellow-600">{finishedSubjects}</span>
            </div>
            <h3 className={`font-semibold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Finished Subjects</h3>
            <p className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>100% completed</p>
          </div>
        </div>

        {/* Weekly Study Time Chart */}
        <div className={`border rounded-xl p-8 transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-2xl font-semibold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Daily Study Time</h2>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Last 7 days study time tracking</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Study Time</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-6">
            {/* Y-axis labels and bars */}
            <div className="flex items-end justify-between h-64 space-x-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  {/* Bar */}
                  <div className="w-full flex flex-col justify-end h-48 mb-4">
                    <div className="relative group">
                      <div
                        className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                        style={{ 
                          height: `${(day.minutes / maxStudyTime) * 180}px`,
                          minHeight: day.minutes > 0 ? '8px' : '0px'
                        }}
                      ></div>
                      {/* Tooltip */}
                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                      }`}>
                        <div className="text-center">
                          <div className="font-semibold">{formatTime(day.minutes)}</div>
                          <div className="text-xs opacity-75">{day.date}</div>
                        </div>
                        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                          darkMode ? 'border-t-gray-700' : 'border-t-gray-900'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Day label */}
                  <div className="text-center">
                    <div className={`text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{day.day}</div>
                    <div className={`text-xs transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{day.date}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary stats */}
            <div className={`border-t pt-6 transition-colors duration-300 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{formatTime(weeklyData.reduce((sum, day) => sum + day.minutes, 0))}</div>
                  <div className={`text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Total This Week</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{formatTime(Math.round(weeklyData.reduce((sum, day) => sum + day.minutes, 0) / 7))}</div>
                  <div className={`text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Daily Average</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{formatTime(maxStudyTime)}</div>
                  <div className={`text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Best Day</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold text-green-600`}>+{Math.round(((weeklyData[6].minutes - weeklyData[0].minutes) / weeklyData[0].minutes) * 100)}%</div>
                  <div className={`text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Week Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};