import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { InteractiveParticles } from './interactive-particles';
import { ChevronDown, Sparkles, Activity } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function StaggeredGrid({
  centerText = "BIENVENIDOS A PARQU",
  onSelectFeature,
  className = "",
}) {
  const containerRef = useRef(null);
  const titleSectionRef = useRef(null);
  const titleTextRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleTextRef.current) {
        const chars = titleTextRef.current.querySelectorAll('.char');
        gsap.fromTo(chars, 
          {
            yPercent: 180,
            autoAlpha: 0,
            scale: 0.6,
            rotateX: -45,
          },
          {
            yPercent: 0,
            autoAlpha: 1,
            scale: 1,
            rotateX: 0,
            stagger: {
              each: 0.035,
              from: 'center'
            },
            ease: 'power3.out',
            scrollTrigger: {
              trigger: titleSectionRef.current,
              start: 'top 85%',
              end: 'center 45%',
              scrub: 1.2,
            }
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleScrollToPanel = () => {
    const el = document.getElementById('panel-control-metropolitano');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full overflow-hidden text-white ${className}`}>
      
      {/* 1. Header con Animación de Partículas GPU en las palabras "BIENVENIDO A PARQU" */}
      <section 
        ref={titleSectionRef}
        className="pt-12 pb-6 px-4 flex flex-col items-center justify-center text-center relative z-10 [perspective:1000px] min-h-[360px] sm:min-h-[420px] bg-transparent"
      >
        {/* Capa de Partículas Interactivas Three.js que forman el texto "BIENVENIDO A PARQU" con fondo 100% transparente */}
        <div className="absolute inset-0 z-0 pointer-events-auto flex items-center justify-center overflow-hidden bg-transparent">
          <InteractiveParticles
            text="BIENVENIDO A PARQU"
            size={1.5}
            randomness={2.0}
            depth={4.0}
            touchRadius={0.3}
            color="#ffffff"
            background="transparent"
            className="w-full h-full bg-transparent"
          />
        </div>

        {/* Botón de Acceso Inmediato al Panel de Control Metropolitano */}
        <div className="relative z-20 mt-auto pt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleScrollToPanel}
            className="group px-6 py-2.5 rounded-full bg-neutral-900/90 hover:bg-white text-white hover:text-black border border-neutral-700/80 hover:border-white font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2.5 shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black animate-pulse" />
            <span>Acceder al Panel de Control Metropolitano</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </section>

    </div>
  );
}

export default StaggeredGrid;
