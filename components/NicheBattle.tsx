import React, { useState } from 'react';
import { compareNiches } from '../services/geminiService';
import { NicheComparisonResult, AppView } from '../types';

interface NicheBattleProps {
  onNav?: (view: AppView) => void;
}

const NicheBattle: React.FC<NicheBattleProps> = ({ onNav }) => {
  const [topicA, setTopicA] = useState('');
  const [topicB, setTopicB] = useState('');
  const [result, setResult] = useState<NicheComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!topicA || !topicB) return;
    setLoading(true);
    setResult(null);
    try {
        const data = await compareNiches(topicA, topicB);
        setResult(data);
    } catch (error: any) {
        if (error.message === 'MISSING_API_KEY' && onNav) {
            onNav(AppView.SETTINGS);
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pb-20 px-6">
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Niche <span className="text-red-500 italic">Battle</span> Arena</h1>
            <p className="text-slate-400 text-lg">Unsure what to shoot? Pit two ideas against each other and let AI decide the winner.</p>
        </div>

        {/* Input Arena */}
        <div className="glass-panel p-8 rounded-3xl mb-8 border border-white/10 shadow-2xl relative overflow-hidden">
             {/* VS Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center font-black italic text-2xl text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] z-10 border-4 border-slate-900">
                VS
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-0">
                <div className="space-y-4">
                    <label className="block text-center text-blue-400 font-bold tracking-widest uppercase">Contender A</label>
                    <input 
                        type="text" 
                        value={topicA}
                        onChange={(e) => setTopicA(e.target.value)}
                        placeholder="e.g. Sustainable Coffee"
                        className="w-full bg-slate-900/50 border border-blue-500/30 rounded-2xl px-6 py-6 text-center text-xl text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-center text-teal-400 font-bold tracking-widest uppercase">Contender B</label>
                     <input 
                        type="text" 
                        value={topicB}
                        onChange={(e) => setTopicB(e.target.value)}
                        placeholder="e.g. Cyberpunk Office"
                        className="w-full bg-slate-900/50 border border-teal-500/30 rounded-2xl px-6 py-6 text-center text-xl text-white focus:outline-none focus:border-teal-500 focus:shadow-[0_0_30px_rgba(20,184,166,0.2)] transition-all"
                    />
                </div>
            </div>

            <div className="mt-10 text-center">
                <button 
                    onClick={handleCompare}
                    disabled={loading || !topicA || !topicB}
                    className="bg-white text-slate-900 hover:bg-slate-200 px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed scale-100 hover:scale-105 active:scale-95"
                >
                    {loading ? 'FIGHTING...' : 'START BATTLE'}
                </button>
            </div>
        </div>

        {/* Results */}
        {result && (
            <div className="animate-fade-in-up">
                {/* Winner Banner */}
                <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 border border-yellow-500/50 p-6 rounded-2xl text-center mb-8 shadow-[0_0_40px_rgba(234,179,8,0.1)]">
                    <h2 className="text-yellow-400 font-bold uppercase tracking-widest mb-2">🏆 The Winner Is</h2>
                    <h3 className="text-4xl font-display font-bold text-white mb-2">{result.winner}</h3>
                    <p className="text-yellow-200/80 italic">"{result.winnerReason}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Topic A Stats */}
                    <div className={`glass-panel p-6 rounded-3xl border ${result.winner === result.topicA.name ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'border-red-500/20 opacity-80'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">{result.topicA.name}</h3>
                            <div className="text-3xl font-bold text-blue-400">{result.topicA.score}<span className="text-sm text-slate-500 ml-1">/100</span></div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-green-400 uppercase mb-2">Pros</h4>
                                <ul className="space-y-1">
                                    {result.topicA.pros.map((p, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-green-500">✓</span> {p}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Cons</h4>
                                <ul className="space-y-1">
                                    {result.topicA.cons.map((c, i) => <li key={i} className="text-sm text-slate-400 flex gap-2"><span className="text-red-500">×</span> {c}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Topic B Stats */}
                    <div className={`glass-panel p-6 rounded-3xl border ${result.winner === result.topicB.name ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'border-red-500/20 opacity-80'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">{result.topicB.name}</h3>
                            <div className="text-3xl font-bold text-teal-400">{result.topicB.score}<span className="text-sm text-slate-500 ml-1">/100</span></div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-green-400 uppercase mb-2">Pros</h4>
                                <ul className="space-y-1">
                                    {result.topicB.pros.map((p, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-green-500">✓</span> {p}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Cons</h4>
                                <ul className="space-y-1">
                                    {result.topicB.cons.map((c, i) => <li key={i} className="text-sm text-slate-400 flex gap-2"><span className="text-red-500">×</span> {c}</li>)}
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

export default NicheBattle;