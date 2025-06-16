import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TutorChat } from './components/TutorChat';
import { QuizSystem } from './components/QuizSystem';
import { Subject } from './types';
import { mockUser, subjects, weakAreas, recentSessions } from './data/mockData';
import { Sun, Moon } from 'lucide-react';

type AppState = 'dashboard' | 'chat' | 'quiz';

function App() {
  const [currentView, setCurrentView] = useState<AppState>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(undefined);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [bookmarkedSubjects, setBookmarkedSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarkedSubjects');
    return saved ? JSON.parse(saved) : [];
  });

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
  };

  const handleQuizComplete = (score: number, weakAreasIdentified: string[]) => {
    console.log('Quiz completed:', { score, weakAreasIdentified });
    // In a real app, this would update the user's progress and weak areas
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

  switch (currentView) {
    case 'chat':
      return (
        <>
          <DarkModeToggle />
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

export default App;