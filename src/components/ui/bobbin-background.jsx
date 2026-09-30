import React from 'react';

/**
 * BobbinBackground - Sistema Cinético Horizontal ("Acostados")
 * Estilo Grandioso con la Paleta Oficial del Sistema:
 * - Azul Eléctrico (#0033FF)
 * - Lavanda Periwinkle (#807DFE)
 * - Plata Hielo (#D4D6E6)
 * - Cian Neón (#06B6D4)
 * 
 * Cápsulas luminosas horizontales que se desplazan y respiran en parallax
 * con núcleos de luz láser y resplandor radial inferior eléctrico.
 */
export const BobbinBackground = ({
  children,
  className = '',
  showElectricFade = true,
  showYellowFade,
}) => {
  const displayElectricFade = showYellowFade !== undefined ? showYellowFade : showElectricFade;
  // 10 haces / cápsulas cinéticas horizontales distribuidas verticalmente
  const horizontalBeams = [
    {
      id: 1,
      top: '5%',
      left: '-2%',
      width: 460,
      height: 42,
      duration: '7.8s',
      delay: '0s',
      direction: 'right',
      gradient: 'linear-gradient(90deg, rgba(0,51,255,0.2) 0%, rgba(0,51,255,0.85) 30%, rgba(128,125,254,0.95) 70%, rgba(212,214,230,0.85) 100%)',
      glowColor: 'rgba(0, 51, 255, 0.75)',
      secondaryGlow: 'rgba(128, 125, 254, 0.55)',
    },
    {
      id: 2,
      top: '14%',
      right: '1%',
      width: 540,
      height: 48,
      duration: '9.2s',
      delay: '-2.4s',
      direction: 'left',
      gradient: 'linear-gradient(90deg, rgba(212,214,230,0.9) 0%, rgba(128,125,254,0.95) 40%, rgba(0,51,255,0.85) 80%, rgba(0,51,255,0.2) 100%)',
      glowColor: 'rgba(128, 125, 254, 0.75)',
      secondaryGlow: 'rgba(0, 51, 255, 0.60)',
    },
    {
      id: 3,
      top: '23%',
      left: '12%',
      width: 420,
      height: 38,
      duration: '8.4s',
      delay: '-4.1s',
      direction: 'right',
      gradient: 'linear-gradient(90deg, rgba(6,182,212,0.3) 0%, rgba(6,182,212,0.9) 35%, rgba(0,51,255,0.9) 75%, rgba(128,125,254,0.8) 100%)',
      glowColor: 'rgba(6, 182, 212, 0.75)',
      secondaryGlow: 'rgba(0, 51, 255, 0.60)',
    },
    {
      id: 4,
      top: '33%',
      right: '8%',
      width: 620,
      height: 52,
      duration: '10.5s',
      delay: '-1.5s',
      direction: 'left',
      gradient: 'linear-gradient(90deg, rgba(0,51,255,0.85) 0%, rgba(128,125,254,0.95) 50%, rgba(212,214,230,0.95) 85%, rgba(212,214,230,0.2) 100%)',
      glowColor: 'rgba(0, 51, 255, 0.85)',
      secondaryGlow: 'rgba(128, 125, 254, 0.70)',
    },
    {
      id: 5,
      top: '43%',
      left: '3%',
      width: 480,
      height: 44,
      duration: '8.8s',
      delay: '-5.2s',
      direction: 'right',
      gradient: 'linear-gradient(90deg, rgba(128,125,254,0.3) 0%, rgba(128,125,254,0.9) 30%, rgba(212,214,230,0.95) 70%, rgba(0,51,255,0.8) 100%)',
      glowColor: 'rgba(128, 125, 254, 0.70)',
      secondaryGlow: 'rgba(212, 214, 230, 0.55)',
    },
    {
      id: 6,
      top: '54%',
      right: '4%',
      width: 580,
      height: 50,
      duration: '9.6s',
      delay: '-3.7s',
      direction: 'left',
      gradient: 'linear-gradient(90deg, rgba(6,182,212,0.9) 0%, rgba(0,51,255,0.95) 50%, rgba(128,125,254,0.85) 90%, rgba(128,125,254,0.2) 100%)',
      glowColor: 'rgba(0, 51, 255, 0.80)',
      secondaryGlow: 'rgba(6, 182, 212, 0.65)',
    },
    {
      id: 7,
      top: '64%',
      left: '8%',
      width: 450,
      height: 40,
      duration: '8.2s',
      delay: '-6.0s',
      direction: 'right',
      gradient: 'linear-gradient(90deg, rgba(0,51,255,0.2) 0%, rgba(128,125,254,0.85) 30%, rgba(0,51,255,0.95) 75%, rgba(6,182,212,0.85) 100%)',
      glowColor: 'rgba(128, 125, 254, 0.75)',
      secondaryGlow: 'rgba(0, 51, 255, 0.60)',
    },
    {
      id: 8,
      top: '74%',
      right: '6%',
      width: 520,
      height: 46,
      duration: '9.0s',
      delay: '-2.8s',
      direction: 'left',
      gradient: 'linear-gradient(90deg, rgba(212,214,230,0.9) 0%, rgba(0,51,255,0.95) 50%, rgba(128,125,254,0.8) 85%, rgba(0,51,255,0.2) 100%)',
      glowColor: 'rgba(0, 51, 255, 0.85)',
      secondaryGlow: 'rgba(128, 125, 254, 0.60)',
    },
    {
      id: 9,
      top: '84%',
      left: '4%',
      width: 490,
      height: 42,
      duration: '8.6s',
      delay: '-4.9s',
      direction: 'right',
      gradient: 'linear-gradient(90deg, rgba(6,182,212,0.2) 0%, rgba(0,51,255,0.85) 30%, rgba(128,125,254,0.95) 70%, rgba(212,214,230,0.9) 100%)',
      glowColor: 'rgba(0, 51, 255, 0.75)',
      secondaryGlow: 'rgba(128, 125, 254, 0.55)',
    },
    {
      id: 10,
      top: '93%',
      right: '10%',
      width: 470,
      height: 44,
      duration: '9.8s',
      delay: '-1.1s',
      direction: 'left',
      gradient: 'linear-gradient(90deg, rgba(128,125,254,0.85) 0%, rgba(0,51,255,0.95) 45%, rgba(6,182,212,0.9) 80%, rgba(6,182,212,0.2) 100%)',
      glowColor: 'rgba(128, 125, 254, 0.80)',
      secondaryGlow: 'rgba(0, 51, 255, 0.65)',
    },
  ];

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      
      {/* ═══ 1. KEYFRAMES HORIZONTALES CINEMÁTICOS ACELERADOS POR GPU (60/120 FPS) ═══ */}
      <style>{`
        @keyframes beamGlideRight {
          0%, 100% {
            transform: translate3d(0, 0, 0) scaleX(1);
            opacity: 0.65;
          }
          50% {
            transform: translate3d(110px, -8px, 0) scaleX(1.35);
            opacity: 0.98;
          }
        }
        @keyframes beamGlideLeft {
          0%, 100% {
            transform: translate3d(0, 0, 0) scaleX(1);
            opacity: 0.65;
          }
          50% {
            transform: translate3d(-110px, 8px, 0) scaleX(1.35);
            opacity: 0.98;
          }
        }
        @keyframes electricAuroraPulse {
          0%, 100% {
            opacity: 0.65;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.95;
            transform: scaleY(1.15);
          }
        }
        .beam-glide-right {
          animation: beamGlideRight ease-in-out infinite;
          will-change: transform, opacity;
        }
        .beam-glide-left {
          animation: beamGlideLeft ease-in-out infinite;
          will-change: transform, opacity;
        }
        .electric-aurora {
          animation: electricAuroraPulse 8s ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>

      {/* ═══ 2. CAPA TRANSLÚCIDA QUE PRESERVA LAS NUBES DEL FONDO Y SUMA PROFUNDIDAD ═══ */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-[#01033E]/40 backdrop-blur-md"
        aria-hidden="true" 
      />

      {/* ═══ 3. HACES / CÁPSULAS HORIZONTALES ACOSTARAS DE ALTO IMPACTO VISUAL ═══ */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {horizontalBeams.map((beam) => {
          const animationClass = beam.direction === 'right' ? 'beam-glide-right' : 'beam-glide-left';

          return (
            <div
              key={beam.id}
              className={`${animationClass} absolute rounded-full flex items-center justify-center`}
              style={{
                top: beam.top,
                left: beam.left,
                right: beam.right,
                width: `${beam.width}px`,
                height: `${beam.height}px`,
                animationDuration: beam.duration,
                animationDelay: beam.delay,
                background: beam.gradient,
                boxShadow: `0 0 50px ${beam.glowColor}, 0 0 100px ${beam.secondaryGlow}, inset 0 0 25px rgba(212, 214, 230, 0.6)`,
                border: '1px solid rgba(212, 214, 230, 0.35)',
              }}
            >
              {/* Núcleo de luz láser interna súper refinada */}
              <div 
                className="w-[82%] h-[3px] rounded-full blur-[0.5px]"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)',
                  boxShadow: '0 0 12px #FFFFFF, 0 0 24px #807DFE',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ═══ 4. HORIZONTE RADIANTE AZUL ELÉCTRICO & PERIWINKLE (ESTILO PARQU SYSTEM) ═══ */}
      {displayElectricFade && (
        <div
          className="electric-aurora pointer-events-none absolute inset-x-0 bottom-0 h-[520px] max-h-[55%] z-0 select-none"
          style={{
            background: 'radial-gradient(147.57% 102.54% at 50% 100%, rgba(0, 51, 255, 0.70) 10%, rgba(128, 125, 254, 0.50) 45%, rgba(6, 182, 212, 0.20) 75%, transparent 100%)',
            mixBlendMode: 'screen',
          }}
          aria-hidden="true"
        />
      )}

      {/* ═══ 5. CONTENIDO DEL SISTEMA (Z-INDEX 10 PARA TOTAL INTERACTIVIDAD) ═══ */}
      <div className="relative z-10 w-full">
        {children}
      </div>

    </div>
  );
};

export default BobbinBackground;
