/**
 * Flexibility Validator
 * Ensures AI suggestions remain creative and don't become rule-based
 */

export interface FlexibilityCheck {
  isFlexible: boolean;
  concerns: string[];
  recommendations: string[];
}

/**
 * Validates that training examples are being used flexibly
 * Prevents rigid rule-based behavior
 */
export function validateFlexibility(
  businessDescription: string,
  trainingExamples: Array<{businessDescription: string, correctOccupancy: string}>,
  aiSuggestions: Array<{occupancy: string, reason: string}>
): FlexibilityCheck {
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Check 1: Avoid exact training example copying
  const exactMatches = trainingExamples.filter(example => 
    aiSuggestions.some(suggestion => 
      suggestion.occupancy === example.correctOccupancy &&
      businessDescription.toLowerCase().includes(example.businessDescription.toLowerCase().substring(0, 20))
    )
  );

  if (exactMatches.length > 0) {
    concerns.push("Potential exact training example copying detected");
    recommendations.push("Encourage more creative reasoning and adaptation");
  }

  // Check 2: Ensure reasoning mentions business activity, not just keyword matching
  const reasonsWithoutBusinessLogic = aiSuggestions.filter(suggestion =>
    !suggestion.reason.toLowerCase().includes('business') &&
    !suggestion.reason.toLowerCase().includes('activity') &&
    !suggestion.reason.toLowerCase().includes('work') &&
    suggestion.reason.toLowerCase().includes('matches') // Keyword-focused reasoning
  );

  if (reasonsWithoutBusinessLogic.length > 0) {
    concerns.push("Reasoning appears keyword-focused rather than business-logic focused");
    recommendations.push("Emphasize business activity understanding over keyword matching");
  }

  // Check 3: Verify multiple suggestions for complex descriptions
  const hasMultipleActivities = businessDescription.split(/\s+/).length > 8;
  if (hasMultipleActivities && aiSuggestions.length === 1) {
    recommendations.push("Consider multiple occupancy suggestions for complex business descriptions");
  }

  // Check 4: Novel business types should get creative suggestions
  const isNovelBusinessType = !trainingExamples.some(example =>
    sharesSimilarKeywords(businessDescription, example.businessDescription, 0.3)
  );

  if (isNovelBusinessType && aiSuggestions.length === 0) {
    concerns.push("Novel business type resulted in no suggestions - AI may be over-constrained by training data");
    recommendations.push("Encourage creative reasoning for new business types using general business knowledge");
  }

  const isFlexible = concerns.length === 0;

  return {
    isFlexible,
    concerns,
    recommendations
  };
}

/**
 * Check if two business descriptions share similar keywords
 * Used to detect novel vs known business types
 */
function sharesSimilarKeywords(desc1: string, desc2: string, threshold: number): boolean {
  const words1 = extractBusinessKeywords(desc1.toLowerCase());
  const words2 = extractBusinessKeywords(desc2.toLowerCase());
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalUniqueWords = new Set([...words1, ...words2]).size;
  
  return (commonWords.length / totalUniqueWords) >= threshold;
}

/**
 * Extract business-relevant keywords, filtering out common words
 */
function extractBusinessKeywords(text: string): string[] {
  const commonWords = new Set([
    'and', 'or', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'can', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'work', 'kaam',
    'hai', 'ka', 'ke', 'ki', 'ko', 'mein', 'se', 'pe', 'par', 'aur', 'company', 'business'
  ]);

  return text
    .split(/[\s,.-]+/)
    .map(word => word.trim())
    .filter(word => 
      word.length > 2 && 
      !commonWords.has(word) && 
      !word.match(/^\d+$/)
    );
}

/**
 * Generate enhanced system prompt additions based on flexibility analysis
 */
export function generateFlexibilityPromptAdditions(
  businessDescription: string,
  trainingExamples: Array<{businessDescription: string, correctOccupancy: string}>
): string {
  const flexibilityCheck = validateFlexibility(businessDescription, trainingExamples, []);
  
  let additionalInstructions = "\n\nFLEXIBILITY REMINDERS:\n";
  
  // For novel business types
  const isNovelType = !trainingExamples.some(example =>
    sharesSimilarKeywords(businessDescription, example.businessDescription, 0.2)
  );
  
  if (isNovelType) {
    additionalInstructions += `
- This appears to be a NOVEL business type not well-represented in training examples
- Use CREATIVE REASONING and general business knowledge
- Focus on the CORE BUSINESS ACTIVITY and map to appropriate occupancy codes
- Don't be constrained by lack of similar training examples`;
  } else {
    additionalInstructions += `
- Training examples available - use them as REASONING GUIDES, not exact templates
- ADAPT the logic patterns to this specific business description
- Consider what makes this business unique beyond the training examples`;
  }
  
  additionalInstructions += `
- Always explain the BUSINESS ACTIVITY being performed, not just keyword matches
- Multiple valid suggestions are often better than one forced match
- Be creative while staying within the master occupancy list constraints`;

  return additionalInstructions;
}