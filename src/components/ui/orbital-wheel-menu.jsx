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
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Grid,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { CurrencyDollarIcon, PlugConnectedIcon } from '../icons';
import { useParking } from '../../context/ParkingContext';
import { formatCurrency, formatPlate, formatTimeFromSeconds } from '../../utils/formatters';
import { sileo } from 'sileo';

/**
 * ORBITAL WHEEL MENU PARA PARQU
 * Adaptación de la ruleta/órbita interactiva al sistema de Parquímetro Digital.
 * Optimizado para máxima claridad ("fácil de ver y elegir") con:
 * 1. Ruleta orbital 3D matemática con arrastre táctil, rueda del mouse y salto por clic
 * 2. Panel Spotlight en vivo con métricas del sistema en tiempo real y botones de 1 toque
 * 3. Selector dock inferior con los 8 módulos visibles simultáneamente
 * 4. Modo Cuadrícula Completa ("Ver Todo") conmutador instantáneo
 */

const ORBIT_ITEMS_BASE = [
  {
    id: 'dashboard',
    label: 'Parquímetro en Vivo',
    shortLabel: 'Parquímetro',
    category: 'OPERACIÓN VIAL',
    icon: Clock,
    color: '#10B981', // Emerald
    glowColor: 'rgba(16, 185, 129, 0.4)',
    actionType: 'tab',
    actionTarget: 'dashboard',
    description: 'Control de estancia segundo a segundo con tarifa regulada de $0.25 MXN/min y garantía cero multas.',
  },
  {
    id: 'autopay',
    label: 'Modo Autocobro',
    shortLabel: 'Autocobro',
    category: 'PAGO CONTINUO',
    icon: Zap,
    color: '#807DFE', // Indigo / Purple
    glowColor: 'rgba(128, 125, 254, 0.45)',
    actionType: 'tab',
    actionTarget: 'autopay',
    description: 'Débito bancario automático sin monedas ni filas. Extiende tu estancia sin necesidad de volver al auto.',
  },
  {
    id: 'recharge',
    label: 'Recargar Saldo',
    shortLabel: 'Recarga',
    category: 'MONEDERO PARQU',
    icon: CurrencyDollarIcon,
    color: '#F59E0B', // Amber
    glowColor: 'rgba(245, 158, 11, 0.4)',
    actionType: 'modal-recharge',
    actionTarget: null,
    description: 'Añade saldo inmediato a tu tarjeta digital Parqu sin comisiones con acreditación en milisegundos.',
  },
  {
    id: 'qr-credential',
    label: 'Credencial QR',
    shortLabel: 'Pase QR',
    category: 'INSPECCIÓN OFICIAL',
    icon: QrCode,
    color: '#38BDF8', // Cyan
    glowColor: 'rgba(56, 189, 248, 0.45)',
    actionType: 'modal-qr',
    actionTarget: null,
    description: 'Pase contactless oficial para escaneo de agentes viales. Verificación de estancia encriptada AES-256.',
  },
  {
    id: 'parking-map',
    label: 'Mapa Satelital GPS',
    shortLabel: 'Mapa GPS',
    category: 'UBICACIÓN & RUTAS',
    icon: MapPin,
    color: '#FB923C', // Coral Orange
    glowColor: 'rgba(251, 146, 60, 0.45)',
    actionType: 'tab',
    actionTarget: 'dashboard',
    description: 'Fija la ubicación exacta de tu vehículo, registra el número de cajón o simula tu recorrido animado en 3D.',
  },
  {
    id: 'vehicle',
    label: 'Padrón Vehicular',
    shortLabel: 'Vehículo',
    category: 'PADRÓN MUNICIPAL',
    icon: Car,
    color: '#F43F5E', // Rose
    glowColor: 'rgba(244, 63, 94, 0.45)',
    actionType: 'tab',
    actionTarget: 'vehicle',
    description: 'Administración de placas oficiales, marca, modelo y credenciales del titular vinculado a la tarjeta.',
  },
  {
    id: 'history',
    label: 'Historial de Cobros',
    shortLabel: 'Historial',
    category: 'BITÁCORA FISCAL',
    icon: History,
    color: '#EC4899', // Pink
    glowColor: 'rgba(236, 72, 153, 0.45)',
    actionType: 'tab',
    actionTarget: 'history',
    description: 'Auditoría completa con folios oficiales PQM, desglose de minutos, montos debitados y comprobantes.',
  },
  {
    id: 'telemetry',
    label: 'Diagnóstico & Red',
    shortLabel: 'Telemetría',
    category: 'SISTEMA METROPOLITANO',
    icon: Activity,
    color: '#A78BFA', // Lavender
    glowColor: 'rgba(167, 139, 250, 0.45)',
    actionType: 'action-diagnostics',
    actionTarget: null,
    description: 'Monitoreo en tiempo real de enlace satelital, sensores de parquímetro y sincronización municipal.',
  },
];

// Cálculo de la distancia angular mínima en ciclo modular de 8 elementos
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
    owner = {},
    card = {},
    autoPay = {},
    activeSession,
    transactions = [],
    pinnedLocations = [],
    addBalance,
  } = useParking();

  // Modo de visualización: 'orbit' (ruleta 3D interactiva) | 'grid' (visión completa de 8 tarjetas)
  const [viewMode, setViewMode] = useState('orbit');

  // Índice activo seleccionado (0 a 7)
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Offset continuo para animación suave de la órbita (soporta arrastre y resortes)
  const [orbitOffset, setOrbitOffset] = useState(0);
  const targetOffsetRef = useRef(0);
  const animFrameRef = useRef(null);

  // Estado de arrastre manual
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Sincronizar el índice orbital cuando activeTab cambia externamente
  useEffect(() => {
    if (!activeTab) return;
    const foundIndex = ORBIT_ITEMS_BASE.findIndex(
      (item) => item.actionTarget === activeTab && item.id !== 'parking-map'
    );
    if (foundIndex !== -1 && foundIndex !== selectedIndex) {
      animateToOffset(foundIndex);
    }
  }, [activeTab]);

  // Interpolación física suave hacia el objetivo
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
        // Amortiguación tipo resorte (spring damping)
        const next = current + delta * 0.22;
        animFrameRef.current = requestAnimationFrame(step);
        return next;
      });
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, []);

  // Limpieza de animación al desmontar
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Girar a un índice específico con el menor recorrido angular
  const rotateToIndex = useCallback(
    (index) => {
      const diff = shortestAngularDiff(index, orbitOffset, 8);
      const nextTarget = orbitOffset + diff;
      animateToOffset(nextTarget);
    },
    [orbitOffset, animateToOffset]
  );

  const handleNext = useCallback(() => {
    const next = Math.round(orbitOffset) + 1;
    animateToOffset(next);
  }, [orbitOffset, animateToOffset]);

  const handlePrev = useCallback(() => {
    const prev = Math.round(orbitOffset) - 1;
    animateToOffset(prev);
  }, [orbitOffset, animateToOffset]);

  // Manejo de la rueda del ratón sobre el dial orbital
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      const next = Math.round(orbitOffset) + delta;
      animateToOffset(next);
    },
    [orbitOffset, animateToOffset]
  );

  // Gestos de arrastre con puntero (Mouse o Touch)
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
    if (Math.abs(dy) > 4) {
      hasMovedRef.current = true;
    }
    // Cada 65px de arrastre equivale a 1 paso orbital
    const next = dragStartOffsetRef.current - dy / 65;
    targetOffsetRef.current = next;
    setOrbitOffset(next);
    setSelectedIndex(((Math.round(next) % 8) + 8) % 8);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Ajustar con snap magnético al elemento entero más cercano
    const snapped = Math.round(orbitOffset);
    animateToOffset(snapped);
  };

  // Ejecución de la acción del elemento seleccionado
  const executeItemAction = useCallback(
    (item) => {
      if (!item) return;

      if (item.actionType === 'tab' && item.actionTarget) {
        onSelectTab(item.actionTarget);
        sileo.info({
          title: item.label,
          description: `Has navegado a ${item.label}.`,
        });
      } else if (item.actionType === 'modal-recharge') {
        if (onOpenRecharge) onOpenRecharge();
      } else if (item.actionType === 'modal-qr') {
        if (onOpenQR) onOpenQR();
      } else if (item.actionType === 'action-diagnostics') {
        sileo.success({
          title: 'Telemetría Municipal Sincronizada',
          description: 'Todos los protocolos de comunicación y parquímetros operan con 14ms de latencia.',
        });
      }
    },
    [onSelectTab, onOpenRecharge, onOpenQR]
  );

  // Recarga rápida instantánea dentro del Command Spotlight
  const handleInstantRecharge = (amount) => {
    if (addBalance) {
      addBalance(amount);
      sileo.success({
        title: '¡Recarga Express Acreditada!',
        description: `Se han añadido $${amount}.00 MXN a tu tarjeta Parqu.`,
      });
    }
  };

  // Datos dinámicos del elemento activo en el Command Spotlight
  const currentItem = ORBIT_ITEMS_BASE[selectedIndex] || ORBIT_ITEMS_BASE[0];

  // Geometría del arco orbital en la ruleta
  const dialHeight = 440;
  const centerY = dialHeight / 2;
  const orbitRadius = 240;
  const labelRadius = 350;
  const angleStepRad = 0.42; // ~24 grados por paso

  return (
    <div
      className={`w-full rounded-3xl bg-[#01033E]/60 border border-white/10 backdrop-blur-xl backdrop-saturate-150 p-5 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.35)] relative overflow-hidden font-sans ${className}`}
    >
      {/* Resplandor ambiental de fondo sincronizado con el color del elemento activo */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700 opacity-20"
        style={{ backgroundColor: currentItem.color }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-700 opacity-15"
        style={{ backgroundColor: currentItem.color }}
      />

      {/* ═══ 1. ENCABEZADO Y CONMUTADOR DE VISTAS (ÓRBITA / CUADRÍCULA) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: currentItem.color }}
            />
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em] text-[#D4D6E6] uppercase">
              SELECTOR ORBITAL INTELIGENTE • PARQU 2026
            </span>
            <span className="text-white/30 hidden xs:inline">•</span>
            <span className="text-[10px] text-white/60 font-mono hidden xs:inline">
              MÓDULO {String(selectedIndex + 1).padStart(2, '0')}/08
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#807DFE]" />
            <span>Centro de Acceso Rápido y Selección</span>
          </h2>
          <p className="text-xs text-[#D4D6E6]/80 mt-0.5">
            Gira la ruleta orbital, haz clic en cualquier módulo o cambia a vista cuadrícula para ver todo de un vistazo.
          </p>
        </div>

        {/* Controles de Vista y Navegación Rápida */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Conmutador Modo Órbita vs Modo Cuadrícula */}
          <div className="p-1 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('orbit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'orbit'
                  ? 'bg-[#0033FF] text-white shadow-[0_0_15px_rgba(0,51,255,0.4)]'
                  : 'text-[#D4D6E6]/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Modo Órbita</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#0033FF] text-white shadow-[0_0_15px_rgba(0,51,255,0.4)]'
                  : 'text-[#D4D6E6]/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Ver Todos (8)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ 2. VISTA ÓRBITA 3D (COMMAND SPOTLIGHT + RULETA ORBITAL) ═══ */}
      {viewMode === 'orbit' && (
        <div className="pt-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* LADO IZQUIERDO: COMMAND SPOTLIGHT (MÁXIMA CLARIDAD DE LECTURA Y ACCIÓN) */}
            <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl relative overflow-hidden min-h-[380px] shadow-2xl">
              
              {/* Línea superior con categoría y estado en vivo */}
              <div className="flex items-center justify-between gap-3 relative z-10 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border"
                  style={{
                    backgroundColor: `${currentItem.color}15`,
                    borderColor: `${currentItem.color}40`,
                    color: currentItem.color,
                  }}
                >
                  {currentItem.category}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-mono text-white/70">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentItem.color }} />
                  <span>ACTIVO</span>
                </div>
              </div>

              {/* Título y descripción del módulo enfocado */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg"
                    style={{
                      backgroundColor: `${currentItem.color}20`,
                      borderColor: `${currentItem.color}50`,
                      color: currentItem.color,
                      boxShadow: `0 0 20px ${currentItem.glowColor}`,
                    }}
                  >
                    <currentItem.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {currentItem.label}
                    </h3>
                    <span className="text-[11px] font-mono text-[#D4D6E6]/70">
                      ID del Sistema: #{currentItem.id}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#D4D6E6] leading-relaxed pt-2">
                  {currentItem.description}
                </p>
              </div>

              {/* Bloque Dinámico de Telemetría según el elemento enfocado */}
              <div className="relative z-10 mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                {/* 1. Dashboard / Parquímetro */}
                {currentItem.id === 'dashboard' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                        Estado Actual
                      </div>
                      <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        {activeSession ? (
                          <>
                            <span className="text-amber-400 font-mono">
                              {formatTimeFromSeconds(activeSession.secondsElapsed)}
                            </span>
                            <span className="text-xs text-white/50">•</span>
                            <span className="text-emerald-400 font-mono">
                              ${activeSession.currentCost.toFixed(2)} MXN
                            </span>
                          </>
                        ) : (
                          <span className="text-emerald-400">Sin estancia activa (Listo)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        {activeSession ? activeSession.zoneName : '4 Zonas Metropolitanas Disponibles'}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white/10 text-white">
                      {activeSession ? 'EN CURSO' : 'DISPONIBLE'}
                    </span>
                  </div>
                )}

                {/* 2. Autocobro */}
                {currentItem.id === 'autopay' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                        Cuenta de Débito Vinculada
                      </div>
                      <div className="text-base sm:text-lg font-bold text-white font-mono">
                        {autoPay?.bank || 'Santander Platinum Débito'}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        Límite por sesión: <strong className="text-white">${autoPay?.maxLimitPerSession || 180}.00 MXN</strong>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {autoPay?.enabled ? 'ACTIVO' : 'PAUSADO'}
                    </span>
                  </div>
                )}

                {/* 3. Recarga */}
                {currentItem.id === 'recharge' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                          Saldo Disponible
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                          ${Number(card?.balance ?? 0).toFixed(2)}{' '}
                          <span className="text-xs text-white/60 font-sans font-normal">MXN</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        MONEDERO PARQU
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/60 uppercase">Recarga Express:</span>
                      {[100, 200, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleInstantRecharge(amt)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-amber-500/20 hover:text-amber-300 border border-white/10 text-xs font-mono font-bold text-white transition cursor-pointer"
                        >
                          +${amt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Credencial QR */}
                {currentItem.id === 'qr-credential' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                        Verificación Oficial
                      </div>
                      <div className="text-base sm:text-lg font-bold text-white font-mono">
                        {formatPlate(vehicle?.plates)}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        Etiqueta RFID: {card?.rfidTag || 'NFC-MX-09142-PK'}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      AES-256
                    </span>
                  </div>
                )}

                {/* 5. Mapa GPS */}
                {currentItem.id === 'parking-map' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                        Bitácora Satelital
                      </div>
                      <div className="text-base sm:text-lg font-bold text-white">
                        {pinnedLocations?.length || 0} Ubicaciones Guardadas
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        Rutas 3D y radar de proximidad habilitados
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      GPS EN VIVO
                    </span>
                  </div>
                )}

                {/* 6. Vehículo */}
                {currentItem.id === 'vehicle' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                        Vehículo Registrado
                      </div>
                      <div className="text-base sm:text-lg font-bold text-white">
                        {vehicle?.brand} {vehicle?.model}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        Titular: <strong className="text-white">{owner?.fullName}</strong>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                      {formatPlate(vehicle?.plates)}
                    </span>
                  </div>
                )}

                {/* 7. Historial */}
                {currentItem.id === 'history' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                        Registros en Bitácora
                      </div>
                      <div className="text-base sm:text-lg font-bold text-white">
                        {transactions?.length || 0} Transacciones Auditadas
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        Último folio: {transactions?.[0]?.folio || 'PQM-88A2'}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      FISCAL
                    </span>
                  </div>
                )}

                {/* 8. Telemetría */}
                {currentItem.id === 'telemetry' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                        Latencia Satelital
                      </div>
                      <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
                        14ms • Enlace Óptimo
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        Protocolo de Red Municipal SSS.Solutions Activo
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      100% ONLINE
                    </span>
                  </div>
                )}
              </div>

              {/* Botón de Acción Principal del Spotlight */}
              <div className="relative z-10 pt-5 mt-5 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => executeItemAction(currentItem)}
                  className="flex-1 py-3 px-5 rounded-2xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-xl cursor-pointer"
                  style={{
                    backgroundColor: currentItem.color,
                    boxShadow: `0 0 25px ${currentItem.glowColor}`,
                  }}
                >
                  <span>Abrir / Gestionar {currentItem.shortLabel}</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>

            </div>

            {/* LADO DERECHO: RULETA ORBITAL 3D (ARCO CIRCULAR CURVO CON FISICAS Y SELECCIÓN) */}
            <div className="lg:col-span-5 relative flex items-center justify-center select-none overflow-hidden h-[440px] rounded-3xl bg-black/30 border border-white/10">
              
              {/* Botones de Paso Arriba / Abajo para facilitar el giro */}
              <div className="absolute right-4 top-4 z-40 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition cursor-pointer shadow-md"
                  title="Elemento anterior"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition cursor-pointer shadow-md"
                  title="Elemento siguiente"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Indicador láser central / marcador fijo en el ápex */}
              <div
                className="absolute z-30 pointer-events-none flex items-center gap-2"
                style={{
                  left: '12px',
                  top: `${centerY}px`,
                  transform: 'translateY(-50%)',
                }}
              >
                <div
                  className="h-10 w-1.5 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: currentItem.color,
                    boxShadow: `0 0 16px ${currentItem.color}`,
                  }}
                />
                <span className="text-[9px] font-mono font-bold tracking-widest text-white/50 uppercase hidden sm:inline">
                  ÁPEX
                </span>
              </div>

              {/* Contenedor interactivo del dial orbital con soporte de arrastre y rueda */}
              <div
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-full relative cursor-grab active:cursor-grabbing touch-none"
              >
                {/* SVG del arco orbital circular en el fondo */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 380 440"
                  fill="none"
                >
                  {/* Arco circular tenue completo */}
                  <circle
                    cx="330"
                    cy="220"
                    r={orbitRadius}
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {/* Arco activo iluminado con el color actual cerca del centro */}
                  <path
                    d="M 90 220 A 240 240 0 0 1 115 140"
                    stroke={currentItem.color}
                    strokeWidth="2.5"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M 90 220 A 240 240 0 0 0 115 300"
                    stroke={currentItem.color}
                    strokeWidth="2.5"
                    strokeOpacity="0.6"
                  />
                </svg>

                {/* Renderizado de los 8 elementos calculados a lo largo de la circunferencia */}
                {ORBIT_ITEMS_BASE.map((item, index) => {
                  const diff = shortestAngularDiff(index, orbitOffset, 8);
                  const absDiff = Math.abs(diff);

                  // Ocultar elementos fuera del arco visible (-3.2 a 3.2 pasos)
                  if (absDiff > 3.2) return null;

                  // Cálculo trigonométrico de coordenadas circulares
                  const angle = Math.PI - diff * angleStepRad;
                  const centerX = 330;

                  const iconX = centerX + orbitRadius * Math.cos(angle);
                  const iconY = centerY + orbitRadius * Math.sin(angle);

                  const labelX = centerX + labelRadius * Math.cos(angle);
                  const labelY = centerY + labelRadius * Math.sin(angle);

                  // Opacidad, escala y rotación basadas en proximidad al centro
                  const opacity = Math.max(0, 1 - Math.pow(absDiff / 3.2, 1.6));
                  const scale = Math.max(0.72, 1 - absDiff * 0.09);
                  const isSelected = absDiff < 0.45;
                  const rotationDeg = -diff * 7;
                  const Icon = item.icon;

                  return (
                    <React.Fragment key={item.id}>
                      {/* Píldora de Etiqueta (Lado Interior Izquierdo) */}
                      <div
                        onClick={() => rotateToIndex(index)}
                        style={{
                          position: 'absolute',
                          left: `${labelX}px`,
                          top: `${labelY}px`,
                          transform: `translate(-50%, -50%) rotate(${rotationDeg}deg) scale(${scale})`,
                          opacity,
                          zIndex: isSelected ? 30 : Math.round(20 - absDiff * 2),
                          transition: isDragging ? 'none' : 'transform 0.1s ease-out, opacity 0.1s ease-out',
                        }}
                        className="cursor-pointer group pointer-events-auto"
                      >
                        <div
                          className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 shadow-md ${
                            isSelected
                              ? 'bg-white text-black font-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                              : 'bg-black/60 text-[#D4D6E6]/80 border-white/10 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs whitespace-nowrap tracking-tight">
                            {item.shortLabel}
                          </span>
                        </div>
                      </div>

                      {/* Tarjeta de Icono Circular (Sobre la Pista Orbital) */}
                      <div
                        onClick={() => rotateToIndex(index)}
                        style={{
                          position: 'absolute',
                          left: `${iconX}px`,
                          top: `${iconY}px`,
                          transform: `translate(-50%, -50%) scale(${isSelected ? 1.15 : scale})`,
                          opacity,
                          zIndex: isSelected ? 35 : Math.round(25 - absDiff * 2),
                          transition: isDragging ? 'none' : 'transform 0.1s ease-out, opacity 0.1s ease-out',
                        }}
                        className="cursor-pointer group pointer-events-auto"
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                            isSelected
                              ? 'border-2 shadow-2xl bg-[#01033E]'
                              : 'bg-[#01033E]/80 border-white/15 hover:border-white/40'
                          }`}
                          style={{
                            borderColor: isSelected ? item.color : undefined,
                            boxShadow: isSelected ? `0 0 25px ${item.glowColor}` : undefined,
                            color: item.color,
                          }}
                        >
                          <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Indicador de Ayuda al Usuario */}
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
                <span className="text-[10px] font-mono text-white/40 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                  Desliza o usa la rueda del mouse para rotar
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ═══ 3. VISTA CUADRÍCULA COMPLETA ("VER TODOS" EN 1 CLIC) ═══ */}
      {viewMode === 'grid' && (
        <div className="pt-6 relative z-10 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ORBIT_ITEMS_BASE.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedIndex(idx);
                    executeItemAction(item);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group backdrop-blur-xl ${
                    isSelected
                      ? 'bg-white/10 border-white shadow-xl'
                      : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/8'
                  }`}
                  style={{
                    borderColor: isSelected ? item.color : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-md group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: `${item.color}20`,
                        borderColor: `${item.color}40`,
                        color: item.color,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${item.color}15`,
                        borderColor: `${item.color}35`,
                        color: item.color,
                      }}
                    >
                      {item.category.split(' ')[0]}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-white transition">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-[#D4D6E6]/70 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white">
                    <span className="text-[10px] text-white/50 font-mono">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform" style={{ color: item.color }}>
                      Abrir Módulo
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ 4. DOCK SELECTOR RÁPIDO INFERIOR (LOS 8 MÓDULOS EN 1 TOQUE) ═══ */}
      <div className="pt-6 mt-6 border-t border-white/10 relative z-10">
        <div className="flex items-center justify-between gap-3 mb-2 px-1">
          <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest font-bold">
            SELECTOR RÁPIDO DE 1 TOQUE
          </span>
          <span className="text-[10px] text-white/40 hidden sm:inline">
            Haz clic en cualquier píldora para centrar la ruleta al instante
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {ORBIT_ITEMS_BASE.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  rotateToIndex(idx);
                  if (viewMode === 'grid') {
                    setSelectedIndex(idx);
                  }
                }}
                className={`p-2 rounded-xl border transition-all text-left flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-white/15 border-white shadow-lg text-white'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8 text-[#D4D6E6]/70 hover:text-white'
                }`}
                style={{
                  borderColor: isSelected ? item.color : undefined,
                  boxShadow: isSelected ? `0 0 15px ${item.glowColor}` : undefined,
                }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${item.color}25`,
                    color: item.color,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate font-sans">
                  <div className="text-[10px] font-bold truncate leading-tight">
                    {item.shortLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default OrbitalWheelMenu;
