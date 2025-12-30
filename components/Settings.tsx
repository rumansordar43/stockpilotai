
import React, { useState, useEffect } from 'react';

const Settings: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const result = await window.aistudio.hasSelectedApiKey();
        setHasKey(result);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true); // Proceed assuming success as per race condition notes
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pt-28 pb-20 px-6 animate-fade-in-up">
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        
        <div className="mb-10 relative z-10">
            <h1 className="text-4xl font-display font-bold text-white mb-2">Platform Settings</h1>
            <p className="text-slate-400">Configure your microstock market intelligence tools.</p>
        </div>

        <div className="space-y-8">
            {/* API Key Selection Section - MANDATORY FOR VEO/PRO MODELS */}
            <div className="bg-slate-900/80 border border-blue-500/30 p-8 rounded-2xl relative group">
                <div className="absolute top-0 right-0 p-4">
                   <div className={`w-3 h-3 rounded-full ${hasKey ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`}></div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                   <span className="text-2xl">🔑</span> API Configuration
                </h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                   To use high-quality features like Gemini Pro analysis and Image generation, you must select your own Google API key from a paid GCP project. 
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <button 
                      onClick={handleOpenKeySelector}
                      className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all transform hover:-translate-y-1"
                    >
                      {hasKey ? 'Change API Key' : 'Configure API Key'}
                    </button>
                    
                    <a 
                      href="https://ai.google.dev/gemini-api/docs/billing" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-white underline decoration-blue-500/30"
                    >
                      Learn about API billing
                    </a>
                </div>
                
                {hasKey && (
                   <p className="mt-4 text-xs text-green-400 font-bold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      API Key Selected & Ready
                   </p>
                )}
            </div>

            {/* General Configuration */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">System Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Update Frequency</label>
                        <select className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none">
                            <option>Real-time (Active)</option>
                            <option>Every 12 Hours</option>
                            <option>Daily Update</option>
                        </select>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Default Export</label>
                        <select className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none">
                            <option>Adobe Stock (CSV)</option>
                            <option>Shutterstock (TXT)</option>
                            <option>Freepik (All-in-one)</option>
                        </select>
                    </div>
                </div>

                <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                        <h4 className="text-white font-bold">Cloud Synchronization</h4>
                        <p className="text-xs text-slate-500 mt-1">Automatically sync your research history across devices.</p>
                    </div>
                    <div className="w-12 h-6 bg-blue-600 rounded-full p-1 relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full translate-x-6 shadow-sm"></div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 text-center">
                 <button className="text-red-400 hover:text-red-300 font-bold text-sm transition-colors px-6 py-2 rounded-lg hover:bg-red-500/10">Reset All System Cache</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
