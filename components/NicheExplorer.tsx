import React, { useState } from 'react';
import { Trend, AppView } from '../types';
import TrendCard from './TrendCard';
import { fetchNichesByCategory } from '../services/geminiService';

interface NicheExplorerProps {
  onTrendClick: (trend: Trend) => void;
  savedTrends?: Set<string>;
  onToggleSave?: (id: string) => void;
  onBack: () => void;
  onNav?: (view: AppView) => void;
}

const CATEGORIES = [
  // Major Industries
  { name: 'Business', icon: '💼', desc: 'Corporate, Office, Meetings, Strategy' },
  { name: 'Technology', icon: '💻', desc: 'AI, Coding, VR, Gadgets, Hardware' },
  { name: 'Healthcare', icon: '⚕️', desc: 'Doctors, Surgery, Patient Care, Pharmacy' },
  { name: 'Finance', icon: '💰', desc: 'Banking, Crypto, Stocks, Money, Tax' },
  { name: 'Education', icon: '🎓', desc: 'School, E-Learning, University, Library' },
  { name: 'Real Estate', icon: '🏠', desc: 'Buying, Selling, Agents, Moving House' },
  { name: 'Industrial', icon: '🏭', desc: 'Factory, Manufacturing, Engineering, Tools' },
  { name: 'Construction', icon: '🏗️', desc: 'Building, Site Work, Blueprints, Safety' },
  { name: 'Transportation', icon: '🚗', desc: 'Cars, Logistics, Public Transit, Shipping' },
  { name: 'Agriculture', icon: '🚜', desc: 'Farming, Harvest, Livestock, Agritech' },
  { name: 'Energy', icon: '⚡', desc: 'Solar, Wind, Oil, Green Energy, Grid' },
  { name: 'Law & Justice', icon: '⚖️', desc: 'Court, Lawyers, Gavel, Documents' },
  { name: 'Marketing', icon: '📢', desc: 'Social Media, SEO, Advertising, PR' },
  { name: 'E-commerce', icon: '🛒', desc: 'Online Shopping, Delivery, Retail, POS' },
  { name: 'Cyber Security', icon: '🔒', desc: 'Hacking, Protection, Data Safety, Firewall' },
  
  // Lifestyle & People
  { name: 'Lifestyle', icon: '🧘', desc: 'Daily Life, Hobbies, Routine, Leisure' },
  { name: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Parents, Kids, Generations, Bonding' },
  { name: 'Seniors', icon: '👴', desc: 'Active Aging, Retirement, Care, Grandparents' },
  { name: 'Diversity', icon: '🤝', desc: 'Inclusion, Multi-cultural, Unity, Team' },
  { name: 'Wellness', icon: '🌿', desc: 'Spa, Skincare, Meditation, Self-care' },
  { name: 'Mental Health', icon: '🧠', desc: 'Therapy, Emotions, Support, Balance' },
  { name: 'Fashion', icon: '👠', desc: 'Models, Street Style, Clothing, Makeup' },
  { name: 'Spirituality', icon: '🕉️', desc: 'Religion, Yoga, Faith, Meditation' },
  { name: 'Social Issues', icon: '✊', desc: 'Protests, Climate, Rights, Charity' },

  // Food & Drink
  { name: 'Food', icon: '🍔', desc: 'Culinary, Ingredients, Dishes, Chefs' },
  { name: 'Beverages', icon: '☕', desc: 'Coffee, Tea, Cocktails, Smoothies' },
  { name: 'Desserts', icon: '🍰', desc: 'Cakes, Baking, Sweets, Chocolate' },
  { name: 'Healthy Eating', icon: '🥗', desc: 'Salads, Keto, Vegan, Diet, Fruits' },
  
  // Nature & Environment
  { name: 'Nature', icon: '🌲', desc: 'Forests, Landscapes, Mountains, Rivers' },
  { name: 'Wildlife', icon: '🦁', desc: 'Safari, Zoo, Wild Animals, Birds' },
  { name: 'Marine Life', icon: '🐠', desc: 'Underwater, Fish, Coral, Ocean' },
  { name: 'Pets', icon: '🐾', desc: 'Dogs, Cats, Care, Training, Cute' },
  { name: 'Gardening', icon: '🌻', desc: 'Plants, Flowers, Backyard, Botany' },
  { name: 'Sustainability', icon: '♻️', desc: 'Recycling, Zero Waste, Eco-friendly' },
  { name: 'Space', icon: '🚀', desc: 'Astronomy, Stars, Planets, Galaxy' },
  { name: 'Weather', icon: '⛈️', desc: 'Rain, Storm, Clouds, Seasons' },

  // Hobbies & Activities
  { name: 'Travel', icon: '✈️', desc: 'Tourism, Airports, Landmarks, Vacation' },
  { name: 'Sports', icon: '⚽', desc: 'Football, Basketball, Team Games, Fans' },
  { name: 'Fitness', icon: '💪', desc: 'Gym, Workout, Running, Bodybuilding' },
  { name: 'Gaming', icon: '🎮', desc: 'Esports, Console, VR, Streaming' },
  { name: 'Music', icon: '🎵', desc: 'Instruments, Concerts, DJ, Audio' },
  { name: 'Art & Crafts', icon: '🎨', desc: 'Painting, DIY, Pottery, Sketching' },
  { name: 'Camping', icon: '⛺', desc: 'Outdoors, Hiking, Tents, Bonfire' },
  { name: 'Photography', icon: '📸', desc: 'Cameras, Lenses, Shooting, Studio' },

  // Concepts & Visuals
  { name: 'Abstract', icon: '🌀', desc: 'Backgrounds, Patterns, 3D, Geometric' },
  { name: 'Textures', icon: '🧱', desc: 'Wood, Stone, Fabric, Metal, Surface' },
  { name: 'Minimalist', icon: '⬜', desc: 'Clean, Copy Space, Simple, White' },
  { name: 'Vintage', icon: '📺', desc: 'Retro, Nostalgia, Old School, Antique' },
  { name: 'Interiors', icon: '🛋️', desc: 'Home Decor, Furniture, Design, Rooms' },
  { name: 'Architecture', icon: '🏛️', desc: 'Modern, Urban, Historical, Buildings' },
  { name: 'Aerial', icon: '🚁', desc: 'Drone Views, Top Down, Maps, Cityscapes' },
  { name: 'Holidays', icon: '🎉', desc: 'Christmas, Halloween, Easter, Festivals' },
  { name: 'Science', icon: '🔬', desc: 'Lab, DNA, Research, Physics, Biology' },
  { name: 'Automotive', icon: '🏎️', desc: 'Supercars, Mechanics, Racing, Repair' },
  { name: 'Weddings', icon: '💍', desc: 'Bride, Groom, Rings, Celebration' },
  { name: 'Nightlife', icon: '🌃', desc: 'Clubs, Neon, Party, City Lights' }
];

const NicheExplorer: React.FC<NicheExplorerProps> = ({ onTrendClick, savedTrends, onToggleSave, onBack, onNav }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCategoryClick = async (categoryName: string) => {
    setActiveCategory(categoryName);
    setLoading(true);
    setTrends([]);
    try {
        const results = await fetchNichesByCategory(categoryName);
        setTrends(results);
    } catch (error: any) {
        if (error.message === 'MISSING_API_KEY' && onNav) {
            onNav(AppView.SETTINGS);
        }
    } finally {
        setLoading(false);
    }
  };

  const clearCategory = () => {
      setActiveCategory(null);
      setTrends([]);
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-20 px-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Global Niche Explorer</h1>
            <p className="text-slate-400">Discover profitable opportunities across <span className="text-blue-400 font-bold">{CATEGORIES.length}+</span> industries.</p>
          </div>
          <button onClick={onBack} className="mt-4 md:mt-0 px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 transition-colors">
              Back to Dashboard
          </button>
      </div>

      {!activeCategory ? (
          // Category Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CATEGORIES.map((cat, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:-translate-y-1 transition-all group flex items-start gap-4"
                  >
                      <div className="w-10 h-10 bg-slate-900/50 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                          {cat.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      ) : (
          // Results Section
          <div>
              <div className="flex items-center gap-4 mb-8">
                  <button onClick={clearCategory} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <h2 className="text-2xl font-bold text-white">
                      Trending in <span className="text-blue-400">{activeCategory}</span>
                  </h2>
              </div>

              {loading ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 bg-slate-900/50 animate-pulse rounded-3xl border border-white/5 shadow-lg"></div>
                        ))}
                    </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
                      {trends.map((trend, idx) => (
                        <div key={trend.id} style={{ animationDelay: `${idx * 0.1}s` }} className="animate-fade-in-up">
                            <TrendCard 
                                trend={trend} 
                                onClick={onTrendClick}
                                isSaved={savedTrends?.has(trend.id)}
                                onToggleSave={onToggleSave}
                            />
                        </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default NicheExplorer;