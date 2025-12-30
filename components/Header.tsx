
import React, { useState } from 'react';
import { AppView, User } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNav: (view: AppView) => void;
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNav, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', view: AppView.DASHBOARD, icon: '🏠' },
    { label: 'Keywords', view: AppView.KEYWORDS, icon: '🔍' },
    { label: 'Metadata', view: AppView.METADATA, icon: '🏷️' },
    { label: 'Prompts', view: AppView.PROMPTS, icon: '🎨' },
    { label: 'POD Studio', view: AppView.TSHIRTS, icon: '👕' },
    { label: 'PNG Studio', view: AppView.PNG_STUDIO, icon: '🖼️' },
    { label: 'Explorer', view: AppView.NICHE_EXPLORER, icon: '🧭' },
    { label: 'Battle', view: AppView.NICHE_BATTLE, icon: '⚔️' },
    { label: 'Release', view: AppView.MODEL_RELEASE, icon: '📄' },
    { label: 'Scripts', view: AppView.SCRIPTS, icon: '📜' },
    { label: 'Portfolio', view: AppView.PORTFOLIO, icon: '👨‍💻' },
  ];

  const handleMobileNav = (view: AppView) => {
    onNav(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] px-3 md:px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center glass-panel rounded-full px-4 md:px-6 py-2 border border-white/20 shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl bg-slate-950/80">
          
          {/* Left: Brand Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group flex-shrink-0 mr-4"
            onClick={() => onNav(AppView.DASHBOARD)}
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M55 15 L25 55 L45 55 L35 85 L75 45 L55 45 L65 15 Z" fill="white" />
              </svg>
            </div>
            <span className="hidden xl:inline font-display font-bold text-lg text-white tracking-tight whitespace-nowrap">
              StockPilot<span className="text-teal-400">AI</span>
            </span>
          </div>

          {/* Center: Main Navigation - Forced display on medium/large screens */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-1 overflow-x-auto no-scrollbar py-1 px-2 mx-2 border-x border-white/5">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => onNav(item.view)}
                className={`px-3 lg:px-4 py-2 rounded-full text-[11px] font-extrabold transition-all duration-300 whitespace-nowrap border ${
                  currentView === item.view 
                  ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105' 
                  : 'text-slate-200 border-transparent hover:text-white hover:bg-white/10 hover:border-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Actions Area */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {/* Settings */}
            <button 
              onClick={() => onNav(AppView.SETTINGS)}
              className="p-2.5 rounded-full bg-slate-800 border border-white/10 text-white hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-lg"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full bg-blue-600 text-white shadow-lg transition-all"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              )}
            </button>

            {/* Logout (Desktop Only) */}
            <button 
              onClick={onLogout}
              className="hidden lg:flex p-2.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-lg"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[110] md:hidden bg-[#020617]/98 backdrop-blur-3xl animate-fade-in flex flex-col pt-24 px-6 overflow-y-auto">
          <div className="flex flex-col gap-2 pb-24">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-6 text-center">Master Control</span>
            
            <div className="grid grid-cols-1 gap-3">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleMobileNav(item.view)}
                  className={`flex items-center justify-between px-6 py-5 rounded-2xl text-base font-bold transition-all border ${
                    currentView === item.view 
                    ? 'bg-blue-600 text-white border-blue-400 shadow-xl' 
                    : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    {item.label}
                  </div>
                  {currentView === item.view && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                </button>
              ))}
            </div>
            
            <div className="mt-10 pt-10 border-t border-white/10">
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl bg-red-600 text-white font-bold shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
