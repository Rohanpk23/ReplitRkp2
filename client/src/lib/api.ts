import { apiRequest } from "./queryClient";
import type { 
  AnalysisRequest, 
  AnalysisResponse, 
  FeedbackRequest, 
  OccupancyCode 
} from "@shared/schema";

export async function analyzeBusinessDescription(data: AnalysisRequest): Promise<AnalysisResponse> {
  const response = await apiRequest("POST", "/api/analyze", data);
  return response.json();
}

export async function submitFeedback(data: FeedbackRequest): Promise<{ success: boolean; message: string; feedbackId: string }> {
  const response = await apiRequest("POST", "/api/feedback", data);
  return response.json();
}

export async function getOccupancyCodes(): Promise<OccupancyCode[]> {
  const response = await apiRequest("GET", "/api/occupancy-codes");
  return response.json();
}

export async function getRecentCorrections(): Promise<any[]> {
  const response = await apiRequest("GET", "/api/recent-corrections");
  return response.json();
}

export async function getStats(): Promise<{ analysesToday: number; accuracyRate: number; avgProcessing: string }> {
  const response = await apiRequest("GET", "/api/stats");
  return response.json();
}
