import React, { useEffect, useRef } from 'react';

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current || !orb1Ref.current || !orb2Ref.current) return;
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const y = (clientY / window.innerHeight - 0.5) * 2; // -1 to 1

        // Parallax transform with different depths
        orb1Ref.current.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        orb2Ref.current.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
        containerRef.current.style.transform = `perspective(1000px) rotateY(${x * 2}deg) rotateX(${-y * 2}deg)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative pt-40 pb-20 px-6 text-center z-10 overflow-visible perspective-container">
      
      {/* 3D Ambient Orbs (Interactive Parallax) */}
      <div ref={orb1Ref} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none transition-transform duration-100 ease-out"></div>
      <div ref={orb2Ref} className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-100 ease-out"></div>

      <div ref={containerRef} className="relative z-10 animate-fade-in-up transition-transform duration-200 ease-out transform-style-3d">
        {/* Floating Badge */}
        <div className="inline-block px-6 py-2 mb-8 rounded-full glass-panel border border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.3)] backdrop-blur-xl transform hover:scale-105 transition-transform duration-500 cursor-default">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,1)]"></span>
            </span>
            <span className="text-blue-300 text-xs font-bold tracking-[0.25em] uppercase drop-shadow-md">
              Elite Contributor Intelligence
            </span>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-bold mb-8 text-white tracking-tighter leading-[1.05] drop-shadow-2xl">
          Stop Guessing. <br/>
          <span className="gradient-text relative inline-block">Start Dominating.</span>
        </h1>
        
        <p className="text-slate-300 text-lg md:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed font-light tracking-wide">
          Every upload counts. <span className="text-white font-medium border-b-2 border-teal-500/50">Don't waste it on dead trends.</span> 
          <br className="hidden md:block" />
          Uncover the <strong>hidden, low-competition goldmines</strong> that buyers are searching for <em>right now</em>. Turn your portfolio into a high-profit asset today.
        </p>
      </div>
    </div>
  );
};

export default Hero;