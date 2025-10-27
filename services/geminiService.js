// A lightweight image-to-text service that leverages on-device AI if
// available via the experimental `window.ai` API.  This implementation
// mirrors the original geminiService but omits server-side fallback
// calls that require API keys.  If on-device AI is unavailable the
// function returns an error message rather than throwing.

import { TagStyle } from '../types.js';
import { blobToBase64 } from '../utils/fileUtils.js';

// Prompts for the two supported tag styles.  These are nearly
// identical to the prompts in the original TypeScript version and
// guide the model to produce either a natural language caption
// (Flux) or a LoRA-style tag list (Illustrious).
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

/**
 * Generate tags or captions for an image.  If the user’s browser supports
 * the experimental `window.ai` API then on-device inference will be
 * attempted.  Otherwise the function returns an error indicating that
 * inference is unavailable.  See README for more details.
 *
 * @param {Blob} imageFile The image data to analyse
 * @param {string} style Either TagStyle.Flux or TagStyle.Illustrious
 * @returns {Promise<string>} The generated caption or tags, or an error
 */
export async function generateTags(imageFile, style) {
  try {
    const prompt = style === TagStyle.Flux ? FLUX_PROMPT : ILLUSTRIOUS_PROMPT;

    // Prefer on-device inference via the experimental window.ai API
    if (window.ai && typeof window.ai.canCreateImageToTextSession === 'function') {
      const availability = await window.ai.canCreateImageToTextSession();
      if (availability !== 'no') {
        const session = await window.ai.createImageToTextSession();
        try {
          const result = await session.prompt(imageFile, prompt);
          return result;
        } finally {
          session.destroy();
        }
      }
    }
    // Fallback: inform the user that on-device AI is unavailable
    return 'Error: On-device AI is not available in this browser.';
  } catch (error) {
    console.error('Error generating tags:', error);
    return `Error: ${error && error.message ? error.message : 'An unknown error occurred while generating tags.'}`;
  }
}