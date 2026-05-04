import React, { useState } from 'react';
import { useGymData } from '../hooks/useGymData';
import { 
  HeartPulse, Moon, Utensils, Zap, Activity, AlertTriangle, 
  Smile, Battery, Coffee, Droplets, Info, Save
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';

/* ══════════════════════════════════════════
   ELITE RECOVERY v1.0
   Pilar 4: Recuperación y Nutrición
   Manejo de Carga Alostática (Estrés Total)
   SK-ELITE-RECOVERY-001 | 2026-05-04
══════════════════════════════════════════ */

export default function EliteRecovery() {
  const { members } = useGymData();
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // State para Carga Alostática
  const [recovery, setRecovery] = useState({
    externalStress: 5, // 1-10 (Trabajo, Familia, etc)
    trainingStress: 7, // 1-10
    sleepQuality: 8,   // 1-10
    nutritionAdherence: 9, // 1-10
    neatSteps: 8000,    // Pasos diarios
    hydration: 3,      // Litros/día
  });

  const alostaticLoad = Math.round((recovery.externalStress + recovery.trainingStress) / 2);
  const recoveryScore = Math.round((recovery.sleepQuality + recovery.nutritionAdherence + (10 - alostaticLoad)) / 3 * 10);

  const radarData = [
    { metric: 'Estrés Externo', value: recovery.externalStress * 10 },
    { metric: 'Estrés Entreno', value: recovery.trainingStress * 10 },
    { metric: 'Sueño', value: recovery.sleepQuality * 10 },
    { metric: 'Nutrición', value: recovery.nutritionAdherence * 10 },
    { metric: 'NEAT', value: Math.min(100, (recovery.neatSteps / 12000) * 100) },
  ];

  const getStatusColor = (score: number) => {
    if (score >= 80) return '#00FF88';
    if (score >= 60) return '#FFD600';
    return '#FF3D57';
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: 'var(--space-dark)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Descanso y Energía de Hoy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cómo está recuperando el cuerpo y nivel de estrés.</p>
        </div>
        <select 
          style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
          onChange={(e) => setSelectedMember(members.find((m:any) => m.id === e.target.value))}
        >
          <option value="">Seleccionar Atleta...</option>
          {members.map((m:any) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
        
        {/* Lado Izquierdo: Inputs de Recuperación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-card" style={{ padding: 32, border: '1px solid rgba(255,61,87,0.1)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Battery color="#FF3D57" /> Nivel de Estrés y Cansancio
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Estrés Externo */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span>Estrés Externo (Trabajo/Personal)</span>
                  <span style={{ color: '#fff' }}>{recovery.externalStress}/10</span>
                </label>
                <input type="range" min="1" max="10" value={recovery.externalStress} onChange={(e) => setRecovery({...recovery, externalStress: Number(e.target.value)})} style={{ width: '100%', accentColor: '#FF3D57' }} />
              </div>

              {/* Calidad de Sueño */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span>Calidad y Horas de Sueño</span>
                  <span style={{ color: '#fff' }}>{recovery.sleepQuality}/10</span>
                </label>
                <input type="range" min="1" max="10" value={recovery.sleepQuality} onChange={(e) => setRecovery({...recovery, sleepQuality: Number(e.target.value)})} style={{ width: '100%', accentColor: '#A78BFA' }} />
              </div>

              {/* Hidratación */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span>Hidratación Diaria (Litros)</span>
                  <span style={{ color: '#fff' }}>{recovery.hydration}L</span>
                </label>
                <input type="range" min="1" max="6" step="0.5" value={recovery.hydration} onChange={(e) => setRecovery({...recovery, hydration: Number(e.target.value)})} style={{ width: '100%', accentColor: '#00F0FF' }} />
              </div>

              {/* NEAT / Pasos */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span>NEAT (Pasos Diarios)</span>
                  <span style={{ color: '#fff' }}>{recovery.neatSteps.toLocaleString()} pasos</span>
                </label>
                <input type="range" min="2000" max="15000" step="500" value={recovery.neatSteps} onChange={(e) => setRecovery({...recovery, neatSteps: Number(e.target.value)})} style={{ width: '100%', accentColor: '#FFD600' }} />
              </div>

              {/* Nutrición */}
              <div style={{ padding: 20, background: 'rgba(167,139,250,0.05)', borderRadius: 16, border: '1px solid rgba(167,139,250,0.1)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#A78BFA', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Utensils size={16} /> Alimentación Sugerida</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 12, fontWeight: 700 }}>Déficit Agresivo</button>
                  <button style={{ padding: 12, borderRadius: 12, border: '1px solid var(--neon-green)', background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', fontSize: 12, fontWeight: 700 }}>Superávit Controlado</button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: 24, background: `${getStatusColor(recoveryScore)}10`, border: `1px solid ${getStatusColor(recoveryScore)}30`, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: getStatusColor(recoveryScore) }}>{recoveryScore}%</div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Energía para Entrenar</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
                {recoveryScore >= 80 ? '¡Listo para darle con todo!' : recoveryScore >= 60 ? 'Entrenamiento suave sugerido' : '🔴 Mejor descansar hoy'}
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Análisis Visual */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 20, width: '100%' }}>Radar de Bio-Disponibilidad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Radar name="Recuperación" dataKey="value" stroke={getStatusColor(recoveryScore)} fill={getStatusColor(recoveryScore)} fillOpacity={0.2} strokeWidth={3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 16 }}>⚡ Recomendaciones de Élite</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recovery.sleepQuality < 7 && (
                <div style={{ padding: 14, borderRadius: 12, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', gap: 12 }}>
                  <Moon size={18} color="#A78BFA" />
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sueño insuficiente. Reducir volumen de entrenamiento un 20% para evitar fatiga residual.</p>
                </div>
              )}
              {alostaticLoad > 7 && (
                <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.2)', display: 'flex', gap: 12 }}>
                  <AlertTriangle size={18} color="#FF3D57" />
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Carga Alostática crítica. El estrés externo está drenando tu capacidad de adaptación.</p>
                </div>
              )}
              <div style={{ padding: 14, borderRadius: 12, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', display: 'flex', gap: 12 }}>
                <Coffee size={18} color="var(--neon-green)" />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sincronización: Ingerir 50g Carbohidratos + 30g Proteína 90min post-entreno hoy.</p>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ padding: 16, borderRadius: 16, width: '100%', gap: 10 }}>
            <Save size={20} /> Actualizar Perfil de Recuperación
          </button>
        </div>
      </div>
    </div>
  );
}
