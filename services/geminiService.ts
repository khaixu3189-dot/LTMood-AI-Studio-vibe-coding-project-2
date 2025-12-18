
import { GoogleGenAI } from "@google/genai";
import { TemplateType, HandwritingVibe, ReferenceImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStationeryVariation = async (
  text: string,
  mood: string,
  template: TemplateType,
  vibe: HandwritingVibe,
  referenceImages: ReferenceImage[] = [],
  seedOffset: number = 0
): Promise<string | null> => {
  const prompt = `Create a complete, single-page ${template} stationery artwork. 
  The aesthetic should be: "${mood}". 
  Vibe: ${vibe}.
  
  IMPORTANT: You MUST write the following text onto the paper in a ${vibe} handwriting style:
  "${text}"
  
  The text should be integrated naturally into the design, appearing as if it was hand-written on the stationery.
  Include artistic details, borders, or subtle background illustrations matching the mood.
  Do not include any digital UI, buttons, or frames. Just the final paper.
  Variation ID: ${Date.now() + seedOffset}`;

  const parts: any[] = [{ text: prompt }];
  
  // Add reference images to the prompt if provided
  referenceImages.forEach(img => {
    parts.push({
      inlineData: {
        data: img.data.split(',')[1], // remove data:image/png;base64,
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
  // We'll fire off 3 variations in parallel for a richer user choice
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
