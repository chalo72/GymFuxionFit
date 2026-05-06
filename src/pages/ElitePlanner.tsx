import React, { useState } from 'react';
import { useGymData } from '../hooks/useGymData';
import { useCatalogs } from '../hooks/useCatalogs';
import { 
  Zap, TrendingUp, Target, BarChart3, ChevronRight, 
  Dumbbell, Repeat, Layers, Info, Save, Plus, Trash2, 
  Search, Filter, Activity, Flame
} from 'lucide-react';

/* ══════════════════════════════════════════
   ELITE PLANNER v1.0
   Pilar 2: Programación de Carga (Periodización)
   Pilar 3: Selección Inteligente de Ejercicios
   SK-ELITE-PLANNER-001 | 2026-05-04
══════════════════════════════════════════ */

const PATTERNS = [
  { id: 'push', label: 'Empuje', icon: '⬆️', desc: 'Pecho, Hombro, Tríceps' },
  { id: 'pull', label: 'Tracción', icon: '⬇️', desc: 'Espalda, Bíceps' },
  { id: 'hinge', label: 'Bisagra de Cadera', icon: '🍑', desc: 'Isquios, Glúteo, Lumbar' },
  { id: 'squat', label: 'Dominante de Rodilla', icon: '🦵', desc: 'Cuádriceps, Glúteo' },
  { id: 'carry', label: 'Transporte / Core', icon: '🧱', desc: 'Estabilidad, Farmer Walk' },
];

const CURVES = [
  { id: 'stretch', label: 'Estiramiento', desc: 'Máxima tensión en rango elongado' },
  { id: 'short', label: 'Acortamiento', desc: 'Máxima tensión en contracción' },
  { id: 'mid', label: 'Rango Medio', desc: 'Tensión uniforme' },
];

export default function ElitePlanner() {
  const { members } = useGymData();
  const { catalogs } = useCatalogs();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'programming' | 'selection'>('programming');
  
  // State para Programación (Pilar 2)
  const [programming, setProgramming] = useState({
    volume: 12, // Series por músculo/semana
    objective: 'Hipertrofia Metabólica',
    mesocycleWeeks: 6,
    microcycle: 1,
    division: 'Push/Pull/Legs',
    totalSets: 18,
    rpeTarget: 8,
    intensityType: 'RPE', // RPE o RIR
    intensityValue: 8,
    frequency: 2,
    deloadWeek: 6,
  });

  // State para Selección (Pilar 3)
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExercises = catalogs.exercises.filter((ex: any) => 
    (ex.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (ex.muscleGroup || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const addExercise = (ex: any) => {
    if (!selectedExercises.find(e => e.id === ex.id)) {
      setSelectedExercises([...selectedExercises, { ...ex, sets: 3, reps: '8-12', rpe: 8, curve: 'mid' }]);
    }
  };

  const removeExercise = (id: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.id !== id));
  };

  const updateEx = (id: string, field: string, value: any) => {
    setSelectedExercises(selectedExercises.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: 'var(--space-dark)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Plan de Entrenamiento Élite</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Diseño de rutinas basadas en la estructura de cada persona.</p>
        </div>
        <select 
          style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
          onChange={(e) => setSelectedMember(members.find((m:any) => m.id === e.target.value))}
        >
          <option value="">Seleccionar Atleta...</option>
          {members.map((m:any) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        
        {/* Lado Izquierdo: Editor de Plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => setActiveTab('programming')}
              style={{ flex: 1, padding: 16, borderRadius: 16, border: 'none', cursor: 'pointer', background: activeTab === 'programming' ? 'var(--neon-green)' : 'rgba(255,255,255,0.03)', color: activeTab === 'programming' ? '#000' : '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: '0.3s' }}
            >
              <TrendingUp size={20} /> 1. Cuántas series y esfuerzo
            </button>
            <button 
              onClick={() => setActiveTab('selection')}
              style={{ flex: 1, padding: 16, borderRadius: 16, border: 'none', cursor: 'pointer', background: activeTab === 'selection' ? '#00F0FF' : 'rgba(255,255,255,0.03)', color: activeTab === 'selection' ? '#000' : '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: '0.3s' }}
            >
              <Dumbbell size={20} /> 2. Selección de Ejercicios
            </button>
          </div>

          {activeTab === 'programming' ? (
            /* PILLAR 2: PROGRAMMING */
            <div className="glass-card" style={{ padding: 32, border: '1px solid rgba(0,255,136,0.1)' }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Zap color="var(--neon-green)" /> Variables de Periodización
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                {/* Volumen */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>Volumen Semanal (Series Efectivas)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <input type="range" min="6" max="25" value={programming.volume} onChange={(e) => setProgramming({...programming, volume: Number(e.target.value)})} style={{ flex: 1, accentColor: 'var(--neon-green)' }} />
                    <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--neon-green)', width: 40 }}>{programming.volume}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Recomendado: 10-20 series para hipertrofia.</p>
                </div>

                {/* Intensidad */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>Intensidad de Esfuerzo ({programming.intensityType})</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <button onClick={() => setProgramming({...programming, intensityType: 'RPE'})} style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', background: programming.intensityType === 'RPE' ? 'rgba(0,255,136,0.1)' : 'transparent', color: programming.intensityType === 'RPE' ? 'var(--neon-green)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>RPE</button>
                    <button onClick={() => setProgramming({...programming, intensityType: 'RIR'})} style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', background: programming.intensityType === 'RIR' ? 'rgba(0,255,136,0.1)' : 'transparent', color: programming.intensityType === 'RIR' ? 'var(--neon-green)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>RIR</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <input type="range" min={programming.intensityType === 'RPE' ? 5 : 0} max={programming.intensityType === 'RPE' ? 10 : 4} step="0.5" value={programming.intensityValue} onChange={(e) => setProgramming({...programming, intensityValue: Number(e.target.value)})} style={{ flex: 1, accentColor: 'var(--neon-green)' }} />
                    <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--neon-green)', width: 40 }}>{programming.intensityValue}</span>
                  </div>
                </div>

                {/* Frecuencia */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>Frecuencia Semanal por Músculo</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[1, 2, 3].map(f => (
                      <button key={f} onClick={() => setProgramming({...programming, frequency: f})} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${programming.frequency === f ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}`, background: programming.frequency === f ? 'rgba(0,255,136,0.05)' : 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Frecuencia {f}</button>
                    ))}
                  </div>
                </div>

                {/* Nuevos campos de configuración */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>OBJETIVO DEL CICLO</label>
                    <select className="input-field" value={programming.objective} onChange={e => setProgramming({...programming, objective: e.target.value})} style={{width: '100%'}}>
                      <option value="Hipertrofia Metabólica">Hipertrofia Metabólica</option>
                      <option value="Fuerza Máxima">Fuerza Máxima</option>
                      <option value="Recomposición">Recomposición Corporal</option>
                      <option value="Peaking">Peaking / Competición</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>DURACIÓN MESOCICLO (Semanas)</label>
                    <input type="number" className="input-field" value={programming.mesocycleWeeks} onChange={e => setProgramming({...programming, mesocycleWeeks: Number(e.target.value)})} style={{width: '100%'}} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>DIVISIÓN DE RUTINA</label>
                  <input className="input-field" value={programming.division} onChange={e => setProgramming({...programming, division: e.target.value})} placeholder="Ej: Torso/Pierna" style={{width: '100%'}} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>SEMANA DE DELOAD</label>
                  <input type="number" className="input-field" value={programming.deloadWeek} onChange={e => setProgramming({...programming, deloadWeek: Number(e.target.value)})} style={{width: '100%'}} />
                </div>
              </div>

              <div style={{ marginTop: 32, padding: 20, background: 'rgba(0,255,136,0.03)', borderRadius: 16, border: '1px solid rgba(0,255,136,0.1)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--neon-green)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><Info size={16} /> Resumen Científico</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Estás programando un volumen de <strong style={{color:'#fff'}}>{programming.volume} series</strong> con una intensidad <strong style={{color:'#fff'}}>{programming.intensityType} {programming.intensityValue}</strong>. 
                  Esto genera un estímulo óptimo para la hipertrofia miofibrilar sin comprometer la recuperación del sistema nervioso central (SNC).
                </p>
              </div>
            </div>
          ) : (
            /* PILLAR 3: EXERCISE SELECTION */
            <div className="glass-card" style={{ padding: 32, border: '1px solid rgba(0,240,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Layers color="#00F0FF" /> Selección Inteligente de Ejercicios
                </h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedExercises.length} seleccionados</div>
              </div>

              {/* Ejercicios Seleccionados Table */}
              {selectedExercises.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '2px dashed rgba(255,255,255,0.05)' }}>
                  <Dumbbell size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                  <p style={{ color: 'var(--text-muted)' }}>No has seleccionado ejercicios aún. Busca en el panel de la derecha.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedExercises.map((ex, idx) => (
                    <div key={ex.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 100px 40px', gap: 12, alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{idx + 1}. {ex.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ex.muscleGroup} | {ex.equipment}</div>
                      </div>
                      <input className="input-field" value={ex.sets} onChange={(e) => updateEx(ex.id, 'sets', e.target.value)} style={{ padding: '6px 10px', textAlign: 'center' }} placeholder="Sets" />
                      <input className="input-field" value={ex.reps} onChange={(e) => updateEx(ex.id, 'reps', e.target.value)} style={{ padding: '6px 10px', textAlign: 'center' }} placeholder="Reps" />
                      <select className="input-field" value={ex.curve} onChange={(e) => updateEx(ex.id, 'curve', e.target.value)} style={{ padding: '6px 10px', fontSize: 11 }}>
                        <option value="stretch">Estiramiento</option>
                        <option value="mid">Medio</option>
                        <option value="short">Acortado</option>
                      </select>
                      <button onClick={() => removeExercise(ex.id)} style={{ background: 'none', border: 'none', color: 'var(--danger-red)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 24, padding: 20, background: 'rgba(0,240,255,0.03)', borderRadius: 16, border: '1px solid rgba(0,240,255,0.1)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#00F0FF', marginBottom: 12 }}>Análisis de Patrones de Movimiento</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  {PATTERNS.map(p => {
                    const count = selectedExercises.filter(e => e.pattern === p.id).length;
                    return (
                      <div key={p.id} style={{ flex: 1, textAlign: 'center', padding: 10, borderRadius: 12, background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: 18 }}>{p.icon}</div>
                        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', marginTop: 4 }}>{p.label.toUpperCase()}</div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: count > 0 ? '#00F0FF' : 'rgba(255,255,255,0.1)' }}>{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lado Derecho: Buscador de Ejercicios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 20, height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
            <div style={{ position: 'sticky', top: 0, background: 'var(--space-dark)', zIndex: 10, paddingBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Search size={18} /> Catálogo de Atletas</h3>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Buscar ejercicio..." 
                  className="input-field" 
                  style={{ width: '100%', paddingLeft: 40 }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredExercises.map((ex: any) => (
                <div 
                  key={ex.id} 
                  onClick={() => addExercise(ex)}
                  style={{ 
                    padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: '0.2s' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                >
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{ex.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ex.muscleGroup}</span>
                    <Plus size={14} color="#00F0FF" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: 16, borderRadius: 16, gap: 10, boxShadow: '0 0 20px rgba(0,255,136,0.3)' }}>
            <Save size={20} /> Guardar Plan Élite
          </button>
        </div>

      </div>
    </div>
  );
}
