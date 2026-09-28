import React from "react";
import { cn } from "../../lib/utils";

export function RadialGlowButton({
  children = "Empecemos",
  className,
  onClick,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "relative group inline-flex items-center justify-center px-8 py-3.5 sm:px-10 sm:py-4 rounded-full font-mono text-sm sm:text-base font-bold text-[#F5F1E8] transition-all duration-300 transform active:scale-95 overflow-hidden shadow-[0_0_25px_rgba(27,58,47,0.8)] hover:shadow-[0_0_40px_rgba(245,241,232,0.45)] cursor-pointer select-none",
        className
      )}
      {...props}
    >
      {/* Aura de resplandor suave exterior en crema */}
      <span className="absolute -inset-0.5 rounded-full bg-[#F5F1E8]/25 blur-sm opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Contorno Crema Marfil #F5F1E8 (Borde exterior nítido) */}
      <span className="absolute inset-0 bg-[#F5F1E8] rounded-full transition-colors" />
      
      {/* Fondo interior Verde Bosque #1B3A2F */}
      <span className="absolute inset-[2px] bg-[#1B3A2F] rounded-full group-hover:bg-[#234b3d] transition-colors" />

      {/* Haz de luz animado al pasar el cursor */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#F5F1E8]/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

      {/* Contenido del botón */}
      <span className="relative z-10 flex items-center justify-center gap-2.5 text-[#F5F1E8] drop-shadow-[0_0_12px_rgba(245,241,232,0.4)]">
        {children}
      </span>
    </button>
  );
}

export default RadialGlowButton;
