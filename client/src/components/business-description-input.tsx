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
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Edit className="text-primary h-5 w-5" />
          <h2 className="text-lg font-semibold text-gray-900">Business Description Input</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="business-description" className="block text-sm font-medium text-gray-700 mb-2">
              Customer's Business Description
            </Label>
            <Textarea
              id="business-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full resize-none"
              placeholder="Enter customer's business description in plain language (English/Hindi/Hinglish)..."
              disabled={isAnalyzing}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Info className="h-4 w-4" />
              <span>Supports English, Hindi, and Hinglish descriptions</span>
            </div>
            <Button 
              type="submit" 
              disabled={isAnalyzing}
              className="primary-button px-6 py-2 font-medium"
            >
              <Search className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Analyze & Match"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
