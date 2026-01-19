import { GoogleGenAI } from "@google/genai";

// Ensure API key is present
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Calls Gemini API to colorize the image.
 */
export const colorizeImage = async (base64Image: string, hint?: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const model = 'gemini-2.5-flash-image';
  
  const prompt = hint 
    ? `Colorize this black and white image. Pay attention to this detail: ${hint}. Ensure the output is photorealistic.` 
    : `Colorize this black and white image. Make it look natural, historical accurate if applicable, and photorealistic. Return ONLY the image.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assumes PNG or JPEG. API handles common types.
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract image from response
    let generatedImageBase64 = '';
    
    // The API might return text (refusal or description) or image. We need to find the image part.
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      // Check if there was a text refusal or error message in the text part
      const textPart = parts?.find(p => p.text)?.text;
      if (textPart) {
        throw new Error(`Model returned text instead of image: ${textPart}`);
      }
      throw new Error("No image data found in the response.");
    }

    return generatedImageBase64;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to colorize image.");
  }
};
