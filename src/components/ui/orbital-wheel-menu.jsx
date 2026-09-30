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
  Play,
  Square,
  RefreshCw,
  Copy,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { CurrencyDollarIcon, PlugConnectedIcon } from '../icons';
import { useParking } from '../../context/ParkingContext';
import { formatCurrency, formatPlate, formatTimeFromSeconds } from '../../utils/formatters';
import { sileo } from 'sileo';

/**
 * ORBITAL CONTROL CENTER METROPOLITANO • PARQU
 * Menú orbital 100% transparente con estética de cabina de cristal líquida (Liquid Glass).
 * Todas las acciones del sistema están integradas para ejecución directa en 1 clic:
 * - Parquímetro: Iniciar / Detener estancia en tiempo real
 * - Recarga: Añadir saldo express (+$50, +$100, +$200, +$500) en 1 toque
 * - Autocobro: Toggle ON/OFF instantáneo y selector de límites de sesión
 * - Credencial QR: Previsualización directa y copia de folio/placas
 * - GPS & Mapa: Fijar espacio actual con geolocalización
 * - Vehículo: Alternar vehículos del padrón
 * - Historial: Inspección de último recibo oficial
 * - Telemetría: Ping y diagnóstico de red en vivo
 */

const ORBIT_ITEMS = [
  {
    id: 'dashboard',
    label: 'Parquímetro en Vivo',
    shortLabel: 'Parquímetro',
    category: 'OPERACIÓN VIAL',
    icon: Clock,
    color: '#10B981', // Emerald
    glowColor: 'rgba(16, 185, 129, 0.45)',
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
    glowColor: 'rgba(128, 125, 254, 0.5)',
    actionTarget: 'autopay',
    description: 'Débito bancario automático sin monedas ni filas. Extiende tu estancia sin necesidad de volver al auto.',
  },
  {
    id: 'recharge',
    label: 'Recarga Express',
    shortLabel: 'Recarga',
    category: 'MONEDERO PARQU',
    icon: CurrencyDollarIcon,
    color: '#F59E0B', // Amber
    glowColor: 'rgba(245, 158, 11, 0.45)',
    actionTarget: 'recharge',
    description: 'Añade saldo instantáneo a tu tarjeta digital Parqu sin comisiones con acreditación inmediata.',
  },
  {
    id: 'qr-credential',
    label: 'Credencial QR',
    shortLabel: 'Pase QR',
    category: 'INSPECCIÓN OFICIAL',
    icon: QrCode,
    color: '#38BDF8', // Cyan
    glowColor: 'rgba(56, 189, 248, 0.5)',
    actionTarget: 'qr-credential',
    description: 'Pase contactless oficial para escaneo de agentes viales. Verificación de estancia encriptada AES-256.',
  },
  {
    id: 'parking-map',
    label: 'Mapa Satelital GPS',
    shortLabel: 'Mapa GPS',
    category: 'UBICACIÓN & RUTAS',
    icon: MapPin,
    color: '#FB923C', // Coral Orange
    glowColor: 'rgba(251, 146, 60, 0.5)',
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
    glowColor: 'rgba(244, 63, 94, 0.5)',
    actionTarget: 'vehicle',
    description: 'Administración de placas oficiales, marca, modelo y credenciales del titular vinculado a la tarjeta.',
  },
  {
    id: 'history',
    label: 'Historial & Recibos',
    shortLabel: 'Historial',
    category: 'BITÁCORA FISCAL',
    icon: History,
    color: '#EC4899', // Pink
    glowColor: 'rgba(236, 72, 153, 0.5)',
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
    glowColor: 'rgba(167, 139, 250, 0.5)',
    actionTarget: 'telemetry',
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

  // Estados interactivos para telemetría y zona
  const [selectedZone, setSelectedZone] = useState('Espacio #1042 • Centro Histórico');
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingLatency, setPingLatency] = useState(14);

  // Sincronizar el índice orbital cuando activeTab cambia externamente
  useEffect(() => {
    if (!activeTab) return;
    const foundIndex = ORBIT_ITEMS.findIndex(
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
    const next = dragStartOffsetRef.current - dy / 65;
    targetOffsetRef.current = next;
    setOrbitOffset(next);
    setSelectedIndex(((Math.round(next) % 8) + 8) % 8);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const snapped = Math.round(orbitOffset);
    animateToOffset(snapped);
  };

  // ════════════════════════════════════════════════════════════════
  // ACCIONES DIRECTAS EN 1 CLIC (EJECUCIÓN INMEDIATA SIN RODEOS)
  // ════════════════════════════════════════════════════════════════

  // 1. Iniciar parquímetro de inmediato
  const handleStartParking = () => {
    startParking(selectedZone, 18.00, { lat: 19.4342, lng: -99.1318 });
    sileo.success({
      title: '¡Parquímetro Activo!',
      description: `Estancia iniciada en ${selectedZone}. Autocobro continuo segundo a segundo.`,
    });
  };

  // 2. Detener parquímetro y cobrar en 1 clic
  const handleStopParking = () => {
    const txn = stopParkingAndAutoCharge();
    if (txn) {
      sileo.success({
        title: '¡Estancia Finalizada y Cobrada!',
        description: `Folio: ${txn.folio} • Total: $${txn.amount.toFixed(2)} MXN (${txn.durationMinutes} min)`,
      });
    }
  };

  // 3. Recarga rápida express de saldo
  const handleInstantRecharge = (amount) => {
    if (addBalance) {
      addBalance(amount);
      sileo.success({
        title: '¡Recarga Express Acreditada!',
        description: `Se han añadido $${amount}.00 MXN a tu tarjeta Parqu.`,
      });
    }
  };

  // 4. Toggle de Autocobro (ON / OFF)
  const handleToggleAutoPay = () => {
    const newState = !autoPay?.enabled;
    updateAutoPay({ enabled: newState });
    sileo.info({
      title: newState ? 'Autocobro Activado' : 'Autocobro Pausado',
      description: newState
        ? 'El sistema debitará automáticamente el tiempo sin generar multas.'
        : 'Recuerda vigilar tu tiempo para evitar infracciones.',
    });
  };

  // 5. Ajustar límite de sesión de autocobro
  const handleSetAutoPayLimit = (limit) => {
    updateAutoPay({ maxLimitPerSession: limit });
    sileo.success({
      title: 'Límite Actualizado',
      description: `Nuevo tope por sesión: $${limit}.00 MXN.`,
    });
  };

  // 6. Fijar ubicación GPS actual en 1 toque
  const handlePinCurrentLocation = () => {
    const newPin = registerPinnedLocation({
      name: `Espacio Fijado #${Math.floor(1000 + Math.random() * 9000)}`,
      address: 'Av. Juárez y Eje Central (GPS Activo)',
      lat: 19.4342 + (Math.random() - 0.5) * 0.005,
      lng: -99.1318 + (Math.random() - 0.5) * 0.005,
      notes: 'Ubicación fijada con 1 toque desde el Centro de Control Orbital',
      ratePerHour: 18.00,
    });
    sileo.success({
      title: 'Ubicación Fijada en Mapa',
      description: `${newPin.name} guardado en tu bitácora de navegación.`,
    });
  };

  // 7. Alternar vehículo registrado en el padrón
  const handleToggleVehicle = () => {
    const isJetta = vehicle?.plates === 'XYZ-7842';
    updateVehicle({
      plates: isJetta ? 'ABC-4921' : 'XYZ-7842',
      brand: isJetta ? 'Audi' : 'Volkswagen',
      model: isJetta ? 'A4 S-Line' : 'Jetta Sportline',
      color: isJetta ? 'Negro Mito' : 'Plata Metálico',
    });
    sileo.info({
      title: 'Vehículo en Padrón Cambiado',
      description: isJetta
        ? 'Ahora activo: ABC-4921 • Audi A4 S-Line'
        : 'Ahora activo: XYZ-7842 • Volkswagen Jetta Sportline',
    });
  };

  // 8. Test de Ping / Telemetría en vivo
  const handleRunPingTest = () => {
    setIsTestingPing(true);
    sileo.info({
      title: 'Sondeando Sensores Municipales...',
      description: 'Verificando radar satelital y enlaces de parquímetros.',
    });
    setTimeout(() => {
      const latency = Math.floor(11 + Math.random() * 8);
      setPingLatency(latency);
      setIsTestingPing(false);
      sileo.success({
        title: `Red 100% Óptima (${latency}ms)`,
        description: 'Protocolo de encriptación SSS.Solutions y parquímetros sincronizados.',
      });
    }, 600);
  };

  // Elemento activo en el visor
  const currentItem = ORBIT_ITEMS[selectedIndex] || ORBIT_ITEMS[0];

  // Geometría del arco orbital de precisión
  const dialHeight = 440;
  const centerY = dialHeight / 2;
  const orbitRadius = 240;
  const labelRadius = 350;
  const angleStepRad = 0.42;

  return (
    <div
      className={`w-full rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden font-sans transition-all ${className}`}
    >
      {/* Resplandor ambiental ultra-translúcido que tiñe suavemente el cristal según la acción activa */}
      <div
        className="absolute -top-36 -right-36 w-[420px] h-[420px] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 opacity-25"
        style={{ backgroundColor: currentItem.color }}
      />
      <div
        className="absolute -bottom-36 -left-36 w-[380px] h-[380px] rounded-full blur-[90px] pointer-events-none transition-colors duration-1000 opacity-15"
        style={{ backgroundColor: currentItem.color }}
      />

      {/* ═══ 1. ENCABEZADO TRANSLÚCIDO Y CONMUTADOR DE VISTAS ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08] relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: currentItem.color }}
            />
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em] text-[#D4D6E6] uppercase">
              CONSOLA DE CONTROL DIRECTO • PARQU 2026
            </span>
            <span className="text-white/20 hidden xs:inline">•</span>
            <span className="text-[10px] text-white/60 font-mono hidden xs:inline">
              ACCESO INSTANTÁNEO A TODAS LAS ACCIONES
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#807DFE]" />
            <span>Centro de Acciones & Navegador Orbital</span>
          </h2>
          <p className="text-xs text-[#D4D6E6]/80 mt-0.5">
            Ejecuta recargas, inicia o detén el parquímetro, activa el autocobro o fija tu GPS directamente desde este menú.
          </p>
        </div>

        {/* Conmutador de Vistas Transparente */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('orbit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'orbit'
                  ? 'bg-[#0033FF] text-white shadow-[0_0_20px_rgba(0,51,255,0.5)]'
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
                  ? 'bg-[#0033FF] text-white shadow-[0_0_20px_rgba(0,51,255,0.5)]'
                  : 'text-[#D4D6E6]/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Ver Todos (8)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ 2. BARRA DE ACCIÓN RÁPIDA SUPERIOR (ACCESO DIRECTO EN 1 TOQUE) ═══ */}
      <div className="py-4 border-b border-white/[0.08] relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#D4D6E6]/70 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Acciones Rápidas:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Recarga $100 rápida */}
          <button
            type="button"
            onClick={() => handleInstantRecharge(100)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-white font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Añadir $100 MXN directo a la tarjeta"
          >
            <CurrencyDollarIcon size={14} className="text-amber-400" />
            <span>+$100 Express</span>
          </button>

          {/* Abrir Credencial QR */}
          <button
            type="button"
            onClick={onOpenQR}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-white flex items-center gap-1.5 transition cursor-pointer"
            title="Abrir credencial QR de inspección"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Credencial QR</span>
          </button>

          {/* Toggle Autocobro */}
          <button
            type="button"
            onClick={handleToggleAutoPay}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-mono ${
              autoPay?.enabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
            }`}
            title="Activar o pausar autocobro"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Autocobro: {autoPay?.enabled ? 'ACTIVO' : 'PAUSADO'}</span>
          </button>

          {/* Fijar GPS */}
          <button
            type="button"
            onClick={handlePinCurrentLocation}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-white flex items-center gap-1.5 transition cursor-pointer"
            title="Fijar mi espacio en el mapa"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>Fijar GPS</span>
          </button>

          {/* Parquímetro directo */}
          {activeSession ? (
            <button
              type="button"
              onClick={handleStopParking}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 transition cursor-pointer animate-pulse"
              title="Finalizar estancia y pagar"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Finalizar ({formatTimeFromSeconds(activeSession.secondsElapsed)})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartParking}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Iniciar estacionamiento en espacio activo"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar Estancia</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══ 3. VISTA ÓRBITA 3D CON CRISTAL LÍQUIDO TRANSLÚCIDO ═══ */}
      {viewMode === 'orbit' && (
        <div className="pt-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* LADO IZQUIERDO: SPOTLIGHT EJECUTABLE (TODAS LAS ACCIONES DISPONIBLES AQUÍ) */}
            <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden min-h-[410px] shadow-2xl">
              
              {/* Encabezado del módulo enfocado */}
              <div className="flex items-center justify-between gap-3 relative z-10 mb-3">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border"
                  style={{
                    backgroundColor: `${currentItem.color}10`,
                    borderColor: `${currentItem.color}35`,
                    color: currentItem.color,
                  }}
                >
                  {currentItem.category}
                </span>

                <div className="flex items-center gap-2 text-xs font-mono text-white/80">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentItem.color }} />
                  <span className="text-[11px] font-bold">EJECUCIÓN DIRECTA</span>
                </div>
              </div>

              {/* Título y descripción */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg"
                    style={{
                      backgroundColor: `${currentItem.color}15`,
                      borderColor: `${currentItem.color}40`,
                      color: currentItem.color,
                      boxShadow: `0 0 25px ${currentItem.glowColor}`,
                    }}
                  >
                    <currentItem.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {currentItem.label}
                    </h3>
                    <span className="text-[11px] font-mono text-[#D4D6E6]/70">
                      Módulo de Control • #{currentItem.id}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#D4D6E6] leading-relaxed">
                  {currentItem.description}
                </p>
              </div>

              {/* ═══════════════════════════════════════════════════════════════════
                  BLOQUE DE CONTROLES EJECUTABLES EN VIVO (SEGÚN EL MÓDULO ACTIVO)
                  ═══════════════════════════════════════════════════════════════════ */}
              <div className="relative z-10 mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                
                {/* 1. MÓDULO PARQUÍMETRO: Iniciar / Detener / Cronómetro */}
                {currentItem.id === 'dashboard' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-white/60 uppercase">Estado de la Estancia</div>
                        {activeSession ? (
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                              {formatTimeFromSeconds(activeSession.secondsElapsed)}
                            </span>
                            <span className="text-sm font-bold text-emerald-400 font-mono">
                              ${activeSession.currentCost.toFixed(2)} MXN
                            </span>
                          </div>
                        ) : (
                          <div className="text-base font-bold text-emerald-400 mt-0.5">
                            Espacio Libre • Listo para Ocupar
                          </div>
                        )}
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                        activeSession
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {activeSession ? 'EN PARQUÍMETRO' : 'DISPONIBLE'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
                      {activeSession ? (
                        <button
                          type="button"
                          onClick={handleStopParking}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] transition cursor-pointer"
                        >
                          <Square className="w-4 h-4 fill-current" />
                          <span>Liberar y Cobrar Estancia</span>
                        </button>
                      ) : (
                        <>
                          <select
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          >
                            <option value="Espacio #1042 • Centro Histórico">Espacio #1042 • Centro Histórico</option>
                            <option value="Zona Financiera • Espacio #204">Zona Financiera • Espacio #204</option>
                            <option value="Av. Reforma • Espacio #88">Av. Reforma • Espacio #88</option>
                          </select>
                          <button
                            type="button"
                            onClick={handleStartParking}
                            className="flex-1 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Ocupar Espacio</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. MÓDULO AUTOCOBRO: Toggle ON/OFF / Límites rápidos */}
                {currentItem.id === 'autopay' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-white/60 uppercase">Cuenta Registrada</div>
                        <div className="text-base font-bold text-white font-mono mt-0.5">
                          {autoPay?.bank || 'Santander Platinum Débito'}
                        </div>
                      </div>
                      
                      {/* Toggle interactivo */}
                      <button
                        type="button"
                        onClick={handleToggleAutoPay}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          autoPay?.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{autoPay?.enabled ? 'ACTIVO (CLIC PAUSAR)' : 'PAUSADO (CLIC ACTIVAR)'}</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-white/60 uppercase">Límite por sesión:</span>
                      <div className="flex items-center gap-1.5">
                        {[100, 180, 250, 300].map((lim) => (
                          <button
                            key={lim}
                            type="button"
                            onClick={() => handleSetAutoPayLimit(lim)}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition cursor-pointer ${
                              autoPay?.maxLimitPerSession === lim
                                ? 'bg-[#0033FF] text-white font-bold border border-[#807DFE]'
                                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            ${lim}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. MÓDULO RECARGA: Botones de 1 clic + saldo */}
                {currentItem.id === 'recharge' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-white/60 uppercase">Saldo Disponible</div>
                        <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">
                          ${Number(card?.balance ?? 0).toFixed(2)}{' '}
                          <span className="text-xs text-white/60 font-sans font-normal">MXN</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        MONEDERO OFICIAL
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/[0.08] flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/60 uppercase shrink-0">Recarga 1 Clic:</span>
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        {[50, 100, 200, 500].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => handleInstantRecharge(amt)}
                            className="py-1.5 px-2 rounded-xl bg-white/[0.05] hover:bg-amber-500/20 hover:text-amber-300 border border-white/10 text-xs font-mono font-bold text-white transition cursor-pointer text-center"
                          >
                            +${amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MÓDULO QR: Previsualización + Copiar */}
                {currentItem.id === 'qr-credential' && (
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-white/60 uppercase">Pase de Tránsito Encriptado</div>
                      <div className="text-base font-bold text-white font-mono">{formatPlate(vehicle?.plates)}</div>
                      <div className="text-[11px] text-white/60">Etiqueta: {card?.rfidTag || 'NFC-MX-09142-PK'}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(vehicle?.plates || 'XYZ-7842');
                          sileo.success({ title: 'Placas Copiadas', description: vehicle?.plates });
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition cursor-pointer"
                        title="Copiar placas"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={onOpenQR}
                        className="py-2 px-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Ver QR Completo</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. MÓDULO MAPA GPS: Fijar ubicación actual */}
                {currentItem.id === 'parking-map' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono text-white/60 uppercase">Bitácora de Coordenadas</div>
                      <div className="text-base font-bold text-white">{pinnedLocations.length} Ubicaciones Guardadas</div>
                      <div className="text-[11px] text-white/60">Radar satelital listo</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePinCurrentLocation}
                        className="py-2 px-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(251,146,60,0.4)]"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Fijar GPS Ahora</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. MÓDULO VEHÍCULO: Alternar vehículo en padrón */}
                {currentItem.id === 'vehicle' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono text-white/60 uppercase">Vehículo Registrado</div>
                      <div className="text-base font-bold text-white">{vehicle?.brand} {vehicle?.model}</div>
                      <div className="text-[11px] text-white/60">Placas: <strong className="text-white font-mono">{formatPlate(vehicle?.plates)}</strong></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleVehicle}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Alternar entre vehículos registrados"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Alternar Auto</span>
                    </button>
                  </div>
                )}

                {/* 7. MÓDULO HISTORIAL: Último recibo */}
                {currentItem.id === 'history' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono text-white/60 uppercase">Último Folio Fiscal</div>
                      <div className="text-base font-bold text-white font-mono">{transactions?.[0]?.folio || 'PQM-88A2'}</div>
                      <div className="text-[11px] text-white/60">{transactions?.length || 0} recibos auditados</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectTab('history')}
                      className="py-2 px-3.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <History className="w-4 h-4" />
                      <span>Ver Recibos</span>
                    </button>
                  </div>
                )}

                {/* 8. MÓDULO TELEMETRÍA: Sondeo de red */}
                {currentItem.id === 'telemetry' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono text-white/60 uppercase">Latencia Municipal</div>
                      <div className="text-base font-bold text-emerald-400 font-mono">{pingLatency}ms • Sincronizado</div>
                      <div className="text-[11px] text-white/60">Cifrado AES-256 SSS.Solutions</div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunPingTest}
                      disabled={isTestingPing}
                      className="py-2 px-3.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <Radio className={`w-4 h-4 ${isTestingPing ? 'animate-spin' : ''}`} />
                      <span>{isTestingPing ? 'Midiendo...' : 'Test de Red'}</span>
                    </button>
                  </div>
                )}

              </div>

              {/* Botón de Enlace a Vista Detallada */}
              <div className="relative z-10 pt-4 mt-3 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectTab(currentItem.actionTarget)}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer bg-white/[0.04] hover:bg-white/[0.08] border border-white/10"
                >
                  <span>Ver Pantalla Completa de {currentItem.shortLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>

            </div>

            {/* LADO DERECHO: RULETA ORBITAL 3D HOLOGRÁFICA Y CURVA */}
            <div className="lg:col-span-5 relative flex items-center justify-center select-none overflow-hidden h-[440px] rounded-3xl bg-white/[0.01] border border-white/[0.08] backdrop-blur-md">
              
              {/* Controles de Giro Arriba / Abajo */}
              <div className="absolute right-4 top-4 z-40 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition cursor-pointer shadow-md"
                  title="Elemento anterior"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition cursor-pointer shadow-md"
                  title="Elemento siguiente"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Indicador Láser en el Ápex Central */}
              <div
                className="absolute z-30 pointer-events-none flex items-center gap-2"
                style={{
                  left: '12px',
                  top: `${centerY}px`,
                  transform: 'translateY(-50%)',
                }}
              >
                <div
                  className="h-12 w-1.5 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: currentItem.color,
                    boxShadow: `0 0 20px ${currentItem.color}`,
                  }}
                />
                <span className="text-[9px] font-mono font-bold tracking-widest text-white/50 uppercase hidden sm:inline">
                  ÁPEX
                </span>
              </div>

              {/* Contenedor del dial orbital con arrastre y rueda */}
              <div
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-full relative cursor-grab active:cursor-grabbing touch-none"
              >
                {/* SVG del arco holográfico */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 380 440"
                  fill="none"
                >
                  {/* Arco general tenue */}
                  <circle
                    cx="330"
                    cy="220"
                    r={orbitRadius}
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                  />
                  {/* Arco de iluminación activa */}
                  <path
                    d="M 90 220 A 240 240 0 0 1 115 130"
                    stroke={currentItem.color}
                    strokeWidth="2.5"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M 90 220 A 240 240 0 0 0 115 310"
                    stroke={currentItem.color}
                    strokeWidth="2.5"
                    strokeOpacity="0.7"
                  />
                </svg>

                {/* Renderizado de los elementos calculados trigonométricamente */}
                {ORBIT_ITEMS.map((item, index) => {
                  const diff = shortestAngularDiff(index, orbitOffset, 8);
                  const absDiff = Math.abs(diff);

                  if (absDiff > 3.2) return null;

                  const angle = Math.PI - diff * angleStepRad;
                  const centerX = 330;

                  const iconX = centerX + orbitRadius * Math.cos(angle);
                  const iconY = centerY + orbitRadius * Math.sin(angle);

                  const labelX = centerX + labelRadius * Math.cos(angle);
                  const labelY = centerY + labelRadius * Math.sin(angle);

                  const opacity = Math.max(0, 1 - Math.pow(absDiff / 3.2, 1.6));
                  const scale = Math.max(0.72, 1 - absDiff * 0.09);
                  const isSelected = absDiff < 0.45;
                  const rotationDeg = -diff * 7;
                  const Icon = item.icon;

                  return (
                    <React.Fragment key={item.id}>
                      {/* Píldora de Etiqueta (Lado Interior) */}
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
                          className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 shadow-lg ${
                            isSelected
                              ? 'bg-white text-black font-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                              : 'bg-black/40 text-[#D4D6E6]/80 border-white/10 hover:border-white/30 hover:text-white backdrop-blur-md'
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs whitespace-nowrap tracking-tight font-sans">
                            {item.shortLabel}
                          </span>
                        </div>
                      </div>

                      {/* Tarjeta de Icono Circular (Pista Orbital) */}
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
                              ? 'border-2 shadow-2xl bg-white/[0.08] backdrop-blur-md'
                              : 'bg-white/[0.03] border-white/15 hover:border-white/40 backdrop-blur-sm'
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

              {/* Guía de Uso */}
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
                <span className="text-[10px] font-mono text-white/50 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08]">
                  Desliza o usa la rueda del mouse para rotar
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ═══ 4. VISTA CUADRÍCULA COMPLETA TRANSPARENTE ("VER TODOS") ═══ */}
      {viewMode === 'grid' && (
        <div className="pt-6 relative z-10 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group backdrop-blur-2xl ${
                    isSelected
                      ? 'bg-white/[0.08] border-white shadow-xl'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05]'
                  }`}
                  style={{
                    borderColor: isSelected ? item.color : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-md group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: `${item.color}15`,
                        borderColor: `${item.color}35`,
                        color: item.color,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${item.color}10`,
                        borderColor: `${item.color}30`,
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

                  <div className="pt-3 mt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-bold text-white">
                    <span className="text-[10px] text-white/50 font-mono">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform" style={{ color: item.color }}>
                      Ejecutar
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ 5. DOCK SELECTOR RÁPIDO INFERIOR (LOS 8 MÓDULOS EN 1 TOQUE) ═══ */}
      <div className="pt-6 mt-6 border-t border-white/[0.08] relative z-10">
        <div className="flex items-center justify-between gap-3 mb-2 px-1">
          <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest font-bold">
            SELECTOR RÁPIDO DE 1 TOQUE
          </span>
          <span className="text-[10px] text-white/40 hidden sm:inline">
            Haz clic en cualquier píldora para centrar la ruleta al instante
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {ORBIT_ITEMS.map((item, idx) => {
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
                className={`p-2 rounded-xl border transition-all text-left flex items-center gap-2 cursor-pointer backdrop-blur-md ${
                  isSelected
                    ? 'bg-white/10 border-white shadow-lg text-white'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] text-[#D4D6E6]/70 hover:text-white'
                }`}
                style={{
                  borderColor: isSelected ? item.color : undefined,
                  boxShadow: isSelected ? `0 0 15px ${item.glowColor}` : undefined,
                }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${item.color}20`,
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
