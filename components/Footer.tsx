import React from 'react';
import { AppView } from '../types';

interface FooterProps {
  onNav: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNav }) => {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-900/50 backdrop-blur-md mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
             <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="font-display font-bold text-xl text-white">StockPilot<span className="text-teal-400">AI</span></span>
             </div>
             <p className="text-slate-500 text-sm">Empowering Microstock Contributors worldwide.</p>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm text-slate-400 font-medium">
             <button onClick={() => onNav(AppView.PRIVACY)} className="hover:text-blue-400 transition-colors">Privacy Policy</button>
             <button onClick={() => onNav(AppView.TERMS)} className="hover:text-blue-400 transition-colors">Terms of Service</button>
             <button onClick={() => onNav(AppView.PORTFOLIO)} className="hover:text-blue-400 transition-colors">About Creator</button>
          </div>
        </div>

        {/* Credit Line */}
        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>&copy; {new Date().getFullYear()} StockPilotAI. All rights reserved.</p>
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