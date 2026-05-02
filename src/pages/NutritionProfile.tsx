import React, { useState } from 'react';
import {
  Apple, TrendingUp, Calendar, Plus, Check, AlertCircle,
  BarChart3, PieChart as PieIcon, Target, Trash2, Edit
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

/* ══════════════════════════════════════════
   NUTRICIÓN: DASHBOARD PROFESIONAL
   Seguimiento de planes, macros y adherencia
══════════════════════════════════════════ */

interface NutritionPlan {
  id: string;
  name: string;
  goal: string;
  targetCalories: number;
  targetMacros: { protein: number; carbs: number; fats: number };
  duration: number;
  startDate: string;
  active: boolean;
}

interface MealLog {
  id: string;
  date: string;
  meal: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  logged: boolean;
}

import { useClientProgress } from '../hooks/useClientProgress';

export default function NutritionDashboard() {
  const { nutritionData, todaysMeals, plans, activePlan } = useClientProgress();
  const [selectedDate, setSelectedDate] = useState('Hoy');
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
          Nutrición
          <span style={{ fontSize: 16, color: 'var(--neon-green)', marginLeft: 12, fontWeight: 600 }}>
            Plan Activo: {activePlan.name}
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {activePlan.goal} • Iniciado en {activePlan.startDate}
        </p>
      </div>

      {/* MÉTRICAS PRINCIPALES DE HOY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Calorías', icon: '⚡', ...nutritionData.today.calories, color: 'var(--neon-green)' },
          { label: 'Proteína', icon: '💪', ...nutritionData.today.protein, color: '#FF6B35' },
          { label: 'Carbohidratos', icon: '🍚', ...nutritionData.today.carbs, color: '#FFD600' },
          { label: 'Grasas', icon: '🥑', ...nutritionData.today.fats, color: '#A78BFA' },
        ].map((macro, i) => (
          <div key={i} style={{
            padding: 20,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>{macro.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{macro.pct}%</span>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: macro.color, marginBottom: 4 }}>
                {macro.current}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>
                  / {macro.target}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{macro.label}</div>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 8 }}>
              <div style={{
                height: '100%',
                width: `${Math.min(macro.pct, 100)}%`,
                background: macro.color,
                borderRadius: 2
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* GRÁFICOS Y TENDENCIA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        {/* Tendencia de Adherencia */}
        <div style={{
          padding: 24,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Tendencia de Adherencia Semanal</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={nutritionData.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" />
                <YAxis stroke="rgba(255,255,255,0.4)" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid var(--neon-green)',
                    borderRadius: 8
                  }}
                  formatter={(value) => [`${value}%`, 'Adherencia']}
                />
                <Line
                  type="monotone"
                  dataKey="adherence"
                  stroke="var(--neon-green)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--neon-green)', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            marginTop: 16,
            padding: 12,
            background: 'rgba(0,255,136,0.1)',
            borderRadius: 8
          }}>
            <p style={{ fontSize: 12, color: 'var(--neon-green)', fontWeight: 600 }}>
              📊 Adherencia promedio: <strong>93%</strong> • Excelente desempeño en el plan
            </p>
          </div>
        </div>

        {/* Distribución de Macros Hoy */}
        <div style={{
          padding: 24,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Macros Hoy (Real vs Meta)</h3>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'conic-gradient(var(--neon-green) 0deg 188deg, #FFD600 188deg 281deg, #FF6B35 281deg 360deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0,255,136,0.2)'
            }}>
              <div style={{
                width: 130,
                height: 130,
                borderRadius: '50%',
                background: 'var(--space-dark)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--neon-green)' }}>74%</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Completo</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Proteína', color: 'var(--neon-green)' },
              { label: 'Carbohidratos', color: '#FFD600' },
              { label: 'Grasas', color: '#FF6B35' }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                <span style={{ fontSize: 12, flex: 1 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMIDAS LOGGEADAS */}
      <div style={{
        padding: 24,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Comidas de Hoy</h3>
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
            Agregar Comida
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {todaysMeals.map((meal) => (
            <div key={meal.id} style={{
              padding: 16,
              background: meal.logged ? 'rgba(0,255,136,0.05)' : 'rgba(255,61,87,0.05)',
              border: meal.logged ? '1px solid rgba(0,255,136,0.1)' : '1px solid rgba(255,61,87,0.1)',
              borderRadius: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {meal.logged ? (
                    <Check size={16} style={{ color: 'var(--neon-green)' }} />
                  ) : (
                    <AlertCircle size={16} style={{ color: '#ff4d4d' }} />
                  )}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{meal.meal}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{meal.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 24 }}>
                  {meal.items.join(' • ')}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 100 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neon-green)', marginBottom: 4 }}>
                  {meal.calories} kcal
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  P:{meal.protein}g • C:{meal.carbs}g • F:{meal.fats}g
                </div>
              </div>
              <div style={{ marginLeft: 12, display: 'flex', gap: 6 }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                  <Edit size={14} />
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HISTORIAL DE PLANES */}
      <div style={{
        padding: 24,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Historial de Planes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{
              padding: 16,
              background: plan.active ? 'rgba(0,255,136,0.05)' : 'rgba(255,255,255,0.02)',
              border: plan.active ? '1px solid rgba(0,255,136,0.1)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {plan.name}
                  {plan.active && <span style={{ marginLeft: 8, color: 'var(--neon-green)', fontSize: 11, fontWeight: 600 }}>● ACTIVO</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {plan.goal} • {plan.duration} semanas • Desde {plan.startDate}
                </div>
              </div>
              <button style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: plan.active ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)',
                color: plan.active ? '#000' : '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                fontSize: 12
              }}>
                {plan.active ? 'Activo' : 'Ver Detalles'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* TIPS Y RECOMENDACIONES */}
      <div style={{
        padding: 24,
        background: 'linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: 16
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>💡 Recomendación del Coach</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Vas muy bien con la adherencia (93%). Para maximizar resultados: <strong>aumenta un 15% la ingesta de proteína post-entreno</strong> y mantén los carbohidratos en días de alta intensidad. El plan está ajustado perfectamente a tu objetivo HYROX.
        </p>
      </div>
    </div>
  );
}
