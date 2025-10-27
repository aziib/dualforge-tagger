import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TagStyle } from '../types';
import { blobToBase64 } from "../utils/fileUtils";

const FLUX_PROMPT = `Generate a short descriptive caption (1-2 lines) that describes the attached image in natural language. It should sound like a creative, human-written prompt or scene description.

Requirements:
- Written in lowercase
- Use vivid but concise natural language
- Avoid listing tags, describe what’s happening or what’s shown
- Example: "a girl with flowing silver hair stands beneath the moonlight, her sword glowing faintly"

Generate the caption for the provided image.`;

const ILLUSTRIOUS_PROMPT = `Generate a comma-separated list of LoRA-style tags for the attached image, suitable for training an image dataset. Follow standard Danbooru/LoRA tag conventions.

Requirements:
- All tags must be in lowercase.
- All tags must be comma-separated.
- Prioritize visible traits and elements in the image.
- Follow this structure for tags:
  - Number of subjects: e.g., 1girl, 1boy, 2girls
  - Hair attributes: e.g., long silver hair, twin tails, ahoge
  - Eye attributes: e.g., blue eyes, heterochromia
  - Facial expression: e.g., smile, serious, blush
  - Outfit/clothing: e.g., school uniform, armor, maid outfit
  - Pose & camera angle: e.g., looking at viewer, kneeling, back view
  - Background & setting: e.g., outdoors, room, night, cityscape
  - Art style: e.g., anime style, digital painting, sketch
- Do not include non-visual concepts, abstract ideas, or hidden lore.

Generate the tags for the provided image.`;

// Add type declarations for a hypothetical, experimental window.ai image-to-text API
declare global {
  interface Window {
    ai?: {
      canCreateImageToTextSession: () => Promise<'readily' | 'after-download' | 'no'>;
      createImageToTextSession: (options?: any) => Promise<AIImageToTextSession>;
    };
  }
  interface AIImageToTextSession {
    prompt: (image: Blob, promptText: string) => Promise<string>;
    destroy: () => void;
  }
}


let ai: GoogleGenAI | null = null;
const getAI = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

export const generateTags = async (
  imageFile: Blob,
  style: TagStyle
): Promise<string> => {
  try {
    const prompt = style === TagStyle.Flux ? FLUX_PROMPT : ILLUSTRIOUS_PROMPT;

    // Prioritize using on-device AI if available
    if (window.ai && window.ai.canCreateImageToTextSession && (await window.ai.canCreateImageToTextSession()) !== 'no') {
      console.log("Using on-device AI for image-to-text.");
      const session = await window.ai.createImageToTextSession();
      try {
          const result = await session.prompt(imageFile, prompt);
          return result;
      } finally {
          session.destroy();
      }
    } else {
      // Fallback to server-side Gemini API
      console.log("On-device AI not available, using server-side Gemini API.");
      const base64Data = await blobToBase64(imageFile);
      const genAI = getAI();

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: imageFile.type,
        },
      };

      const textPart = {
        text: prompt,
      };

      const response: GenerateContentResponse = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });

      return response.text;
    }
  } catch (error) {
    console.error("Error generating tags:", error);
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    return "An unknown error occurred while generating tags.";
  }
};
