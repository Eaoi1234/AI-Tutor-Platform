import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, BookOpen, Clock, CheckCircle, Lock, Play, Pause,
  MessageSquare, Send, X, ChevronDown, ChevronUp, Volume2,
  Settings, Bookmark, Share2, Download, RotateCcw, AlertCircle,
  Brain, Lightbulb, HelpCircle, Zap, Loader2, Sparkles
} from 'lucide-react';
import { Subject } from '../../types';
import { openAIService } from '../../utils/openai';

interface StudyPageProps {
  subject: Subject;
  onBack: () => void;
  darkMode: boolean;
  moduleId?: string;
  lessonId?: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  isCompleted: boolean;
  isExpanded: boolean;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number;
  isCompleted: boolean;
  isLocked: boolean;
  content?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export const StudyPage: React.FC<StudyPageProps> = ({ 
  subject, 
  onBack, 
  darkMode, 
  moduleId, 
  lessonId 
}) => {
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Introduction to Angular',
      isCompleted: true,
      isExpanded: true,
      lessons: [
        { id: '1', title: 'What is Angular and Why Use It?', type: 'text', duration: 15, isCompleted: true, isLocked: false },
        { id: '2', title: 'Setting Up Your Development Environment', type: 'text', duration: 20, isCompleted: true, isLocked: false },
        { id: '3', title: 'Understanding Angular CLI', type: 'video', duration: 25, isCompleted: true, isLocked: false },
        { id: '4', title: 'Creating Your First Angular Project', type: 'assignment', duration: 30, isCompleted: true, isLocked: false },
        { id: '5', title: 'Project Structure Overview', type: 'text', duration: 15, isCompleted: true, isLocked: false },
        { id: '6', title: 'Running and Testing Your Application', type: 'video', duration: 20, isCompleted: true, isLocked: false }
      ]
    },
    {
      id: '2',
      title: 'Components and Templates',
      isCompleted: false,
      isExpanded: false,
      lessons: [
        { id: '7', title: 'Understanding Angular Components', type: 'video', duration: 25, isCompleted: false, isLocked: false },
        { id: '8', title: 'Creating and Using Components', type: 'assignment', duration: 35, isCompleted: false, isLocked: false },
        { id: '9', title: 'Template Syntax and Data Binding', type: 'text', duration: 30, isCompleted: false, isLocked: false },
        { id: '10', title: 'Event Handling', type: 'video', duration: 20, isCompleted: false, isLocked: false }
      ]
    },
    {
      id: '3',
      title: 'Data Binding and Directives',
      isCompleted: false,
      isExpanded: false,
      lessons: [
        { id: '11', title: 'Two-way Data Binding', type: 'video', duration: 25, isCompleted: false, isLocked: true },
        { id: '12', title: 'Structural Directives', type: 'text', duration: 30, isCompleted: false, isLocked: true },
        { id: '13', title: 'Attribute Directives', type: 'video', duration: 25, isCompleted: false, isLocked: true }
      ]
    }
  ]);

  const [currentLesson, setCurrentLesson] = useState<Lesson>(() => {
    // If lessonId is provided, find that specific lesson
    if (lessonId) {
      for (const module of modules) {
        const lesson = module.lessons.find(l => l.id === lessonId);
        if (lesson) return lesson;
      }
    }
    
    // If moduleId is provided, find the first lesson in that module
    if (moduleId) {
      const module = modules.find(m => m.id === moduleId);
      if (module && module.lessons.length > 0) {
        return module.lessons[0];
      }
    }
    
    // Default to first lesson
    return modules[0].lessons[0];
  });

  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Can you explain this concept in simpler terms?",
    "What are some real-world examples of this?",
    "How does this relate to what I learned before?",
    "Can you give me practice problems?",
    "What should I focus on to master this topic?",
    "How can I apply this knowledge practically?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Expand the module containing the current lesson and set initial state
  useEffect(() => {
    if (moduleId || lessonId) {
      setModules(prev => prev.map(module => {
        // If specific moduleId provided, expand that module
        if (moduleId && module.id === moduleId) {
          return { ...module, isExpanded: true };
        }
        // If lessonId provided, expand the module containing that lesson
        if (lessonId && module.lessons.some(lesson => lesson.id === lessonId)) {
          return { ...module, isExpanded: true };
        }
        return module;
      }));
    }
  }, [moduleId, lessonId]);

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'ai',
      content: `Hi! I'm your AI study assistant for ${subject.name}. I'm here to help you understand the current lesson: "${currentLesson.title}".

I can help you with:
• Explaining difficult concepts
• Providing additional examples
• Creating practice questions
• Connecting ideas to real-world applications
• Clarifying any doubts you have

What would you like to know about this topic?`,
      timestamp: new Date()
    };
    setChatMessages([welcomeMessage]);
    setIsInitialized(true);
  };

  const toggleModule = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, isExpanded: !module.isExpanded }
        : module
    ));
  };

  const selectLesson = (lesson: Lesson) => {
    if (!lesson.isLocked) {
      setCurrentLesson(lesson);
      // Reset chat when switching lessons
      setIsInitialized(false);
      setChatMessages([]);
    }
  };

  const markAsComplete = () => {
    // Mark current lesson as completed
    setModules(prev => prev.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => 
        lesson.id === currentLesson.id 
          ? { ...lesson, isCompleted: true }
          : lesson
      )
    })));
  };

  const markAsUndone = () => {
    // Mark current lesson as not completed
    setModules(prev => prev.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => 
        lesson.id === currentLesson.id 
          ? { ...lesson, isCompleted: false }
          : lesson
      )
    })));
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    setChatMessages(prev => [...prev, loadingMessage]);

    try {
      // Create context about the current lesson
      const lessonContext = `Current lesson: "${currentLesson.title}" in ${subject.name}. This is a ${currentLesson.type} lesson that takes about ${currentLesson.duration} minutes.`;
      
      const response = await openAIService.generateTutorResponse(
        chatInput, 
        subject.name,
        [lessonContext, ...chatMessages.slice(-4).map(m => m.content)] // Include lesson context and last 4 messages
      );
      
      // Remove loading message and add actual response
      setChatMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: response,
          timestamp: new Date()
        }];
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      setChatMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date()
        }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'text': return BookOpen;
      case 'quiz': return HelpCircle;
      case 'assignment': return AlertCircle;
      default: return BookOpen;
    }
  };

  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
  const completedLessons = modules.reduce((total, module) => 
    total + module.lessons.filter(lesson => lesson.isCompleted).length, 0
  );
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

  const currentLessonIndex = modules.flatMap(m => m.lessons).findIndex(l => l.id === currentLesson.id) + 1;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-lg font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {subject.name} Fundamentals for Beginners
                </h1>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {modules.length} modules • {totalLessons} lessons • {progressPercentage}% complete
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>100% of the daily limit used</span>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                🔄 Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                progressPercentage < 100 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {progressPercentage}% Completed
              </span>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Outline</span>
              </div>
            </div>
          </div>
          <div className={`w-full rounded-full h-1 mb-3 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className="bg-green-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Outline */}
          <div className="lg:col-span-1">
            <div className={`border rounded-xl p-4 sticky top-6 max-h-[calc(100vh-200px)] overflow-y-auto transition-colors duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="space-y-3">
                {modules.map((module, moduleIndex) => (
                  <div key={module.id}>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          module.isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {module.isCompleted ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <span className="text-xs font-bold">{moduleIndex + 1}</span>
                          )}
                        </div>
                        <span className={`text-sm font-medium transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {module.title}
                        </span>
                      </div>
                      {module.isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {module.isExpanded && (
                      <div className="ml-6 mt-2 space-y-1">
                        {module.lessons.map((lesson) => {
                          const Icon = getTypeIcon(lesson.type);
                          const isActive = lesson.id === currentLesson.id;
                          
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => selectLesson(lesson)}
                              disabled={lesson.isLocked}
                              className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors ${
                                isActive 
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : lesson.isLocked
                                  ? 'opacity-50 cursor-not-allowed'
                                  : darkMode 
                                  ? 'hover:bg-gray-700 text-gray-300' 
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                lesson.isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : lesson.isLocked
                                  ? 'bg-gray-400 text-gray-600'
                                  : 'bg-blue-500 text-white'
                              }`}>
                                {lesson.isCompleted ? (
                                  <CheckCircle className="w-2 h-2" />
                                ) : lesson.isLocked ? (
                                  <Lock className="w-2 h-2" />
                                ) : (
                                  <Icon className="w-2 h-2" />
                                )}
                              </div>
                              <span className="text-xs flex-1">{lesson.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className={`border rounded-xl transition-colors duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              {/* Lesson Header */}
              <div className={`border-b p-6 transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Lesson {currentLessonIndex} of {totalLessons}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <Settings className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentLesson.isCompleted ? (
                      <button
                        onClick={markAsUndone}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Mark as Undone
                      </button>
                    ) : (
                      <button
                        onClick={markAsComplete}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentLesson.title}
                </h1>
              </div>

              {/* Lesson Content */}
              <div className="p-6">
                <div className={`prose max-w-none transition-colors duration-300 ${
                  darkMode ? 'prose-invert' : ''
                }`}>
                  <p className="text-lg leading-relaxed mb-6">
                    Angular is a powerful, open-source JavaScript framework for building dynamic web applications 
                    and single-page applications (SPAs). It provides a structured approach to front-end development, 
                    promoting code reusability, maintainability, and testability. Understanding what Angular is and 
                    why it's used is crucial for any aspiring web developer. This lesson will delve into the core 
                    concepts of Angular, its benefits, and its place in the modern web development landscape.
                  </p>

                  <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    What is Angular?
                  </h2>
                  
                  <p className="mb-6">
                    Angular is a comprehensive framework, meaning it provides a complete solution for building the 
                    client-side of web applications. It's built and maintained by Google and a large community of 
                    developers. At its heart, Angular is based on components, which are reusable building blocks that 
                    encapsulate HTML, CSS, and TypeScript code.
                  </p>

                  <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Key Features of Angular
                  </h2>

                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>
                      <strong>Component-Based Architecture:</strong> Angular applications are built as a hierarchy of 
                      components, each responsible for a specific part of the user interface.
                    </li>
                    <li>
                      <strong>TypeScript Integration:</strong> Angular is built with TypeScript, providing strong typing, 
                      better tooling, and enhanced developer experience.
                    </li>
                    <li>
                      <strong>Dependency Injection:</strong> A design pattern that makes applications more modular and testable.
                    </li>
                    <li>
                      <strong>Routing:</strong> Built-in router for creating single-page applications with multiple views.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Study Assistant Chat */}
      {showAIChat && (
        <div className="fixed bottom-4 right-4 w-96 h-96 z-50">
          <div className={`border rounded-xl shadow-lg h-full flex flex-col transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Chat Header */}
            <div className={`border-b p-4 flex items-center justify-between transition-colors duration-300 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>AI Study Assistant</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className={`text-xs transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Ready to help</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAIChat(false)}
                className={`p-1 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : darkMode
                          ? 'bg-gray-700 text-gray-100'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Questions */}
            {chatMessages.length === 0 && (
              <div className={`px-4 py-2 border-t transition-colors duration-300 ${
                darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
              }`}>
                <p className={`text-xs mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Quick questions about this lesson:</p>
                <div className="space-y-1">
                  {suggestedQuestions.slice(0, 2).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setChatInput(question);
                        if (!isInitialized) {
                          initializeChat();
                        }
                        setTimeout(() => sendMessage(), 100);
                      }}
                      className={`w-full text-left text-xs p-2 rounded border transition-colors ${
                        darkMode 
                          ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {question.length > 50 ? question.substring(0, 50) + '...' : question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className={`border-t p-4 transition-colors duration-300 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about this lesson..."
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isTyping}
                />
                <button
                  onClick={() => {
                    if (!isInitialized) {
                      initializeChat();
                    }
                    sendMessage();
                  }}
                  disabled={!chatInput.trim() || isTyping}
                  className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-colors"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Assistant Button */}
      {!showAIChat && (
        <button
          onClick={() => {
            setShowAIChat(true);
            if (!isInitialized) {
              initializeChat();
            }
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center z-40 hover:scale-110"
        >
          <Brain className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};