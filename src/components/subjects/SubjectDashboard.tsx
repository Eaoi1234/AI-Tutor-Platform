import React, { useState } from 'react';
import { 
  Search, Filter, Calendar, Clock, Users, BookOpen, 
  Star, ChevronRight, Bell, Award, TrendingUp, Play,
  FileText, Video, Link, Download, AlertCircle
} from 'lucide-react';
import { EnhancedSubject } from '../../types/subjects';
import { enhancedSubjects } from '../../data/enhancedSubjects';

interface SubjectDashboardProps {
  onBack: () => void;
  darkMode: boolean;
}

export const SubjectDashboard: React.FC<SubjectDashboardProps> = ({ onBack, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'enrolled' | 'available'>('all');
  const [selectedSubject, setSelectedSubject] = useState<EnhancedSubject | null>(null);

  const filteredSubjects = enhancedSubjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'enrolled' && subject.enrollmentStatus === 'enrolled') ||
                         (selectedFilter === 'available' && subject.enrollmentStatus === 'available');
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'waitlist': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'video': return Video;
      case 'link': return Link;
      default: return FileText;
    }
  };

  if (selectedSubject) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => setSelectedSubject(null)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <h1 className={`text-xl font-semibold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>{selectedSubject.name}</h1>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>{selectedSubject.code}</p>
            </div>
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedSubject.enrollmentStatus)}`}>
              {selectedSubject.enrollmentStatus}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Overview */}
              <div className={`border rounded-xl p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Course Overview</h2>
                <p className={`mb-6 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>{selectedSubject.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedSubject.credits}</div>
                    <div className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Credits</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{Math.round((selectedSubject.progress.completedTopics / selectedSubject.progress.totalTopics) * 100)}%</div>
                    <div className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Progress</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedSubject.grades.current}</div>
                    <div className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Grade</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedSubject.capacity.current}/{selectedSubject.capacity.max}</div>
                    <div className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Enrolled</div>
                  </div>
                </div>
              </div>

              {/* Assignments */}
              <div className={`border rounded-xl p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-2xl font-semibold mb-6 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Assignments</h2>
                
                <div className="space-y-4">
                  {selectedSubject.assignments.map((assignment) => (
                    <div key={assignment.id} className={`border rounded-lg p-4 transition-colors duration-300 ${
                      darkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className={`font-semibold transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{assignment.title}</h3>
                          <p className={`text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>{assignment.description}</p>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${getAssignmentStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className={`flex items-center transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <Calendar className="w-4 h-4 mr-1" />
                            Due: {assignment.dueDate.toLocaleDateString()}
                          </span>
                          <span className={`transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {assignment.maxPoints} points
                          </span>
                        </div>
                        {assignment.grade && (
                          <span className={`font-semibold transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            Grade: {assignment.grade}/{assignment.maxPoints}
                          </span>
                        )}
                      </div>
                      
                      {assignment.feedback && (
                        <div className={`mt-3 p-3 rounded-lg transition-colors duration-300 ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <p className={`text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <strong>Feedback:</strong> {assignment.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className={`border rounded-xl p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-2xl font-semibold mb-6 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Course Materials</h2>
                
                <div className="space-y-3">
                  {selectedSubject.materials.map((material) => {
                    const Icon = getMaterialIcon(material.type);
                    return (
                      <div key={material.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors duration-300 ${
                        darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                            darkMode ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-5 h-5 transition-colors duration-300 ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className={`font-medium transition-colors duration-300 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>{material.title}</h3>
                            <p className={`text-sm transition-colors duration-300 ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {material.description} {material.size && `• ${material.size}`}
                            </p>
                          </div>
                        </div>
                        <button className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}>
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Instructor Info */}
              <div className={`border rounded-xl p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Instructor</h3>
                
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={selectedSubject.instructor.avatar}
                    alt={selectedSubject.instructor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className={`font-medium transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedSubject.instructor.name}</h4>
                    <p className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{selectedSubject.instructor.title}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <strong>Office Hours:</strong> {selectedSubject.instructor.officeHours}
                  </p>
                  <p className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <strong>Location:</strong> {selectedSubject.instructor.officeLocation}
                  </p>
                  <p className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <strong>Email:</strong> {selectedSubject.instructor.email}
                  </p>
                </div>
              </div>

              {/* Schedule */}
              <div className={`border rounded-xl p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Days</p>
                    <p className={`transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedSubject.schedule.days.join(', ')}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Time</p>
                    <p className={`transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedSubject.schedule.time}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Location</p>
                    <p className={`transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedSubject.schedule.location}</p>
                  </div>
                </div>
              </div>

              {/* Announcements */}
              <div className={`border rounded-xl p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Bell className="w-5 h-5 mr-2" />
                  Announcements
                </h3>
                
                <div className="space-y-3">
                  {selectedSubject.announcements.map((announcement) => (
                    <div key={announcement.id} className={`p-3 border rounded-lg transition-colors duration-300 ${
                      darkMode ? 'border-gray-600' : 'border-gray-200'
                    } ${!announcement.isRead ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium text-sm transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{announcement.title}</h4>
                        {announcement.priority === 'high' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className={`text-sm transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{announcement.content}</p>
                      <p className={`text-xs mt-2 transition-colors duration-300 ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {announcement.publishDate.toLocaleDateString()} • {announcement.author}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <div className="flex space-x-2">
            {['all', 'enrolled', 'available'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter as any)}
                className={`px-4 py-3 rounded-xl font-medium capitalize transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <BookOpen className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>My Subjects</h3>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Your enrolled subjects will appear here</p>
        </div>
      </div>
    </div>
  );
};