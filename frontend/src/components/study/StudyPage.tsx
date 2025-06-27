import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle,
  Lock,
  Play,
  Pause,
  MessageSquare,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Volume2,
  Settings,
  Bookmark,
  Share2,
  Download,
  RotateCcw,
  AlertCircle,
  Brain,
  Lightbulb,
  HelpCircle,
  Zap,
} from "lucide-react";
import { Subject } from "../../types";
import { fetchChapters, fetchChapter } from "../../api";

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
  type: "video" | "text" | "quiz" | "assignment";
  duration: number;
  isCompleted: boolean;
  isLocked: boolean;
  content?: string;
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export const StudyPage: React.FC<StudyPageProps> = ({
  subject,
  onBack,
  darkMode,
  moduleId,
  lessonId,
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content: "Hey, I am your AI instructor. How can I help you today? 🤖",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const suggestedQuestions = [
    "What are the main differences between Angular and other front-end frameworks like React or Vue.js?",
    "How does Angular's component-based architecture improve code maintainability?",
    "What are some potential drawbacks of using Angular for small or simple projects?",
    "How does TypeScript contribute to the development process in Angular?",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    // Fetch chapters from backend and map to modules/lessons (same logic as SubjectInfoPage)
    const getModules = async () => {
      try {
        const chaptersData = await fetchChapters();
        // สมมติว่า data[0] คือเอกสารที่ต้องการ (อาจต้องปรับตาม subject)
        const doc = chaptersData[0];
        if (doc && doc.chapters && doc.chapters.length > 0) {
          const [mainChapter, ...lessonChapters] = doc.chapters;
          setModules([
            {
              id: "1",
              title: mainChapter.chapterName,
              isCompleted: false,
              isExpanded: true,
              lessons: lessonChapters.map((chapter: any, idx: number) => ({
                id: String(idx + 2),
                title: chapter.chapterName,
                type: "text",
                duration: 30,
                isCompleted: false,
                isLocked: false,
                content: chapter.content,
              })),
            },
          ]);
        } else {
          setModules([]);
        }
      } catch (e) {
        setModules([]);
      }
    };
    getModules();
  }, []);

  useEffect(() => {
    // Set first lesson as current after modules loaded
    if (modules.length > 0 && !currentLesson) {
      setCurrentLesson(modules[0].lessons[0]);
    }
  }, [modules]);

  useEffect(() => {
    const fetchContent = async () => {
      setLoadingContent(true);
      try {
        if (currentLesson) {
          const data = await fetchChapter(currentLesson.id);
          setCurrentLesson((prev) => prev ? { ...prev, content: data.content } : null);
        }
      } catch {
        setCurrentLesson((prev) => prev ? { ...prev, content: "Failed to load content." } : null);
      } finally {
        setLoadingContent(false);
      }
    };
    if (currentLesson && !currentLesson.content) {
      fetchContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson?.id]);

  const toggleModule = (moduleId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? { ...module, isExpanded: !module.isExpanded }
          : module
      )
    );
  };

  const selectLesson = (lesson: Lesson) => {
    if (!lesson.isLocked) {
      setCurrentLesson(lesson);
    }
  };

  const markAsComplete = () => {
    // Mark current lesson as completed
    setModules((prev) =>
      prev.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) =>
          lesson.id === currentLesson?.id
            ? { ...lesson, isCompleted: true }
            : lesson
        ),
      }))
    );
  };

  const markAsUndone = () => {
    // Mark current lesson as not completed
    setModules((prev) =>
      prev.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) =>
          lesson.id === currentLesson?.id
            ? { ...lesson, isCompleted: false }
            : lesson
        ),
      }))
    );
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "That's a great question! Let me explain this concept in detail. Angular is designed to be a comprehensive framework that provides everything you need to build large-scale applications. The component-based architecture allows for better code organization and reusability.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Play;
      case "text":
        return BookOpen;
      case "quiz":
        return HelpCircle;
      case "assignment":
        return AlertCircle;
      default:
        return BookOpen;
    }
  };

  const totalLessons = modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const completedLessons = modules.reduce(
    (total, module) =>
      total + module.lessons.filter((lesson) => lesson.isCompleted).length,
    0
  );
  const progressPercentage = totalLessons > 0 ? Math.round(
    (completedLessons / totalLessons) * 100
  ) : 0;

  const currentLessonIndex = currentLesson
    ? modules.flatMap((m) => m.lessons).findIndex((l) => l.id === currentLesson.id) + 1
    : 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`border-b transition-colors duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {subject.name} Fundamentals for Beginners
                </h1>
                <div className="flex items-center space-x-4 text-sm">
                  <span
                    className={`transition-colors duration-300 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {totalLessons} lessons • {progressPercentage}% complete
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`text-sm transition-colors duration-300 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                100% of the daily limit used
              </span>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                🔄 Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className={`border-b transition-colors duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  progressPercentage < 100
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {progressPercentage}% Completed
              </span>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span
                  className={`text-sm transition-colors duration-300 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Outline
                </span>
              </div>
            </div>
          </div>
          <div
            className={`w-full rounded-full h-1 mb-3 ${
              darkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
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
            <div
              className={`border rounded-xl p-4 sticky top-6 max-h-[calc(100vh-200px)] overflow-y-auto transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="space-y-3">
                {modules.map((module, moduleIndex) => (
                  <div key={module.id}>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            module.isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {module.isCompleted ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <span className="text-xs font-bold">
                              {moduleIndex + 1}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
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
                          const isActive = lesson.id === currentLesson?.id;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => selectLesson(lesson)}
                              disabled={lesson.isLocked}
                              className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors ${
                                isActive
                                  ? "bg-blue-100 text-blue-900 border border-blue-200"
                                  : lesson.isLocked
                                  ? "opacity-50 cursor-not-allowed"
                                  : darkMode
                                  ? "hover:bg-gray-700 text-gray-300"
                                  : "hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                  lesson.isCompleted
                                    ? "bg-green-500 text-white"
                                    : lesson.isLocked
                                    ? "bg-gray-400 text-gray-600"
                                    : "bg-blue-500 text-white"
                                }`}
                              >
                                {lesson.isCompleted ? (
                                  <CheckCircle className="w-2 h-2" />
                                ) : lesson.isLocked ? (
                                  <Lock className="w-2 h-2" />
                                ) : (
                                  <Icon className="w-2 h-2" />
                                )}
                              </div>
                              <span className="text-xs flex-1">
                                {lesson.title}
                              </span>
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
            <div
              className={`border rounded-xl transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Lesson Header */}
              <div
                className={`border-b p-6 transition-colors duration-300 ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-sm transition-colors duration-300 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Lesson {currentLessonIndex} of {totalLessons}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <Settings className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentLesson?.isCompleted ? (
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
                <h1
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {currentLesson?.title}
                </h1>
              </div>

              {/* Lesson Content */}
              <div className="p-6">
                <div
                  className={`prose max-w-none transition-colors duration-300 ${
                    darkMode ? "prose-invert" : ""
                  }`}
                >
                  {loadingContent ? (
                    <p>Loading content...</p>
                  ) : (
                    <div className="text-lg leading-relaxed mb-6">
                      {`${currentLesson?.content}`}
                    </div>
                  )}

                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Instructor Chat */}
      {showAIChat && (
        <div className="fixed bottom-4 right-4 w-96 h-96 z-50">
          <div
            className={`border rounded-xl shadow-lg h-full flex flex-col transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Chat Header */}
            <div
              className={`border-b p-4 flex items-center justify-between transition-colors duration-300 ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3
                    className={`font-semibold transition-colors duration-300 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    AI Instructor
                  </h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span
                      className={`text-xs transition-colors duration-300 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAIChat(false)}
                className={`p-1 rounded-lg transition-colors ${
                  darkMode
                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs ${
                      message.type === "user" ? "order-2" : "order-1"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : darkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Questions */}
            {chatMessages.length === 1 && (
              <div
                className={`px-4 py-2 border-t transition-colors duration-300 ${
                  darkMode
                    ? "border-gray-700 bg-gray-750"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <p
                  className={`text-xs mb-2 transition-colors duration-300 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Some questions you might have about this lesson:
                </p>
                <div className="space-y-1">
                  {suggestedQuestions.slice(0, 2).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setChatInput(question);
                        setTimeout(() => sendMessage(), 100);
                      }}
                      className={`w-full text-left text-xs p-2 rounded border transition-colors ${
                        darkMode
                          ? "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {question.length > 60
                        ? question.substring(0, 60) + "..."
                        : question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div
              className={`border-t p-4 transition-colors duration-300 ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask a question..."
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-300 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Instructor Button */}
      {!showAIChat && (
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center z-40 hover:scale-110"
        >
          <Brain className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
