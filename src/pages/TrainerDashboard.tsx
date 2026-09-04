import { useState, useEffect } from 'react';
import {
  Users, Brain, Zap, Apple, Activity, Heart, MessageSquare,
  Plus, ChevronRight, CheckCircle2, Clock, TrendingUp, TrendingDown,
  Dumbbell, Target, Star, AlertTriangle, Send, ChevronLeft,
  FileText, BarChart3, Scale, Flame, Mic, X, Play, StopCircle, Pause
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { useGymData, Member } from '../hooks/useGymData';
import { firstName, initials } from '../lib/safeText';
import FlashProgramBuilder from '../components/trainer/FlashProgramBuilder';
import { AiAssist } from '../components/AiAssist';
import { Link } from 'react-router-dom';

/* ══════════════════════════════════════
   DATOS MOCK (Progreso & IA)
══════════════════════════════════════ */
const progressHistory = [
  { week: 'S1', weight: 82, bodyFat: 14.5, strength: 65 },
  { week: 'S2', weight: 81.2, bodyFat: 13.8, strength: 68 },
  { week: 'S3', weight: 80.5, bodyFat: 13.1, strength: 72 },
  { week: 'S4', weight: 79.8, bodyFat: 12.4, strength: 76 },
  { week: 'S5', weight: 79.1, bodyFat: 12.0, strength: 80 },
  { week: 'S6', weight: 78.5, bodyFat: 11.2, strength: 85 },
];

/* ══════════════════════════════════════
   COMPONENTE PRINCIPAL (HUB MULTI-ATLETA)
══════════════════════════════════════ */
export default function TrainerDashboard() {
  const { members, updateMemberStatus, addMember } = useGymData();
  const [selectedClient, setSelectedClient] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<'progress' | 'log' | 'body' | 'goals' | 'notes' | 'connect'>('progress');
  const [showFlashBuilder, setShowFlashBuilder] = useState(false);
  const [showMeasuresModal, setShowMeasuresModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // 🔹 ESTADO DE SESIONES MÚLTIPLES 🔹
  // Mapea el ID del atleta a sus segundos transcurridos
  const [activeSessions, setActiveSessions] = useState<Record<string, number>>({});

  // Sincronización inicial
  useEffect(() => {
    if (!selectedClient && members.length > 0) {
      setSelectedClient(members[0]);
    }
  }, [members, selectedClient]);

  // Motor del cronómetro global (avanza todas las sesiones activas)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSessions(prev => {
        const next = { ...prev };
        let changed = false;
        for (const id in next) {
          next[id] += 1;
          changed = true;
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const toggleSession = (clientId: string) => {
    if (activeSessions[clientId] !== undefined) {
      // Terminar sesión
      const confirmEnd = window.confirm('¿Terminar sesión y guardar datos?');
      if (confirmEnd) {
        setActiveSessions(prev => {
          const next = { ...prev };
          delete next[clientId];
          return next;
        });
        setActiveTab('progress');
      }
    } else {
      // Iniciar sesión
      setActiveSessions(prev => ({ ...prev, [clientId]: 0 }));
      setSelectedClient(members.find(m => m.id === clientId) || null);
      setActiveTab('log');
    }
  };

  const handleSaveMeasures = (data: any) => {
    if (!selectedClient) return;
    updateMemberStatus(selectedClient.id, { 
      ...data, 
      biometricStatus: 'completed',
      lastScan: new Date().toISOString().split('T')[0]
    });
    setShowMeasuresModal(false);
  };

  // --- Modal Biométrico ---
  function MeasuresModal({ client, onClose, onSave }: { client: Member, onClose: () => void, onSave: (data: any) => void }) {
    const [w, setW] = useState(client.weight || 0);
    const [h, setH] = useState(70);
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

  // --- Modal Añadir Atleta ---
  function AddMemberModal({ onClose, onAdd }: { onClose: () => void, onAdd: (data: any) => void }) {
    const [name, setName] = useState('');
    const [plan, setPlan] = useState('Básico');
    const [objective, setObjective] = useState('Hipertrofia');
    
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(10px)' }}>
        <div className="glass-card" style={{ width: 400, padding: 30, border: '1px solid var(--neon-green)', boxShadow: '0 0 40px rgba(0,255,136,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <h3 style={{ fontSize: 16, fontWeight: 950, color: '#fff' }}>NUEVO ATLETA</h3>
             <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
             <div>
                <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8, display: 'block', letterSpacing: 1 }}>NOMBRE COMPLETO</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" style={{ width: '100%', padding: 14 }} placeholder="Ej. Alex Guerrero" />
             </div>
             <div>
                <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8, display: 'block', letterSpacing: 1 }}>PLAN / SUSCRIPCIÓN</label>
                <select value={plan} onChange={e => setPlan(e.target.value)} className="input-field" style={{ width: '100%', color: '#000' }}>
                  <option value="Básico">Básico</option>
                  <option value="Pro">Pro</option>
                  <option value="HYROX">HYROX Elite</option>
                </select>
             </div>
             <div>
                <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8, display: 'block', letterSpacing: 1 }}>OBJETIVO PRINCIPAL</label>
                <input type="text" value={objective} onChange={e => setObjective(e.target.value)} className="input-field" style={{ width: '100%', padding: 14 }} placeholder="Ej. Hipertrofia o Pérdida de Grasa" />
             </div>
          </div>
          <button 
             onClick={() => {
               if (!name) return alert('El nombre es obligatorio');
               onAdd({ name, plan, objective, status: 'active', debt: 0, lastVisit: new Date().toISOString().split('T')[0], expiryDate: '2030-12-31' });
             }} 
             style={{ width: '100%', marginTop: 32, padding: 16, borderRadius: 12, background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 950, cursor: 'pointer' }}
          >
            REGISTRAR ATLETA
          </button>
        </div>
      </div>
    );
  }

  const attentionCount = members.filter(m => m.status === 'suspended' || (m.alerts && m.alerts.length > 0)).length;
  const sessionCount = Object.keys(activeSessions).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--navbar-height) - 56px)', minHeight: 600 }}>
      <div style={{ padding: '12px 24px 0', flexShrink: 0 }}>
        <AiAssist
          rol="entrenador"
          texto="Hoy: 1) atiende al que está en el piso, no al celular. 2) Imprime Piso QR y pega en banca, prensa, sled y rig. 3) Si el socio no sabe pecho alto vs bajo, mándalo a escanear la zona Pecho. Hierro, WOD e HYROX no se mezclan a lo loco: elige una disciplina por sesión."
        />
        <Link to="/piso-qr" style={{ fontSize: 13, color: 'var(--neon-green)', fontWeight: 700 }}>Abrir códigos QR del piso →</Link>
      </div>
      
      {/* ─── QUICK SWITCH: BARRA SUPERIOR DE SESIONES LIVE ─── */}
      {sessionCount > 0 && (
        <div style={{ 
          background: 'rgba(20, 20, 25, 0.9)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--neon-green)', animation: 'glow-pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--neon-green)', letterSpacing: 1 }}>{sessionCount} LIVE:</span>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {Object.entries(activeSessions).map(([id, time]) => {
              const m = members.find(x => x.id === id);
              if (!m) return null;
              const isSelected = selectedClient?.id === id;
              return (
                <button 
                  key={id}
                  onClick={() => { setSelectedClient(m); setActiveTab('log'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 16px', borderRadius: 20,
                    background: isSelected ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected ? '1px solid var(--neon-green)' : '1px solid transparent',
                    color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 0 15px rgba(0, 255, 136, 0.2)' : 'none'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{firstName(m.name)}</div>
                  <div style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--neon-green)', fontWeight: 800 }}>{formatTime(time)}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ══════════ LEFT — COMUNIDAD ══════════ */}
        <div className="sidebar-trainer-list" style={{
          width: 280, flexShrink: 0, background: 'var(--space-dark)',
          borderRight: '1px solid rgba(0,255,136,0.08)',
          display: 'flex', flexDirection: 'column',
          borderRadius: sessionCount > 0 ? '0' : 'var(--radius-xl) 0 0 var(--radius-xl)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(0,255,136,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-base)' }}>Mi Comunidad</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{members.length} Atletas Activos</div>
              </div>
              <button onClick={() => setShowAddMemberModal(true)} className="btn btn-primary" style={{ padding: '8px 12px', borderRadius: 'var(--radius-lg)' }}>
                <Plus size={16} />
              </button>
            </div>
            {/* Status negocio */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', justifyContent: 'space-around',
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

          {/* Lista */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {members.map(member => {
              if (!member) return null;
              const isSelected = selectedClient?.id === member.id;
              const inSession = activeSessions[member.id] !== undefined;
              const color = String(member.plan || '').toLowerCase().includes('hyrox') ? '#FF6B35' : '#00FF88';
              
              return (
                <button
                  key={member.id}
                  onClick={() => { 
                    setSelectedClient(member); 
                    if (!inSession) setActiveTab('progress'); 
                    else setActiveTab('log'); 
                  }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px', borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--green-10)' : (inSession ? 'rgba(255,255,255,0.02)' : 'transparent'),
                    border: isSelected ? '1px solid var(--green-20)' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s', marginBottom: 4,
                    display: 'flex', gap: 12, alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color}, ${color}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000',
                    border: inSession ? `2px solid ${color}` : 'none',
                    boxShadow: inSession ? `0 0 10px ${color}` : 'none'
                  }}>
                    {initials(member.name)}
                  </div>
                  {inSession && (
                    <div style={{ position: 'absolute', top: 6, left: 38, width: 10, height: 10, background: 'var(--danger-red)', borderRadius: '50%', border: '2px solid var(--space-dark)' }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</span>
                      {member.alerts && member.alerts.length > 0 && <AlertTriangle size={12} style={{ color: 'var(--danger-red)', flexShrink: 0 }} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {inSession ? (
                        <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--danger-red)', fontWeight: 800 }}>LIVE {formatTime(activeSessions[member.id])}</span>
                      ) : (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{member.plan}</span>
                      )}
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
          
          {showMeasuresModal && selectedClient && (
            <MeasuresModal client={selectedClient} onClose={() => setShowMeasuresModal(false)} onSave={handleSaveMeasures} />
          )}
          
          {showAddMemberModal && (
            <AddMemberModal 
              onClose={() => setShowAddMemberModal(false)} 
              onAdd={async (data) => {
                await addMember(data);
                setShowAddMemberModal(false);
              }} 
            />
          )}

          {!selectedClient ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
               SELECCIONA UN ATLETA PARA COMENZAR
            </div>
          ) : (
            <>
            {/* Header Cliente */}
            <div style={{
              padding: '20px 24px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(0,255,136,0.08)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: `linear-gradient(135deg, #00FF88, #00FF8888)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 'var(--text-xl)', color: '#000',
                  boxShadow: activeSessions[selectedClient.id] !== undefined ? `0 0 30px rgba(0,255,136,0.5)` : `0 0 20px rgba(0,255,136,0.2)`,
                }}>
                  {initials(selectedClient.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{selectedClient.name}</h2>
                    <span style={{
                      fontSize: 'var(--text-xs)', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)',
                      background: selectedClient.status === 'active' ? 'rgba(0,230,118,0.1)' : 'rgba(255,61,87,0.1)',
                      color: selectedClient.status === 'active' ? 'var(--success-green)' : 'var(--danger-red)',
                    }}>
                      {String(selectedClient.status || 'sin estado').toUpperCase()}
                    </span>
                    {activeSessions[selectedClient.id] !== undefined && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: 'var(--danger-red)', color: '#fff', fontWeight: 800, animation: 'glow-pulse 2s infinite' }}>EN SESIÓN</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <span>🎯 {selectedClient.objective || 'Sin objetivo'}</span>
                    <span>📅 {selectedClient.trainingLogs?.length || 0} sesiones totales</span>
                    <span style={{ color: 'var(--neon-green)' }}>🔥 {selectedClient.streak || 0} días racha</span>
                  </div>
                  {(!selectedClient.weight || selectedClient.biometricStatus !== 'completed') && (
                    <div style={{ marginTop: 10, padding: '10px 16px', background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={14} color="var(--danger-red)" />
                        <span style={{ fontSize: 10, fontWeight: 950, color: 'var(--danger-red)', textTransform: 'uppercase' }}>Perfil Incompleto</span>
                      </div>
                      <button onClick={() => setShowMeasuresModal(true)} style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--danger-red)', color: '#000', border: 'none', fontSize: 9, fontWeight: 950, cursor: 'pointer' }}>TOMAR MEDIDAS</button>
                    </div>
                  )}
                </div>
                {/* Controles de Sesión Múltiple */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" style={{ gap: 8 }} onClick={() => setShowFlashBuilder(true)}>
                    <Zap size={14} /> Flash Creator
                  </button>
                  {activeSessions[selectedClient.id] === undefined ? (
                    <button className="btn btn-primary" onClick={() => toggleSession(selectedClient.id)} style={{ gap: 8 }}>
                      <Play size={14} /> Iniciar Entrenamiento
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleSession(selectedClient.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                        borderRadius: 'var(--radius-md)', background: 'rgba(255,61,87,0.15)',
                        border: '1px solid rgba(255,61,87,0.3)', color: 'var(--danger-red)',
                        cursor: 'pointer', fontWeight: 800, fontSize: 'var(--text-sm)',
                        boxShadow: '0 0 20px rgba(255,61,87,0.2)'
                      }}
                    >
                      <StopCircle size={16} /> Finalizar · {formatTime(activeSessions[selectedClient.id])}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '0 24px', borderBottom: '1px solid rgba(0,255,136,0.06)', flexShrink: 0, background: 'var(--glass-bg)' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                {([
                  { id: 'log',      icon: Dumbbell,   label: activeSessions[selectedClient.id] !== undefined ? `▶ Sesión en Curso` : 'Historial' },
                  { id: 'progress', icon: BarChart3,  label: 'Métricas' },
                  { id: 'goals',    icon: Target,     label: 'Objetivos' },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '16px 20px', fontSize: 'var(--text-xs)', fontWeight: 800,
                      borderBottom: activeTab === tab.id ? '2px solid var(--neon-green)' : '2px solid transparent',
                      color: activeTab === tab.id ? (tab.id === 'log' && activeSessions[selectedClient.id] !== undefined ? 'var(--danger-red)' : 'var(--neon-green)') : 'var(--text-muted)',
                      background: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              {activeTab === 'progress' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>Progreso hacia la meta</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedClient.objective}</div>
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--neon-green)' }}>
                        {selectedClient.progress || 0}%
                      </div>
                    </div>
                    <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${selectedClient.progress || 0}%`, height: '100%', background: 'var(--neon-green)', borderRadius: 6 }} />
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ fontWeight: 800, marginBottom: 20, color: '#fff' }}>Evolución 6 Semanas (Fuerza Base)</div>
                    <div style={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progressHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 10 }} />
                          <Line type="monotone" dataKey="strength" name="Fuerza %" stroke="#00FF88" strokeWidth={3} dot={{ r: 5, fill: '#00FF88' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'log' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {activeSessions[selectedClient.id] !== undefined ? (
                    <div style={{ padding: 32, background: 'rgba(255,61,87,0.05)', border: '1px solid rgba(255,61,87,0.2)', borderRadius: 20, textAlign: 'center' }}>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger-red)', marginBottom: 8 }}>SESIÓN EN CURSO</h2>
                      <div style={{ fontSize: '4rem', fontFamily: 'monospace', fontWeight: 900, color: '#fff', letterSpacing: 2 }}>
                        {formatTime(activeSessions[selectedClient.id])}
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 400, margin: '16px auto 0' }}>
                        Puedes ir a ver a otros clientes o agregar ejercicios a otra persona. El tiempo de {firstName(selectedClient.name)} no se detendrá hasta que pulses "Finalizar".
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 40, background: 'rgba(255,255,255,0.02)', borderRadius: 20 }}>
                      <Dumbbell size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <div style={{ fontWeight: 700, color: '#fff' }}>No hay sesión activa para {firstName(selectedClient.name)}</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Presiona "Iniciar Entrenamiento" en la parte superior para comenzar el reloj.</p>
                    </div>
                  )}

                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Rutina Asignada</h3>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>+ Añadir Ejercicio</button>
                    </div>
                    {/* Tabla Mock de Ejercicios */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { name: 'Sentadilla Libre', sets: '4', reps: '8-10', weight: '80kg' },
                        { name: 'Prensa Inclinada', sets: '3', reps: '12', weight: '160kg' },
                        { name: 'Extensión de Cuádriceps', sets: '3', reps: '15', weight: '45kg' },
                      ].map((ex, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 16, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12, alignItems: 'center' }}>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{ex.name}</div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>SETS</div>
                            <div style={{ fontWeight: 800 }}>{ex.sets}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>REPS</div>
                            <div style={{ fontWeight: 800 }}>{ex.reps}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>PESO</div>
                            <input className="input-field" defaultValue={ex.weight} style={{ width: '100%', padding: '4px 8px', textAlign: 'center', fontSize: 13 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Resto de pestañas ocultas por brevedad... */}

            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
