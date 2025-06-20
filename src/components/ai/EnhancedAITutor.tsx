import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, Send, Sparkles, BookOpen, Target, Lightbulb, 
  MessageCircle, ArrowLeft, Loader2, RefreshCw, Settings
} from 'lucide-react';
import { openAIService } from '../../utils/openai';

interface EnhancedAITutorProps {
  darkMode: boolean;
  onBack: () => void;
  selectedSubject?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export const EnhancedAITutor: React.FC<EnhancedAITutorProps> = ({ 
  darkMode, 
  onBack, 
  selectedSubject 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isInitialized) {
      initializeChat();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'ai',
      content: `Hello! I'm your AI tutor powered by advanced language models. I'm here to help you understand concepts, solve problems, and guide your learning journey${selectedSubject ? ` in ${selectedSubject}` : ''}. 

What would you like to learn about today? I can:
• Explain complex concepts in simple terms
• Help you work through problems step-by-step
• Generate practice questions
• Create personalized study plans
• Answer any questions you have

Just ask me anything!`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await openAIService.generateTutorResponse(
        inputValue, 
        selectedSubject,
        messages.slice(-4).map(m => m.content) // Last 4 messages for context
      );
      
      // Remove loading message and add actual response
      setMessages(prev => {
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
      setMessages(prev => {
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
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Can you explain this concept step by step?",
    "What are some real-world applications?",
    "Can you create practice problems for me?",
    "Help me understand why this works",
    "What should I study next?",
    "Can you make a study plan for me?"
  ];

  const quickActions = [
    { icon: Target, label: "Generate Quiz", action: () => setInputValue("Generate a quiz for me") },
    { icon: BookOpen, label: "Explain Concept", action: () => setInputValue("Can you explain") },
    { icon: Lightbulb, label: "Study Tips", action: () => setInputValue("Give me study tips for") },
    { icon: RefreshCw, label: "Practice Problems", action: () => setInputValue("Create practice problems for") }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`border rounded-xl shadow-sm h-[calc(100vh-48px)] flex flex-col transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`border-b p-6 transition-colors duration-300 ${
            darkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Enhanced AI Tutor</h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Powered by OpenAI</span>
                  </div>
                </div>
              </div>
              <button className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}>
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className={`border-b p-4 transition-colors duration-300 ${
              darkMode ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <p className={`text-sm mb-3 transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`flex items-center px-3 py-2 text-sm border rounded-lg hover:border-blue-400 transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  message.type === 'user' ? 'order-2' : 'order-1'
                }`}>
                  {message.type === 'ai' && (
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-2">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className={`text-xs font-medium transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>AI Tutor</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-100 border border-gray-600'
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}
                  </div>
                  <p className={`text-xs mt-1 px-1 transition-colors duration-300 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className={`px-6 py-4 border-t transition-colors duration-300 ${
              darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
            }`}>
              <p className={`text-sm mb-3 flex items-center transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(question);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className={`px-3 py-2 text-sm border rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors ${
                      darkMode 
                        ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-blue-900 hover:text-blue-200' 
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className={`p-6 border-t transition-colors duration-300 ${
            darkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your studies..."
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-sm transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  disabled={isTyping}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* API Key Notice */}
            {!import.meta.env.VITE_OPENAI_API_KEY && (
              <div className={`mt-3 p-3 rounded-lg border transition-colors duration-300 ${
                darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`text-xs transition-colors duration-300 ${
                  darkMode ? 'text-yellow-300' : 'text-yellow-800'
                }`}>
                  💡 Add your OpenAI API key to .env file as VITE_OPENAI_API_KEY for enhanced AI responses
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};