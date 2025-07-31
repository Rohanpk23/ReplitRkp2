import { 
  type User, 
  type InsertUser, 
  type OccupancyCode, 
  type InsertOccupancyCode,
  type Analysis,
  type InsertAnalysis,
  type Feedback,
  type InsertFeedback,
  users,
  occupancyCodes,
  analyses,
  feedback
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Occupancy codes
  getAllOccupancyCodes(): Promise<OccupancyCode[]>;
  createOccupancyCode(code: InsertOccupancyCode): Promise<OccupancyCode>;
  
  // Analyses
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: string): Promise<Analysis | undefined>;
  getRecentAnalyses(limit?: number): Promise<Analysis[]>;
  
  // Feedback
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  getFeedbackByAnalysis(analysisId: string): Promise<Feedback[]>;
  getRecentCorrections(limit?: number): Promise<Feedback[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllOccupancyCodes(): Promise<OccupancyCode[]> {
    return await db.select().from(occupancyCodes);
  }

  async clearAllOccupancyCodes(): Promise<void> {
    await db.delete(occupancyCodes);
  }

  async createOccupancyCode(code: InsertOccupancyCode): Promise<OccupancyCode> {
    const [occupancyCode] = await db
      .insert(occupancyCodes)
      .values(code)
      .returning();
    return occupancyCode;
  }

  async createAnalysis(analysis: InsertAnalysis): Promise<Analysis> {
    const [newAnalysis] = await db
      .insert(analyses)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getAnalysis(id: string): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis || undefined;
  }

  async getRecentAnalyses(limit: number = 10): Promise<Analysis[]> {
    return await db
      .select()
      .from(analyses)
      .orderBy(desc(analyses.createdAt))
      .limit(limit);
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return newFeedback;
  }

  async getFeedbackByAnalysis(analysisId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.analysisId, analysisId));
  }

  async getRecentCorrections(limit: number = 5): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.feedbackType, 'negative'))
      .orderBy(desc(feedback.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
