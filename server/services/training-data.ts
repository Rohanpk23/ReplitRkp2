import { readNewCSVFile } from "../utils/excel-reader";

interface TrainingExample {
  businessDescription: string;
  correctOccupancy: string;
  reason?: string;
}

/**
 * Load training examples from business descriptions CSV
 * These are real examples with known correct occupancy codes
 */
export function loadTrainingExamples(): TrainingExample[] {
  try {
    const csvData = readNewCSVFile();
    
    const trainingExamples = csvData
      .filter(item => 
        item.business_description && 
        item.correct_occupancies_simplified &&
        item.business_description.length > 10 &&
        item.correct_occupancies_simplified.length > 5
      )
      .map(item => ({
        businessDescription: item.business_description.trim(),
        correctOccupancy: extractOccupancyCode(item.correct_occupancies_simplified),
        reason: `Historical example from ${item.data_source_type || 'training data'}`
      }));

    console.log(`Loaded ${trainingExamples.length} training examples from CSV`);
    return trainingExamples;
  } catch (error) {
    console.error('Failed to load training examples:', error);
    return [];
  }
}

/**
 * Extract the actual occupancy code from the simplified format
 * Example: "Engineering workshop and fabrication works (Above 9 meters) ~ Based on 'welding work...'"
 * Returns: "Engineering workshop and fabrication works (Above 9 meters)"
 */
function extractOccupancyCode(simplifiedText: string): string {
  if (!simplifiedText) return '';
  
  // Split on ' ~ Based on' or similar patterns
  const beforeExplanation = simplifiedText.split(' ~ ')[0];
  return beforeExplanation.trim();
}

/**
 * Get relevant training examples for a business description
 * Uses flexible semantic matching to find similar examples
 * SAFEGUARD: Never forces exact matches - provides reasoning patterns only
 */
export function getRelevantTrainingExamples(
  businessDescription: string, 
  maxExamples: number = 3  // Reduced to prevent over-reliance
): TrainingExample[] {
  const allExamples = loadTrainingExamples();
  if (allExamples.length === 0) return [];

  const descriptionLower = businessDescription.toLowerCase();
  
  // Extract key terms from the business description
  const keyTerms = extractKeyTerms(descriptionLower);
  
  // Score examples based on similarity
  const scoredExamples = allExamples.map(example => {
    const exampleLower = example.businessDescription.toLowerCase();
    let score = 0;
    
    // Boost score for matching key terms
    keyTerms.forEach(term => {
      if (exampleLower.includes(term)) {
        score += term.length; // Longer terms get higher weight
      }
    });
    
    return { example, score };
  });
  
  // SAFEGUARD: Only return examples with meaningful similarity
  // Prevents forcing weak matches that could create rule-based behavior
  const minMeaningfulScore = Math.max(3, descriptionLower.length * 0.1);
  
  return scoredExamples
    .filter(item => item.score >= minMeaningfulScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxExamples)
    .map(item => ({
      ...item.example,
      reason: `${item.example.reason} (Similarity guidance - adapt logic, don't copy)`
    }));
}

/**
 * Extract meaningful terms from business description
 * Filters out common words and focuses on domain-specific terms
 */
function extractKeyTerms(text: string): string[] {
  const commonWords = new Set([
    'and', 'or', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'can', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 's', 't', 'just', 'now', 'also', 'its', 'my', 'our', 'their', 'his', 'her',
    'hai', 'ka', 'ke', 'ki', 'ko', 'mein', 'se', 'pe', 'par', 'aur', 'ya', 'yah', 'wah',
    'h', 'hota', 'hoti', 'hain', 'tha', 'thi', 'the', 'karna', 'karte', 'kar', 'kaam'
  ]);
  
  return text
    .split(/[\s,.-]+/)
    .map(term => term.trim())
    .filter(term => 
      term.length > 2 && 
      !commonWords.has(term) && 
      !term.match(/^\d+$/)
    )
    .slice(0, 10); // Limit to top 10 terms
}