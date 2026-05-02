import React, { useState } from 'react';
import { X, Search, Plus, Trash2, Zap, Dumbbell, Activity, Flame, ChevronRight, Check } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'hyrox';
  icon: React.ReactNode;
  defaultSets: string;
  defaultReps: string;
}

import { EXERCISE_CATALOG } from '../../data/premiumCatalogs';

const EXERCISE_LIBRARY: Exercise[] = EXERCISE_CATALOG.map(ex => ({
  id: ex.id,
  name: ex.name,
  category: ex.muscleGroup === 'Cuerpo Completo' ? 'hyrox' : (ex.equipment.includes('Cardio') ? 'cardio' : 'strength'),
  icon: ex.muscleGroup === 'Cuerpo Completo' ? <Flame size={16}/> : (ex.equipment.includes('Cardio') ? <Activity size={16}/> : <Dumbbell size={16}/>),
  defaultSets: ex.difficulty === 'Avanzado' ? '5' : '4',
  defaultReps: ex.equipment === 'Peso Corporal' ? '15' : '10',
}));

interface FlashProgramBuilderProps {
  onClose: () => void;
  athleteName: string;
}

export default function FlashProgramBuilder({ onClose, athleteName }: FlashProgramBuilderProps) {
  const [selectedExercises, setSelectedExercises] = useState<(Exercise & { sets: string, reps: string, weight: string })[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'strength' | 'cardio' | 'hyrox'>('all');

  const addExercise = (ex: Exercise) => {
    setSelectedExercises([...selectedExercises, { ...ex, sets: ex.defaultSets, reps: ex.defaultReps, weight: '' }]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, key: 'sets' | 'reps' | 'weight', val: string) => {
    const newExs = [...selectedExercises];
    newExs[index][key] = val;
    setSelectedExercises(newExs);
  };

  const filteredLibrary = EXERCISE_LIBRARY.filter(ex => 
    (filter === 'all' || ex.category === filter) && 
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="flash-builder-modal" style={{
        width: '100%', maxWidth: 1000, minHeight: '85vh',
        background: 'var(--space-dark)', borderRadius: 24, border: '1px solid var(--green-20)',
        display: 'grid', gridTemplateColumns: '320px 1fr', overflow: 'hidden',
        boxShadow: '0 0 80px rgba(0,255,136,0.15)'
      }}>
        
        {/* LIBRERÍA (Izquierda) */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--neon-green)', letterSpacing: 1.5, marginBottom: 15 }}>LIBRERÍA DE ÉLITE</div>
            <div style={{ position: 'relative', marginBottom: 15 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
              <input 
                className="input-field" 
                placeholder="Buscar ejercicio..." 
                style={{ width: '100%', paddingLeft: 36, fontSize: 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'strength', 'cardio', 'hyrox'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    flex: 1, padding: '6px', borderRadius: 8, fontSize: 10, fontWeight: 800,
                    background: filter === f ? 'var(--green-15)' : 'rgba(255,255,255,0.04)',
                    color: filter === f ? 'var(--neon-green)' : 'var(--text-muted)',
                    border: 'none', cursor: 'pointer', textTransform: 'uppercase'
                  }}
                >
                  {f === 'all' ? 'Ver Todo' : f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            {filteredLibrary.map(ex => (
              <button 
                key={ex.id}
                onClick={() => addExercise(ex)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12, background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center', gap: 12, color: '#fff', cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ex.icon}
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{ex.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ex.category.toUpperCase()}</div>
                </div>
                <Plus size={14} style={{ color: 'var(--neon-green)' }}/>
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE (Derecha) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 4 }}>PROGRAMA PARA:</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--neon-green)' }}>{athleteName.toUpperCase()}</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: 8, borderRadius: '50%', cursor: 'pointer' }}>
              <X size={20}/>
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {selectedExercises.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.5 }}>
                 <Zap size={48} style={{ marginBottom: 16 }}/>
                 <div style={{ fontWeight: 700 }}>ARRASTRA O SELECCIONA EJERCICIOS PARA COMENZAR</div>
                 <div style={{ fontSize: 12 }}>Diseña programas en segundos con Flash Builder</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedExercises.map((ex, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 100px 40px',
                    gap: 12, padding: '16px', background: 'rgba(255,255,255,0.03)',
                    borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center'
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--green-40)' }}>{i+1}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{ex.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ex.category.toUpperCase()}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 800 }}>SERIES</label>
                      <input className="input-field" value={ex.sets} onChange={e => updateExercise(i, 'sets', e.target.value)} style={{ padding: '6px', fontSize: 12, textAlign: 'center' }}/>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 800 }}>REPS</label>
                      <input className="input-field" value={ex.reps} onChange={e => updateExercise(i, 'reps', e.target.value)} style={{ padding: '6px', fontSize: 12, textAlign: 'center' }}/>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 800 }}>CARGA</label>
                      <input className="input-field" value={ex.weight} placeholder="Ej: 80kg" onChange={e => updateExercise(i, 'weight', e.target.value)} style={{ padding: '6px', fontSize: 12, color: 'var(--neon-green)', fontWeight: 800 }}/>
                    </div>
                    <button onClick={() => removeExercise(i)} style={{ background: 'none', border: 'none', color: 'var(--danger-red)', cursor: 'pointer', padding: 8 }}>
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: 24, background: 'rgba(0,0,0,0.2)', display: 'flex', gap: 12 }}>
             <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>DESCARTAR</button>
             <button 
                onClick={() => { alert(`Programa Guardado y Enviado a ${athleteName}`); onClose(); }}
                disabled={selectedExercises.length === 0}
                style={{ 
                  flex: 2, padding: '14px', borderRadius: 12, 
                  background: selectedExercises.length === 0 ? 'rgba(255,255,255,0.08)' : 'linear-gradient(90deg, #00FF88, #00CC6A)', 
                  color: '#000', border: 'none', fontWeight: 950, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: selectedExercises.length === 0 ? 'none' : '0 10px 40px rgba(0,255,136,0.3)'
                }}
             >
                <Check size={18}/> GUARDAR Y ENVIAR AL ATLETA
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
