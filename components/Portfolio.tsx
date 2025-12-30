import React, { useEffect, useRef } from 'react';

const Portfolio: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const { clientX, clientY } = e;
        // Calculate rotation based on mouse position relative to center
        const x = (clientX / window.innerWidth - 0.5) * 4; // limit rotation degrees
        const y = (clientY / window.innerHeight - 0.5) * 4;
        
        containerRef.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
     };

     // Only add parallax on larger screens to save performance
     if (window.innerWidth > 768) {
        window.addEventListener('mousemove', handleMouseMove);
     }
     
     return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full pb-20 px-6 animate-fade-in-up perspective-container relative">
      
      {/* Background Decor - Floating Orbs */}
      <div className="absolute top-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] animate-float pointer-events-none z-0"></div>
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-float-delayed pointer-events-none z-0"></div>

      {/* 1. HERO PROFILE SECTION WITH PARALLAX */}
      <div 
        ref={containerRef} 
        className="glass-panel p-8 md:p-12 rounded-3xl mb-12 relative overflow-hidden text-center border border-blue-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-transform duration-100 ease-out z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
         {/* Background Glow */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col items-center transform translate-z-10">
            {/* Avatar / Logo Placeholder */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border-4 border-white/10 shadow-2xl flex items-center justify-center mb-6 relative group transform hover:scale-110 transition-transform duration-500 cursor-pointer">
                <span className="text-4xl drop-shadow-lg z-10">👨‍💻</span>
                <div className="absolute inset-0 rounded-full border border-blue-400/30 animate-pulse-slow"></div>
                <div className="absolute inset-0 rounded-full border-2 border-white/5 shadow-[0_0_30px_rgba(37,99,235,0.4)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-2 tracking-tight drop-shadow-xl">
               Md Ibrahim
            </h1>
            <p className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 font-bold tracking-wide uppercase mb-6 drop-shadow-sm">
               Creative Tech Specialist & Design Expert
            </p>

            <div className="max-w-3xl mx-auto bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm hover:border-blue-500/30 transition-colors shadow-inner group">
               <p className="text-slate-300 text-lg leading-relaxed font-light group-hover:text-slate-200 transition-colors">
                  "I don't just design; I engineer visual experiences. With expert mastery in <span className="text-white font-bold">Embroidery Digitization</span> and a pioneering approach to <span className="text-white font-bold">AI-Driven Microstock</span>, I merge traditional craftsmanship with futuristic technology. From building high-performance AI websites to creating bestseller Print-on-Demand assets, I help brands and clients dominate their niche with precision and creativity."
               </p>
            </div>
         </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard number="500+" label="Projects Completed" />
          <StatCard number="4+" label="Years Experience" />
          <StatCard number="10k+" label="Asset Downloads" />
          <StatCard number="100%" label="Client Satisfaction" />
      </div>

      {/* 3. SERVICES / EXPERTISE */}
      <h2 className="text-3xl font-display font-bold text-white mb-8 text-center flex items-center justify-center gap-3 relative z-10">
         <span className="h-px w-10 bg-gradient-to-r from-transparent to-blue-500"></span>
         <span className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">My Expertise</span>
         <span className="h-px w-10 bg-gradient-to-l from-transparent to-blue-500"></span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 perspective-1000 relative z-10">
          {/* Service 1: Embroidery */}
          <ServiceCard 
             icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />}
             title="Embroidery Design"
             description="Expert-level digitization. I convert complex logos and art into flawless, production-ready embroidery files for any machine format."
             color="text-purple-400"
             gradient="from-purple-500/10 to-transparent"
          />

          {/* Service 2: Microstock & POD */}
          <ServiceCard 
             icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />}
             title="Microstock & T-Shirt Design"
             description="Creating high-demand, commercial-grade visual assets and trendy T-shirt designs optimized for platforms like Shutterstock, Adobe Stock, and Merch by Amazon."
             color="text-teal-400"
             gradient="from-teal-500/10 to-transparent"
          />

          {/* Service 3: AI Web Development */}
          <ServiceCard 
             icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />}
             title="AI Website Building"
             description="Leveraging modern AI tools to build responsive, futuristic, and high-performance websites tailored to your specific business needs."
             color="text-blue-400"
             gradient="from-blue-500/10 to-transparent"
          />
      </div>

      {/* 4. CONTACT / HIRE ME */}
      <div className="glass-panel p-8 md:p-12 rounded-3xl text-center relative overflow-hidden group hover:border-blue-500/30 transition-colors duration-500 z-10">
         <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-teal-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
         {/* Decorative Blur */}
         <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
         
         <div className="relative z-10">
            <h2 className="text-4xl font-display font-bold text-white mb-4 drop-shadow-lg">Ready to Start a Project?</h2>
            <p className="text-slate-400 mb-8 text-lg">I am currently available for freelance work and collaborations.</p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center max-w-2xl mx-auto">
               <a 
                 href="mailto:rumansordar43@gmail.com"
                 className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all group btn-3d hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
               >
                  <svg className="w-6 h-6 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  rumansordar43@gmail.com
               </a>

               <a 
                 href="https://wa.me/8801632395882"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-900/20 btn-3d transform hover:-translate-y-1"
               >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-9.676-.272-.099-.47-.149-.669-.149-.198 0-.42.001-.643.001-.223 0-.585.085-.891.42-.306.334-1.177 1.15-1.177 2.805 0 1.655 1.203 3.253 1.37 3.476.168.223 2.368 3.618 5.736 5.071 2.803 1.21 3.374.969 3.969.907.594-.062 1.916-.783 2.188-1.539.273-.756.273-1.404.191-1.543z"/></svg>
                  Chat on WhatsApp
               </a>
            </div>
         </div>
      </div>

    </div>
  );
};

const StatCard = ({ number, label }: { number: string, label: string }) => (
    <div className="glass-panel glass-panel-hover p-4 md:p-6 rounded-2xl text-center border border-white/5 transition-all cursor-default group hover:bg-slate-800/50">
        <div className="text-2xl md:text-4xl font-display font-bold text-white mb-1 group-hover:text-blue-400 transition-colors drop-shadow-md">{number}</div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-bold group-hover:text-slate-200">{label}</div>
    </div>
);

const ServiceCard = ({ icon, title, description, color, gradient }: { icon: React.ReactNode, title: string, description: string, color: string, gradient: string }) => (
    <div className="glass-panel glass-panel-hover p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center group relative overflow-hidden transition-all duration-500">
        {/* Animated Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-b ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        
        <div className={`relative z-10 w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 group-hover:border-white/20 transition-all shadow-lg ${color}`}>
            <svg className="w-8 h-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
        </div>
        <h3 className="relative z-10 text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors drop-shadow-sm">{title}</h3>
        <p className="relative z-10 text-slate-400 text-sm leading-relaxed group-hover:text-slate-300">{description}</p>
    </div>
);

export default Portfolio;