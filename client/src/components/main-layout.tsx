import { useState } from "react";
import { Home, BarChart3 } from "lucide-react";
import Header from "@/components/header";
import HomeContent from "./home-content";
import Analytics from "@/pages/analytics";

type Tab = 'home' | 'analytics';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'home'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <HomeContent />}
        {activeTab === 'analytics' && <Analytics />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>© 2024</span>
              <span>•</span>
              <span>AI Occupancy Translator v2.1</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Powered by Google Gemini</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <i className="fas fa-shield-alt text-green-600"></i>
                <span>Secure</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}