
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto w-full pt-28 pb-20 px-6 animate-fade-in-up">
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        
        <div className="mb-10 relative z-10">
            <h1 className="text-4xl font-display font-bold text-white mb-2">Platform Settings</h1>
            <p className="text-slate-400">Manage your microstock intelligence configuration.</p>
        </div>

        <div className="space-y-8">
            {/* API Status Section */}
            <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl flex gap-6 items-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-lg">Gemini AI Status</h3>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase rounded border border-green-500/30">Connected</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Your system is securely connected to Gemini 3 for high-speed metadata and trend analysis. API key is active.
                    </p>
                </div>
            </div>

            {/* General Configuration */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">System Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Update Interval</label>
                        <select className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500">
                            <option>Every 24 Hours</option>
                            <option>Every 12 Hours</option>
                            <option>Real-time (Active)</option>
                        </select>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Default Platform</label>
                        <select className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500">
                            <option>Adobe Stock</option>
                            <option>Shutterstock</option>
                            <option>Freepik</option>
                            <option>All Platforms</option>
                        </select>
                    </div>
                </div>

                <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-bold">Automatic Backups</h4>
                        <div className="w-12 h-6 bg-blue-600 rounded-full p-1 relative cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">Save your generated metadata and prompts locally for 30 days automatically.</p>
                </div>
            </div>

            {/* Support Info */}
            <div className="pt-8 border-t border-white/5 text-center">
                 <p className="text-slate-500 text-sm mb-4 italic">Need manual API configuration? Contact Admin support.</p>
                 <button className="text-blue-400 font-bold hover:text-white transition-colors text-sm underline decoration-blue-500/30">Clear System Cache</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
