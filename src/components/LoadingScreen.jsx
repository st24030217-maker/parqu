import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RadialGlowButton } from './ui/radial-glow-button';
import { FlipFadeText } from './ui/flip-fade-text';
import { ArrowRight, ShieldCheck, Radio } from 'lucide-react';

// Columnas arquitectónicas con tipografía Azeret Mono inspiradas en Charlie Osborne
const COLUMNS = [
  { id: '01', code: 'PARQU', tag: 'AUTOPAGO DIGITAL', mobileVisible: true },
  { id: '02', code: 'CDMX', tag: 'ZONA METROPOLITANA', mobileVisible: false },
  { id: '03', code: 'RED 5G', tag: 'SENSORES EN TIEMPO REAL', mobileVisible: true },
  { id: '04', code: 'AES-256', tag: 'ENCRIPTACIÓN BANCARIA', mobileVisible: false },
  { id: '05', code: 'SSS.SOLUTIONS', tag: 'SISTEMA OFICIAL 2026', mobileVisible: true },
];

export const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasExitedRef = useRef(false);

  // Ejecuta la animación de revelado vertical escalonado cuando el usuario hace clic en "Empecemos"
  const handleTriggerExit = useCallback(() => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    setIsExiting(true);

    // Esperar a que la última persiana termine de subir (0.32s de retraso + 0.85s de subida = ~1.17s)
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1150);
  }, [onComplete]);

  // Atajo de teclado: Enter o Barra espaciadora para iniciar la animación y acceder
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTriggerExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTriggerExit]);

  // Contador de preparación inicial (0% a 100%) - Espera la interacción del usuario sin auto-cierre
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // 1.8 segundos para calibración rápida

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  // Bloqueo de scroll en el body mientras se visualiza la pantalla de carga
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Mensaje de telemetría dinámico en Azeret Mono
  const getTelemetryStatus = () => {
    if (!isReady && progress < 30) return 'INICIALIZANDO SISTEMA METROPOLITANO';
    if (!isReady && progress < 60) return 'CONECTANDO RED SATELITAL & SENSORES IoT';
    if (!isReady && progress < 99) return 'SINCRONIZANDO PADRÓN VEHICULAR CDMX';
    return 'SISTEMA LISTO • PRESIONA EMPECEMOS';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto bg-transparent font-azeret">
      {/* 
        ══════════════════════════════════════════════════════════════
        PERSIANAS VERTICALES CHARLIE OSBORNE (SUBEN AL DARLE A EMPECEMOS)
        ══════════════════════════════════════════════════════════════
      */}
      <div className="absolute inset-0 grid grid-cols-3 sm:grid-cols-5 pointer-events-none z-0">
        {COLUMNS.map((col, idx) => (
          <div
            key={col.id}
            style={{
              transform: isExiting ? 'translateY(-100%)' : 'translateY(0%)',
              transition: isExiting
                ? `transform 0.85s cubic-bezier(0.76, 0, 0.24, 1) ${idx * 0.08}s`
                : 'none',
              willChange: 'transform',
            }}
            className={`relative h-full w-full bg-[#01033E] border-r border-white/[0.08] last:border-r-0 flex flex-col justify-between p-3 sm:p-5 md:p-6 ${
              !col.mobileVisible ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {/* Gradiente sutil y luz ambiental en cada columna */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0033FF]/15 via-transparent to-[#807DFE]/10 pointer-events-none" />

            {/* Cabecera superior de la columna en Azeret Mono */}
            <div className="relative z-10 flex items-center justify-between font-azeret text-[9px] sm:text-[11px] text-[#D4D6E6]/60 uppercase tracking-widest">
              <span className="font-bold text-white/80">{col.id}</span>
              <span className="truncate ml-1">{col.code}</span>
            </div>

            {/* Pie inferior de la columna en Azeret Mono */}
            <div className="relative z-10 flex items-center justify-between font-azeret text-[8px] sm:text-[10px] text-[#D4D6E6]/40 uppercase tracking-wider">
              <span className="truncate">{col.tag}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0033FF]/60" />
            </div>
          </div>
        ))}
      </div>

      {/* 
        ══════════════════════════════════════════════════════════════
        CONTENIDO HERO EDITORIAL EN AZERET MONO
        ══════════════════════════════════════════════════════════════
      */}
      <div
        style={{
          opacity: isExiting ? 0 : 1,
          transform: isExiting ? 'translateY(-30px)' : 'translateY(0)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          pointerEvents: isExiting ? 'none' : 'auto',
        }}
        className="absolute inset-0 z-10 h-full w-full flex flex-col justify-between px-4 sm:px-8 md:px-12 py-5 sm:py-8 md:py-10 text-[#D4D6E6]"
      >
        {/* BARRA SUPERIOR: Telemetría y estado de red satelital */}
        <header className="w-full flex items-center justify-between border-b border-white/[0.08] pb-3 sm:pb-4 font-azeret">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#807DFE] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0033FF]" />
            </span>
            <span className="font-azeret text-xs sm:text-sm font-bold tracking-widest text-white uppercase">
              PARQU • SISTEMA OPERATIVO
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 font-azeret text-xs text-[#D4D6E6]/60">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#807DFE]" />
              NODO CDMX: ACTIVO
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              AES-256 VERIFICADO
            </span>
          </div>

          <div className="font-azeret text-xs sm:text-sm font-bold text-[#807DFE] tracking-wider">
            @2026 OFFICIAL
          </div>
        </header>

        {/* CENTRO: Tipografía Gigante Charlie Osborne en Azeret Mono, Logotipo y Botón */}
        <main className="my-auto flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full py-4 font-azeret">
          
          {/* Logotipo Parqu con Aura Luminosa */}
          <div className="relative flex items-center justify-center mb-3 sm:mb-5">
            <div className="absolute -inset-8 bg-gradient-to-r from-[#0033FF]/40 via-[#807DFE]/30 to-[#0033FF]/40 rounded-full blur-3xl pointer-events-none" />
            <img
              src="/parqu-logo-white.png"
              alt="Parqu Logo"
              style={{ maxHeight: '100px' }}
              className="h-14 sm:h-20 md:h-24 w-auto object-contain relative z-10 drop-shadow-[0_0_35px_rgba(128,125,254,0.5)]"
            />
          </div>

          {/* TÍTULO HERO GIGANTE EDITORIAL EN AZERET MONO */}
          <div className="overflow-hidden w-full">
            <h1 className="font-azeret text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-[0_0_50px_rgba(0,51,255,0.4)]">
              PARQU
            </h1>
          </div>

          {/* Subtítulo Editorial con acento estético en Azeret Mono */}
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg text-[#D4D6E6]/85 font-medium max-w-2xl px-2 font-azeret tracking-wide">
            Sistema Inteligente de <span className="italic font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">Parquímetros</span> y Autocobro Digital
          </p>

          {/* Rótulos Dinámicos Flip-Fade Text en Azeret Mono */}
          <div className="w-full flex items-center justify-center mt-2.5 sm:mt-4 h-9">
            <FlipFadeText
              words={[
                "AUTOCOBRO SATELITAL",
                "SIN FILAS NI MONEDAS",
                "GESTIÓN EN UN TOQUE",
                "PASARELA CONTACTLESS",
                "INSPECCIÓN VIAL QR"
              ]}
              interval={2500}
              letterDuration={0.45}
              staggerDelay={0.05}
              textClassName="text-xs sm:text-sm md:text-base font-azeret font-bold tracking-widest text-[#807DFE] uppercase"
            />
          </div>

          {/* BOTÓN PRINCIPAL "EMPECEMOS" CON AZERET MONO */}
          <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-2.5 z-30 font-azeret">
            <RadialGlowButton
              onClick={handleTriggerExit}
              className="font-azeret text-sm sm:text-base font-bold shadow-2xl px-8 py-3.5 sm:px-12 sm:py-4 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Empecemos</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white inline transition-transform duration-300 group-hover:translate-x-1.5" />
            </RadialGlowButton>

            <span className="text-[10px] sm:text-xs text-[#D4D6E6]/40 font-azeret tracking-wider">
              Haz clic en <span className="text-white font-semibold">Empecemos</span> o presiona <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10 text-[10px] font-azeret">Espacio</kbd>
            </span>
          </div>

        </main>

        {/* PIE DE PÁGINA: Telemetría, Contador 00-100% y Logo SSS.Solutions en Azeret Mono */}
        <footer className="w-full border-t border-white/[0.08] pt-3 sm:pt-5 flex flex-col gap-3 font-azeret">
          
          {/* Barra de Progreso Hairline Luminosa */}
          <div className="w-full relative h-[2px] bg-white/[0.08] overflow-hidden rounded-full">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#0033FF] via-[#807DFE] to-white shadow-[0_0_12px_rgba(128,125,254,0.8)] transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Fila inferior con Contador Gigante y Créditos */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Ticker de Telemetría Dinámico */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <span className="text-[9px] sm:text-[10px] font-azeret uppercase tracking-[0.25em] text-[#D4D6E6]/50">
                ESTADO DE SINCRONIZACIÓN
              </span>
              <span className="font-azeret text-xs sm:text-sm font-bold text-white tracking-wider mt-0.5">
                {getTelemetryStatus()}
              </span>
            </div>

            {/* Contador Numérico en Azeret Mono (000% a 100%) */}
            <div className="flex items-baseline gap-1 font-azeret">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(0,51,255,0.6)] font-azeret">
                {String(progress).padStart(3, '0')}
              </span>
              <span className="text-lg sm:text-xl font-bold text-[#807DFE] font-azeret">%</span>
            </div>

            {/* Powered by SSS.Solutions con Logotipo Transparente */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#D4D6E6]/50 font-azeret">
                  TECNOLOGÍA POR
                </span>
                <span className="text-xs font-azeret font-bold text-white tracking-wider">
                  SSS.Solutions
                </span>
              </div>
              <img
                src="/sss-solutions-logo.png"
                alt="SSS.Solutions Logo"
                style={{ maxHeight: '28px' }}
                className="h-6 sm:h-7 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              />
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
};

export default LoadingScreen;
