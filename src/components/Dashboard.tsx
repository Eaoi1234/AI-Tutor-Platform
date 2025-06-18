import React from 'react';
import { User, Subject, WeakArea, LearningSession } from '../types';
import { BarChart3, Brain, Clock, TrendingUp, Award, Zap, Calendar, Target, ArrowRight, BookOpen, Users, Star, Play, Bookmark, BookmarkCheck } from 'lucide-react';

interface DashboardProps {
  user: User;
  subjects: Subject[];
  weakAreas: WeakArea[];
  recentSessions: LearningSession[];
  onSelectSubject: (subject: Subject) => void;
  onStartChat: () => void;
  onStartQuiz: () => void;
  darkMode: boolean;
  bookmarkedSubjects: string[];
  onToggleBookmark: (subjectId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  subjects,
  weakAreas,
  recentSessions,
  onSelectSubject,
  onStartChat,
  onStartQuiz,
  darkMode,
  bookmarkedSubjects,
  onToggleBookmark
}) => {
  const totalProgress = subjects.reduce((acc, subject) => acc + (subject.completedTopics / subject.totalTopics), 0) / subjects.length * 100;

  const handleBookmarkClick = (e: React.MouseEvent, subjectId: string) => {
    e.stopPropagation();
    onToggleBookmark(subjectId);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-gray-900" />
                </div>
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>LearnPath</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className={`flex items-center space-x-2 text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{user.currentStreak} day streak</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{Math.floor(user.totalStudyTime / 60)}h study time</span>
              </div>
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome back, <span className="text-yellow-500">{user.name}</span>
          </h1>
          <p className={`text-xl mb-8 max-w-2xl mx-auto transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Continue your personalized learning journey with AI-powered tutoring and adaptive quizzes
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={onStartChat}
              className="inline-flex items-center px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <Brain className="w-5 h-5 mr-2" />
              Start AI Tutoring
            </button>
            <button
              onClick={onStartQuiz}
              className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-white text-gray-900 hover:bg-gray-100' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              <Target className="w-5 h-5 mr-2" />
              Take Practice Quiz
            </button>
          </div>
        </div>

        {/* Learning Paths */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Learning Paths</h2>
            <span className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{subjects.length} subjects available</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const progress = (subject.completedTopics / subject.totalTopics) * 100;
              const isBookmarked = bookmarkedSubjects.includes(subject.id);
              
              return (
                <div
                  key={subject.id}
                  onClick={() => onSelectSubject(subject)}
                  className={`group cursor-pointer border rounded-xl p-6 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${subject.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className="text-white font-bold text-lg">{subject.name.charAt(0)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleBookmarkClick(e, subject.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : darkMode
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                        subject.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        subject.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {subject.difficulty}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-2 group-hover:text-yellow-600 transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {subject.name}
                  </h3>
                  <p className={`text-sm mb-4 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{subject.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className={`transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{subject.completedTopics}/{subject.totalTopics} topics</span>
                      <span className={`font-medium transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>{Math.round(progress)}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${subject.color} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end pt-4 border-t border-opacity-20 border-gray-300">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Continue</span>
                      <ArrowRight className={`w-4 h-4 group-hover:text-yellow-500 transition-colors ${
                        darkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>Areas to Focus On</h2>
          <div className="space-y-4">
            {weakAreas.map((area, index) => (
              <div key={index} className={`border rounded-xl p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{area.topic}</h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{area.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">{area.accuracy}%</div>
                    <div className={`text-xs transition-colors duration-300 ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>accuracy</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className={`w-full rounded-full h-2 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${area.accuracy}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Improvement suggestions:</p>
                  <ul className="space-y-1">
                    {area.improvementSuggestions.slice(0, 2).map((suggestion, idx) => (
                      <li key={idx} className={`text-sm flex items-start transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <span className={`w-1 h-1 rounded-full mt-2 mr-2 flex-shrink-0 ${
                          darkMode ? 'bg-gray-500' : 'bg-gray-400'
                        }`}></span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className="mt-4 text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
                  Start practicing
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};