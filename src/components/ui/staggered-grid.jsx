import React, { useRef, useState } from 'react';
import HeroText from './hero-shutter-text';
import CloudSky from './cloud-sky';
import { 
  CreditCard, 
  Zap, 
  Car, 
  History, 
  ShieldCheck, 
  QrCode, 
  Smartphone, 
  Sparkles, 
  MapPin, 
  Gauge, 
  Lock, 
  Receipt,
  Layers,
  ChevronRight,
  ChevronDown,
  Activity,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';

export function StaggeredGrid({
  centerText = "BIENVENIDOS A PARQU",
  onSelectFeature,
  className = "",
}) {
  const containerRef = useRef(null);
  const [activeBento, setActiveBento] = useState(0);

  const handleScrollToPanel = () => {
    const el = document.getElementById('panel-control-metropolitano');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToFeatures = () => {
    const el = document.getElementById('landing-features-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 12 Funciones Clave de la Plataforma Parqu
  const featuresList = [
    {
      id: 'card',
      title: 'Tarjeta Digital Inteligente',
      subtitle: 'PASE VIRTUAL ACTIVO',
      desc: 'Pase inteligente de parquímetro con saldo en tiempo real, contactless NFC y código QR para inspectores de tránsito.',
      icon: CreditCard,
      category: 'IDENTIDAD',
      badge: 'EN VIVO',
      tab: 'dashboard'
    },
    {
      id: 'autopay',
      title: 'Autocobro por Segundo',
      subtitle: 'DÉBITO AUTOMATIZADO',
      desc: 'Cobro segundo a segundo exacto ($0.25 MXN/min). Cero filas, cero monedas y sin multas por tiempo expirado.',
      icon: Zap,
      category: 'COBRO',
      badge: 'AUTOMÁTICO',
      tab: 'autopay'
    },
    {
      id: 'parking',
      title: 'Cajones en Tiempo Real',
      subtitle: 'PARQUÍMETRO METROPOLITANO',
      desc: 'Gestiona tu estancia en parquímetros municipales, activa cronómetros y calcula tu tarifa al instante.',
      icon: MapPin,
      category: 'MOVILIDAD',
      badge: 'EN VIVO',
      tab: 'dashboard'
    },
    {
      id: 'plates',
      title: 'Gestión Vehicular y Placas',
      subtitle: 'VINCULACIÓN OFICIAL',
      desc: 'Asocia las placas de tu vehículo y datos del titular con sincronización directa al padrón vial de tránsito.',
      icon: Car,
      category: 'VEHÍCULO',
      badge: 'REGISTRO',
      tab: 'vehicle'
    },
    {
      id: 'history',
      title: 'Historial y Recibos Fiscales',
      subtitle: 'COMPROBANTES CFDI',
      desc: 'Consulta tu bitácora detallada de transacciones, folios fiscales y descarga recibos oficiales al instante.',
      icon: History,
      category: 'FINANZAS',
      badge: 'AUDITABLE',
      tab: 'history'
    },
    {
      id: 'security',
      title: 'Encriptación Bancaria 256-Bit',
      subtitle: 'PROTECCIÓN TOTAL',
      desc: 'Cifrado de grado bancario AES-256 y validación segura desarrollada con infraestructura SSS.Solutions.',
      icon: Lock,
      category: 'SEGURIDAD',
      badge: 'PROTEGIDO',
      tab: 'autopay'
    },
    {
      id: 'qr',
      title: 'Inspección QR Instantánea',
      subtitle: 'CONTROL DE TRÁNSITO',
      desc: 'Los agentes municipales validan tu estancia en un segundo escaneando tu credencial digital autorizada.',
      icon: QrCode,
      category: 'INSPECCIÓN',
      badge: 'OFICIAL',
      tab: 'dashboard'
    },
    {
      id: 'nofines',
      title: 'Garantía Cero Multas',
      subtitle: 'COBERTURA ACTIVA',
      desc: 'Protección activa contra multas por descuido de tiempo mientras tu vehículo permanezca en el cajón.',
      icon: ShieldCheck,
      category: 'GARANTÍA',
      badge: 'GARANTIZADO',
      tab: 'autopay'
    },
    {
      id: 'realtime',
      title: 'Telemetría de Consumo',
      subtitle: 'MÉTRICAS POR MINUTO',
      desc: 'Monitoreo en vivo de saldo debitado, tiempo acumulado y proyecciones de costo de aparcamiento.',
      icon: Gauge,
      category: 'TELEMETRÍA',
      badge: 'MÉTRICAS',
      tab: 'dashboard'
    },
    {
      id: 'mobile',
      title: 'Experiencia Mobile First',
      subtitle: 'DISEÑO ADAPTATIVO',
      desc: 'Interfaz táctil reactiva optimizada para operar fluidamente desde cualquier smartphone, tableta o PC.',
      icon: Smartphone,
      category: 'EXPERIENCIA',
      badge: 'PWA READY',
      tab: 'dashboard'
    },
    {
      id: 'receipt',
      title: 'Tarifa Justa por Minuto',
      subtitle: 'CERO COMISIONES OCULTAS',
      desc: 'Paga con exactitud matemática el tiempo que utilizas el cajón, sin tarifas abusivas ni redondeos.',
      icon: Receipt,
      category: 'TRANSPARENCIA',
      badge: 'EXACTITUD',
      tab: 'history'
    },
    {
      id: 'innovation',
      title: 'Infraestructura SSS.Solutions',
      subtitle: 'TECNOLOGÍA METROPOLITANA',
      desc: 'Arquitectura de vanguardia que moderniza la movilidad urbana e integra parquímetros en ciudades inteligentes.',
      icon: Sparkles,
      category: 'INNOVACIÓN',
      badge: 'SMART CITY',
      tab: 'dashboard'
    }
  ];

  // Bento Items Principales
  const bentoList = [
    {
      id: 'bento-1',
      title: 'Autocobro Continuo',
      subtitle: '01. CERO FILAS • CERO MONEDAS',
      desc: 'El sistema debita de forma ininterrumpida el tiempo de estancia exacto en el parquímetro, protegiéndote automáticamente contra multas de tránsito.',
      icon: <Zap className="w-6 h-6 text-[#0033FF]" />,
      tag: 'CERO FILAS',
      actionTab: 'autopay'
    },
    {
      id: 'bento-2',
      title: 'Tarjeta Digital Oficial',
      subtitle: '02. PASE METROPOLITANO',
      desc: 'Tu credencial oficial con saldo protegido, sincronización instantánea y código QR para verificación directa de inspectores viales.',
      icon: <CreditCard className="w-6 h-6 text-[#807DFE]" />,
      tag: 'PASE DIGITAL',
      actionTab: 'dashboard'
    },
    {
      id: 'bento-3',
      title: 'Parquímetro en Tiempo Real',
      subtitle: '03. CONTROL DE CAJONES',
      desc: 'Ubica cajones disponibles en el mapa municipal, activa el cronómetro dinámico y monitorea el consumo segundo a segundo en vivo.',
      icon: <MapPin className="w-6 h-6 text-emerald-400" />,
      tag: 'PARQUÍMETRO',
      actionTab: 'dashboard'
    }
  ];

  return (
    <div ref={containerRef} className={`relative w-full overflow-hidden text-white ${className}`}>
      
      {/* ═══ 1. HERO SECTION CON ORIGINKIT CLOUD-SKY Y HERO SHUTTER TEXT ═══ */}
      <section className="relative z-10 min-h-[500px] sm:min-h-[560px] flex flex-col items-center justify-center text-center px-4 pt-12 pb-14 overflow-hidden">
        
        {/* Fondo Animado WebGL Cloud-Sky de OriginKit */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
          <CloudSky 
            background="#01033E"
            baseColor="#0033FF"
            accentColor="#D4D6E6"
            density={85}
            speed={45}
            size={125}
            clouds={{ softness: 85, shadow: 80, cirrus: 40 }}
            sun={{ x: 78, y: 90, glow: "rgba(128, 125, 254, 0.85)" }}
            pointer={{ parallax: 130, wind: 100, damping: 25 }}
            className="w-full h-full"
          />
          {/* Capas sutiles de sombreado y transición glassmorphism para contraste perfecto */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#01033E]/20 via-transparent to-[#01033E]/95 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#01033E] to-transparent pointer-events-none" />
        </div>

        {/* Badge Superior */}
        <div className="relative z-10 mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#01033E]/70 backdrop-blur-md border border-[#807DFE]/40 text-xs font-mono text-[#D4D6E6] shadow-[0_0_20px_rgba(0,51,255,0.25)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-[0.2em] uppercase font-bold text-[10px] sm:text-[11px]">SISTEMA INTELIGENTE DE PARQUÍMETROS</span>
          <span className="text-[#807DFE]">•</span>
          <span className="text-[10px] font-bold text-[#807DFE]">2026 OFFICIAL</span>
        </div>

        {/* Hero Text Shutter */}
        <div className="relative z-10 max-w-5xl mx-auto">
          <HeroText
            text={centerText}
            className="bg-transparent"
          />
        </div>

        {/* Subtítulo Hero */}
        <p className="relative z-10 mt-4 text-xs sm:text-sm md:text-base text-[#D4D6E6] font-mono max-w-2xl mx-auto leading-relaxed px-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          La plataforma metropolitana que elimina las filas, las monedas y las multas. Autocobro continuo segundo a segundo con tecnología de <strong className="text-white">SSS.Solutions</strong>.
        </p>

        {/* Botones de Acción Hero */}
        <div className="relative z-20 mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleScrollToPanel}
            className="group px-6 py-3 rounded-2xl bg-[#0033FF] hover:bg-[#2250ff] text-white border border-[#807DFE]/50 font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2.5 shadow-[0_0_30px_rgba(0,51,255,0.6)] cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <Activity className="w-4 h-4 text-white animate-pulse" />
            <span>Acceder al Panel de Control</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={handleScrollToFeatures}
            className="px-6 py-3 rounded-2xl bg-[#01033E]/70 hover:bg-white/10 text-[#D4D6E6] hover:text-white border border-white/15 font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-md cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <Layers className="w-4 h-4 text-[#807DFE]" />
            <span>Explorar Funciones</span>
          </button>
        </div>

        {/* Barra de Estadísticas Clave */}
        <div className="relative z-10 mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl w-full mx-auto px-4">
          <div className="p-3 rounded-2xl bg-[#01033E]/60 backdrop-blur-md border border-white/10 text-center">
            <div className="text-lg sm:text-xl font-black text-white font-mono">$0.25</div>
            <div className="text-[10px] text-[#D4D6E6] font-mono uppercase tracking-wider">MXN por Minuto</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#01033E]/60 backdrop-blur-md border border-white/10 text-center">
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">0 Multas</div>
            <div className="text-[10px] text-[#D4D6E6] font-mono uppercase tracking-wider">Garantía Activa</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#01033E]/60 backdrop-blur-md border border-white/10 text-center">
            <div className="text-lg sm:text-xl font-black text-[#807DFE] font-mono">AES-256</div>
            <div className="text-[10px] text-[#D4D6E6] font-mono uppercase tracking-wider">Cifrado Bancario</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#01033E]/60 backdrop-blur-md border border-white/10 text-center">
            <div className="text-lg sm:text-xl font-black text-[#0033FF] font-mono">100% Digital</div>
            <div className="text-[10px] text-[#D4D6E6] font-mono uppercase tracking-wider">Cero Monedas</div>
          </div>
        </div>

      </section>

      {/* ═══ 2. SECCIÓN BENTO EXPANDIBLE: PILARES DE LA PLATAFORMA ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#D4D6E6]">
            <Sparkles className="w-4 h-4 text-[#807DFE]" />
            <span className="font-bold text-white">Pilares de la Plataforma Metropolitana</span>
          </div>
          <span className="text-[11px] font-mono text-[#D4D6E6]/70">
            Pasa el cursor o haz clic en cualquier pilar para expandir
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-4 h-auto md:h-80 w-full">
          {bentoList.map((bento, index) => {
            const isActive = activeBento === index;
            return (
              <div
                key={bento.id}
                onClick={() => {
                  setActiveBento(index);
                  if (onSelectFeature && bento.actionTab) {
                    onSelectFeature(bento.actionTab);
                  }
                }}
                onMouseEnter={() => setActiveBento(index)}
                className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border flex flex-col justify-between backdrop-blur-xl ${
                  isActive
                    ? 'md:w-3/5 bg-gradient-to-br from-[#01033E]/90 via-[#0033FF]/20 to-[#01033E]/90 border-[#807DFE]/50 shadow-[0_0_40px_rgba(0,51,255,0.3)]'
                    : 'md:w-1/5 bg-[#01033E]/40 border-white/10 hover:border-white/20 hover:bg-[#01033E]/60'
                }`}
              >
                {/* Glow ambiental */}
                {isActive && (
                  <div className="absolute -top-12 -right-12 w-60 h-60 bg-[#0033FF]/25 rounded-full blur-3xl pointer-events-none" />
                )}

                {/* Encabezado del Pilar */}
                <div className="flex items-center justify-between w-full relative z-10">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#D4D6E6] uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                    {bento.tag}
                  </span>
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    {bento.icon}
                  </div>
                </div>

                {/* Contenido del Pilar */}
                <div className="relative z-10 space-y-2 mt-6">
                  <span className="text-[11px] font-mono text-[#807DFE] tracking-wider block font-bold">
                    {bento.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {bento.title}
                  </h3>
                  
                  {isActive && (
                    <p className="text-xs sm:text-sm text-[#D4D6E6] font-mono leading-relaxed pt-2 animate-in fade-in duration-300">
                      {bento.desc}
                    </p>
                  )}
                </div>

                {/* Botón de Acción en Activo */}
                {isActive && (
                  <div className="pt-6 relative z-10 flex items-center justify-between border-t border-white/10 text-xs font-mono text-white font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Módulo Disponible
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Abrir Módulo
                      <ChevronRight className="w-4 h-4 text-white" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ 3. SECCIÓN CUADRÍCULA DE TODAS LAS FUNCIONES DE PARQU ═══ */}
      <section 
        id="landing-features-grid"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#807DFE] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#807DFE]" />
              <span className="font-bold">Ecosistema Completo de Parqu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Todas las Funciones Metropolitanas
            </h2>
          </div>
          <span className="text-xs font-mono text-[#D4D6E6]/70">
            Haz clic en cualquier tarjeta para abrir directamente su módulo
          </span>
        </div>

        {/* Grid de 12 tarjetas con Glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {featuresList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id || idx}
                onClick={() => {
                  if (onSelectFeature && item.tab) {
                    onSelectFeature(item.tab);
                  }
                }}
                className="group relative overflow-hidden rounded-3xl p-5 bg-[#01033E]/40 backdrop-blur-xl border border-white/10 hover:border-[#807DFE]/40 hover:bg-[#01033E]/70 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,51,255,0.25)] transform hover:-translate-y-1"
              >
                {/* Resplandor superior en hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0033FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0033FF]/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Fila Superior: Icono y Categoría / Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4D6E6] group-hover:text-white group-hover:bg-[#0033FF] group-hover:border-[#807DFE]/50 transition-all duration-300 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#807DFE] font-bold">
                      {item.category}
                    </span>
                    {item.badge && (
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#D4D6E6] mt-1">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Fila Central: Título y Descripción */}
                <div className="relative z-10 space-y-1.5 mt-2">
                  <span className="text-[10px] font-mono text-[#D4D6E6]/60 uppercase tracking-wider block font-bold">
                    {item.subtitle}
                  </span>
                  <h4 className="text-base font-bold text-white tracking-tight group-hover:text-[#D4D6E6] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#D4D6E6]/80 font-mono leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Fila Inferior: Botón de Apertura */}
                <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#D4D6E6] group-hover:text-white transition-colors">
                  <span className="font-semibold flex items-center gap-1">
                    Abrir Función
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#807DFE] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

export default StaggeredGrid;
