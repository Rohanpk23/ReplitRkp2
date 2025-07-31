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
      
      {/* Airbnb-style Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center space-x-3 py-6 px-6 rounded-full font-medium text-sm transition-all duration-200 ${
                activeTab === 'home'
                  ? 'bg-rose-50 text-rose-600 shadow-sm border border-rose-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-3 py-6 px-6 rounded-full font-medium text-sm transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-rose-50 text-rose-600 shadow-sm border border-rose-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        {activeTab === 'home' && <HomeContent />}
        {activeTab === 'analytics' && <Analytics />}
      </main>

      {/* Airbnb-style Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-sm text-gray-500">
            <div className="flex items-center space-x-3">
              <span>© 2024 AI Occupancy Translator</span>
              <span>•</span>
              <span>v2.1</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-rose-600">Powered by Google Gemini</span>
              <span>•</span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}