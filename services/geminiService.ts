
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGreatExchange = async (input: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a WFPB nutrition expert based on Dr. LeAnne Campbell's "The Plant-Based Wellness App". 
      Provide a Whole Food Plant-Based (WFPB) alternative for: "${input}". 
      Strict Rules:
      1. No Added Oil (Suggest water/broth sautéing or prune paste).
      2. No Refined Sugar (Suggest Sucanat or fruit).
      3. Focus on plant parts (Grains, Legumes, Roots, etc.).
      
      Provide:
      1. The substitution name (e.g., "Prune Paste" or "Flax Egg").
      2. The health reason based on the China Study findings.
      3. A specific ratio or prep instruction.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            substitution: { type: Type.STRING },
            reason: { type: Type.STRING },
            howToUse: { type: Type.STRING }
          },
          required: ["substitution", "reason", "howToUse"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      substitution: "Try pureed prunes or flaxseed meal.", 
      reason: "Whole plants preserve vital fiber and phytonutrients.",
      howToUse: "Use 1/3 cup prune paste to replace 1 cup of oil in baking."
    };
  }
};

export const analyzeMealImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Classify the food in this image into these 8 WFPB categories: Fruits, Grains, Leaves, Roots, Legumes, Flowers, Nuts, Mushrooms. Return ONLY a JSON array of the category names found." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Vision Error:", error);
    return [];
  }
};

export const getHealthSearch = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Explain how a WFPB diet (as defined in the China Study) impacts this health query: "${query}". 
      Emphasize the prevention of chronic disease and the benefits of dietary fiber and plant protein over animal protein.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Scientific Resource',
      uri: chunk.web?.uri
    })) || [];

    return {
      text: response.text,
      sources: sources
    };
  } catch (error) {
    return { text: "WFPB nutrition focuses on the synergy of whole plant parts for optimal health and chronic disease prevention.", sources: [] };
  }
};

export const getIngredientHealthTip = async (ingredient: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide one interesting, science-backed health fact about ${ingredient} specifically in the context of chronic disease prevention and WFPB nutrition. Keep it under 20 words. Example: 'One cup of broccoli has more vitamin C than an orange.'`,
    });
    return response.text.trim();
  } catch (error) {
    return "Whole plant foods are naturally rich in fiber, antioxidants, and phytochemicals.";
  }
};
