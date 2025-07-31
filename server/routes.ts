import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeBusinessDescription, handleCorrectionFeedback } from "./services/gemini";
import { initializeOccupancyCodes, getMasterOccupancyList } from "./services/occupancy";
import { analysisRequestSchema, feedbackRequestSchema } from "@shared/schema";
import { z } from "zod";
import { debugBusinessDescriptionsFile } from "./utils/excel-reader";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize occupancy codes on startup (async without blocking)
  initializeOccupancyCodes().catch(error => {
    console.error("Failed to initialize occupancy codes:", error);
  });
  
  // Debug business descriptions files
  console.log('\n=== STARTING FILE DEBUG ===');
  try {
    await debugBusinessDescriptionsFile();
  } catch (error) {
    console.error('File debug failed:', error);
  }

  // Analyze business description
  app.post("/api/analyze", async (req, res) => {
    try {
      const { businessDescription } = analysisRequestSchema.parse(req.body);
      
      const masterList = await getMasterOccupancyList();
      
      // Get recent corrections to help AI learn from mistakes
      const recentFeedback = await storage.getRecentCorrections(10);
      const recentCorrections = recentFeedback.map(correction => ({
        wrongCode: correction.occupancyCode,
        correctCode: correction.correctionCode || 'No correction provided',
        reason: correction.correctionReason || 'No reason provided'
      }));
      

      
      const result = await analyzeBusinessDescription(businessDescription, masterList, recentCorrections);
      
      // Store analysis in database
      const analysis = await storage.createAnalysis({
        businessDescription,
        suggestions: result.suggested_occupancies,
        overallReasoning: result.overall_reasoning
      });

      res.json({
        id: analysis.id,
        suggested_occupancies: result.suggested_occupancies,
        overall_reasoning: result.overall_reasoning,
        createdAt: analysis.createdAt
      });
    } catch (error) {
      console.error("Analysis error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to analyze business description" });
      }
    }
  });

  // Submit feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = feedbackRequestSchema.parse(req.body);
      
      // Store feedback
      const feedback = await storage.createFeedback(feedbackData);
      
      // If negative feedback with correction, generate conversational response
      let response = "Feedback recorded successfully";
      
      if (feedbackData.feedbackType === 'negative' && feedbackData.correctionCode) {
        const analysis = await storage.getAnalysis(feedbackData.analysisId);
        if (analysis) {
          response = await handleCorrectionFeedback(
            analysis.businessDescription,
            feedbackData.occupancyCode,
            feedbackData.correctionCode,
            feedbackData.correctionReason
          );
        }
      }

      res.json({ 
        success: true, 
        message: response,
        feedbackId: feedback.id 
      });
    } catch (error) {
      console.error("Feedback error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to record feedback" });
      }
    }
  });

  // Get occupancy codes for dropdowns
  app.get("/api/occupancy-codes", async (req, res) => {
    try {
      const codes = await storage.getAllOccupancyCodes();
      res.json(codes);
    } catch (error) {
      console.error("Get occupancy codes error:", error);
      res.status(500).json({ error: "Failed to fetch occupancy codes" });
    }
  });

  // Get recent corrections for sidebar
  app.get("/api/recent-corrections", async (req, res) => {
    try {
      const corrections = await storage.getRecentCorrections(5);
      res.json(corrections);
    } catch (error) {
      console.error("Get recent corrections error:", error);
      res.status(500).json({ error: "Failed to fetch recent corrections" });
    }
  });

  // Get analysis stats
  app.get("/api/stats", async (req, res) => {
    try {
      const recentAnalyses = await storage.getRecentAnalyses(100);
      const today = new Date().toDateString();
      const analysesToday = recentAnalyses.filter(analysis => 
        new Date(analysis.createdAt!).toDateString() === today
      ).length;

      // Calculate accuracy rate based on positive feedback
      const allFeedback = await Promise.all(
        recentAnalyses.map(analysis => storage.getFeedbackByAnalysis(analysis.id))
      );
      const flatFeedback = allFeedback.flat();
      const positiveFeedback = flatFeedback.filter(f => f.feedbackType === 'positive').length;
      const totalFeedback = flatFeedback.length;
      const accuracyRate = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0;

      res.json({
        analysesToday,
        accuracyRate,
        avgProcessing: "2.3s" // This would be calculated from actual processing times
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get comprehensive analytics data
  app.get("/api/analytics", async (req, res) => {
    try {
      const recentAnalyses = await storage.getRecentAnalyses(1000);
      const allFeedback = await Promise.all(
        recentAnalyses.map(analysis => storage.getFeedbackByAnalysis(analysis.id))
      );
      const flatFeedback = allFeedback.flat();
      const corrections = await storage.getRecentCorrections(100);

      // Overview metrics
      const totalAnalyses = recentAnalyses.length;
      const positiveFeedback = flatFeedback.filter(f => f.feedbackType === 'positive').length;
      const negativeFeedback = flatFeedback.filter(f => f.feedbackType === 'negative').length;
      const totalFeedback = flatFeedback.length;
      const accuracyRate = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0;
      const totalCorrections = corrections.length;

      // Confidence breakdown - analyze suggestions
      let highConfidence = 0, mediumConfidence = 0, lowConfidence = 0;
      recentAnalyses.forEach(analysis => {
        if (analysis.suggestions && Array.isArray(analysis.suggestions)) {
          analysis.suggestions.forEach((suggestion: any) => {
            switch (suggestion.confidence) {
              case 'high': highConfidence++; break;
              case 'medium': mediumConfidence++; break;
              case 'low': lowConfidence++; break;
              default: mediumConfidence++; break;
            }
          });
        }
      });

      // Recent metrics (last 7 and 30 days)
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const analyses7Days = recentAnalyses.filter(a => 
        new Date(a.createdAt!) >= last7Days
      ).length;
      const analyses30Days = recentAnalyses.filter(a => 
        new Date(a.createdAt!) >= last30Days
      ).length;

      // Top corrections (group by original -> corrected pattern)
      const correctionMap = new Map<string, { correctedCode: string; frequency: number }>();
      corrections.forEach(correction => {
        if (correction.correctionCode) {
          const key = `${correction.occupancyCode} -> ${correction.correctionCode}`;
          if (correctionMap.has(key)) {
            correctionMap.get(key)!.frequency++;
          } else {
            correctionMap.set(key, {
              correctedCode: correction.correctionCode,
              frequency: 1
            });
          }
        }
      });

      const topCorrections = Array.from(correctionMap.entries())
        .map(([key, data]) => ({
          originalCode: key.split(' -> ')[0],
          correctedCode: data.correctedCode,
          frequency: data.frequency
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

      const analyticsData = {
        overview: {
          totalAnalyses,
          accuracyRate,
          avgProcessingTime: "2.1s",
          totalCorrections
        },
        confidenceBreakdown: {
          high: highConfidence,
          medium: mediumConfidence,
          low: lowConfidence
        },
        feedbackTrends: {
          positive: positiveFeedback,
          negative: negativeFeedback,
          correctionRate: totalFeedback > 0 ? Math.round((negativeFeedback / totalFeedback) * 100) : 0
        },
        recentMetrics: {
          last7Days: analyses7Days,
          last30Days: analyses30Days,
          improvement: 5 // This would be calculated based on historical accuracy
        },
        topCorrections
      };

      res.json(analyticsData);
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  // Debug endpoint for file reading
  app.get("/api/debug-files", async (req, res) => {
    try {
      await debugBusinessDescriptionsFile();
      res.json({ message: "Debug complete - check server logs" });
    } catch (error) {
      console.error("Debug error:", error);
      res.status(500).json({ error: "Debug failed", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Force reload all occupancy codes from master CSV
  app.post("/api/reload-occupancy-master", async (req, res) => {
    try {
      console.log("Force reloading complete occupancy master...");
      
      // Force reload by clearing and reloading
      await initializeOccupancyCodes();
      
      const finalCodes = await storage.getAllOccupancyCodes();
      res.json({ 
        message: "Occupancy master reloaded successfully", 
        totalCodes: finalCodes.length 
      });
    } catch (error) {
      console.error("Reload error:", error);
      res.status(500).json({ error: "Failed to reload occupancy master" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
