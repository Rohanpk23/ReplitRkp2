import { FileText, History, List, Edit3, BarChart3, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getRecentCorrections } from "@/lib/api";
import { Link, useLocation } from "wouter";

interface Correction {
  occupancyCode: string;
  correctionCode: string;
  createdAt: string;
}

export default function Sidebar() {
  const [location] = useLocation();
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
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Edit3 className="text-primary h-4 w-4" />
            <h3 className="text-md font-medium text-gray-900">How does our AI get smarter? You're the teacher!</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-3">
            <p>
              Right now, our AI is like a smart student making its best guess. Your '👍' or '👎' is you, the expert, grading its homework.
            </p>
            <p>
              Every piece of feedback helps us build the perfect 'textbook' that will be used to train our AI from a smart student into a true specialist.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <History className="text-primary h-4 w-4" />
            <h3 className="text-md font-medium text-gray-900">Recent Corrections</h3>
          </div>
          
          <div className="space-y-3">
            {recentCorrections.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No corrections yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentCorrections.slice(0, 3).map((correction, index) => (
                  <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="font-medium text-sm text-gray-900">
                      {correction.occupancyCode}
                    </div>
                    <div className="text-sm text-orange-600">
                      → {correction.correctionCode}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(correction.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
