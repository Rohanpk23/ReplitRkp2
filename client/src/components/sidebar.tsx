import { BarChart, History, Bolt, List, Upload, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getStats, getRecentCorrections } from "@/lib/api";

interface Stats {
  analysesToday: number;
  accuracyRate: number;
  avgProcessing: string;
}

interface Correction {
  occupancyCode: string;
  correctionCode: string;
  createdAt: string;
}

export default function Sidebar() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

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
      {/* Quick Stats */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart className="mr-2 text-primary h-5 w-5" />
            Session Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Analyses Today</span>
              <span className="font-semibold text-gray-900">
                {stats?.analysesToday ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Accuracy Rate</span>
              <span className="font-semibold text-green-600">
                {stats?.accuracyRate ?? 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Processing</span>
              <span className="font-semibold text-gray-900">
                {stats?.avgProcessing ?? "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Corrections */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <History className="mr-2 text-primary h-5 w-5" />
            Recent Corrections
          </h3>
          <div className="space-y-3">
            {recentCorrections.length === 0 ? (
              <p className="text-sm text-gray-500">No recent corrections</p>
            ) : (
              recentCorrections.map((correction, index) => (
                <div key={index} className="text-xs p-3 bg-red-50 rounded-lg">
                  <div className="font-medium text-red-800 mb-1">
                    {correction.occupancyCode} → {correction.correctionCode}
                  </div>
                  <div className="text-gray-600">
                    {formatTimeAgo(correction.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bolt className="mr-2 text-primary h-5 w-5" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button 
              variant="ghost"
              className="w-full justify-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <List className="text-gray-400 mr-3 h-4 w-4" />
              <span className="text-sm text-gray-700">View Master Occupancy List</span>
            </Button>
            <Button 
              variant="ghost"
              className="w-full justify-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="text-gray-400 mr-3 h-4 w-4" />
              <span className="text-sm text-gray-700">Bulk Analysis Upload</span>
            </Button>
            <Button 
              variant="ghost"
              className="w-full justify-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="text-gray-400 mr-3 h-4 w-4" />
              <span className="text-sm text-gray-700">Export Results</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
