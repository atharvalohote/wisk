// GeminiAPI.ts
// Service for interacting with the Google Gemini API (text-only)

import Constants from 'expo-constants';
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from '@google/genai';

// Get API key from environment configuration
const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not configured. Please add it to app.json under "extra".');
}

// Define types for better type safety
export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

/**
 * Generate a recipe using the Gemini 2.5 Flash model.
 * @param prompt The text prompt to send to Gemini (ingredients, instructions, etc.)
 * @returns GeminiResponse object
 *
 * Note: True abort/cancel is not supported with the GoogleGenAI SDK. The Cancel button in the UI will only hide the overlay and ignore the result.
 */
export async function generateRecipe(prompt: string): Promise<GeminiResponse> {
  // Always use gemini-2.5-pro as the model
  const MODEL_NAME = 'gemini-2.5-pro';
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const parts = [{ text: prompt }];

  try {
    let result;
    // Try with response_mime_type: 'application/json' (for gemini-2.5-flash and newer models)
    // Gemini's total token limit (input + output) is typically 8192 or 32k depending on the model.
    const config = {
      maxOutputTokens: 8192, // Maximum for most Gemini models
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    };
    try {
      result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
        config,
      });
    } catch (err: any) {
      // Fallback to previous config (without response_mime_type)
      const configFallback = {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      };
      result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: configFallback,
      });
    }
    return result;
  } catch (err: any) {
    if (err.message?.includes('API_KEY')) {
      throw new Error('Invalid API key. Please check your Gemini API key configuration.');
    } else if (err.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (err.message?.includes('model')) {
      throw new Error('Model not available. Please check the model name.');
    } else {
      throw new Error(`Failed to generate recipe: ${err.message || 'Unknown error'}`);
    }
  }
}

// SETUP INSTRUCTIONS:
// 1. Add your Gemini API key to app.json under "extra":
//    "extra": { "GEMINI_API_KEY": "your_real_api_key_here" }
// 2. Rebuild your Expo app if you change app.json 