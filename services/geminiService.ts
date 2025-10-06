// यह अंतिम और सही कोड है
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StylePreset, AspectRatio } from '../types';

// New: Initialize AI with Service Account JSON
let ai: GoogleGenerativeAI;
try {
  const credentialsString = import.meta.env.VITE_GOOGLE_CREDENTIALS;
  if (!credentialsString) {
    throw new Error("VITE_GOOGLE_CREDENTIALS environment variable not set.");
  }
  const credentials = JSON.parse(credentialsString);
  ai = new GoogleGenerativeAI({
    credentials,
    // Note: We don't pass the API key directly anymore
  });
} catch (e) {
  console.error("Failed to initialize GoogleGenerativeAI:", e);
  // Fallback to API key if service account fails, just in case
  ai = new GoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });
}


// --- The rest of the file is the same as before ---

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const urlToGenerativePart = async (url: string, mimeType: string = 'image/jpeg') => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${url}`);
    }
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data: base64data,
                    mimeType: blob.type || mimeType
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const fileToGenerativePart = async (file: File) => {
    const base64Data = await fileToBase64(file);
    return {
        inlineData: {
            data: base64Data,
            mimeType: file.type,
        },
    };
};

export const generatePhotoshootImage = async (
  modelImage: File | string,
  productImage: File,
  prompt: string,
  style: StylePreset,
  aspectRatio: AspectRatio
): Promise<string> => {
    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const modelImagePart = typeof modelImage === 'string'
            ? await urlToGenerativePart(modelImage)
            : await fileToGenerativePart(productImage);

        const productImagePart = await fileToGenerativePart(productImage);

        const textPart = {
            text: `You are an expert AI photographer. Your task is to edit the first image (the model) to seamlessly incorporate the product from the second image.
            Creative Direction: "${prompt}".
            Desired Style: "${style}".
            The final image should be composed beautifully, as if for a '${aspectRatio}' frame.
            Ensure the lighting, shadows, and perspective on the integrated product are photorealistic and match the model's environment perfectly.`
        };

        const result = await model.generateContent({
            contents: [{ parts: [modelImagePart, productImagePart, textPart] }],
        });
        
        const response = result.response;
        const responsePart = response.candidates?.[0]?.content?.parts?.[0];

        if (responsePart && 'inlineData' in responsePart && responsePart.inlineData) {
            const base64ImageBytes: string = responsePart.inlineData.data;
            const mimeType = responsePart.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
        
        throw new Error("No image was generated. Please check the response format.");

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw new Error("Failed to generate image. The AI model may be overloaded or the prompt was rejected. Please try again.");
    }
};
