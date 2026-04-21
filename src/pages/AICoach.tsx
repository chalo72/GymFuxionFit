import { useState } from 'react';
import {
  Zap, Brain, Target, TrendingUp, Play, Clock, BarChart3,
  CheckCircle2, RefreshCw, Dumbbell, Heart, Activity, Award,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const workoutPlans = [
  {
    id: 1,
    title: 'HYROX Elite Protocol',
    level: 'Elite',
    duration: '75 min',
    calories: 680,
    color: '#FF6B35',
    ai_score: 97,
    exercises: [
      { name: 'SkiErg', sets: 1, reps: '1000m', weight: 'Máx Resistencia' },
      { name: 'Sled Push', sets: 1, reps: '50m', weight: '102 kg' },
      { name: 'Sled Pull', sets: 1, reps: '50m', weight: '78 kg' },
      { name: 'Burpees Broad Jump', sets: 1, reps: '80m', weight: 'Corporal' },
      { name: 'Rowing', sets: 1, reps: '1000m', weight: 'Máx Potencia' },
      { name: 'Farmer Carry', sets: 1, reps: '200m', weight: '2x24 kg' },
    ],
  },
  {
    id: 2,
    title: 'Fuerza Funcional Pro',
    level: 'Intermedio',
    duration: '55 min',
    calories: 420,
    color: '#00FF88',
    ai_score: 91,
    exercises: [
      { name: 'Sentadilla Trasera', sets: 4, reps: '6', weight: '85 kg' },
      { name: 'Press de Banca', sets: 4, reps: '8', weight: '70 kg' },
      { name: 'Peso Muerto', sets: 3, reps: '5', weight: '110 kg' },
      { name: 'Press Militar', sets: 3, reps: '10', weight: '50 kg' },
      { name: 'Remo con Barra', sets: 4, reps: '10', weight: '65 kg' },
    ],
  },
  {
    id: 3,
    title: 'Cardio HIIT Recovery',
    level: 'Básico',
    duration: '30 min',
    calories: 280,
    color: '#A78BFA',
    ai_score: 85,
    exercises: [
      { name: 'Salto de Cuerda', sets: 3, reps: '3 min', weight: 'Corporal' },
      { name: 'Mountain Climbers', sets: 4, reps: '30 seg', weight: 'Corporal' },
      { name: 'Box Jumps', sets: 3, reps: '12', weight: 'Corporal' },
      { name: 'Sprint 400m', sets: 4, reps: '1', weight: 'Máx Velocidad' },
    ],
  },
];

const performanceData = [
  { subject: 'Fuerza', A: 88, fullMark: 100 },
  { subject: 'Resistencia', A: 92, fullMark: 100 },
  { subject: 'Velocidad', A: 75, fullMark: 100 },
  { subject: 'Flexibilidad', A: 62, fullMark: 100 },
  { subject: 'Potencia', A: 84, fullMark: 100 },
  { subject: 'Recuperación', A: 79, fullMark: 100 },
];

const progressData = [
  { week: 'S1', strength: 70, cardio: 65, hyrox: 60 },
  { week: 'S2', strength: 73, cardio: 68, hyrox: 65 },
  { week: 'S3', strength: 76, cardio: 72, hyrox: 70 },
  { week: 'S4', strength: 79, cardio: 74, hyrox: 74 },
  { week: 'S5', strength: 82, cardio: 78, hyrox: 79 },
  { week: 'S6', strength: 85, cardio: 80, hyrox: 83 },
  { week: 'S7', strength: 86, cardio: 83, hyrox: 85 },
  { week: 'S8', strength: 88, cardio: 85, hyrox: 88 },
];

const aiSessions = [
  { member: 'Alex G.', session: 'HYROX Elite', score: 97, duration: '75 min', status: 'completed' },
  { member: 'María L.', session: 'Fuerza Funcional', score: 91, duration: '55 min', status: 'active' },
  { member: 'Andrés M.', session: 'Cardio HIIT', score: 85, duration: '30 min', status: 'pending' },
  { member: 'Valentina T.', session: 'HYROX Elite', score: 94, duration: '75 min', status: 'completed' },
];

export default function AICoach() {
  const [selectedPlan, setSelectedPlan] = useState(workoutPlans[0]);
  const [activeTab, setActiveTab] = useState<'plans' | 'performance' | 'sessions'>('plans');

  return (
    <div className="animate-fade-in">
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            AI Coach <span style={{ color: 'var(--neon-green)', fontSize: '1rem', marginLeft: 8 }}>FitBot 2.0</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Planes de entrenamiento generados y monitoreados por Inteligencia Artificial
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary">
            <RefreshCw size={16} />
            Generar Plan IA
          </button>
          <button className="btn btn-primary">
            <Brain size={16} />
            Análisis Deep
          </button>
        </div>
      </div>

      {/* ─── KPIs ─── */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        <div className="kpi-card cyan animate-fade-in animate-delay-1">
          <div className="kpi-icon cyan"><Activity size={20} /></div>
          <div className="kpi-label">Sesiones IA Activas</div>
          <div className="kpi-value">185</div>
          <div className="kpi-change positive"><TrendingUp size={12} /> +12% hoy</div>
        </div>
        <div className="kpi-card orange animate-fade-in animate-delay-2">
          <div className="kpi-icon orange"><Target size={20} /></div>
          <div className="kpi-label">Efectividad Media</div>
          <div className="kpi-value">91%</div>
          <div className="kpi-change positive"><TrendingUp size={12} /> +3.2%</div>
        </div>
        <div className="kpi-card green animate-fade-in animate-delay-3">
          <div className="kpi-icon green"><Award size={20} /></div>
          <div className="kpi-label">Planes Completados</div>
          <div className="kpi-value">1,247</div>
          <div className="kpi-change positive"><TrendingUp size={12} /> este mes</div>
        </div>
        <div className="kpi-card animate-fade-in animate-delay-4">
          <div className="kpi-icon cyan"><Heart size={20} /></div>
          <div className="kpi-label">FC Promedio</div>
          <div className="kpi-value">142 bpm</div>
          <div className="kpi-change positive"><TrendingUp size={12} /> zona óptima</div>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="chart-tabs" style={{ marginBottom: 20, width: 'fit-content' }}>
        {(['plans', 'performance', 'sessions'] as const).map((tab) => (
          <button
            key={tab}
            className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'plans' ? 'Planes de Entreno' : tab === 'performance' ? 'Rendimiento' : 'Sesiones en Vivo'}
          </button>
        ))}
      </div>

      {activeTab === 'plans' && (
        <div className="dashboard-grid">
          {/* ─── SELECTOR DE PLANES ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {workoutPlans.map((plan) => (
              <div
                key={plan.id}
                className="workout-card"
                onClick={() => setSelectedPlan(plan)}
                style={{
                  borderColor: selectedPlan.id === plan.id ? plan.color + '60' : undefined,
                  background: selectedPlan.id === plan.id ? `${plan.color}08` : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{plan.title}</div>
                    <span style={{
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                      padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      background: `${plan.color}15`, color: plan.color,
                    }}>
                      {plan.level}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--neon-green)' }}>
                      {plan.ai_score}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>AI Score</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {plan.duration}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={12} /> {plan.calories} kcal
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ─── DETALLE DEL PLAN ─── */}
          <div className="glass-card">
            <div className="glass-card-header">
              <div>
                <div className="glass-card-title">{selectedPlan.title}</div>
                <div className="glass-card-subtitle">
                  {selectedPlan.exercises.length} ejercicios · {selectedPlan.duration} · {selectedPlan.calories} kcal
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-full)', padding: '8px 20px' }}
              >
                <Play size={14} />
                Iniciar
              </button>
            </div>

            {/* AI Score bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  AI Compatibility Score
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--neon-green)' }}>
                  {selectedPlan.ai_score}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${selectedPlan.ai_score}%` }} />
              </div>
            </div>

            {/* Exercises list */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {selectedPlan.exercises.map((ex, i) => (
                <div key={i} className="exercise-row">
                  <div className="exercise-number">{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{ex.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                      {ex.sets > 1 ? `${ex.sets} series × ` : ''}{ex.reps}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    background: 'var(--green-10)', color: 'var(--neon-green)',
                  }}>
                    {ex.weight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="dashboard-grid">
          {/* ─── RADAR PERFORMANCE ─── */}
          <div className="glass-card">
            <div className="glass-card-title" style={{ marginBottom: 4 }}>Perfil de Rendimiento</div>
            <div className="glass-card-subtitle" style={{ marginBottom: 20 }}>Alex Guerrero — Elite HYROX</div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                  <PolarGrid stroke="rgba(0,255,136,0.12)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600 }}
                  />
                  <Radar
                    name="Rendimiento"
                    dataKey="A"
                    stroke="#00FF88"
                    fill="#00FF88"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
              {performanceData.map((d, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '10px', background: 'var(--space-medium)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--neon-green)' }}>{d.A}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{d.subject}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── PROGRESO TEMPORAL ─── */}
          <div className="glass-card">
            <div className="glass-card-title" style={{ marginBottom: 4 }}>Evolución 8 Semanas</div>
            <div className="glass-card-subtitle" style={{ marginBottom: 20 }}>Progreso por categoría</div>
            <div className="chart-container" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="strengthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FF88" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cardioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="hyroxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="strength" name="Fuerza" stroke="#00FF88" strokeWidth={2} fill="url(#strengthGrad)" dot={false} />
                  <Area type="monotone" dataKey="cardio" name="Cardio" stroke="#FF6B35" strokeWidth={2} fill="url(#cardioGrad)" dot={false} />
                  <Area type="monotone" dataKey="hyrox" name="HYROX" stroke="#A78BFA" strokeWidth={2} fill="url(#hyroxGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              {[{ label: 'Fuerza', color: '#00FF88' }, { label: 'Cardio', color: '#FF6B35' }, { label: 'HYROX', color: '#A78BFA' }].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: 'inline-block' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,255,136,0.06)' }}>
            <div className="glass-card-title">Sesiones en Tiempo Real</div>
            <div className="glass-card-subtitle">Miembros entrenando ahora con AI Coach</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Sesión</th>
                <th>AI Score</th>
                <th>Duración</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {aiSessions.map((s, i) => (
                <tr key={i}>
                  <td>
                    <div className="member-cell">
                      <div className="member-avatar">{s.member.split(' ').map(n => n[0]).join('')}</div>
                      <span style={{ fontWeight: 600 }}>{s.member}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.session}</td>
                  <td>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>{s.score}%</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> {s.duration}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${s.status === 'completed' ? 'active' : s.status === 'active' ? 'active' : 'pending'}`}>
                      {s.status === 'active' ? <Activity size={10} style={{ animation: 'pulse 1s infinite' }} /> : <CheckCircle2 size={10} />}
                      {s.status === 'completed' ? 'Completada' : s.status === 'active' ? 'En curso' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
