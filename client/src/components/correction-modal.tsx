import { useState, useEffect } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getOccupancyCodes, submitFeedback } from "@/lib/api";
import type { Suggestion, OccupancyCode } from "@shared/schema";

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSuggestion: { suggestion: Suggestion; index: number } | null;
  analysisId?: string;
}

export default function CorrectionModal({ 
  isOpen, 
  onClose, 
  selectedSuggestion, 
  analysisId 
}: CorrectionModalProps) {
  const [correctOccupancy, setCorrectOccupancy] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCodes, setFilteredCodes] = useState<OccupancyCode[]>([]);
  const { toast } = useToast();

  const { data: occupancyCodes = [] } = useQuery<OccupancyCode[]>({
    queryKey: ['/api/occupancy-codes'],
    enabled: isOpen
  });

  useEffect(() => {
    if (!isOpen) {
      setCorrectOccupancy("");
      setCorrectionReason("");
      setShowSuggestions(false);
      setFilteredCodes([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (correctOccupancy && occupancyCodes.length > 0) {
      const filtered = occupancyCodes.filter(code =>
        code.code.toLowerCase().includes(correctOccupancy.toLowerCase())
      ).slice(0, 8); // Show max 8 suggestions
      setFilteredCodes(filtered);
      setShowSuggestions(filtered.length > 0 && correctOccupancy.length > 0);
    } else {
      setFilteredCodes([]);
      setShowSuggestions(false);
    }
  }, [correctOccupancy, occupancyCodes]);

  const handleInputChange = (value: string) => {
    setCorrectOccupancy(value);
  };

  const handleSuggestionClick = (code: string) => {
    setCorrectOccupancy(code);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!correctOccupancy || !selectedSuggestion || !analysisId) {
      toast({
        title: "Error",
        description: "Please select the correct occupancy code",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await submitFeedback({
        analysisId,
        suggestionIndex: selectedSuggestion.index,
        occupancyCode: selectedSuggestion.suggestion.occupancy,
        feedbackType: 'negative',
        correctionCode: correctOccupancy,
        correctionReason: correctionReason || undefined
      });
      
      toast({
        title: "Correction Submitted",
        description: response.message,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit correction",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="text-orange-500 h-5 w-5" />
            <span>Provide Correction</span>
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-sm text-gray-600 mb-4">
          Help improve the AI by providing the correct occupancy code for this business description.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Label htmlFor="correct-occupancy" className="block text-sm font-medium text-gray-700 mb-2">
              Correct Occupancy Code
            </Label>
            <div className="relative">
              <Input
                id="correct-occupancy"
                type="text"
                value={correctOccupancy}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(filteredCodes.length > 0)}
                placeholder="Type or search for occupancy code..."
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            {showSuggestions && filteredCodes.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredCodes.map((code) => (
                  <button
                    key={code.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                    onClick={() => handleSuggestionClick(code.code)}
                  >
                    {code.code}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="correction-reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Correction (Optional)
            </Label>
            <Textarea
              id="correction-reason"
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              rows={3}
              className="resize-none"
              placeholder="Explain why this is the correct match..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Correction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
