
import React, { useState, useEffect } from 'react';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('user_api_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('user_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    window.location.reload(); // Refresh to ensure the client is re-initialized
  };

  const handleClear = () => {
      localStorage.removeItem('user_api_key');
      setApiKey('');
      alert("Key cleared from your browser.");
  };

  return (
    <div className="max-w-4xl mx-auto w-full pt-28 pb-20 px-6 animate-fade-in-up">
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        
        <div className="mb-10 relative z-10">
            <h1 className="text-4xl font-display font-bold text-white mb-2">User Settings</h1>
            <p className="text-slate-400">Manage your personal Google Gemini API key to power the entire platform.</p>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl mb-8 flex gap-4 items-start">
            <div className="text-blue-400 mt-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
                <h3 className="text-blue-300 font-bold mb-1">Unified API Intelligence</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                    A single Google Gemini API key now powers all features including Trend Regeneration, Metadata Generation, and AI Prompt Building.
                </p>
            </div>
        </div>

        <div className="space-y-6 relative z-10">
            <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Google Gemini API Key
                </label>
                <div className="relative">
                    <input 
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Gemini API key..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 19l-1 1-1 1-2-2m-2-2l-2.929-2.929a1 1 0 00-.697-.288c-.27 0-.528.109-.721.302A3.003 3.003 0 012 12a3 3 0 013-3 2.999 2.999 0 012.798 2.016 6 6 0 017.944-7.944A2 2 0 0119 9v1" /></svg>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
            <button onClick={handleClear} className="text-red-400 hover:text-white text-sm font-bold transition-colors">Clear Key</button>
            <button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all btn-3d flex items-center gap-2">
                {saved ? 'Saved Successfully' : 'Save Configuration'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
