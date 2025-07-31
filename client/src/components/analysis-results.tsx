import { useState } from "react";
import { List, Clock, ThumbsUp, ThumbsDown, RefreshCw, Check, Brain, Link } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback } from "@/lib/api";
import type { AnalysisResponse, Suggestion } from "@shared/schema";

interface AnalysisResultsProps {
  result: AnalysisResponse;
  onFeedback: (suggestion: Suggestion, index: number, type: 'positive' | 'negative') => void;
  onReanalyze: () => void;
}

export default function AnalysisResults({ result, onFeedback, onReanalyze }: AnalysisResultsProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handleFeedbackClick = async (suggestion: Suggestion, index: number, type: 'positive' | 'negative') => {
    if (feedbackSubmitted.has(index)) return;

    try {
      if (type === 'positive') {
        await submitFeedback({
          analysisId: result.id,
          suggestionIndex: index,
          occupancyCode: suggestion.occupancy,
          feedbackType: 'positive'
        });
        
        setFeedbackSubmitted(prev => new Set(prev).add(index));
        toast({
          title: "Feedback Submitted",
          description: "Thank you for confirming this suggestion is correct",
        });
      } else {
        onFeedback(suggestion, index, type);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    }
  };

  const getConfidencePercentage = (confidence?: string) => {
    switch (confidence) {
      case 'high': return '85-95%';
      case 'medium': return '65-84%';
      case 'low': return '40-64%';
      default: return '65-84%';
    }
  };

  const getConfidenceBadgeClass = (confidence?: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getConfidenceReasoningTitle = (confidence?: string) => {
    switch (confidence) {
      case 'high': return 'High Confidence (85-95%): Direct match with clear indicators in the description';
      case 'medium': return 'Medium Confidence (65-84%): Good match but requires some interpretation';
      case 'low': return 'Low Confidence (40-64%): Possible match but with significant uncertainty';
      default: return 'Medium Confidence (65-84%): Good match but requires some interpretation';
    }
  };

  const timeAgo = new Date(result.createdAt).toLocaleString();

  return (
    <Card className="mt-8 bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <List className="text-primary h-5 w-5" />
            <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Analyzed {timeAgo}</span>
          </div>
        </div>

        {result.suggested_occupancies.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-6 text-lg">
              No confident matches found for your business description.
            </p>
            <Button 
              onClick={onReanalyze} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Different Description
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {result.suggested_occupancies.map((suggestion, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className={`${getConfidenceBadgeClass(suggestion.confidence)} px-3 py-1 rounded-full text-xs font-medium`}>
                        {getConfidencePercentage(suggestion.confidence)}
                      </Badge>
                      <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded-full">#{index + 1}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                      {suggestion.occupancy}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {suggestion.reason}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 ml-6">
                    <Button
                      size="sm"
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${
                        feedbackSubmitted.has(index) 
                          ? 'bg-green-100 text-green-600 shadow-sm' 
                          : 'bg-white text-green-600 hover:bg-green-50 shadow-sm border border-green-200'
                      }`}
                      onClick={() => handleFeedbackClick(suggestion, index, 'positive')}
                      disabled={feedbackSubmitted.has(index)}
                      title="Correct suggestion"
                    >
                      {feedbackSubmitted.has(index) ? <Check className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      className="w-10 h-10 rounded-full bg-white text-red-600 hover:bg-red-50 shadow-sm border border-red-200 transition-all duration-200"
                      onClick={() => handleFeedbackClick(suggestion, index, 'negative')}
                      disabled={feedbackSubmitted.has(index)}
                      title="Incorrect suggestion"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {result.overall_reasoning && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Brain className="mr-2 text-blue-600 h-4 w-4" />
              AI Reasoning
            </h4>
            <p className="text-blue-800 text-sm">
              {result.overall_reasoning}
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button 
            onClick={onReanalyze}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Analyze Again</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
