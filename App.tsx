
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import TrendCard from './components/TrendCard';
import TrendDetail from './components/TrendDetail';
import KeywordFinder from './components/KeywordFinder';
import MetadataGenerator from './components/MetadataGenerator';
import PromptGenerator from './components/PromptGenerator';
import TShirtStudio from './components/TShirtStudio'; 
import PngStudio from './components/PngStudio';
import ModelReleaseGen from './components/ModelReleaseGen';
import NicheBattle from './components/NicheBattle';
import Portfolio from './components/Portfolio';
import NicheExplorer from './components/NicheExplorer';
import ScriptsHub from './components/ScriptsHub';
import Footer from './components/Footer';
import SupportWidget from './components/SupportWidget';
import AdminPanel from './components/AdminPanel';
import Settings from './components/Settings';
import AuthPage from './components/AuthPage';
import { PrivacyPolicy, TermsOfService } from './components/LegalPages';
import { AppView, Trend, User } from './types';
import { fetchDailyTrends, fetchMonthlyTrends, fetchTShirtTrends, setGlobalErrorListener, setDynamicApiKey } from './services/geminiService';

const ADMIN_EMAIL = 'rumansordar43@gmail.com';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<Trend[]>([]);
  const [tshirtTrends, setTshirtTrends] = useState<Trend[]>([]);
  
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingTshirts, setLoadingTshirts] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);

  const [savedTrends, setSavedTrends] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedSession = localStorage.getItem('mock_session');
    if (savedSession) {
        const user = JSON.parse(savedSession);
        setCurrentUser(user);
        setIsAuthenticated(true);
    }
    setAuthLoading(false);

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const systemKey = localStorage.getItem('system_api_key');
    if (systemKey) setDynamicApiKey(systemKey);

    setGlobalErrorListener((msg) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 5000);
    });

    checkAndLoadData();
  }, []);

  const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('mock_session', JSON.stringify(user));
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      localStorage.removeItem('mock_session');
      setCurrentView(AppView.DASHBOARD);
  };

  const checkAndLoadData = async () => {
      const lastUpdate = localStorage.getItem('last_trend_update');
      const cachedTrends = localStorage.getItem('cached_trends');
      const cachedMonthly = localStorage.getItem('cached_monthly');
      const updateIntervalHours = parseInt(localStorage.getItem('system_update_interval') || '24');
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      const isExpired = !lastUpdate || (now - parseInt(lastUpdate)) > (updateIntervalHours * oneHour);

      if (!isExpired && cachedTrends && cachedMonthly) {
          try {
            setTrends(JSON.parse(cachedTrends));
            setMonthlyTrends(JSON.parse(cachedMonthly));
            setLoadingTrends(false);
          } catch(e) {
            await loadAllDashboardData();
          }
      } else {
          await loadAllDashboardData();
          localStorage.setItem('last_trend_update', now.toString());
      }
  };

  /**
   * SEQUENTIAL LOADING LOGIC
   * We fetch sections one after another to prevent browser lag and API rate limiting.
   */
  const loadAllDashboardData = async () => {
    setLoadingTrends(true);
    setLoadingMonthly(true);
    try {
        // 1. Load Daily Trends first
        const daily = await fetchDailyTrends();
        setTrends(daily);
        setLoadingTrends(false);

        // Small delay to let the UI breath
        await new Promise(r => setTimeout(r, 300));

        // 2. Load Monthly Trends after Daily finishes
        const monthly = await fetchMonthlyTrends();
        setMonthlyTrends(monthly);
        setLoadingMonthly(false);

        localStorage.setItem('cached_trends', JSON.stringify(daily));
        localStorage.setItem('cached_monthly', JSON.stringify(monthly));
    } catch (error) {
        console.error("Failed to load dashboard data", error);
        setLoadingTrends(false);
        setLoadingMonthly(false);
    }
  };

  const handleSystemKeyUpdate = (key: string) => {
      setDynamicApiKey(key);
  };

  const toggleTheme = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
  };

  const handleNav = async (view: AppView) => {
    setCurrentView(view);
    setSelectedTrend(null);
    window.scrollTo(0,0);
    
    if (view === AppView.TSHIRTS && tshirtTrends.length === 0) {
      setLoadingTshirts(true);
      try {
          const data = await fetchTShirtTrends();
          setTshirtTrends(data);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingTshirts(false);
      }
    }
  };

  const handleTrendClick = (trend: Trend) => {
    setSelectedTrend(trend);
    setCurrentView(AppView.DETAIL);
    window.scrollTo(0,0);
  };

  const handleToggleSave = (id: string) => {
    setSavedTrends(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  if (authLoading) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  if (!isAuthenticated) {
      return <AuthPage onAuthSuccess={handleLoginSuccess} />;
  }

  if (currentView === AppView.ADMIN && currentUser?.email === ADMIN_EMAIL) {
      return (
          <AdminPanel 
            onLogout={handleLogout}
            onUpdateApiKey={handleSystemKeyUpdate}
            onNav={handleNav}
          />
      );
  }

  return (
    <div className="min-h-screen text-text-main font-sans selection:bg-blue-500 selection:text-white pb-0 flex flex-col perspective-container transition-colors duration-500">
      
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[100] animate-fade-in-up">
           <div className={`glass-panel p-4 rounded-xl border ${toastMessage.includes('LIMIT') || toastMessage.includes('MISSING') ? 'border-red-500/50 bg-red-900/80' : 'border-red-500/50 bg-surface/90'} shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center gap-3 max-w-sm backdrop-blur-xl`}>
               <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <div>
                  <h4 className="text-text-main font-bold text-sm">System Notice</h4>
                  <p className="text-text-muted text-xs leading-tight">{toastMessage}</p>
               </div>
               <button onClick={() => setToastMessage(null)} className="ml-auto text-text-muted hover:text-text-main">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
           </div>
        </div>
      )}

      <SupportWidget />

      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="glass-panel rounded-full px-4 py-2 flex items-center shadow-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl w-full max-w-7xl">
            
            <div className="flex items-center gap-2 px-2 cursor-pointer group flex-shrink-0" onClick={() => handleNav(AppView.DASHBOARD)}>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="font-display font-bold text-lg md:text-xl tracking-tight text-text-main hidden lg:inline group-hover:text-blue-500 transition-colors">StockPilot<span className="text-teal-400">AI</span></span>
            </div>

            <div className="flex-1 flex justify-center overflow-hidden mx-4">
              <div className="nav-container-custom max-w-full">
                <NavBtn label="Dashboard" active={currentView === AppView.DASHBOARD} onClick={() => handleNav(AppView.DASHBOARD)} />
                <NavBtn label="T-Shirts" active={currentView === AppView.TSHIRTS} onClick={() => handleNav(AppView.TSHIRTS)} />
                <NavBtn label="PNG" active={currentView === AppView.PNG_STUDIO} onClick={() => handleNav(AppView.PNG_STUDIO)} />
                <NavBtn label="Metadata" active={currentView === AppView.METADATA} onClick={() => handleNav(AppView.METADATA)} />
                <NavBtn label="Prompts" active={currentView === AppView.PROMPTS} onClick={() => handleNav(AppView.PROMPTS)} />
                <NavBtn label="Scripts" active={currentView === AppView.SCRIPTS} onClick={() => handleNav(AppView.SCRIPTS)} />
                <NavBtn label="Niche Battle" active={currentView === AppView.NICHE_BATTLE} onClick={() => handleNav(AppView.NICHE_BATTLE)} />
                <NavBtn label="Model Release" active={currentView === AppView.MODEL_RELEASE} onClick={() => handleNav(AppView.MODEL_RELEASE)} />
                <NavBtn label="Portfolio" active={currentView === AppView.PORTFOLIO} onClick={() => handleNav(AppView.PORTFOLIO)} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 pr-2 flex-shrink-0">
                <button onClick={toggleTheme} className="p-2 md:p-2.5 rounded-full bg-surface/50 border border-border text-text-muted hover:text-text-main hover:bg-surface transition-all">
                    {theme === 'dark' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>
                
                {currentUser?.email === ADMIN_EMAIL && (
                  <button onClick={() => handleNav(AppView.ADMIN)} className={`p-2 md:p-2.5 rounded-full border transition-all ${currentView === AppView.ADMIN ? 'bg-purple-600 border-purple-500 text-white' : 'bg-surface/50 border-border text-text-muted hover:text-text-main hover:bg-surface'}`} title="Admin Panel">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                )}
                
                <button onClick={() => handleNav(AppView.SETTINGS)} className={`p-2 md:p-2.5 rounded-full border transition-all ${currentView === AppView.SETTINGS ? 'bg-blue-600 border-blue-500 text-white' : 'bg-surface/50 border-border text-text-muted hover:text-text-main hover:bg-surface'}`} title="API Settings">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </button>

                <button onClick={handleLogout} className="p-2 md:p-2.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all" title="Logout">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </nav>
      </div>

      <main className="flex-grow pt-4">
        {currentView === AppView.DASHBOARD && (
          <>
            <Hero />
            <div className="max-w-[1400px] mx-auto px-6 space-y-20 pb-20">
              <div className="relative z-20 animate-fade-in-up">
                 <KeywordFinder onNav={handleNav} />
                 <div className="text-center mt-6">
                     <button onClick={() => handleNav(AppView.NICHE_EXPLORER)} className="text-text-muted hover:text-blue-500 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mx-auto">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                         Explore All Niches
                     </button>
                 </div>
              </div>
              <div className="animate-fade-in-up">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div className="pl-4 border-l-4 border-teal-500 py-2 bg-gradient-to-r from-teal-500/10 to-transparent rounded-r-xl w-full md:w-auto">
                        <h2 className="text-3xl font-display font-bold text-text-main flex items-center gap-3">
                            Today's Trending Topics
                        </h2>
                    </div>
                </div>
                {loadingTrends ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="rounded-3xl bg-surface/50 animate-pulse border border-border h-80"></div>)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trends.map((trend, idx) => (
                      <div key={trend.id} className="animate-fade-in-up">
                          <TrendCard trend={trend} onClick={handleTrendClick} isSaved={savedTrends.has(trend.id)} onToggleSave={handleToggleSave} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="animate-fade-in-up">
                 <div className="flex items-center justify-between mb-10 pl-4 border-l-4 border-blue-500 py-2 bg-gradient-to-r from-blue-500/10 to-transparent rounded-r-xl">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-text-main">Seasonal Opportunities</h2>
                        <p className="text-text-muted mt-1 text-sm">Next 60 days events</p>
                    </div>
                 </div>
                 {loadingMonthly ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       {[1,2,3].map(i => <div key={i} className="h-48 bg-surface/50 animate-pulse rounded-3xl border border-border"></div>)}
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {monthlyTrends.map((trend, idx) => (
                         <div key={trend.id} className="animate-fade-in-up">
                            <TrendCard trend={trend} onClick={handleTrendClick} isSaved={savedTrends.has(trend.id)} onToggleSave={handleToggleSave} />
                         </div>
                      ))}
                    </div>
                 )}
              </div>
            </div>
          </>
        )}

        {currentView === AppView.NICHE_EXPLORER && <div className="pt-28 px-6 animate-fade-in-up"><NicheExplorer onTrendClick={handleTrendClick} savedTrends={savedTrends} onToggleSave={handleToggleSave} onBack={() => handleNav(AppView.DASHBOARD)} onNav={handleNav} /></div>}
        {currentView === AppView.TSHIRTS && <div className="pt-28 px-6 max-w-7xl mx-auto animate-fade-in">{loadingTshirts ? <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-surface/50 animate-pulse rounded-3xl border border-border"></div>)}</div> : <TShirtStudio trends={tshirtTrends} onTrendClick={handleTrendClick} savedTrends={savedTrends} onToggleSave={handleToggleSave} onNav={handleNav} />}</div>}
        {currentView === AppView.PNG_STUDIO && <div className="pt-28 px-6 max-w-7xl mx-auto animate-fade-in"><PngStudio onTrendClick={handleTrendClick} savedTrends={savedTrends} onToggleSave={handleToggleSave} onNav={handleNav} /></div>}
        {currentView === AppView.DETAIL && selectedTrend && <div className="pt-24 animate-fade-in-up"><TrendDetail trend={selectedTrend} onBack={() => handleNav(AppView.DASHBOARD)} onNav={handleNav} /></div>}
        {currentView === AppView.METADATA && <div className="pt-28 px-6 animate-fade-in-up"><MetadataGenerator onNav={handleNav} /></div>}
        {currentView === AppView.PROMPTS && <div className="pt-28 px-6 animate-fade-in-up"><PromptGenerator onNav={handleNav} /></div>}
        {currentView === AppView.SCRIPTS && <div className="pt-28 px-6 animate-fade-in-up"><ScriptsHub /></div>}
        {currentView === AppView.MODEL_RELEASE && <div className="pt-28 px-6 animate-fade-in-up"><ModelReleaseGen /></div>}
        {currentView === AppView.NICHE_BATTLE && <div className="pt-28 px-6 animate-fade-in-up"><NicheBattle onNav={handleNav} /></div>}
        {currentView === AppView.PORTFOLIO && <div className="pt-28 px-6 animate-fade-in-up"><Portfolio /></div>}
        {currentView === AppView.PRIVACY && <PrivacyPolicy />}
        {currentView === AppView.TERMS && <TermsOfService />}
        {currentView === AppView.SETTINGS && <Settings />}
      </main>

      <Footer onNav={handleNav} />
      
      <div className="md:hidden fixed bottom-6 left-6 right-6 glass-panel rounded-2xl flex justify-around p-3 z-50 shadow-2xl border border-border backdrop-blur-xl bg-surface/90">
         <MobileNavBtn label="Trends" active={currentView === AppView.DASHBOARD} onClick={() => handleNav(AppView.DASHBOARD)} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />} />
         <MobileNavBtn label="PNG" active={currentView === AppView.PNG_STUDIO} onClick={() => handleNav(AppView.PNG_STUDIO)} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />} />
         <MobileNavBtn label="T-Shirts" active={currentView === AppView.TSHIRTS} onClick={() => handleNav(AppView.TSHIRTS)} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.417 5.416a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />} />
         {currentUser?.email === ADMIN_EMAIL && <MobileNavBtn label="Admin" active={currentView === AppView.ADMIN} onClick={() => handleNav(AppView.ADMIN)} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />} />}
      </div>
    </div>
  );
};

const NavBtn = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`nav-btn-custom ${active ? 'active' : ''}`}>{label}</button>
);

const MobileNavBtn = ({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors flex-shrink-0 min-w-[60px] ${active ? 'text-blue-500 bg-blue-500/10' : 'text-text-muted hover:text-text-main'}`}>
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
    <span className="font-bold text-[10px] uppercase tracking-wide truncate">{label}</span>
  </button>
);

export default App;
