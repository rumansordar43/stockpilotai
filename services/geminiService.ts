
import { GoogleGenAI, Type } from "@google/genai";
import { Trend, DeepAnalysisResult, GeneratedMetadata, NicheComparisonResult, MetadataConfig } from "../types";

// Initialize the Gemini API client using the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define schemas for structured JSON responses from Gemini
const trendSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    topic: { type: Type.STRING },
    niche: { type: Type.STRING },
    competition: { type: Type.STRING, description: "Must be 'Low', 'Medium', or 'High'" },
    category: { type: Type.STRING },
    description: { type: Type.STRING },
    potentialEarnings: { type: Type.STRING },
    popularityScore: { type: Type.NUMBER },
    trendHistory: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "Array of 7 integers representing demand history" },
  },
  required: ['id', 'topic', 'niche', 'competition', 'category', 'description', 'potentialEarnings', 'popularityScore', 'trendHistory'],
};

const metadataSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['title', 'description', 'keywords'],
};

const deepAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    nichePath: { type: Type.STRING },
    searchVolume: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    visualStyle: { type: Type.STRING },
    composition: { type: Type.STRING },
    suggestedPrompt: { type: Type.STRING },
    relatedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    lowCompetitionAlternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          score: { type: Type.NUMBER },
          reason: { type: Type.STRING }
        },
        required: ['topic', 'score', 'reason']
      }
    }
  },
  required: ['nichePath', 'searchVolume', 'difficulty', 'visualStyle', 'composition', 'suggestedPrompt', 'relatedKeywords', 'lowCompetitionAlternatives']
};

const comparisonSchema = {
  type: Type.OBJECT,
  properties: {
    winner: { type: Type.STRING },
    winnerReason: { type: Type.STRING },
    topicA: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        score: { type: Type.NUMBER },
        pros: { type: Type.ARRAY, items: { type: Type.STRING } },
        cons: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['name', 'score', 'pros', 'cons']
    },
    topicB: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        score: { type: Type.NUMBER },
        pros: { type: Type.ARRAY, items: { type: Type.STRING } },
        cons: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['name', 'score', 'pros', 'cons']
    }
  },
  required: ['winner', 'winnerReason', 'topicA', 'topicB']
};

type ErrorListener = (message: string) => void;
let globalErrorListener: ErrorListener | null = null;

export const setGlobalErrorListener = (listener: ErrorListener) => {
  globalErrorListener = listener;
};

const notifyError = (message: string) => {
  if (globalErrorListener) globalErrorListener(message);
};

// Internal helper for generating content with JSON schema
const generateJsonContent = async (prompt: string, schema: any, modelName: string = 'gemini-3-flash-preview') => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    notifyError(`Gemini Error: ${error.message}`);
    throw error;
  }
};

const generateRandomTrends = (count: number, type: 'general' | 'tshirt' | 'png' = 'general'): Trend[] => {
    const ADJECTIVES = ["Abstract", "Vintage", "Futuristic", "Minimalist", "Cyberpunk", "Authentic", "Sustainable", "Luxury"];
    const SUBJECTS = ["Coffee Culture", "Remote Work", "Electric Cars", "Smart Home", "Yoga Seniors", "Vertical Farming"];
    
    return Array.from({ length: count }).map((_, i) => {
        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const subj = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
        const score = Math.floor(Math.random() * (99 - 75) + 75);
        return {
            id: `gen-${Date.now()}-${i}`,
            topic: `${adj} ${subj}`,
            niche: type === 'general' ? 'Commercial' : (type === 'tshirt' ? 'Print on Demand' : 'Isolated Asset'),
            competition: Math.random() > 0.5 ? 'Low' : 'Medium',
            category: 'Trending',
            description: `High demand ${type === 'general' ? 'stock photo' : 'design'} concept generated by AI.`,
            potentialEarnings: 'High',
            popularityScore: score,
            trendHistory: Array.from({length: 7}, () => Math.floor(Math.random() * 20 + 70))
        };
    });
};

export const fetchDailyTrends = async (): Promise<Trend[]> => {
  try {
    const prompt = 'Identify 9 diverse and profitable microstock niches. Provide unique IDs and varied categories.';
    const data = await generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: { trends: { type: Type.ARRAY, items: trendSchema } },
        required: ['trends']
    });
    return data.trends || generateRandomTrends(6);
  } catch (error) {
    return generateRandomTrends(6);
  }
};

export const fetchMonthlyTrends = async (): Promise<Trend[]> => {
  try {
    const prompt = 'Identify 6 major upcoming holidays or seasonal events for the next 60 days for microstock.';
    const data = await generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: { trends: { type: Type.ARRAY, items: trendSchema } },
        required: ['trends']
    });
    return data.trends || generateRandomTrends(3);
  } catch (error) {
    return generateRandomTrends(3);
  }
};

export const fetchTShirtTrends = async (): Promise<Trend[]> => {
  try {
    const prompt = 'Identify 9 high-selling T-Shirt niches for Print on Demand.';
    const data = await generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: { trends: { type: Type.ARRAY, items: trendSchema } },
        required: ['trends']
    });
    return data.trends || generateRandomTrends(6, 'tshirt');
  } catch (error) {
    return generateRandomTrends(6, 'tshirt');
  }
};

export const fetchPngTrends = async (): Promise<Trend[]> => {
    try {
      const prompt = 'Identify 9 isolated PNG asset niches that are currently trending.';
      const data = await generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: { trends: { type: Type.ARRAY, items: trendSchema } },
        required: ['trends']
    });
      return data.trends || generateRandomTrends(6, 'png');
    } catch (error) {
      return generateRandomTrends(6, 'png');
    }
};

export const regenerateTrend = async (currentTrend: Trend): Promise<Trend | null> => {
    try {
        const prompt = `Generate one unique, high-profit microstock niche idea for the category: "${currentTrend.category}".`;
        const data = await generateJsonContent(prompt, {
            type: Type.OBJECT,
            properties: { trend: trendSchema },
            required: ['trend']
        });
        return data.trend || null;
    } catch (error) {
        return null;
    }
};

export const deepAnalyzeTopic = async (topic: string): Promise<DeepAnalysisResult | null> => {
  try {
    const prompt = `Perform deep market analysis for: "${topic}". Include niche path, search volume, difficulty, and specific low competition alternatives.`;
    const data = await generateJsonContent(prompt, deepAnalysisSchema, 'gemini-3-pro-preview');
    data.originalQuery = topic;
    return data as DeepAnalysisResult;
  } catch (error) {
    return null;
  }
};

export const compareNiches = async (topicA: string, topicB: string): Promise<NicheComparisonResult> => {
  const prompt = `Compare these two microstock niches: "${topicA}" vs "${topicB}". Determine a winner based on market potential and current trends.`;
  return await generateJsonContent(prompt, comparisonSchema, 'gemini-3-pro-preview');
};

const getPlatformRules = (platform: string) => {
    if (platform === 'adobestock' || platform === 'freepik') {
        return "Strictly ONLY provide 'title' and 'keywords'. DO NOT provide a description.";
    }
    if (platform === 'shutterstock') {
        return "Strictly ONLY provide 'description' and 'keywords'. Shutterstock uses description as the primary metadata.";
    }
    return "Provide 'title', 'description', and 'keywords'.";
};

export const generateMetadataFromFilename = async (filename: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
  const platformRules = getPlatformRules(config.platform);
  const prompt = `Generate commercial microstock metadata for file: "${filename}". 
  Platform Focus: ${config.platform}
  Rules:
  ${platformRules}
  - Title/Description: Max ${config.titleLength} characters.
  - Keywords: Exactly ${config.keywordCount} keywords.
  - Image Type: ${config.imageType}
  ${config.negativeTitle.enabled ? `- DO NOT include these words in Title/Desc: ${config.negativeTitle.value}` : ''}
  ${config.negativeKeywords.enabled ? `- DO NOT include these words in Keywords: ${config.negativeKeywords.value}` : ''}`;
  
  const data = await generateJsonContent(prompt, metadataSchema);
  
  if (config.prefix.enabled && config.prefix.value) {
      if (data.title) data.title = `${config.prefix.value} ${data.title}`;
      if (data.description) data.description = `${config.prefix.value} ${data.description}`;
  }
  if (config.suffix.enabled && config.suffix.value) {
      if (data.title) data.title = `${data.title} ${config.suffix.value}`;
      if (data.description) data.description = `${data.description} ${config.suffix.value}`;
  }
  
  return data;
};

export const generateImageMetadata = async (base64Data: string, mimeType: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
    const data = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
    const platformRules = getPlatformRules(config.platform);
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    parts: [
                        { inlineData: { data, mimeType } },
                        { text: `Analyze this image for commercial microstock. 
                          Platform Focus: ${config.platform}
                          Rules:
                          ${platformRules}
                          - Title/Description: max ${config.titleLength} chars.
                          - Keywords count: ${config.keywordCount}.
                          - Image Type: ${config.imageType}
                          ${config.negativeTitle.enabled ? `DO NOT use these words in Title/Desc: ${config.negativeTitle.value}` : ''}
                          ${config.negativeKeywords.enabled ? `DO NOT use these words in Keywords: ${config.negativeKeywords.value}` : ''}` 
                        }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: metadataSchema
            }
        });
        
        let metadata = JSON.parse(response.text);
        
        if (config.prefix.enabled && config.prefix.value) {
            if (metadata.title) metadata.title = `${config.prefix.value} ${metadata.title}`;
            if (metadata.description) metadata.description = `${config.prefix.value} ${metadata.description}`;
        }
        if (config.suffix.enabled && config.suffix.value) {
            if (metadata.title) metadata.title = `${metadata.title} ${config.suffix.value}`;
            if (metadata.description) metadata.description = `${metadata.description} ${config.suffix.value}`;
        }
        
        return metadata;
    } catch (error) {
        console.error("Vision Error:", error);
        return null;
    }
};

export const generateSinglePrompt = async (topic: string, style: string, composition: string): Promise<string> => {
  const prompt = `Generate one professional AI image prompt for: "${topic}". Style: ${style}. Composition: ${composition}.`;
  const data = await generateJsonContent(prompt, {
      type: Type.OBJECT,
      properties: { prompt: { type: Type.STRING } },
      required: ['prompt']
  });
  return data.prompt || "";
};

export const generateBulkPrompts = async (topic: string, count: number, style: string, composition: string): Promise<string[]> => {
    const prompt = `Generate ${count} unique AI image prompts for: "${topic}". Style: ${style}. Composition: ${composition}.`;
    const data = await generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: { prompts: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ['prompts']
    });
    return data.prompts || [];
};

export const fetchNichesByCategory = async (category: string): Promise<Trend[]> => {
    const prompt = `Identify 9 trending niches for microstock category: "${category}".`;
    const data = await generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: { trends: { type: Type.ARRAY, items: trendSchema } },
        required: ['trends']
    });
    return data.trends || [];
};

// Removed setDynamicApiKey and local storage dependency as per guidelines
