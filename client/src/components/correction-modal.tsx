import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const { toast } = useToast();

  const { data: occupancyCodes = [] } = useQuery<OccupancyCode[]>({
    queryKey: ['/api/occupancy-codes'],
    enabled: isOpen
  });

  useEffect(() => {
    if (!isOpen) {
      setCorrectOccupancy("");
      setCorrectionReason("");
    }
  }, [isOpen]);

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
          <div>
            <Label htmlFor="correct-occupancy" className="block text-sm font-medium text-gray-700 mb-2">
              Correct Occupancy Code
            </Label>
            <Select value={correctOccupancy} onValueChange={setCorrectOccupancy}>
              <SelectTrigger>
                <SelectValue placeholder="Select correct occupancy..." />
              </SelectTrigger>
              <SelectContent>
                {occupancyCodes.map((code) => (
                  <SelectItem key={code.id} value={code.code}>
                    {code.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
