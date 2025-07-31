import { useState } from "react";
import Header from "@/components/header";
import BusinessDescriptionInput from "@/components/business-description-input";
import AnalysisResults from "@/components/analysis-results";
import CorrectionModal from "@/components/correction-modal";
import Sidebar from "@/components/sidebar";
import type { AnalysisResponse, Suggestion } from "@shared/schema";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
      </main>

      <CorrectionModal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        selectedSuggestion={selectedSuggestion}
        analysisId={analysisResult?.id}
      />

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>© 2024 Insurance Platform</span>
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
