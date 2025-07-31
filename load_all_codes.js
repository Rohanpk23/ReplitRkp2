import fs from 'fs';
import { Pool } from '@neondatabase/serverless';

async function loadAllOccupancyCodes() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Read CSV file
    const csvContent = fs.readFileSync('attached_assets/nature of work master_1753913937877.csv', 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header and extract codes
    const codes = lines.slice(1) // Skip "Nature of Work master" header
      .map(line => {
        const firstColumn = line.split(',')[0];
        return firstColumn.replace(/^-/, '').trim().replace(/^"/, '').replace(/"$/, '');
      })
      .filter(code => code.length > 0);
    
    console.log(`Found ${codes.length} occupancy codes in CSV`);
    
    // Clear existing codes
    await pool.query('TRUNCATE TABLE occupancy_codes');
    console.log('Cleared existing occupancy codes');
    
    // Insert all codes
    let insertedCount = 0;
    for (const code of codes) {
      try {
        await pool.query(
          'INSERT INTO occupancy_codes (id, code, description) VALUES (gen_random_uuid(), $1, $2)',
          [code, code]
        );
        insertedCount++;
        if (insertedCount % 50 === 0) {
          console.log(`Inserted ${insertedCount} codes...`);
        }
      } catch (error) {
        console.error(`Error inserting code "${code}":`, error.message);
      }
    }
    
    console.log(`Successfully loaded ${insertedCount} occupancy codes into database`);
    
    // Verify count
    const result = await pool.query('SELECT COUNT(*) as count FROM occupancy_codes');
    console.log(`Database now contains ${result.rows[0].count} occupancy codes`);
    
  } catch (error) {
    console.error('Error loading occupancy codes:', error);
  } finally {
    await pool.end();
  }
}

loadAllOccupancyCodes();