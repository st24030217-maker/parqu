import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RadialGlowButton } from './ui/radial-glow-button';
import { FlipFadeText } from './ui/flip-fade-text';
import { TextAnimation } from './ui/staggerText';
import { ArrowRight, Sparkles, ShieldCheck, Radio } from 'lucide-react';

// Definición de las 5 columnas verticales inspiradas en Charlie Osborne (charlieosborne.co)
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
  const hasExitedRef = useRef(false);

  // Gatillo de salida con revelado vertical en persianas escalonadas
  const handleTriggerExit = useCallback(() => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    setIsExiting(true);

    // Duración total: retraso de la última columna (4 * 0.08s = 0.32s) + duración (0.85s) = ~1.17s
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1150);
  }, [onComplete]);

  // Atajo de teclado: Enter o Barra espaciadora para acceder de inmediato
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

  // Contador cinemático de progresión (00% a 100%)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4 segundos para una experiencia fluida y cinematográfica

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(interval);
        // Pequeña pausa estética de 320ms con el sistema al 100% antes del revelado automático
        setTimeout(() => {
          handleTriggerExit();
        }, 320);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [handleTriggerExit]);

  // Bloqueo de scroll en el body mientras se visualiza la pantalla de carga
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Mensaje de telemetría dinámico según el porcentaje de carga
  const getTelemetryStatus = () => {
    if (progress < 25) return 'INICIALIZANDO SISTEMA METROPOLITANO';
    if (progress < 50) return 'CONECTANDO RED SATELITAL & SENSORES IoT';
    if (progress < 75) return 'SINCRONIZANDO PADRÓN VEHICULAR CDMX';
    if (progress < 99) return 'ENCRIPTANDO PASARELA DE AUTOCOBRO (AES-256)';
    return 'SISTEMA LISTO • ACCESO AUTORIZADO';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto bg-black">
      {/* 
        ══════════════════════════════════════════════════════════════
        PERSPECTIVA CHARLIE OSBORNE: 5 PERSIANAS VERTICALES ESCALONADAS
        ══════════════════════════════════════════════════════════════
      */}
      <div className="absolute inset-0 grid grid-cols-3 sm:grid-cols-5 pointer-events-none z-0">
        {COLUMNS.map((col, idx) => (
          <motion.div
            key={col.id}
            initial={{ y: '0%' }}
            animate={{ y: isExiting ? '-100%' : '0%' }}
            transition={{
              duration: 0.85,
              delay: isExiting ? idx * 0.08 : 0,
              ease: [0.76, 0, 0.24, 1], // Curva cúbica bezier ultra-fluida estilo Charlie Osborne
            }}
            className={`relative h-full w-full bg-[#01033E] border-r border-white/[0.08] last:border-r-0 flex flex-col justify-between p-3 sm:p-5 md:p-6 ${
              !col.mobileVisible ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {/* Gradiente sutil y luz ambiental en cada columna */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0033FF]/15 via-transparent to-[#807DFE]/10 pointer-events-none" />

            {/* Cabecera superior de la columna */}
            <div className="relative z-10 flex items-center justify-between font-mono text-[9px] sm:text-[11px] text-[#D4D6E6]/60 uppercase tracking-widest">
              <span className="font-bold text-white/80">{col.id}</span>
              <span className="truncate ml-1">{col.code}</span>
            </div>

            {/* Pie inferior de la columna */}
            <div className="relative z-10 flex items-center justify-between font-mono text-[8px] sm:text-[10px] text-[#D4D6E6]/40 uppercase tracking-wider">
              <span className="truncate">{col.tag}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0033FF]/60" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 
        ══════════════════════════════════════════════════════════════
        CONTENIDO HERO EDITORIAL Y TELEMETRÍA (FADE & SLIDE AL SALIR)
        ══════════════════════════════════════════════════════════════
      */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          y: isExiting ? -35 : 0,
        }}
        transition={{
          duration: isExiting ? 0.35 : 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 h-full w-full flex flex-col justify-between px-4 sm:px-8 md:px-12 py-6 sm:py-8 md:py-10 text-[#D4D6E6] pointer-events-auto"
      >
        {/* BARRA SUPERIOR: Telemetría y estado de red satelital */}
        <header className="w-full flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#807DFE] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0033FF]" />
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-white uppercase">
              PARQU • SISTEMA OPERATIVO
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 font-mono text-xs text-[#D4D6E6]/60">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#807DFE]" />
              NODO CDMX: ACTIVO
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              AES-256 VERIFICADO
            </span>
          </div>

          <div className="font-mono text-xs sm:text-sm font-bold text-[#807DFE] tracking-wider">
            @2026 OFFICIAL
          </div>
        </header>

        {/* CENTRO: Tipografía Gigante Charlie Osborne, Logotipo Parqu y Taglines */}
        <main className="my-auto flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full py-6">
          
          {/* Logotipo Parqu con Aura Luminosa */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center mb-4 sm:mb-6"
          >
            <div className="absolute -inset-8 bg-gradient-to-r from-[#0033FF]/40 via-[#807DFE]/30 to-[#0033FF]/40 rounded-full blur-3xl pointer-events-none" />
            <img
              src="/parqu-logo-white.png"
              alt="Parqu Logo"
              style={{ maxHeight: '110px' }}
              className="h-16 sm:h-24 md:h-28 w-auto object-contain relative z-10 drop-shadow-[0_0_35px_rgba(128,125,254,0.5)]"
            />
          </motion.div>

          {/* TÍTULO HERO GIGANTE EDITORIAL (Inspiración Charlie Osborne) */}
          <div className="overflow-hidden w-full">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-[0_0_50px_rgba(0,51,255,0.4)]">
              PARQU
            </h1>
          </div>

          {/* Subtítulo Editorial con acento en cursiva y refinamiento suizo */}
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg md:text-xl text-[#D4D6E6]/85 font-medium max-w-2xl px-2">
            Sistema Inteligente de <span className="font-serif italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">Parquímetros</span> y Autocobro Digital
          </p>

          {/* Rótulos Dinámicos Flip-Fade Text */}
          <div className="w-full flex items-center justify-center mt-3 sm:mt-5 h-10">
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
              textClassName="text-xs sm:text-sm md:text-base font-mono font-bold tracking-widest text-[#807DFE] uppercase"
            />
          </div>

          {/* BOTÓN INTERACTIVO "EMPECEMOS" CON RADIAL GLOW */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-8 flex flex-col items-center justify-center gap-3"
          >
            <RadialGlowButton
              onClick={handleTriggerExit}
              className="text-sm sm:text-base font-bold shadow-2xl px-8 py-3.5 sm:px-12 sm:py-4"
            >
              <span>{progress >= 100 ? 'Entrar al Sistema' : 'Empecemos'}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white inline transition-transform duration-300 group-hover:translate-x-1.5" />
            </RadialGlowButton>

            <span className="text-[11px] sm:text-xs text-[#D4D6E6]/40 font-mono tracking-wider">
              Presiona <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10">Espacio</kbd> o <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10">Enter</kbd> para acceder
            </span>
          </motion.div>

        </main>

        {/* PIE DE PÁGINA: Telemetría, Contador 00-100% y Logo SSS.Solutions */}
        <footer className="w-full border-t border-white/[0.08] pt-4 sm:pt-6 flex flex-col gap-4">
          
          {/* Barra de Progreso Hairline Luminosa */}
          <div className="w-full relative h-[2px] bg-white/[0.08] overflow-hidden rounded-full">
            <motion.div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#0033FF] via-[#807DFE] to-white shadow-[0_0_12px_rgba(128,125,254,0.8)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          {/* Fila inferior con Contador Gigante y Créditos */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Ticker de Telemetría Dinámico */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4D6E6]/50">
                ESTADO DE SINCRONIZACIÓN
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider mt-0.5">
                {getTelemetryStatus()}
              </span>
            </div>

            {/* Contador Monospace Numérico Charlie Osborne (000% a 100%) */}
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-4xl sm:text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(0,51,255,0.6)]">
                {String(progress).padStart(3, '0')}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#807DFE]">%</span>
            </div>

            {/* Powered by SSS.Solutions con Logotipo Transparente */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#D4D6E6]/50 font-mono">
                  TECNOLOGÍA POR
                </span>
                <span className="text-xs font-mono font-bold text-white tracking-wider">
                  SSS.Solutions
                </span>
              </div>
              <img
                src="/sss-solutions-logo.png"
                alt="SSS.Solutions Logo"
                style={{ maxHeight: '32px' }}
                className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              />
            </div>

          </div>
        </footer>

      </motion.div>
    </div>
  );
};

export default LoadingScreen;
