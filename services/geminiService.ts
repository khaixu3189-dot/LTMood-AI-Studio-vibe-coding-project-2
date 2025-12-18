
import { GoogleGenAI } from "@google/genai";
import { TemplateType, HandwritingVibe, ReferenceImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Uses Gemini to add punctuation and capitalization to raw speech transcripts.
 */
export const refineTranscriptPunctuation = async (rawText: string): Promise<string> => {
  if (!rawText || rawText.length < 5) return rawText;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert editor for a personal journal app. 
      Please take the following raw speech-to-text input and add natural punctuation (periods, commas, etc.) and proper capitalization. 
      DO NOT change the words. Keep the tone intimate and personal.
      
      Input: "${rawText}"`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text?.trim() || rawText;
  } catch (err) {
    console.warn("Failed to refine punctuation, using raw text.");
    return rawText;
  }
};

export const generateStationeryVariation = async (
  text: string,
  mood: string,
  template: TemplateType,
  vibe: HandwritingVibe,
  referenceImages: ReferenceImage[] = [],
  seedOffset: number = 0
): Promise<string | null> => {
  // Enhanced prompt for better "fusing" and instruction adherence.
  const prompt = `Task: Create a piece of fine stationery art for a "${template}".
  Visual Style/Mood: "${mood}". 
  Handwriting Style: ${vibe}.

  CRITICAL INSTRUCTION:
  1. You MUST visually render the following text onto the paper in a ${vibe} handwriting style: "${text}".
  2. The text should look like it was physically written with a pen on the page, integrating with shadows and paper texture.
  3. Ensure all background elements (drawings, doodles, textures) from the mood description are clearly present but do not obscure the text.
  4. The output must be a single clean image of the paper, no digital borders or UI.
  5. Use artistic flair to make it look like a high-quality physical journal entry.
  
  Variation ID: ${Date.now() + seedOffset}`;

  const parts: any[] = [{ text: prompt }];
  
  referenceImages.forEach(img => {
    parts.push({
      inlineData: {
        data: img.data.split(',')[1],
        mimeType: img.mimeType
      }
    });
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Variation generation failed:", error);
    return null;
  }
};

export const generateStationery = async (
  text: string,
  mood: string,
  template: TemplateType,
  vibe: HandwritingVibe,
  referenceImages: ReferenceImage[] = []
): Promise<string[]> => {
  const variationPromises = [0, 1, 2].map(offset => 
    generateStationeryVariation(text, mood, template, vibe, referenceImages, offset)
  );

  const results = await Promise.all(variationPromises);
  const validImages = results.filter((img): img is string => img !== null);
  
  if (validImages.length === 0) {
    throw new Error("No variations could be generated.");
  }
  
  return validImages;
};
