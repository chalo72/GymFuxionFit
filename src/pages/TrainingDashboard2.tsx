import React, { useState } from 'react';
import {
  Dumbbell, TrendingUp, Calendar, Plus, Check, AlertCircle,
  BarChart3, Activity, Flame, Clock, Target, Award, Edit, Trash2
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function TrainingDashboard() {
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const activeProgram = {
    name: 'HYROX Elite Protocol',
    goal: 'Rendimiento completo en prueba HYROX',
    totalSessions: 80,
    sessionsCompleted: 47
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, backgroundColor: 'var(--space-dark)', color: '#fff', minHeight: '100vh' }}>
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
          Entrenamiento
          <span style={{ fontSize: 16, color: 'var(--neon-green)', marginLeft: 12, fontWeight: 600 }}>
            Programa: {activeProgram.name}
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{activeProgram.goal} • {activeProgram.sessionsCompleted}/{activeProgram.totalSessions} sesiones</p>
      </div>

      {/* (Métricas y gráficos omitidos, reconstruidos según historial) */}
    </div>
  );
}
