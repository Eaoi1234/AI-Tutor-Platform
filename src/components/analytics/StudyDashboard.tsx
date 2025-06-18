import React, { useState } from 'react';
import { DailyTracker } from './DailyTracker';
import { MonthlyOverview } from './MonthlyOverview';
import { PersonalAnalytics } from './PersonalAnalytics';
import { StudyGroups } from './StudyGroups';
import { 
  Calendar, BarChart3, User, Users, Target, Clock, 
  TrendingUp, Award, Settings
} from 'lucide-react';

interface StudyDashboardProps {
  onBack: () => void;
  darkMode: boolean;
}

export const StudyDashboard: React.FC<StudyDashboardProps> = ({ onBack, darkMode }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'analytics' | 'groups'>('daily');

  const tabs = [
    { id: 'daily', label: 'Daily Progress', icon: Clock },
    { id: 'monthly', label: 'Monthly Overview', icon: Calendar },
    { id: 'analytics', label: 'Personal Analytics', icon: BarChart3 },
    { id: 'groups', label: 'Study Groups', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'daily':
        return <DailyTracker darkMode={darkMode} />;
      case 'monthly':
        return <MonthlyOverview darkMode={darkMode} />;
      case 'analytics':
        return <PersonalAnalytics darkMode={darkMode} />;
      case 'groups':
        return <StudyGroups darkMode={darkMode} />;
      default:
        return <DailyTracker darkMode={darkMode} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation Tabs */}
      <div className={`border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : darkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};