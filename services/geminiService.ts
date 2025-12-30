
import { GoogleGenAI, Type } from "@google/genai";
import { Trend, DeepAnalysisResult, GeneratedMetadata, NicheComparisonResult, MetadataConfig } from "../types";

// Always use process.env.API_KEY as per guidelines.
// Keeping dynamic key infrastructure to avoid breaking UI components that rely on it, 
// but Gemini client will prioritize process.env.API_KEY.
let dynamicApiKey = localStorage.getItem('system_api_key') || '';

export const setDynamicApiKey = (key: string) => {
  dynamicApiKey = key;
  localStorage.setItem('system_api_key', key);
};

// Use a helper to instantiate GoogleGenAI with the current best key
const getAI = () => {
  const apiKey = process.env.API_KEY || dynamicApiKey;
  return new GoogleGenAI({ apiKey: apiKey || "" });
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
    return !!((process.env.API_KEY && process.env.API_KEY.length > 5) || (dynamicApiKey && dynamicApiKey.length > 5));
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
    const msg = error?.message || "Unknown Error";
    notifyError(`Gemini Error (${context}): ${msg.substring(0, 60)}...`);
};

// --- DATA FETCHERS ---

// Fetch Daily Trends using gemini-3-pro-preview for market analysis
export const fetchDailyTrends = async (): Promise<Trend[]> => {
  if (!hasSystemKey()) return generateRandomTrends(6, 'general');
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: "Identify 9 diverse and profitable microstock niches currently trending. Return a list of trends with market details.",
      config: {
        systemInstruction: "You are a professional microstock market analyst. Return a JSON object with a 'trends' array. Trend interface: {id, topic, niche, competition (Low/Medium), category, description, potentialEarnings, popularityScore (0-100), trendHistory (array of 7 numbers representing demand over last 7 days)}.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  niche: { type: Type.STRING },
                  competition: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  potentialEarnings: { type: Type.STRING },
                  popularityScore: { type: Type.NUMBER },
                  trendHistory: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                },
                required: ["id", "topic", "niche", "competition", "category", "description", "potentialEarnings", "popularityScore", "trendHistory"]
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}").trends || [];
  } catch (error) {
    handleApiError(error, "Daily Trends");
    return generateRandomTrends(6, 'general');
  }
};

// Fetch Monthly/Seasonal Trends
export const fetchMonthlyTrends = async (): Promise<Trend[]> => {
  if (!hasSystemKey()) return generateRandomTrends(3, 'general');
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: "Identify 6 major upcoming seasonal holidays or events for the next 60 days relevant to microstock contributors.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  niche: { type: Type.STRING },
                  competition: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  potentialEarnings: { type: Type.STRING },
                  popularityScore: { type: Type.NUMBER },
                  trendHistory: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}").trends || [];
  } catch (error) {
    handleApiError(error, "Monthly Trends");
    return generateRandomTrends(3, 'general');
  }
};

// Fetch T-Shirt Specific Trends
export const fetchTShirtTrends = async (): Promise<Trend[]> => {
  if (!hasSystemKey()) return generateRandomTrends(6, 'tshirt');
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: "Identify 9 high-selling T-Shirt niches for Print-on-Demand. Consider styles like Typography, Vintage, Minimalist.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  niche: { type: Type.STRING },
                  competition: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  potentialEarnings: { type: Type.STRING },
                  popularityScore: { type: Type.NUMBER },
                  trendHistory: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}").trends || [];
  } catch (error) {
    handleApiError(error, "T-Shirt Trends");
    return generateRandomTrends(6, 'tshirt');
  }
};

// Fetch PNG Asset Trends
export const fetchPngTrends = async (): Promise<Trend[]> => {
    if (!hasSystemKey()) return generateRandomTrends(6, 'png');
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: "Identify 9 high-demand isolated PNG asset niches (Objects, Food, Textures).",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trends: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    niche: { type: Type.STRING },
                    competition: { type: Type.STRING },
                    category: { type: Type.STRING },
                    description: { type: Type.STRING },
                    potentialEarnings: { type: Type.STRING },
                    popularityScore: { type: Type.NUMBER },
                    trendHistory: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}").trends || [];
    } catch (error) {
      handleApiError(error, "PNG Trends");
      return generateRandomTrends(6, 'png');
    }
};

// Fetch niches by category
export const fetchNichesByCategory = async (category: string): Promise<Trend[]> => {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Identify 9 profitable trending niches for the following microstock category: "${category}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trends: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    niche: { type: Type.STRING },
                    competition: { type: Type.STRING },
                    category: { type: Type.STRING },
                    description: { type: Type.STRING },
                    potentialEarnings: { type: Type.STRING },
                    popularityScore: { type: Type.NUMBER },
                    trendHistory: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}").trends || [];
    } catch (error) {
      handleApiError(error, category);
      return generateRandomTrends(4);
    }
};

// Deep analysis for keyword finding
export const deepAnalyzeTopic = async (topic: string): Promise<DeepAnalysisResult | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a deep market analysis for the microstock topic: "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
                }
              }
            }
          },
          required: ["nichePath", "searchVolume", "difficulty", "visualStyle", "composition", "suggestedPrompt", "relatedKeywords", "lowCompetitionAlternatives"]
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    data.originalQuery = topic;
    return data;
  } catch (error) {
    handleApiError(error, "Deep Analysis");
    return null;
  }
};

// Comparison tool for battle arena
export const compareNiches = async (topicA: string, topicB: string): Promise<NicheComparisonResult> => {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Compare microstock niche A: "${topicA}" against niche B: "${topicB}". Decide which is more profitable for a new contributor.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
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
                }
              },
              topicB: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            required: ["winner", "winnerReason", "topicA", "topicB"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      handleApiError(error, "Battle");
      throw error;
    }
};

// Metadata generation from filename analysis
export const generateMetadataFromFilename = async (filename: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate commercial microstock title, description, and keywords for a file with the name: "${filename}". Title style: ${config.titleLength}. Return ${config.keywordCount} keywords.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "description", "keywords"]
            }
        }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    handleApiError(error, "Metadata");
    return null;
  }
};

// Fix: Add missing generateImageMetadata export for visual analysis
export const generateImageMetadata = async (base64Data: string, mimeType: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
    const ai = getAI();
    try {
        const data = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: `Analyze this image for commercial microstock suitability. Generate a professional title (${config.titleLength}), a comprehensive description, and exactly ${config.keywordCount} relevant keywords for search optimization.` }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title", "description", "keywords"]
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        handleApiError(error, "Image Metadata");
        return null;
    }
};

// Sequential prompt generation helper
export const generateSinglePrompt = async (topic: string, style: string, composition: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Generate one high-quality, commercial AI image prompt for: "${topic}". Style: ${style}. Composition: ${composition}. Focus on high artistic and commercial standards.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    prompt: { type: Type.STRING }
                },
                required: ["prompt"]
            }
        }
    });
    return JSON.parse(response.text || "{}").prompt || "";
  } catch (error) {
    handleApiError(error, "Single Prompt");
    return "";
  }
};

// Fix: Add missing generateBulkPrompts export for creating batches of prompts
export const generateBulkPrompts = async (topic: string, count: number, style: string, composition: string): Promise<string[]> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Generate a list of ${count} unique, high-quality, commercial-grade AI image generation prompts for: "${topic}". Style: ${style}. Composition: ${composition}. Ensure creative variety across the prompts.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        prompts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["prompts"]
                }
            }
        });
        const data = JSON.parse(response.text || "{}");
        return data.prompts || [];
    } catch (error) {
        handleApiError(error, "Bulk Prompts");
        return [];
    }
};
