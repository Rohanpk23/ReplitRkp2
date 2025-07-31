import fs from 'fs';
import { Pool } from '@neondatabase/serverless';

async function loadCompleteOccupancyMaster() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Starting comprehensive occupancy master load...');
    
    // Read the nature of work master CSV file
    const csvPath = './attached_assets/nature of work master_1753913937877.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log(`Found ${lines.length} lines in master CSV`);
    
    // Skip header and process each line
    const occupancyCodes = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith(',')) {
        // Extract the occupancy code (first column)
        const code = line.split(',')[0].trim();
        if (code && code !== '﻿Nature of Work master') {
          // Clean up the code - remove leading/trailing quotes and BOM
          const cleanCode = code.replace(/^["']|["']$/g, '').replace(/^\uFEFF/, '');
          if (cleanCode.length > 0) {
            occupancyCodes.push(cleanCode);
          }
        }
      }
    }
    
    console.log(`Extracted ${occupancyCodes.length} unique occupancy codes`);
    console.log('Sample codes:', occupancyCodes.slice(0, 10));
    
    // Check current count in database
    const currentCountResult = await pool.query('SELECT COUNT(*) as count FROM occupancy_codes');
    const currentCount = parseInt(currentCountResult.rows[0].count);
    console.log(`Current database has ${currentCount} codes`);
    
    // Insert codes that don't exist
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const code of occupancyCodes) {
      try {
        // Try to insert, ignore if already exists
        const result = await pool.query(
          'INSERT INTO occupancy_codes (code, description) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING RETURNING id',
          [code, code]
        );
        
        if (result.rows.length > 0) {
          insertedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error inserting code "${code}":`, error.message);
      }
    }
    
    // Final count
    const finalCountResult = await pool.query('SELECT COUNT(*) as count FROM occupancy_codes');
    const finalCount = parseInt(finalCountResult.rows[0].count);
    
    console.log('\n=== OCCUPANCY MASTER LOAD COMPLETE ===');
    console.log(`Original database count: ${currentCount}`);
    console.log(`Codes found in master CSV: ${occupancyCodes.length}`);
    console.log(`New codes inserted: ${insertedCount}`);
    console.log(`Codes skipped (already exist): ${skippedCount}`);
    console.log(`Final database count: ${finalCount}`);
    console.log('========================================');
    
  } catch (error) {
    console.error('Error loading complete occupancy master:', error);
  } finally {
    await pool.end();
  }
}

loadCompleteOccupancyMaster();