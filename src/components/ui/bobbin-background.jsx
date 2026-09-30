import React from 'react';
import { Lottie } from 'lottie-react';
import bobbinGold from './bobbin-lottie-gold.json';

/**
 * BobbinBackground - Fondo Auténtico de WithBobbin (https://withbobbin.com/)
 * Inspirado directamente en la sección "Your lessons, your threads, all in one place":
 * 1. Columnas cinéticas de hilos/cápsulas vectoriales que oscilan continuamente con alta visibilidad.
 * 2. Horizonte radiante .yellow-fade auténtico (#fbf27e) proyectando calidez dorada desde la base.
 * 3. Integración en anchura completa (full-width) manteniendo las nubes y el hero intactos.
 */
export const BobbinBackground = ({
  children,
  className = '',
  showYellowFade = true,
  threadIntensity = 'vibrant', // 'vibrant', 'subtle', or 'intense'
}) => {
  // 9 hilos/cápsulas cinéticas distribuidas por todo el ancho de la pantalla
  const threads = [
    { id: 1, left: '4%',  width: 44, height: 260, top: '10%', duration: '6.2s', delay: '0s',    color: '#fbf27e' },
    { id: 2, left: '14%', width: 52, height: 340, top: '22%', duration: '7.5s', delay: '-1.8s', color: '#f7f4f0' },
    { id: 3, left: '26%', width: 48, height: 290, top: '8%',  duration: '5.8s', delay: '-3.2s', color: '#fbf27e' },
    { id: 4, left: '38%', width: 56, height: 380, top: '25%', duration: '8.1s', delay: '-2.4s', color: '#F4FF2B' },
    { id: 5, left: '50%', width: 62, height: 320, top: '12%', duration: '6.6s', delay: '-4.5s', color: '#fbf27e' },
    { id: 6, left: '62%', width: 50, height: 360, top: '28%', duration: '7.8s', delay: '-1.1s', color: '#f7f4f0' },
    { id: 7, left: '74%', width: 54, height: 280, top: '15%', duration: '6.0s', delay: '-3.7s', color: '#fbf27e' },
    { id: 8, left: '86%', width: 46, height: 350, top: '20%', duration: '7.2s', delay: '-2.0s', color: '#F4FF2B' },
    { id: 9, left: '95%', width: 42, height: 270, top: '6%',  duration: '6.4s', delay: '-4.0s', color: '#fbf27e' },
  ];

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      
      {/* ═══ 1. ESTILOS DE ANIMACIÓN CINÉTICA HARDWARE-ACCELERATED (60/120 FPS) ═══ */}
      <style>{`
        @keyframes bobbinThreadFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scaleY(1);
            opacity: 0.55;
          }
          50% {
            transform: translate3d(0, 75px, 0) scaleY(1.35);
            opacity: 0.90;
          }
        }
        @keyframes bobbinPulseGlow {
          0%, 100% {
            opacity: 0.70;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }
        .bobbin-thread-pill {
          animation: bobbinThreadFloat ease-in-out infinite;
          will-change: transform, opacity;
        }
        .bobbin-glow-bottom {
          animation: bobbinPulseGlow 7s ease-in-out infinite;
        }
      `}</style>

      {/* ═══ 2. CAPA DE FONDO ORGÁNICO SUAVE QUE PERMITE VER LAS NUBES POR DETRÁS ═══ */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-[#01033E]/50 backdrop-blur-md"
        aria-hidden="true" 
      />

      {/* ═══ 3. HILOS CINÉTICOS DE WITHBOBBIN ALTAMENTE VISIBLES A TODO LO ANCHO ═══ */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {threads.map((t) => (
          <div
            key={t.id}
            className="bobbin-thread-pill absolute rounded-full"
            style={{
              left: t.left,
              top: t.top,
              width: `${t.width}px`,
              height: `${t.height}px`,
              animationDuration: t.duration,
              animationDelay: t.delay,
              background: `linear-gradient(180deg, ${t.color}99 0%, ${t.color}33 50%, ${t.color}cc 100%)`,
              boxShadow: `0 0 40px ${t.color}66, inset 0 0 20px ${t.color}88`,
              border: `1px solid ${t.color}66`,
            }}
          />
        ))}

        {/* Lottie original con escalado forzado al 100% para complementar el flujo */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen scale-110">
          <Lottie
            animationData={bobbinGold}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMin slice',
            }}
          />
        </div>
      </div>

      {/* ═══ 4. RESPLANDOR RADIAL INFERIOR (.yellow-fade OFICIAL DE WITHBOBBIN: #fbf27e) ═══ */}
      {showYellowFade && (
        <div
          className="bobbin-glow-bottom pointer-events-none absolute inset-x-0 bottom-0 h-[480px] max-h-[50%] z-0"
          style={{
            background: 'radial-gradient(147.57% 102.54% at 50% 100%, #fbf27e 32%, rgba(251, 242, 126, 0.45) 55%, rgba(251, 242, 126, 0) 100%)',
            opacity: 0.85,
            mixBlendMode: 'screen',
          }}
          aria-hidden="true"
        />
      )}

      {/* ═══ 5. CONTENIDO DEL SISTEMA (Z-INDEX SUPERIOR INTERACTIVO) ═══ */}
      <div className="relative z-10 w-full">
        {children}
      </div>

    </div>
  );
};

export default BobbinBackground;
