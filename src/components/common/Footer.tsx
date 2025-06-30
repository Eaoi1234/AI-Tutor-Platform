import React from 'react';
import { ExternalLink, Zap } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <footer className={`border-t transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end space-y-4 sm:space-y-0">
          {/* Built with Bolt.new Badge */}
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-lg ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30 hover:border-purple-400/50 text-purple-200 hover:text-purple-100' 
                : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800'
            }`}
          >
            {/* Bolt Icon */}
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200 ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 group-hover:from-purple-400 group-hover:to-blue-400' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-600'
            }`}>
              <Zap className="w-3 h-3 text-white" />
            </div>
            
            {/* Badge Text */}
            <span className="text-sm font-medium">
              Built with Bolt.new
            </span>
            
            {/* External Link Icon */}
            <ExternalLink className={`w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity duration-200`} />
          </a>
        </div>
        
        {/* Optional: Copyright or additional info */}
        <div className="mt-4 text-center">
          <p className={`text-xs transition-colors duration-300 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            © 2024 LearnPath. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};