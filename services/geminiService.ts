
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGreatExchange = async (input: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a WFPB nutrition expert. Provide a Whole Food Plant-Based (WFPB) alternative for: "${input}". 
      
      Strict Rules:
      1. No Added Oil (Suggest water/broth sautéing or prune paste).
      2. No Refined Sugar (Suggest Sucanat or fruit).
      3. Focus on whole plant health.
      
      Provide:
      1. The substitution name.
      2. The health reason.
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
      contents: `Explain how a WFPB diet impacts this query: "${query}". Emphasize clinical evidence and plant-based synergy.`,
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
    return { text: "WFPB nutrition focuses on the synergy of whole plant parts for optimal health.", sources: [] };
  }
};

export const getIngredientHealthTip = async (ingredient: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide one interesting, science-backed health fact about ${ingredient} in a WFPB context. Keep it under 20 words.`,
    });
    return response.text.trim();
  } catch (error) {
    return "Whole plant foods are naturally rich in fiber and antioxidants.";
  }
};

export const generateRecipeImage = async (recipeName: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A high-end food photography shot of a WFPB dish: ${recipeName}. ${description}. No meat, no oil. 8k resolution.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
