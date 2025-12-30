
import { Trend, DeepAnalysisResult, GeneratedMetadata, NicheComparisonResult, MetadataConfig } from "../types";

// Dynamic API Key handling (System/Admin Key)
let dynamicApiKey = localStorage.getItem('system_api_key') || '';

export const setDynamicApiKey = (key: string) => {
  dynamicApiKey = key;
  localStorage.setItem('system_api_key', key);
};

const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// --- CORE GROQ CALLER ---
const callGroq = async (prompt: string, apiKey: string, systemMessage: string = "You are a helpful assistant.", jsonMode: boolean = true) => {
    if (!apiKey) throw new Error("MISSING_API_KEY");

    // Handle comma separated keys
    let finalKey = apiKey;
    if (apiKey.includes(',')) {
        const keys = apiKey.split(',').map(k => k.trim()).filter(k => k);
        finalKey = keys[Math.floor(Math.random() * keys.length)];
    }

    const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${finalKey}`
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt }
            ],
            response_format: jsonMode ? { type: "json_object" } : undefined,
            temperature: 0.7,
            max_completion_tokens: 2048
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

// --- DATA GENERATORS FOR OFFLINE FALLBACK ---
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
            description: `High demand ${type === 'general' ? 'stock photo' : 'design'} concept.`,
            potentialEarnings: 'High',
            popularityScore: score,
            trendHistory: Array.from({length: 7}, () => Math.floor(Math.random() * 20 + 70))
        };
    });
};

const hasSystemKey = (): boolean => {
    return !!(dynamicApiKey && dynamicApiKey.length > 5);
};

// --- ERROR NOTIFICATION SYSTEM ---
type ErrorListener = (message: string) => void;
let globalErrorListener: ErrorListener | null = null;

export const setGlobalErrorListener = (listener: ErrorListener) => {
  globalErrorListener = listener;
};

const notifyError = (message: string) => {
  if (globalErrorListener) globalErrorListener(message);
};

const handleApiError = (error: any, context: string) => {
    console.warn(`API Error (${context}):`, error);
    const msg = error?.message || "";
    if (msg.includes("429") || msg.includes("quota")) {
        notifyError(`⚠️ RATE LIMIT! Please check your Groq API key.`);
    } else if (msg.includes("MISSING_API_KEY")) {
        // Handled in UI
    } else {
        notifyError(`Groq Error: ${msg.substring(0, 50)}...`);
    }
};

// --- ADMIN KEY FUNCTIONS ---

export const fetchDailyTrends = async (): Promise<Trend[]> => {
  if (!hasSystemKey()) return generateRandomTrends(6, 'general');
  try {
    const prompt = `Identify 9 diverse and profitable microstock niches. Return a JSON object with a "trends" array matching this interface: {id, topic, niche, competition, category, description, potentialEarnings, popularityScore, trendHistory[]}. Competition must be "Low" or "Medium".`;
    const res = await callGroq(prompt, dynamicApiKey, "You are an expert market analyst.");
    return JSON.parse(res).trends;
  } catch (error) {
    handleApiError(error, "Daily Trends");
    return generateRandomTrends(6, 'general');
  }
};

export const fetchMonthlyTrends = async (): Promise<Trend[]> => {
  if (!hasSystemKey()) return generateRandomTrends(3, 'general');
  try {
    const prompt = `Identify 6 major upcoming holidays or seasonal events for next 2 months. Return JSON { "trends": [] } matching the Trend interface.`;
    const res = await callGroq(prompt, dynamicApiKey);
    return JSON.parse(res).trends;
  } catch (error) {
    handleApiError(error, "Monthly Trends");
    return generateRandomTrends(3, 'general');
  }
};

export const fetchTShirtTrends = async (): Promise<Trend[]> => {
  if (!hasSystemKey()) return generateRandomTrends(6, 'tshirt');
  try {
    const prompt = `Identify 9 high-selling T-Shirt niches. Return JSON { "trends": [] } matching the Trend interface. Category should be one of: Typography, Vintage, Anime, Minimalist.`;
    const res = await callGroq(prompt, dynamicApiKey);
    return JSON.parse(res).trends;
  } catch (error) {
    handleApiError(error, "T-Shirt Trends");
    return generateRandomTrends(6, 'tshirt');
  }
};

export const fetchPngTrends = async (): Promise<Trend[]> => {
    if (!hasSystemKey()) return generateRandomTrends(6, 'png');
    try {
      const prompt = `Identify 9 isolated PNG asset niches (Objects, Food, Technology). Return JSON { "trends": [] }.`;
      const res = await callGroq(prompt, dynamicApiKey);
      return JSON.parse(res).trends;
    } catch (error) {
      handleApiError(error, "PNG Trends");
      return generateRandomTrends(6, 'png');
    }
};

// --- USER KEY FUNCTIONS ---

export const fetchNichesByCategory = async (category: string): Promise<Trend[]> => {
    const key = localStorage.getItem('user_prompt_api_key') || dynamicApiKey;
    try {
      const prompt = `Identify 9 trending niches for category: "${category}". Return JSON { "trends": [] }.`;
      const res = await callGroq(prompt, key);
      return JSON.parse(res).trends;
    } catch (error) {
      handleApiError(error, category);
      return generateRandomTrends(4);
    }
};

export const deepAnalyzeTopic = async (topic: string): Promise<DeepAnalysisResult | null> => {
  const key = localStorage.getItem('user_prompt_api_key') || dynamicApiKey;
  try {
    const prompt = `Deep analyze: "${topic}". Return JSON: {nichePath, searchVolume, difficulty, visualStyle, composition, suggestedPrompt, relatedKeywords[], lowCompetitionAlternatives: [{topic, score, reason}]}.`;
    const res = await callGroq(prompt, key);
    const data = JSON.parse(res);
    data.originalQuery = topic;
    return data;
  } catch (error) {
    handleApiError(error, "Deep Analysis");
    return null;
  }
};

export const compareNiches = async (topicA: string, topicB: string): Promise<NicheComparisonResult> => {
    const key = localStorage.getItem('user_prompt_api_key') || dynamicApiKey;
    try {
      const prompt = `Compare niches: "${topicA}" vs "${topicB}". Return JSON with winner, winnerReason, topicA: {name, score, pros[], cons[]}, topicB: {name, score, pros[], cons[]}.`;
      const res = await callGroq(prompt, key);
      return JSON.parse(res);
    } catch (error) {
      handleApiError(error, "Battle");
      throw error;
    }
};

export const generateImageMetadata = async (base64Data: string, mimeType: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
  // Llama 4 is text-only, so we'll try to use the filename or general context if passed from UI.
  // In the real app, we usually extract filename or describe the image first.
  return null; // For simplicity, we fallback to text-based analysis
};

export const generateMetadataFromFilename = async (filename: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
  const key = localStorage.getItem('user_metadata_api_key') || dynamicApiKey;
  try {
    const prompt = `Generate metadata for file: "${filename}". Title len: ${config.titleLength}. Desc: ${config.descLength}. Keywords: ${config.keywordCount}. Return JSON {title, description, keywords[]}.`;
    const res = await callGroq(prompt, key);
    return JSON.parse(res);
  } catch (error) {
    handleApiError(error, "Metadata");
    return null;
  }
};

export const generateBulkPrompts = async (topic: string, count: number, style: string, composition: string): Promise<string[]> => {
  const key = localStorage.getItem('user_prompt_api_key') || dynamicApiKey;
  try {
    const prompt = `Generate ${count} AI image prompts for: "${topic}". Style: ${style}. Comp: ${composition}. Return JSON { "prompts": [] }.`;
    const res = await callGroq(prompt, key);
    return JSON.parse(res).prompts || [];
  } catch (error) {
    handleApiError(error, "Prompts");
    return [];
  }
};
