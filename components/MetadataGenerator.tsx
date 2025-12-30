
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeneratedMetadata, MetadataConfig, MetadataBatchItem, AppView } from '../types';
import { generateImageMetadata, generateMetadataFromFilename } from '../services/geminiService';

interface MetadataGeneratorProps {
    onNav: (view: AppView) => void;
}

const MetadataGenerator: React.FC<MetadataGeneratorProps> = ({ onNav }) => {
  const [config, setConfig] = useState<MetadataConfig>({
      titleLength: 'Medium',
      descLength: 'Detailed',
      keywordCount: 40
  });

  const [queue, setQueue] = useState<MetadataBatchItem[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const isCurrentlyFetching = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
        Object.values(previews).forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Main Queue Processor
  const processNextInQueue = useCallback(async () => {
    // Only proceed if not already fetching and processing is toggled on
    if (isCurrentlyFetching.current || !isProcessing) return;

    const nextPendingItem = queue.find(item => item.status === 'pending');
    
    if (!nextPendingItem) {
        setIsProcessing(false);
        return;
    }

    isCurrentlyFetching.current = true;

    // Update status to processing
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

        if (result && result.title && result.keywords) {
            setQueue(prev => prev.map(it => it.id === nextPendingItem.id ? { ...it, status: 'completed', metadata: result } : it));
        } else {
            setQueue(prev => prev.map(it => it.id === nextPendingItem.id ? { ...it, status: 'error', errorMsg: 'Empty or invalid response from AI' } : it));
        }
    } catch (err: any) {
        setQueue(prev => prev.map(it => it.id === nextPendingItem.id ? { ...it, status: 'error', errorMsg: err.message || 'Processing failed' } : it));
    } finally {
        isCurrentlyFetching.current = false;
    }
  }, [queue, config, isProcessing]);

  // Trigger processor when queue or processing status changes
  useEffect(() => {
    if (isProcessing) {
        const timer = setTimeout(() => {
            processNextInQueue();
        }, 100); // Small delay to allow UI to breathe
        return () => clearTimeout(timer);
    }
  }, [isProcessing, queue, processNextInQueue]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      
      const newItems = Array.from(e.target.files).map(file => {
          const id = Math.random().toString(36).substr(2, 9);
          
          if (file.type.startsWith('image/')) {
              const url = URL.createObjectURL(file);
              setPreviews(prev => ({ ...prev, [id]: url }));
          }

          return {
              id,
              file: file,
              status: 'pending' as const
          };
      });

      setQueue(prev => [...prev, ...newItems]);
      // Reset input so the same files can be selected again if cleared
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startBatch = () => {
      if (queue.some(i => i.status === 'pending')) {
          setIsProcessing(true);
      }
  };

  const clearQueue = () => {
      if (isProcessing) return;
      Object.values(previews).forEach(url => URL.revokeObjectURL(url));
      setPreviews({});
      setQueue([]);
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

  const completedCount = queue.filter(i => i.status === 'completed').length;
  const progress = queue.length > 0 ? (completedCount / queue.length) * 100 : 0;

  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 pb-20 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-3xl sticky top-24">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="text-blue-400">⚙️</span> Settings
                  </h2>

                  <div className="space-y-6">
                      <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Title Length</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['Short', 'Medium', 'Long'].map((opt) => (
                                  <button 
                                    key={opt}
                                    onClick={() => setConfig({...config, titleLength: opt as any})}
                                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${config.titleLength === opt ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'}`}
                                  >
                                      {opt}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description Detail</label>
                          <div className="grid grid-cols-2 gap-2">
                              {['Concise', 'Detailed'].map((opt) => (
                                  <button 
                                    key={opt}
                                    onClick={() => setConfig({...config, descLength: opt as any})}
                                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${config.descLength === opt ? 'bg-teal-600 border-teal-500 text-white' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'}`}
                                  >
                                      {opt}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Keywords: {config.keywordCount}</label>
                          <input 
                            type="range" 
                            min="10" 
                            max="50" 
                            step="5"
                            value={config.keywordCount}
                            onChange={(e) => setConfig({...config, keywordCount: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                      <div className="pt-6 border-t border-white/5">
                          <button 
                             onClick={downloadCSV}
                             disabled={completedCount === 0}
                             className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                          >
                              Export CSV
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
              <div className="glass-panel p-8 rounded-3xl min-h-[600px] flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div>
                        <h1 className="text-3xl font-display font-bold text-white">Bulk Metadata Engine</h1>
                        <p className="text-slate-400 text-sm mt-1">Llama 4 Scout Vision powered analysis with image previews.</p>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                          {queue.length > 0 && (
                              <>
                                <button 
                                    onClick={clearQueue}
                                    disabled={isProcessing}
                                    className="text-red-400 hover:text-red-300 px-4 py-2 font-bold text-sm disabled:opacity-30 whitespace-nowrap"
                                >
                                    Clear All
                                </button>
                                <button 
                                    onClick={startBatch}
                                    disabled={isProcessing || !queue.some(q => q.status === 'pending')}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 flex-grow sm:flex-grow-0 justify-center"
                                >
                                    {isProcessing ? 'Processing...' : `Start Batch (${queue.filter(q => q.status === 'pending').length})`}
                                </button>
                              </>
                          )}
                      </div>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all mb-8 ${queue.length === 0 ? 'bg-slate-900/30 border-white/20 hover:border-blue-500 py-20' : 'bg-slate-900/10 border-white/10 hover:border-white/30 py-6'}`}
                  >
                      <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef} 
                        onChange={handleFiles} 
                        className="hidden" 
                        accept="image/jpeg,image/png,image/webp,.eps,.ai,.psd"
                      />
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          </div>
                          <div className="text-left">
                              <h3 className="text-white font-bold">Add Files</h3>
                              <p className="text-slate-500 text-xs">Images will show visual previews</p>
                          </div>
                      </div>
                  </div>

                  {queue.length > 0 && (
                      <div className="mb-6">
                          <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                              <span>Progress</span>
                              <span>{completedCount} / {queue.length}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-blue-500 to-teal-400 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                          </div>
                      </div>
                  )}

                  <div className="flex-grow bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                      <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <div className="col-span-1">Preview</div>
                          <div className="col-span-4 sm:col-span-5">Filename</div>
                          <div className="col-span-3 sm:col-span-2">Status</div>
                          <div className="col-span-4 text-right">Action</div>
                      </div>
                      
                      <div className="overflow-y-auto custom-scrollbar max-h-[500px]">
                          {queue.length === 0 ? (
                              <div className="p-10 text-center text-slate-500">
                                  No files in queue.
                              </div>
                          ) : (
                              queue.map((item, idx) => (
                                  <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center text-sm">
                                      <div className="col-span-1">
                                          {previews[item.id] ? (
                                              <img src={previews[item.id]} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                                          ) : (
                                              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-500 uppercase font-bold">
                                                  {item.file.name.split('.').pop()}
                                              </div>
                                          )}
                                      </div>
                                      <div className="col-span-4 sm:col-span-5 text-slate-200 truncate font-medium" title={item.file.name}>{item.file.name}</div>
                                      <div className="col-span-3 sm:col-span-2">
                                          {item.status === 'pending' && <span className="text-slate-500 text-xs">Waiting...</span>}
                                          {item.status === 'processing' && <span className="text-blue-400 text-xs font-bold animate-pulse">Analyzing...</span>}
                                          {item.status === 'completed' && <span className="text-green-400 text-xs font-bold">Done</span>}
                                          {item.status === 'error' && <span className="text-red-400 text-[10px] font-bold leading-tight" title={item.errorMsg}>Failed</span>}
                                      </div>
                                      <div className="col-span-4 text-right space-x-1 sm:space-x-2">
                                          {item.status === 'completed' && item.metadata ? (
                                              <>
                                                <button 
                                                  onClick={() => navigator.clipboard.writeText(item.metadata!.title)}
                                                  className="text-[9px] sm:text-[10px] font-bold text-blue-400 hover:text-white border border-blue-500/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-blue-600/20"
                                                >
                                                    Title
                                                </button>
                                                <button 
                                                  onClick={() => navigator.clipboard.writeText(item.metadata!.keywords.join(', '))}
                                                  className="text-[9px] sm:text-[10px] font-bold text-teal-400 hover:text-white border border-teal-500/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-teal-600/20"
                                                >
                                                    Tags
                                                </button>
                                              </>
                                          ) : item.status === 'error' ? (
                                              <button 
                                                onClick={() => setQueue(prev => prev.map(it => it.id === item.id ? {...it, status: 'pending'} : it))}
                                                className="text-[9px] sm:text-[10px] font-bold text-orange-400 hover:text-white border border-orange-500/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-orange-600/20"
                                              >
                                                Retry
                                              </button>
                                          ) : null}
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default MetadataGenerator;
