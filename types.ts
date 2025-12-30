
export interface Trend {
  id: string;
  topic: string;
  niche: string;
  competition: 'Low' | 'Medium' | 'High';
  description: string;
  potentialEarnings: string;
  category: 'Trending' | 'Low Competition' | 'Seasonal' | 'Evergreen' | string; // string allows for Month names
  popularityScore: number; // 0-100 representing current demand
  trendHistory: number[]; // Array of last 7 days popularity for graph
}

export interface KeywordData {
  keyword: string;
  searchVolume: string; // e.g., "High", "10k+"
  competition: string;
}

export interface LowCompIdea {
  topic: string;
  score: number; // 1-100 opportunity score
  reason: string;
}

export interface DeepAnalysisResult {
  originalQuery: string;
  nichePath: string; // e.g. "Technology > AI > Abstract"
  searchVolume: string;
  difficulty: string;
  visualStyle: string; // e.g. "Cinematic lighting, Bokeh background"
  composition: string; // e.g. "Rule of thirds, centered"
  suggestedPrompt: string;
  relatedKeywords: string[];
  lowCompetitionAlternatives: LowCompIdea[];
}

export interface NicheComparisonResult {
  winner: string;
  winnerReason: string;
  topicA: {
    name: string;
    score: number;
    pros: string[];
    cons: string[];
  };
  topicB: {
    name: string;
    score: number;
    pros: string[];
    cons: string[];
  };
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  keywords: string[];
}

export interface GeneratedPrompt {
  prompt: string;
  category: string;
}

// BULK METADATA TYPES
export interface MetadataConfig {
    platform: string;
    titleLength: number; 
    descLength: number;
    keywordCount: number;
    imageType: 'None' | 'Photo' | 'Vector' | 'Illustration';
    prefix: { enabled: boolean; value: string };
    suffix: { enabled: boolean; value: string };
    negativeTitle: { enabled: boolean; value: string };
    negativeKeywords: { enabled: boolean; value: string };
}

export interface MetadataBatchItem {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'completed' | 'error';
    previewUrl?: string; // For images
    metadata?: GeneratedMetadata;
    errorMsg?: string;
    sizeInfo?: string;
}

// SCRIPTS TYPE
export interface ScriptItem {
  id: string;
  title: string;
  description?: string;
  category: 'Illustrator' | 'Photoshop' | 'Python' | 'Other'; 
  version: string;
  downloadUrl: string;
  imageUrls: string[]; // Array of image URLs to display
  instructions?: string;
}

// USER & AUTH TYPES
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Stored for admin view as requested
  apiKey?: string; // User's personal API key
  joinedDate: string;
  role: 'admin' | 'user';
}

export enum AppView {
  AUTH = 'AUTH',
  ADMIN = 'ADMIN',
  DASHBOARD = 'DASHBOARD',
  DETAIL = 'DETAIL',
  KEYWORDS = 'KEYWORDS',
  PROMPTS = 'PROMPTS',
  METADATA = 'METADATA',
  TSHIRTS = 'TSHIRTS',
  PNG_STUDIO = 'PNG_STUDIO',
  MODEL_RELEASE = 'MODEL_RELEASE',
  NICHE_BATTLE = 'NICHE_BATTLE',
  PORTFOLIO = 'PORTFOLIO',
  NICHE_EXPLORER = 'NICHE_EXPLORER',
  SCRIPTS = 'SCRIPTS',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS',
  SETTINGS = 'SETTINGS',
}

export interface LoadingState {
  status: boolean;
  message: string;
}
