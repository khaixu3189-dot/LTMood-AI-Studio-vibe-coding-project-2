
import { GoogleGenAI } from "@google/genai";
import { TemplateType, HandwritingVibe, ReferenceImage } from "../types";
import { VIBE_DESCRIPTIONS, HANDWRITING_FONTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const refineTranscriptPunctuation = async (rawText: string): Promise<string> => {
  if (!rawText || rawText.trim().length < 3) return rawText;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a sensitive personal journal editor. Take this raw speech-to-text transcript and add natural punctuation and capitalization to make it readable, intimate, and evocative. 
      IMPORTANT: Do not change the original words. 
      
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

/**
 * 将文字合成到背景图片上，确保字体一致性，并默认居中显示
 */
const compositeTextOnImage = async (
  backgroundImageUrl: string,
  text: string,
  vibe: HandwritingVibe
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundImageUrl;

    img.onload = () => {
      // 设置画布大小与生成的图片一致
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. 绘制 AI 生成的背景
      ctx?.drawImage(img, 0, 0);

      if (ctx) {
        // 2. 配置字体
        const fontMap: Record<HandwritingVibe, string> = {
          elegant: 'Caveat',
          vintage: 'Dancing Script',
          bubbly: 'Indie Flower',
          messy: 'Nothing You Could Do',
          clean: 'Patrick Hand'
        };

        const fontSize = Math.floor(canvas.width * 0.055); 
        ctx.font = `${fontSize}px "${fontMap[vibe]}"`;
        ctx.fillStyle = "rgba(45, 35, 25, 0.88)"; // 深色墨迹
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 3. 文字换行与尺寸预计算
        const maxWidth = canvas.width * 0.75;
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = currentLine + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(currentLine);
            currentLine = words[n] + ' ';
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        // 4. 计算起始高度以实现垂直居中
        const lineHeight = fontSize * 1.35;
        const totalTextHeight = lines.length * lineHeight;
        const startX = canvas.width / 2;
        let startY = (canvas.height - totalTextHeight) / 2 + (lineHeight / 2);

        // 5. 绘制文字
        lines.forEach((line) => {
          ctx.fillText(line.trim(), startX, startY);
          startY += lineHeight;
        });

        // 6. 返回合成后的 Base64
        resolve(canvas.toDataURL('image/png'));
      }
    };
  });
};

export const generateStationeryVariation = async (
  text: string,
  mood: string,
  template: TemplateType,
  vibe: HandwritingVibe,
  referenceImages: ReferenceImage[] = [],
  seedOffset: number = 0
): Promise<string | null> => {
  const prompt = `Task: Create a beautiful BLANK stationery page for a "${template}".
  
  VISUAL THEME: "${mood}". 
  Apply all textures, lighting, and background motifs from this mood.
  
  IMAGE COMPOSITION:
  - DO NOT include any text, letters, or words on the page. Leave the center area clear for overlaying text.
  - INTEGRATE elements from the attached reference images as artistic stickers, drawings, or decorative patterns physically placed on the paper.
  - The goal is a high-quality, artsy, aesthetic journal background.
  - No hands, no pens, only the flat paper artwork.
  
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
          const bgBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          return await compositeTextOnImage(bgBase64, text, vibe);
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Generation error:", error);
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
    throw new Error("Creation interrupted. Please try once more.");
  }
  
  return validImages;
};
