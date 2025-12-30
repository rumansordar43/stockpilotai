import React, { useState, useEffect } from 'react';
import Header from './components/Header';
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
import { fetchDailyTrends, fetchMonthlyTrends, fetchTShirtTrends, regenerateTrend, setGlobalErrorListener } from './services/geminiService';

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

    setGlobalErrorListener((msg) => {
      setToastMessage(msg);
      // Remove toast after delay unless it's a critical quota issue
      if (!msg.toLowerCase().includes('limit') && !msg.toLowerCase().includes('quota')) {
        setTimeout(() => setToastMessage(null), 5000);
      }
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

  const loadAllDashboardData = async () => {
    setLoadingTrends(true);
    setLoadingMonthly(true);
    try {
        const daily = await fetchDailyTrends();
        setTrends(daily);
        setLoadingTrends(false);

        await new Promise(r => setTimeout(r, 300));

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

  const handleRegenerateCard = async (targetTrend: Trend) => {
      const newTrend = await regenerateTrend(targetTrend);
      if (newTrend) {
          setTrends(prev => prev.map(t => t.id === targetTrend.id ? newTrend : t));
          setMonthlyTrends(prev => prev.map(t => t.id === targetTrend.id ? newTrend : t));
          setTshirtTrends(prev => prev.map(t => t.id === targetTrend.id ? newTrend : t));
      }
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
            onNav={handleNav}
          />
      );
  }

  return (
    <div className="min-h-screen text-text-main font-sans selection:bg-blue-500 selection:text-white pb-0 flex flex-col perspective-container transition-colors duration-500">
      
      <Header 
        currentView={currentView} 
        onNav={handleNav} 
        user={currentUser} 
        onLogout={handleLogout} 
      />

      {toastMessage && (
        <div className="fixed top-24 right-6 z-[100] animate-fade-in-up">
           <div className={`glass-panel p-4 rounded-xl border border-red-500/50 bg-slate-900/95 shadow-2xl flex items-center gap-3 max-w-sm backdrop-blur-xl`}>
               <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/30 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <div className="overflow-hidden">
                  <h4 className="text-white font-bold text-sm">System Notice</h4>
                  <p className="text-slate-400 text-xs leading-tight truncate">{toastMessage}</p>
               </div>
               <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-500 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
        </div>
      )}

      <div className="flex-grow">
        {currentView === AppView.DASHBOARD && (
          <>
            <Hero />
            <div className="max-w-7xl mx-auto px-6 py-12">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-display font-bold text-white">Daily Trending Niches</h2>
                  <button onClick={loadAllDashboardData} className="text-blue-400 font-bold hover:text-white transition-colors">Refresh Data</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {loadingTrends ? (
                   [1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-slate-900/50 animate-pulse rounded-3xl border border-white/5" />)
                 ) : (
                   trends.map(t => <TrendCard key={t.id} trend={t} onClick={handleTrendClick} isSaved={savedTrends.has(t.id)} onToggleSave={handleToggleSave} onRegenerate={handleRegenerateCard} />)
                 )}
               </div>
               
               <h2 className="text-3xl font-display font-bold text-white mb-8 mt-20">Monthly Opportunities</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {loadingMonthly ? (
                   [1,2,3].map(i => <div key={i} className="h-80 bg-slate-900/50 animate-pulse rounded-3xl border border-white/5" />)
                 ) : (
                   monthlyTrends.map(t => <TrendCard key={t.id} trend={t} onClick={handleTrendClick} isSaved={savedTrends.has(t.id)} onToggleSave={handleToggleSave} onRegenerate={handleRegenerateCard} />)
                 )}
               </div>
            </div>
          </>
        )}
        
        {currentView === AppView.DETAIL && selectedTrend && <TrendDetail trend={selectedTrend} onBack={() => setCurrentView(AppView.DASHBOARD)} onNav={handleNav} />}
        {currentView === AppView.KEYWORDS && <div className="pt-24"><KeywordFinder onNav={handleNav} /></div>}
        {currentView === AppView.METADATA && <div className="pt-24"><MetadataGenerator onNav={handleNav} /></div>}
        {currentView === AppView.PROMPTS && <div className="pt-24"><PromptGenerator onNav={handleNav} /></div>}
        {currentView === AppView.TSHIRTS && <div className="pt-24"><TShirtStudio trends={tshirtTrends} onTrendClick={handleTrendClick} savedTrends={savedTrends} onToggleSave={handleToggleSave} onNav={handleNav} /></div>}
        {currentView === AppView.PNG_STUDIO && <div className="pt-24"><PngStudio onTrendClick={handleTrendClick} savedTrends={savedTrends} onToggleSave={handleToggleSave} onNav={handleNav} /></div>}
        {currentView === AppView.MODEL_RELEASE && <div className="pt-24"><ModelReleaseGen /></div>}
        {currentView === AppView.NICHE_BATTLE && <div className="pt-24"><NicheBattle onNav={handleNav} /></div>}
        {currentView === AppView.PORTFOLIO && <div className="pt-24"><Portfolio /></div>}
        {currentView === AppView.NICHE_EXPLORER && <div className="pt-24"><NicheExplorer onTrendClick={handleTrendClick} savedTrends={savedTrends} onToggleSave={handleToggleSave} onBack={() => setCurrentView(AppView.DASHBOARD)} onNav={handleNav} /></div>}
        {currentView === AppView.SCRIPTS && <div className="pt-24"><ScriptsHub /></div>}
        {currentView === AppView.PRIVACY && <div className="pt-24"><PrivacyPolicy /></div>}
        {currentView === AppView.TERMS && <div className="pt-24"><TermsOfService /></div>}
        {currentView === AppView.SETTINGS && <div className="pt-24"><Settings /></div>}
      </div>
      
      <Footer onNav={handleNav} />
      <SupportWidget />
    </div>
  );
};

export default App;