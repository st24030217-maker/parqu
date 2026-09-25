import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Crosshair, 
  MapPin, 
  Navigation, 
  Car, 
  ShieldCheck, 
  CheckCircle2,
  RefreshCw,
  Compass,
  Sparkles
} from 'lucide-react';
import { CurrencyDollarIcon } from './icons/currency-dollar-icon';
import { formatCurrency } from '../utils/formatters';

// Coordenadas metropolitanas base por defecto (CDMX Paseo de la Reforma / Centro)
const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 };

export const DiDiParkingMap = ({
  selectedZone,
  onSelectZone,
  onStartSession,
  activeSession,
  className = '',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const zoneMarkersRef = useRef({});

  const [userLocation, setUserLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('locating'); // 'locating' | 'locked' | 'fallback'
  const [zonesWithCoords, setZonesWithCoords] = useState([]);
  const [isCentering, setIsCentering] = useState(false);

  // Mantener referencia al callback para evitar re-suscripciones innecesarias
  const onSelectZoneRef = useRef(onSelectZone);
  useEffect(() => {
    onSelectZoneRef.current = onSelectZone;
  }, [onSelectZone]);

  const selectedZoneIdRef = useRef(selectedZone?.id);
  useEffect(() => {
    selectedZoneIdRef.current = selectedZone?.id;
  }, [selectedZone?.id]);

  // Genera cajones en calles reales adyacentes a la ubicación detectada (tipo DiDi)
  const generateZonesAroundLocation = useCallback((center) => {
    return [
      {
        id: 'Z1',
        name: 'Zona Centro Histórico (Cajón #A-14)',
        shortName: 'Centro Histórico #A-14',
        cajon: '#A-14',
        ratePerHour: 18.00,
        ratePerMin: 0.30,
        lat: center.lat + 0.0016,
        lng: center.lng + 0.0014,
        distanceMeters: 140,
        walkMinutes: 2,
        spotsAvailable: 4,
        tag: 'MÁS CERCANO',
      },
      {
        id: 'Z2',
        name: 'Zona Financiera & Bancaria (Cajón #B-08)',
        shortName: 'Financiera & Bancaria #B-08',
        cajon: '#B-08',
        ratePerHour: 24.00,
        ratePerMin: 0.40,
        lat: center.lat + 0.0028,
        lng: center.lng - 0.0019,
        distanceMeters: 290,
        walkMinutes: 4,
        spotsAvailable: 2,
        tag: 'ALTA DEMANDA',
      },
      {
        id: 'Z3',
        name: 'Distrito Gastronómico & Gourmet (Cajón #C-21)',
        shortName: 'Gastronómico #C-21',
        cajon: '#C-21',
        ratePerHour: 20.00,
        ratePerMin: 0.33,
        lat: center.lat - 0.0019,
        lng: center.lng + 0.0026,
        distanceMeters: 220,
        walkMinutes: 3,
        spotsAvailable: 6,
        tag: 'ZONA VIAL SEGURA',
      },
      {
        id: 'Z4',
        name: 'Zona Hospitalaria & Médica (Cajón #H-02)',
        shortName: 'Hospitalaria #H-02',
        cajon: '#H-02',
        ratePerHour: 14.00,
        ratePerMin: 0.23,
        lat: center.lat - 0.0025,
        lng: center.lng - 0.0018,
        distanceMeters: 360,
        walkMinutes: 5,
        spotsAvailable: 5,
        tag: 'TARIFA ECONÓMICA',
      },
    ];
  }, []);

  // 1. Inicialización ÚNICA de Leaflet con estilo CartoDB Dark Matter (Luxury DiDi Dark Mode)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 16,
      maxZoom: 16,
      minZoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    // Capa base oscura nocturna (ESRI World Dark Gray - 100% libre y sin API key)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        attribution: 'Esri &copy; DeLorme, NAVTEQ',
      }
    ).addTo(map);

    // Capa de referencias urbanas y nombres de calles (ESRI World Dark Gray Reference)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        attribution: '',
      }
    ).addTo(map);

    // Controles de Zoom en esquina superior derecha
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    // Forzar recalculo de tamaño para evitar cuadros grises
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Detección GPS del Usuario al montar (estilo DiDi: solicita permisos y carga ubicación)
  useEffect(() => {
    const handleLocationFound = (coords, isRealGps) => {
      setUserLocation(coords);
      setGpsStatus(isRealGps ? 'locked' : 'fallback');

      const generated = generateZonesAroundLocation(coords);
      setZonesWithCoords(generated);

      if (onSelectZoneRef.current) {
        const currentId = selectedZoneIdRef.current;
        const matched = generated.find((z) => z.id === currentId) || generated[0];
        onSelectZoneRef.current(matched);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([coords.lat, coords.lng], 16, {
          duration: 1.2,
        });
        mapInstanceRef.current.invalidateSize();
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationFound(
            { lat: pos.coords.latitude, lng: pos.coords.longitude },
            true
          );
        },
        (err) => {
          console.warn('GPS no disponible o denegado, usando mapa metropolitano:', err.message);
          handleLocationFound(DEFAULT_CENTER, false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    } else {
      handleLocationFound(DEFAULT_CENTER, false);
    }
  }, [generateZonesAroundLocation]);

  // 3. Marcador del Usuario (Pulsing Beacon azul / cian tipo DiDi)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      // Icono HTML reactivo con radar pulsante
      const userBeaconIcon = L.divIcon({
        className: 'custom-user-beacon',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 -ml-5 -mt-5">
            <span class="absolute w-10 h-10 rounded-full bg-blue-500/30 animate-ping"></span>
            <span class="absolute w-7 h-7 rounded-full bg-blue-600/40"></span>
            <div class="relative w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,1)] flex items-center justify-center">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userBeaconIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(
          `<div class="text-xs font-mono text-center p-1 font-bold text-black">
            📍 Tu Ubicación Actual
            <div class="text-[10px] text-neutral-500 font-normal">Vehículo Registrado</div>
          </div>`
        );
    }
  }, [userLocation]);

  // 4. Marcadores de Cajones de Parquímetro (Pines interactivos tipo DiDi)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || zonesWithCoords.length === 0) return;

    // Limpiar marcadores previos
    Object.values(zoneMarkersRef.current).forEach((marker) => marker.remove());
    zoneMarkersRef.current = {};

    zonesWithCoords.forEach((zone) => {
      const isSelected = selectedZone?.id === zone.id;
      const isActive = activeSession && selectedZone?.id === zone.id;

      const pinIcon = L.divIcon({
        className: 'custom-didi-pin',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer transition-all duration-300 transform ${
            isSelected ? 'scale-110 -translate-y-2' : 'hover:scale-105'
          }">
            <!-- Badge de Precio / Disponibilidad flotante -->
            <div class="px-2.5 py-1 rounded-xl font-mono text-[10px] font-black border shadow-2xl flex items-center gap-1 whitespace-nowrap ${
              isActive
                ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse'
                : isSelected
                ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                : 'bg-neutral-900/90 text-white border-neutral-700 hover:border-neutral-500'
            }">
              <span>${zone.cajon}</span>
              <span class="opacity-60">•</span>
              <span class="${isSelected ? 'text-neutral-900 font-black' : 'text-emerald-400 font-bold'}">$${zone.ratePerHour}</span>
            </div>

            <!-- Flecha y Punto de anclaje -->
            <div class="w-3 h-3 rotate-45 -mt-1.5 border-r border-b ${
              isActive
                ? 'bg-amber-400 border-amber-300'
                : isSelected
                ? 'bg-white border-white'
                : 'bg-neutral-900 border-neutral-700'
            }"></div>

            <!-- Sombra de contacto -->
            <div class="w-4 h-1 rounded-full bg-black/60 blur-[1px] mt-0.5"></div>
          </div>
        `,
        iconSize: [80, 50],
        iconAnchor: [40, 48],
      });

      const marker = L.marker([zone.lat, zone.lng], {
        icon: pinIcon,
        zIndexOffset: isSelected ? 500 : 100,
      })
        .addTo(map)
        .on('click', () => {
          if (onSelectZone) onSelectZone(zone);
        });

      zoneMarkersRef.current[zone.id] = marker;
    });
  }, [zonesWithCoords, selectedZone, activeSession, onSelectZone]);

  // 5. Línea de Ruta Dotted tipo DiDi (conecta tu ubicación con el cajón seleccionado)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (userLocation && selectedZone && selectedZone.lat && selectedZone.lng) {
      const latlngs = [
        [userLocation.lat, userLocation.lng],
        [selectedZone.lat, selectedZone.lng],
      ];

      routeLineRef.current = L.polyline(latlngs, {
        color: '#60a5fa',
        weight: 3,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
    }
  }, [userLocation, selectedZone]);

  // Centrar el mapa en la ubicación del usuario (Botón DiDi)
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setIsCentering(true);

    const target = userLocation || DEFAULT_CENTER;
    map.flyTo([target.lat, target.lng], 16, {
      duration: 1.0,
      easeLinearity: 0.25,
    });

    setTimeout(() => setIsCentering(false), 1000);
  };

  const currentZone = selectedZone || zonesWithCoords[0] || {};

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl flex flex-col ${className}`}>
      
      {/* Barra Superior Flotante del Mapa (Estatus GPS y Telemetría tipo DiDi) */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-[400] flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-950/85 backdrop-blur-md border border-neutral-700/80 shadow-xl text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${
            gpsStatus === 'locked' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
          }`} />
          <span className="text-white font-bold text-[11px] uppercase tracking-wider">
            {gpsStatus === 'locked' ? 'GPS SATELITAL EN VIVO' : 'MAPA METROPOLITANO'}
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-300 text-[10px]">
            {zonesWithCoords.length} Cajones Detectados
          </span>
        </div>
      </div>

      {/* Botón Flotante DiDi: Centrar en Mi Ubicación */}
      <div className="absolute bottom-28 sm:bottom-24 right-3 z-[400] pointer-events-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={handleRecenter}
          title="Centrar en mi ubicación GPS"
          className="w-11 h-11 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 backdrop-blur-md flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Crosshair className={`w-5 h-5 text-blue-400 ${isCentering ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[320px] sm:h-[380px] md:h-[420px] z-0 bg-neutral-950" 
      />

      {/* Bottom Sheet DiDi: Detalle del Cajón Seleccionado y Acciones */}
      <div className="relative z-10 p-4 sm:p-5 bg-gradient-to-t from-neutral-950 via-neutral-950 to-neutral-900/95 border-t border-neutral-800/90 space-y-4">
        
        {/* Selector horizontal rápido de zonas tipo DiDi */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {zonesWithCoords.map((zone) => {
            const isSelected = currentZone?.id === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => {
                  if (onSelectZone) onSelectZone(zone);
                  const map = mapInstanceRef.current;
                  if (map && zone.lat && zone.lng) {
                    map.flyTo([zone.lat, zone.lng], 16, { duration: 0.8 });
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all duration-200 border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-[1.02]'
                    : 'bg-neutral-900/80 text-neutral-400 hover:text-white border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-blue-400'}`} />
                <span>{zone.cajon}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-black text-white' : 'bg-neutral-800 text-emerald-400'
                }`}>
                  ${zone.ratePerHour}/h
                </span>
              </button>
            );
          })}
        </div>

        {/* Tarjeta de Información Detallada del Cajón Activo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950/70 border border-blue-500/40 text-[10px] font-mono font-bold text-blue-300">
                {currentZone.tag || 'CAJÓN DISPONIBLE'}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {currentZone.spotsAvailable || 3} libres
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white tracking-tight font-mono">
              {currentZone.name || 'Zona Metropolitana'}
            </h3>

            <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1 text-neutral-300">
                <Navigation className="w-3.5 h-3.5 text-blue-400 rotate-45" />
                a {currentZone.distanceMeters || 150} metros ({currentZone.walkMinutes || 2} min a pie)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CurrencyDollarIcon size={12} className="text-emerald-400" />
                ${currentZone.ratePerHour || 18}.00 / hora
              </span>
            </div>
          </div>

          {/* Botón de Acción Principal Tipo DiDi */}
          {!activeSession && onStartSession && (
            <button
              type="button"
              onClick={onStartSession}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.35)] transition transform active:scale-95 shrink-0"
            >
              <Car className="w-4 h-4 text-black" />
              <span>Ocupar Cajón ({currentZone.cajon || '#A-14'})</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

export default DiDiParkingMap;
