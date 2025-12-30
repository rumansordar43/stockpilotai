import React, { useState } from 'react';
import { Trend, AppView } from '../types';
import TrendCard from './TrendCard';
import { generateBulkPrompts } from '../services/geminiService';

interface TShirtStudioProps {
  trends: Trend[];
  onTrendClick: (trend: Trend) => void;
  savedTrends?: Set<string>;
  onToggleSave?: (id: string) => void;
  onNav: (view: AppView) => void;
}

const STYLES = [
  'All', 
  'Vector', 
  'Typography', 
  'Vintage', 
  'Minimalist', 
  'Graffiti', 
  'Anime', 
  'Pixel Art', 
  'Pop Art', 
  'Line Art',
  'Cyberpunk',
  'Watercolor',
  'Sticker Art'
];

const TShirtStudio: React.FC<TShirtStudioProps> = ({ trends, onTrendClick, savedTrends, onToggleSave, onNav }) => {
  const [activeStyle, setActiveStyle] = useState('All');
  const [quickPrompts, setQuickPrompts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [copyStatus, setCopyStatus] = useState<number | null>(null);

  const filteredTrends = activeStyle === 'All' 
    ? trends 
    : trends.filter(t => t.category === activeStyle);

  const handleQuickGenerate = async () => {
    setIsGenerating(true);
    let topic = activeStyle === 'All' ? 'Trending Print-on-Demand T-Shirt Design' : `${activeStyle} T-Shirt Design`;
    
    // Enhance topic for Typography
    if (activeStyle === 'Typography') {
        topic = "Text-based T-Shirt Design with catchy quote and creative typography";
    }

    const styleParam = activeStyle === 'All' ? 'Auto' : activeStyle;
    
    // Generate 10 prompts with Auto composition
    try {
        const results = await generateBulkPrompts(topic, 10, styleParam, 'Auto');
        if (results.length > 0) {
            setQuickPrompts(results);
            setShowResults(true);
        }
    } catch (error: any) {
         if (error.message === 'MISSING_API_KEY') {
             if (onNav) onNav(AppView.SETTINGS);
         }
    } finally {
        setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(idx);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const downloadTxt = () => {
    const content = quickPrompts.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quick_${activeStyle.toLowerCase().replace(/\s+/g, '_')}_ideas.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeResults = () => {
    setShowResults(false);
    setQuickPrompts([]);
  };

  return (
    <div className="w-full animate-fade-in-up pb-20 relative">
       {/* Studio Header */}
       <div className="text-center mb-12 relative perspective-container">
          <div className="inline-block p-6 rounded-3xl bg-slate-900/50 border border-blue-500/30 mb-8 shadow-[0_0_80px_rgba(37,99,235,0.2)] animate-float backdrop-blur-md">
             <svg className="w-14 h-14 text-blue-400 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight">
             T-Shirt Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 drop-shadow-[0_0_20px_rgba(45,212,191,0.3)]">Studio</span>
          </h1>
          <p className="text-slate-300 max-w-xl mx-auto text-lg font-light tracking-wide">
             Engineered for Merch by Amazon & Redbubble dominance.
          </p>
       </div>

       {/* Controls Section: Style Filter & Quick Generate */}
       <div className="max-w-xl mx-auto mb-16 space-y-4 relative z-20">
          <div className="glass-panel p-2 rounded-2xl flex flex-col sm:flex-row gap-2 border border-white/10 shadow-2xl">
             {/* Style Dropdown */}
             <div className="relative flex-grow">
                <select 
                    value={activeStyle}
                    onChange={(e) => setActiveStyle(e.target.value)}
                    className="w-full h-full bg-slate-900/50 text-white font-bold px-6 py-4 rounded-xl border border-white/5 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-800/50 transition-colors"
                >
                    {STYLES.map(style => (
                        <option key={style} value={style}>{style} Style</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
             </div>
             
             {/* Quick Generate Button */}
             <button 
                onClick={handleQuickGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed btn-3d"
             >
                {isGenerating ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Drafting...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span>Quick Generate</span>
                    </>
                )}
             </button>
          </div>
          <div className="text-center">
             <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                 {activeStyle === 'All' ? 'Showing All Trends' : `Filtering by ${activeStyle}`}
             </span>
          </div>
       </div>

       {/* Designs Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 perspective-1000">
          {filteredTrends.length > 0 ? (
              filteredTrends.map((trend, idx) => (
                <div key={trend.id} style={{ animationDelay: `${idx * 0.1}s` }} className="animate-fade-in-up">
                    <TrendCard 
                        trend={trend} 
                        onClick={onTrendClick}
                        isSaved={savedTrends?.has(trend.id)}
                        onToggleSave={onToggleSave}
                    />
                </div>
              ))
          ) : (
             <div className="col-span-full text-center py-20">
                 <p className="text-slate-500 text-lg">No trends found for this style.</p>
                 <button onClick={() => setActiveStyle('All')} className="text-blue-400 hover:text-white mt-2 font-bold">View All</button>
             </div>
          )}
       </div>

       {/* Quick Results Modal */}
       {showResults && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
             <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
                 
                 {/* Header */}
                 <div className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                     <div>
                         <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-blue-400">⚡</span> Quick Drafts
                         </h3>
                         <p className="text-xs text-slate-400 mt-1">
                             {activeStyle} Style • 10 Ideas generated
                         </p>
                     </div>
                     <button onClick={closeResults} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                         <svg className="w-6 h-6 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                 </div>

                 {/* Results List */}
                 <div className="overflow-y-auto p-6 space-y-3 custom-scrollbar">
                     {quickPrompts.map((prompt, idx) => (
                         <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors group flex gap-4 items-start">
                             <span className="text-slate-500 font-mono text-xs pt-1 select-none">{(idx + 1).toString().padStart(2, '0')}</span>
                             <p className="text-slate-200 text-sm leading-relaxed flex-grow">{prompt}</p>
                             <button 
                                onClick={() => copyToClipboard(prompt, idx)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                                title="Copy"
                             >
                                 {copyStatus === idx ? (
                                     <span className="text-green-400 text-xs font-bold">✓</span>
                                 ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                 )}
                             </button>
                         </div>
                     ))}
                 </div>
                 
                 {/* Footer */}
                 <div className="p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-md flex justify-between items-center px-6">
                     <button 
                        onClick={downloadTxt} 
                        className="text-sm font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2 hover:bg-white/5 px-4 py-2 rounded-lg"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download TXT
                     </button>
                     <button onClick={closeResults} className="text-sm font-bold text-blue-400 hover:text-white transition-colors px-4 py-2">
                         Close Panel
                     </button>
                 </div>
             </div>
         </div>
       )}
    </div>
  );
};

export default TShirtStudio;