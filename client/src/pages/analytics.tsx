import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalAnalyses: number;
    accuracyRate: number;
    avgProcessingTime: string;
    totalCorrections: number;
  };
  confidenceBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  feedbackTrends: {
    positive: number;
    negative: number;
    correctionRate: number;
  };
  recentMetrics: {
    last7Days: number;
    last30Days: number;
    improvement: number;
  };
  topCorrections: Array<{
    originalCode: string;
    correctedCode: string;
    frequency: number;
  }>;
}

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Analytics data will appear once analyses are performed.</p>
        </div>
      </div>
    );
  }

  const getAccuracyColor = (rate: number) => {
    if (rate >= 85) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getAccuracyBadgeColor = (rate: number) => {
    if (rate >= 85) return "bg-green-100 text-green-800 border-green-200";
    if (rate >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calendar className="h-3 w-3 mr-1" />
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Analyses</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.overview.totalAnalyses}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Accuracy Rate</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-2xl font-bold ${getAccuracyColor(analytics.overview.accuracyRate)} text-green-900`}>
                    {analytics.overview.accuracyRate}%
                  </p>
                  <Badge className={getAccuracyBadgeColor(analytics.overview.accuracyRate)}>
                    {analytics.overview.accuracyRate >= 85 ? 'Excellent' : 
                     analytics.overview.accuracyRate >= 70 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Processing</p>
                <p className="text-2xl font-bold text-purple-900">{analytics.overview.avgProcessingTime}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Corrections</p>
                <p className="text-2xl font-bold text-orange-900">{analytics.overview.totalCorrections}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Confidence Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Confidence Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-700">High Confidence (85-95%)</span>
                <span className="text-sm text-gray-600">{analytics.confidenceBreakdown.high}</span>
              </div>
              <Progress 
                value={(analytics.confidenceBreakdown.high / analytics.overview.totalAnalyses) * 100} 
                className="h-2 bg-green-100"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-yellow-700">Medium Confidence (65-84%)</span>
                <span className="text-sm text-gray-600">{analytics.confidenceBreakdown.medium}</span>
              </div>
              <Progress 
                value={(analytics.confidenceBreakdown.medium / analytics.overview.totalAnalyses) * 100} 
                className="h-2 bg-yellow-100"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-red-700">Low Confidence (40-64%)</span>
                <span className="text-sm text-gray-600">{analytics.confidenceBreakdown.low}</span>
              </div>
              <Progress 
                value={(analytics.confidenceBreakdown.low / analytics.overview.totalAnalyses) * 100} 
                className="h-2 bg-red-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feedback Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Feedback Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Positive Feedback</span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {analytics.feedbackTrends.positive}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Negative Feedback</span>
              </div>
              <Badge className="bg-red-100 text-red-800 border-red-200">
                {analytics.feedbackTrends.negative}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Correction Rate</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {analytics.feedbackTrends.correctionRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Recent Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3">
              <span className="text-sm font-medium text-gray-700">Last 7 Days</span>
              <Badge variant="outline">{analytics.recentMetrics.last7Days} analyses</Badge>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-sm font-medium text-gray-700">Last 30 Days</span>
              <Badge variant="outline">{analytics.recentMetrics.last30Days} analyses</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-700">Accuracy Improvement</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                +{analytics.recentMetrics.improvement}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Top Corrections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Most Common Corrections</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topCorrections.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No corrections recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topCorrections.slice(0, 5).map((correction, index) => (
                  <div key={index} className="border-l-4 border-orange-400 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {correction.originalCode}
                        </p>
                        <p className="text-xs text-green-600">
                          → {correction.correctedCode}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {correction.frequency}x
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}