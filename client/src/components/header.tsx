import { Shield } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="text-primary text-2xl h-6 w-6" />
              <h1 className="text-xl font-semibold text-gray-900">AI Occupancy Translator</h1>
            </div>
            <span className="text-sm text-gray-500 hidden sm:inline">Insurance Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Agent:</span> John Smith
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
              JS
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
