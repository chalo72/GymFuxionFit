import React, { useState } from 'react';
import {
  Dumbbell, TrendingUp, Calendar, Plus, Check, AlertCircle,
  BarChart3, Activity, Flame, Clock, Target, Award, Edit, Trash2
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/* ══════════════════════════════════════════
   ENTRENAMIENTO: DASHBOARD PROFESIONAL
   Seguimiento de sesiones, volumen e intensidad
══════════════════════════════════════════ */

interface WorkoutSession {
  id: string;
  date: string;
  program: string;
  duration: number;
  exercises: number;
  totalVolume: number; // kg * reps
  avgIntensity: number; // % de 1RM
  calories: number;
  exercises_list: { name: string; sets: number; reps: number; weight: number }[];
  completed: boolean;
  notes?: string;
}

interface TrainingProgram {
  id: string;
  name: string;
  goal: string;
  duration: number;
  weeklyFrequency: number;
  startDate: string;
  active: boolean;
  totalSessions: number;
  sessionsCompleted: number;
}

import { useClientProgress } from '../hooks/useClientProgress';

export default function TrainingDashboard() {
  const { activeProgram, sessionHistory, weeklyMetrics, trainingMetrics: metrics } = useClientProgress();
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Datos obtenidos de useClientProgress()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      padding: 24,
      backgroundColor: 'var(--space-dark)',
      color: '#fff',
      minHeight: '100vh'
    }}>

      {/* HEADER */}
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
          Entrenamiento
          <span style={{ fontSize: 16, color: 'var(--neon-green)', marginLeft: 12, fontWeight: 600 }}>
            Programa: {activeProgram.name}
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {activeProgram.goal} • {activeProgram.sessionsCompleted}/{activeProgram.totalSessions} sesiones completadas
        </p>
      </div>

      {/* MÉTRICAS DE LA SEMANA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {[
          { icon: Dumbbell, label: 'Sesiones', value: metrics.thisWeek.sessions, color: 'var(--neon-green)' },
          { icon: Clock, label: 'Horas de Entreno', value: `${metrics.thisWeek.totalHours}h`, color: '#A78BFA' },
          { icon: Flame, label: 'Intensidad Promedio', value: `${metrics.thisWeek.avgIntensity}%`, color: '#FF6B35' },
          { icon: Activity, label: 'Calorías Quemadas', value: metrics.thisWeek.totalCalories, color: '#FFD600' },
          { icon: TrendingUp, label: 'Volumen Total', value: `${(metrics.thisWeek.totalVolume / 1000).toFixed(1)}k kg`, color: 'var(--neon-green)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{
              padding: 20,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ color: stat.color }}>
                <Icon size={20} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GRÁFICOS DE PROGRESO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        {/* Volumen e Intensidad */}
        <div style={{
          padding: 24,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Tendencia Semanal: Volumen vs Intensidad</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" />
                <YAxis stroke="rgba(255,255,255,0.4)" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid var(--neon-green)',
                    borderRadius: 8
                  }}
                />
                <Legend />
                <Bar dataKey="volume" fill="var(--neon-green)" radius={[4,4,0,0]} />
                <Line type="monotone" dataKey="intensity" stroke="#FF6B35" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución de Sesiones */}
        <div style={{
          padding: 24,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Progreso del Programa</h3>
          <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--neon-green)' }}>
                {activeProgram.sessionsCompleted}/{activeProgram.totalSessions}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Sesiones Completadas</div>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(activeProgram.sessionsCompleted / activeProgram.totalSessions) * 100}%`,
                background: 'var(--neon-green)',
                boxShadow: '0 0 10px var(--neon-green)'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
              <span>Inicio</span>
              <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>
                {Math.round((activeProgram.sessionsCompleted / activeProgram.totalSessions) * 100)}%
              </span>
              <span>Meta</span>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORIAL DE SESIONES */}
      <div style={{
        padding: 24,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Historial de Sesiones</h3>
          <button style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: 'var(--neon-green)',
            color: '#000',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12
          }}>
            <Plus size={14} />
            Nueva Sesión
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessionHistory.map((session) => (
            <div key={session.id}>
              <div
                onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                style={{
                  padding: 16,
                  background: session.completed ? 'rgba(0,255,136,0.05)' : 'rgba(255,61,87,0.05)',
                  border: session.completed ? '1px solid rgba(0,255,136,0.1)' : '1px solid rgba(255,61,87,0.1)',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {session.completed ? (
                      <Check size={18} style={{ color: 'var(--neon-green)' }} />
                    ) : (
                      <AlertCircle size={18} style={{ color: '#ff4d4d' }} />
                    )}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{session.program}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{session.date}</div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginLeft: 30,
                    display: 'flex',
                    gap: 16
                  }}>
                    <span>⏱️ {session.duration} min</span>
                    <span>🏋️ {session.exercises} ejercicios</span>
                    <span>🔥 {session.calories} kcal</span>
                    <span style={{ color: 'var(--neon-green)' }}>💪 {(session.totalVolume / 1000).toFixed(1)}k kg</span>
                  </div>
                </div>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: session.avgIntensity >= 85 ? 'rgba(255,107,53,0.1)' : 'rgba(0,255,136,0.1)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: session.avgIntensity >= 85 ? '#FF6B35' : 'var(--neon-green)'
                }}>
                  {session.avgIntensity}%
                </div>
              </div>

              {/* EXPANSIÓN DE DETALLES */}
              {expandedSession === session.id && (
                <div style={{
                  marginTop: 8,
                  padding: 16,
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  gap: 20
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--neon-green)' }}>
                      Ejercicios Realizados:
                    </div>
                    {session.exercises_list.map((ex, i) => (
                      <div key={i} style={{
                        fontSize: 11,
                        padding: '6px 0',
                        borderBottom: i < session.exercises_list.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                      }}>
                        <strong>{ex.name}</strong> • {ex.sets}x{ex.reps} {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}
                      </div>
                    ))}
                  </div>
                  {session.notes && (
                    <div style={{
                      flex: 1,
                      padding: 12,
                      background: 'rgba(0,255,136,0.05)',
                      borderRadius: 8,
                      fontSize: 11,
                      color: 'var(--neon-green)',
                      borderLeft: '2px solid var(--neon-green)'
                    }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>📝 Notas:</div>
                      {session.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PRÓXIMA SESIÓN */}
      <div style={{
        padding: 24,
        background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(167,139,250,0.1) 100%)',
        border: '1px solid rgba(0,255,136,0.2)',
        borderRadius: 16
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📅 Próxima Sesión Programada</h3>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Push Day (Upper Body Strength)</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Mañana • 10:00 AM • 60 minutos • 6 ejercicios planificados
            </p>
          </div>
          <button style={{
            padding: '12px 24px',
            borderRadius: 8,
            background: 'var(--neon-green)',
            color: '#000',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none'
          }}>
            Ver Plan
          </button>
        </div>
      </div>
    </div>
  );
}
