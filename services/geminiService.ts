
import { GoogleGenAI } from "@google/genai";
import { TemplateType, HandwritingVibe, ReferenceImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Uses Gemini to add punctuation and capitalization to raw speech transcripts.
 */
export const refineTranscriptPunctuation = async (rawText: string): Promise<string> => {
  if (!rawText || rawText.trim().length < 3) return rawText;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a sensitive journal editor. Please take this raw speech transcript and add correct punctuation and capitalization to make it readable and evocative. DO NOT add or remove words. 
      
      Transcript: "${rawText}"`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text?.trim() || rawText;
  } catch (err) {
    console.warn("Punctuation refinement failed:", err);
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
  // Enhanced prompt to force adherence to specific mood details and text placement
  const prompt = `Task: Generate a single, beautiful image of a "${template}" stationery page.
  
  Visual Theme: "${mood}".
  Handwriting Tone: ${vibe}.
  
  MANDATORY REQUIREMENT:
  You must VISUALLY WRITE the following text onto the stationery in a realistic ${vibe} handwriting style. The text should look like it's written with ink on physical paper:
  
  "${text}"
  
  The artwork should capture every detail of the atmosphere described: "${mood}". 
  Ensure high artistic quality, realistic textures, and proper integration of any sketches or stickers mentioned.
  Do not show any hands, tools, or digital UI. Only the final paper page.
  Variation: ${seedOffset}`;

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
    console.error("Generation failed:", error);
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
    throw new Error("Generation failed to produce any results.");
  }
  
  return validImages;
};
