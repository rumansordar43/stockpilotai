import React, { useState } from 'react';
import { Trend } from '../types';

interface TrendCardProps {
  trend: Trend;
  onClick: (trend: Trend) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

const TrendCard: React.FC<TrendCardProps> = ({ trend, onClick, isSaved, onToggleSave }) => {
  const [copied, setCopied] = useState(false);
  const isLowComp = trend.competition === 'Low';
  
  // Updated Color Mapping for Boy's Tech Aesthetics (Blue, Teal, Violet)
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

  return (
    <div 
      onClick={() => onClick(trend)}
      className="glass-panel glass-panel-hover group relative rounded-3xl p-8 cursor-pointer flex flex-col h-full overflow-hidden"
    >
      {/* Background Spotlight Gradient - Deep Teal/Blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      
      {/* 3D Depth Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

      {/* Header: Badges & Actions */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider border shadow-lg backdrop-blur-md ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}>
            {trend.category}
            </span>
            {/* Niche Badge - New Information */}
            <span className="px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider border border-slate-700/50 bg-slate-800/50 text-slate-300 shadow-lg backdrop-blur-md truncate max-w-[150px]">
            {trend.niche}
            </span>
        </div>
        
        {/* Save Button */}
        {onToggleSave && (
            <button
                onClick={handleSave}
                className={`p-2 rounded-xl transition-all duration-300 btn-3d border ${isSaved ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/50'}`}
                title={isSaved ? "Unsave" : "Save Trend"}
            >
                <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
        )}
      </div>

      {/* Topic Title */}
      <div className="flex justify-between items-start gap-4 mb-5 relative z-10">
          <h3 className="text-3xl font-display font-bold text-white leading-none tracking-tight group-hover:text-blue-300 transition-all drop-shadow-lg">
            {trend.topic}
          </h3>
          
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300 backdrop-blur-md btn-3d ${copied ? 'bg-teal-500/20 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]'}`}
            title="Copy Topic"
        >
            {copied ? (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
        </button>
      </div>
      
      {/* Dynamic Separator */}
      <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full mb-6 opacity-60 group-hover:w-full group-hover:opacity-100 transition-all duration-700 ease-out relative z-10 shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
      
      <div className="relative group/tooltip">
        <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-2 relative z-10 font-medium group-hover:text-slate-300 transition-colors">
            {trend.description}
        </p>
        
        {/* INFO TOOLTIP: Reveals detailed info on hover */}
        <div className="absolute left-0 bottom-full mb-2 w-64 p-4 bg-slate-900/90 border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-50 transform translate-y-2 group-hover/tooltip:translate-y-0">
             <div className="text-xs text-slate-300 font-medium leading-relaxed mb-2">
                {trend.description}
             </div>
             <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                Potential: {trend.potentialEarnings}
             </div>
        </div>
        <div className="absolute top-0 right-0 -mt-1 -mr-1 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>
      
      {/* Expanded Data Footer */}
      <div className="mt-auto grid grid-cols-2 gap-4 pt-5 border-t border-white/5 relative z-10 group-hover:border-white/10 transition-colors">
        
        {/* Earnings */}
        <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Potential</span>
            <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                {trend.potentialEarnings}
                <span className={`inline-block w-2 h-2 rounded-full ${trend.potentialEarnings.includes('High') ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`}></span>
            </span>
        </div>

        {/* Competition Level */}
        <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Competition</span>
             <span className={`text-xs font-bold tracking-wide ${isLowComp ? 'text-teal-400' : 'text-orange-400'}`}>
                {trend.competition} Level
            </span>
        </div>

        {/* Demand Score Bar */}
        <div className="flex flex-col col-span-2 mt-1">
             <div className="flex justify-between items-end mb-1.5">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Market Demand</span>
                 <span className="text-xs font-bold text-blue-400">{trend.popularityScore}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                    style={{ width: `${trend.popularityScore}%` }}
                ></div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TrendCard;