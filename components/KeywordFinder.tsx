import React, { useState, useEffect, useRef } from 'react';
import { DeepAnalysisResult, AppView } from '../types';
import { deepAnalyzeTopic } from '../services/geminiService';

interface KeywordFinderProps {
    onBack?: () => void;
    onNav?: (view: AppView) => void;
}

// Popular keywords for suggestions
const POPULAR_KEYWORDS = [
    "Business Meeting", "Remote Work", "Cyberpunk City", "Minimalist Interior", 
    "Sustainable Living", "Electric Vehicle", "Healthy Food", "Yoga Practice",
    "Digital Nomad", "Artificial Intelligence", "Crypto Currency", "Smart Home",
    "Drone Photography", "Senior Lifestyle", "Diversity & Inclusion", "Green Energy",
    "Mental Health", "Abstract Background", "Texture Pattern", "Virtual Reality",
    "Coffee Culture", "Travel Adventure", "Family Moments", "Pet Care", "Fitness Gym",
    "Education Online", "Medical Technology", "Autumn Vibes", "Christmas Holiday",
    "Vector Icon Set", "Watercolor Flower", "Neon Sign", "Street Food"
];

const ASSET_TYPES = ["All Assets", "Photos", "Vectors", "AI Art", "Videos"];

const KeywordFinder: React.FC<KeywordFinderProps> = ({ onNav }) => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<DeepAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResultPage, setShowResultPage] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Suggestion & Filter State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [assetType, setAssetType] = useState("All Assets");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setTopic(val);
      if (val.length > 1) {
          const filtered = POPULAR_KEYWORDS.filter(k => k.toLowerCase().includes(val.toLowerCase()));
          setSuggestions(filtered.slice(0, 6));
          setShowSuggestions(filtered.length > 0);
      } else {
          setShowSuggestions(false);
      }
  };

  const selectSuggestion = (val: string) => {
      setTopic(val);
      setShowSuggestions(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true);
    setResult(null);
    setShowResultPage(false);
    setShowSuggestions(false);
    
    // Append asset type context if specific
    const query = assetType !== "All Assets" ? `${topic} (${assetType})` : topic;

    try {
        const data = await deepAnalyzeTopic(query);
        setResult(data);
        setLoading(false);
        if (data) {
            setShowResultPage(true);
        }
    } catch (error: any) {
        setLoading(false);
        if (error.message === 'MISSING_API_KEY' && onNav) {
            onNav(AppView.SETTINGS);
        }
    }
  };

  const closeResult = () => {
      setShowResultPage(false);
      setTopic('');
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper to determine graph percentage based on text
  const getPercentage = (val: string) => {
      const v = val.toLowerCase();
      if (v.includes('very high')) return 95;
      if (v.includes('high')) return 80;
      if (v.includes('medium')) return 50;
      if (v.includes('low')) return 20;
      return 50; // Default
  };

  const getDifficultyColor = (val: string) => {
      const v = val.toLowerCase();
      if (v.includes('high') || v.includes('hard')) return 'text-red-400 border-red-500/50 from-red-500/20';
      if (v.includes('medium')) return 'text-yellow-400 border-yellow-500/50 from-yellow-500/20';
      return 'text-green-400 border-green-500/50 from-green-500/20';
  };

  return (
    <div className="w-full relative z-30" ref={wrapperRef}>
      {/* 1. INITIAL SEARCH BAR */}
      <div className={`transition-all duration-500 ${showResultPage ? 'opacity-0 pointer-events-none absolute top-0 w-full' : 'opacity-100 relative'}`}>
         <div className="max-w-4xl mx-auto w-full mb-16 animate-fade-in-up">
            <div className="glass-panel p-2 rounded-2xl md:rounded-full border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 relative z-20">
                    
                    {/* Filter Dropdown */}
                    <div className="relative md:border-r border-white/10 md:min-w-[140px]">
                        <select 
                            value={assetType}
                            onChange={(e) => setAssetType(e.target.value)}
                            className="w-full h-full bg-transparent text-slate-300 font-bold text-sm px-6 py-4 appearance-none focus:outline-none cursor-pointer hover:text-white"
                        >
                            {ASSET_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                        </select>
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    <div className="flex-grow relative">
                        <input 
                            type="text" 
                            value={topic}
                            onChange={handleInputChange}
                            placeholder="Enter a Microstock Topic..."
                            className="w-full bg-transparent border-none rounded-full px-4 py-4 text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-0"
                            autoComplete="off"
                        />
                        {/* Real-time Suggestions Dropdown */}
                        {showSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
                                {suggestions.map((s, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => selectSuggestion(s)}
                                        className="px-6 py-3 text-slate-300 hover:text-white hover:bg-blue-600/20 cursor-pointer transition-colors border-b border-white/5 last:border-0 flex items-center gap-3"
                                    >
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-8 py-4 rounded-xl md:rounded-full font-bold text-lg transition-all shadow-lg flex items-center justify-center min-w-[160px] relative z-20"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                            <span className="mr-2">Research</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
      </div>

      {/* 2. ANALYSIS RESULT PAGE (Full Overlay) */}
      {result && showResultPage && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#020617] animate-fade-in custom-scrollbar">
            <div className="min-h-screen pb-20">
                {/* Header / Nav */}
                <div className="sticky top-0 z-50 glass-panel border-b border-white/10 backdrop-blur-xl px-6 py-4 flex justify-between items-center shadow-2xl">
                    <div className="flex items-center gap-4">
                        <button onClick={closeResult} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div>
                             <h2 className="text-2xl font-display font-bold text-white capitalize leading-none">{result.originalQuery}</h2>
                             <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase">Deep Market Analysis</span>
                        </div>
                    </div>
                    <button onClick={closeResult} className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5">CLOSE REPORT</button>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                    
                    {/* SECTION 1: KEY METRICS (Volume, Difficulty, Niche) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* 1. Monthly Search Volume */}
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Volume</h3>
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
                            </div>
                            <div className="mb-2">
                                <p className="text-3xl font-display font-bold text-white">{result.searchVolume}</p>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${getPercentage(result.searchVolume)}%` }}></div>
                            </div>
                        </div>

                        {/* 2. Difficulty Level */}
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                             <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty</h3>
                                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div className="mb-2">
                                <p className={`text-3xl font-display font-bold ${getDifficultyColor(result.difficulty).split(' ')[0]}`}>{result.difficulty}</p>
                            </div>
                             <div className="w-full bg-slate-800 rounded-full h-2">
                                <div className={`h-2 rounded-full bg-gradient-to-r ${getDifficultyColor(result.difficulty).replace('text-', 'from-').replace('border-', 'to-').replace('/50','').replace('/20', '')}`} style={{ width: `${getPercentage(result.difficulty)}%` }}></div>
                            </div>
                        </div>

                        {/* 3. Niche Category */}
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Niche Path</h3>
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white leading-tight mb-2">
                                    {result.nichePath.split('>').pop()?.trim()}
                                </p>
                                <p className="text-xs text-slate-400 font-mono">{result.nichePath}</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: GENERATED LOW COMPETITION IDEAS (Core Request) */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Generated Low Competition Ideas</h3>
                                <p className="text-slate-400 text-sm">Profitable sub-niches derived from "{result.originalQuery}"</p>
                            </div>
                        </div>

                        {result.lowCompetitionAlternatives && result.lowCompetitionAlternatives.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {result.lowCompetitionAlternatives.map((idea, idx) => (
                                    <div key={idx} className="glass-panel p-6 rounded-2xl border border-teal-500/20 hover:border-teal-500/50 transition-all group hover:-translate-y-1 duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-teal-500/10 text-teal-400 text-[10px] font-bold px-2 py-1 rounded border border-teal-500/20">
                                                SCORE: {idea.score}
                                            </span>
                                            <button 
                                                onClick={() => copyToClipboard(idea.topic, `idea-${idx}`)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-teal-500 hover:text-white text-slate-400 transition-colors"
                                                title="Copy Idea"
                                            >
                                                {copiedField === `idea-${idx}` ? (
                                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                ) : (
                                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                )}
                                            </button>
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-3 leading-snug">{idea.topic}</h4>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full mb-3 overflow-hidden">
                                            <div className="h-full bg-teal-500" style={{ width: `${idea.score}%` }}></div>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                                            {idea.reason}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-slate-500">
                                No specific low competition variations found. Try a broader keyword.
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: VISUAL DETAILS & PROMPT */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Visual Style Card */}
                        <div className="glass-panel p-6 rounded-3xl border border-white/5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Recommended Style</h4>
                            <div className="text-white font-medium leading-relaxed mb-4">{result.visualStyle}</div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-6">Composition</h4>
                            <div className="text-white font-medium leading-relaxed">{result.composition}</div>
                        </div>

                        {/* Master Prompt Card */}
                        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-blue-500/20 bg-blue-900/10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-2xl">🎨</span> AI Master Prompt
                                </h3>
                                <button 
                                    onClick={() => copyToClipboard(result.suggestedPrompt, 'prompt')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg ${copiedField === 'prompt' ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                                >
                                    {copiedField === 'prompt' ? 'COPIED' : 'COPY PROMPT'}
                                </button>
                            </div>
                            <div className="bg-black/30 p-5 rounded-xl border border-white/5 font-mono text-sm text-slate-300 leading-relaxed">
                                {result.suggestedPrompt}
                            </div>
                            
                            <div className="mt-6">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Related Keywords</div>
                                <div className="flex flex-wrap gap-2">
                                    {result.relatedKeywords.map((k, i) => (
                                        <span key={i} className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-800 text-slate-400 border border-white/5">
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default KeywordFinder;