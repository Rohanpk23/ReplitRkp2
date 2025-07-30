import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const occupancyCodes = pgTable("occupancy_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessDescription: text("business_description").notNull(),
  suggestions: jsonb("suggestions").notNull(), // Array of suggestion objects
  overallReasoning: text("overall_reasoning").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: varchar("analysis_id").references(() => analyses.id),
  suggestionIndex: integer("suggestion_index").notNull(),
  occupancyCode: text("occupancy_code").notNull(),
  feedbackType: text("feedback_type").notNull(), // 'positive' or 'negative'
  correctionCode: text("correction_code"), // For negative feedback
  correctionReason: text("correction_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysesRelations = relations(analyses, ({ many }) => ({
  feedback: many(feedback),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  analysis: one(analyses, {
    fields: [feedback.analysisId],
    references: [analyses.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOccupancyCodeSchema = createInsertSchema(occupancyCodes).omit({
  id: true,
  createdAt: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const analysisRequestSchema = z.object({
  businessDescription: z.string().min(1, "Business description is required"),
});

export const feedbackRequestSchema = z.object({
  analysisId: z.string(),
  suggestionIndex: z.number(),
  occupancyCode: z.string(),
  feedbackType: z.enum(['positive', 'negative']),
  correctionCode: z.string().optional(),
  correctionReason: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type OccupancyCode = typeof occupancyCodes.$inferSelect;
export type InsertOccupancyCode = z.infer<typeof insertOccupancyCodeSchema>;
export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

export interface Suggestion {
  occupancy: string;
  reason: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface AnalysisResponse {
  id: string;
  suggested_occupancies: Suggestion[];
  overall_reasoning: string;
  createdAt: string;
}
