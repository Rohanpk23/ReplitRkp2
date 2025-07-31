import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="text-white h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">AI Occupancy Translator</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium shadow-sm">
              AI
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
