import { GoogleGenAI } from '@google/genai';

// Initialize the SDK using the injected environment variable from vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates standard content using gemini-2.5-flash.
 * Used for Content Planner, Post Analyzer, and Smart Assistant.
 */
export const generateStandardContent = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error('Error in generateStandardContent:', error);
    throw new Error('toast.apiError');
  }
};

/**
 * Analyzes strategic data using gemini-2.5-pro.
 * Used exclusively for the Strategic Profile Analyzer (Module 2).
 */
export const analyzeStrategicData = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error('Error in analyzeStrategicData:', error);
    throw new Error('toast.apiError');
  }
};
