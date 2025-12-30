
import React, { useState, useEffect } from 'react';
import { ScriptItem, AppView, User } from '../types';

interface AdminPanelProps {
  onLogout: () => void;
  onUpdateApiKey: (key: string) => void;
  onNav: (view: AppView) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onUpdateApiKey, onNav }) => {
  const [apiKey, setApiKey] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [updateInterval, setUpdateInterval] = useState('24');
  const [lastUpdate, setLastUpdate] = useState<string>('Never');
  
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [newScript, setNewScript] = useState<Partial<ScriptItem>>({
      category: 'Illustrator',
      imageUrls: []
  });
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    const storedUsers = localStorage.getItem('mock_users');
    if (storedUsers) setUsers(JSON.parse(storedUsers));

    const sysKey = localStorage.getItem('system_api_key');
    if (sysKey) setApiKey(sysKey);

    const interval = localStorage.getItem('system_update_interval');
    if (interval) setUpdateInterval(interval);

    const last = localStorage.getItem('last_trend_update');
    if (last) setLastUpdate(new Date(parseInt(last)).toLocaleString());

    const storedScripts = localStorage.getItem('system_scripts');
    if (storedScripts) setScripts(JSON.parse(storedScripts));
  }, []);

  const handleSaveKey = () => {
      localStorage.setItem('system_api_key', apiKey);
      onUpdateApiKey(apiKey);
      alert("System Groq API Key Updated!");
  };

  const forceUpdateNow = () => {
      localStorage.removeItem('last_trend_update');
      window.location.reload();
  };

  const handleAddScript = () => {
      if (!newScript.title || !newScript.downloadUrl) {
          alert("Title and Download URL are required.");
          return;
      }
      const images = imageInput.split(',').map(url => url.trim()).filter(url => url.length > 0);
      const scriptToAdd: ScriptItem = {
          id: Math.random().toString(36).substr(2, 9),
          title: newScript.title,
          description: newScript.description || '',
          category: newScript.category as any || 'Other',
          version: newScript.version || '1.0',
          downloadUrl: newScript.downloadUrl,
          imageUrls: images,
          instructions: newScript.instructions || ''
      };
      const updatedScripts = [...scripts, scriptToAdd];
      setScripts(updatedScripts);
      localStorage.setItem('system_scripts', JSON.stringify(updatedScripts));
      setNewScript({ category: 'Illustrator', imageUrls: [] });
      setImageInput('');
  };

  const handleDeleteScript = (id: string) => {
      const updated = scripts.filter(s => s.id !== id);
      setScripts(updated);
      localStorage.setItem('system_scripts', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
        
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-8 gap-4">
            <div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Control Center</h1>
                <p className="text-slate-400">Welcome, System Admin. Backend: Groq Llama 4 Scout.</p>
            </div>
            <div className="flex gap-4">
                <button onClick={() => onNav(AppView.DASHBOARD)} className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 px-6 py-2 rounded-lg font-bold transition-colors">Go to Dashboard</button>
                <button onClick={onLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-2 rounded-lg font-bold transition-colors">Logout Session</button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-3xl border border-blue-500/30">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-blue-400">⚡</span> System Groq API Config
                </h2>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="gsk_..., gsk_..."
                        className="flex-grow bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                    />
                    <button onClick={handleSaveKey} className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-bold shadow-lg shadow-blue-900/20">Save Key</button>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-teal-500/30">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-teal-400">🕒</span> Automation Control
                </h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-sm">Last Update:</span>
                        <span className="text-white font-mono font-bold text-sm">{lastUpdate}</span>
                    </div>
                    <button onClick={forceUpdateNow} className="w-full text-xs font-bold text-blue-400 hover:text-white border border-blue-500/30 px-3 py-3 rounded-lg hover:bg-blue-600/20 transition-all">Force Update Trends Now</button>
                </div>
            </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-purple-500/30">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-purple-400">📜</span> Script Manager
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="Title" className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white" value={newScript.title || ''} onChange={e => setNewScript({...newScript, title: e.target.value})} />
                         <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white" value={newScript.category} onChange={e => setNewScript({...newScript, category: e.target.value as any})}>
                             <option value="Illustrator">Illustrator</option>
                             <option value="Photoshop">Photoshop</option>
                             <option value="Python">Python</option>
                             <option value="Other">Other</option>
                         </select>
                    </div>
                    <input type="text" placeholder="Download URL" className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white" value={newScript.downloadUrl || ''} onChange={e => setNewScript({...newScript, downloadUrl: e.target.value})} />
                    <button onClick={handleAddScript} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg">Add Script</button>
                </div>
                <div className="bg-slate-900/50 rounded-xl border border-white/5 p-4 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {scripts.map(s => (
                        <div key={s.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg mb-2">
                            <span className="text-sm font-bold">{s.title}</span>
                            <button onClick={() => handleDeleteScript(s.id)} className="text-red-400 text-xs font-bold">Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
