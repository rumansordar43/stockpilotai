
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeneratedMetadata, MetadataConfig, MetadataBatchItem, AppView } from '../types';
import { generateImageMetadata, generateMetadataFromFilename } from '../services/geminiService';

interface MetadataGeneratorProps {
    onNav: (view: AppView) => void;
}

const PLATFORMS = [
    { id: 'all', icon: '✨', label: 'All' },
    { id: 'adobestock', icon: 'St', label: 'Adobe' },
    { id: 'freepik', icon: 'F', label: 'Freepik' },
    { id: 'shutterstock', icon: 'S', label: 'Shutter' },
    { id: 'vimeo', icon: 'v', label: 'Vimeo' },
    { id: 'pond5', icon: 'P', label: 'Pond5' },
];

const MetadataGenerator: React.FC<MetadataGeneratorProps> = ({ onNav }) => {
  const [config, setConfig] = useState<MetadataConfig>({
      platform: 'all',
      titleLength: 70,
      descLength: 150,
      keywordCount: 30,
      imageType: 'None',
      prefix: { enabled: false, value: '' },
      suffix: { enabled: false, value: '' },
      negativeTitle: { enabled: false, value: '' },
      negativeKeywords: { enabled: false, value: '' }
  });

  const [isControlsExpanded, setIsControlsExpanded] = useState(true);
  const [queue, setQueue] = useState<MetadataBatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isCurrentlyFetching = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Main Queue Processor
  const processNextInQueue = useCallback(async () => {
    if (isCurrentlyFetching.current || !isProcessing) return;

    const nextPendingItem = queue.find(item => item.status === 'pending');
    
    if (!nextPendingItem) {
        setIsProcessing(false);
        return;
    }

    isCurrentlyFetching.current = true;

    setQueue(prev => prev.map(it => it.id === nextPendingItem.id ? { ...it, status: 'processing' } : it));

    try {
        let result: GeneratedMetadata | null = null;
        
        if (nextPendingItem.file.type.startsWith('image/')) {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("File read error"));
                reader.readAsDataURL(nextPendingItem.file);
            });
            result = await generateImageMetadata(base64, nextPendingItem.file.type, config);
        } else {
            result = await generateMetadataFromFilename(nextPendingItem.file.name, config);
        }

        if (result && result.title) {
            setQueue(prev => prev.map(it => it.id === nextPendingItem.id ? { ...it, status: 'completed', metadata: result! } : it));
        } else {
            setQueue(prev => prev.map(it => it.id === nextPendingItem.id ? { ...it, status: 'error', errorMsg: 'API failed' } : it));
        }
    } catch (err: any) {
        setQueue(prev => prev.map(it => it.id === nextPendingItem.id ? { ...it, status: 'error', errorMsg: err.message || 'Processing failed' } : it));
    } finally {
        isCurrentlyFetching.current = false;
    }
  }, [queue, config, isProcessing]);

  useEffect(() => {
    if (isProcessing) {
        const timer = setTimeout(() => {
            processNextInQueue();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [isProcessing, queue, processNextInQueue]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      
      const newItems = Array.from(e.target.files).map(file => {
          const id = Math.random().toString(36).substr(2, 9);
          const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

          return {
              id,
              file: file,
              status: 'pending' as const,
              previewUrl,
              sizeInfo: formatFileSize(file.size)
          };
      });

      setQueue(prev => [...prev, ...newItems]);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
      setQueue(prev => {
          const item = prev.find(i => i.id === id);
          if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
          return prev.filter(i => i.id !== id);
      });
  };

  const clearQueue = () => {
      if (isProcessing) return;
      queue.forEach(item => {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setQueue([]);
  };

  const startBatch = () => {
      if (queue.some(i => i.status === 'pending')) {
          setIsProcessing(true);
      }
  };

  const updateMetadataField = (id: string, field: keyof GeneratedMetadata, value: any) => {
    setQueue(prev => prev.map(item => {
        if (item.id === id && item.metadata) {
            return { ...item, metadata: { ...item.metadata, [field]: value } };
        }
        return item;
    }));
  };

  const downloadCSV = () => {
      const completed = queue.filter(q => q.status === 'completed' && q.metadata);
      if (completed.length === 0) return;

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Filename,Title,Description,Keywords\n";

      completed.forEach(item => {
          const m = item.metadata!;
          const title = `"${m.title.replace(/"/g, '""')}"`;
          const desc = `"${m.description.replace(/"/g, '""')}"`;
          const keywords = `"${m.keywords.join(', ')}"`;
          
          csvContent += `${item.file.name},${title},${desc},${keywords}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `metadata_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const totalFiles = queue.length;
  const totalSize = queue.reduce((acc, curr) => acc + curr.file.size, 0);
  const completedCount = queue.filter(i => i.status === 'completed').length;

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 pb-20 animate-fade-in-up">
      
      {/* 1. ADVANCED CONTROLS PANEL */}
      <div className="glass-panel rounded-2xl mb-8 overflow-hidden border border-white/5 shadow-2xl">
          <div 
            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
            className="px-6 py-4 bg-slate-900/50 flex justify-between items-center cursor-pointer hover:bg-slate-900 transition-colors border-b border-white/5"
          >
              <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  <h2 className="text-lg font-bold text-white tracking-tight">Advance Metadata Controls</h2>
              </div>
              <button className="bg-black/40 hover:bg-black/60 text-slate-300 text-xs font-bold px-4 py-1.5 rounded-lg border border-white/10 transition-all uppercase tracking-widest">
                  {isControlsExpanded ? 'Collapse' : 'Expand'}
              </button>
          </div>

          {isControlsExpanded && (
              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 animate-fade-in">
                  
                  {/* Left Column: Sliders & Platforms */}
                  <div className="space-y-8">
                      <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Export Platform</label>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                              {PLATFORMS.map(p => (
                                  <button 
                                    key={p.id}
                                    onClick={() => setConfig({...config, platform: p.id})}
                                    className={`h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${config.platform === p.id ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-slate-900/40 border-white/5 hover:border-white/20'}`}
                                  >
                                      <span className={`text-xl font-bold ${config.platform === p.id ? 'text-blue-400' : 'text-slate-500'}`}>{p.icon}</span>
                                      {/* <span className="text-[8px] uppercase font-black mt-1 text-slate-600">{p.label}</span> */}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="space-y-6">
                          <div>
                              <div className="flex justify-between text-xs font-bold mb-2">
                                  <span className="text-slate-400">Title Length</span>
                                  <span className="text-blue-400">{config.titleLength} Characters</span>
                              </div>
                              <input 
                                type="range" min="30" max="150" step="5"
                                value={config.titleLength}
                                onChange={(e) => setConfig({...config, titleLength: parseInt(e.target.value)})}
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                          </div>
                          <div>
                              <div className="flex justify-between text-xs font-bold mb-2">
                                  <span className="text-slate-400">Description Character Length</span>
                                  <span className="text-blue-400">{config.descLength} Characters (Fixed)</span>
                              </div>
                              <input 
                                type="range" min="50" max="500" step="10"
                                value={config.descLength}
                                onChange={(e) => setConfig({...config, descLength: parseInt(e.target.value)})}
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                          </div>
                          <div>
                              <div className="flex justify-between text-xs font-bold mb-2">
                                  <span className="text-slate-400">Keywords Count</span>
                                  <span className="text-blue-400">{config.keywordCount} Keywords</span>
                              </div>
                              <input 
                                type="range" min="10" max="50" step="1"
                                value={config.keywordCount}
                                onChange={(e) => setConfig({...config, keywordCount: parseInt(e.target.value)})}
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Image Type</label>
                          <select 
                            value={config.imageType}
                            onChange={(e) => setConfig({...config, imageType: e.target.value as any})}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
                          >
                              <option value="None">None</option>
                              <option value="Photo">Photo</option>
                              <option value="Vector">Vector</option>
                              <option value="Illustration">Illustration</option>
                          </select>
                          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">If you upload preview file then choose image type vector then it will generate CSV in (EPS, SVG, AI).</p>
                      </div>
                  </div>

                  {/* Right Column: Toggles & Inputs */}
                  <div className="space-y-6">
                      {[
                        { id: 'prefix', label: 'Prefix', placeholder: 'Add Before Title' },
                        { id: 'suffix', label: 'Suffix', placeholder: 'Add After Title' },
                        { id: 'negativeTitle', label: 'Negative Words for Title', placeholder: 'e.g., word1, word2, word3 (comma-separated)' },
                        { id: 'negativeKeywords', label: 'Negative Keywords', placeholder: 'e.g., unwanted, bad, ugly (comma-separated)' }
                      ].map(field => (
                        <div key={field.id} className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{field.label}</label>
                                <button 
                                    onClick={() => setConfig({...config, [field.id]: { ...config[field.id as keyof MetadataConfig] as any, enabled: !(config[field.id as keyof MetadataConfig] as any).enabled }})}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors relative ${ (config[field.id as keyof MetadataConfig] as any).enabled ? 'bg-blue-600' : 'bg-slate-800' }`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${ (config[field.id as keyof MetadataConfig] as any).enabled ? 'translate-x-6' : 'translate-x-0' } shadow-md`}></div>
                                </button>
                            </div>
                            <input 
                                type="text"
                                placeholder={field.placeholder}
                                disabled={!(config[field.id as keyof MetadataConfig] as any).enabled}
                                value={(config[field.id as keyof MetadataConfig] as any).value}
                                onChange={(e) => setConfig({...config, [field.id]: { ...config[field.id as keyof MetadataConfig] as any, value: e.target.value }})}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-30 transition-all placeholder:text-slate-600"
                            />
                        </div>
                      ))}
                      <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 mt-4">
                          <p className="text-[10px] text-slate-500 italic">Note: You don't have to add "isolated on transparent background" for PNG images; the AI handles this.</p>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* 2. UPLOAD AREA */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="glass-panel border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-all rounded-2xl py-12 flex flex-col items-center justify-center cursor-pointer bg-slate-900/20 group mb-8"
      >
          <input type="file" multiple ref={fileInputRef} onChange={handleFiles} className="hidden" accept="image/*,video/*,.eps,.svg,.ai" />
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(59,130,246,0.1)]">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <div className="flex gap-2 mb-3">
              {['Images', 'Videos', 'SVG', 'EPS'].map(tag => (
                  <span key={tag} className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-lg ${tag === 'Images' ? 'bg-blue-600' : tag === 'Videos' ? 'bg-red-600' : tag === 'SVG' ? 'bg-purple-600' : 'bg-green-600'}`}>
                      {tag}
                  </span>
              ))}
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Drag & drop files here, or click to select</h3>
          <p className="text-slate-500 text-sm">Supports common image, video, SVG, and EPS formats. Max 500 files.</p>
      </div>

      {/* 3. BATCH ACTIONS BAR */}
      {queue.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/30 p-4 rounded-2xl border border-white/5">
              <div className="text-xs font-bold text-blue-400 tracking-wide uppercase">
                  {queue.length} file(s) ready for metadata | Total: {formatFileSize(totalSize)}
              </div>
              <div className="flex gap-3">
                  <button 
                    onClick={clearQueue} 
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Clear All
                  </button>
                  <button 
                    onClick={startBatch}
                    disabled={isProcessing || !queue.some(i => i.status === 'pending')}
                    className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-900/30 transition-all disabled:opacity-50"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Generate All ({queue.filter(i => i.status === 'pending').length})
                  </button>
                  <button 
                    onClick={downloadCSV}
                    disabled={completedCount === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm border border-white/10 transition-all disabled:opacity-20"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Export CSV
                  </button>
              </div>
          </div>
      )}

      {/* 4. RESULTS LIST */}
      <div className="space-y-6">
          {queue.map((item) => (
              <div key={item.id} className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col lg:flex-row gap-8 relative group animate-fade-in-up">
                  
                  {/* Image/File Side */}
                  <div className="lg:w-1/4 flex flex-col gap-4">
                      <div className="relative aspect-square bg-slate-900/50 rounded-xl overflow-hidden border border-white/10 group-hover:border-blue-500/30 transition-all shadow-2xl">
                          {item.previewUrl ? (
                              <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 font-black text-4xl uppercase">
                                  {item.file.name.split('.').pop()}
                                  <span className="text-xs text-slate-500 mt-2">No Preview</span>
                              </div>
                          )}
                          
                          {/* Delete Action */}
                          <button 
                             onClick={() => removeFile(item.id)}
                             className="absolute top-3 right-3 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                          >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>

                          {item.status === 'processing' && (
                              <div className="absolute inset-0 bg-blue-600/40 backdrop-blur-sm flex items-center justify-center">
                                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                              </div>
                          )}
                      </div>
                      <div>
                          <p className="text-xs font-bold text-blue-400 truncate mb-1" title={item.file.name}>{item.file.name}</p>
                          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Size: {item.sizeInfo}</p>
                      </div>
                  </div>

                  {/* Metadata Editor Side */}
                  <div className="lg:w-3/4 flex flex-col gap-5">
                      {/* Title Area */}
                      <div>
                          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                              <span className="text-blue-400">T</span> Title
                          </label>
                          <textarea 
                             placeholder="Title will appear here..."
                             value={item.metadata?.title || ''}
                             onChange={(e) => updateMetadataField(item.id, 'title', e.target.value)}
                             className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-5 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 min-h-[60px] custom-scrollbar"
                          />
                      </div>

                      {/* Description Area */}
                      <div>
                          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                              <span className="text-blue-400">📄</span> Description
                          </label>
                          <textarea 
                             placeholder="Description will appear here..."
                             value={item.metadata?.description || ''}
                             onChange={(e) => updateMetadataField(item.id, 'description', e.target.value)}
                             className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-5 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 min-h-[80px] custom-scrollbar"
                          />
                      </div>

                      {/* Keywords Area */}
                      <div>
                          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                              <span className="text-blue-400">🏷️</span> Keywords ({item.metadata?.keywords.length || 0})
                          </label>
                          <textarea 
                             placeholder="Keywords will appear here..."
                             value={item.metadata?.keywords.join(', ') || ''}
                             onChange={(e) => updateMetadataField(item.id, 'keywords', e.target.value.split(',').map(s => s.trim()))}
                             className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-5 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 min-h-[100px] custom-scrollbar"
                          />
                      </div>

                      {/* Footer Actions */}
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                          <div className="flex gap-2">
                              <button 
                                 onClick={() => navigator.clipboard.writeText(item.metadata?.title || '')}
                                 className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all border border-white/5"
                              >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  Copy Title
                              </button>
                              <button 
                                 onClick={() => navigator.clipboard.writeText(item.metadata?.description || '')}
                                 className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all border border-white/5"
                              >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  Copy Desc
                              </button>
                              <button 
                                 onClick={() => navigator.clipboard.writeText(item.metadata?.keywords.join(', ') || '')}
                                 className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all border border-white/5"
                              >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  Copy Tags
                              </button>
                          </div>
                          
                          <button 
                             onClick={() => setQueue(prev => prev.map(it => it.id === item.id ? {...it, status: 'pending'} : it))}
                             disabled={isProcessing}
                             className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600 hover:to-blue-600 text-cyan-400 hover:text-white rounded-xl text-xs font-black uppercase transition-all border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                          >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                              Regenerate
                          </button>
                      </div>
                  </div>

                  {item.status === 'error' && (
                      <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[2px] rounded-2xl flex items-center justify-center p-8 pointer-events-none">
                          <div className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-2xl pointer-events-auto flex items-center gap-3">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              Generation Failed: {item.errorMsg}
                          </div>
                      </div>
                  )}
              </div>
          ))}
          {queue.length === 0 && (
              <div className="text-center py-20 bg-slate-900/20 border border-dashed border-white/5 rounded-3xl">
                  <p className="text-slate-500 font-bold uppercase tracking-widest">No assets added. Start by uploading files above.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default MetadataGenerator;
