import { useState } from 'react';
import {
  Watch, Heart, Moon, Activity, Wifi, WifiOff, Battery,
  TrendingUp, TrendingDown, Zap, Thermometer,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

const connectedDevices = [
  { id: 1, name: 'Apple Watch Ultra', member: 'Alex Guerrero', model: 'Series 9', battery: 82, connected: true, lastSync: 'Hace 2 min' },
  { id: 2, name: 'Garmin Forerunner', member: 'Valentina Torres', model: '965', battery: 67, connected: true, lastSync: 'Hace 5 min' },
  { id: 3, name: 'WHOOP 4.0', member: 'Andrés Mejía', model: 'WHOOP', battery: 45, connected: true, lastSync: 'Hace 10 min' },
  { id: 4, name: 'Polar Vantage V2', member: 'María López', model: 'V2', battery: 90, connected: false, lastSync: 'Hace 1h' },
  { id: 5, name: 'Fitbit Sense 2', member: 'Carlos Rivas', model: 'Sense', battery: 23, connected: true, lastSync: 'Hace 3 min' },
];

const hrvData = [
  { day: 'Lun', hrv: 68, rmssd: 72 },
  { day: 'Mar', hrv: 74, rmssd: 78 },
  { day: 'Mié', hrv: 65, rmssd: 68 },
  { day: 'Jue', hrv: 78, rmssd: 82 },
  { day: 'Vie', hrv: 71, rmssd: 75 },
  { day: 'Sáb', hrv: 82, rmssd: 86 },
  { day: 'Dom', hrv: 76, rmssd: 80 },
];

const sleepData = [
  { day: 'Lun', deep: 1.5, light: 3.2, rem: 1.8, awake: 0.5 },
  { day: 'Mar', deep: 1.8, light: 3.5, rem: 2.1, awake: 0.4 },
  { day: 'Mié', deep: 1.2, light: 2.8, rem: 1.5, awake: 0.8 },
  { day: 'Jue', deep: 2.0, light: 3.8, rem: 2.3, awake: 0.3 },
  { day: 'Vie', deep: 1.6, light: 3.1, rem: 1.9, awake: 0.6 },
  { day: 'Sáb', deep: 2.2, light: 4.0, rem: 2.5, awake: 0.2 },
  { day: 'Dom', deep: 1.9, light: 3.6, rem: 2.0, awake: 0.4 },
];

const heartRateZones = [
  { zone: 'Reposo', range: '< 60 bpm', percentage: 35, color: '#A78BFA' },
  { zone: 'Quema de grasa', range: '60-110 bpm', percentage: 28, color: '#00FF88' },
  { zone: 'Cardio', range: '110-140 bpm', percentage: 22, color: '#FF6B35' },
  { zone: 'Pico', range: '> 140 bpm', percentage: 15, color: '#FF3D57' },
];

export default function Wearables() {
  const [activeTab, setActiveTab] = useState<'devices' | 'hrv' | 'sleep' | 'zones'>('devices');
  const connectedCount = connectedDevices.filter(d => d.connected).length;

  return (
    <div className="animate-fade-in">
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            Wearables <span style={{ color: 'var(--neon-green)', fontSize: '1rem', marginLeft: 8 }}>Biometría en Vivo</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Dispositivos conectados · HRV · Sueño · Zonas de frecuencia cardíaca
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            background: 'var(--green-10)', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--green-20)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-green)', animation: 'glow-pulse 2s infinite' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neon-green)' }}>
              {connectedCount} dispositivos live
            </span>
          </div>
        </div>
      </div>

      {/* ─── KPIs ─── */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        <div className="kpi-card cyan animate-fade-in animate-delay-1">
          <div className="kpi-icon cyan"><Heart size={20} /></div>
          <div className="kpi-label">FC Promedio Hoy</div>
          <div className="kpi-value">72 bpm</div>
          <div className="kpi-change positive"><TrendingDown size={12} /> -4 bpm vs ayer</div>
        </div>
        <div className="kpi-card orange animate-fade-in animate-delay-2">
          <div className="kpi-icon orange"><Activity size={20} /></div>
          <div className="kpi-label">HRV Promedio</div>
          <div className="kpi-value">7.4</div>
          <div className="kpi-change positive"><TrendingUp size={12} /> +0.3 esta semana</div>
        </div>
        <div className="kpi-card green animate-fade-in animate-delay-3">
          <div className="kpi-icon green"><Moon size={20} /></div>
          <div className="kpi-label">Calidad de Sueño</div>
          <div className="kpi-value">82%</div>
          <div className="kpi-change positive"><TrendingUp size={12} /> Óptimo</div>
        </div>
        <div className="kpi-card animate-fade-in animate-delay-4">
          <div className="kpi-icon cyan"><Zap size={20} /></div>
          <div className="kpi-label">Recuperación</div>
          <div className="kpi-value">78%</div>
          <div className="kpi-change positive"><TrendingUp size={12} /> Listo para entrenar</div>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="chart-tabs" style={{ marginBottom: 20, width: 'fit-content' }}>
        {(['devices', 'hrv', 'sleep', 'zones'] as const).map((tab) => (
          <button
            key={tab}
            className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'devices' ? 'Dispositivos' : tab === 'hrv' ? 'HRV' : tab === 'sleep' ? 'Sueño' : 'Zonas FC'}
          </button>
        ))}
      </div>

      {activeTab === 'devices' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {connectedDevices.map((device) => (
            <div key={device.id} className="device-card" style={{ borderColor: device.connected ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)' }}>
              <div className="device-icon" style={{ background: device.connected ? 'var(--green-10)' : 'rgba(255,255,255,0.05)' }}>
                <Watch size={22} style={{ color: device.connected ? 'var(--neon-green)' : 'var(--text-muted)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{device.name}</span>
                  {device.connected
                    ? <Wifi size={12} style={{ color: 'var(--neon-green)' }} />
                    : <WifiOff size={12} style={{ color: 'var(--text-muted)' }} />
                  }
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{device.member}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                  Últ. sync: {device.lastSync}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginBottom: 4 }}>
                  <Battery size={12} style={{ color: device.battery < 30 ? 'var(--danger-red)' : 'var(--neon-green)' }} />
                  <span style={{
                    fontSize: 'var(--text-xs)', fontWeight: 700,
                    color: device.battery < 30 ? 'var(--danger-red)' : 'var(--text-secondary)',
                  }}>
                    {device.battery}%
                  </span>
                </div>
                <span className={`status-badge ${device.connected ? 'active' : 'inactive'}`}>
                  {device.connected ? 'Conectado' : 'Offline'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'hrv' && (
        <div className="dashboard-grid">
          <div className="glass-card">
            <div className="glass-card-header">
              <div>
                <div className="glass-card-title">HRV Semanal — Variabilidad de FC</div>
                <div className="glass-card-subtitle">Promedio del gym · Mayor = Mejor recuperación</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--neon-green)' }}>7.4</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Promedio semanal</div>
              </div>
            </div>
            <div className="chart-container" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hrvData}>
                  <defs>
                    <linearGradient id="hrvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FF88" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} domain={[60, 90]} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number, name: string) => [`${v} ms`, name === 'hrv' ? 'HRV' : 'RMSSD']}
                  />
                  <Area type="monotone" dataKey="hrv" name="hrv" stroke="#00FF88" strokeWidth={2.5} fill="url(#hrvGrad)" dot={{ r: 4, fill: '#00FF88', stroke: 'rgba(0,255,136,0.3)', strokeWidth: 5 }} />
                  <Line type="monotone" dataKey="rmssd" name="rmssd" stroke="#FF6B35" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card">
            <div className="glass-card-title" style={{ marginBottom: 20 }}>Estado de Recuperación — Hoy</div>
            {[
              { name: 'Alex Guerrero', hrv: 82, status: 'Óptimo', color: 'var(--success-green)' },
              { name: 'Valentina Torres', hrv: 76, status: 'Listo', color: 'var(--neon-green)' },
              { name: 'Andrés Mejía', hrv: 65, status: 'Moderado', color: 'var(--warning-yellow)' },
              { name: 'María López', hrv: 58, status: 'Descanso', color: 'var(--energy-orange)' },
              { name: 'Carlos Rivas', hrv: 48, status: 'Recuperar', color: 'var(--danger-red)' },
            ].map((m, i) => (
              <div key={i} className="stat-row">
                <div className="member-cell">
                  <div className="member-avatar" style={{ width: 32, height: 32, fontSize: 'var(--text-xs)' }}>
                    {m.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{m.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{m.hrv}</span>
                  <span style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                    padding: '3px 8px', borderRadius: 'var(--radius-full)',
                    background: `${m.color}15`, color: m.color,
                  }}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sleep' && (
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <div className="glass-card-title">Análisis de Sueño — Últimos 7 días</div>
              <div className="glass-card-subtitle">Promedio del gym · Fases por horas</div>
            </div>
          </div>
          <div className="chart-container" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sleepData}>
                <defs>
                  <linearGradient id="deepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF88" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00FF88" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="remGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#FF6B35" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, name: string) => {
                    const labels: Record<string, string> = { deep: 'Sueño Profundo', light: 'Sueño Ligero', rem: 'REM', awake: 'Despierto' };
                    return [`${v}h`, labels[name] || name];
                  }}
                />
                <Area type="monotone" dataKey="deep" name="deep" stackId="1" stroke="#A78BFA" strokeWidth={0} fill="url(#deepGrad)" />
                <Area type="monotone" dataKey="light" name="light" stackId="1" stroke="#00FF88" strokeWidth={0} fill="url(#lightGrad)" />
                <Area type="monotone" dataKey="rem" name="rem" stackId="1" stroke="#FF6B35" strokeWidth={0} fill="url(#remGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            {[
              { label: 'Sueño Profundo', color: '#A78BFA' },
              { label: 'Sueño Ligero', color: '#00FF88' },
              { label: 'REM', color: '#FF6B35' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: 'inline-block' }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'zones' && (
        <div className="dashboard-grid">
          <div className="glass-card">
            <div className="glass-card-title" style={{ marginBottom: 20 }}>Distribución de Zonas FC</div>
            {heartRateZones.map((zone, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{zone.zone}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 8 }}>{zone.range}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: zone.color }}>{zone.percentage}%</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-bar-fill" style={{ width: `${zone.percentage}%`, background: zone.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card">
            <div className="glass-card-title" style={{ marginBottom: 20 }}>Temperatura & Métricas Avanzadas</div>
            {[
              { label: 'Temperatura Corporal', value: '36.8°C', icon: Thermometer, color: 'var(--energy-orange)', status: 'Normal' },
              { label: 'SpO2 (Oxígeno)', value: '98%', icon: Activity, color: 'var(--neon-green)', status: 'Óptimo' },
              { label: 'Estrés Promedio', value: '24/100', icon: Zap, color: 'var(--success-green)', status: 'Bajo' },
              { label: 'Pasos Hoy', value: '8,420', icon: Activity, color: 'var(--neon-green)', status: '+12% meta' },
              { label: 'Calorías Activas', value: '520 kcal', icon: Zap, color: 'var(--energy-orange)', status: '76% meta' },
            ].map((item, i) => (
              <div key={i} className="stat-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.label}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{item.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
