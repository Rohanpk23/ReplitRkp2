import { useState } from "react";
import { Edit, Search, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { analyzeBusinessDescription } from "@/lib/api";
import type { AnalysisResponse } from "@shared/schema";

interface BusinessDescriptionInputProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (result: AnalysisResponse) => void;
  isAnalyzing: boolean;
}

export default function BusinessDescriptionInput({
  onAnalysisStart,
  onAnalysisComplete,
  isAnalyzing
}: BusinessDescriptionInputProps) {
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a business description",
        variant: "destructive"
      });
      return;
    }

    try {
      onAnalysisStart();
      const result = await analyzeBusinessDescription({ businessDescription: description });
      onAnalysisComplete(result);
      
      toast({
        title: "Analysis Complete",
        description: "Business description analyzed successfully",
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze business description. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Edit className="text-white h-4 w-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Describe Your Business</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="business-description" className="block text-sm font-medium text-gray-700 mb-3">
              What does your business do?
            </Label>
            <Textarea
              id="business-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-xl border-gray-200 focus:border-rose-300 focus:ring-rose-200 text-base px-4 py-3"
              placeholder="Describe your business activities in detail..."
              disabled={isAnalyzing}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <Search className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Find Occupancy Codes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
