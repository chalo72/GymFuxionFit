import React, { useState } from 'react';
import {
  Download, Mail, BarChart3, TrendingUp, Award, 
  Calendar, FileText, Share2, Eye, CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';

/* ══════════════════════════════════════════
   REPORTES: CONSOLIDACIÓN PROFESIONAL
   Vista integrada de progreso total
══════════════════════════════════════════ */

interface ComprehensiveReport {
  period: string;
  generatedDate: string;
  clientName: string;
  coachName: string;
  summary: {
    overallProgress: number;
    workCompleted: string;
    nutritionAdherence: number;
    trainingCompliance: number;
    personalRecords: number;
  };
}

export default function IntegratedReports() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [reportView, setReportView] = useState<'summary' | 'detailed' | 'export'>('summary');

  // Datos consolidados del reporte
  const report: ComprehensiveReport = {
    period: 'Abril 2026',
    generatedDate: '29 de Abril de 2026',
    clientName: 'Alex Guerrero',
    coachName: 'Coach Principal',
    summary: {
      overallProgress: 78,
      workCompleted: '47 sesiones | 52.5 horas | 18,550 kcal',
      nutritionAdherence: 92,
      trainingCompliance: 86,
      personalRecords: 3
    }
  };

  // Datos consolidados mensual
  const monthlyData = [
    { week: 'Sem 1', training: 85, nutrition: 88, recovery: 80, overall: 84 },
    { week: 'Sem 2', training: 88, nutrition: 91, recovery: 85, overall: 88 },
    { week: 'Sem 3', training: 82, nutrition: 89, recovery: 78, overall: 83 },
    { week: 'Sem 4', training: 90, nutrition: 95, recovery: 88, overall: 91 },
  ];

  // Distribución de trabajo
  const workDistribution = [
    { name: 'Entrenamiento Power', value: 35, color: '#FF6B35' },
    { name: 'Entrenamiento Hipertrofia', value: 25, color: 'var(--neon-green)' },
    { name: 'Entrenamiento Funcional', value: 25, color: '#A78BFA' },
    { name: 'Recuperación', value: 15, color: '#FFD600' },
  ];

  // Comparativa mes anterior
  const monthComparison = [
    { metric: 'Sesiones', march: 42, april: 47, target: 52 },
    { metric: 'Horas', march: 48, april: 52.5, target: 60 },
    { metric: 'Nutrición %', march: 88, april: 92, target: 95 },
    { metric: 'PRs', march: 1, april: 3, target: 4 },
  ];

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

      {/* HEADER CON FILTROS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
            Reportes Integrados
            <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400, display: 'block' }}>
              Período: {report.period}
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Generado: {report.generatedDate} | Cliente: {report.clientName}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {(['week', 'month', 'quarter'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: selectedPeriod === period ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)',
                color: selectedPeriod === period ? '#000' : '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Trimestre'}
            </button>
          ))}
        </div>
      </div>

      {/* TABS DE VISTA */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
        {[
          { id: 'summary', label: 'Resumen Ejecutivo', icon: '📊' },
          { id: 'detailed', label: 'Análisis Detallado', icon: '📈' },
          { id: 'export', label: 'Exportar', icon: '📥' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportView(tab.id as any)}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: reportView === tab.id ? 'var(--neon-green)' : 'transparent',
              color: reportView === tab.id ? '#000' : '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* VISTA: RESUMEN EJECUTIVO */}
      {reportView === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* KPIs PRINCIPALES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Progreso General', value: `${report.summary.overallProgress}%`, color: 'var(--neon-green)' },
              { label: 'Adherencia Nutricional', value: `${report.summary.nutritionAdherence}%`, color: '#FFD600' },
              { label: 'Cumplimiento Entrenamiento', value: `${report.summary.trainingCompliance}%`, color: '#A78BFA' },
              { label: 'Récords Personales', value: `+${report.summary.personalRecords}`, color: '#FF6B35' },
            ].map((kpi, i) => (
              <div key={i} style={{
                padding: 24,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: kpi.color, marginBottom: 8 }}>
                   {kpi.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{kpi.label}</div>
              </div>
            ))}
          </div>
          {/* (Resto de la vista resumida reconstruida según historial) */}
        </div>
      )}
    </div>
  );
}
