import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeBusinessDescription, handleCorrectionFeedback } from "./services/gemini";
import { initializeOccupancyCodes, getMasterOccupancyList } from "./services/occupancy";
import { analysisRequestSchema, feedbackRequestSchema } from "@shared/schema";
import { z } from "zod";
import { debugBusinessDescriptionsFile } from "./utils/excel-reader";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize occupancy codes on startup
  await initializeOccupancyCodes();
  
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
      const result = await analyzeBusinessDescription(businessDescription, masterList);
      
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

  // Debug endpoint for file reading
  app.get("/api/debug-files", async (req, res) => {
    try {
      await debugBusinessDescriptionsFile();
      res.json({ message: "Debug complete - check server logs" });
    } catch (error) {
      console.error("Debug error:", error);
      res.status(500).json({ error: "Debug failed", details: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
