import { useState, useMemo, useEffect } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';

// Tipos mejorados para personalización
type Level = 'Principiante' | 'Intermedio' | 'Avanzado' | 'Elite Atleta';

type Routine = { 
  ejercicio: string; 
  emoji: string; 
  descripcion: string; 
  series: string; 
  reps: string; 
  consejo: string; 
  visualUrl?: string; 
  scaling?: Record<Level, { series: string; reps: string; consejo: string }>;
};

// 📚 OMNI-DATABASE: LIBRERÍA MASIVA DE RUTINAS TÉCNICAS
const routinesLibrary: Record<string, { id: string; name: string; exercises: Routine[] }[]> = {
  hyrox: [
    {
      id: 'h-1',
      name: 'Hyrox Pro (Oficial)',
      exercises: [
        { 
          emoji: '🏃', ejercicio: 'Run 1km', descripcion: 'Transición aeróbica.', series: '1', reps: '1000m', consejo: 'Z3 ritmo crucero', visualUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=400',
          scaling: { 'Principiante': { series: '1', reps: '500m', consejo: 'Trote suave.' }, 'Intermedio': { series: '1', reps: '1000m', consejo: 'Ritmo estable.' }, 'Avanzado': { series: '1', reps: '1000m', consejo: 'Sub 4:30.' }, 'Elite Atleta': { series: '1', reps: '1000m', consejo: 'Sub 3:45.' } }
        },
        { 
          emoji: '🚲', ejercicio: 'SkiErg', descripcion: 'Simulación de esquí.', series: '1', reps: '1000m', consejo: 'Usa el core', visualUrl: 'https://images.unsplash.com/photo-1590239098569-e611dc313aff?q=80&w=400',
          scaling: { 'Principiante': { series: '1', reps: '500m', consejo: 'Técnica pulcra.' }, 'Intermedio': { series: '1', reps: '1000m', consejo: 'Potencia media.' }, 'Avanzado': { series: '1', reps: '1000m', consejo: 'Resistencia alta.' }, 'Elite Atleta': { series: '1', reps: '1000m', consejo: 'Explosión total.' } }
        }
      ]
    },
    {
      id: 'h-2',
      name: 'Potencia de Empuje (Trineo)',
      exercises: [
        { emoji: '🛷', ejercicio: 'Sled Push 50m', descripcion: 'Empuje frontal bajo.', series: '3', reps: '50m', consejo: 'Pasos explosivos', visualUrl: 'https://images.unsplash.com/photo-1599058917233-35f91f1c7e7e?q=80&w=400', scaling: { 'Principiante': { series: '2', reps: '25m', consejo: 'Empuje alto.' }, 'Intermedio': { series: '3', reps: '50m', consejo: 'Carga media.' }, 'Avanzado': { series: '4', reps: '50m', consejo: 'Carga pesada.' }, 'Elite Atleta': { series: '5', reps: '50m', consejo: 'Carga máxima.' } } }
      ]
    }
  ],
  strength: [
    {
      id: 's-1',
      name: 'Levantamiento Olímpico',
      exercises: [
        { 
          emoji: '🏋️', ejercicio: 'Snatch (Arrancada)', descripcion: 'Levantamiento en un tiempo.', series: '5', reps: '3', consejo: 'Extensión total', visualUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400',
          scaling: { 'Principiante': { series: '3', reps: '5 (Técnica barra)', consejo: 'Paciencia en el tirón.' }, 'Intermedio': { series: '5', reps: '3 (Carga media)', consejo: 'Velocidad de pies.' }, 'Avanzado': { series: '6', reps: '2 (Carga alta)', consejo: 'Fuerza explosiva.' }, 'Elite Atleta': { series: '8', reps: '1 (Max PR)', consejo: 'Concentración total.' } }
        },
        { emoji: '💪', ejercicio: 'Clean & Jerk', descripcion: 'Dos tiempos técnico.', series: '5', reps: '3', consejo: 'Recupera pies', visualUrl: 'https://images.unsplash.com/photo-1541534741688-6078c65b5a33?q=80&w=400' }
      ]
    }
  ],
  cardio: [
    {
      id: 'c-1',
      name: 'WOD CrossFit "MetCon"',
      exercises: [
        { emoji: '🔥', ejercicio: 'Kettlebell Swings', descripcion: 'Balanceo ruso/americano.', series: '5', reps: '20', consejo: 'Usa la cadera', visualUrl: 'https://images.unsplash.com/photo-1508215885129-467b35259bb7?q=80&w=400' },
        { emoji: '📦', ejercicio: 'Box Jumps', descripcion: 'Saltos explosivos.', series: '4', reps: '15', consejo: 'Aterriza arriba', visualUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400' }
      ]
    }
  ],
  yoga: [
    {
      id: 'y-1',
      name: 'Movilidad Articular Pro',
      exercises: [
        { emoji: '🦎', ejercicio: 'World\'s Greatest Stretch', descripcion: 'Estiramiento integral.', series: '3', reps: '8 per side', consejo: 'Gira el tronco', visualUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400' },
        { emoji: '🧜', ejercicio: 'Pigeon Pose', descripcion: 'Apertura de cadera.', series: '2', reps: '1 min', consejo: 'Suelta la tensión', visualUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400' }
      ]
    }
  ],
  combat: [
    {
      id: 'co-1',
      name: 'Power Boxing / Combat',
      exercises: [
        { emoji: '🥊', ejercicio: 'Shadow Boxing (Pesas)', descripcion: 'Sombra con mancuernas 1kg.', series: '4', reps: '3 min', consejo: 'Brazo extendido', visualUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=400', scaling: { 'Principiante': { series: '2', reps: '2 min (Sin peso)', consejo: 'Enfócate en la rotación.' }, 'Intermedio': { series: '4', reps: '3 min', consejo: 'Mantén la guardia.' }, 'Avanzado': { series: '6', reps: '3 min', consejo: 'Aumenta explosividad.' }, 'Elite Atleta': { series: '8', reps: '3 min', consejo: 'Intensidad de sparing.' } } },
        { emoji: '🔥', ejercicio: 'Sprawl + Knee Strike', descripcion: 'Defensa de derribo + rodilla.', series: '3', reps: '20', consejo: 'Cadera al suelo', visualUrl: 'https://images.unsplash.com/photo-1508215885129-467b35259bb7?q=80&w=400' }
      ]
    }
  ],
  functional: [
    {
      id: 'f-1',
      name: 'Agilidad & Coordinación',
      exercises: [
        { emoji: '🪜', ejercicio: 'Ladder Drills', descripcion: 'Escalera de agilidad.', series: '5', reps: '4 laps', consejo: 'Puntas de pies', visualUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400' },
        { emoji: '🎾', ejercicio: 'Reaction Ball', descripcion: 'Reflejos con pelota.', series: '4', reps: '2 min', consejo: 'Mantente alerta', visualUrl: 'https://images.unsplash.com/photo-1541534741688-6078c65b5a33?q=80&w=400' }
      ]
    }
  ]
};

const levelConfig: Record<Level, { color: string; bg: string; icon: string }> = {
  'Principiante': { color: '#00FF88', bg: 'rgba(0,255,136,0.1)', icon: '🟢' },
  'Intermedio': { color: '#00F0FF', bg: 'rgba(0,240,255,0.1)', icon: '🟡' },
  'Avanzado': { color: '#FF9900', bg: 'rgba(255,153,0,0.1)', icon: '🔴' },
  'Elite Atleta': { color: '#FF3D57', bg: 'rgba(255,61,87,0.1)', icon: '🏆' }
};

type ClassBlock = {
  id: number; name: string; subtitulo: string; instructor: string; time: string; duration: string;
  capacity: number; enrolled: number; type: string; color: string; image: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado'; description: string;
  beneficios: string[]; equipo: string[];
};

const classesData: ClassBlock[] = [
  { id: 1, name: 'HYROX Challenge', subtitulo: 'Carrera + Estaciones Pro', instructor: 'Coach Alex', time: '06:00', duration: '60 min', capacity: 20, enrolled: 18, type: 'hyrox', color: '#FF6B35', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', nivel: 'Avanzado', description: 'Entrenamiento oficial.', beneficios: ['Fuerza'], equipo: ['Trineo'] },
  { id: 2, name: 'Fuerza: Push Day', subtitulo: 'Hipertrofia de Empuje', instructor: 'Coach María', time: '08:00', duration: '50 min', capacity: 12, enrolled: 9, type: 'strength', color: '#00F0FF', image: 'https://images.unsplash.com/photo-1541534741688-6078c65b5a33?q=80&w=600', nivel: 'Intermedio', description: 'Powerlifting y más.', beneficios: ['Masa Muscular'], equipo: ['Rack'] },
  { id: 3, name: 'Animal Flow', subtitulo: 'Movilidad Primitiva', instructor: 'Coach Diego', time: '10:00', duration: '45 min', capacity: 15, enrolled: 7, type: 'cardio', color: '#00E676', image: 'https://images.unsplash.com/photo-1599058917233-35f91f1c7e7e?q=80&w=600', nivel: 'Intermedio', description: 'Control corporal total.', beneficios: ['Flexibilidad'], equipo: ['Mat'] },
  { id: 4, name: 'Yoga Restore', subtitulo: 'Recuperación Muscular', instructor: 'Coach Sofía', time: '17:00', duration: '60 min', capacity: 20, enrolled: 12, type: 'yoga', color: '#A78BFA', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600', nivel: 'Principiante', description: 'Relajación profunda.', beneficios: ['Zen'], equipo: ['Blocks'] },
];

const typeLabels: Record<string, string> = { hyrox: 'HYROX', strength: 'FUERZA', cardio: 'CARDIO', yoga: 'YOGA' };

function ClassDetailModal({ cls, onClose }: { cls: ClassBlock; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [activeRoutineIdx, setActiveRoutineIdx] = useState(0);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level>('Intermedio');

  const availableRoutines = routinesLibrary[cls.type] || [];
  const currentRoutineSet = availableRoutines[activeRoutineIdx];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 350); };

  return (
    <div onClick={handleClose} className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: visible ? 'rgba(5,7,5,0.98)' : 'rgba(0,0,0,0)', backdropFilter: visible ? 'blur(25px)' : 'blur(0px)', transition: 'all 0.4s', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 1100, maxHeight: '94vh', background: 'var(--space-dark)', borderRadius: 32, border: `1px solid ${cls.color}50`, overflow: 'hidden', display: 'flex', flexDirection: 'column', transform: visible ? 'scale(1)' : 'scale(0.95)', opacity: visible ? 1 : 0, transition: 'all 0.5s', boxShadow: `0 40px 120px rgba(0,0,0,0.9)` }}>
        
        {/* HEADER PERSONALIZADO POR NIVEL */}
        <div style={{ position: 'relative', height: 200, flexShrink: 0 }}>
          <img src={cls.image} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 32, right: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
             <div>
               <h1 style={{ fontSize: 42, fontWeight: 900 }}>{cls.name}</h1>
               <p style={{ color: cls.color, fontWeight: 700, fontSize: 14 }}>Personalizando para: <span style={{ color: levelConfig[selectedLevel].color }}>{levelConfig[selectedLevel].icon} {selectedLevel.toUpperCase()}</span></p>
             </div>
             <button onClick={handleClose} style={{ padding: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff' }}><X size={20} /></button>
          </div>
        </div>

        {/* SELECTOR DE NIVEL (PERSONALIZACIÓN EN TIEMPO REAL) */}
        <div style={{ padding: '20px 32px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 20 }}>
           <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Escalar Nivel:</span>
           <div style={{ display: 'flex', gap: 10 }}>
             {(Object.keys(levelConfig) as Level[]).map(lvl => (
               <button 
                 key={lvl}
                 onClick={() => setSelectedLevel(lvl)}
                 style={{ 
                   padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s',
                   background: selectedLevel === lvl ? levelConfig[lvl].color : 'rgba(255,255,255,0.05)',
                   color: selectedLevel === lvl ? '#000' : 'var(--text-secondary)',
                   border: `1px solid ${selectedLevel === lvl ? levelConfig[lvl].color : 'transparent'}`
                 }}
               >
                 {levelConfig[lvl].icon} {lvl}
               </button>
             ))}
           </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex' }}>
           {/* Sidebar Rutinas */}
           <div style={{ width: 280, background: 'rgba(255,255,255,0.01)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: 24 }}>
             <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>Planes Disponibles</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
               {availableRoutines.map((r, i) => (
                 <button key={r.id} onClick={() => setActiveRoutineIdx(i)} style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 16, background: activeRoutineIdx === i ? `${cls.color}15` : 'transparent', border: `1px solid ${activeRoutineIdx === i ? cls.color : 'rgba(255,255,255,0.05)'}`, color: activeRoutineIdx === i ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{r.name}</button>
               ))}
             </div>
           </div>

           {/* Lista de Ejercicios ESCALADOS */}
           <div style={{ flex: 1, padding: 32 }}>
              <div style={{ borderLeft: `4px solid ${levelConfig[selectedLevel].color}`, paddingLeft: 20, marginBottom: 30 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900 }}>{currentRoutineSet?.name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Ajustando intensidad técnica y volumen para perfil <b>{selectedLevel}</b>.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {currentRoutineSet?.exercises.map((ex, i) => {
                   const isExp = expandedExercise === i;
                   // Lógica de escalamiento
                   const scale = ex.scaling?.[selectedLevel] || { series: ex.series, reps: ex.reps, consejo: ex.consejo };
                   
                   return (
                     <div key={i} onClick={() => setExpandedExercise(isExp ? null : i)} style={{ background: isExp ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', borderRadius: 20, border: `1px solid ${isExp ? levelConfig[selectedLevel].color : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.3s', cursor: 'pointer' }}>
                        <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                           <div style={{ width: 50, height: 50, background: `${levelConfig[selectedLevel].color}20`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{ex.emoji}</div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 16, fontWeight: 800 }}>{ex.ejercicio}</div>
                              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                 <span style={{ fontSize: 12, color: levelConfig[selectedLevel].color, fontWeight: 800 }}>{scale.series} SERIES</span>
                                 <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{scale.reps} REPS</span>
                              </div>
                           </div>
                           <ChevronDown size={18} style={{ transform: isExp ? 'rotate(180deg)' : '' }} />
                        </div>
                        {isExp && (
                          <div style={{ padding: '0 20px 20px 20px', display: 'flex', gap: 20 }}>
                             <img src={ex.visualUrl} style={{ width: 150, height: 150, borderRadius: 16, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                             <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{ex.descripcion}</p>
                                <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: `${levelConfig[selectedLevel].bg}`, border: `1px solid ${levelConfig[selectedLevel].color}30`, color: levelConfig[selectedLevel].color }}>
                                   <div style={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Guía {selectedLevel}</div>
                                   <div style={{ fontSize: 13, fontStyle: 'italic' }}>"{scale.consejo}"</div>
                                </div>
                             </div>
                          </div>
                        )}
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function Classes() {
  const [detailClass, setDetailClass] = useState<ClassBlock | null>(null);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Clases de Hoy</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>Entrenamiento Inteligente y Personalizado por Nivel</p>
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> Nueva Clase</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
        {classesData.map((cls) => (
          <div key={cls.id} onClick={() => setDetailClass(cls)} className="glass-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', border: `1px solid rgba(255,255,255,0.05)`, background: 'rgba(15,20,15,0.6)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = cls.color + '70'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
            <div style={{ height: 160, position: 'relative' }}>
              <img src={cls.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                 <div style={{ fontSize: 10, fontWeight: 900, color: cls.color, textTransform: 'uppercase', letterSpacing: 2 }}>{typeLabels[cls.type]}</div>
                 <h3 style={{ fontSize: 22, fontWeight: 900 }}>{cls.name}</h3>
              </div>
            </div>
            <div style={{ padding: 20 }}>
               <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 15 }}>{cls.subtitulo}</p>
               <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                 <div style={{ width: `${Math.round((cls.enrolled / cls.capacity) * 100)}%`, height: '100%', background: cls.color }} />
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                 <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cls.enrolled}/{cls.capacity} Alumnos</span>
                 <span style={{ fontSize: 11, fontWeight: 800, color: cls.color }}>PERSONALIZAR RUTINA →</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {detailClass && <ClassDetailModal cls={detailClass} onClose={() => setDetailClass(null)} />}
    </div>
  );
}

