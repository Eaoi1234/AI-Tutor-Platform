import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Clock, Target, Users, ChevronRight,
  Loader2, Download, Share2, Play, CheckCircle, Settings
} from 'lucide-react';
import { openAIService, GeneratedCourse } from '../../utils/openai';

interface CourseGeneratorProps {
  darkMode: boolean;
  onCourseGenerated?: (course: GeneratedCourse) => void;
}

export const CourseGenerator: React.FC<CourseGeneratorProps> = ({ 
  darkMode, 
  onCourseGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: 20,
    specificTopics: '',
    learningGoals: ''
  });

  const handleGenerateCourse = async () => {
    if (!formData.subject.trim()) return;

    setIsGenerating(true);
    try {
      const topics = formData.specificTopics 
        ? formData.specificTopics.split(',').map(t => t.trim()).filter(t => t)
        : undefined;

      const course = await openAIService.generateCourse(
        formData.subject,
        formData.level,
        formData.duration,
        topics
      );

      setGeneratedCourse(course);
      if (onCourseGenerated) {
        onCourseGenerated(course);
      }
    } catch (error) {
      console.error('Error generating course:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartCourse = () => {
    if (generatedCourse && onCourseGenerated) {
      onCourseGenerated(generatedCourse);
    }
  };

  if (generatedCourse) {
    return (
      <div className={`max-w-4xl mx-auto p-6 transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`border rounded-xl p-8 transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Course Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{generatedCourse.title}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      generatedCourse.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      generatedCourse.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {generatedCourse.difficulty}
                    </span>
                    <span className={`text-sm flex items-center transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Clock className="w-4 h-4 mr-1" />
                      {generatedCourse.estimatedHours} hours
                    </span>
                    <span className={`text-sm flex items-center transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Target className="w-4 h-4 mr-1" />
                      {generatedCourse.modules.length} modules
                    </span>
                  </div>
                </div>
              </div>
              <p className={`text-lg mb-6 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>{generatedCourse.description}</p>
            </div>
            <button
              onClick={() => setGeneratedCourse(null)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`border rounded-lg p-4 transition-colors duration-300 ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Learning Objectives</h3>
              <ul className="space-y-1">
                {generatedCourse.learningObjectives.map((objective, index) => (
                  <li key={index} className={`text-sm flex items-start transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`border rounded-lg p-4 transition-colors duration-300 ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Prerequisites</h3>
              {generatedCourse.prerequisites.length > 0 ? (
                <ul className="space-y-1">
                  {generatedCourse.prerequisites.map((prereq, index) => (
                    <li key={index} className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>• {prereq}</li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>No prerequisites required</p>
              )}
            </div>

            <div className={`border rounded-lg p-4 transition-colors duration-300 ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Course Structure</h3>
              <div className="space-y-2 text-sm">
                <div className={`flex justify-between transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span>Modules:</span>
                  <span>{generatedCourse.modules.length}</span>
                </div>
                <div className={`flex justify-between transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span>Total Lessons:</span>
                  <span>{generatedCourse.modules.reduce((total, module) => total + module.lessons.length, 0)}</span>
                </div>
                <div className={`flex justify-between transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span>Estimated Time:</span>
                  <span>{generatedCourse.estimatedHours}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Modules */}
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-6 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Course Modules</h2>
            
            <div className="space-y-4">
              {generatedCourse.modules.map((module, index) => (
                <div key={module.id} className={`border rounded-lg p-6 transition-colors duration-300 ${
                  darkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className={`font-semibold transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{module.title}</h3>
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{module.description}</p>
                      </div>
                    </div>
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {module.estimatedTime}min
                    </span>
                  </div>

                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <span className="text-xs">{lessonIndex + 1}</span>
                          </div>
                          <span className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{lesson.title}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            lesson.type === 'video' ? 'bg-red-100 text-red-800' :
                            lesson.type === 'quiz' ? 'bg-blue-100 text-blue-800' :
                            lesson.type === 'assignment' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {lesson.type}
                          </span>
                        </div>
                        <span className={`text-xs transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {lesson.duration}min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartCourse}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Learning
            </button>
            <button className={`px-6 py-3 border rounded-xl transition-colors flex items-center justify-center ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Download className="w-4 h-4 mr-2" />
              Download Syllabus
            </button>
            <button className={`px-6 py-3 border rounded-xl transition-colors flex items-center justify-center ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-6 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`border rounded-xl p-8 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>AI Course Generator</h1>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Create personalized courses tailored to your learning needs</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., JavaScript, Calculus, Spanish, etc."
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Difficulty Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Course Duration (hours)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 20 })}
              min="5"
              max="100"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Specific Topics (optional)
            </label>
            <input
              type="text"
              value={formData.specificTopics}
              onChange={(e) => setFormData({ ...formData, specificTopics: e.target.value })}
              placeholder="e.g., functions, loops, variables (comma-separated)"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Learning Goals (optional)
            </label>
            <textarea
              value={formData.learningGoals}
              onChange={(e) => setFormData({ ...formData, learningGoals: e.target.value })}
              placeholder="What do you want to achieve with this course?"
              rows={3}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <button
            onClick={handleGenerateCourse}
            disabled={!formData.subject.trim() || isGenerating}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Course...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Course
              </>
            )}
          </button>

          {/* API Key Notice */}
          {!import.meta.env.VITE_OPENAI_API_KEY && (
            <div className={`p-4 rounded-lg border transition-colors duration-300 ${
              darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-yellow-300' : 'text-yellow-800'
              }`}>
                💡 Add your OpenAI API key to .env file as VITE_OPENAI_API_KEY for AI-powered course generation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};