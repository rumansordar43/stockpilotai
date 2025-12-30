import React, { useState } from 'react';
import { generateBulkPrompts } from '../services/geminiService';
import { AppView } from '../types';

interface PromptGeneratorProps {
  initialTopic?: string;
  onNav: (view: AppView) => void;
}

const STYLES = ['Auto', 'Photorealistic', '3D Render', 'Vector Illustration', 'Isometric', 'Watercolor', 'Cyberpunk', 'Line Art', 'Flat Design', 'Vintage/Retro'];
const COMPOSITIONS = ['Auto', 'Rule of Thirds', 'Symmetrical', 'Wide Angle', 'Macro', 'Minimalist', 'Knolling', 'Cinematic', 'Overhead'];

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ initialTopic = '', onNav }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [count, setCount] = useState<number | string>(10);
  const [style, setStyle] = useState('Auto');
  const [composition, setComposition] = useState('Auto');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true);
    setPrompts([]);
    const num = typeof count === 'string' ? parseInt(count) || 10 : count;
    
    try {
        const results = await generateBulkPrompts(topic, num, style, composition);
        setPrompts(results);
    } catch (error: any) {
         if (error.message === 'MISSING_API_KEY') {
             if (onNav) onNav(AppView.SETTINGS);
         }
    } finally {
        setLoading(false);
    }
  };

  const downloadTxt = () => {
    const content = prompts.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompts.txt';
    a.click();
  };

  const copyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(idx);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-20">
      <div className="glass-panel p-8 rounded-3xl mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Manual Prompt Builder</h2>
        <p className="text-slate-400 mb-8">Create specific prompts for any concept with custom styles.</p>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="flex flex-col gap-6">
             {/* Main Topic Input */}
             <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Topic / Concept</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 'Future city', 'Cute cat', 'Business meeting'"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
             </div>

             {/* Style & Composition Selectors */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Visual Style</label>
                   <select 
                     value={style}
                     onChange={(e) => setStyle(e.target.value)}
                     className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                   >
                      {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Composition</label>
                   <select 
                     value={composition}
                     onChange={(e) => setComposition(e.target.value)}
                     className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                   >
                      {COMPOSITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
             </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center pt-2">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex bg-slate-900/50 rounded-xl border border-white/10 p-1 flex-shrink-0">
                    {[10, 20, 50].map(c => (
                        <button
                        key={c}
                        type="button"
                        onClick={() => setCount(c)}
                        className={`px-4 py-3 rounded-lg text-sm font-bold transition-all ${count === c ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                        {c}
                        </button>
                    ))}
                    </div>
                    <input 
                        type="number" 
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                        placeholder="Qty"
                        className="w-24 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-4 text-white text-center font-bold focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
                
                <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto flex-grow bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap"
                >
                {loading ? 'Generating...' : 'Generate Prompts'}
                </button>
            </div>
          </div>
        </form>

        {prompts.length > 0 && (
          <div className="mt-8 animate-fade-in">
             <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm">{prompts.length} Prompts Generated</span>
                <button onClick={downloadTxt} className="text-sm text-cyan-400 hover:text-cyan-300 font-bold">Download TXT</button>
             </div>
            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {prompts.map((p, idx) => (
                <div key={idx} className="bg-slate-800/40 border border-white/5 p-5 rounded-xl hover:border-cyan-500/30 transition-colors group relative">
                  <p className="text-slate-200 leading-relaxed font-light text-sm pr-10">{p}</p>
                  <button 
                    onClick={() => copyPrompt(p, idx)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-all bg-slate-900/80 px-2 py-1 rounded"
                  >
                    {copyStatus === idx ? <span className="text-green-400 text-xs font-bold">Copied</span> : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptGenerator;