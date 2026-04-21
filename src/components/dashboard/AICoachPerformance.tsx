import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { Bot, TrendingUp, Heart, BarChart3 } from 'lucide-react';

const radarData = [
  { subject: 'Planes de\nEntrenamiento', A: 90 },
  { subject: 'Consejo\nNutricional', A: 78 },
  { subject: 'Engagement', A: 85 },
  { subject: 'Feedback', A: 72 },
  { subject: 'Seguimiento\nProgreso', A: 88 },
  { subject: 'Planes de\nRetorno', A: 65 },
];

export default function AICoachPerformance() {
  return (
    <div className="glass-card full-width">
      <div className="glass-card-header">
        <div>
          <div className="glass-card-title">Rendimiento del AI Coach</div>
          <div className="glass-card-subtitle">FitBot 2.0 — Motor de Inteligencia Artificial</div>
        </div>
        <span className="status-badge active">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--success-green)',
              display: 'inline-block',
            }}
          />
          Activo
        </span>
      </div>

      <div className="ai-coach-card">
        {/* ─── AI Avatar & Info ─── */}
        <div className="ai-avatar-container">
          <div className="ai-avatar">
            <Bot size={32} style={{ color: 'var(--electric-cyan)', zIndex: 1 }} />
          </div>
          <div className="ai-info">
            <h3>
              FitBot <span style={{ color: 'var(--electric-cyan)' }}>2.0</span>
            </h3>
            <div className="ai-stats">
              <div className="ai-stat-row">
                <TrendingUp style={{ color: 'var(--energy-orange)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Sesiones Completadas</span>
                <span className="value">680</span>
              </div>
              <div className="ai-stat-row">
                <Heart style={{ color: 'var(--danger-red)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Tasa de Satisfacción</span>
                <span className="value" style={{ color: 'var(--success-green)' }}>
                  94%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Radar Chart ─── */}
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid
                stroke="rgba(0,255,136,0.1)"
                gridType="polygon"
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
              />
              <Radar
                name="FitBot"
                dataKey="A"
                stroke="#FF6B35"
                fill="#FF6B35"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ r: 3, fill: '#FF6B35', stroke: '#FF6B35' }}
              />
              <Radar
                name="Objetivo"
                dataKey="A"
                stroke="#00FF88"
                fill="#00FF88"
                fillOpacity={0.05}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* ─── AI KPIs ─── */}
        <div className="ai-kpi-group">
          <div className="ai-kpi">
            <div className="number">
              <BarChart3 size={18} style={{ color: 'var(--electric-cyan)' }} />
              <span>185</span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-muted)' }}>
                /Día
              </span>
            </div>
            <div className="label">Interacciones Diarias</div>
          </div>
          <div className="ai-kpi">
            <div className="number">
              <TrendingUp size={18} style={{ color: 'var(--energy-orange)' }} />
              <span style={{ color: 'var(--energy-orange)' }}>76%</span>
            </div>
            <div className="label">Metas Alcanzadas</div>
          </div>
          <div className="ai-kpi">
            <div className="number">
              <Heart size={18} style={{ color: 'var(--danger-red)' }} />
              <span>8,450</span>
            </div>
            <div className="label">Interacciones Totales</div>
          </div>
        </div>
      </div>
    </div>
  );
}
