import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TutorChat } from './components/TutorChat';
import { QuizSystem } from './components/QuizSystem';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { SubjectDashboard } from './components/subjects/SubjectDashboard';
import { StudyDashboard } from './components/analytics/StudyDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SubjectCatalog } from './components/learning/SubjectCatalog';
import { DailyQuizzes } from './components/learning/DailyQuizzes';
import { DiscussionForums } from './components/learning/DiscussionForums';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Subject } from './types';
import { CoreSubject } from './types/learning';
import { mockUser, subjects, weakAreas, recentSessions } from './data/mockData';
import { Sun, Moon, User, LogOut, BookOpen, BarChart3, Settings, MessageSquare, Target, GraduationCap } from 'lucide-react';

type AppState = 'dashboard' | 'chat' | 'quiz' | 'profile' | 'subjects' | 'analytics' | 'admin' | 'catalog' | 'daily-quizzes' | 'forums';
type AuthState = 'login' | 'register';

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AppState>('dashboard');
  const [authView, setAuthView] = useState<AuthState>('login');
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(undefined);
  const [selectedCoreSubject, setSelectedCoreSubject] = useState<CoreSubject | undefined>(undefined);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [bookmarkedSubjects, setBookmarkedSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarkedSubjects');
    return saved ? JSON.parse(saved) : [];
  });

  // Check if user is admin (mock check)
  const isAdmin = user?.email === 'admin@example.com';

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('bookmarkedSubjects', JSON.stringify(bookmarkedSubjects));
  }, [bookmarkedSubjects]);

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('chat');
  };

  const handleSelectCoreSubject = (subject: CoreSubject) => {
    setSelectedCoreSubject(subject);
    // Convert CoreSubject to Subject for compatibility
    const convertedSubject: Subject = {
      id: subject.id,
      name: subject.name,
      icon: 'BookOpen',
      description: subject.description,
      color: subject.color,
      totalTopics: subject.topics.length,
      completedTopics: subject.topics.filter(t => t.isCompleted).length,
      difficulty: subject.difficulty as 'Beginner' | 'Intermediate' | 'Advanced'
    };
    setSelectedSubject(convertedSubject);
    setCurrentView('chat');
  };

  const handleStartChat = () => {
    setSelectedSubject(undefined);
    setCurrentView('chat');
  };

  const handleStartQuiz = () => {
    setSelectedSubject(undefined);
    setCurrentView('quiz');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedSubject(undefined);
    setSelectedCoreSubject(undefined);
  };

  const handleQuizComplete = (score: number, weakAreasIdentified: string[]) => {
    console.log('Quiz completed:', { score, weakAreasIdentified });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleBookmark = (subjectId: string) => {
    setBookmarkedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleLogout = () => {
    logout();
    setCurrentView('dashboard');
  };

  // Dark Mode Toggle Button (Fixed Position)
  const DarkModeToggle = () => (
    <button
      onClick={toggleDarkMode}
      className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
          : 'bg-white text-gray-700 hover:bg-gray-100'
      } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );

  // User Menu (Fixed Position)
  const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    if (!isAuthenticated || !user) return null;

    return (
      <div className="fixed top-4 left-4 z-50">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center space-x-2 p-3 rounded-full shadow-lg transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
          >
            <img 
              src={user.avatar} 
              alt={user.firstName}
              className="w-6 h-6 rounded-full"
            />
            <span className="hidden sm:block font-medium">{user.firstName}</span>
          </button>

          {isOpen && (
            <div className={`absolute top-full left-0 mt-2 w-48 border rounded-xl shadow-lg transition-colors duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-2">
                <button
                  onClick={() => {
                    setCurrentView('profile');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setCurrentView('catalog');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 mr-3" />
                  Subject Catalog
                </button>
                <button
                  onClick={() => {
                    setCurrentView('daily-quizzes');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Target className="w-4 h-4 mr-3" />
                  Daily Quizzes
                </button>
                <button
                  onClick={() => {
                    setCurrentView('forums');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Discussion Forums
                </button>
                <button
                  onClick={() => {
                    setCurrentView('subjects');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-3" />
                  My Subjects
                </button>
                <button
                  onClick={() => {
                    setCurrentView('analytics');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Study Analytics
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setCurrentView('admin');
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Admin Panel
                  </button>
                )}
                <hr className={`my-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`} />
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    darkMode 
                      ? 'text-red-400 hover:bg-gray-700' 
                      : 'text-red-600 hover:bg-gray-100'
                  }`}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // If not authenticated, show auth pages
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <>
          <DarkModeToggle />
          <RegisterPage 
            onSwitchToLogin={() => setAuthView('login')}
            darkMode={darkMode}
          />
        </>
      );
    }
    
    return (
      <>
        <DarkModeToggle />
        <LoginPage 
          onSwitchToRegister={() => setAuthView('register')}
          darkMode={darkMode}
        />
      </>
    );
  }

  // Authenticated user views
  switch (currentView) {
    case 'profile':
      return (
        <>
          <DarkModeToggle />
          <UserMenu />
          <ProfilePage
            onBack={handleBackToDashboard}
            darkMode={darkMode}
          />
        </>
      );
    case 'subjects':
      return (
        <>
          <DarkModeToggle />
          <UserMenu />
          <SubjectDashboard
            onBack={handleBackToDashboard}
            darkMode={darkMode}
          />
        </>
      );
    case 'analytics':
      return (
        <>
          <DarkModeToggle />
          <UserMenu />
          <StudyDashboard
            onBack={handleBackToDashboard}
            darkMode={darkMode}
          />
        </>
      );
    case 'admin':
      return (
        <>
          <DarkModeToggle />
          <UserMenu />
          <AdminDashboard darkMode={darkMode} />
        </>
      );
    case 'catalog':
      return (
        <>
          <DarkModeToggle />
          <UserMenu />
          <SubjectCatalog
            darkMode={darkMode}
            onSelectSubject={handleSelectCoreSubject}
          />
        </>
      );
    case 'daily-quizzes':
      return (
        <>
          <DarkModeToggle />
          <UserMenu />
          <DailyQuizzes darkMode={darkMode} />
        </>
      );
    case 'forums':
      return (
        <>
          <DarkModeToggle />
          <UserMenu />
          <DiscussionForums darkMode={darkMode} />
        </>
      );
    case 'chat':
      return (
        <>
          <DarkModeToggle />
          <UserMenu />
          <TutorChat
            selectedSubject={selectedSubject}
            onBack={handleBackToDashboard}
            darkMode={darkMode}
          />
        </>
      );
    case 'quiz':
      return (
        <>
          <DarkModeToggle />
          <UserMenu />
          <QuizSystem
            selectedSubject={selectedSubject}
            onBack={handleBackToDashboard}
            onQuizComplete={handleQuizComplete}
            darkMode={darkMode}
          />
        </>
      );
    default:
      return (
        <>
          <DarkModeToggle />
          <UserMenu />
          <Dashboard
            user={mockUser}
            subjects={subjects}
            weakAreas={weakAreas}
            recentSessions={recentSessions}
            onSelectSubject={handleSelectSubject}
            onStartChat={handleStartChat}
            onStartQuiz={handleStartQuiz}
            darkMode={darkMode}
            bookmarkedSubjects={bookmarkedSubjects}
            onToggleBookmark={toggleBookmark}
          />
        </>
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;