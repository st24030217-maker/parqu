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
    <header className="border-b border-[#1B3A2F]/60 bg-[#070d0b]/90 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logotipo Oficial PARK - 100% Transparente sin cajas de fondo */}
        <div 
          onClick={onReplayLoading}
          className="flex items-center gap-3.5 cursor-pointer group"
          title="Ver pantalla de carga inicial"
        >
          <div className="relative flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
            <div className="absolute -inset-2 bg-[#1B3A2F]/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src="/parqu-logo-white.png" 
              alt="Parqu" 
              style={{ maxHeight: '44px' }}
              className="h-10 sm:h-11 w-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(245,241,232,0.35)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-xl tracking-tight text-[#F5F1E8] group-hover:text-cream transition-colors">
                Parqu
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-[#1B3A2F] text-[#F5F1E8] border border-[#2a5447]">
                Digital Pass
              </span>
            </div>
            <p className="text-[11px] text-[#dfd4bf]/80 font-mono hidden sm:block">
              Parquímetro Digital • Autocobro Inteligente
            </p>
          </div>
        </div>

        {/* Estatus Central, Hora y Powered By en Header */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1b16] border border-[#1B3A2F]/80 text-xs font-mono text-[#F5F1E8]">
            <Clock className="w-3.5 h-3.5 text-[#dfd4bf]" />
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
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1b16] border border-[#1B3A2F] text-[#F5F1E8] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-xs text-[#F5F1E8]">Autocobro Activo</span>
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F1E8] text-[#1B3A2F] hover:bg-[#ede6d8] text-xs font-mono font-bold transition active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(27,58,47,0.7)]"
            title="Ir directo al Panel de Control Metropolitano"
          >
            <Activity className="w-3.5 h-3.5 text-[#1B3A2F]" />
            <span>Panel de Control</span>
          </button>
        </div>

      </div>
    </header>
  );
};
