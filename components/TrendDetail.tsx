import React, { useState } from 'react';
import { Trend, AppView } from '../types';
import { generateBulkPrompts, setGlobalErrorListener } from '../services/geminiService';

interface TrendDetailProps {
  trend: Trend;
  onBack: () => void;
  onNav: (view: AppView) => void;
}

// Updated Default Styles to include user requested creative options
const DEFAULT_STYLES = [
    'Auto', 
    'Photorealistic', 
    '3D Render', 
    'Vector', 
    'Typography', 
    'Vintage', 
    'Minimalist', 
    'Graffiti', 
    'Anime', 
    'Pixel Art', 
    'Pop Art', 
    'Line Art', 
    'Cyberpunk', 
    'Watercolor', 
    'Isometric', 
    'Flat Design'
];

const POD_STYLES = [
    'Auto', 
    'Vector', 
    'Typography', 
    'Vintage', 
    'Minimalist', 
    'Graffiti', 
    'Anime', 
    'Pixel Art', 
    'Pop Art', 
    'Line Art',
    'Cyberpunk',
    'Watercolor',
    'Sticker Art'
];
const COMPOSITIONS = ['Auto', 'Rule of Thirds', 'Symmetrical', 'Wide Angle', 'Macro', 'Minimalist', 'Knolling', 'Cinematic', 'Overhead'];

const TrendDetail: React.FC<TrendDetailProps> = ({ trend, onBack, onNav }) => {
  const [promptCount, setPromptCount] = useState<number | string>(10);
  const [style, setStyle] = useState('Auto');
  const [composition, setComposition] = useState('Auto');
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<number | null>(null);

  // Detect POD Mode based on category
  const isPodTrend = ['Typography', 'Vintage', 'Graphic', 'Pattern', 'Vector', 'Pop Art', 'Line Art', 'Cyberpunk', 'Watercolor', 'Sticker Art', 'Anime', 'Minimalist', 'Dark Humor', 'Outdoors', 'Hobbies', 'Animals'].includes(trend.category) || ['Typography', 'Vintage', 'Graphic', 'Pattern'].includes(trend.category);

  // Determine which styles to show
  const activeStyles = isPodTrend ? POD_STYLES : DEFAULT_STYLES;

  const getStyleDetails = (style: string): string => {
      switch (style) {
          case 'Typography': return "STRICT TYPOGRAPHY FOCUS. The design must be 90% text-based featuring a short, catchy quote or phrase related to the niche. Specify specific font styles (e.g., 'Bold Retro Serif', 'Distressed Athletic', 'Elegant Hand-lettering', 'Bubble Letters'). Text must be legible, centered, and have high visual impact. Use creative kerning and layout.";
          case 'Graffiti': return "Urban street art aesthetic, spray paint textures, drips, bold wildstyle lettering, vibrant colors, hip-hop culture vibe, highly detailed vector style.";
          case 'Anime': return "Japanese animation style, cel-shaded, vibrant colors, expressive characters, dynamic poses, manga-inspired visual effects (speed lines, sparkles).";
          case 'Pixel Art': return "Retro 8-bit or 16-bit aesthetic, sharp grid-based visuals, nostalgic video game style, limited color palette, blocky details.";
          case 'Pop Art': return "Andy Warhol inspired, halftone dots patterns, bold comic book outlines, vibrant primary colors, high contrast, commercial art aesthetic.";
          case 'Line Art': return "Minimalist continuous line drawing, single line aesthetic, elegant strokes, black ink on white, abstract and clean, sophisticated look.";
          case 'Cyberpunk': return "Futuristic high-tech aesthetic, neon glow, circuitry patterns, cyborg elements, glitch effects, night city vibes, blue and magenta color scheme.";
          case 'Watercolor': return "Soft watercolor painting style, paint splashes, bleeding edges, artistic texture, gentle pastel tones, dreamlike quality isolated on white.";
          case 'Vector': return "Clean flat vector illustration, sharp lines, solid colors, no gradients, scalable aesthetic, professional logo-quality.";
          case 'Vintage': return "Retro vintage aesthetic, distressed texture (grunge overlay), 70s/80s color palette, faded worn look, nostalgia.";
          case 'Minimalist': return "Ultra-modern minimalist design, simple geometric shapes, abundant negative space, clean composition, sleek and iconic.";
          case 'Sticker Art': return "Die-cut sticker aesthetic, thick white border contour, bold vector graphics, vibrant colors, simple shading.";
          default: return "";
      }
  };

  const getStandardStyleModifiers = (style: string): string => {
    switch (style) {
        case 'Photorealistic': return "Cinematic Lighting, 85mm Lens, Depth of Field, 8k, Unreal Engine 5, Ray Tracing, Hyper-detailed";
        case '3D Render': return "Octane Render, Volumetric Lighting, Subsurface Scattering, 3D Masterpiece, C4D, Studio Lighting";
        case 'Vector': return "Adobe Illustrator, Flat Design, Clean Lines, Sharp Edges, Minimalist, Commercial Vector";
        case 'Isometric': return "Orthographic View, 30-degree Angle, Low Poly, Soft Shadows, Minimalist 3D, Diode Lighting";
        case 'Watercolor': return "Wet-on-wet technique, Paper Texture, Soft Bleed, Artistic, Traditional Media, Pastel Tones";
        case 'Cyberpunk': return "Neon Blue/Pink, High Contrast, Night Time, Rain Reflections, Futuristic Cityscape, Chromatic Aberration";
        case 'Line Art': return "Monoline, Ink Drawing, Continuous Line, Black and White, Minimalist, High Precision";
        case 'Flat Design': return "2D, Corporate Art Style, Solid Colors, No Gradients, Simple Shapes, Trending on Dribbble";
        case 'Vintage': return "Film Grain, Noise, Sepia Tone, 1980s Style, Analog Photography, Washed Colors, Vignette";
        case 'Graffiti': return "Street Art, Spray Paint Texture, Urban, Wildstyle, Vibrant Colors, Wall Mural";
        case 'Anime': return "Studio Ghibli Style, Cel Shaded, Vibrant, Expressive, 2D Animation Style";
        case 'Pixel Art': return "16-bit, Retro Game Aesthetic, Grid-based, Dithering";
        case 'Pop Art': return "Halftone Dots, Bold Outlines, Vibrant Primary Colors, Comic Book Style";
        case 'Minimalist': return "Negative Space, Clean Composition, Simple Shapes, Soft Lighting";
        case 'Typography': return "Text-based, Creative Fonts, Calligraphy, Bold Lettering";
        default: return "";
    }
  };

  const handleGenerate = async () => {
    const count = typeof promptCount === 'string' ? parseInt(promptCount) || 10 : promptCount;
    setLoading(true);
    setGeneratedPrompts([]);

    let finalComposition = composition;
    let finalStyle = style;

    // Enhance Logic for POD
    if (isPodTrend) {
        if (finalComposition === 'Auto') finalComposition = "Isolated on Black Background, Centered, Print-on-Demand Ready, High Contrast";
        const styleInstructions = getStyleDetails(finalStyle);
        if (styleInstructions) {
            finalComposition += `. Visual Instructions: ${styleInstructions}`;
        }
    } else {
        // Standard Trends: Append specific lighting/camera modifiers
        const modifiers = getStandardStyleModifiers(finalStyle);
        if (modifiers) {
            finalStyle += `. Modifiers: ${modifiers}`;
        }
    }

    try {
        const prompts = await generateBulkPrompts(trend.topic, count, finalStyle, finalComposition);
        setGeneratedPrompts(prompts);
    } catch (error: any) {
        if (error.message === 'MISSING_API_KEY') {
            // Redirect to settings using onNav
            if (onNav) {
                // Using a small timeout to let the toast appear before navigation happens
                setGlobalErrorListener(() => {}); // Clear listener
                // Manually trigger a toast if possible, or rely on App's logic
                setTimeout(() => onNav(AppView.SETTINGS), 100);
            }
        }
    } finally {
        setLoading(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: 'text/plain' | 'text/csv') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const content = generatedPrompts.join('\n\n');
    downloadFile(content, `${trend.topic.replace(/\s+/g, '_')}_prompts.txt`, 'text/plain');
  };

  const handleDownloadCsv = () => {
    const content = 'Prompt\n' + generatedPrompts.map(p => `"${p.replace(/"/g, '""')}"`).join('\n');
    downloadFile(content, `${trend.topic.replace(/\s+/g, '_')}_prompts.csv`, 'text/csv');
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(idx);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  // Simple Sparkline Graph Simulation
  const maxVal = Math.max(...trend.trendHistory, 100);
  const points = trend.trendHistory.map((val, idx) => {
    const x = (idx / (trend.trendHistory.length - 1)) * 100;
    const y = 100 - ((val / maxVal) * 100);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="max-w-7xl mx-auto px-6 animate-fade-in-up pb-20">
      <button onClick={onBack} className="mb-6 flex items-center text-slate-400 hover:text-white transition-colors">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stats & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isPodTrend ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/30' : 'bg-blue-600/30 text-blue-300 border-blue-500/30'}`}>
                    {trend.category}
                </span>
                <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{trend.competition} Competition</span>
                 {isPodTrend && <span className="bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/30">POD Ready</span>}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{trend.topic}</h1>
              <p className="text-xl text-slate-300 leading-relaxed">{trend.description}</p>
            </div>
            {/* Background Blob */}
            <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none ${isPodTrend ? 'bg-indigo-600/20' : 'bg-blue-600/20'}`}></div>
          </div>

          {/* Trend Graph */}
          <div className="glass-panel p-8 rounded-3xl">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Demand Trend (7 Days)</h3>
                <p className="text-slate-400 text-sm">Real-time search interest analysis</p>
              </div>
              <span className="text-3xl font-display font-bold text-green-400">+{Math.floor(Math.random() * 20) + 10}%</span>
            </div>
            <div className="h-40 w-full flex items-end">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`M0,100 L0,100 ${points} L100,100 Z`} fill="url(#lineGradient)" />
                <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} vectorEffect="non-scaling-stroke" />
                {trend.trendHistory.map((val, i) => (
                  <circle key={i} cx={`${(i / 6) * 100}%`} cy={`${100 - (val/maxVal)*100}%`} r="4" fill="#fff" className="animate-pulse" />
                ))}
              </svg>
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
              <span>Day 1</span>
              <span>Day 7</span>
            </div>
          </div>
        </div>

        {/* Right: Prompt Generator */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-3xl sticky top-24 border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Prompt Generator</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Number of Prompts</label>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 50, 100].map(num => (
                      <button
                        key={num}
                        onClick={() => setPromptCount(num)}
                        className={`py-2 rounded-xl text-sm font-bold transition-all ${promptCount === num ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold uppercase">Custom</span>
                    <input 
                      type="number" 
                      min="1"
                      value={promptCount}
                      onChange={(e) => setPromptCount(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-20 pr-4 text-white text-right font-mono focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter amount..."
                    />
                  </div>
                </div>
              </div>

              {/* Style & Composition Selectors */}
              <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Visual Style</label>
                    <select 
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      {activeStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {/* Visual Modifiers Preview */}
                    {style !== 'Auto' && (
                        <div className="mt-2 text-[10px] text-slate-400 bg-slate-800/50 p-2 rounded-lg border border-white/5 leading-relaxed">
                            <span className="text-blue-400 font-bold uppercase mr-1">Includes:</span>
                            {isPodTrend 
                                ? "Specialized POD Instructions (Vector/Quote/Isolation rules)" 
                                : getStandardStyleModifiers(style)}
                        </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Composition</label>
                    <select 
                      value={composition}
                      onChange={(e) => setComposition(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      {COMPOSITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">System Rules</h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Commercial Grade</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> No Watermarks</li>
                  {isPodTrend ? (
                      <>
                        <li className="flex items-center"><span className="text-teal-400 mr-2">✓</span> Isolated / Transparent</li>
                        <li className="flex items-center"><span className="text-teal-400 mr-2">✓</span> Vector Optimization</li>
                      </>
                  ) : (
                      <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Microstock Optimized</li>
                  )}
                </ul>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-lg disabled:opacity-50 flex items-center justify-center ${
                    isPodTrend 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 shadow-indigo-900/30' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-blue-900/30'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate Prompts'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {generatedPrompts.length > 0 && (
        <div className="mt-12 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-2xl font-bold text-white">Generated Prompts ({generatedPrompts.length})</h3>
            <div className="flex gap-3">
              <button onClick={handleDownloadTxt} className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center">
                <span className="mr-2">📄</span> Download TXT
              </button>
              <button onClick={handleDownloadCsv} className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center">
                <span className="mr-2">📊</span> Download CSV
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
            <div className="max-h-[600px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {generatedPrompts.map((prompt, idx) => (
                <div key={idx} className="bg-slate-900/50 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors flex items-start justify-between gap-4 group">
                  <div className="flex gap-4 items-start">
                    <span className="text-slate-500 font-mono text-sm pt-0.5 select-none">{String(idx + 1).padStart(2, '0')}</span>
                    <p className="text-slate-200 text-sm leading-relaxed">{prompt}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(prompt, idx)}
                    className="flex-shrink-0 text-slate-500 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                    title="Copy to clipboard"
                  >
                     {copyStatus === idx ? (
                       <span className="text-green-400 text-xs font-bold">Copied</span>
                     ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                     )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendDetail;