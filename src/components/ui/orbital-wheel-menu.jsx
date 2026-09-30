import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParking } from '../../context/ParkingContext';
import { sileo } from 'sileo';
import {
  Play,
  Square,
  RefreshCw,
  Zap,
  QrCode,
  MapPin,
  Car,
  History,
  Activity,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Radio,
  Check,
} from 'lucide-react';
import { CurrencyDollarIcon } from '../icons/currency-dollar-icon';

function formatPlate(raw = '') {
  const clean = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length <= 3) return clean;
  return `${clean.slice(0, 3)}-${clean.slice(3, 7)}`;
}

function formatTimeFromSeconds(totalSecs = 0) {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const ORBIT_ITEMS = [
  {
    id: 'dashboard',
    label: 'Tarjeta & Parquímetro',
    shortLabel: 'Parquímetro',
    category: 'ESTANCIA',
    icon: Play,
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    actionTarget: 'dashboard',
  },
  {
    id: 'recharge',
    label: 'Recarga Inmediata',
    shortLabel: 'Recarga',
    category: 'MONEDERO',
    icon: CurrencyDollarIcon,
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    actionTarget: 'recharge',
  },
  {
    id: 'autopay',
    label: 'Autocobro Inteligente',
    shortLabel: 'Autocobro',
    category: 'DÉBITO VIAL',
    icon: Zap,
    color: '#6366F1',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    actionTarget: 'autopay',
  },
  {
    id: 'qr-credential',
    label: 'Credencial QR Oficial',
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

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [orbitOffset, setOrbitOffset] = useState(0);
  const targetOffsetRef = useRef(0);
  const animFrameRef = useRef(null);

  // Estados de arrastre y scroll
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const wheelTimeoutRef = useRef(null);

  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingLatency, setPingLatency] = useState(14);
  const [copied, setCopied] = useState(false);

  // Bucle de animación fluida tipo lerp con amortiguación
  const startAnimationLoop = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const step = () => {
      setOrbitOffset((current) => {
        const delta = targetOffsetRef.current - current;
        if (Math.abs(delta) < 0.005) {
          const nearest = Math.round(targetOffsetRef.current);
          const normalized = ((nearest % 8) + 8) % 8;
          setSelectedIndex(normalized);
          return targetOffsetRef.current;
        }
        animFrameRef.current = requestAnimationFrame(step);
        return current + delta * 0.2; // Amortiguación fluida
      });
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, []);

  // Rotar hacia un índice específico con el camino angular más corto
  const rotateToIndex = useCallback(
    (targetIdx) => {
      const currentNorm = ((Math.round(targetOffsetRef.current) % 8) + 8) % 8;
      let diff = targetIdx - currentNorm;
      if (diff > 4) diff -= 8;
      if (diff < -4) diff += 8;

      targetOffsetRef.current = Math.round(targetOffsetRef.current) + diff;
      setSelectedIndex(targetIdx);
      startAnimationLoop();
    },
    [startAnimationLoop]
  );

  // Sincronizar índice cuando activeTab cambia externamente
  useEffect(() => {
    if (!activeTab) return;
    const foundIndex = ORBIT_ITEMS.findIndex(
      (item) => item.actionTarget === activeTab && item.id !== 'parking-map'
    );
    if (foundIndex !== -1 && foundIndex !== selectedIndex) {
      rotateToIndex(foundIndex);
    }
  }, [activeTab]);

  // Manejo de SCROLL mediante rueda del ratón (Mouse Wheel / Trackpad)
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const stepDelta = e.deltaY > 0 ? 1 : -1;
      targetOffsetRef.current = targetOffsetRef.current + stepDelta;

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);

      // Al cesar el scroll, acoplar al elemento más cercano
      wheelTimeoutRef.current = setTimeout(() => {
        const nearest = Math.round(targetOffsetRef.current);
        targetOffsetRef.current = nearest;
        const normalized = ((nearest % 8) + 8) % 8;
        setSelectedIndex(normalized);
      }, 140);

      startAnimationLoop();
    },
    [startAnimationLoop]
  );

  // Manejo de Arrastre Vertical (Drag / Touch Swipe)
  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartOffsetRef.current = targetOffsetRef.current;
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const dy = e.clientY - dragStartYRef.current;
      const stepSize = 65; // Píxeles por paso vertical
      targetOffsetRef.current = dragStartOffsetRef.current - dy / stepSize;
      startAnimationLoop();
    },
    [isDragging, startAnimationLoop]
  );

  const handlePointerUp = useCallback(
    (e) => {
      if (!isDragging) return;
      setIsDragging(false);
      const nearest = Math.round(targetOffsetRef.current);
      targetOffsetRef.current = nearest;
      const normalized = ((nearest % 8) + 8) % 8;
      setSelectedIndex(normalized);
      startAnimationLoop();
    },
    [isDragging, startAnimationLoop]
  );

  const handlePrev = useCallback(() => {
    targetOffsetRef.current = Math.round(targetOffsetRef.current) - 1;
    startAnimationLoop();
  }, [startAnimationLoop]);

  const handleNext = useCallback(() => {
    targetOffsetRef.current = Math.round(targetOffsetRef.current) + 1;
    startAnimationLoop();
  }, [startAnimationLoop]);

  const currentItem = ORBIT_ITEMS[selectedIndex] || ORBIT_ITEMS[0];
  const CurrentIcon = currentItem.icon;

  // Acciones operativas
  const handleStartParking = useCallback(() => {
    startParking('Centro Histórico • Espacio #1042', 0.25);
    sileo.success({
      title: 'Parquímetro Activado',
      description: 'Estancia iniciada. Tarifa regulada $0.25 MXN/min.',
    });
  }, [startParking]);

  const handleStopParking = useCallback(() => {
    const receipt = stopParkingAndAutoCharge();
    sileo.success({
      title: 'Parquímetro Finalizado',
      description: receipt
        ? `Cobro de $${receipt.totalAmount.toFixed(2)} MXN registrado.`
        : 'Estancia finalizada con éxito.',
    });
  }, [stopParkingAndAutoCharge]);

  const handleInstantRecharge = useCallback(
    (amount) => {
      addBalance(amount);
      sileo.success({
        title: 'Recarga Inmediata Exitosa',
        description: `Se han añadido $${amount}.00 MXN a tu tarjeta Parqu.`,
      });
    },
    [addBalance]
  );

  const handleToggleAutoPay = useCallback(() => {
    const nextState = !autoPay?.enabled;
    updateAutoPay({ enabled: nextState });
    if (nextState) {
      sileo.success({
        title: 'Autocobro Activado',
        description: 'Débito automático regulado por segundo activo.',
      });
    } else {
      sileo.info({
        title: 'Autocobro Pausado',
        description: 'Recuerda finalizar tus estancias manualmente.',
      });
    }
  }, [autoPay, updateAutoPay]);

  const handlePinCurrentLocation = useCallback(() => {
    const loc = registerPinnedLocation({
      latitude: 19.4326,
      longitude: -99.1332,
      label: 'Mi Vehículo Estacionado',
      address: 'Av. Juárez #42, Centro Histórico',
    });
    sileo.success({
      title: 'Ubicación Satelital Fijada',
      description: loc.address,
    });
  }, [registerPinnedLocation]);

  const handleToggleVehicle = useCallback(() => {
    const isJetta = vehicle?.plates === 'XYZ-7842';
    const next = isJetta
      ? { plates: 'ABC-1234', brand: 'Mazda', model: '3 Sedán', color: 'Rojo Carmesí' }
      : { plates: 'XYZ-7842', brand: 'Volkswagen', model: 'Jetta Sport', color: 'Gris Platino' };

    updateVehicle(next);
    sileo.info({
      title: 'Vehículo Alternado',
      description: `Activo: ${next.plates} • ${next.brand} ${next.model}`,
    });
  }, [vehicle, updateVehicle]);

  const handleRunPingTest = useCallback(() => {
    setIsTestingPing(true);
    setTimeout(() => {
      const lat = Math.floor(Math.random() * 8) + 11;
      setPingLatency(lat);
      setIsTestingPing(false);
      sileo.success({
        title: 'Telemetría Óptima',
        description: `Enlace de red activo: ${lat}ms de latencia satelital.`,
      });
    }, 600);
  }, []);

  const handleCopyPlates = useCallback(() => {
    const plates = vehicle?.plates || 'XYZ-7842';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(plates);
      setCopied(true);
      sileo.success({ title: 'Placas Copiadas', description: plates });
      setTimeout(() => setCopied(false), 2000);
    }
  }, [vehicle]);

  // Geometría del Semicírculo Vertical
  const dialHeight = 420;
  const centerY = dialHeight / 2; // 210
  const orbitRadius = 190;
  const centerX = 260;
  const angleStepRad = 0.44;

  return (
    <div className={`w-full bg-transparent border-0 shadow-none font-sans relative select-none ${className}`}>
      
      {/* Resplandor suave de fondo 100% transparente sin bordes */}
      <div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] rounded-full blur-[130px] pointer-events-none transition-colors duration-700 opacity-25"
        style={{ backgroundColor: currentItem.color }}
      />

      {/* ═══ 1. TÍTULO LIMPIO: SOLO ACCIONES RÁPIDAS ═══ */}
      <div className="flex items-center gap-2 pb-2">
        <span
          className="w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: currentItem.color }}
        />
        <h3 className="font-sans font-black text-xl text-white tracking-tight">
          Acciones Rápidas
        </h3>
      </div>

      {/* ═══ 2. ESCENARIO VERTICAL: CONTENIDO DENTRO DEL SEMICÍRCULO + RULETA SCROLLABLE ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[420px] relative py-2">
        
        {/* ═══ PANEL IZQUIERDO: APARECE DENTRO DEL SEMICÍRCULO (100% TRANSPARENTE, SIN CONTORNOS) ═══ */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center lg:items-start text-center lg:text-left px-2 sm:px-6 z-20">
          <div
            key={currentItem.id}
            className="flex flex-col items-center lg:items-start max-w-lg w-full animate-in fade-in zoom-in-95 duration-250"
          >
            
            {/* Categoría y conteo */}
            <div
              className="flex items-center gap-2 mb-2 font-mono text-[11px] font-bold tracking-widest uppercase"
              style={{ color: currentItem.color }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: currentItem.color }}
              />
              <span>{currentItem.category}</span>
              <span className="text-white/30">•</span>
              <span className="text-white/60">0{selectedIndex + 1} / 08</span>
            </div>

            {/* Icono central de gran tamaño con aura flotante */}
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500"
              style={{
                backgroundColor: `${currentItem.color}15`,
                color: currentItem.color,
                boxShadow: `0 0 35px ${currentItem.glowColor}`,
              }}
            >
              <CurrentIcon className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
            </div>

            {/* Título de la opción seleccionada */}
            <h4 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight drop-shadow-md mb-2">
              {currentItem.label}
            </h4>

            {/* Datos específicos dentro del semicírculo */}
            <div className="min-h-[42px] flex items-center text-xs sm:text-sm font-mono text-[#D4D6E6]/80 mb-4">
              {/* 1. Parquímetro */}
              {currentItem.id === 'dashboard' && (
                activeSession ? (
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-amber-300 text-base">
                      {formatTimeFromSeconds(activeSession.secondsElapsed)}
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="text-emerald-400 font-bold">
                      ${activeSession.currentCost.toFixed(2)} MXN
                    </span>
                  </div>
                ) : (
                  <span className="text-emerald-400 font-sans font-semibold">
                    Listo para Estacionar • Tarifa regulada $0.25/min
                  </span>
                )
              )}

              {/* 2. Recarga */}
              {currentItem.id === 'recharge' && (
                <div className="flex items-center gap-2">
                  <span>Saldo disponible en tarjeta:</span>
                  <span className="text-amber-400 font-black text-base">
                    ${Number(card?.balance ?? 0).toFixed(2)} MXN
                  </span>
                </div>
              )}

              {/* 3. Autocobro */}
              {currentItem.id === 'autopay' && (
                <div className="flex items-center gap-2">
                  <span>{autoPay?.bank || 'Santander Platinum •••• 8821'}</span>
                  <span className="text-white/40">•</span>
                  <span className={autoPay?.enabled ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {autoPay?.enabled ? 'Autocobro Activo' : 'Autocobro Pausado'}
                  </span>
                </div>
              )}

              {/* 4. Pase QR */}
              {currentItem.id === 'qr-credential' && (
                <div className="flex items-center gap-2.5">
                  <span className="text-white font-bold tracking-wider">{formatPlate(vehicle?.plates)}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-sky-400 font-semibold">Validado Oficial AES-256</span>
                </div>
              )}

              {/* 5. Mapa GPS */}
              {currentItem.id === 'parking-map' && (
                <span>
                  {pinnedLocations.length} espacio(s) guardado(s) • Centro Histórico
                </span>
              )}

              {/* 6. Vehículo */}
              {currentItem.id === 'vehicle' && (
                <span>
                  {vehicle?.brand || 'Volkswagen'} {vehicle?.model || 'Jetta'} ({formatPlate(vehicle?.plates)})
                </span>
              )}

              {/* 7. Historial */}
              {currentItem.id === 'history' && (
                <span>
                  {transactions?.length || 0} recibos auditados • Folio: {transactions?.[0]?.folio || 'PQM-88A2'}
                </span>
              )}

              {/* 8. Telemetría */}
              {currentItem.id === 'telemetry' && (
                <span className="text-emerald-400 font-semibold">
                  Latencia de enlace: {pingLatency}ms • Satélites Conectados
                </span>
              )}
            </div>

            {/* ═══ BOTONES DE ACCIÓN DENTRO DEL SEMICÍRCULO (SIN CONTORNOS, LLENADO 100%) ═══ */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              
              {/* Acción Parquímetro */}
              {currentItem.id === 'dashboard' && (
                activeSession ? (
                  <button
                    type="button"
                    onClick={handleStopParking}
                    style={{ '--primary': '#F43F5E' }}
                    className="fx-67 px-4 py-2.5 rounded-xl text-rose-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="btn-label flex items-center gap-1.5">
                      <Square className="w-4 h-4 fill-current" />
                      <span>Finalizar Parquímetro</span>
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartParking}
                    style={{ '--primary': '#10B981' }}
                    className="fx-67 px-4 py-2.5 rounded-xl text-emerald-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="btn-label flex items-center gap-1.5">
                      <Play className="w-4 h-4 fill-current" />
                      <span>Iniciar Parquímetro</span>
                    </span>
                  </button>
                )
              )}

              {/* Acción Recarga */}
              {currentItem.id === 'recharge' && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {[50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleInstantRecharge(amt)}
                      style={{ '--primary': '#F59E0B' }}
                      className="fx-67 px-3 py-1.5 rounded-lg text-amber-300 font-mono text-xs font-bold transition cursor-pointer"
                    >
                      <span className="btn-label">+${amt}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={onOpenRecharge}
                    style={{ '--primary': '#F59E0B' }}
                    className="fx-67 px-3.5 py-1.5 rounded-lg text-white font-sans text-xs font-bold transition cursor-pointer ml-1"
                  >
                    <span className="btn-label">Otro Monto</span>
                  </button>
                </div>
              )}

              {/* Acción Autocobro */}
              {currentItem.id === 'autopay' && (
                <button
                  type="button"
                  onClick={handleToggleAutoPay}
                  style={{ '--primary': autoPay?.enabled ? '#F43F5E' : '#10B981' }}
                  className="fx-67 px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="btn-label flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span className={autoPay?.enabled ? 'text-rose-300' : 'text-emerald-300'}>
                      {autoPay?.enabled ? 'Pausar Autocobro' : 'Activar Autocobro'}
                    </span>
                  </span>
                </button>
              )}

              {/* Acción Pase QR */}
              {currentItem.id === 'qr-credential' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPlates}
                    style={{ '--primary': '#807DFE' }}
                    className="fx-67 px-3.5 py-2.5 rounded-xl text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="btn-label flex items-center gap-1.5">
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copiado' : 'Copiar Placas'}</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenQR}
                    style={{ '--primary': '#38BDF8' }}
                    className="fx-67 px-4 py-2.5 rounded-xl text-sky-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="btn-label flex items-center gap-1.5">
                      <QrCode className="w-4 h-4" />
                      <span>Abrir Pase QR</span>
                    </span>
                  </button>
                </div>
              )}

              {/* Acción Mapa GPS */}
              {currentItem.id === 'parking-map' && (
                <button
                  type="button"
                  onClick={handlePinCurrentLocation}
                  style={{ '--primary': '#FB923C' }}
                  className="fx-67 px-4 py-2.5 rounded-xl text-orange-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="btn-label flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>Fijar Aquí mi Lugar</span>
                  </span>
                </button>
              )}

              {/* Acción Vehículo */}
              {currentItem.id === 'vehicle' && (
                <button
                  type="button"
                  onClick={handleToggleVehicle}
                  style={{ '--primary': '#F43F5E' }}
                  className="fx-67 px-4 py-2.5 rounded-xl text-rose-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="btn-label flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4" />
                    <span>Alternar Vehículo</span>
                  </span>
                </button>
              )}

              {/* Acción Historial */}
              {currentItem.id === 'history' && (
                <button
                  type="button"
                  onClick={() => onSelectTab('history')}
                  style={{ '--primary': '#EC4899' }}
                  className="fx-67 px-4 py-2.5 rounded-xl text-pink-300 font-sans text-xs font-bold transition cursor-pointer"
                >
                  <span className="btn-label">Ver Historial Completo</span>
                </button>
              )}

              {/* Acción Telemetría */}
              {currentItem.id === 'telemetry' && (
                <button
                  type="button"
                  onClick={handleRunPingTest}
                  disabled={isTestingPing}
                  style={{ '--primary': '#A78BFA' }}
                  className="fx-67 px-4 py-2.5 rounded-xl text-purple-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <span className="btn-label flex items-center gap-1.5">
                    <Radio className={`w-4 h-4 ${isTestingPing ? 'animate-spin' : ''}`} />
                    <span>{isTestingPing ? 'Midiendo Latencia...' : 'Ejecutar Test Ping'}</span>
                  </span>
                </button>
              )}

              {/* Enlace al módulo completo */}
              <button
                type="button"
                onClick={() => onSelectTab(currentItem.actionTarget)}
                style={{ '--primary': currentItem.color }}
                className="fx-67 px-3.5 py-2.5 rounded-xl text-xs font-sans text-white/70 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                title="Abrir módulo completo"
              >
                <span className="btn-label flex items-center gap-1">
                  <span>Ir al Módulo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>

            </div>

          </div>
        </div>

        {/* ═══ PANEL DERECHO: RULETA EN SEMICÍRCULO VERTICAL CON SCROLL & DRAG ═══ */}
        <div
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="lg:col-span-5 h-[390px] sm:h-[430px] relative flex items-center justify-center cursor-grab active:cursor-grabbing touch-none overflow-hidden"
          title="Gira la rueda del ratón o arrastra para rotar el semicírculo vertical"
        >
          
          {/* Botones de navegación vertical sutiles */}
          <div className="absolute right-2 top-2 z-40 flex flex-col gap-1">
            <button
              type="button"
              onClick={handlePrev}
              style={{ '--primary': currentItem.color }}
              className="fx-67 w-7 h-7 rounded-full text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Anterior"
            >
              <span className="btn-label">
                <ChevronUp className="w-4 h-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{ '--primary': currentItem.color }}
              className="fx-67 w-7 h-7 rounded-full text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Siguiente"
            >
              <span className="btn-label">
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>
          </div>



          {/* SVG del Semicírculo Vertical (Arco Flotante, Sin Contornos) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 340 420"
            fill="none"
          >
            {/* Arco guía vertical sutil */}
            <path
              d="M 194 40 A 180 180 0 0 0 194 380"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="4 8"
            />

            {/* Resplandor del semicírculo con el color de la opción activa */}
            <path
              d="M 194 40 A 180 180 0 0 0 194 380"
              stroke={currentItem.color}
              strokeWidth="2.5"
              strokeOpacity="0.45"
              style={{
                filter: `drop-shadow(0 0 12px ${currentItem.color})`,
              }}
            />
          </svg>

          {/* Elementos orbitando a lo largo del semicírculo vertical */}
          <div className="w-full h-full relative pointer-events-none">
            {ORBIT_ITEMS.map((item, index) => {
              const diff = shortestAngularDiff(index, orbitOffset, 8);
              const absDiff = Math.abs(diff);

              if (absDiff > 2.8) return null;

              const angle = Math.PI - diff * angleStepRad;
              const iconX = centerX + orbitRadius * Math.cos(angle);
              const iconY = centerY + orbitRadius * Math.sin(angle);

              const opacity = Math.max(0, 1 - Math.pow(absDiff / 2.8, 1.6));
              const scale = Math.max(0.75, 1 - absDiff * 0.08);
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
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    opacity,
                    zIndex: isSelected ? 30 : 20 - Math.round(absDiff * 2),
                  }}
                  className="pointer-events-auto flex items-center gap-2 cursor-pointer transition-transform duration-150 group"
                >
                  {/* Icono del nodo vertical */}
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: isSelected ? `${item.color}35` : `${item.color}15`,
                      color: isSelected ? '#FFFFFF' : item.color,
                      boxShadow: isSelected ? `0 0 20px ${item.glowColor}` : undefined,
                    }}
                  >
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>

                  {/* Etiqueta limpia del nodo activo */}
                  {isSelected && (
                    <div
                      className="px-3 py-1 rounded-full text-xs font-sans font-bold whitespace-nowrap shadow-lg text-white"
                      style={{
                        backgroundColor: `${item.color}35`,
                      }}
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

      {/* ═══ 3. SELECTOR INFERIOR DE 8 OPCIONES (100% TRANSPARENTE, SIN CONTORNOS, SE LLENA AL 100%) ═══ */}
      <div className="pt-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
          {ORBIT_ITEMS.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => rotateToIndex(idx)}
                style={{
                  '--primary': item.color,
                }}
                className={`fx-67 py-2 px-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected ? 'is-active text-white' : 'text-[#D4D6E6]/70 hover:text-white'
                }`}
              >
                <span className="btn-label flex items-center gap-1.5 w-full">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{
                      color: item.color,
                      backgroundColor: `${item.color}20`,
                    }}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="font-sans text-[11px] font-bold truncate">
                    {item.shortLabel}
                  </span>
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
