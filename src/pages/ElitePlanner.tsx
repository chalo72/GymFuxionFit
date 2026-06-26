import React, { useState, useMemo } from 'react';
import { useGymData } from '../hooks/useGymData';
import { useCatalogs } from '../hooks/useCatalogs';
import { 
  Zap, TrendingUp, Target, BarChart3, ChevronRight, 
  Dumbbell, Repeat, Layers, Info, Save, Plus, Trash2, 
  Search, Filter, Activity, Flame, Check, AlertTriangle, Play, GripVertical
} from 'lucide-react';

/* ══════════════════════════════════════════
   ELITE PLANNER v2.0 - HUD TÁCTICO
   Pilar 2: Programación y Fatiga
   Pilar 3: Selección de Ejercicios
══════════════════════════════════════════ */

const PATTERNS = [
  { id: 'push', label: 'Empuje', icon: '⬆️' },
  { id: 'pull', label: 'Tracción', icon: '⬇️' },
  { id: 'hinge', label: 'Bisagra', icon: '🍑' },
  { id: 'squat', label: 'Rodilla', icon: '🦵' },
  { id: 'carry', label: 'Core', icon: '🧱' },
];

type BlockId = 'warmup' | 'main' | 'accessory';

interface SelectedExercise {
  id: string; // Unique ID for the instance in the block
  exId: string; // ID from catalog
  name: string;
  muscleGroup: string;
  equipment: string;
  pattern: string;
  sets: number;
  reps: string;
  rpe: number;
  curve: string;
  block: BlockId;
}

export default function ElitePlanner() {
  const { members, updateMemberStatus } = useGymData();
  const { catalogs } = useCatalogs();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'programming' | 'selection' | 'evidence'>('selection');
  
  // Real UI States
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectSuccess, setInjectSuccess] = useState(false);
  
  // Programming State
  const [programming, setProgramming] = useState({
    objective: 'Hipertrofia',
    mesocycleWeeks: 6,
    division: 'Push/Pull/Legs',
  });

  // Exercises State
  const [exercises, setExercises] = useState<SelectedExercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('Todos');

  const filteredCatalog = catalogs.exercises.filter((ex: any) => {
    const matchesSearch = (ex.name || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesMuscle = filterMuscle === 'Todos' || ex.muscleGroup === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const addExercise = (ex: any, block: BlockId) => {
    const newEx: SelectedExercise = {
      id: `${ex.id}-${Date.now()}`,
      exId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      pattern: ex.pattern || 'push',
      sets: 3,
      reps: '10',
      rpe: 8,
      curve: 'mid',
      block
    };
    setExercises([...exercises, newEx]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const updateEx = (id: string, field: keyof SelectedExercise, value: any) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // ─── LÓGICA DE FATIGA MUSCULAR ───
  const fatigueData = useMemo(() => {
    const muscleVolume: Record<string, number> = {};
    exercises.forEach(ex => {
      const vol = Number(ex.sets) || 0;
      muscleVolume[ex.muscleGroup] = (muscleVolume[ex.muscleGroup] || 0) + vol;
    });

    // Validar si hay músculos en "Peligro" (> 12 series en una sola sesión)
    const warnings = Object.entries(muscleVolume)
      .filter(([_, vol]) => vol > 12)
      .map(([m]) => m);

    return { muscleVolume, warnings };
  }, [exercises]);

  const renderBlock = (blockId: BlockId, title: string, color: string) => {
    const blockExercises = exercises.filter(e => e.block === blockId);
    
    return (
      <div style={{ marginBottom: 32, background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: `1px solid ${color}30`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: `${color}15`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h3>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 20 }}>
            {blockExercises.length} EJERCICIOS
          </span>
        </div>
        
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 120 }}>
          {blockExercises.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}>
              Arrastra o asigna ejercicios a este bloque
            </div>
          ) : (
            blockExercises.map((ex, i) => (
              <div key={ex.id} style={{ display: 'flex', gap: 16, background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: '12px 16px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                <GripVertical size={20} color="var(--text-muted)" style={{ cursor: 'grab' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>{i + 1}. {ex.name}</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, color: 'var(--text-muted)' }}>{ex.muscleGroup.toUpperCase()}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>SERIES</label>
                    <input type="number" value={ex.sets} onChange={(e) => updateEx(ex.id, 'sets', Number(e.target.value))} className="input-field" style={{ width: 60, padding: '8px', textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>REPS</label>
                    <input value={ex.reps} onChange={(e) => updateEx(ex.id, 'reps', e.target.value)} className="input-field" style={{ width: 80, padding: '8px', textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>CURVA</label>
                    <select value={ex.curve} onChange={(e) => updateEx(ex.id, 'curve', e.target.value)} className="input-field" style={{ width: 110, padding: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)' }}>
                      <option value="stretch">Estiramiento</option>
                      <option value="mid">Rango Medio</option>
                      <option value="short">Acortamiento</option>
                    </select>
                  </div>
                  <button onClick={() => removeExercise(ex.id)} style={{ background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.2)', color: 'var(--danger-red)', padding: 10, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ─── LÓGICA DE INYECCIÓN REAL ───
  const handleInjectRoutine = async () => {
    if (!selectedMember) return alert('Debes seleccionar un atleta primero.');
    if (exercises.length === 0) return alert('No hay ejercicios en la pizarra para inyectar.');

    setIsInjecting(true);
    
    // Simulate slight network delay for premium feel even though local is fast
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const activeProgram = {
        updatedAt: new Date().toISOString(),
        exercises: exercises
      };
      await updateMemberStatus(selectedMember.id, { activeProgram });
      
      setIsInjecting(false);
      setInjectSuccess(true);
      setExercises([]); // Clear the board
      
      setTimeout(() => setInjectSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error al inyectar la rutina.');
      setIsInjecting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--navbar-height) - 56px)', minHeight: 600 }}>
      {/* ─── HEADER ELITE ─── */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(0,255,136,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--space-dark)', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap color="var(--neon-green)" /> Elite Planner <span style={{ fontSize: '1rem', color: 'var(--neon-green)', fontWeight: 600 }}>HUD Táctico</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Diseño de rutinas con análisis predictivo de fatiga y curvas de resistencia.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <select 
            value={selectedMember?.id || ''}
            onChange={(e) => setSelectedMember(members.find(m => m.id === e.target.value))}
            style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', fontWeight: 700 }}
          >
            <option value="" style={{ color: '#000' }}>Seleccionar Atleta...</option>
            {members.map(m => <option key={m.id} value={m.id} style={{ color: '#000' }}>{m.name} - {m.plan}</option>)}
          </select>
          <button 
            onClick={handleInjectRoutine} 
            disabled={isInjecting || injectSuccess}
            className="btn btn-primary" 
            style={{ 
              padding: '12px 24px', fontSize: '1rem', boxShadow: injectSuccess ? '0 0 20px rgba(0,255,136,0.6)' : '0 0 20px rgba(0,255,136,0.2)',
              background: injectSuccess ? 'var(--neon-green)' : undefined, color: injectSuccess ? '#000' : undefined,
              transition: 'all 0.3s'
            }}>
            {isInjecting ? (
              <><Activity size={18} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} /> Sincronizando...</>
            ) : injectSuccess ? (
              <><Check size={18} style={{ marginRight: 8 }} /> ¡Rutina Inyectada!</>
            ) : (
              <><Save size={18} style={{ marginRight: 8 }} /> Inyectar Rutina</>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* ══════════ PIZARRA TÁCTICA (IZQUIERDA) ══════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--space-medium)' }}>
          {/* MEDIDOR DE FATIGA */}
          <div style={{ padding: '20px 32px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 1 }}>SISTEMA DE MONITOREO DE CARGA (SERIES TOTALES)</h3>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {Object.keys(fatigueData.muscleVolume).length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay datos de carga. Añade ejercicios.</span>}
              {Object.entries(fatigueData.muscleVolume).map(([muscle, vol]) => {
                const isDanger = vol > 12;
                return (
                  <div key={muscle} style={{ 
                    padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
                    background: isDanger ? 'rgba(255,61,87,0.15)' : 'rgba(255,255,255,0.05)',
                    border: isDanger ? '1px solid var(--danger-red)' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isDanger ? '0 0 15px rgba(255,61,87,0.3)' : 'none'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isDanger ? 'var(--danger-red)' : '#fff' }}>{muscle.toUpperCase()}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: isDanger ? 'var(--danger-red)' : 'var(--neon-green)' }}>{vol}</span>
                  </div>
                );
              })}
            </div>
            {fatigueData.warnings.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger-red)' }}>
                <AlertTriangle size={16} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>¡PELIGRO DE SOBREENTRENAMIENTO! Estás programando más de 12 series para: {fatigueData.warnings.join(', ')}.</span>
              </div>
            )}
          </div>

          {/* LIENZO DE BLOQUES */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            {!selectedMember ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.5 }}>
                <Target size={60} style={{ marginBottom: 20 }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Lienzo Desactivado</h2>
                <p>Selecciona un atleta en el panel superior para comenzar a armar su bloque táctico.</p>
              </div>
            ) : (
              <>
                <div 
                  onDragOver={(e) => e.preventDefault()} 
                  onDrop={(e) => {
                    e.preventDefault();
                    const exData = e.dataTransfer.getData('application/json');
                    if (exData) addExercise(JSON.parse(exData), 'warmup');
                  }}
                >
                  {renderBlock('warmup', 'Fase 1: Activación & Calentamiento', '#FFD600')}
                </div>
                <div 
                  onDragOver={(e) => e.preventDefault()} 
                  onDrop={(e) => {
                    e.preventDefault();
                    const exData = e.dataTransfer.getData('application/json');
                    if (exData) addExercise(JSON.parse(exData), 'main');
                  }}
                >
                  {renderBlock('main', 'Fase 2: Bloque de Fuerza Principal', '#00FF88')}
                </div>
                <div 
                  onDragOver={(e) => e.preventDefault()} 
                  onDrop={(e) => {
                    e.preventDefault();
                    const exData = e.dataTransfer.getData('application/json');
                    if (exData) addExercise(JSON.parse(exData), 'accessory');
                  }}
                >
                  {renderBlock('accessory', 'Fase 3: Hipertrofia Accesoria', '#A78BFA')}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ══════════ CATÁLOGO INTERACTIVO (DERECHA) ══════════ */}
        <div style={{ width: 380, flexShrink: 0, background: 'rgba(20, 20, 25, 0.95)', borderLeft: '1px solid rgba(0,255,136,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>Arsenal de Ejercicios</h3>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input 
                type="text" 
                placeholder="Buscar ejercicio o músculo..." 
                className="input-field" 
                style={{ width: '100%', paddingLeft: 40, background: 'rgba(255,255,255,0.05)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              {['Todos', 'Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazos', 'Abdomen'].map(m => (
                <button 
                  key={m} 
                  onClick={() => setFilterMuscle(m)}
                  style={{ 
                    padding: '6px 16px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap',
                    background: filterMuscle === m ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)',
                    color: filterMuscle === m ? '#000' : 'var(--text-primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >{m}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredCatalog.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 20 }}>
                No hay ejercicios. (Si está vacío, revisa la configuración).
              </div>
            )}
            {filteredCatalog.map((ex: any) => (
              <div 
                key={ex.id} 
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(ex));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                style={{ 
                  background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', 
                  overflow: 'hidden', transition: 'all 0.2s', cursor: 'grab', flexShrink: 0
                }}
              >
                <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 64, height: 64, borderRadius: 12, background: 'rgba(255,255,255,0.05)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                  }}>
                    {ex.imageUrl ? (
                      <img src={ex.imageUrl} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <GripVertical size={20} color="var(--text-muted)" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>{ex.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div><span style={{ color: '#A78BFA', fontWeight: 600 }}>{ex.muscleGroup}</span> • {ex.equipment}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {ex.difficulty && (
                          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem' }}>
                            {ex.difficulty}
                          </span>
                        )}
                        {ex.pattern && (
                          <span style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem' }}>
                            {ex.pattern.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button onClick={() => addExercise(ex, 'warmup')} style={{ flex: 1, padding: '10px 0', border: 'none', background: 'rgba(255,214,0,0.1)', color: '#FFD600', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>+ ACT</button>
                  <button onClick={() => addExercise(ex, 'main')} style={{ flex: 1, padding: '10px 0', border: 'none', background: 'rgba(0,255,136,0.1)', borderLeft: '1px solid rgba(0,0,0,0.2)', borderRight: '1px solid rgba(0,0,0,0.2)', color: 'var(--neon-green)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>+ FUERZA</button>
                  <button onClick={() => addExercise(ex, 'accessory')} style={{ flex: 1, padding: '10px 0', border: 'none', background: 'rgba(167,139,250,0.1)', color: '#A78BFA', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>+ ACCES.</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
