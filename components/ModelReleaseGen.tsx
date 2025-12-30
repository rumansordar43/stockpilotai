import React, { useState } from 'react';

const ModelReleaseGen: React.FC = () => {
  const [formData, setFormData] = useState({
    photographerName: '',
    modelName: '',
    shootDate: '',
    location: '',
    description: '',
  });

  const [generatedText, setGeneratedText] = useState('');

  const handleGenerate = () => {
    const text = `
MODEL RELEASE AGREEMENT

Date of Shoot: ${formData.shootDate}
Location: ${formData.location}

I, ${formData.modelName} (Model), for good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, hereby grant to ${formData.photographerName} (Photographer), and their legal representatives, heirs, and assigns, the irrevocable and unrestricted right to use and publish photographs of me, or in which I may be included, for editorial, trade, advertising, and any other purpose and in any manner and medium; to alter the same without restriction; and to copyright the same.

I hereby release the Photographer and their legal representatives and assigns from all claims and liability relating to said photographs.

Description of Scene/Shoot:
${formData.description}

AGREED TO:

Model Signature: ___________________________
Printed Name: ${formData.modelName}
Date: ${formData.shootDate}

Photographer Signature: ____________________
Printed Name: ${formData.photographerName}
Date: ${formData.shootDate}
    `;
    setGeneratedText(text.trim());
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    alert('Release Form Copied!');
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      <div className="glass-panel p-8 rounded-3xl mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-6">Model Release Generator</h2>
        <p className="text-slate-400 mb-8">Create standard model releases for your photoshoots instantly.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Photographer Name</label>
                    <input 
                        type="text" 
                        value={formData.photographerName}
                        onChange={(e) => setFormData({...formData, photographerName: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        placeholder="Your Name"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Model Name</label>
                    <input 
                        type="text" 
                        value={formData.modelName}
                        onChange={(e) => setFormData({...formData, modelName: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        placeholder="Model's Full Name"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shoot Date</label>
                    <input 
                        type="date" 
                        value={formData.shootDate}
                        onChange={(e) => setFormData({...formData, shootDate: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                    <input 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        placeholder="City, Studio Name, etc."
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shoot Description</label>
                    <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-24"
                        placeholder="Briefly describe the shoot..."
                    />
                </div>
                <button 
                    onClick={handleGenerate}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all"
                >
                    Generate Document
                </button>
            </div>

            <div className="bg-white text-black p-8 rounded-xl font-serif text-sm leading-relaxed overflow-y-auto max-h-[600px] shadow-2xl relative">
                {generatedText ? (
                    <>
                        <pre className="whitespace-pre-wrap font-serif">{generatedText}</pre>
                        <button 
                            onClick={copyToClipboard}
                            className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-sans font-bold hover:bg-blue-700 transition-colors"
                        >
                            Copy Text
                        </button>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 italic text-center p-8">
                        Fill out the form to generate a preview of your Model Release.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ModelReleaseGen;