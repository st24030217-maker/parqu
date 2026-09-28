import React, { useRef } from 'react';
import HeroText from './hero-shutter-text';
import CloudSky from './cloud-sky';
import { ChevronDown, Activity } from 'lucide-react';

export function StaggeredGrid({
  centerText = "BIENVENIDOS A PARQU",
  onSelectFeature,
  className = "",
}) {
  const containerRef = useRef(null);

  const handleScrollToPanel = () => {
    const el = document.getElementById('panel-control-metropolitano');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full overflow-hidden text-white ${className}`}>
      
      {/* Fondo Animado WebGL Cloud-Sky de OriginKit */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <CloudSky 
          background="#01033E"
          baseColor="#0033FF"
          accentColor="#D4D6E6"
          density={85}
          speed={45}
          size={125}
          clouds={{ softness: 85, shadow: 80, cirrus: 40 }}
          sun={{ x: 78, y: 90, glow: "rgba(128, 125, 254, 0.85)" }}
          pointer={{ parallax: 130, wind: 100, damping: 25 }}
          className="w-full h-full"
        />
        {/* Capas sutiles de sombreado y transición glassmorphism para contraste perfecto */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#01033E]/20 via-transparent to-[#01033E]/90 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#01033E] to-transparent pointer-events-none" />
      </div>

      {/* 1. Header con Hero Shutter Text en "BIENVENIDOS A PARQU" */}
      <section 
        className="pt-12 pb-10 px-4 flex flex-col items-center justify-center text-center relative z-10 min-h-[400px] sm:min-h-[460px] bg-transparent"
      >
        <HeroText
          text={centerText}
          className="bg-transparent"
        />

        {/* Botón de Acceso Inmediato al Panel de Control Metropolitano */}
        <div className="relative z-20 mt-6 pt-2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleScrollToPanel}
            className="group px-6 py-2.5 rounded-full bg-[#01033E]/80 hover:bg-[#0033FF] text-[#D4D6E6] hover:text-white border border-[#807DFE]/40 hover:border-white font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2.5 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(0,51,255,0.4)] cursor-pointer transform hover:scale-105 active:scale-95 backdrop-blur-md"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white animate-pulse" />
            <span>Acceder al Panel de Control Metropolitano</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </section>

    </div>
  );
}

export default StaggeredGrid;
