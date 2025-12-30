import React, { useState, useEffect } from 'react';
import { Trend, AppView } from '../types';
import TrendCard from './TrendCard';
import { generateBulkPrompts, fetchPngTrends } from '../services/geminiService';

interface PngStudioProps {
  onTrendClick: (trend: Trend) => void;
  savedTrends?: Set<string>;
  onToggleSave?: (id: string) => void;
  onNav: (view: AppView) => void;
}

const STYLES = [
  'All', 
  'Botanical', 
  'Objects', 
  'Food', 
  'Technology', 
  'Effects', 
  'Animals', 
  'Textures'
];

const PngStudio: React.FC<PngStudioProps> = ({ onTrendClick, savedTrends, onToggleSave, onNav }) => {
  const [activeStyle, setActiveStyle] = useState('All');
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [copyStatus, setCopyStatus] = useState<number | null>(null);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    setLoading(true);
    const data = await fetchPngTrends();
    setTrends(data);
    setLoading(false);
  };

  const filteredTrends = activeStyle === 'All' 
    ? trends 
    : trends.filter(t => t.category === activeStyle);

  const handleQuickGenerate = async () => {
    setIsGenerating(true);
    const topic = activeStyle === 'All' ? 'Trending Isolated PNG Asset' : `${activeStyle} Isolated Object`;
    const styleParam = `Isolated PNG - ${activeStyle === 'All' ? 'Auto' : activeStyle}`;
    
    try {
        // Generate 10 prompts
        const results = await generateBulkPrompts(topic, 10, styleParam, 'Isolated on White Background');
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
    a.download = `png_assets_${activeStyle.toLowerCase()}.txt`;
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
          <div className="inline-block p-6 rounded-3xl bg-slate-900/50 border border-orange-500/30 mb-8 shadow-[0_0_80px_rgba(249,115,22,0.2)] animate-float backdrop-blur-md">
             <svg className="w-14 h-14 text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight">
             PNG Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">Studio</span>
          </h1>
          <p className="text-slate-300 max-w-xl mx-auto text-lg font-light tracking-wide">
             High-demand isolated assets. Perfect cutouts. Zero background.
          </p>
       </div>

       {/* Controls */}
       <div className="max-w-xl mx-auto mb-16 space-y-4 relative z-20">
          <div className="glass-panel p-2 rounded-2xl flex flex-col sm:flex-row gap-2 border border-white/10 shadow-2xl">
             <div className="relative flex-grow">
                <select 
                    value={activeStyle}
                    onChange={(e) => setActiveStyle(e.target.value)}
                    className="w-full h-full bg-slate-900/50 text-white font-bold px-6 py-4 rounded-xl border border-white/5 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer hover:bg-slate-800/50 transition-colors"
                >
                    {STYLES.map(style => (
                        <option key={style} value={style}>{style} Assets</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
             </div>
             
             <button 
                onClick={handleQuickGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed btn-3d"
             >
                {isGenerating ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Mining...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        <span>Quick Generate</span>
                    </>
                )}
             </button>
          </div>
       </div>

       {/* Grid */}
       {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-96 bg-surface/50 animate-pulse rounded-3xl border border-border shadow-lg"></div>
                ))}
            </div>
       ) : (
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
                     <p className="text-slate-500 text-lg">No trends found.</p>
                 </div>
              )}
           </div>
       )}

       {/* Results Modal */}
       {showResults && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
             <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
                 
                 <div className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                     <div>
                         <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-orange-400">⚡</span> Isolated Asset Ideas
                         </h3>
                         <p className="text-xs text-slate-400 mt-1">
                             {activeStyle} • Ready for Isolation
                         </p>
                     </div>
                     <button onClick={closeResults} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                         <svg className="w-6 h-6 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                 </div>

                 <div className="overflow-y-auto p-6 space-y-3 custom-scrollbar">
                     {quickPrompts.map((prompt, idx) => (
                         <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors group flex gap-4 items-start">
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
                 
                 <div className="p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-md flex justify-between items-center px-6">
                     <button 
                        onClick={downloadTxt} 
                        className="text-sm font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2 hover:bg-white/5 px-4 py-2 rounded-lg"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download TXT
                     </button>
                 </div>
             </div>
         </div>
       )}
    </div>
  );
};

export default PngStudio;