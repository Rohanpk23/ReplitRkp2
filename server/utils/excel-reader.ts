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
    const encodings = ['utf8', 'latin1', 'ascii', 'utf16le', 'ucs2'];
    
    for (const encoding of encodings) {
      try {
        console.log(`Trying to read CSV with ${encoding} encoding...`);
        const csvContent = fs.readFileSync(filePath, encoding as BufferEncoding);
        
        // Check if this looks like actual CSV content (not binary)
        if (csvContent.includes('\x00') || csvContent.includes('PK\x03\x04')) {
          console.log(`${encoding} encoding shows binary content, skipping...`);
          continue;
        }
        
        // Parse CSV with proper handling of quotes and commas
        const lines = csvContent
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (lines.length === 0) continue;
        
        console.log(`Found ${lines.length} lines with ${encoding} encoding`);
        console.log('First line:', lines[0].substring(0, 100));
        
        // Parse CSV properly handling quoted fields
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          
          result.push(current.trim());
          return result;
        };
        
        const headers = parseCSVLine(lines[0]);
        console.log(`Headers found with ${encoding}:`, headers);
        
        // Check if headers look reasonable
        const hasReasonableHeaders = headers.some(header => 
          header.toLowerCase().includes('description') || 
          header.toLowerCase().includes('business') ||
          header.length > 5
        );
        
        if (!hasReasonableHeaders && encoding !== 'utf8') {
          console.log(`Headers don't look reasonable with ${encoding}, trying next encoding...`);
          continue;
        }
        
        const businessDescriptions: BusinessDescription[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Find business description column
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
            if (row[col] && typeof row[col] === 'string' && row[col].trim()) {
              description = row[col].trim();
              break;
            }
          }
          
          if (!description) {
            // Use first non-empty text value that looks like a description
            for (const value of Object.values(row)) {
              if (typeof value === 'string' && value.trim().length > 10 && 
                  !value.match(/^\d+$/) && // Not just numbers
                  !value.match(/^[\d\-\/]+$/)) { // Not just dates
                description = value.trim();
                break;
              }
            }
          }
          
          if (description && description.length > 5) {
            businessDescriptions.push({
              id: i,
              business_description: description,
              type: row.type || row.Type || 'csv_import',
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
        console.log(`Failed with ${encoding} encoding:`, (err as Error).message);
        continue;
      }
    }
    
    throw new Error('Could not read CSV file with any encoding');
    
  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw new Error(`Failed to read CSV file: ${(error as Error).message}`);
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