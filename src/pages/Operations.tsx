import { useState, useEffect } from 'react';
import {
  Radio, UserCheck, Users, DollarSign, AlertTriangle,
  MessageSquare, Eye, CheckCircle2, XCircle, Clock,
  TrendingUp, Zap, Brain, Apple, Activity, Heart,
  Dumbbell, Bell, RefreshCw, ChevronRight, Shield, User, X
} from 'lucide-react';

/* ══════════════════════════════════════
   TIPOS
══════════════════════════════════════ */
interface TrainerStatus {
  id: number;
  name: string;
  initials: string;
  color: string;
  status: 'session' | 'available' | 'break';
  currentClient?: string;
  sessionTimer?: number;   // segundos desde inicio
  aiAssistant?: string;
  sessionsToday: number;
  sessionsTotal: number;
  nextClient?: string;
  nextTime?: string;
  rating: number;
}

interface FeedEvent {
  id: number;
  time: string;
  type: 'checkin' | 'checkout' | 'session' | 'payment' | 'alert' | 'ai';
  text: string;
  detail?: string;
  urgent?: boolean;
}

/* ══════════════════════════════════════
   DATOS
══════════════════════════════════════ */
const trainers: TrainerStatus[] = [
  {
    id: 1, name: 'Coach Alex', initials: 'CA', color: '#FF6B35',
    status: 'session', currentClient: 'Alex Guerrero', sessionTimer: 2732,
    aiAssistant: 'RecoveryBot', sessionsToday: 4, sessionsTotal: 5,
    nextClient: 'Diego F.', nextTime: '16:00', rating: 4.9,
  },
  {
    id: 2, name: 'Coach María', initials: 'CM', color: '#00FF88',
    status: 'available',
    sessionsToday: 3, sessionsTotal: 5,
    nextClient: 'María López', nextTime: '17:00', rating: 4.8,
  },
  {
    id: 3, name: 'Coach Diego', initials: 'CD', color: '#A78BFA',
    status: 'session', currentClient: 'Sofía Castillo', sessionTimer: 1124,
    aiAssistant: 'NutriBot', sessionsToday: 2, sessionsTotal: 4,
    nextClient: 'Carlos R.', nextTime: '18:30', rating: 4.7,
  },
  {
    id: 4, name: 'Coach Lucía', initials: 'CL', color: '#00E676',
    status: 'break',
    sessionsToday: 3, sessionsTotal: 4,
    nextClient: 'Valentina T.', nextTime: '17:30', rating: 4.8,
  },
];

const initialFeed: FeedEvent[] = [
  { id: 1,  time: '14:42', type: 'session',  text: 'Coach Alex inició sesión HYROX con Alex Guerrero', detail: 'AI RecoveryBot activado' },
  { id: 2,  time: '14:38', type: 'payment',  text: 'Pago registrado: Andrés Mejía — Plan Pro $75', detail: 'Método: Nequi', },
  { id: 3,  time: '14:35', type: 'checkin',  text: 'Entrada registrada: Sofía Castillo', detail: 'Casillero C-10' },
  { id: 4,  time: '14:32', type: 'session',  text: 'Coach Diego inició sesión con Sofía Castillo', detail: 'AI NutriBot activado' },
  { id: 5,  time: '14:28', type: 'alert',    text: 'Membresía próxima a vencer: María López', detail: 'Vence en 2 días', urgent: true },
  { id: 6,  time: '14:22', type: 'checkin',  text: 'Entrada registrada: Diego Fernández', detail: 'Casillero B-11' },
  { id: 7,  time: '14:18', type: 'ai',       text: 'FitBot 2.0 generó plan de nutrición para Carlos Rivas', detail: 'Protocolo HYROX Endurance' },
  { id: 8,  time: '14:10', type: 'checkout', text: 'Salida registrada: Pedro Gómez', detail: 'Tiempo en gym: 1h 15min' },
  { id: 9,  time: '14:05', type: 'payment',  text: 'Pago registrado: Carlos Rivas — Plan Básico $40', detail: 'Método: Efectivo' },
  { id: 10, time: '14:00', type: 'checkin',  text: 'Entrada masiva — apertura de gym', detail: '12 accesos en 10 min' },
];

const newFeedEvents: FeedEvent[] = [
  { id: 101, time: '', type: 'checkin',  text: 'Nueva entrada: Rodrigo Silva', detail: 'Casillero A-15' },
  { id: 102, time: '', type: 'session',  text: 'Coach María terminó sesión con Andrés Mejía', detail: 'Duración: 58 min · Rating: ⭐⭐⭐⭐⭐' },
  { id: 103, time: '', type: 'ai',       text: 'BiometriX detectó plateau en Valentina Torres', detail: 'Recomendación enviada al entrenador' },
  { id: 104, time: '', type: 'alert',    text: 'ALERTA: Carlos Rivas — membresía vencida', detail: '8 días sin renovar', urgent: true },
  { id: 105, time: '', type: 'payment',  text: 'Pago automático procesado: Valentina Torres $120', detail: 'Stripe · HYROX Pro' },
];

const gymAlerts = [
  { id: 1, text: 'Membresía vencida en gym: Carlos Rivas', action: 'Notificar Recepción', urgent: true, completed: false },
  { id: 2, text: 'María López vence en 2 días', action: 'Enviar Recordatorio', urgent: false, completed: false },
  { id: 3, text: 'Capacidad al 63% — hora pico próxima', action: 'Ver Ocupación', urgent: false, completed: false },
];

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const formatTimer = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const feedIcon = (type: FeedEvent['type']) => {
  const map: Record<FeedEvent['type'], React.ReactNode> = {
    checkin:  <UserCheck size={13} style={{ color: '#00E676' }} />,
    checkout: <XCircle   size={13} style={{ color: '#FF6B35' }} />,
    session:  <Dumbbell  size={13} style={{ color: '#A78BFA' }} />,
    payment:  <DollarSign size={13} style={{ color: '#00FF88' }} />,
    alert:    <AlertTriangle size={13} style={{ color: '#FF3D57' }} />,
    ai:       <Brain    size={13} style={{ color: '#FFD600' }} />,
  };
  return map[type];
};

const feedColor = (type: FeedEvent['type']) => {
  const map: Record<FeedEvent['type'], string> = {
    checkin: 'rgba(0,230,118,0.08)',  checkout: 'rgba(255,107,53,0.08)',
    session: 'rgba(167,139,250,0.08)',payment: 'rgba(0,255,136,0.08)',
    alert:   'rgba(255,61,87,0.08)',  ai: 'rgba(255,214,0,0.08)',
  };
  return map[type];
};

const aiIcons: Record<string, React.ReactNode> = {
  'RecoveryBot': <Heart size={11} style={{ color: '#00E676' }} />,
  'NutriBot':    <Apple size={11} style={{ color: '#00FF88' }} />,
  'BiometriX':   <Activity size={11} style={{ color: '#A78BFA' }} />,
  'MoveAI':      <Zap size={11} style={{ color: '#FF6B35' }} />,
  'MotivAI':     <Zap size={11} style={{ color: '#FFD600' }} />,
};

/* ══════════════════════════════════════
   COMPONENTE
══════════════════════════════════════ */
export default function Operations() {
  const [tick, setTick]         = useState(0);
  const [feed, setFeed]         = useState<FeedEvent[]>(initialFeed);
  const [feedIdx, setFeedIdx]   = useState(0);
  const [alerts, setAlerts]     = useState(gymAlerts);
  const [msgModal, setMsgModal] = useState<TrainerStatus | null>(null);
  const [msgText, setMsgText]   = useState('');
  const [sentMsg, setSentMsg]   = useState<string | null>(null);
  const [cameraModal, setCameraModal] = useState<TrainerStatus | null>(null);
  const [liveGym] = useState(38);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (tick > 0 && tick % 12 === 0 && feedIdx < newFeedEvents.length) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const event = { ...newFeedEvents[feedIdx], id: Date.now(), time: timeStr };
      setFeed(prev => [event, ...prev].slice(0, 20));
      setFeedIdx(i => i + 1);
    }
  }, [tick, feedIdx]);

  const dismissAlert = (id: number) => setAlerts(prev => prev.filter(a => a.id !== id));
  const completeAlert = (id: number) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, completed: true } : a));

  const sendMsg = () => {
    if (!msgModal || !msgText.trim()) return;
    setSentMsg(`Mensaje enviado a ${msgModal.name}`);
    setMsgText('');
    setMsgModal(null);
    setTimeout(() => setSentMsg(null), 3000);
  };

  const activeTrainers   = trainers.filter(t => t.status === 'session').length;
  const availableTrainers = trainers.filter(t => t.status === 'available').length;
  const todayRevenue     = 1240;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

      {/* ══════════ HEADER ══════════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
            Operaciones en Vivo
            <div style={{ padding: '4px 10px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 10px var(--neon-green)', animation: 'glow-pulse 1.5s infinite' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--neon-green)', fontWeight: 800, letterSpacing: '0.05em' }}>LIVE HUD</span>
            </div>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 6 }}>
            Centro de comando en tiempo real — Monitoreo de entrenadores, recepción y flujo del gimnasio
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {sentMsg && (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--green-10)', border: '1px solid var(--green-20)', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--neon-green)' }}>
              <CheckCircle2 size={14} /> {sentMsg}
            </div>
          )}
          {alerts.length > 0 && (
            <div className="animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.3)', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--danger-red)', boxShadow: '0 0 15px rgba(255,61,87,0.2)' }}>
              <Bell size={14} /> {alerts.length} ALERTAS CRÍTICAS
            </div>
          )}
        </div>
      </div>

      {/* ══════════ KPI BAR MODERNIZADO ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { icon: Users,        label: 'Ocupación',        value: `${liveGym}/60`,          sub: `${Math.round((liveGym/60)*100)}% Capacidad`, color: 'var(--neon-green)' },
          { icon: Dumbbell,     label: 'Sesiones Live',    value: String(activeTrainers),   sub: `${availableTrainers} coaches libres`, color: '#FF6B35' },
          { icon: UserCheck,    label: 'Check-ins Hoy',    value: '47',                     sub: '+8% vs ayer',     color: '#00E676' },
          { icon: DollarSign,   label: 'Caja Hoy',         value: `$${todayRevenue}`,       sub: '14 transacciones',color: '#A78BFA' },
        ].map((k, i) => (
          <div key={i} style={{ position: 'relative', overflow: 'hidden', padding: '20px', borderRadius: '16px', background: 'rgba(20, 20, 25, 0.6)', border: `1px solid ${k.color}30`, backdropFilter: 'blur(10px)', transition: 'transform 0.2s', cursor: 'default' }}
               onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${k.color}20 0%, transparent 70%)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `inset 0 0 10px ${k.color}10` }}>
                <k.icon size={22} style={{ color: k.color }} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginTop: 4 }}>{k.value}</div>
                <div style={{ fontSize: '0.85rem', color: k.color, marginTop: 4, fontWeight: 600 }}>{k.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* ── ENTRENADORES EN VIVO (HUD) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ padding: 6, background: 'rgba(255, 107, 53, 0.1)', borderRadius: 8 }}>
              <Dumbbell size={18} style={{ color: 'var(--energy-orange)' }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.02em' }}>Live Coaches</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 20 }}>
              {trainers.length} staff
            </span>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {trainers.map(trainer => (
              <div
                key={trainer.id}
                style={{
                  padding: '18px', borderRadius: '16px',
                  background: trainer.status === 'session' ? 'rgba(20, 20, 25, 0.8)' : 'rgba(20, 20, 25, 0.4)',
                  border: trainer.status === 'session' ? `1px solid ${trainer.color}40` : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: trainer.status === 'session' ? `0 4px 20px ${trainer.color}10` : 'none',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                {/* Indicador de estado luminoso en el borde superior */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: trainer.status === 'session' ? trainer.color : trainer.status === 'available' ? 'var(--success-green)' : 'var(--text-muted)', opacity: trainer.status === 'session' ? 1 : 0.3 }} />

                {/* Trainer header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    position: 'relative', width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${trainer.color}, ${trainer.color}66)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1rem', color: '#000',
                  }}>
                    {trainer.initials}
                    {trainer.status === 'session' && (
                      <span style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `1px solid ${trainer.color}`, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.02em' }}>{trainer.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: trainer.status === 'session' ? 'var(--danger-red)' : trainer.status === 'available' ? 'var(--success-green)' : 'var(--warning-yellow)', boxShadow: trainer.status === 'session' ? '0 0 8px var(--danger-red)' : 'none' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em', color: trainer.status === 'session' ? 'var(--danger-red)' : trainer.status === 'available' ? 'var(--success-green)' : 'var(--warning-yellow)' }}>
                        {trainer.status === 'session' ? 'EN SESIÓN' : trainer.status === 'available' ? 'DISPONIBLE' : 'EN DESCANSO'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Session info HUD */}
                {trainer.status === 'session' && trainer.currentClient && (
                  <div style={{ padding: '14px', background: '#0a0a0c', borderRadius: '12px', border: `1px solid ${trainer.color}20`, marginBottom: 14, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Entrenando a</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <User size={14} style={{ color: trainer.color }} /> {trainer.currentClient}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1.4rem', color: trainer.color, letterSpacing: '0.05em', textShadow: `0 0 10px ${trainer.color}40` }}>
                          {formatTimer((trainer.sessionTimer ?? 0) + tick)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>T. Transcurrido</div>
                      </div>
                    </div>
                    {trainer.aiAssistant && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 10px', background: 'rgba(255, 214, 0, 0.05)', border: '1px solid rgba(255, 214, 0, 0.15)', borderRadius: '8px' }}>
                        {aiIcons[trainer.aiAssistant]}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Módulo IA:</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFD600', letterSpacing: '0.02em' }}>{trainer.aiAssistant}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress sesiones */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carga del día</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{trainer.sessionsToday} / {trainer.sessionsTotal}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ height: '100%', width: `${(trainer.sessionsToday / trainer.sessionsTotal) * 100}%`, background: trainer.color, borderRadius: 3 }} />
                </div>

                {/* Admin actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setMsgModal(trainer)} className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.85rem', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <MessageSquare size={14} /> Contactar
                  </button>
                  {trainer.status === 'session' && (
                    <button onClick={() => setCameraModal(trainer)} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem', background: `${trainer.color}20`, color: trainer.color, border: `1px solid ${trainer.color}40` }}>
                      <Activity size={14} /> Detalles
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RECEPCIÓN Y CONTROL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ padding: 6, background: 'rgba(0, 230, 118, 0.1)', borderRadius: 8 }}>
              <Shield size={18} style={{ color: 'var(--neon-green)' }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.02em' }}>Control Access</h3>
          </div>

          {/* Ocupación Advanced */}
          <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(20, 20, 25, 0.6)', border: '1px solid rgba(0, 255, 136, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Ocupación Actual</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--neon-green)', lineHeight: 1 }}>{liveGym + (tick % 3 === 0 ? 0 : 0)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>/ 60 max</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{60 - liveGym} lugares libres</div>
              </div>
            </div>
            
            {/* Barra segmentada */}
            <div style={{ display: 'flex', gap: 4, height: 12 }}>
              {Array.from({ length: 20 }).map((_, i) => {
                const isActive = (i / 20) < (liveGym / 60);
                const isWarning = i >= 16;
                return (
                  <div key={i} style={{
                    flex: 1, borderRadius: 2,
                    background: isActive ? (isWarning ? 'var(--danger-red)' : 'var(--neon-green)') : 'rgba(255,255,255,0.05)',
                    boxShadow: isActive ? `0 0 8px ${isWarning ? 'var(--danger-red)' : 'var(--neon-green)'}60` : 'none'
                  }} />
                );
              })}
            </div>
          </div>

          {/* Alertas admin modernas */}
          {alerts.length > 0 && (
            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255, 61, 87, 0.03)', border: '1px solid rgba(255, 61, 87, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <AlertTriangle size={16} style={{ color: 'var(--danger-red)' }} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--danger-red)', letterSpacing: '0.05em' }}>REQUIERE ATENCIÓN</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alerts.map(a => (
                  <div key={a.id} style={{ opacity: a.completed ? 0.5 : 1, padding: '12px', background: 'rgba(20, 20, 25, 0.8)', borderRadius: '10px', borderLeft: `3px solid ${a.completed ? 'var(--success-green)' : (a.urgent ? 'var(--danger-red)' : 'var(--warning-yellow)')}` }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8, color: '#fff' }}>
                      {a.completed ? '✅ COMPLETADO: ' : ''}{a.text}
                    </div>
                    {!a.completed && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => completeAlert(a.id)} className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: a.urgent ? 'rgba(255,61,87,0.1)' : 'rgba(255,255,255,0.05)', color: a.urgent ? 'var(--danger-red)' : '#fff', border: 'none' }}>
                          {a.action}
                        </button>
                        <button onClick={() => dismissAlert(a.id)} className="btn btn-ghost" style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagos Mini Widget */}
          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(20, 20, 25, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Flujo de Caja (Hoy)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--neon-green)' }}>${todayRevenue}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[ { l: 'Nequi', v: '$640' }, { l: 'Tarjeta', v: '$380' }, { l: 'Cash', v: '$220' } ].map(m => (
                <div key={m.l} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{m.v}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEED DE ACTIVIDAD TIMELINE ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ padding: 6, background: 'rgba(167, 139, 250, 0.1)', borderRadius: 8 }}>
              <Activity size={18} style={{ color: '#A78BFA' }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.02em' }}>Event Timeline</h3>
          </div>

          <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'rgba(20, 20, 25, 0.6)', border: '1px solid rgba(255,255,255,0.05)', height: 680, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8, position: 'relative' }}>
              {/* Línea conectora del timeline */}
              <div style={{ position: 'absolute', left: 15, top: 20, bottom: 20, width: 2, background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', zIndex: 1, paddingTop: 8 }}>
                {feed.map((event, i) => {
                  const color = event.urgent ? '#FF3D57' : 
                                event.type === 'checkin' ? '#00E676' : 
                                event.type === 'checkout' ? '#FF6B35' : 
                                event.type === 'session' ? '#A78BFA' : 
                                event.type === 'payment' ? '#00FF88' : '#FFD600';
                  return (
                    <div key={event.id} style={{ display: 'flex', gap: 16, opacity: i > 10 ? 0.5 : 1, transition: 'all 0.3s' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}20`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 10px ${color}40` }}>
                        {feedIcon(event.type)}
                      </div>
                      <div style={{ flex: 1, paddingTop: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{event.text}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{event.time}</div>
                        </div>
                        {event.detail && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{event.detail}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ MODAL MENSAJE A ENTRENADOR ══════════ */}
      {msgModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => setMsgModal(null)}
        >
          <div className="animate-fade-in" style={{ width: 420, padding: '32px', borderRadius: '24px', background: '#0f0f13', border: `1px solid ${msgModal.color}40`, boxShadow: `0 20px 50px ${msgModal.color}20` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${msgModal.color}, ${msgModal.color}66)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', color: '#000' }}>
                {msgModal.initials}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Transmisión Segura</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Destino: <span style={{ color: msgModal.color, fontWeight: 700 }}>{msgModal.name}</span></div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Protocolos Rápidos</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[ '📋 Revisar plan', '💰 Pendiente pago', '⚠️ Alerta vital', '✅ Buen trabajo' ].map(s => (
                  <button key={s} onClick={() => setMsgText(s)} style={{ padding: '10px', borderRadius: '10px', border: `1px solid ${msgText === s ? msgModal.color : 'rgba(255,255,255,0.05)'}`, background: msgText === s ? `${msgModal.color}15` : 'rgba(255,255,255,0.02)', cursor: 'pointer', fontSize: '0.85rem', color: msgText === s ? msgModal.color : 'var(--text-secondary)', fontWeight: 600, transition: 'all 0.2s' }}>
                    {s}
                  </button>
                ))}
              </div>
              <textarea
                style={{ width: '100%', minHeight: 100, resize: 'vertical', padding: 16, fontSize: '0.95rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                placeholder="Escribe un mensaje personalizado..."
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onFocus={e => e.target.style.borderColor = msgModal.color}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" style={{ flex: 1, justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} onClick={() => setMsgModal(null)}>Cancelar</button>
              <button className="btn" style={{ flex: 2, justifyContent: 'center', background: msgModal.color, color: '#000', fontWeight: 800, borderRadius: '12px', border: 'none' }} onClick={sendMsg}>
                <MessageSquare size={16} style={{ color: '#000' }} /> Transmitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL DE CÁMARA ══════════ */}
      {cameraModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setCameraModal(null)}>
          <div className="glass-card animate-slide-up" style={{ width: 600, padding: 0, border: `1px solid ${cameraModal.color}`, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Eye size={18} color={cameraModal.color} /> Vista de Cámara - {cameraModal.currentClient}</h3>
              <button onClick={() => setCameraModal(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ height: 300, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
               <div style={{ position: 'absolute', top: 10, left: 10, color: 'var(--danger-red)', fontWeight: 'bold', animation: 'glow-pulse 1s infinite' }}>● REC</div>
               <Activity size={48} style={{ color: cameraModal.color, opacity: 0.5, marginBottom: 16 }} />
               <p style={{ color: 'var(--text-muted)' }}>Transmisión en vivo simulada</p>
               <p style={{ color: '#fff', fontWeight: 800, marginTop: 8 }}>BPM Promedio: {Math.floor(Math.random() * 40) + 120}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
