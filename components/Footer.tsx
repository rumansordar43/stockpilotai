
import React from 'react';
import { AppView } from '../types';

interface FooterProps {
  onNav: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNav }) => {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-900/50 backdrop-blur-md mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          
          {/* Logo & Tagline */}
          <div className="text-center lg:text-left">
             <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="font-display font-bold text-2xl text-white">StockPilot<span className="text-teal-400">AI</span></span>
             </div>
             <p className="text-slate-500 text-sm max-w-xs mx-auto lg:mx-0">
                The ultimate AI-powered workspace for global microstock contributors. Research, optimize, and create with data.
             </p>
          </div>

          {/* SEO Info Section (Market Intelligence) */}
          <div className="text-center lg:text-left">
             <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Market Intelligence</h4>
             <p className="text-slate-500 text-xs leading-relaxed">
                StockPilotAI is designed for professionals selling <strong>Stock Photos, Vector Illustrations, and AI Art</strong>. Our engine provides automated keywording for <strong>Adobe Stock</strong>, title generation for <strong>Shutterstock</strong>, and trend analysis for <strong>Freepik</strong> and <strong>Getty Images</strong>. Maximize your visibility in the microstock marketplace.
             </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center lg:items-end gap-4 text-sm text-slate-400 font-medium">
             <h4 className="text-white font-bold mb-2 uppercase tracking-widest text-xs">Navigation</h4>
             <button onClick={() => onNav(AppView.DASHBOARD)} className="hover:text-blue-400 transition-colors">Trending Niches</button>
             <button onClick={() => onNav(AppView.METADATA)} className="hover:text-blue-400 transition-colors">Metadata Generator</button>
             <button onClick={() => onNav(AppView.PRIVACY)} className="hover:text-blue-400 transition-colors">Privacy Policy</button>
             <button onClick={() => onNav(AppView.TERMS)} className="hover:text-blue-400 transition-colors">Terms of Service</button>
             <button onClick={() => onNav(AppView.PORTFOLIO)} className="hover:text-blue-400 transition-colors">About Creator</button>
          </div>
        </div>

        {/* Credit Line */}
        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>&copy; {new Date().getFullYear()} StockPilotAI. All rights reserved. Professional Stock Intelligence.</p>
            <p className="flex items-center gap-1">
                Designed & Developed by <span className="text-slate-400 font-bold">Md Ibrahim</span>
                <span className="text-red-500 animate-pulse">♥</span>
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
