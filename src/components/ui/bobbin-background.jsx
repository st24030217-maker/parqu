import React from 'react';
import { Lottie } from 'lottie-react';
import bobbinOriginal from './bobbin-lottie.json';
import bobbinGold from './bobbin-lottie-gold.json';
import bobbinCream from './bobbin-lottie-cream.json';

/**
 * BobbinBackground Component
 * Reproduces the signature background from https://withbobbin.com/ 
 * (Featured on "Your lessons, your threads, all in one place"):
 * 1. Looping kinetic thread/capsule animation (Lottie / Jitter)
 * 2. Bottom .yellow-fade radial glow (#fbf27e)
 * 3. Soft organic surface blending seamlessly with ambient clouds
 */
export const BobbinBackground = ({
  children,
  variant = 'gold', // 'gold' (#fbf27e), 'cream' (#f7f4f0), or 'original' (#1D1914)
  className = '',
  showYellowFade = true,
  opacity = 0.38,
}) => {
  const animationData = 
    variant === 'original' 
      ? bobbinOriginal 
      : variant === 'cream' 
      ? bobbinCream 
      : bobbinGold;

  return (
    <div className={`relative w-full overflow-hidden rounded-[32px] sm:rounded-[40px] bg-[#01033E]/45 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${className}`}>
      
      {/* 1. Capa de hilos/cápsulas vectoriales animadas en loop continuo (WithBobbin Jitter Animation) */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none transition-opacity duration-700"
        style={{ opacity }}
        aria-hidden="true"
      >
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMin slice',
          }}
          className="w-full h-full object-cover scale-105"
        />
      </div>

      {/* 2. Resplandor radial inferior (.yellow-fade auténtico de WithBobbin: #fbf27e) */}
      {showYellowFade && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[400px] max-h-[42%] z-0 select-none"
          style={{
            background: 'radial-gradient(147.57% 102.54% at 50% 100%, #fbf27e 26.92%, rgba(251, 242, 126, 0) 100%)',
            opacity: 0.75,
            mixBlendMode: 'screen',
          }}
          aria-hidden="true"
        />
      )}

      {/* 3. Contenido interactivo del sistema (Z-index superior para garantizar clics y selección) */}
      <div className="relative z-10 w-full">
        {children}
      </div>

    </div>
  );
};

export default BobbinBackground;
