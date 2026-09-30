import React, { useState, useEffect, useCallback } from 'react';
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
  Sparkles,
  ChevronLeft,
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

// Cálculo de coordenadas en el arco semicircular (viewBox 0 0 700 380)
const CX = 350;
const CY = 310;
const RADIUS = 230;
const ANGLE_START = 170 * (Math.PI / 180);
const ANGLE_END = 10 * (Math.PI / 180);

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
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingLatency, setPingLatency] = useState(14);
  const [copied, setCopied] = useState(false);

  // Sincronizar índice cuando activeTab cambia externamente
  useEffect(() => {
    if (!activeTab) return;
    const foundIndex = ORBIT_ITEMS.findIndex(
      (item) => item.actionTarget === activeTab && item.id !== 'parking-map'
    );
    if (foundIndex !== -1 && foundIndex !== selectedIndex) {
      setSelectedIndex(foundIndex);
    }
  }, [activeTab]);

  const currentItem = ORBIT_ITEMS[selectedIndex] || ORBIT_ITEMS[0];
  const CurrentIcon = currentItem.icon;

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + ORBIT_ITEMS.length) % ORBIT_ITEMS.length);
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % ORBIT_ITEMS.length);
  }, []);

  // Acciones directas
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

  return (
    <div className={`w-full bg-transparent border-0 shadow-none font-sans relative overflow-hidden select-none ${className}`}>
      
      {/* Resplandor ambiental de fondo 100% transparente sin bordes ni cajas */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[340px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 opacity-25"
        style={{ backgroundColor: currentItem.color }}
      />

      {/* ═══ 1. BARRA SUPERIOR TOTALMENTE TRANSPARENTE Y SIN CONTORNOS ═══ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: currentItem.color }}
          />
          <h3 className="font-sans font-black text-lg text-white tracking-tight flex items-center gap-2">
            <span>Acciones Rápidas</span>
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                color: currentItem.color,
                backgroundColor: `${currentItem.color}15`,
              }}
            >
              SEMICÍRCULO 3D
            </span>
          </h3>
        </div>

        {/* Accesos rápidos superiores (Sin bordes, 100% transparentes) */}
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => handleInstantRecharge(100)}
            style={{ '--primary': '#F59E0B' }}
            className="fx-67 px-3 py-1.5 rounded-xl text-white font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span className="btn-label flex items-center gap-1.5">
              <CurrencyDollarIcon size={13} className="text-amber-400" />
              <span>+$100</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenQR}
            style={{ '--primary': '#38BDF8' }}
            className="fx-67 px-3 py-1.5 rounded-xl text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span className="btn-label flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-sky-400" />
              <span>QR</span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleAutoPay}
            style={{ '--primary': autoPay?.enabled ? '#10B981' : '#F43F5E' }}
            className="fx-67 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span className="btn-label flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span className={autoPay?.enabled ? 'text-emerald-400' : 'text-rose-400'}>
                {autoPay?.enabled ? 'Autocobro ON' : 'Autocobro OFF'}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={handlePinCurrentLocation}
            style={{ '--primary': '#FB923C' }}
            className="fx-67 px-3 py-1.5 rounded-xl text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span className="btn-label flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>Fijar GPS</span>
            </span>
          </button>
        </div>
      </div>

      {/* ═══ 2. EL ESCENARIO SEMICIRCULAR CENTRAL ═══ */}
      <div className="relative w-full max-w-4xl mx-auto h-[350px] sm:h-[390px] flex items-center justify-center my-2">
        
        {/* SVG del Semicírculo Flotante (Sin contornos de caja) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 700 380"
          fill="none"
        >
          {/* Arco guía semicircular con trazo sutil */}
          <path
            d="M 123.5 270 A 230 230 0 0 1 576.5 270"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />

          {/* Resplandor del semicírculo con el color de la opción activa */}
          <path
            d="M 123.5 270 A 230 230 0 0 1 576.5 270"
            stroke={currentItem.color}
            strokeWidth="2.5"
            strokeOpacity="0.4"
            style={{
              filter: `drop-shadow(0 0 10px ${currentItem.color})`,
            }}
          />
        </svg>

        {/* Botones de navegación laterales discretos (Anterior / Siguiente) */}
        <button
          type="button"
          onClick={handlePrev}
          style={{ '--primary': currentItem.color }}
          className="fx-67 absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer z-30"
          title="Opción anterior"
        >
          <span className="btn-label">
            <ChevronLeft className="w-5 h-5" />
          </span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          style={{ '--primary': currentItem.color }}
          className="fx-67 absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer z-30"
          title="Opción siguiente"
        >
          <span className="btn-label">
            <ChevronRight className="w-5 h-5" />
          </span>
        </button>

        {/* ═══ 8 OPCIONES DISTRIBUIDAS A LO LARGO DEL SEMICÍRCULO ═══ */}
        {ORBIT_ITEMS.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          const Icon = item.icon;

          // Cálculo del ángulo y posición en el arco
          const angle = ANGLE_START - (idx / 7) * (ANGLE_START - ANGLE_END);
          const x = CX + RADIUS * Math.cos(angle);
          const y = CY - RADIUS * Math.sin(angle);

          // Convertir a porcentajes del contenedor (700 x 380)
          const leftPct = (x / 700) * 100;
          const topPct = (y / 380) * 100;

          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="z-20"
            >
              <button
                type="button"
                onClick={() => setSelectedIndex(idx)}
                style={{
                  '--primary': item.color,
                }}
                className={`fx-67 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'w-13 h-13 sm:w-14 sm:h-14 is-active scale-110'
                    : 'w-10 h-10 sm:w-11 sm:h-11 opacity-65 hover:opacity-100 hover:scale-105'
                }`}
                title={item.label}
              >
                <span className="btn-label flex items-center justify-center">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      color: isSelected ? '#FFFFFF' : item.color,
                      backgroundColor: isSelected ? `${item.color}35` : `${item.color}15`,
                      boxShadow: isSelected ? `0 0 16px ${item.glowColor}` : undefined,
                    }}
                  >
                    <Icon className={isSelected ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
                  </div>
                </span>
              </button>
            </div>
          );
        })}

        {/* ═══ 3. CONTENIDO PRINCIPAL: APARECE DENTRO DEL SEMICÍRCULO ═══ */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 sm:pt-10 px-4 text-center pointer-events-none z-10">
          <div
            key={currentItem.id}
            className="pointer-events-auto flex flex-col items-center max-w-sm sm:max-w-md w-full animate-in fade-in zoom-in-95 duration-250"
          >
            
            {/* Categoría e índice flotante */}
            <div
              className="flex items-center gap-2 mb-2 font-mono text-[10px] sm:text-[11px] font-bold tracking-widest uppercase"
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

            {/* Icono central de gran tamaño con resplandor líquido */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2.5 transition-all duration-500"
              style={{
                backgroundColor: `${currentItem.color}18`,
                color: currentItem.color,
                boxShadow: `0 0 32px ${currentItem.glowColor}`,
              }}
            >
              <CurrentIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            {/* Título de la opción seleccionada */}
            <h4 className="font-sans font-black text-xl sm:text-2xl text-white tracking-tight drop-shadow-md mb-1.5">
              {currentItem.label}
            </h4>

            {/* Datos específicos dentro del semicírculo (Completamente transparentes) */}
            <div className="min-h-[46px] flex flex-col items-center justify-center text-xs font-mono text-[#D4D6E6]/80 mb-3 px-2">
              {/* 1. Parquímetro */}
              {currentItem.id === 'dashboard' && (
                activeSession ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {formatTimeFromSeconds(activeSession.secondsElapsed)}
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="text-emerald-400 font-bold">
                      ${activeSession.currentCost.toFixed(2)} MXN
                    </span>
                  </div>
                ) : (
                  <span className="text-emerald-400 font-sans font-semibold">
                    Listo para Estacionar • Tarifa $0.25/min
                  </span>
                )
              )}

              {/* 2. Recarga */}
              {currentItem.id === 'recharge' && (
                <div className="flex items-center gap-2">
                  <span>Saldo actual:</span>
                  <span className="text-amber-400 font-bold text-sm">
                    ${Number(card?.balance ?? 0).toFixed(2)} MXN
                  </span>
                </div>
              )}

              {/* 3. Autocobro */}
              {currentItem.id === 'autopay' && (
                <div className="flex items-center gap-2">
                  <span>{autoPay?.bank || 'Santander Platinum •••• 8821'}</span>
                  <span className="text-white/40">•</span>
                  <span className={autoPay?.enabled ? 'text-emerald-400' : 'text-rose-400'}>
                    {autoPay?.enabled ? 'Activo' : 'En Pausa'}
                  </span>
                </div>
              )}

              {/* 4. Pase QR */}
              {currentItem.id === 'qr-credential' && (
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold tracking-wider">{formatPlate(vehicle?.plates)}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-sky-400">Validado AES-256</span>
                </div>
              )}

              {/* 5. Mapa GPS */}
              {currentItem.id === 'parking-map' && (
                <span>
                  {pinnedLocations.length} espacio(s) guardado(s) en Centro Histórico
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
                <span className="text-emerald-400">
                  Latencia: {pingLatency}ms • Satélites Conectados al 100%
                </span>
              )}
            </div>

            {/* ═══ BOTONES DE ACCIÓN DENTRO DEL SEMICÍRCULO (100% TRANSPARENTES, SIN CONTORNOS) ═══ */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              
              {/* Acción Parquímetro */}
              {currentItem.id === 'dashboard' && (
                activeSession ? (
                  <button
                    type="button"
                    onClick={handleStopParking}
                    style={{ '--primary': '#F43F5E' }}
                    className="fx-67 px-4 py-2 rounded-xl text-rose-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="btn-label flex items-center gap-1.5">
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Finalizar Parquímetro</span>
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartParking}
                    style={{ '--primary': '#10B981' }}
                    className="fx-67 px-4 py-2 rounded-xl text-emerald-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="btn-label flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Iniciar Parquímetro</span>
                    </span>
                  </button>
                )
              )}

              {/* Acción Recarga: Presets rápidos */}
              {currentItem.id === 'recharge' && (
                <div className="flex items-center gap-1.5">
                  {[50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleInstantRecharge(amt)}
                      style={{ '--primary': '#F59E0B' }}
                      className="fx-67 px-2.5 py-1.5 rounded-lg text-amber-300 font-mono text-xs font-bold transition cursor-pointer"
                    >
                      <span className="btn-label">+${amt}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={onOpenRecharge}
                    style={{ '--primary': '#F59E0B' }}
                    className="fx-67 px-3 py-1.5 rounded-lg text-white font-sans text-xs font-bold transition cursor-pointer ml-1"
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
                  className="fx-67 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="btn-label flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
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
                    className="fx-67 px-3 py-2 rounded-xl text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="btn-label flex items-center gap-1.5">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado' : 'Copiar Placas'}</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenQR}
                    style={{ '--primary': '#38BDF8' }}
                    className="fx-67 px-4 py-2 rounded-xl text-sky-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span className="btn-label flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5" />
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
                  className="fx-67 px-4 py-2 rounded-xl text-orange-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="btn-label flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
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
                  className="fx-67 px-4 py-2 rounded-xl text-rose-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="btn-label flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
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
                  className="fx-67 px-4 py-2 rounded-xl text-pink-300 font-sans text-xs font-bold transition cursor-pointer"
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
                  className="fx-67 px-4 py-2 rounded-xl text-purple-300 font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <span className="btn-label flex items-center gap-1.5">
                    <Radio className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin' : ''}`} />
                    <span>{isTestingPing ? 'Midiendo Latencia...' : 'Ejecutar Test Ping'}</span>
                  </span>
                </button>
              )}

              {/* Enlace secundario para ir a la vista completa */}
              <button
                type="button"
                onClick={() => onSelectTab(currentItem.actionTarget)}
                style={{ '--primary': currentItem.color }}
                className="fx-67 px-3 py-2 rounded-xl text-xs font-sans text-white/70 hover:text-white flex items-center gap-1 transition cursor-pointer"
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

      </div>

      {/* ═══ 4. SELECTOR INFERIOR DE 8 OPCIONES (100% TRANSPARENTE, SIN CONTORNOS, SE LLENA BIEN AL 100%) ═══ */}
      <div className="pt-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
          {ORBIT_ITEMS.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
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
