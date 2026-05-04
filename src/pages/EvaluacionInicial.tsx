import React, { useState } from 'react';
import { useGymData } from '../hooks/useGymData';
import { User, Activity, Target, ChevronRight, ChevronLeft, CheckCircle2, Save, Ruler, Weight, Percent, Heart, Zap, Trophy } from 'lucide-react';

/* ══════════════════════════════════════════
   EVALUACIÓN INICIAL DIGITAL v1.0
   Wizard de 4 pasos para onboarding del atleta
   Basado en: Manual Maestro de Entrenadores FuxionFit
   SK-EVAL-001 | 2026-05-04
══════════════════════════════════════════ */

const STEPS = [
  { id: 1, title: 'Datos Básicos', icon: User, color: '#00FF88' },
  { id: 2, title: 'Medidas del Cuerpo', icon: Weight, color: '#00F0FF' },
  { id: 3, title: 'Cómo se mueve', icon: Activity, color: '#FFD600' },
  { id: 4, title: 'Pruebas de Fuerza', icon: Zap, color: '#FF6B35' },
  { id: 5, title: 'Objetivo y Plan', icon: Target, color: '#A78BFA' },
];

const OBJECTIVES = [
  { id: 'musculacion', label: 'Musculación', emoji: '💪', desc: 'Ganar masa muscular y fuerza' },
  { id: 'perdida_peso', label: 'Pérdida de Peso', emoji: '🔥', desc: 'Reducir grasa corporal' },
  { id: 'resistencia', label: 'Resistencia', emoji: '🏃', desc: 'Mejorar capacidad aeróbica' },
  { id: 'funcional', label: 'Funcional / CrossFit', emoji: '⚡', desc: 'Rendimiento y agilidad' },
  { id: 'rehabilitacion', label: 'Rehabilitación', emoji: '🩺', desc: 'Recuperación de lesiones' },
  { id: 'mantenimiento', label: 'Mantenimiento', emoji: '⚖️', desc: 'Mantener condición actual' },
];

const PLANS = ['Diario', 'Semanal', 'Mensual Básico', 'Mensual Pro', 'Mensual HYROX', 'Élite FuxionFit'];

interface EvalData {
  // Paso 1
  name: string; phone: string; email: string; age: string; emergencyContact: string; emergencyPhone: string;
  // Paso 2
  height: string; weight: string; bodyFat: string; waist: string; chest: string; hips: string;
  // Paso 3 (Bio-Mecánica)
  mobilityAnkle: string; mobilityHip: string; mobilityThoracic: string; mobilityShoulders: string; coreStability: string; bracingAbility: string; posturalCompensations: string; clinicalHistory: string; femurLength: string; armLength: string; techniqueNotes: string;
  // Paso 4
  pushups: string; squats: string; plankTime: string; vo2est: string; injuries: string; notes: string;
  // Paso 5
  objective: string; plan: string; trainer: string; daysPerWeek: string;
}

export default function EvaluacionInicial() {
  const { addMember, updateMemberStatus, members, staff } = useGymData();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<EvalData>({
    name: '', phone: '', email: '', age: '', emergencyContact: '', emergencyPhone: '',
    height: '', weight: '', bodyFat: '', waist: '', chest: '', hips: '',
    mobilityAnkle: 'Normal', mobilityHip: 'Normal', mobilityThoracic: 'Normal', mobilityShoulders: 'Normal', coreStability: 'Estable', bracingAbility: 'Bueno', posturalCompensations: '', clinicalHistory: '', femurLength: '', armLength: '', techniqueNotes: '',
    pushups: '', squats: '', plankTime: '', vo2est: '', injuries: '', notes: '',
    objective: '', plan: 'Mensual Básico', trainer: '', daysPerWeek: '3',
  });

  // Cargar miembro si viene de una selección (vía localStorage o similar para simplificar sin Router params ahora)
  React.useEffect(() => {
    const pendingId = localStorage.getItem('pending_eval_id');
    if (pendingId) {
      const m = members.find(mx => mx.id === pendingId);
      if (m) {
        setSelectedMemberId(pendingId);
        setData(prev => ({
          ...prev,
          name: m.name || '',
          phone: m.phone || '',
          email: m.email || '',
          plan: m.plan || 'Mensual Básico'
        }));
      }
      localStorage.removeItem('pending_eval_id');
    }
  }, [members]);

  const update = (field: keyof EvalData, value: string) => setData(prev => ({ ...prev, [field]: value }));

  const imc = data.weight && data.height ? (Number(data.weight) / Math.pow(Number(data.height) / 100, 2)).toFixed(1) : null;
  const imcLabel = imc ? Number(imc) < 18.5 ? 'Bajo Peso' : Number(imc) < 25 ? '✅ Normal' : Number(imc) < 30 ? '⚠️ Sobrepeso' : '🔴 Obesidad' : null;

  const trainers = staff ? staff.filter((s: any) => s.status === 'active') : [];
  
  const handleFinish = async () => {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const evalPayload = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      status: 'active' as const,
      plan: data.plan,
      expiryDate: expiryDate.toISOString().split('T')[0],
      debt: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      height: Number(data.height),
      weight: Number(data.weight),
      bodyFat: Number(data.bodyFat),
      trainer: data.trainer,
      objective: data.objective,
      injuries: data.injuries,
      emergencyContact: data.emergencyContact,
      emergencyPhone: data.emergencyPhone,
      mobilityAnkle: data.mobilityAnkle,
      mobilityHip: data.mobilityHip,
      mobilityThoracic: data.mobilityThoracic,
      mobilityShoulders: data.mobilityShoulders,
      coreStability: data.coreStability,
      bracingAbility: data.bracingAbility,
      posturalCompensations: data.posturalCompensations,
      clinicalHistory: data.clinicalHistory,
      femurLength: data.femurLength,
      armLength: data.armLength,
      techniqueNotes: data.techniqueNotes,
      notes: data.notes,
      joined: new Date().toISOString().split('T')[0],
      biometricStatus: 'completed' as const
    };

    if (selectedMemberId) {
      await updateMemberStatus(selectedMemberId, evalPayload);
    } else {
      await addMember(evalPayload);
    }
    setSaved(true);
  };

  const accentColor = STEPS[step - 1].color;
  const StepIcon = STEPS[step - 1].icon;

  if (saved) return (
    <div style={{ padding: 40, minHeight: '100vh', background: 'var(--space-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 80, marginBottom: 24 }}>🏆</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#00FF88', marginBottom: 12 }}>¡Atleta Registrado!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          <strong style={{ color: '#fff' }}>{data.name}</strong> ha sido ingresado al sistema con su evaluación física completa. Puede ver su expediente en el módulo de Miembros.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Plan', value: data.plan },
            { label: 'Objetivo', value: OBJECTIVES.find(o => o.id === data.objective)?.label || 'General' },
            { label: 'Entrenador', value: data.trainer || 'Sin asignar' },
            { label: 'Salud Bio-Mecánica', value: data.mobilityAnkle === 'Normal' && data.mobilityHip === 'Normal' ? 'Óptima' : 'Requiere Ajustes' },
            { label: 'IMC', value: imc ? `${imc} (${imcLabel})` : 'No registrado' },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <button onClick={() => { setSaved(false); setStep(1); setData({ name: '', phone: '', email: '', age: '', emergencyContact: '', emergencyPhone: '', height: '', weight: '', bodyFat: '', waist: '', chest: '', hips: '', mobilityAnkle: 'Normal', mobilityHip: 'Normal', mobilityThoracic: 'Normal', mobilityShoulders: 'Normal', coreStability: 'Estable', bracingAbility: 'Bueno', posturalCompensations: '', clinicalHistory: '', femurLength: '', armLength: '', techniqueNotes: '', pushups: '', squats: '', plankTime: '', vo2est: '', injuries: '', notes: '', objective: '', plan: 'Mensual Básico', trainer: '', daysPerWeek: '3' }); }} className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: 12, fontSize: 15 }}>
          + Registrar Otro Atleta
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: 'var(--space-dark)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Evaluación Inicial del Atleta</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Protocolo oficial FuxionFit — Onboarding digital completo</p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36, background: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? '#00FF88' : isActive ? s.color : 'rgba(255,255,255,0.06)', border: isActive ? `2px solid ${s.color}` : isDone ? '2px solid #00FF88' : '2px solid rgba(255,255,255,0.1)', transition: 'all 0.3s', boxShadow: isActive ? `0 0 20px ${s.color}40` : 'none' }}>
                  {isDone ? <CheckCircle2 size={20} color="#000" /> : <Icon size={20} color={isActive ? '#000' : 'rgba(255,255,255,0.3)'} />}
                </div>
                <span style={{ fontSize: 11, fontWeight: isActive ? 800 : 500, color: isActive ? s.color : isDone ? '#00FF88' : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: step > s.id ? '#00FF88' : 'rgba(255,255,255,0.06)', margin: '0 8px', marginTop: -20, transition: 'background 0.3s' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="glass-card" style={{ padding: 32, border: `1px solid ${accentColor}25`, borderRadius: 20, maxWidth: 700, margin: '0 auto', boxShadow: `0 0 40px ${accentColor}10` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accentColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${accentColor}30` }}>
            <StepIcon size={24} color={accentColor} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: accentColor, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Paso {step} de 5</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{STEPS[step - 1].title}</div>
          </div>
        </div>

        {/* PASO 1: Datos Personales */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Nombre completo *" value={data.name} onChange={v => update('name', v)} placeholder="Ej: Carlos Rodríguez" span={2} />
              <Field label="Teléfono" value={data.phone} onChange={v => update('phone', v)} placeholder="+57 300 000 0000" />
              <Field label="Correo electrónico" value={data.email} onChange={v => update('email', v)} placeholder="correo@mail.com" />
              <Field label="Edad" value={data.age} onChange={v => update('age', v)} placeholder="25" type="number" />
              <div />
              <Field label="Contacto de emergencia" value={data.emergencyContact} onChange={v => update('emergencyContact', v)} placeholder="Mamá / Esposa..." />
              <Field label="Teléfono de emergencia" value={data.emergencyPhone} onChange={v => update('emergencyPhone', v)} placeholder="+57 300..." />
            </div>
          </div>
        )}

        {/* PASO 2: Evaluación Física */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <Field label="Talla (cm)" value={data.height} onChange={v => update('height', v)} type="number" placeholder="175" icon={<Ruler size={14} color={accentColor} />} />
              <Field label="Peso (kg)" value={data.weight} onChange={v => update('weight', v)} type="number" placeholder="75" icon={<Weight size={14} color={accentColor} />} />
              <Field label="% Grasa Corporal" value={data.bodyFat} onChange={v => update('bodyFat', v)} type="number" placeholder="18" icon={<Percent size={14} color={accentColor} />} />
              <Field label="Cintura (cm)" value={data.waist} onChange={v => update('waist', v)} type="number" placeholder="82" />
              <Field label="Pecho (cm)" value={data.chest} onChange={v => update('chest', v)} type="number" placeholder="100" />
              <Field label="Cadera (cm)" value={data.hips} onChange={v => update('hips', v)} type="number" placeholder="98" />
            </div>
            {imc && (
              <div style={{ padding: 16, borderRadius: 12, background: Number(imc) < 25 ? 'rgba(0,255,136,0.05)' : 'rgba(255,107,53,0.08)', border: `1px solid ${Number(imc) < 25 ? 'rgba(0,255,136,0.2)' : 'rgba(255,107,53,0.3)'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: Number(imc) < 25 ? '#00FF88' : '#FF6B35' }}>{imc}</div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Índice de Masa Corporal</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{imcLabel}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3: Bio-Mecánica y Funcional */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Análisis profundo de la estructura y movimiento del atleta (Pilar 1 de Élite).</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Movilidad de Tobillo</label>
                <select className="input-field" value={data.mobilityAnkle} onChange={e => update('mobilityAnkle', e.target.value)} style={{ width: '100%' }}>
                  <option>Limitada</option><option>Normal</option><option>Excelente</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Movilidad de Cadera</label>
                <select className="input-field" value={data.mobilityHip} onChange={e => update('mobilityHip', e.target.value)} style={{ width: '100%' }}>
                  <option>Limitada</option><option>Normal</option><option>Excelente</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Movilidad Torácica</label>
                <select className="input-field" value={data.mobilityThoracic} onChange={e => update('mobilityThoracic', e.target.value)} style={{ width: '100%' }}>
                  <option>Limitada</option><option>Normal</option><option>Excelente</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Estabilidad del Core</label>
                <select className="input-field" value={data.coreStability} onChange={e => update('coreStability', e.target.value)} style={{ width: '100%' }}>
                  <option>Inestable</option><option>Estable</option><option>Muy Estable</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Habilidad de Bracing</label>
                <select className="input-field" value={data.bracingAbility} onChange={e => update('bracingAbility', e.target.value)} style={{ width: '100%' }}>
                  <option>Pobre</option><option>Bueno</option><option>Experto</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Longitud Fémur (cm)" value={data.femurLength} onChange={v => update('femurLength', v)} placeholder="Ej: 45" />
              <Field label="Longitud Brazos (cm)" value={data.armLength} onChange={v => update('armLength', v)} placeholder="Ej: 60" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Análisis de Técnica (Estructura Ósea, ancho pies, etc.)</label>
              <textarea className="input-field" value={data.techniqueNotes} onChange={e => update('techniqueNotes', e.target.value)} rows={3} placeholder="Ej: Acetábulo profundo requiere mayor ancho de pies en sentadilla..." style={{ width: '100%', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Historial Clínico</label>
              <textarea className="input-field" value={data.clinicalHistory} onChange={e => update('clinicalHistory', e.target.value)} rows={2} placeholder="Cirugías, fracturas, patologías..." style={{ width: '100%', resize: 'vertical' }} />
            </div>
          </div>
        )}

        {/* PASO 4: Test de Condición */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Realiza los tests físicos con el atleta y registra los resultados para establecer su punto de partida.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Flexiones máximas (reps)" value={data.pushups} onChange={v => update('pushups', v)} type="number" placeholder="0" icon={<Zap size={14} color="#FF6B35" />} />
              <Field label="Sentadillas máximas (reps)" value={data.squats} onChange={v => update('squats', v)} type="number" placeholder="0" icon={<Zap size={14} color="#FF6B35" />} />
              <Field label="Plancha (segundos)" value={data.plankTime} onChange={v => update('plankTime', v)} type="number" placeholder="0" icon={<Activity size={14} color="#FF6B35" />} />
              <Field label="VO2 max estimado (opcional)" value={data.vo2est} onChange={v => update('vo2est', v)} placeholder="35 ml/kg/min" icon={<Heart size={14} color="#FF6B35" />} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Lesiones o condiciones médicas actuales</label>
              <textarea className="input-field" value={data.injuries} onChange={e => update('injuries', e.target.value)} rows={3} placeholder="Rodilla izquierda operada (2024), dolor lumbar crónico..." style={{ width: '100%', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Notas adicionales del entrenador</label>
              <textarea className="input-field" value={data.notes} onChange={e => update('notes', e.target.value)} rows={2} placeholder="Observaciones generales..." style={{ width: '100%', resize: 'vertical' }} />
            </div>
          </div>
        )}

        {/* PASO 5: Objetivo y Plan */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>Objetivo Principal del Atleta</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {OBJECTIVES.map(obj => (
                  <button key={obj.id} onClick={() => update('objective', obj.id)} style={{ padding: '14px 10px', borderRadius: 14, border: `2px solid ${data.objective === obj.id ? '#A78BFA' : 'rgba(255,255,255,0.08)'}`, background: data.objective === obj.id ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', boxShadow: data.objective === obj.id ? '0 0 20px rgba(167,139,250,0.2)' : 'none' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{obj.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: data.objective === obj.id ? '#A78BFA' : '#fff' }}>{obj.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{obj.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Plan de Membresía</label>
                <select className="input-field" value={data.plan} onChange={e => update('plan', e.target.value)} style={{ width: '100%' }}>
                  {PLANS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Entrenador Asignado</label>
                <select className="input-field" value={data.trainer} onChange={e => update('trainer', e.target.value)} style={{ width: '100%' }}>
                  <option value="">Sin asignar</option>
                  {trainers.map((t: any) => <option key={t.id} value={t.name}>{t.name} — {t.role}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Días de entrenamiento por semana</label>
                <select className="input-field" value={data.daysPerWeek} onChange={e => update('daysPerWeek', e.target.value)} style={{ width: '100%' }}>
                  {['2', '3', '4', '5', '6'].map(d => <option key={d} value={d}>{d} días/semana</option>)}
                </select>
              </div>
            </div>

            {/* Resumen */}
            <div style={{ padding: 16, borderRadius: 14, background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', marginBottom: 10 }}>📋 RESUMEN DE EVALUACIÓN</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                {[
                  { k: 'Atleta', v: data.name || '—' },
                  { k: 'Objetivo', v: OBJECTIVES.find(o => o.id === data.objective)?.label || '—' },
                  { k: 'Peso / Talla', v: data.weight && data.height ? `${data.weight}kg / ${data.height}cm` : '—' },
                  { k: 'IMC', v: imc ? `${imc} (${imcLabel})` : '—' },
                  { k: 'Plan', v: data.plan },
                  { k: 'Entrenador', v: data.trainer || 'Sin asignar' },
                ].map(item => (
                  <div key={item.k} style={{ display: 'flex', gap: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.k}:</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="btn btn-secondary" style={{ padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ChevronLeft size={18} /> Atrás
            </button>
          )}
          {step < 5 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn btn-primary" style={{ flex: 1, padding: '14px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 800, boxShadow: `0 0 20px ${accentColor}40` }} disabled={step === 1 && !data.name.trim()}>
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleFinish} className="btn btn-primary" style={{ flex: 1, padding: '14px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 800, background: 'linear-gradient(135deg, #00FF88, #00D4FF)', color: '#000', boxShadow: '0 0 30px rgba(0,255,136,0.4)' }} disabled={!data.name || !data.objective}>
              <Save size={18} /> Registrar Atleta al Sistema
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Campo reutilizable ─── */
function Field({ label, value, onChange, placeholder, type = 'text', span, icon }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; span?: number; icon?: React.ReactNode;
}) {
  return (
    <div style={{ gridColumn: span === 2 ? '1 / -1' : undefined }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        {icon} {label}
      </label>
      <input
        type={type}
        className="input-field"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%' }}
      />
    </div>
  );
}
