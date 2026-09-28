import React, { useRef } from 'react';
import HeroText from './hero-shutter-text';
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
      
      {/* 1. Header con Hero Shutter Text en "BIENVENIDOS A PARQU" */}
      <section 
        className="pt-10 pb-8 px-4 flex flex-col items-center justify-center text-center relative z-10 min-h-[380px] sm:min-h-[440px] bg-transparent"
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
            className="group px-6 py-2.5 rounded-full bg-[#01033E]/80 hover:bg-[#0033FF] text-[#D4D6E6] hover:text-white border border-[#807DFE]/40 hover:border-white font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2.5 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(0,51,255,0.4)] cursor-pointer transform hover:scale-105 active:scale-95"
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
