import { FileText, History, List, Edit3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getRecentCorrections } from "@/lib/api";

interface Correction {
  occupancyCode: string;
  correctionCode: string;
  createdAt: string;
}

export default function Sidebar() {
  const { data: recentCorrections = [] } = useQuery<Correction[]>({
    queryKey: ['/api/recent-corrections'],
    refetchInterval: 60000 // Refresh every minute
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Model Corrections Log */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Edit3 className="mr-2 text-primary h-5 w-5" />
            Model Corrections
          </h3>
          <div className="space-y-3">
            {recentCorrections.length === 0 ? (
              <div className="text-sm text-gray-500 space-y-2">
                <p>No corrections recorded yet.</p>
                <p className="text-xs">When agents provide feedback on incorrect suggestions, corrections are logged here to improve the AI model.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-gray-600 mb-3">
                  Total corrections recorded: {recentCorrections.length}
                </div>
                {recentCorrections.slice(0, 5).map((correction, index) => (
                  <div key={index} className="text-xs p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="font-medium text-orange-800 mb-1">
                      {correction.occupancyCode}
                    </div>
                    <div className="text-orange-600 mb-1">
                      Corrected to: {correction.correctionCode}
                    </div>
                    <div className="text-gray-600">
                      {formatTimeAgo(correction.createdAt)}
                    </div>
                  </div>
                ))}
                {recentCorrections.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    And {recentCorrections.length - 5} more corrections...
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
