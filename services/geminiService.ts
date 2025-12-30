
import { Trend, DeepAnalysisResult, GeneratedMetadata, NicheComparisonResult, MetadataConfig } from "../types";

// Helper to get Groq Key from local storage
const getGroqApiKey = () => localStorage.getItem('groq_api_key');

type ErrorListener = (message: string) => void;
let globalErrorListener: ErrorListener | null = null;

export const setGlobalErrorListener = (listener: ErrorListener) => {
  globalErrorListener = listener;
};

const notifyError = (message: string) => {
  if (globalErrorListener) globalErrorListener(message);
};

// Generic Groq API Call Helper
const callGroq = async (prompt: string, isJSON: boolean = true, model: string = "meta-llama/llama-4-scout-17b-16e-instruct", systemMsg?: string) => {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    notifyError("Groq API Key is missing. Please go to Settings and enter your key.");
    throw new Error("MISSING_API_KEY");
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemMsg || (isJSON ? "You are a specialized microstock assistant. Always respond with strictly valid JSON only." : "You are a professional microstock assistant.")
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: model,
        temperature: 0.7,
        max_tokens: 2048,
        response_format: isJSON ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Groq API Request Failed");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return isJSON ? JSON.parse(content) : content;
  } catch (error: any) {
    console.error("Groq Service Error:", error);
    notifyError(`Service Error: ${error.message}`);
    throw error;
  }
};

// --- API Implementation Functions ---

export const fetchDailyTrends = async (): Promise<Trend[]> => {
  const prompt = "Identify 9 diverse and profitable microstock niches for today. Provide them as an array of objects matching this schema: { trends: [{ id, topic, niche, competition: 'Low'|'Medium'|'High', category, description, potentialEarnings, popularityScore, trendHistory: [7 numbers] }] }";
  try {
    const data = await callGroq(prompt);
    return data.trends || [];
  } catch (error) {
    return [];
  }
};

export const fetchMonthlyTrends = async (): Promise<Trend[]> => {
  const prompt = "Identify 6 major upcoming seasonal microstock trends for the next 2 months. Schema: { trends: [...] }";
  try {
    const data = await callGroq(prompt);
    return data.trends || [];
  } catch (error) {
    return [];
  }
};

export const fetchTShirtTrends = async (): Promise<Trend[]> => {
  const prompt = "Identify 9 trending T-Shirt/POD niches. Schema: { trends: [...] }";
  try {
    const data = await callGroq(prompt);
    return data.trends || [];
  } catch (error) {
    return [];
  }
};

export const fetchPngTrends = async (): Promise<Trend[]> => {
  const prompt = "Identify 9 isolated PNG asset niches currently in high demand. Schema: { trends: [...] }";
  try {
    const data = await callGroq(prompt);
    return data.trends || [];
  } catch (error) {
    return [];
  }
};

export const regenerateTrend = async (currentTrend: Trend): Promise<Trend | null> => {
  const prompt = `Generate one unique microstock niche idea similar to "${currentTrend.topic}" but for category "${currentTrend.category}". Schema: { trend: { ... } }`;
  try {
    const data = await callGroq(prompt);
    return data.trend || null;
  } catch (error) {
    return null;
  }
};

export const deepAnalyzeTopic = async (topic: string): Promise<DeepAnalysisResult | null> => {
  const prompt = `Perform deep market analysis for microstock topic: "${topic}". Provide nichePath, searchVolume, difficulty, visualStyle, composition, suggestedPrompt, relatedKeywords, and lowCompetitionAlternatives (array). Schema: { analysis: { ... } }`;
  try {
    const data = await callGroq(prompt);
    const result = data.analysis || data;
    result.originalQuery = topic;
    return result as DeepAnalysisResult;
  } catch (error) {
    return null;
  }
};

export const compareNiches = async (topicA: string, topicB: string): Promise<NicheComparisonResult> => {
  const prompt = `Compare these two microstock niches: "${topicA}" vs "${topicB}". Determine winner, reason, and provide pros/cons for both. Schema: { winner, winnerReason, topicA: {name, score, pros, cons}, topicB: {name, score, pros, cons} }`;
  return await callGroq(prompt);
};

export const generateMetadataFromFilename = async (filename: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
  const prompt = `Generate commercial microstock metadata (title, keywords) for file: "${filename}". Platform: ${config.platform}. Keyword count: ${config.keywordCount}. Schema: { title, description, keywords: [] }`;
  return await callGroq(prompt);
};

// Vision: Groq uses specialized models for vision
export const generateImageMetadata = async (base64Data: string, mimeType: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error("MISSING_API_KEY");

  // For vision, we must use Groq's vision model
  const model = "llama-3.2-11b-vision-preview";
  const base64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this image for commercial microstock. Generate metadata for ${config.platform}. Return JSON with: title, description, keywords (count: ${config.keywordCount}).` },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
            ]
          }
        ],
        model: model,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Vision Error:", error);
    return null;
  }
};

export const generateSinglePrompt = async (topic: string, style: string, composition: string): Promise<string> => {
  const prompt = `Generate one professional AI image prompt for: "${topic}". Style: ${style}. Composition: ${composition}. Schema: { prompt: "text" }`;
  const data = await callGroq(prompt);
  return data.prompt || "";
};

export const generateBulkPrompts = async (topic: string, count: number, style: string, composition: string): Promise<string[]> => {
  const prompt = `Generate ${count} unique, high-quality AI image prompts for: "${topic}". Style: ${style}. Composition: ${composition}. Schema: { prompts: ["prompt1", "prompt2", ...] }`;
  const data = await callGroq(prompt);
  return data.prompts || [];
};

export const fetchNichesByCategory = async (category: string): Promise<Trend[]> => {
  const prompt = `Identify 9 trending niches for microstock category: "${category}". Schema: { trends: [...] }`;
  const data = await callGroq(prompt);
  return data.trends || [];
};
