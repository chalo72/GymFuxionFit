import { useState, useEffect } from 'react';
import {
  Radio, UserCheck, Users, DollarSign, AlertTriangle,
  MessageSquare, Eye, CheckCircle2, XCircle, Clock,
  TrendingUp, Zap, Brain, Apple, Activity, Heart,
  Dumbbell, Bell, RefreshCw, ChevronRight, Shield,
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
  { id: 1, text: 'Membresía vencida en gym: Carlos Rivas', action: 'Notificar Recepción', urgent: true },
  { id: 2, text: 'María López vence en 2 días', action: 'Enviar Recordatorio', urgent: false },
  { id: 3, text: 'Capacidad al 63% — hora pico próxima', action: 'Ver Ocupación', urgent: false },
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
  const [liveGym] = useState(38);

  // Tick general cada segundo
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Agregar evento al feed cada 12 segundos
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ══════════ HEADER ══════════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            Operaciones en Vivo
            <span style={{ marginLeft: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--neon-green)', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-green)', display: 'inline-block', animation: 'glow-pulse 1.5s infinite' }} />
              EN VIVO
            </span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Vista completa del gym en tiempo real — Entrenadores · Recepción · Actividad
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {sentMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--green-10)', border: '1px solid var(--green-20)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neon-green)' }}>
              <CheckCircle2 size={12} /> {sentMsg}
            </div>
          )}
          {alerts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.3)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--danger-red)' }}>
              <Bell size={12} /> {alerts.length} alertas activas
            </div>
          )}
          <button className="btn btn-ghost" style={{ padding: '8px 12px', gap: 6 }}>
            <RefreshCw size={14} style={{ animation: 'float-slow 3s infinite' }} /> Auto-refresh
          </button>
        </div>
      </div>

      {/* ══════════ KPI BAR ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {[
          { icon: Users,        label: 'En Gym Ahora',     value: String(liveGym),         sub: 'de 60 cap.',      color: 'var(--neon-green)' },
          { icon: Dumbbell,     label: 'Sesiones Activas',  value: String(activeTrainers),  sub: `${availableTrainers} entren. libres`, color: '#FF6B35' },
          { icon: UserCheck,    label: 'Check-ins Hoy',    value: '47',                    sub: '+8% vs ayer',     color: 'var(--success-green)' },
          { icon: DollarSign,   label: 'Recaudado Hoy',    value: `$${todayRevenue.toLocaleString()}`, sub: '14 pagos', color: 'var(--neon-green)' },
          { icon: AlertTriangle,label: 'Alertas',          value: String(alerts.length),   sub: 'requieren acción',color: alerts.length > 0 ? 'var(--danger-red)' : 'var(--text-muted)' },
        ].map((k, i) => (
          <div key={i} className="glass-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={16} style={{ color: k.color }} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{k.label}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* ── ENTRENADORES EN VIVO ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Dumbbell size={16} style={{ color: 'var(--energy-orange)' }} />
            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Entrenadores</h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {trainers.length} activos hoy
            </span>
          </div>

          {trainers.map(trainer => (
            <div
              key={trainer.id}
              className="glass-card"
              style={{
                padding: '16px 18px',
                borderLeft: `3px solid ${trainer.status === 'session' ? trainer.color : trainer.status === 'available' ? 'var(--success-green)' : 'var(--text-muted)'}`,
              }}
            >
              {/* Trainer header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 'var(--radius-full)', flexShrink: 0,
                  background: `linear-gradient(135deg, ${trainer.color}, ${trainer.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 'var(--text-xs)', color: '#000',
                }}>
                  {trainer.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{trainer.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: trainer.status === 'session' ? 'var(--danger-red)' : trainer.status === 'available' ? 'var(--success-green)' : 'var(--warning-yellow)',
                      animation: trainer.status === 'session' ? 'glow-pulse 1.2s infinite' : 'none',
                    }} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700,
                      color: trainer.status === 'session' ? 'var(--danger-red)' : trainer.status === 'available' ? 'var(--success-green)' : 'var(--warning-yellow)',
                    }}>
                      {trainer.status === 'session' ? 'EN SESIÓN' : trainer.status === 'available' ? 'DISPONIBLE' : 'EN DESCANSO'}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                    ⭐ {trainer.rating}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {trainer.sessionsToday}/{trainer.sessionsTotal} sesiones
                  </div>
                </div>
              </div>

              {/* Session info */}
              {trainer.status === 'session' && trainer.currentClient && (
                <div style={{ padding: '10px 12px', background: 'rgba(255,61,87,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,61,87,0.15)', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Cliente en sesión</div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{trainer.currentClient}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--danger-red)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatTimer((trainer.sessionTimer ?? 0) + tick)}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>duración</div>
                    </div>
                  </div>
                  {trainer.aiAssistant && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '5px 8px', background: 'rgba(255,214,0,0.07)', borderRadius: 'var(--radius-sm)' }}>
                      {aiIcons[trainer.aiAssistant]}
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>IA activa:</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FFD600' }}>{trainer.aiAssistant}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Next appointment */}
              {trainer.nextClient && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 10 }}>
                  <Clock size={11} />
                  <span>Próximo: <strong style={{ color: 'var(--text-secondary)' }}>{trainer.nextClient}</strong> a las <strong style={{ color: 'var(--neon-green)' }}>{trainer.nextTime}</strong></span>
                </div>
              )}

              {/* Progress sesiones */}
              <div className="progress-bar" style={{ height: 4, marginBottom: 10 }}>
                <div className="progress-bar-fill" style={{ width: `${(trainer.sessionsToday / trainer.sessionsTotal) * 100}%`, background: trainer.color }} />
              </div>

              {/* Admin actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: 'var(--text-xs)', justifyContent: 'center' }}
                  onClick={() => setMsgModal(trainer)}
                >
                  <MessageSquare size={12} /> Mensaje
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: '6px 10px', fontSize: 'var(--text-xs)', justifyContent: 'center' }}
                >
                  <Eye size={12} /> Ver detalle
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── RECEPCIÓN EN VIVO ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <UserCheck size={16} style={{ color: 'var(--neon-green)' }} />
            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Recepción</h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              Control en tiempo real
            </span>
          </div>

          {/* Ocupación */}
          <div className="glass-card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Ocupación del Gym</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--neon-green)' }}>{liveGym + (tick % 3 === 0 ? 0 : 0)}</div>
            </div>
            <div className="progress-bar" style={{ height: 10, marginBottom: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${(liveGym / 60) * 100}%`, background: liveGym / 60 > 0.8 ? 'var(--danger-red)' : undefined }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <span>{liveGym} personas dentro</span>
              <span>{60 - liveGym} lugares disponibles</span>
            </div>
          </div>

          {/* Alertas admin */}
          {alerts.length > 0 && (
            <div className="glass-card" style={{ padding: '14px 16px', borderColor: 'rgba(255,61,87,0.2)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--danger-red)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={14} /> Alertas que Requieren tu Atención
              </div>
              {alerts.map(a => (
                <div key={a.id} style={{ padding: '10px 12px', background: a.urgent ? 'rgba(255,61,87,0.06)' : 'var(--space-medium)', borderRadius: 'var(--radius-md)', border: a.urgent ? '1px solid rgba(255,61,87,0.2)' : '1px solid rgba(255,255,255,0.04)', marginBottom: 8 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 6 }}>{a.text}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary" style={{ flex: 1, padding: '5px 8px', fontSize: '0.65rem', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}>
                      {a.action}
                    </button>
                    <button onClick={() => dismissAlert(a.id)} className="btn btn-ghost" style={{ padding: '5px 8px', fontSize: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                      <XCircle size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagos de hoy */}
          <div className="glass-card" style={{ padding: '16px 18px' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 14 }}>Ingresos Hoy</div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--neon-green)', marginBottom: 6 }}>
              ${todayRevenue.toLocaleString()}
            </div>
            <div className="progress-bar" style={{ marginBottom: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${(todayRevenue / 2000) * 100}%` }} />
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>62% de la meta diaria ($2,000)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
              {[
                { label: 'Nequi', value: '$640', pct: 52 },
                { label: 'Tarjeta', value: '$380', pct: 31 },
                { label: 'Efectivo', value: '$220', pct: 17 },
              ].map((m, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '8px', background: 'var(--space-medium)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--neon-green)' }}>{m.value}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{m.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff performance resumen */}
          <div className="glass-card" style={{ padding: '14px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 12 }}>Rendimiento Staff Hoy</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'Recepción',   metric: '47 check-ins', good: true },
                { name: 'Coach Alex',  metric: '4 sesiones',    good: true },
                { name: 'Coach María', metric: '3 sesiones',    good: true },
                { name: 'Coach Diego', metric: '2 sesiones',    good: false },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{s.name}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: s.good ? 'var(--success-green)' : 'var(--warning-yellow)', fontWeight: 600 }}>
                    {s.good ? '✓' : '⚠'} {s.metric}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEED DE ACTIVIDAD ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Radio size={16} style={{ color: 'var(--neon-green)' }} />
            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Feed en Tiempo Real</h3>
          </div>

          <div className="glass-card" style={{ padding: '8px', height: 700, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, padding: '4px' }}>
              {feed.map((event, i) => (
                <div
                  key={event.id}
                  style={{
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    background: event.urgent ? 'rgba(255,61,87,0.08)' : feedColor(event.type),
                    border: event.urgent ? '1px solid rgba(255,61,87,0.25)' : '1px solid rgba(255,255,255,0.03)',
                    animation: i === 0 ? 'fade-in 0.4s ease' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ marginTop: 1, flexShrink: 0 }}>{feedIcon(event.type)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, lineHeight: 1.4, color: event.urgent ? 'var(--danger-red)' : 'var(--text-primary)' }}>
                        {event.text}
                      </div>
                      {event.detail && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{event.detail}</div>
                      )}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }}>{event.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leyenda */}
            <div style={{ padding: '10px 4px 4px', borderTop: '1px solid rgba(0,255,136,0.06)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { type: 'checkin' as const, label: 'Entrada' },
                  { type: 'session' as const, label: 'Sesión' },
                  { type: 'payment' as const, label: 'Pago' },
                  { type: 'alert'   as const, label: 'Alerta' },
                  { type: 'ai'      as const, label: 'IA' },
                ].map(l => (
                  <div key={l.type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {feedIcon(l.type)}
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick admin actions */}
          <div className="glass-card" style={{ padding: '14px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              Acciones Rápidas Admin
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { label: 'Anuncio al Gym',         icon: Bell,         color: 'var(--neon-green)' },
                { label: 'Cerrar Acceso Temporal', icon: XCircle,      color: 'var(--danger-red)' },
                { label: 'Contactar Recepción',    icon: MessageSquare,color: 'var(--energy-orange)' },
                { label: 'Reporte Diario',         icon: TrendingUp,   color: '#A78BFA' },
              ].map((a, i) => (
                <button key={i} className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 'var(--text-xs)', gap: 10, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <a.icon size={13} style={{ color: a.color }} /> {a.label}
                  <ChevronRight size={11} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ MODAL MENSAJE A ENTRENADOR ══════════ */}
      {msgModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setMsgModal(null)}
        >
          <div className="glass-card" style={{ width: 380, padding: '28px', borderColor: `${msgModal.color}40` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', marginBottom: 4 }}>
              Mensaje a {msgModal.name}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 20 }}>
              El entrenador recibirá una notificación inmediata en su dispositivo.
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Mensajes Rápidos</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {[
                  '📋 Revisar plan del cliente',
                  '💰 Cliente pendiente de pago',
                  '⚠️ Alerta biométrica activa',
                  '✅ Excelente trabajo hoy',
                ].map(s => (
                  <button key={s} onClick={() => setMsgText(s)} style={{ padding: '5px 10px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(0,255,136,0.15)', background: msgText === s ? 'var(--green-10)' : 'var(--space-medium)', cursor: 'pointer', fontSize: 'var(--text-xs)', color: msgText === s ? 'var(--neon-green)' : 'var(--text-secondary)' }}>
                    {s}
                  </button>
                ))}
              </div>
              <textarea
                className="input-field"
                style={{ width: '100%', minHeight: 80, resize: 'vertical', padding: 12, fontSize: 'var(--text-sm)' }}
                placeholder="Escribe un mensaje personalizado..."
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMsgModal(null)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={sendMsg}>
                <MessageSquare size={14} /> Enviar Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
