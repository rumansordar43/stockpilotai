
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto w-full pt-28 pb-20 px-6 animate-fade-in-up">
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        
        <div className="mb-10 relative z-10">
            <h1 className="text-4xl font-display font-bold text-white mb-2">Platform Settings</h1>
            <p className="text-slate-400">Microstock intelligence configuration and status.</p>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl mb-8 flex gap-4 items-start">
            <div className="text-blue-400 mt-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
                <h3 className="text-blue-300 font-bold mb-1">AI Service Status</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                    The platform is currently connected to Gemini 3 for high-speed microstock intelligence. Connection parameters are managed securely by the system environment.
                </p>
            </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
            <p className="text-slate-500 text-sm italic">Status: All systems operational.</p>
        </div>

      </div>
    </div>
  );
};

export default Settings;
