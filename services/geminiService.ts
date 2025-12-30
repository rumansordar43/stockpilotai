
import { GoogleGenAI, Type } from "@google/genai";
import { Trend, DeepAnalysisResult, GeneratedMetadata, NicheComparisonResult, MetadataConfig } from "../types";

// The app will prioritize the User's API key stored in localStorage
const getClient = () => {
  const userKey = localStorage.getItem('user_api_key');
  // Fallback to process.env.API_KEY if user hasn't provided one
  const apiKey = userKey || process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

export const setDynamicApiKey = (key: string) => {
  localStorage.setItem('user_api_key', key);
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

const hasApiKey = (): boolean => {
    return !!(process.env.API_KEY || localStorage.getItem('user_api_key'));
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
    const msg = error?.message || "Unknown API Error";
    
    // Specific check for Rate Limit / Quota Exceeded
    if (msg.toLowerCase().includes("429") || msg.toLowerCase().includes("quota")) {
        notifyError("Your API key limit is reached. Please change or update your API key in Settings.");
    } else if (msg.toLowerCase().includes("api key not valid")) {
        notifyError("Invalid API Key. Please check your settings.");
    } else {
        notifyError(`Gemini Error: ${msg.substring(0, 50)}...`);
    }
};

// --- API ACTIONS ---

export const fetchDailyTrends = async (): Promise<Trend[]> => {
  if (!hasApiKey()) return generateRandomTrends(6, 'general');
  const client = getClient();
  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Identify 9 diverse and profitable microstock niches. Provide a balanced mix of commercial and editorial topics.',
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
                },
                required: ["id", "topic", "niche", "competition", "category", "description", "potentialEarnings", "popularityScore", "trendHistory"]
              }
            }
          }
        }
      }
    });
    const data = JSON.parse(response.text || '{}');
    return data.trends || generateRandomTrends(6);
  } catch (error) {
    handleApiError(error, "Daily Trends");
    return generateRandomTrends(6, 'general');
  }
};

export const regenerateTrend = async (currentTrend: Trend): Promise<Trend | null> => {
    if (!hasApiKey()) {
        notifyError("Please add your API key in Settings to regenerate ideas.");
        return null;
    }
    const client = getClient();
    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate one unique, high-profit microstock niche idea for the category: "${currentTrend.category}". It should be a fresh alternative to "${currentTrend.topic}" in the "${currentTrend.niche}" segment.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        trend: {
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
        });
        const data = JSON.parse(response.text || '{}');
        return data.trend || null;
    } catch (error) {
        handleApiError(error, "Regenerate Card");
        return null;
    }
};

export const fetchMonthlyTrends = async (): Promise<Trend[]> => {
  if (!hasApiKey()) return generateRandomTrends(3, 'general');
  const client = getClient();
  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Identify 6 major upcoming holidays or seasonal events for the next 60 days.',
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
    const data = JSON.parse(response.text || '{}');
    return data.trends || generateRandomTrends(3);
  } catch (error) {
    handleApiError(error, "Monthly Trends");
    return generateRandomTrends(3, 'general');
  }
};

export const fetchTShirtTrends = async (): Promise<Trend[]> => {
  if (!hasApiKey()) return generateRandomTrends(6, 'tshirt');
  const client = getClient();
  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Identify 9 high-selling T-Shirt niches for Print on Demand.',
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
    const data = JSON.parse(response.text || '{}');
    return data.trends || generateRandomTrends(6, 'tshirt');
  } catch (error) {
    handleApiError(error, "T-Shirt Trends");
    return generateRandomTrends(6, 'tshirt');
  }
};

export const fetchPngTrends = async (): Promise<Trend[]> => {
    if (!hasApiKey()) return generateRandomTrends(6, 'png');
    const client = getClient();
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Identify 9 isolated PNG asset niches that are currently trending.',
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
      const data = JSON.parse(response.text || '{}');
      return data.trends || generateRandomTrends(6, 'png');
    } catch (error) {
      handleApiError(error, "PNG Trends");
      return generateRandomTrends(6, 'png');
    }
};

export const fetchNichesByCategory = async (category: string): Promise<Trend[]> => {
    const client = getClient();
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Identify 9 trending niches for the microstock category: "${category}".`,
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
      const data = JSON.parse(response.text || '{}');
      return data.trends || [];
    } catch (error) {
      handleApiError(error, category);
      return generateRandomTrends(4);
    }
};

export const deepAnalyzeTopic = async (topic: string): Promise<DeepAnalysisResult | null> => {
  const client = getClient();
  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
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
          }
        }
      }
    });
    const data = JSON.parse(response.text || '{}') as DeepAnalysisResult;
    data.originalQuery = topic;
    return data;
  } catch (error) {
    handleApiError(error, "Deep Analysis");
    return null;
  }
};

export const compareNiches = async (topicA: string, topicB: string): Promise<NicheComparisonResult> => {
    const client = getClient();
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Compare these two microstock niches: "${topicA}" vs "${topicB}".`,
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
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      handleApiError(error, "Battle");
      throw error;
    }
};

export const generateMetadataFromFilename = async (filename: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
  const client = getClient();
  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate commercial microstock metadata for a file named: "${filename}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    handleApiError(error, "Metadata");
    return null;
  }
};

export const generateImageMetadata = async (base64Data: string, mimeType: string, config: MetadataConfig): Promise<GeneratedMetadata | null> => {
    const client = getClient();
    try {
        const imagePart = {
            inlineData: {
                data: base64Data.split(',')[1] || base64Data,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: `Analyze this image for commercial microstock use. Provide Title, Description, and ${config.keywordCount} Keywords.`,
        };
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        handleApiError(error, "Image Analysis");
        return null;
    }
};

export const generateSinglePrompt = async (topic: string, style: string, composition: string): Promise<string> => {
  const client = getClient();
  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate one professional AI image prompt for: "${topic}". Style: ${style}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING }
          }
        }
      }
    });
    const data = JSON.parse(response.text || '{}');
    return data.prompt || "";
  } catch (error) {
    throw error;
  }
};

export const generateBulkPrompts = async (topic: string, count: number, style: string, composition: string): Promise<string[]> => {
    const client = getClient();
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate ${count} unique AI image prompts for: "${topic}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prompts: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      return data.prompts || [];
    } catch (error) {
      handleApiError(error, "Bulk Prompts");
      return [];
    }
};
