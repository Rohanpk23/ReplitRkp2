import { useState } from "react";
import BusinessDescriptionInput from "@/components/business-description-input";
import AnalysisResults from "@/components/analysis-results";
import CorrectionModal from "@/components/correction-modal";
import Sidebar from "@/components/sidebar";
import Analytics from "@/pages/analytics";
import { Button } from "@/components/ui/button";
import { Home, BarChart3 } from "lucide-react";
import type { AnalysisResponse, Suggestion } from "@shared/schema";

export default function HomeContent() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'analytics'>('home');
  const [selectedSuggestion, setSelectedSuggestion] = useState<{
    suggestion: Suggestion;
    index: number;
  } | null>(null);

  const handleAnalysisComplete = (result: AnalysisResponse) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
  };

  const handleFeedback = (suggestion: Suggestion, index: number, type: 'positive' | 'negative') => {
    if (type === 'negative') {
      setSelectedSuggestion({ suggestion, index });
      setCorrectionModalOpen(true);
    } else {
      // Handle positive feedback directly
      // Implementation would call the feedback API
    }
  };

  const handleReanalyze = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Toggle Navigation */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={currentView === 'home' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('home')}
          className="flex items-center space-x-2"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>
        <Button
          variant={currentView === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('analytics')}
          className="flex items-center space-x-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </Button>
      </div>

      {/* Content Based on Current View */}
      {currentView === 'home' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <BusinessDescriptionInput
              onAnalysisStart={handleAnalysisStart}
              onAnalysisComplete={handleAnalysisComplete}
              isAnalyzing={isAnalyzing}
            />
            
            {analysisResult && (
              <AnalysisResults
                result={analysisResult}
                onFeedback={handleFeedback}
                onReanalyze={handleReanalyze}
              />
            )}
          </div>
          
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      ) : (
        <Analytics />
      )}

      <CorrectionModal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        selectedSuggestion={selectedSuggestion}
        analysisId={analysisResult?.id}
      />
    </div>
  );
}