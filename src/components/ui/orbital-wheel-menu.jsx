import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Zap,
  CreditCard,
  QrCode,
  MapPin,
  Car,
  History,
  Activity,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Grid,
  Compass,
  Play,
  Square,
  RefreshCw,
  Copy,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { CurrencyDollarIcon } from '../icons';
import { useParking } from '../../context/ParkingContext';
import { formatCurrency, formatPlate, formatTimeFromSeconds } from '../../utils/formatters';
import { sileo } from 'sileo';

/**
 * ORBITAL WHEEL MENU • PARQU 2026
 * Diseño minimalista 100% transparente (Liquid Glass) con la tipografía oficial del sistema:
 * - Satoshi: Encabezados y textos limpios (font-sans)
 * - Azeret Mono: Códigos, métricas, placas, importes y telemetría (font-mono)
 * Sin textos redundantes. Todas las acciones se ejecutan en 1 toque.
 */

const ORBIT_ITEMS = [
  {
    id: 'dashboard',
    label: 'Parquímetro en Vivo',
    shortLabel: 'Parquímetro',
    category: 'OPERACIÓN',
    icon: Clock,
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    actionTarget: 'dashboard',
  },
  {
    id: 'autopay',
    label: 'Modo Autocobro',
    shortLabel: 'Autocobro',
    category: 'PAGO CONTINUO',
    icon: Zap,
    color: '#807DFE',
    glowColor: 'rgba(128, 125, 254, 0.45)',
    actionTarget: 'autopay',
  },
  {
    id: 'recharge',
    label: 'Recarga Express',
    shortLabel: 'Recarga',
    category: 'MONEDERO',
    icon: CurrencyDollarIcon,
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    actionTarget: 'recharge',
  },
  {
    id: 'qr-credential',
    label: 'Credencial QR',
    shortLabel: 'Pase QR',
    category: 'INSPECCIÓN',
    icon: QrCode,
    color: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    actionTarget: 'qr-credential',
  },
  {
    id: 'parking-map',
    label: 'Mapa Satelital GPS',
    shortLabel: 'Mapa GPS',
    category: 'UBICACIÓN',
    icon: MapPin,
    color: '#FB923C',
    glowColor: 'rgba(251, 146, 60, 0.45)',
    actionTarget: 'dashboard',
  },
  {
    id: 'vehicle',
    label: 'Padrón Vehicular',
    shortLabel: 'Vehículo',
    category: 'PADRÓN',
    icon: Car,
    color: '#F43F5E',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    actionTarget: 'vehicle',
  },
  {
    id: 'history',
    label: 'Historial de Cobros',
    shortLabel: 'Historial',
    category: 'BITÁCORA',
    icon: History,
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    actionTarget: 'history',
  },
  {
    id: 'telemetry',
    label: 'Telemetría de Red',
    shortLabel: 'Telemetría',
    category: 'ESTADO',
    icon: Activity,
    color: '#A78BFA',
    glowColor: 'rgba(167, 139, 250, 0.45)',
    actionTarget: 'telemetry',
  },
];

function shortestAngularDiff(targetIndex, currentOffset, count = 8) {
  let diff = (targetIndex - currentOffset) % count;
  if (diff > count / 2) diff -= count;
  if (diff < -count / 2) diff += count;
  return diff;
}

export const OrbitalWheelMenu = ({
  activeTab,
  onSelectTab,
  onOpenRecharge,
  onOpenQR,
  className = '',
}) => {
  const {
    vehicle = {},
    updateVehicle,
    owner = {},
    card = {},
    autoPay = {},
    updateAutoPay,
    activeSession,
    startParking,
    stopParkingAndAutoCharge,
    transactions = [],
    pinnedLocations = [],
    registerPinnedLocation,
    addBalance,
  } = useParking();

  const [viewMode, setViewMode] = useState('orbit');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [orbitOffset, setOrbitOffset] = useState(0);
  const targetOffsetRef = useRef(0);
  const animFrameRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const hasMovedRef = useRef(false);

  const [selectedZone, setSelectedZone] = useState('Espacio #1042 • Centro Histórico');
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingLatency, setPingLatency] = useState(14);

  // Sincronizar índice orbital cuando activeTab cambia externamente
  useEffect(() => {
    if (!activeTab) return;
    const foundIndex = ORBIT_ITEMS.findIndex(
      (item) => item.actionTarget === activeTab && item.id !== 'parking-map'
    );
    if (foundIndex !== -1 && foundIndex !== selectedIndex) {
      animateToOffset(foundIndex);
    }
  }, [activeTab]);

  const animateToOffset = useCallback((target) => {
    targetOffsetRef.current = target;
    setSelectedIndex(((Math.round(target) % 8) + 8) % 8);

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const step = () => {
      setOrbitOffset((current) => {
        const delta = targetOffsetRef.current - current;
        if (Math.abs(delta) < 0.005) {
          return targetOffsetRef.current;
        }
        const next = current + delta * 0.22;
        animFrameRef.current = requestAnimationFrame(step);
        return next;
      });
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const rotateToIndex = useCallback(
    (index) => {
      const diff = shortestAngularDiff(index, orbitOffset, 8);
      animateToOffset(orbitOffset + diff);
    },
    [orbitOffset, animateToOffset]
  );

  const handleNext = useCallback(() => {
    animateToOffset(Math.round(orbitOffset) + 1);
  }, [orbitOffset, animateToOffset]);

  const handlePrev = useCallback(() => {
    animateToOffset(Math.round(orbitOffset) - 1);
  }, [orbitOffset, animateToOffset]);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      animateToOffset(Math.round(orbitOffset) + delta);
    },
    [orbitOffset, animateToOffset]
  );

  const handlePointerDown = (e) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartYRef.current = e.clientY;
    dragStartOffsetRef.current = orbitOffset;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dy = e.clientY - dragStartYRef.current;
    if (Math.abs(dy) > 4) hasMovedRef.current = true;
    const next = dragStartOffsetRef.current - dy / 65;
    targetOffsetRef.current = next;
    setOrbitOffset(next);
    setSelectedIndex(((Math.round(next) % 8) + 8) % 8);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    animateToOffset(Math.round(orbitOffset));
  };

  // Acciones en 1 clic
  const handleStartParking = () => {
    startParking(selectedZone, 18.00, { lat: 19.4342, lng: -99.1318 });
    sileo.success({
      title: 'Estancia Iniciada',
      description: `${selectedZone} • Tarifa $0.25/min`,
    });
  };

  const handleStopParking = () => {
    const txn = stopParkingAndAutoCharge();
    if (txn) {
      sileo.success({
        title: 'Estancia Finalizada',
        description: `Folio ${txn.folio} • $${txn.amount.toFixed(2)} MXN`,
      });
    }
  };

  const handleInstantRecharge = (amount) => {
    if (addBalance) {
      addBalance(amount);
      sileo.success({
        title: 'Recarga Exitosa',
        description: `+$${amount}.00 MXN acreditados a tu tarjeta.`,
      });
    }
  };

  const handleToggleAutoPay = () => {
    const nextState = !autoPay?.enabled;
    updateAutoPay({ enabled: nextState });
    sileo.info({
      title: nextState ? 'Autocobro Activo' : 'Autocobro Pausado',
      description: nextState ? 'Débito automático habilitado.' : 'Autocobro en pausa.',
    });
  };

  const handlePinCurrentLocation = () => {
    const newPin = registerPinnedLocation({
      name: `Espacio #${Math.floor(1000 + Math.random() * 9000)}`,
      address: 'Ubicación GPS Actual',
      lat: 19.4342 + (Math.random() - 0.5) * 0.005,
      lng: -99.1318 + (Math.random() - 0.5) * 0.005,
      ratePerHour: 18.00,
    });
    sileo.success({
      title: 'Ubicación Guardada',
      description: `${newPin.name} fijado en tu bitácora.`,
    });
  };

  const handleToggleVehicle = () => {
    const isJetta = vehicle?.plates === 'XYZ-7842';
    updateVehicle({
      plates: isJetta ? 'ABC-4921' : 'XYZ-7842',
      brand: isJetta ? 'Audi' : 'Volkswagen',
      model: isJetta ? 'A4 S-Line' : 'Jetta Sportline',
      color: isJetta ? 'Negro Mito' : 'Plata Metálico',
    });
    sileo.info({
      title: 'Vehículo Seleccionado',
      description: isJetta ? 'ABC-4921 • Audi A4' : 'XYZ-7842 • VW Jetta',
    });
  };

  const handleRunPingTest = () => {
    setIsTestingPing(true);
    setTimeout(() => {
      const lat = Math.floor(11 + Math.random() * 6);
      setPingLatency(lat);
      setIsTestingPing(false);
      sileo.success({
        title: `Red Sincronizada (${lat}ms)`,
        description: 'Protocolo SSS.Solutions 100% activo.',
      });
    }, 450);
  };

  const currentItem = ORBIT_ITEMS[selectedIndex] || ORBIT_ITEMS[0];

  // Geometría calibrada para evitar cortes en bordes
  const dialHeight = 360;
  const centerY = dialHeight / 2;
  const orbitRadius = 180;
  const angleStepRad = 0.44;

  return (
    <div
      className={`w-full rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden font-sans ${className}`}
    >
      {/* Resplandor suave que tiñe delicadamente el fondo translúcido */}
      <div
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[90px] pointer-events-none transition-colors duration-700 opacity-20"
        style={{ backgroundColor: currentItem.color }}
      />

      {/* ═══ 1. ENCABEZADO MINIMALISTA ═══ */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: currentItem.color }}
          />
          <h3 className="font-sans font-black text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
            <span>Acciones Rápidas</span>
            <span className="font-mono text-[10px] text-[#D4D6E6]/60 font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              3D ÓRBITA
            </span>
          </h3>
        </div>

        {/* Selector de Vista Compacto */}
        <div className="p-0.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setViewMode('orbit')}
            className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
              viewMode === 'orbit'
                ? 'bg-[#0033FF] text-white shadow-[0_0_12px_rgba(0,51,255,0.4)]'
                : 'text-[#D4D6E6]/60 hover:text-white'
            }`}
          >
            Órbita
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#0033FF] text-white shadow-[0_0_12px_rgba(0,51,255,0.4)]'
                : 'text-[#D4D6E6]/60 hover:text-white'
            }`}
          >
            Todos (8)
          </button>
        </div>
      </div>

      {/* ═══ 2. BARRA DE ACCESO RÁPIDO COMPACTA (1 TOQUE) ═══ */}
      <div className="py-3 border-b border-white/[0.08] relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Recarga express */}
          <button
            type="button"
            onClick={() => handleInstantRecharge(100)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <CurrencyDollarIcon size={13} className="text-amber-400" />
            <span>+$100</span>
          </button>

          {/* Credencial QR */}
          <button
            type="button"
            onClick={onOpenQR}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span>QR</span>
          </button>

          {/* Toggle Autocobro */}
          <button
            type="button"
            onClick={handleToggleAutoPay}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
              autoPay?.enabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{autoPay?.enabled ? 'Autocobro ON' : 'Autocobro OFF'}</span>
          </button>

          {/* Fijar GPS */}
          <button
            type="button"
            onClick={handlePinCurrentLocation}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>Fijar GPS</span>
          </button>
        </div>

        {/* Botón de Parquímetro Iniciar/Finalizar */}
        {activeSession ? (
          <button
            type="button"
            onClick={handleStopParking}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-500 border border-rose-400 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Finalizar ({formatTimeFromSeconds(activeSession.secondsElapsed)})</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartParking}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Iniciar Parquímetro</span>
          </button>
        )}
      </div>

      {/* ═══ 3. VISOR ÓRBITA 3D (SPOTLIGHT LIMPIO + RULETA HOLOGRÁFICA) ═══ */}
      {viewMode === 'orbit' && (
        <div className="pt-5 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* PANEL IZQUIERDO: SPOTLIGHT CON ACCIÓN DIRECTA */}
            <div className="lg:col-span-7 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl min-h-[320px] shadow-xl">
              
              {/* Encabezado del módulo */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] px-2.5 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${currentItem.color}15`,
                      borderColor: `${currentItem.color}35`,
                      color: currentItem.color,
                    }}
                  >
                    {currentItem.category}
                  </span>
                  <span className="font-mono text-[11px] text-[#D4D6E6]/60 font-bold">
                    0{selectedIndex + 1} / 08
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-md shrink-0"
                    style={{
                      backgroundColor: `${currentItem.color}15`,
                      borderColor: `${currentItem.color}40`,
                      color: currentItem.color,
                      boxShadow: `0 0 20px ${currentItem.glowColor}`,
                    }}
                  >
                    <currentItem.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-black text-xl sm:text-2xl text-white tracking-tight">
                      {currentItem.label}
                    </h4>
                  </div>
                </div>
              </div>

              {/* BLOQUE DE CONTROL ESPECÍFICO SEGÚN EL MÓDULO */}
              <div className="my-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                
                {/* 1. Parquímetro */}
                {currentItem.id === 'dashboard' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-mono text-[10px] text-[#D4D6E6]/60 uppercase tracking-wider">
                        {activeSession ? 'Tiempo Transcurrido' : 'Estado'}
                      </div>
                      {activeSession ? (
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="font-mono font-black text-2xl text-amber-300">
                            {formatTimeFromSeconds(activeSession.secondsElapsed)}
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            ${activeSession.currentCost.toFixed(2)} MXN
                          </span>
                        </div>
                      ) : (
                        <div className="font-sans font-bold text-sm text-emerald-400 mt-0.5">
                          Listo para Estacionar
                        </div>
                      )}
                    </div>

                    {activeSession ? (
                      <button
                        type="button"
                        onClick={handleStopParking}
                        className="py-2 px-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Finalizar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartParking}
                        className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Iniciar</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 2. Autocobro */}
                {currentItem.id === 'autopay' && (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] text-[#D4D6E6]/60 uppercase tracking-wider">Cuenta Bancaria</div>
                      <div className="font-mono font-bold text-sm text-white mt-0.5">
                        {autoPay?.bank || 'Santander Platinum •••• 8821'}
                      </div>
                      <div className="font-mono text-[11px] text-[#D4D6E6]/60 mt-0.5">
                        Límite: ${autoPay?.maxLimitPerSession || 180}.00 MXN
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleAutoPay}
                      className={`py-2 px-3.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        autoPay?.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{autoPay?.enabled ? 'Pausar' : 'Activar'}</span>
                    </button>
                  </div>
                )}

                {/* 3. Recarga */}
                {currentItem.id === 'recharge' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] text-[#D4D6E6]/60 uppercase tracking-wider">Saldo Tarjeta</div>
                      <div className="font-mono font-black text-2xl text-amber-400 mt-0.5">
                        ${Number(card?.balance ?? 0).toFixed(2)}{' '}
                        <span className="font-sans text-xs text-[#D4D6E6]/60 font-normal">MXN</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[50, 100, 200, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleInstantRecharge(amt)}
                          className="py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-amber-500/20 hover:text-amber-300 border border-white/10 text-xs font-mono font-bold text-white transition cursor-pointer"
                        >
                          +${amt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Credencial QR */}
                {currentItem.id === 'qr-credential' && (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] text-[#D4D6E6]/60 uppercase tracking-wider">Placas Oficiales</div>
                      <div className="font-mono font-black text-xl text-white mt-0.5">
                        {formatPlate(vehicle?.plates)}
                      </div>
                      <div className="font-mono text-[10px] text-[#D4D6E6]/60">Cifrado AES-256</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(vehicle?.plates || 'XYZ-7842');
                          sileo.success({ title: 'Placas Copiadas', description: vehicle?.plates });
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition cursor-pointer"
                        title="Copiar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={onOpenQR}
                        className="py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Abrir QR</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Mapa GPS */}
                {currentItem.id === 'parking-map' && (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] text-[#D4D6E6]/60 uppercase tracking-wider">Ubicación Fijada</div>
                      <div className="font-sans font-bold text-sm text-white mt-0.5">
                        {pinnedLocations.length} espacio(s) guardado(s)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePinCurrentLocation}
                      className="py-2 px-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Fijar Aquí</span>
                    </button>
                  </div>
                )}

                {/* 6. Vehículo */}
                {currentItem.id === 'vehicle' && (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] text-[#D4D6E6]/60 uppercase tracking-wider">Vehículo Actual</div>
                      <div className="font-mono font-bold text-base text-white mt-0.5">
                        {formatPlate(vehicle?.plates)}
                      </div>
                      <div className="font-sans text-[11px] text-[#D4D6E6]/60">
                        {vehicle?.brand} {vehicle?.model}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleVehicle}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Alternar</span>
                    </button>
                  </div>
                )}

                {/* 7. Historial */}
                {currentItem.id === 'history' && (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] text-[#D4D6E6]/60 uppercase tracking-wider">Último Folio</div>
                      <div className="font-mono font-bold text-base text-pink-400 mt-0.5">
                        {transactions?.[0]?.folio || 'PQM-88A2'}
                      </div>
                      <div className="font-mono text-[10px] text-[#D4D6E6]/60">
                        {transactions?.length || 0} recibos auditados
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectTab('history')}
                      className="py-2 px-3.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-sans text-xs font-bold transition cursor-pointer"
                    >
                      Ver Recibos
                    </button>
                  </div>
                )}

                {/* 8. Telemetría */}
                {currentItem.id === 'telemetry' && (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] text-[#D4D6E6]/60 uppercase tracking-wider">Latencia de Enlace</div>
                      <div className="font-mono font-black text-xl text-emerald-400 mt-0.5">
                        {pingLatency}ms <span className="text-xs text-[#D4D6E6]/60 font-normal">Online</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunPingTest}
                      disabled={isTestingPing}
                      className="py-2 px-3.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <Radio className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin' : ''}`} />
                      <span>{isTestingPing ? 'Midiendo...' : 'Test Ping'}</span>
                    </button>
                  </div>
                )}

              </div>

              {/* Botón de navegación al módulo completo */}
              <button
                type="button"
                onClick={() => onSelectTab(currentItem.actionTarget)}
                className="w-full py-2 px-3 rounded-xl text-xs font-sans font-bold text-white/80 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer bg-white/[0.03] hover:bg-white/[0.07] border border-white/10"
              >
                <span>Ver Módulo Completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

            </div>

            {/* PANEL DERECHO: RULETA ORBITAL LIMPIA (SIN TEXTOS CORTADOS) */}
            <div className="lg:col-span-5 relative flex items-center justify-center select-none overflow-hidden h-[340px] rounded-2xl bg-white/[0.01] border border-white/[0.08]">
              
              {/* Botones de rotación sutiles */}
              <div className="absolute right-3 top-3 z-40 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition cursor-pointer"
                  title="Anterior"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition cursor-pointer"
                  title="Siguiente"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Puntero Láser Ápex en el centro exacto */}
              <div
                className="absolute z-30 pointer-events-none flex items-center gap-1.5"
                style={{
                  left: '14px',
                  top: `${centerY}px`,
                  transform: 'translateY(-50%)',
                }}
              >
                <div
                  className="h-10 w-1 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: currentItem.color,
                    boxShadow: `0 0 16px ${currentItem.color}`,
                  }}
                />
              </div>

              {/* Contenedor interactivo del dial */}
              <div
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-full relative cursor-grab active:cursor-grabbing touch-none"
              >
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 340 360"
                  fill="none"
                >
                  <circle
                    cx="260"
                    cy="180"
                    r={orbitRadius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1.2"
                    strokeDasharray="4 6"
                  />
                  <path
                    d="M 80 180 A 180 180 0 0 1 105 100"
                    stroke={currentItem.color}
                    strokeWidth="2"
                    strokeOpacity="0.8"
                  />
                  <path
                    d="M 80 180 A 180 180 0 0 0 105 260"
                    stroke={currentItem.color}
                    strokeWidth="2"
                    strokeOpacity="0.8"
                  />
                </svg>

                {/* Elementos en órbita */}
                {ORBIT_ITEMS.map((item, index) => {
                  const diff = shortestAngularDiff(index, orbitOffset, 8);
                  const absDiff = Math.abs(diff);

                  if (absDiff > 2.8) return null;

                  const angle = Math.PI - diff * angleStepRad;
                  const centerX = 260;

                  const iconX = centerX + orbitRadius * Math.cos(angle);
                  const iconY = centerY + orbitRadius * Math.sin(angle);

                  const opacity = Math.max(0, 1 - Math.pow(absDiff / 2.8, 1.6));
                  const scale = Math.max(0.75, 1 - absDiff * 0.1);
                  const isSelected = absDiff < 0.45;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => rotateToIndex(index)}
                      style={{
                        position: 'absolute',
                        left: `${iconX}px`,
                        top: `${iconY}px`,
                        transform: `translate(-50%, -50%) scale(${isSelected ? 1.15 : scale})`,
                        opacity,
                        zIndex: isSelected ? 35 : Math.round(20 - absDiff * 2),
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out, opacity 0.1s ease-out',
                      }}
                      className="cursor-pointer group pointer-events-auto flex items-center gap-2"
                    >
                      {/* Icono circular limpio */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                          isSelected
                            ? 'border-2 shadow-xl bg-white/[0.08] backdrop-blur-md'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/30 backdrop-blur-sm'
                        }`}
                        style={{
                          borderColor: isSelected ? item.color : undefined,
                          boxShadow: isSelected ? `0 0 20px ${item.glowColor}` : undefined,
                          color: item.color,
                        }}
                      >
                        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </div>

                      {/* Solo el elemento activo muestra su nombre en un pill limpio sin cortar */}
                      {isSelected && (
                        <div
                          className="px-2.5 py-1 rounded-full border text-xs font-sans font-bold whitespace-nowrap shadow-lg bg-black/60 backdrop-blur-md border-white/20 text-white"
                        >
                          {item.shortLabel}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ═══ 4. VISTA CUADRÍCULA ("TODOS") LIMPIA ═══ */}
      {viewMode === 'grid' && (
        <div className="pt-5 relative z-10 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ORBIT_ITEMS.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedIndex(idx);
                    onSelectTab(item.actionTarget);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group backdrop-blur-xl ${
                    isSelected
                      ? 'bg-white/[0.08] border-white shadow-lg'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                  style={{
                    borderColor: isSelected ? item.color : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{
                        backgroundColor: `${item.color}15`,
                        borderColor: `${item.color}35`,
                        color: item.color,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-[10px] text-[#D4D6E6]/60 font-bold">
                      0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-sans font-bold text-xs text-white">
                      {item.label}
                    </h5>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ 5. SELECTOR RÁPIDO DE 1 TOQUE (8 PÍLDORAS LIMPIAS) ═══ */}
      <div className="pt-4 mt-4 border-t border-white/[0.08] relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {ORBIT_ITEMS.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  rotateToIndex(idx);
                  if (viewMode === 'grid') setSelectedIndex(idx);
                }}
                className={`py-1.5 px-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
                  isSelected
                    ? 'bg-white/10 border-white shadow-md text-white'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 text-[#D4D6E6]/70 hover:text-white'
                }`}
                style={{
                  borderColor: isSelected ? item.color : undefined,
                  boxShadow: isSelected ? `0 0 12px ${item.glowColor}` : undefined,
                }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                  }}
                >
                  <Icon className="w-3 h-3" />
                </div>
                <span className="font-sans text-[11px] font-bold truncate">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default OrbitalWheelMenu;
