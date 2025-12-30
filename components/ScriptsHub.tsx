
import React, { useState, useEffect } from 'react';
import { ScriptItem } from '../types';

const ScriptsHub: React.FC = () => {
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [selectedScript, setSelectedScript] = useState<ScriptItem | null>(null);

  useEffect(() => {
    // Load scripts managed by Admin
    const storedScripts = localStorage.getItem('system_scripts');
    if (storedScripts) {
        setScripts(JSON.parse(storedScripts));
    }
  }, []);

  const getCategoryColor = (cat: string) => {
      switch(cat) {
          case 'Illustrator': return 'bg-orange-600/20 text-orange-500 border border-orange-500/30';
          case 'Photoshop': return 'bg-blue-600/20 text-blue-500 border border-blue-500/30';
          case 'Python': return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30';
          default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
      }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-20 px-6 animate-fade-in-up">
      
      {/* Header */}
      {!selectedScript && (
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Automation <span className="text-purple-400">Scripts</span></h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Boost your workflow with premium automation tools managed by StockPilotAI.</p>
        </div>
      )}

      {!selectedScript ? (
        // LIST VIEW
        <>
            {scripts.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-white/5">
                    <p className="text-slate-500 text-lg">No scripts available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
                {scripts.map((script, idx) => (
                    <div 
                        key={script.id}
                        onClick={() => setSelectedScript(script)}
                        className="glass-panel glass-panel-hover p-8 rounded-3xl cursor-pointer group flex flex-col h-full border border-white/5 hover:border-purple-500/50 transition-all"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getCategoryColor(script.category)}`}>
                                {script.category}
                            </div>
                            <span className="bg-white/5 text-slate-400 text-[10px] font-bold px-2 py-1 rounded uppercase">
                                v{script.version}
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{script.title}</h3>
                        
                        {/* Thumbnail Preview if available */}
                        {script.imageUrls && script.imageUrls.length > 0 && (
                            <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-slate-900/50 border border-white/5 relative">
                                <img src={script.imageUrls[0]} alt={script.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}

                        <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                            {script.description || "No description provided."}
                        </p>

                        <div className="pt-6 border-t border-white/5 flex items-center text-purple-400 text-sm font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                            Details & Download <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </>
      ) : (
        // DETAIL VIEW
        <div className="animate-fade-in-up">
            <button 
                onClick={() => setSelectedScript(null)} 
                className="mb-8 flex items-center text-slate-400 hover:text-white transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/5 w-fit"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Scripts
            </button>

            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-8">
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 ${getCategoryColor(selectedScript.category)}`}>
                                {selectedScript.category}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{selectedScript.title}</h1>
                            <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">{selectedScript.description}</p>
                        </div>
                        
                        <a 
                            href={selectedScript.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-900/40 hover:shadow-purple-600/40 transition-all flex items-center gap-3 btn-3d whitespace-nowrap"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Script
                        </a>
                    </div>

                    {/* Image Gallery */}
                    {selectedScript.imageUrls && selectedScript.imageUrls.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                            {selectedScript.imageUrls.map((url, i) => (
                                <div key={i} className="rounded-xl overflow-hidden border border-white/10 shadow-lg aspect-video bg-slate-900">
                                    <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                        {/* Instructions */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">i</span>
                                Instructions
                            </h3>
                            <div className="text-slate-300 space-y-2 text-sm leading-relaxed whitespace-pre-line">
                                {selectedScript.instructions || "No specific instructions provided. Check the downloaded file."}
                            </div>
                        </div>

                        {/* File Info */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                             <h3 className="text-lg font-bold text-white mb-4">Script Details</h3>
                             <ul className="space-y-3">
                                 <li className="flex justify-between text-sm border-b border-white/5 pb-2">
                                     <span className="text-slate-500">Version</span>
                                     <span className="text-white font-mono">{selectedScript.version}</span>
                                 </li>
                                 <li className="flex justify-between text-sm pb-2">
                                     <span className="text-slate-500">License</span>
                                     <span className="text-green-400">Free for Commercial Use</span>
                                 </li>
                             </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ScriptsHub;
