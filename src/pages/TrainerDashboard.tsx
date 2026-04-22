import { useState, useEffect } from 'react';
import {
  Users, Brain, Zap, Apple, Activity, Heart, MessageSquare,
  Plus, ChevronRight, CheckCircle2, Clock, TrendingUp, TrendingDown,
  Dumbbell, Target, Star, AlertTriangle, Send, ChevronLeft,
  FileText, BarChart3, Scale, Flame, Mic, X, Play, StopCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { useGymData, Member } from '../hooks/useGymData';
import FlashProgramBuilder from '../components/trainer/FlashProgramBuilder';

/* ══════════════════════════════════════
   DATOS MOCK
══════════════════════════════════════ */
/* ══════════════════════════════════════
   CONFIGURACIONES LOCALES
   (IA Assistans y Mock Charts)
══════════════════════════════════════ */
const progressHistory = [
  { week: 'S1', weight: 82, bodyFat: 14.5, strength: 65 },
  { week: 'S2', weight: 81.2, bodyFat: 13.8, strength: 68 },
  { week: 'S3', weight: 80.5, bodyFat: 13.1, strength: 72 },
  { week: 'S4', weight: 79.8, bodyFat: 12.4, strength: 76 },
  { week: 'S5', weight: 79.1, bodyFat: 12.0, strength: 80 },
  { week: 'S6', weight: 78.5, bodyFat: 11.2, strength: 85 },
];

interface AiMessage {
  from: 'bot' | 'user';
  text: string;
}

type AiId = 'nutri' | 'biometria' | 'movimiento' | 'recovery' | 'motivacion';

interface AiAssistant {
  id: AiId;
  name: string;
  emoji: string;
  color: string;
  role: string;
  greeting: string;
  suggestions: string[];
}

interface SessionExercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
}

const aiAssistants: AiAssistant[] = [
  {
    id: 'nutri',
    name: 'NutriBot',
    emoji: '🥗',
    color: '#00FF88',
    role: 'Nutrición IA',
    greeting: 'Hola Coach! Analicé el perfil nutricional de tu cliente. Tengo recomendaciones listas.',
    suggestions: [
      '💡 Alex necesita +20g proteína post-entreno. Recomienda whey + caseína nocturna.',
      '🍌 Pre-entreno ideal: avena + plátano 90 min antes de sesión HYROX.',
      '📊 Adherencia nutricional esta semana: 89%. Excelente para su objetivo HYROX Elite.',
      '⚠️ Hidratación por debajo de meta. Recordarle 3L/día en días de entreno.',
    ],
  },
  {
    id: 'biometria',
    name: 'BiometriX',
    emoji: '📡',
    color: '#A78BFA',
    role: 'Biometría IA',
    greeting: 'Datos biométricos analizados. Composición corporal en tendencia positiva.',
    suggestions: [
      '📉 BF% bajó 1.2% en 4 semanas. En camino al objetivo del 10%.',
      '💪 Masa muscular aumentó 0.8kg este mes. Respuesta anabólica óptima.',
      '🫀 HRV promedio 82ms esta semana — recuperación excelente, puede ir a máxima intensidad.',
      '📏 Circunferencia de cintura -2cm desde inicio. Seguir con déficit calórico moderado.',
    ],
  },
  {
    id: 'movimiento',
    name: 'MoveAI',
    emoji: '🏃',
    color: '#FF6B35',
    role: 'Análisis de Movimiento',
    greeting: 'Patrones de movimiento analizados. Hay correcciones técnicas que mejorarán el rendimiento.',
    suggestions: [
      '⚠️ Compensación en sentadilla — rodilla derecha se colapsa. Añadir trabajo de glúteo medio.',
      '🎯 Técnica en Sled Push mejoró 15% desde el mes pasado. Seguir con drills de empuje.',
      '🔄 Asimetría en Farmer Carry (52% peso mano derecha). Trabajo unilateral recomendado.',
      '✅ Patrón de carrera en Rowing es óptimo. Mantener cadencia actual de 28 spm.',
    ],
  },
  {
    id: 'recovery',
    name: 'RecoveryBot',
    emoji: '🛡️',
    color: '#00E676',
    role: 'Recuperación & Descanso',
    greeting: 'Análisis de recuperación completado. El atleta está en condiciones para entrenar fuerte.',
    suggestions: [
      '✅ HRV de 82ms: sesión de alta intensidad hoy es segura y recomendada.',
      '😴 Calidad de sueño esta semana: 84%. Sueño profundo por encima del promedio.',
      '🧊 Recomienda crioterapia o baño frío (10 min 12°C) post sesión de hoy.',
      '📅 Próxima ventana de recuperación activa recomendada: Domingo.',
    ],
  },
  {
    id: 'motivacion',
    name: 'MotivAI',
    emoji: '⚡',
    color: '#FFD600',
    role: 'Coach Mental & Motivación',
    greeting: 'Perfil psicológico y motivacional analizado. Tu cliente está en su mejor momento mental.',
    suggestions: [
      '🏆 Alex lleva 18 días consecutivos — ¡récord personal! Envíale mensaje de felicitación ahora.',
      '💬 Mensaje sugerido: "18 días sin parar, Alex. Eso no es suerte, es carácter. Sigue."',
      '🎯 Se acerca a su meta HYROX Sub-60 min. Refuerza el hito con una meta intermedia visible.',
      '📸 Recomienda foto de progreso esta semana — motivador visual poderoso para este perfil.',
    ],
  },
];

/* ══════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════ */
export default function TrainerDashboard() {
  const { members, updateMemberStatus } = useGymData();
  const [selectedClient, setSelectedClient] = useState<Member | null>(members[0] || null);
  
  // Sincronizar el cliente seleccionado si cambia la lista de miembros
  useEffect(() => {
    if (!selectedClient && members.length > 0) {
      setSelectedClient(members[0]);
    }
  }, [members]);
  const [activeTab, setActiveTab] = useState<'progress' | 'log' | 'body' | 'goals' | 'notes' | 'connect'>('progress');
  const [activeAI, setActiveAI] = useState<AiId>('nutri');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [sessionMode, setSessionMode] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [aiInput, setAiInput] = useState('');
  const [aiChats, setAiChats] = useState<Record<AiId, AiMessage[]>>({
    nutri:      [],
    biometria:  [],
    movimiento: [],
    recovery:   [],
    motivacion: [],
  });
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([
    { name: 'SkiErg', sets: '1', reps: '1000m', weight: 'Máx', notes: '' },
    { name: 'Sled Push', sets: '1', reps: '50m', weight: '102kg', notes: '' },
  ]);
  const [noteText, setNoteText] = useState('');
const [showFlashBuilder, setShowFlashBuilder] = useState(false);
  const [showMeasuresModal, setShowMeasuresModal] = useState(false);

  const handleSaveMeasures = (data: any) => {
    if (!selectedClient) return;
    updateMemberStatus(selectedClient.id, { 
      ...data, 
      biometricStatus: 'completed',
      lastScan: new Date().toISOString().split('T')[0]
    });
    setShowMeasuresModal(false);
  };

function MeasuresModal({ client, onClose, onSave }: { client: Member, onClose: () => void, onSave: (data: any) => void }) {
  const [w, setW] = useState(client.weight || 0);
  const [h, setH] = useState(70); // Default placeholder
  const [f, setF] = useState(client.bodyFat || 0);
  
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(10px)' }}>
      <div className="glass-card" style={{ width: 400, padding: 30, border: '1px solid var(--neon-green)', boxShadow: '0 0 40px rgba(0,255,136,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
           <h3 style={{ fontSize: 16, fontWeight: 950, color: '#fff' }}>ACTUALIZACIÓN BIOMÉTRICA</h3>
           <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <div>
              <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--neon-green)', marginBottom: 8, display: 'block', letterSpacing: 1 }}>PESO ACTUAL (KG)</label>
              <input type="number" value={w} onChange={e => setW(Number(e.target.value))} className="input-field" style={{ width: '100%', padding: 14, fontSize: 16, fontWeight: 800 }} />
           </div>
           <div>
              <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--neon-green)', marginBottom: 8, display: 'block', letterSpacing: 1 }}>ALTURA (CM)</label>
              <input type="number" value={h} onChange={e => setH(Number(e.target.value))} className="input-field" style={{ width: '100%', padding: 14, fontSize: 16, fontWeight: 800 }} />
           </div>
           <div>
              <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--neon-green)', marginBottom: 8, display: 'block', letterSpacing: 1 }}>GRASA CORPORAL (%)</label>
              <input type="number" value={f} onChange={e => setF(Number(e.target.value))} className="input-field" style={{ width: '100%', padding: 14, fontSize: 16, fontWeight: 800 }} />
           </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
           <button onClick={onClose} style={{ flex: 1, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>DESCARTAR</button>
           <button onClick={() => onSave({ weight: w, height: h, bodyFat: f })} style={{ flex: 1, padding: 16, borderRadius: 12, background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 950, boxShadow: '0 0 20px rgba(0,255,136,0.3)', cursor: 'pointer' }}>GUARDAR DATOS</button>
        </div>
      </div>
    </div>
  );
}

  // Timer de sesión
  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (sessionMode) {
      t = setInterval(() => setSessionTime(s => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [sessionMode]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const currentAI = aiAssistants.find(a => a.id === activeAI)!;
  const currentChats = aiChats[activeAI];

  const sendAIMessage = () => {
    if (!aiInput.trim()) return;
    const userMsg: AiMessage = { from: 'user', text: aiInput };
    const botReply: AiMessage = {
      from: 'bot',
      text: currentAI.suggestions[Math.floor(Math.random() * currentAI.suggestions.length)],
    };
    setAiChats(prev => ({
      ...prev,
      [activeAI]: [...prev[activeAI], userMsg, botReply],
    }));
    setAiInput('');
  };

  const attentionCount = members.filter(m => m.status === 'suspended' || (m.alerts && m.alerts.length > 0)).length;

  return (
    <div className="trainer-dashboard-container" style={{ display: 'flex', gap: 0, height: 'calc(100vh - var(--navbar-height) - 56px)', minHeight: 600 }}>

      {/* ══════════ LEFT — LISTA DE CLIENTES ══════════ */}
      <div className="sidebar-trainer-list" style={{
        width: 280,
        flexShrink: 0,
        background: 'var(--space-dark)',
        borderRight: '1px solid rgba(0,255,136,0.08)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(0,255,136,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-base)' }}>Mi Comunidad</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                {members.length} Atletas Activos
              </div>
            </div>
            <button className="btn btn-primary" style={{ padding: '8px 12px', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 15px rgba(0,255,136,0.2)' }}>
              <Plus size={16} />
            </button>
          </div>
          {/* Status rápido para el negocio */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 'var(--radius-md)', padding: '12px',
            display: 'flex', justifyContent: 'space-around',
          }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--neon-green)' }}>{members.filter(m => m.lastVisit === new Date().toISOString().split('T')[0]).length || 3}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hoy</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--danger-red)' }}>{attentionCount}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Alertas</div>
            </div>
          </div>
        </div>

        {/* Client list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {members.map(member => {
            const isSelected = selectedClient?.id === member.id;
            const color = member.plan.toLowerCase().includes('hyrox') ? '#FF6B35' : '#00FF88';
            return (
              <button
                key={member.id}
                onClick={() => { setSelectedClient(member); setActiveTab('progress'); setSessionMode(false); setSessionTime(0); }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '12px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--green-10)' : 'transparent',
                  border: isSelected ? '1px solid var(--green-20)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  marginBottom: 4,
                  display: 'flex', gap: 12, alignItems: 'center',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-full)',
                  background: `linear-gradient(135deg, ${color}, ${color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 'var(--text-xs)', flexShrink: 0,
                  color: '#000',
                }}>
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</span>
                    {member.alerts && member.alerts.length > 0 && <AlertTriangle size={12} style={{ color: 'var(--danger-red)', flexShrink: 0 }} />}
                    {(!member.weight || member.biometricStatus !== 'completed') && (
                      <div title="Perfil Incompleto" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger-red)', boxShadow: '0 0 5px var(--danger-red)' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
                      borderRadius: 'var(--radius-full)', 
                      background: member.status === 'active' ? 'rgba(0,230,118,0.1)' : 'rgba(255,61,87,0.1)', 
                      color: member.status === 'active' ? 'var(--success-green)' : 'var(--danger-red)',
                    }}>
                      {member.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>🔥{member.streak || 0}d</span>
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════ CENTER — DETALLE DEL CLIENTE ══════════ */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--space-medium)', display: 'flex', flexDirection: 'column' }}>

        {/* Client header */}
        {!selectedClient ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
             SELECCIONA UN ATLETA PARA COMENZAR
          </div>
        ) : (
          <div style={{
            padding: '20px 24px', background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            borderBottom: '1px solid rgba(0,255,136,0.08)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 'var(--radius-full)',
                background: `linear-gradient(135deg, #00FF88, #00FF8888)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 'var(--text-xl)', color: '#000',
                border: `2px solid var(--neon-green)`,
                boxShadow: `0 0 20px rgba(0,255,136,0.4)`,
              }}>
                {selectedClient.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{selectedClient.name}</h2>
                  <span style={{
                    fontSize: 'var(--text-xs)', fontWeight: 700, padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: selectedClient.status === 'active' ? 'rgba(0,230,118,0.1)' : 'rgba(255,61,87,0.1)',
                    color: selectedClient.status === 'active' ? 'var(--success-green)' : 'var(--danger-red)',
                  }}>
                    {selectedClient.status.toUpperCase()}
                  </span>
                  <span className={`plan-badge ${selectedClient.plan.toLowerCase()}`}>
                    {selectedClient.plan}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  <span>🎯 {selectedClient.objective || 'Sin objetivo'}</span>
                  <span>📅 {selectedClient.trainingLogs?.length || 0} sesiones</span>
                  <span>⏰ Última: {selectedClient.lastVisit}</span>
                  <span style={{ color: 'var(--neon-green)' }}>🔥 {selectedClient.streak || 0} días racha</span>
                </div>
                {(!selectedClient.weight || selectedClient.biometricStatus !== 'completed') && (
                  <div style={{ marginTop: 10, padding: '10px 16px', background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={14} color="var(--danger-red)" />
                      <span style={{ fontSize: 10, fontWeight: 950, color: 'var(--danger-red)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Atleta con Perfil Incompleto</span>
                    </div>
                    <button 
                      onClick={() => setShowMeasuresModal(true)}
                      style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--danger-red)', color: '#000', border: 'none', fontSize: 9, fontWeight: 950, cursor: 'pointer' }}
                    >
                      TOMAR MEDIDAS AHORA
                    </button>
                  </div>
                )}
              </div>
              {/* Acciones rápidas */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  style={{ gap: 8, background: 'rgba(167, 139, 250, 0.15)', border: '1px solid rgba(167, 139, 250, 0.3)', color: '#A78BFA' }}
                  onClick={() => setShowFlashBuilder(true)}
                >
                  <Zap size={14} /> Flash Creator
                </button>
                {!sessionMode ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => { setSessionMode(true); setActiveTab('log'); }}
                    style={{ gap: 8 }}
                  >
                    <Play size={14} /> Iniciar Sesión
                  </button>
                ) : (
                  <button
                    onClick={() => { setSessionMode(false); setSessionTime(0); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                      borderRadius: 'var(--radius-md)', background: 'rgba(255,61,87,0.15)',
                      border: '1px solid rgba(255,61,87,0.3)', color: 'var(--danger-red)',
                      cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-sm)',
                    }}
                  >
                    <StopCircle size={14} /> Terminar · {formatTime(sessionTime)}
                  </button>
                )}
              </div>
            </div>

            {/* Resumen de impacto rápido */}
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              {[
                { label: 'Estado Financiero', value: selectedClient.debt > 0 ? 'Deuda Pendiente' : 'Suscripción OK', color: selectedClient.debt > 0 ? 'var(--danger-red)' : 'var(--neon-green)' },
                { label: 'Fatiga Percibida', value: 'Baja (Check-in)', color: 'var(--neon-green)' },
                { label: 'Próxima Meta', value: selectedClient.objective || 'Sin asignar', color: 'var(--text-primary)' },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontWeight: 750, fontSize: 'var(--text-sm)', color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        {selectedClient && (
          <div style={{ padding: '0 24px', borderBottom: '1px solid rgba(0,255,136,0.06)', flexShrink: 0, background: 'var(--glass-bg)' }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {([
                { id: 'progress', icon: BarChart3,  label: 'Progreso' },
                { id: 'connect',  icon: MessageSquare, label: 'Connect Hub' },
                { id: 'log',      icon: Dumbbell,   label: sessionMode ? `● Sesión ${formatTime(sessionTime)}` : 'Historial' },
                { id: 'body',     icon: Scale,      label: 'Métricas Cuerpo' },
                { id: 'goals',    icon: Target,     label: 'Objetivos' },
                { id: 'notes',    icon: FileText,   label: 'Notas' },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '14px 16px', fontSize: 'var(--text-xs)', fontWeight: 600,
                    borderBottom: activeTab === tab.id ? '2px solid var(--neon-green)' : '2px solid transparent',
                    color: activeTab === tab.id ? 'var(--neon-green)' : 'var(--text-muted)',
                    background: 'none', cursor: 'pointer', transition: 'color var(--transition-fast)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <tab.icon size={14} />
                  {tab.id === 'log' && sessionMode
                    ? <span style={{ color: 'var(--danger-red)' }}>{tab.label}</span>
                    : tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {!selectedClient ? (
             <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, color: 'var(--text-muted)' }}>
                <Brain size={48} style={{ opacity: 0.2 }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Inteligencia Atlética Desconectada</div>
                  <div style={{ fontSize: 'var(--text-sm)' }}>Selecciona un atleta en el panel izquierdo para ver su rendimiento.</div>
                </div>
             </div>
          ) : (
            <>

          {/* ── PROGRESO ── */}
          {activeTab === 'progress' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Progress bar grande */}
              <div className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Progreso hacia la meta</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{selectedClient.goal}</div>
                  </div>
                  <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--neon-green)' }}>
                    {selectedClient.progress || 0}%
                  </div>
                </div>
                <div className="progress-bar" style={{ height: 12 }}>
                  <div className="progress-bar-fill" style={{ width: `${selectedClient.progress || 0}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  <span>Inicio</span>
                  <span style={{ color: 'var(--neon-green)' }}>✓ Punto actual</span>
                  <span>Meta</span>
                </div>
              </div>

              {/* Chart evolución */}
              <div className="glass-card">
                <div style={{ fontWeight: 700, marginBottom: 16 }}>Evolución 6 Semanas</div>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 10, fontSize: 11 }} />
                      <Line type="monotone" dataKey="strength" name="Fuerza %" stroke="#00FF88" strokeWidth={2} dot={{ r: 3, fill: '#00FF88' }} />
                      <Line type="monotone" dataKey="bodyFat" name="Grasa %" stroke="#FF6B35" strokeWidth={2} dot={{ r: 3, fill: '#FF6B35' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Logros */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="glass-card" style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, marginBottom: 14 }}>📈 Récords Personales (PRs)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { exercise: 'Back Squat', record: '140kg', date: 'Marzo 2026', icon: '🏋️' },
                      { exercise: 'Deadlift', record: '185kg', date: 'Abril 2026', icon: '💀' },
                      { exercise: 'Bench Press', record: '105kg', date: 'Febrero 2026', icon: '⚡' },
                    ].map((pr, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', background: 'var(--space-light)', borderRadius: 12, border: '1px solid rgba(0,255,136,0.1)' }}>
                        <span style={{ fontSize: '1.2rem' }}>{pr.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)' }}>{pr.record}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{pr.exercise}</div>
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--neon-green)', fontWeight: 800 }}>NUEVO</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, marginBottom: 14 }}>🏅 Logros Recientes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Racha 18 días consecutivos', date: 'Hoy', icon: '🔥' },
                      { label: 'Nuevo récord: Sled Push 102kg', date: 'Hace 3 días', icon: '💪' },
                      { label: 'Meta grasa corporal <12% alcanzada', date: 'Esta semana', icon: '🎯' },
                    ].map((l, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <span style={{ fontSize: '1.2rem' }}>{l.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{l.label}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{l.date}</div>
                        </div>
                        <Star size={14} style={{ color: '#FFD600' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CONNECT HUB ── */}
          {activeTab === 'connect' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, height: '100%' }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MessageSquare size={16} style={{ color: 'var(--neon-green)' }} /> Canal Directo: {selectedClient.name}
                </div>
                <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                  <div style={{ alignSelf: 'flex-start', background: 'var(--space-light)', padding: '12px 16px', borderRadius: '4px 16px 16px 16px', maxWidth: '80%', fontSize: 13 }}>
                    Coach, ¿puedo cambiar el Sled Push por otro ejercicio hoy? Siento una pequeña molestia en el tobillo.
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>10:45 AM</div>
                  </div>
                  <div style={{ alignSelf: 'flex-end', background: 'var(--green-10)', border: '1px solid var(--green-20)', padding: '12px 16px', borderRadius: '16px 16px 4px 16px', maxWidth: '80%', fontSize: 13, color: 'var(--neon-green)' }}>
                    Claro Alex, evitemos impacto. Cámbialo por 3 sets de Prensa de Piernas controlada (12-15 reps). ¡Cuida ese tobillo!
                    <div style={{ fontSize: 10, color: 'var(--neon-green)', opacity: 0.7, marginTop: 4 }}>10:50 AM · Leído</div>
                  </div>
                </div>
                <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10 }}>
                   <input className="input-field" placeholder="Escribe un mensaje de motivación..." style={{ flex: 1 }} />
                   <button className="btn btn-primary" style={{ padding: '0 16px' }}><Send size={16} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={12} style={{ color: '#FFD600' }} /> Check-in Diario
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Energía', val: '9/10', color: 'var(--neon-green)' },
                      { label: 'Sueño', val: '7.5 hrs', color: '#A78BFA' },
                      { label: 'Estrés', val: 'Bajo', color: 'var(--neon-green)' },
                      { label: 'Dolor Muscular', val: 'Moderado', color: '#FFD600' },
                    ].map((ch, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ch.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: ch.color }}>{ch.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '16px', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.1)' }}>
                   <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--neon-green)', textTransform: 'uppercase', marginBottom: 8 }}>Estado Nutricional</div>
                   <div style={{ fontSize: 18, fontWeight: 900 }}>89% <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>Adherencia</span></div>
                   <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 8 }}>
                      <div style={{ height: '100%', width: '89%', background: 'var(--neon-green)', borderRadius: 2 }} />
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORIAL / SESIÓN ── */}
          {activeTab === 'log' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sessionMode && (
                <div className="glass-card" style={{ borderColor: 'rgba(255,61,87,0.3)', background: 'rgba(255,61,87,0.04)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--danger-red)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger-red)', animation: 'glow-pulse 1s infinite' }} />
                        SESIÓN EN CURSO — {formatTime(sessionTime)}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{selectedClient.name}</div>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
                      <Plus size={12} /> Añadir Ejercicio
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sessionExercises.map((ex, i) => (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '1fr 80px 80px 100px',
                        gap: 8, padding: '10px 12px', background: 'var(--space-medium)',
                        borderRadius: 'var(--radius-md)', alignItems: 'center',
                      }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{ex.name}</div>
                        <input className="input-field" defaultValue={ex.sets} placeholder="Series" style={{ padding: '6px 8px', fontSize: 'var(--text-xs)', textAlign: 'center' }} />
                        <input className="input-field" defaultValue={ex.reps} placeholder="Reps" style={{ padding: '6px 8px', fontSize: 'var(--text-xs)', textAlign: 'center' }} />
                        <input className="input-field" defaultValue={ex.weight} placeholder="Carga" style={{ padding: '6px 8px', fontSize: 'var(--text-xs)', textAlign: 'center' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <input className="input-field" placeholder="Notas de la sesión..." style={{ flex: 1, padding: '8px 12px' }} />
                    <button className="btn btn-ghost" style={{ padding: '8px', color: 'var(--neon-green)' }}>
                      <Mic size={16} />
                    </button>
                  </div>
                </div>
              )}
              {/* Historial previo */}
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,255,136,0.06)', fontWeight: 700 }}>Historial de Sesiones</div>
                <table className="data-table">
                  <thead><tr><th>Fecha</th><th>Sesión</th><th>Intensidad</th><th>Notas</th></tr></thead>
                  <tbody>
                    {selectedClient.trainingLogs && selectedClient.trainingLogs.length > 0 ? (
                      selectedClient.trainingLogs.map((log, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{log.date}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{log.session}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: log.intensity >= 90 ? 'var(--danger-red)' : 'var(--neon-green)' }}>
                              {log.intensity}%
                            </span>
                          </td>
                          <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{log.notes}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>Sin registros de entrenamiento previos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── MÉTRICAS CUERPO ── */}
          {activeTab === 'body' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Peso', value: `${selectedClient.weight} kg`, trend: '-3.5kg', up: false, color: 'var(--neon-green)' },
                  { label: 'Grasa Corporal', value: `${selectedClient.bodyFat}%`, trend: '-3.1%', up: false, color: 'var(--energy-orange)' },
                  { label: 'Masa Muscular', value: '67.1 kg', trend: '+1.8kg', up: true, color: 'var(--success-green)' },
                  { label: 'Cintura', value: '78 cm', trend: '-4cm', up: false, color: 'var(--neon-green)' },
                  { label: 'Pecho', value: '102 cm', trend: '+2cm', up: true, color: 'var(--neon-green)' },
                  { label: 'IMC', value: '22.4', trend: 'Normal', up: true, color: 'var(--success-green)' },
                ].map((m, i) => (
                  <div key={i} className="glass-card" style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: m.up ? 'var(--success-green)' : 'var(--neon-green)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {m.trend}
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass-card">
                <div style={{ fontWeight: 700, marginBottom: 14 }}>Evolución de Peso</div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressHistory}>
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00FF88" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 10 }} domain={[77, 83]} />
                      <Tooltip contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 10, fontSize: 11 }} />
                      <Area type="monotone" dataKey="weight" name="Peso (kg)" stroke="#00FF88" strokeWidth={2} fill="url(#weightGrad)" dot={{ r: 3, fill: '#00FF88' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── OBJETIVOS ── */}
          {activeTab === 'goals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { goal: 'HYROX Sub-60 minutos', progress: 94, deadline: 'Jun 2026', status: 'En camino' },
                { goal: 'Grasa corporal < 10%', progress: 72, deadline: 'May 2026', status: 'En progreso' },
                { goal: 'Sled Push 120kg', progress: 85, deadline: 'Abr 2026', status: 'Casi listo' },
                { goal: 'Completar 60 sesiones', progress: 78, deadline: 'May 2026', status: '47/60 logradas' },
              ].map((g, i) => (
                <div key={i} className="glass-card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{g.goal}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>📅 {g.deadline} · {g.status}</div>
                    </div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: g.progress >= 90 ? 'var(--success-green)' : 'var(--neon-green)' }}>
                      {g.progress}%
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${g.progress}%`, background: g.progress >= 90 ? 'var(--success-green)' : undefined }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── NOTAS ── */}
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="glass-card">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Nueva nota</div>
                <textarea
                  className="input-field"
                  style={{ width: '100%', minHeight: 80, resize: 'vertical', padding: 12 }}
                  placeholder="Observaciones de la sesión, ajustes de plan, comportamiento del atleta..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, gap: 8 }}>
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}>
                    <Mic size={14} /> Voz
                  </button>
                  <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 'var(--text-xs)' }}>
                    <Send size={12} /> Guardar Nota
                  </button>
                </div>
              </div>
              {[
                { date: 'Hoy', text: 'Excelente sesión. Alex llegó muy motivado. Técnica en SkiErg mejoró notablemente. Ajustar carga en Sled Push para próxima semana.' },
                { date: '3 días', text: 'Sesión HYROX Full Protocol. Tiempo: 61:30. Se acerca al sub-60. Punto débil: transición SkiErg → Sled. Trabajar en eso.' },
                { date: '1 semana', text: 'Pequeña molestia en hombro derecho post-Press. Recomendé 2 días de rest activo. Monitorear próxima semana.' },
              ].map((n, i) => (
                <div key={i} className="glass-card" style={{ padding: '14px 18px' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 6 }}>Hace {n.date}</div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{n.text}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>

      {/* ══════════ RIGHT — AI ASSISTANTS ══════════ */}
      {showAIPanel && (
        <div style={{
          width: 300, flexShrink: 0,
          background: 'var(--space-dark)',
          borderLeft: '1px solid rgba(0,255,136,0.08)',
          display: 'flex', flexDirection: 'column',
          borderRadius: '0 var(--radius-xl) var(--radius-xl) 0',
          overflow: 'hidden',
        }}>
          {/* AI Panel header */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,255,136,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--neon-green)' }}>⚡ Asistentes IA</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Tu equipo de soporte</div>
            </div>
            <button onClick={() => setShowAIPanel(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', padding: 4 }}>
              <X size={16} />
            </button>
          </div>

          {/* Bot selector */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,255,136,0.06)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {aiAssistants.map(ai => (
              <button
                key={ai.id}
                onClick={() => setActiveAI(ai.id)}
                title={ai.role}
                style={{
                  padding: '5px 8px', borderRadius: 'var(--radius-sm)',
                  border: activeAI === ai.id ? `1px solid ${ai.color}60` : '1px solid transparent',
                  background: activeAI === ai.id ? `${ai.color}15` : 'var(--space-medium)',
                  cursor: 'pointer', fontSize: '0.9rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {ai.emoji}
              </button>
            ))}
          </div>

          {/* Bot info */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,255,136,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-md)',
                background: `${currentAI.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
              }}>
                {currentAI.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: currentAI.color }}>{currentAI.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{currentAI.role}</div>
              </div>
              <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-green)', animation: 'glow-pulse 2s infinite' }} />
            </div>
          </div>

          {/* Chat area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Greeting */}
            <div style={{
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: `${currentAI.color}10`, border: `1px solid ${currentAI.color}20`,
              fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5,
            }}>
              {currentAI.greeting}
            </div>

            {/* Suggestions */}
            {/* Insights dinámicos */}
            <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Insights para {selectedClient?.name.split(' ')[0]}:
            </div>
            {selectedClient?.injuries && selectedClient.injuries !== 'Ninguna' && (
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.3)', fontSize: 'var(--text-xs)', color: 'var(--danger-red)' }}>
                🚨 Alerta de Lesión: {selectedClient.injuries}. El bot de recuperación recomienda protocolos suaves.
              </div>
            )}
            {currentAI.suggestions.slice(0, 2).map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--space-medium)', border: '1px solid rgba(0,255,136,0.06)',
                  fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6,
                }}
              >
                {s}
              </div>
            ))}

            {/* Dynamic chat */}
            {currentChats.map((msg, i) => (
              <div key={i} style={{
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: msg.from === 'user' ? 'var(--green-10)' : 'var(--space-medium)',
                border: `1px solid ${msg.from === 'user' ? 'var(--green-20)' : 'rgba(0,255,136,0.06)'}`,
                fontSize: 'var(--text-xs)', color: msg.from === 'user' ? 'var(--neon-green)' : 'var(--text-secondary)',
                alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%', lineHeight: 1.5,
              }}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(0,255,136,0.06)', display: 'flex', gap: 6 }}>
            <input
              className="input-field"
              style={{ flex: 1, padding: '8px 10px', fontSize: 'var(--text-xs)' }}
              placeholder={`Pregunta a ${currentAI.name}...`}
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendAIMessage()}
            />
            <button
              onClick={sendAIMessage}
              style={{
                width: 32, height: 32, borderRadius: 'var(--radius-md)',
                background: 'var(--green-15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, color: 'var(--neon-green)',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle AI panel cuando está cerrado */}
      {!showAIPanel && (
        <button
          onClick={() => setShowAIPanel(true)}
          style={{
            position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 80, borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
            background: 'var(--green-15)', border: '1px solid var(--green-20)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--neon-green)',
          }}
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* ══ MODAL: FLASH PROGRAM BUILDER ══ */}
      {showFlashBuilder && selectedClient && (
        <FlashProgramBuilder 
          onClose={() => setShowFlashBuilder(false)} 
          athleteName={selectedClient.name} 
        />
      )}
      {/* ══ MODAL: MEASURES ══ */}
      {showMeasuresModal && selectedClient && (
        <MeasuresModal 
          client={selectedClient} 
          onClose={() => setShowMeasuresModal(false)} 
          onSave={handleSaveMeasures} 
        />
      )}
    </div>
  );
}
