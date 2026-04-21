import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const attendanceData = [
  { name: 'Asistentes', value: 82, color: '#00F0FF' },
  { name: 'Ausentes', value: 18, color: '#1C1C28' },
];

const trendData = [
  { day: '01', checkIns: 145, occupancy: 78 },
  { day: '05', checkIns: 168, occupancy: 82 },
  { day: '09', checkIns: 155, occupancy: 76 },
  { day: '13', checkIns: 172, occupancy: 85 },
  { day: '17', checkIns: 165, occupancy: 80 },
  { day: '21', checkIns: 178, occupancy: 88 },
  { day: '25', checkIns: 160, occupancy: 79 },
  { day: '29', checkIns: 185, occupancy: 90 },
];

const tabs = ['Semana', 'Mes', 'Año'];

export default function MemberAttendance() {
  const [activeTab, setActiveTab] = useState('Mes');

  return (
    <div className="glass-card">
      <div className="glass-card-header">
        <div>
          <div className="glass-card-title">Asistencia de Miembros</div>
          <div className="glass-card-subtitle">Tasa de ocupación y check-ins</div>
        </div>
        <div className="chart-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── DONUT + TREND ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'center' }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: 180, height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {attendanceData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <div className="donut-value">82%</div>
            <div className="donut-label">Asistencia</div>
          </div>
        </div>

        {/* Trend Lines */}
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(14,14,21,0.95)',
                  border: '1px solid rgba(0,240,255,0.2)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="checkIns"
                name="Check-Ins"
                stroke="#00F0FF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#00F0FF', stroke: 'rgba(0,240,255,0.3)', strokeWidth: 6 }}
              />
              <Line
                type="monotone"
                dataKey="occupancy"
                name="Ocupación %"
                stroke="#FF6B35"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#FF6B35', stroke: 'rgba(255,107,53,0.3)', strokeWidth: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── LEGEND ─── */}
      <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00F0FF', display: 'inline-block' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Check-Ins Promedio</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B35', display: 'inline-block' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Ocupación de Clase</span>
        </div>
      </div>
    </div>
  );
}
