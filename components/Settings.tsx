
import React, { useState, useEffect } from 'react';

const Settings: React.FC = () => {
  const [groqKey, setGroqKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('groq_api_key');
    if (savedKey) {
      setGroqKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    localStorage.setItem('groq_api_key', groqKey);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto w-full pt-32 pb-20 px-6 animate-fade-in-up">
      <div className="glass-panel p-8 md:p-12 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Ambient background effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="text-center mb-12 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-3xl flex items-center justify-center text-white shadow-xl mx-auto mb-6 transform hover:rotate-6 transition-transform">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">API Configuration</h1>
          <p className="text-slate-400">Enter your Groq API Key to power the platform intelligence.</p>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.3em] ml-1">
              Your Groq API Key
            </label>
            
            <div className="relative group">
              <input 
                type={showKey ? "text" : "password"} 
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-700"
              />
              <button 
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showKey ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.888 9.888L5.123 5.123M18.825 13.875l4.052 4.052M13.385 13.385a3.001 3.001 0 01-4.242-4.242m12.727 1.563a10.05 10.05 0 01.125 1.677c0 4.477-2.943 8.268-7 9.542m-4.242-4.242L5.123 5.123" /></svg>
                )}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed italic px-2">
              Note: Your API key is stored locally in your browser's memory and is never sent to our database.
            </p>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={saveStatus === 'saving' || !groqKey}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-2xl ${
                saveStatus === 'saved' 
                ? 'bg-green-600 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-900/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving Key...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  <span>Configuration Saved!</span>
                </>
              ) : (
                'Save Groq Configuration'
              )}
            </button>
          </div>

          <div className="text-center pt-6">
            <a 
              href="https://console.groq.com/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-bold text-blue-400 hover:text-white underline decoration-blue-500/30 transition-colors"
            >
              Get your Groq API Key here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
