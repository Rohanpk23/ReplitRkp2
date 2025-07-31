import * as fs from "fs";
import { GoogleGenAI, Modality } from "@google/genai";
import type { Suggestion } from "@shared/schema";
import { getRelevantTrainingExamples } from "./training-data";
import { generateFlexibilityPromptAdditions } from "./flexibility-validator";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeBusinessDescription(
  businessDescription: string,
  masterOccupancyList: string[],
  recentCorrections: Array<{wrongCode: string, correctCode: string, reason: string}> = []
): Promise<{
  suggested_occupancies: Suggestion[];
  overall_reasoning: string;
}> {
  try {
    // Get relevant training examples from business descriptions CSV
    const trainingExamples = getRelevantTrainingExamples(businessDescription, 3);
    
    // Generate flexibility safeguards based on business type
    const flexibilityAdditions = generateFlexibilityPromptAdditions(businessDescription, trainingExamples);
    const systemPrompt = `You are an AI Occupancy Translator for an insurance platform. Your job is to analyze business descriptions (including English, Hindi, and Hinglish) and match them to exact occupancy codes from a master list.

CRITICAL RULES:
1. You MUST NOT suggest any occupancy that is not an exact match from the provided master list
2. If you cannot find a confident match, return an empty array for suggested_occupancies
3. Always provide reasoning linking your suggestions to specific phrases in the description
4. Support English, Hindi, and Hinglish language understanding
5. LEARN from recent corrections to avoid repeating mistakes
6. TRAINING EXAMPLES are GUIDANCE ONLY - never force matches, use creative reasoning
7. FLEXIBILITY FIRST - adapt reasoning patterns to new business types not in training data
8. Respond with JSON in this exact format

FLEXIBILITY SAFEGUARDS:
- Training examples show REASONING PATTERNS, not fixed input-output rules
- Always prioritize BUSINESS ACTIVITY UNDERSTANDING over keyword matching
- If no training examples match, use general business knowledge + master list
- Never reject a description because it's not in training data
- Apply SIMILAR LOGIC from training examples to NEW business types
- Multiple valid suggestions are better than forcing one "correct" answer

Master Occupancy List:
${masterOccupancyList.join('\n')}

TRAINING EXAMPLES (Use these as REFERENCE PATTERNS, not rigid rules):
${trainingExamples.length > 0 ? trainingExamples.map(example => 
  `📝 SIMILAR INPUT: "${example.businessDescription}"
   ✅ REFERENCE MATCH: "${example.correctOccupancy}"
   📋 USE AS: Pattern recognition guide only - adapt logic to current description
   
   IMPORTANT: This is a REFERENCE pattern. Apply similar reasoning logic to the current business description, but don't force exact matches. Consider the underlying business activity and match to the most appropriate occupancy from the master list.`
).join('\n\n') : 'No relevant training examples found.'}

RECENT CORRECTIONS (Learn from these mistakes):
${recentCorrections.length > 0 ? recentCorrections.map(correction => 
  `❌ WRONG: "${correction.wrongCode}" → ✅ CORRECT: "${correction.correctCode}" 
   Reason: ${correction.reason}`
).join('\n\n') : 'No recent corrections available.'}

Response format (JSON only):
{
  "suggested_occupancies": [
    {
      "occupancy": "exact match from master list",
      "reason": "explanation linking to specific phrases",
      "confidence": "high|medium|low"
    }
  ],
  "overall_reasoning": "summary of your thought process"
}${flexibilityAdditions}`;

    const userPrompt = `Analyze this business description and suggest appropriate occupancy codes:

"${businessDescription}"

Remember: Only suggest exact matches from the master list. If uncertain, return empty suggested_occupancies array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            suggested_occupancies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  occupancy: { type: "string" },
                  reason: { type: "string" },
                  confidence: { type: "string" }
                },
                required: ["occupancy", "reason"]
              }
            },
            overall_reasoning: { type: "string" }
          },
          required: ["suggested_occupancies", "overall_reasoning"]
        }
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    console.log(`Raw JSON: ${rawJson}`);

    if (rawJson) {
      const result = JSON.parse(rawJson);
      
      // Validate that all suggested occupancies are in the master list
      const validSuggestions = result.suggested_occupancies?.filter((suggestion: Suggestion) => 
        masterOccupancyList.includes(suggestion.occupancy)
      ) || [];

      return {
        suggested_occupancies: validSuggestions,
        overall_reasoning: result.overall_reasoning || "Analysis completed"
      };
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw new Error("Failed to analyze business description: " + (error as Error).message);
  }
}

export async function handleCorrectionFeedback(
  originalDescription: string,
  incorrectSuggestion: string,
  correctOccupancy: string,
  reason?: string
): Promise<string> {
  try {
    const prompt = `Correction: My suggestion was wrong. For the business description "${originalDescription}", I suggested "${incorrectSuggestion}" but the correct occupancy should have been "${correctOccupancy}". ${reason ? `Reason: ${reason}` : ''}

Please acknowledge this correction in a conversational tone and confirm you've logged the feedback.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Thank you for the correction. I have logged that for this type of description, the correct occupancy is noted. This feedback helps improve the system.";
  } catch (error) {
    console.error("Gemini correction feedback error:", error);
    return "Thank you for the correction. I have logged that for this type of description, the correct occupancy is noted. This feedback helps improve the system.";
  }
}
