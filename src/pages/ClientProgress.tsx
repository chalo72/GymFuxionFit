import React, { useState } from 'react';
import {
  TrendingUp, Calendar, Zap, Apple, Target, Clock,
  CheckCircle2, AlertCircle, Award, BarChart3, Flame,
  Users, MessageSquare, Download
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

/* ══════════════════════════════════════════
   CLIENTE: DASHBOARD DE PROGRESO
   Vista profesional del trabajo realizado
══════════════════════════════════════════ */

interface WorkoutSession {
  date: string;
  exercises: number;
  duration: number;
  intensity: number;
  calories: number;
  completed: boolean;
}

interface NutritionDay {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  adherence: number;
}

import { useClientProgress } from '../hooks/useClientProgress';

export default function ClientProgress() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month');
  const { clientData, workoutHistory, metrics, nutritionHistory } = useClientProgress();

  // Datos obtenidos del hook useClientProgress

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, backgroundColor: 'var(--space-dark)', color: '#fff', minHeight: '100vh' }}>
      
      {/* ══════════ HEADER ══════════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
            Mi Progreso
            <span style={{ fontSize: 16, color: 'var(--neon-green)', marginLeft: 12, fontWeight: 600 }}>
              {selectedPeriod === 'month' ? 'Últimos 30 días' : 'Última semana'}
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Miembro desde {clientData.memberSince} • Meta: {clientData.currentGoal}
          </p>
        </div>
        <button style={{
          padding: '10px 16px',
          borderRadius: 8,
          background: 'var(--neon-green)',
          color: '#000',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: 'none'
        }}>
          <Download size={16} />
          Descargar Reporte
        </button>
      </div>

      {/* ══════════ TARJETAS DE MÉTRICAS PRINCIPALES ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { icon: <Zap size={20} />, label: 'Sesiones Completadas', value: `${metrics.totalSessions}`, color: 'var(--neon-green)' },
          { icon: <Clock size={20} />, label: 'Horas de Entrenamiento', value: `${metrics.totalHours}h`, color: '#A78BFA' },
          { icon: <Flame size={20} />, label: 'Racha Actual', value: `${metrics.currentStreak}d`, color: '#FF6B35' },
          { icon: <Apple size={20} />, label: 'Nutrición (Adherencia)', value: `${metrics.nutritionAdherence}%`, color: '#FFD600' },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: 20,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ GRÁFICOS PRINCIPALES ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        
        {/* Tendencia de Entrenamiento */}
        <div style={{
          padding: 24,
          background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(0,255,136,0.1)',
          borderRadius: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Tendencia de Entrenamiento</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['week', 'month'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: selectedPeriod === period ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)',
                    color: selectedPeriod === period ? '#000' : '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  {period === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={workoutHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" />
                <YAxis stroke="rgba(255,255,255,0.4)" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid var(--neon-green)',
                    borderRadius: 8
                  }}
                  formatter={(value) => [`${value}`, 'Calorías']}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="var(--neon-green)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--neon-green)', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,255,136,0.1)', borderRadius: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--neon-green)', fontWeight: 600 }}>
              📊 Promedio semanal: <strong>485 calorías/sesión</strong> • Intensidad: <strong>{metrics.avgIntensity}%</strong>
            </p>
          </div>
        </div>

        {/* Distribución Macronutrientes */}
        <div style={{
          padding: 24,
          background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,215,0,0.1)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Nutrición (Semana)</h3>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Proteína', value: 35 },
                    { name: 'Carbohidratos', value: 50 },
                    { name: 'Grasas', value: 15 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="var(--neon-green)" />
                  <Cell fill="#FFD600" />
                  <Cell fill="#FF6B35" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Proteína', color: 'var(--neon-green)', pct: 35 },
              { label: 'Carbohidratos', color: '#FFD600', pct: 50 },
              { label: 'Grasas', color: '#FF6B35', pct: 15 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                <span style={{ fontSize: 12, flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ HISTÓRICO DETALLADO ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* Sesiones */}
        <div style={{
          padding: 24,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Últimas Sesiones</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {workoutHistory.slice(0, 5).map((session, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                background: session.completed ? 'rgba(0,255,136,0.05)' : 'rgba(255,61,87,0.05)',
                border: session.completed ? '1px solid rgba(0,255,136,0.1)' : '1px solid rgba(255,61,87,0.1)',
                borderRadius: 10
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
                  {session.completed ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--neon-green)' }} />
                  ) : (
                    <AlertCircle size={18} style={{ color: '#ff4d4d' }} />
                  )}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{session.date}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {session.exercises} ejercicios • {session.duration} min • {session.calories} kcal
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.1)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: session.intensity >= 85 ? '#FF6B35' : 'var(--neon-green)'
                }}>
                  {session.intensity}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logros */}
        <div style={{
          padding: 24,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Logros y Hitos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🏆', label: 'Racha de 12 días consecutivos', date: 'Hoy', color: '#FFD600' },
              { icon: '💪', label: 'Superaste 50 sesiones totales', date: 'Hace 3 días', color: 'var(--neon-green)' },
              { icon: '🔥', label: 'Meta de calorías semanal lograda', date: 'Hace 5 días', color: '#FF6B35' },
              { icon: '⚡', label: 'Nutrición perfecta (98%)', date: 'Hace 1 semana', color: '#A78BFA' },
            ].map((achievement, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 12,
                padding: 12,
                background: 'rgba(255,255,255,0.05)',
                borderLeft: `3px solid ${achievement.color}`,
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 20 }}>{achievement.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: achievement.color }}>
                    {achievement.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{achievement.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ LLAMADO A ACCIÓN ══════════ */}
      <div style={{
        padding: 24,
        background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(167,139,250,0.1) 100%)',
        border: '1px solid rgba(0,255,136,0.2)',
        borderRadius: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>¿Preguntas sobre tu progreso?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Comunícate directamente con tu entrenador para ajustes, dudas o nuevas metas.
          </p>
        </div>
        <button style={{
          padding: '12px 24px',
          borderRadius: 8,
          background: 'var(--neon-green)',
          color: '#000',
          fontWeight: 700,
          cursor: 'pointer',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          whiteSpace: 'nowrap'
        }}>
          <MessageSquare size={16} />
          Contactar Entrenador
        </button>
      </div>
    </div>
  );
}
