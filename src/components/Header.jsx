import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Zap, Sparkles, Activity } from 'lucide-react';
import { useParking } from '../context/ParkingContext';

export const Header = ({ onReplayLoading, onNavigateToPanel }) => {
  const { activeSession, vehicle } = useParking();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-white/10 bg-[#01033E]/40 backdrop-blur-2xl backdrop-saturate-150 sticky top-0 z-40 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logotipo Oficial PARK - 100% Transparente sin cajas de fondo */}
        <div 
          onClick={onReplayLoading}
          className="flex items-center gap-3.5 cursor-pointer group"
          title="Ver pantalla de carga inicial"
        >
          <div className="relative flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
            <div className="absolute -inset-2 bg-[#0033FF]/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src="/parqu-logo-white.png" 
              alt="Parqu" 
              style={{ maxHeight: '44px' }}
              className="h-10 sm:h-11 w-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(212,214,230,0.35)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-xl tracking-tight text-[#D4D6E6] group-hover:text-white transition-colors">
                Parqu
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-[#0033FF]/20 text-[#D4D6E6] border border-[#807DFE]/40">
                Digital Pass
              </span>
            </div>
            <p className="text-[11px] text-[#D4D6E6]/80 font-mono hidden sm:block">
              Parquímetro Digital • Autocobro Inteligente
            </p>
          </div>
        </div>

        {/* Estatus Central, Hora y Powered By en Header */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 text-xs font-mono text-[#D4D6E6]">
            <Clock className="w-3.5 h-3.5 text-[#807DFE]" />
            <span>
              {currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Badge de Estado de Estacionamiento */}
          {activeSession ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="font-mono">En Parquímetro: {vehicle.plates}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 text-[#D4D6E6] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-xs text-[#D4D6E6]">Autocobro Activo</span>
            </div>
          )}

          {/* Botón Acceso Rápido al Panel de Control Metropolitano */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateToPanel) {
                onNavigateToPanel();
              } else {
                const el = document.getElementById('panel-control-metropolitano');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0033FF] text-white hover:bg-[#2250ff] text-xs font-mono font-bold transition active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(0,51,255,0.6)]"
            title="Ir directo al Panel de Control Metropolitano"
          >
            <Activity className="w-3.5 h-3.5 text-white" />
            <span>Panel de Control</span>
          </button>
        </div>

      </div>
    </header>
  );
};
