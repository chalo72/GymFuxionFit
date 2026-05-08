import React, { useState } from 'react';
import {
  Apple, TrendingUp, Calendar, Plus, Check, AlertCircle,
  BarChart3, PieChart as PieIcon, Target, Trash2, Edit
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function NutritionDashboard() {
  const [activePlan, setActivePlan] = useState({
    name: 'HYROX Elite Cut',
    goal: 'Pérdida de grasa con ganancia muscular',
    targetCalories: 2200,
    targetMacros: { protein: 180, carbs: 250, fats: 65 },
    startDate: 'Enero 2026',
  });

  const nutritionData = {
    today: {
      calories: { current: 1640, target: 2200, pct: 74 },
      protein: { current: 142, target: 180, pct: 79 },
      carbs: { current: 210, target: 250, pct: 84 },
      fats: { current: 48, target: 65, pct: 74 },
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, backgroundColor: 'var(--space-dark)', color: '#fff', minHeight: '100vh' }}>
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
          Nutrición
          <span style={{ fontSize: 16, color: 'var(--neon-green)', marginLeft: 12, fontWeight: 600 }}>
            Plan Activo: {activePlan.name}
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{activePlan.goal} • Iniciado en {activePlan.startDate}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Calorías', icon: '⚡', ...nutritionData.today.calories, color: 'var(--neon-green)' },
          { label: 'Proteína', icon: '💪', ...nutritionData.today.protein, color: '#FF6B35' },
          { label: 'Carbohidratos', icon: '🍚', ...nutritionData.today.carbs, color: '#FFD600' },
          { label: 'Grasas', icon: '🥑', ...nutritionData.today.fats, color: '#A78BFA' },
        ].map((macro, i) => (
          <div key={i} style={{
            padding: 20, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>{macro.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{macro.pct}%</span>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: macro.color, marginBottom: 4 }}>
                {macro.current} / {macro.target}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{macro.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
