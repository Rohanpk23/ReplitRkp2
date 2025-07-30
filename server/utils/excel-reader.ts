import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface BusinessDescription {
  id?: number;
  business_description: string;
  type?: string;
  [key: string]: any;
}

export function readBusinessDescriptionsFromExcel(filePath: string): BusinessDescription[] {
  try {
    // Read the Excel file as buffer first
    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON - treat first row as headers
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (rows.length === 0) {
      throw new Error('Excel file is empty');
    }
    
    console.log('Raw Excel data (first 3 rows):', rows.slice(0, 3));
    console.log('Number of rows:', rows.length);
    
    // Get headers from first row
    const headers = rows[0] as string[];
    console.log('Headers found:', headers);
    
    // Map the data to our expected format
    const businessDescriptions: BusinessDescription[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      // Create object from headers and row data
      const rowObject: any = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          rowObject[header.toString().trim()] = row[index];
        }
      });
      
      // Try different possible column names for business description
      const possibleDescriptionColumns = [
        'business_description',
        'Business Description',
        'Description',
        'business description',
        'Business_Description',
        'BUSINESS_DESCRIPTION',
        'Business Descriptions',
        'business descriptions'
      ];
      
      let description = '';
      for (const col of possibleDescriptionColumns) {
        if (rowObject[col] && typeof rowObject[col] === 'string' && rowObject[col].trim()) {
          description = rowObject[col].trim();
          break;
        }
      }
      
      if (!description) {
        // If no specific column found, try to find the first text column with substantial content
        for (const value of Object.values(rowObject)) {
          if (typeof value === 'string' && value.trim().length > 10) {
            description = value.trim();
            break;
          }
        }
      }
      
      if (description && description.length > 5) {
        businessDescriptions.push({
          id: i,
          business_description: description,
          type: rowObject.type || rowObject.Type || 'unknown',
          ...rowObject
        });
      }
    }
    
    console.log(`Successfully parsed ${businessDescriptions.length} business descriptions`);
    console.log('Sample descriptions:', businessDescriptions.slice(0, 3).map(d => d.business_description));
    
    return businessDescriptions;
    
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw new Error(`Failed to read Excel file: ${error.message}`);
  }
}

export function readBusinessDescriptionsFromCSV(filePath: string): BusinessDescription[] {
  try {
    // Try different encodings
    const encodings = ['utf8', 'latin1', 'ascii', 'utf16le'];
    
    for (const encoding of encodings) {
      try {
        console.log(`Trying to read CSV with ${encoding} encoding...`);
        const csvContent = fs.readFileSync(filePath, encoding);
        
        // Parse CSV manually
        const lines = csvContent.split('\n').filter(line => line.trim());
        if (lines.length === 0) continue;
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        console.log(`Headers found with ${encoding}:`, headers);
        
        const businessDescriptions: BusinessDescription[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Find business description column
          const possibleDescriptionColumns = [
            'business_description',
            'Business Description',
            'Description',
            'business description'
          ];
          
          let description = '';
          for (const col of possibleDescriptionColumns) {
            if (row[col] && row[col].trim()) {
              description = row[col].trim();
              break;
            }
          }
          
          if (!description) {
            // Use first non-empty text value
            description = Object.values(row).find(val => 
              typeof val === 'string' && val.trim().length > 10
            ) as string || '';
          }
          
          if (description && description.length > 5) {
            businessDescriptions.push({
              id: i,
              business_description: description,
              type: row.type || 'unknown',
              ...row
            });
          }
        }
        
        if (businessDescriptions.length > 0) {
          console.log(`Successfully parsed ${businessDescriptions.length} descriptions with ${encoding} encoding`);
          console.log('Sample descriptions:', businessDescriptions.slice(0, 3).map(d => d.business_description));
          return businessDescriptions;
        }
        
      } catch (err) {
        console.log(`Failed with ${encoding} encoding:`, err.message);
        continue;
      }
    }
    
    throw new Error('Could not read CSV file with any encoding');
    
  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw new Error(`Failed to read CSV file: ${error.message}`);
  }
}

// Test function to debug file reading
export async function debugBusinessDescriptionsFile(): Promise<void> {
  const excelPath = path.join(process.cwd(), 'attached_assets', 'business descriptions copy_1753914203042.xlsx');
  const csvPath = path.join(process.cwd(), 'attached_assets', 'business descriptions_1753913937876.csv');
  
  console.log('=== DEBUGGING BUSINESS DESCRIPTIONS FILES ===');
  
  // Check if files exist
  console.log('Excel file exists:', fs.existsSync(excelPath));
  console.log('CSV file exists:', fs.existsSync(csvPath));
  
  if (fs.existsSync(excelPath)) {
    try {
      console.log('\n--- READING EXCEL FILE ---');
      const excelData = readBusinessDescriptionsFromExcel(excelPath);
      console.log(`Excel file contains ${excelData.length} business descriptions`);
      if (excelData.length > 0) {
        console.log('First 3 Excel descriptions:');
        excelData.slice(0, 3).forEach((desc, i) => {
          console.log(`${i + 1}. ${desc.business_description}`);
        });
      }
    } catch (error) {
      console.error('Excel reading failed:', error.message);
    }
  }
  
  if (fs.existsSync(csvPath)) {
    try {
      console.log('\n--- READING CSV FILE ---');
      const csvData = readBusinessDescriptionsFromCSV(csvPath);
      console.log(`CSV file contains ${csvData.length} business descriptions`);
      if (csvData.length > 0) {
        console.log('First 3 CSV descriptions:');
        csvData.slice(0, 3).forEach((desc, i) => {
          console.log(`${i + 1}. ${desc.business_description}`);
        });
      }
    } catch (error) {
      console.error('CSV reading failed:', error.message);
    }
  }
  
  console.log('=== DEBUG COMPLETE ===');
}