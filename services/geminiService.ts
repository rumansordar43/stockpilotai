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
            content: systemMsg || (isJSON ? "You are a professional microstock metadata expert. Always respond with strictly valid JSON only. No extra text or markdown." : "You are a professional microstock assistant.")
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: model,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        response_format: isJSON ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Groq API Error");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return isJSON ? JSON.parse(content) : content;
  } catch (error: any) {
    console.error("Groq Error:", error);
    notifyError(`AI Error: ${error.message}`);
    throw error;
  }
};

export const fetchDailyTrends = async (): Promise<Trend[]> => {
  const prompt = "Identify 9 profitable microstock niches. Schema: { trends: [{ id, topic, niche, competition, category, description, potentialEarnings, popularityScore, trendHistory: [7 numbers] }] }";
  try {
    const data = await callGroq(prompt);
    return data.trends || [];
  } catch { return []; }
};

export const fetchMonthlyTrends = async (): Promise<Trend[]> => {
  const prompt = "Identify 6 seasonal microstock trends. Schema: { trends: [...] }";
  try {
    const data = await callGroq(prompt);
    return data.trends || [];
  } catch { return []; }
};

export const fetchTShirtTrends = async (): Promise<Trend[]> => {
  const prompt = "Identify 9 trending T-Shirt/POD niches. Schema: { trends: [...] }";
  try {
    const data = await callGroq(prompt);
    return data.trends || [];
  } catch { return []; }
};

export const fetchPngTrends = async (): Promise<Trend[]> => {
  const prompt = "Identify 9 demand isolated PNG asset niches. Schema: { trends: [...] }";
  try {
    const data = await callGroq(prompt);
    return data.trends || [];
  } catch { return []; }
};

export const regenerateTrend = async (currentTrend: Trend): Promise<Trend | null> => {
  const prompt = `Generate one niche similar to "${currentTrend.topic}". Schema: { trend: { ... } }`;
  try {
    const data = await callGroq(prompt);
    return data.trend || null;
  } catch { return null; }
};

export const deepAnalyzeTopic = async (topic: string): Promise<DeepAnalysisResult | null> => {
  const prompt = `Analyze market for: "${topic}". Schema: { analysis: { nichePath, searchVolume, difficulty, visualStyle, composition, suggestedPrompt, relatedKeywords, lowCompetitionAlternatives: [] } }`;
  try {
    const data = await callGroq(prompt);
    const res = data.analysis || data;
    res.originalQuery = topic;
    return res;
  } catch { return null; }
};

export const compareNiches = async (topicA: string, topicB: string): Promise<NicheComparisonResult> => {
  const prompt = `Compare "${topicA}" and "${topicB}". Schema: { winner, winnerReason, topicA: {name, score, pros, cons}, topicB: {name, score, pros, cons} }`;
  return await callGroq(prompt);
};

export const generateMetadataFromFilename = async (filename: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
  const prompt = `Generate title/keywords for file: "${filename}". Platform: ${config.platform}. Count: ${config.keywordCount}. Schema: { title, description, keywords: [] }`;
  return await callGroq(prompt);
};

export const generateImageMetadata = async (base64Data: string, mimeType: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error("MISSING_API_KEY");

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
              { type: "text", text: `Analyze this image for commercial microstock (${config.platform}). Return JSON: { "title": "...", "description": "...", "keywords": ["...", "..."] }. Keywords count: ${config.keywordCount}.` },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
            ]
          }
        ],
        model: model,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error("Vision Analysis Failed");
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Vision Error:", error);
    return null;
  }
};

export const generateSinglePrompt = async (topic: string, style: string, composition: string): Promise<string> => {
  const prompt = `Generate one AI prompt for: "${topic}". Style: ${style}. Composition: ${composition}. Schema: { prompt: "text" }`;
  const data = await callGroq(prompt);
  return data.prompt || "";
};

export const generateBulkPrompts = async (topic: string, count: number, style: string, composition: string): Promise<string[]> => {
  const prompt = `Generate ${count} AI prompts for: "${topic}". Style: ${style}. Composition: ${composition}. Schema: { prompts: [] }`;
  const data = await callGroq(prompt);
  return data.prompts || [];
};

export const fetchNichesByCategory = async (category: string): Promise<Trend[]> => {
  const prompt = `9 niches for: "${category}". Schema: { trends: [] }`;
  const data = await callGroq(prompt);
  return data.trends || [];
};