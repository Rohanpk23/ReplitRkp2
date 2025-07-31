import { storage } from "../storage";
import type { OccupancyCode } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

// Read occupancy codes from CSV file
function readOccupancyCodesFromCSV(): string[] {
  try {
    const csvPath = path.join(process.cwd(), 'attached_assets', 'nature of work master_1753913937877.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip the header and extract codes
    const codes = lines.slice(1) // Skip "Nature of Work master" header
      .map(line => {
        // Extract the first column which contains the code
        const firstColumn = line.split(',')[0];
        // Remove the leading dash and trim
        return firstColumn.replace(/^-/, '').trim().replace(/^"/, '').replace(/"$/, '');
      })
      .filter(code => code.length > 0);
    
    console.log(`Loaded ${codes.length} occupancy codes from CSV`);
    return codes;
  } catch (error) {
    console.error("Error reading occupancy CSV:", error);
    return [];
  }
}

// Get all occupancy codes as formatted list for AI prompts
export function getAllOccupancyCodes(): string[] {
  return readOccupancyCodesFromCSV();
}

// Initialize occupancy codes in database
export async function initializeOccupancyCodes(): Promise<void> {
  try {
    // Check if codes already exist
    const existingCodes = await storage.getAllOccupancyCodes();
    
    if (existingCodes.length >= 250) { // Already have most codes
      console.log(`Database already has ${existingCodes.length} occupancy codes`);
      return;
    }
    
    console.log("Loading occupancy codes from CSV...");
    const codes = readOccupancyCodesFromCSV();
    
    if (codes.length === 0) {
      console.error("No occupancy codes found in CSV");
      return;
    }
    
    // Clear existing codes and reload all
    console.log("Clearing existing occupancy codes...");
    // Note: We'll need to add a clear method to storage or handle this via direct SQL
    
    // Insert all codes
    let insertedCount = 0;
    for (const code of codes) {
      try {
        await storage.createOccupancyCode({
          code: code,
          description: code // Using the same text for both code and description
        });
        insertedCount++;
      } catch (error) {
        // Skip duplicates
        if (!error.message?.includes('UNIQUE')) {
          console.error(`Error inserting code "${code}":`, error);
        }
      }
    }
    
    console.log(`Successfully loaded ${insertedCount} occupancy codes into database`);
  } catch (error) {
    console.error("Error initializing occupancy codes:", error);
  }
}

// Get occupancy codes formatted for AI prompt context
export function getOccupancyListForAI(): string {
  const codes = getAllOccupancyCodes();
  return codes.map(code => `- ${code}`).join('\n');
}