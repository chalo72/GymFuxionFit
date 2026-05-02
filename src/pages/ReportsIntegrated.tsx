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

          {/* TARJETA DE TRABAJO REALIZADO */}
          <div style={{
            padding: 24,
            background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(167,139,250,0.1) 100%)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: 16
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>✅ Trabajo Completado</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>Período:</strong> {report.period} | <strong>Total:</strong> {report.summary.workCompleted}
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Meta Mensual</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--neon-green)' }}>52 sesiones</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Cumplimiento</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--neon-green)' }}>90%</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Racha Actual</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#FF6B35' }}>12 días 🔥</div>
              </div>
            </div>
          </div>

          {/* GRÁFICO DE PROGRESO SEMANAL */}
          <div style={{
            padding: 24,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Tendencia de Desempeño (Semanal)</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" />
                  <YAxis stroke="rgba(255,255,255,0.4)" />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.8)',
                      border: '1px solid var(--neon-green)',
                      borderRadius: 8
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="overall" stroke="var(--neon-green)" strokeWidth={3} dot={{ r: 6 }} />
                  <Bar dataKey="training" fill="#FF6B35" opacity={0.6} radius={[4,4,0,0]} />
                  <Bar dataKey="nutrition" fill="#FFD600" opacity={0.6} radius={[4,4,0,0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DISTRIBUCIÓN DE TRABAJO */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{
              padding: 24,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Distribución de Tipos de Entrenamiento</h3>
              <div style={{ height: 250, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {workDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {workDistribution.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: item.color }} />
                    <span style={{ fontSize: 12, flex: 1 }}>{item.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* COMPARATIVA CON MES ANTERIOR */}
            <div style={{
              padding: 24,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Comparativa: Marzo vs Abril</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {monthComparison.map((item) => (
                  <div key={item.metric}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{item.metric}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Marzo: {item.march} | Abril: <strong style={{ color: 'var(--neon-green)' }}>{item.april}</strong> | Meta: {item.target}
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min((item.april / item.target) * 100, 100)}%`,
                        background: (item.april / item.target) >= 1 ? 'var(--neon-green)' : '#FFD600',
                        borderRadius: 3
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA: ANÁLISIS DETALLADO */}
      {reportView === 'detailed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            padding: 24,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Análisis Detallado del Desempeño</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  section: 'Entrenamiento',
                  metrics: [
                    { label: 'Sesiones Completadas', value: 47, target: 52, unit: 'sesiones' },
                    { label: 'Volumen Total', value: 91.85, target: 110, unit: 'k kg' },
                    { label: 'Intensidad Promedio', value: 86, target: 85, unit: '%' },
                    { label: 'Horas Entrenadas', value: 52.5, target: 60, unit: 'horas' }
                  ],
                  icon: '🏋️'
                },
                {
                  section: 'Nutrición',
                  metrics: [
                    { label: 'Adherencia Promedio', value: 92, target: 95, unit: '%' },
                    { label: 'Macros en Target', value: 78, target: 90, unit: '%' },
                    { label: 'Comidas Loggeadas', value: 156, target: 168, unit: 'comidas' },
                    { label: 'Calorías Diarias Media', value: 2180, target: 2200, unit: 'kcal' }
                  ],
                  icon: '🥗'
                },
                {
                  section: 'Recuperación',
                  metrics: [
                    { label: 'Horas de Sueño', value: 7.2, target: 8, unit: 'horas' },
                    { label: 'Sesiones Movilidad', value: 8, target: 12, unit: 'sesiones' },
                    { label: 'Días de Rest', value: 4, target: 4, unit: 'días' },
                    { label: 'Estrés Percibido', value: 4, target: 3, unit: 'puntos' }
                  ],
                  icon: '😴'
                }
              ].map((section) => (
                <div key={section.section} style={{
                  padding: 16,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                    {section.icon} {section.section}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {section.metrics.map((metric) => (
                      <div key={metric.label} style={{ fontSize: 11 }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{metric.label}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div style={{ fontWeight: 700, color: 'var(--neon-green)', fontSize: 13 }}>
                            {metric.value} <span style={{ fontSize: 10 }}>{metric.unit}</span>
                          </div>
                          <div style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            background: (metric.value / metric.target) >= 1 ? 'rgba(0,255,136,0.2)' : 'rgba(255,61,87,0.2)',
                            color: (metric.value / metric.target) >= 1 ? 'var(--neon-green)' : '#ff4d4d',
                            borderRadius: 4
                          }}>
                            {Math.round((metric.value / metric.target) * 100)}% meta
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VISTA: EXPORTAR */}
      {reportView === 'export' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[
            {
              format: 'PDF Profesional',
              description: 'Reporte completo formateado profesionalmente',
              icon: '📄',
              color: 'var(--neon-green)'
            },
            {
              format: 'Excel Detallado',
              description: 'Todos los datos para análisis personalizado',
              icon: '📊',
              color: '#FFD600'
            },
            {
              format: 'Enviar por Email',
              description: 'Envia el reporte a tu entrenador',
              icon: '📧',
              color: '#A78BFA'
            },
            {
              format: 'Compartir Link',
              description: 'Link para compartir con otros',
              icon: '🔗',
              color: '#FF6B35'
            }
          ].map((option, i) => (
            <button
              key={i}
              style={{
                padding: 24,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = option.color;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <div style={{ fontSize: 32 }}>{option.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: option.color, marginBottom: 4 }}>
                  {option.format}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {option.description}
                </div>
              </div>
              <div style={{
                marginTop: 8,
                padding: '6px 12px',
                background: option.color,
                color: '#000',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 11
              }}>
                Descargar
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
