import { useState } from "react";
import BusinessDescriptionInput from "@/components/business-description-input";
import AnalysisResults from "@/components/analysis-results";
import CorrectionModal from "@/components/correction-modal";
import Sidebar from "@/components/sidebar";
import Analytics from "@/pages/analytics";
import type { AnalysisResponse, Suggestion } from "@shared/schema";

export default function HomeContent() {
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
    <div className="space-y-8">
      {/* Main Analysis Section */}
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

      {/* Analytics Dashboard Section */}
      <div className="border-t border-gray-200 pt-8">
        <Analytics />
      </div>

      <CorrectionModal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        selectedSuggestion={selectedSuggestion}
        analysisId={analysisResult?.id}
      />
    </div>
  );
}