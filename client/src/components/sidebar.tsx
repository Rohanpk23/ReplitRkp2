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
      {/* AI Learning Info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-sm border border-blue-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Edit3 className="text-white h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-blue-900">AI Learning</h3>
        </div>
        <div className="space-y-3 text-sm text-blue-800 leading-relaxed">
          <p>
            Your feedback helps our AI become more accurate. Every thumbs up or down teaches the system what works.
          </p>
          <p>
            We're building smarter occupancy matching through your expertise.
          </p>
        </div>
      </div>

      {/* Recent Corrections */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <History className="text-white h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Corrections</h3>
          </div>
          
          <div className="space-y-4">
            {recentCorrections.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No corrections yet</p>
                <p className="text-gray-400 text-xs mt-1">Feedback will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-full text-center">
                  {recentCorrections.length} total corrections
                </div>
                {recentCorrections.slice(0, 4).map((correction, index) => (
                  <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                    <div className="font-medium text-orange-900 mb-2 text-sm">
                      {correction.occupancyCode}
                    </div>
                    <div className="text-orange-700 mb-2 text-sm">
                      → {correction.correctionCode}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(correction.createdAt)}
                    </div>
                  </div>
                ))}
                {recentCorrections.length > 4 && (
                  <div className="text-xs text-gray-400 text-center py-2">
                    +{recentCorrections.length - 4} more corrections
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
