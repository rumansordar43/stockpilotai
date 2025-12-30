
import React, { useState } from 'react';
import { Trend } from '../types';

interface TrendCardProps {
  trend: Trend;
  onClick: (trend: Trend) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onRegenerate?: (trend: Trend) => Promise<void>;
}

const TrendCard: React.FC<TrendCardProps> = ({ trend, onClick, isSaved, onToggleSave, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const isLowComp = trend.competition === 'Low';
  
  const categoryConfig = 
    trend.category === 'Seasonal' ? 
      { bg: 'bg-indigo-950/50', text: 'text-indigo-300', border: 'border-indigo-500/30', shadow: 'shadow-indigo-900/20' } :
    trend.category === 'Low Competition' ? 
      { bg: 'bg-teal-950/50', text: 'text-teal-300', border: 'border-teal-500/30', shadow: 'shadow-teal-900/20' } :
      { bg: 'bg-blue-950/50', text: 'text-blue-300', border: 'border-blue-500/30', shadow: 'shadow-blue-900/20' };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    navigator.clipboard.writeText(trend.topic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) onToggleSave(trend.id);
  };

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRegenerate || isRegenerating) return;
    setIsRegenerating(true);
    await onRegenerate(trend);
    setIsRegenerating(false);
  };

  return (
    <div 
      onClick={() => onClick(trend)}
      className="glass-panel glass-panel-hover group relative rounded-3xl p-8 cursor-pointer flex flex-col h-full overflow-hidden border border-white/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider border shadow-lg backdrop-blur-md ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}>
            {trend.category}
            </span>
            <span className="px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider border border-slate-700/50 bg-slate-800/50 text-slate-300 shadow-lg backdrop-blur-md truncate max-w-[150px]">
            {trend.niche}
            </span>
        </div>
        
        <div className="flex gap-2">
            {/* Regenerate Button */}
            {onRegenerate && (
                <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className={`p-2 rounded-xl transition-all duration-300 border bg-white/5 border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 ${isRegenerating ? 'animate-spin opacity-50' : 'hover:scale-110'}`}
                    title="Regenerate this Idea"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            )}

            <button
                onClick={handleSave}
                className={`p-2 rounded-xl transition-all duration-300 border ${isSaved ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/50'}`}
                title={isSaved ? "Unsave" : "Save Trend"}
            >
                <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
        </div>
      </div>

      <div className="flex justify-between items-start gap-4 mb-5 relative z-10">
          <h3 className="text-2xl font-display font-bold text-white leading-none tracking-tight group-hover:text-blue-300 transition-all drop-shadow-lg">
            {trend.topic}
          </h3>
          
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300 backdrop-blur-md ${copied ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500'}`}
            title="Copy Topic"
        >
            {copied ? (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
        </button>
      </div>
      
      <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full mb-6 opacity-60 group-hover:w-full group-hover:opacity-100 transition-all duration-700 ease-out relative z-10 shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
      
      <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-2 relative z-10 font-medium group-hover:text-slate-300 transition-colors">
          {trend.description}
      </p>
      
      <div className="mt-auto grid grid-cols-2 gap-4 pt-5 border-t border-white/5 relative z-10 group-hover:border-white/10 transition-colors">
        <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Potential</span>
            <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                {trend.potentialEarnings}
            </span>
        </div>
        <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Competition</span>
             <span className={`text-xs font-bold tracking-wide ${isLowComp ? 'text-teal-400' : 'text-orange-400'}`}>
                {trend.competition}
            </span>
        </div>
        <div className="flex flex-col col-span-2 mt-1">
             <div className="flex justify-between items-end mb-1.5">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Demand</span>
                 <span className="text-xs font-bold text-blue-400">{trend.popularityScore}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-400" 
                    style={{ width: `${trend.popularityScore}%` }}
                ></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TrendCard;
