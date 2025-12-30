import React, { useState } from 'react';

const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
       
       {/* Popup Panel */}
       {isOpen && (
           <div className="mb-4 w-72 md:w-80 glass-panel p-5 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up origin-bottom-right relative overflow-hidden">
               {/* Decorative Gradient */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-500"></div>
               
               <div className="flex justify-between items-start mb-3">
                   <h3 className="font-bold text-white text-lg">Need Help?</h3>
                   <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
               </div>
               
               <p className="text-sm text-slate-300 leading-relaxed mb-4">
                   Facing any issues or have a cool feature idea? I'm listening! Message me directly on WhatsApp.
               </p>
               
               <a 
                 href="https://wa.me/8801632395882" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20 btn-3d"
               >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-9.676-.272-.099-.47-.149-.669-.149-.198 0-.42.001-.643.001-.223 0-.585.085-.891.42-.306.334-1.177 1.15-1.177 2.805 0 1.655 1.203 3.253 1.37 3.476.168.223 2.368 3.618 5.736 5.071 2.803 1.21 3.374.969 3.969.907.594-.062 1.916-.783 2.188-1.539.273-.756.273-1.404.191-1.543z"/></svg>
                   Chat Support
               </a>
           </div>
       )}

       {/* Floating Toggle Button */}
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all transform hover:scale-110 ${isOpen ? 'bg-slate-700 text-slate-300' : 'bg-gradient-to-br from-blue-600 to-teal-500 text-white animate-pulse-slow'}`}
       >
           {isOpen ? (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           ) : (
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
           )}
       </button>
    </div>
  );
};

export default SupportWidget;