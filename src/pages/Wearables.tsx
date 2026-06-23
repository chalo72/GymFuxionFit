import { useState } from 'react';
import {
  Watch, Heart, Moon, Activity, Wifi, WifiOff, Battery,
  TrendingUp, TrendingDown, Zap, Thermometer, AlertTriangle,
  MessageSquare, Edit3, CheckCircle2, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

const connectedDevices = [
  { id: 1, name: 'Apple Watch Ultra', member: 'Alex Guerrero', initials: 'AG', model: 'Series 9', battery: 82, connected: true, lastSync: 'Hace 2 min', readiness: 95, status: 'Óptimo', color: 'var(--success-green)' },
  { id: 2, name: 'Garmin Forerunner', member: 'Valentina Torres', initials: 'VT', model: '965', battery: 67, connected: true, lastSync: 'Hace 5 min', readiness: 88, status: 'Listo', color: 'var(--neon-green)' },
  { id: 3, name: 'WHOOP 4.0', member: 'Andrés Mejía', initials: 'AM', model: 'WHOOP', battery: 45, connected: true, lastSync: 'Hace 10 min', readiness: 62, status: 'Moderado', color: 'var(--warning-yellow)' },
  { id: 4, name: 'Polar Vantage V2', member: 'María López', initials: 'ML', model: 'V2', battery: 90, connected: false, lastSync: 'Hace 1h', readiness: 55, status: 'Descanso', color: 'var(--energy-orange)' },
  { id: 5, name: 'Fitbit Sense 2', member: 'Carlos Rivas', initials: 'CR', model: 'Sense', battery: 23, connected: true, lastSync: 'Hace 3 min', readiness: 32, status: 'Recuperar', color: 'var(--danger-red)' },
];

const actionCenterAlerts = [
  {
    id: 1,
    member: 'Carlos Rivas',
    issue: 'Sueño crítico (3.2h) y HRV bajo (48ms). Riesgo alto de sobreentrenamiento.',
    action1: 'Bajar intensidad hoy',
    action2: 'Enviar protocolo de sueño',
    color: 'var(--danger-red)'
  },
  {
    id: 2,
    member: 'María López',
    issue: 'Fatiga acumulada detectada. Readiness en 55%.',
    action1: 'Programar Descanso Activo',
    action2: 'Contactar',
    color: 'var(--energy-orange)'
  }
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
  const [alerts, setAlerts] = useState(actionCenterAlerts);

  const handleAction = (id: number, message: string) => {
    alert(`Acción ejecutada: ${message}`);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
            Wearables <span style={{ color: 'var(--neon-green)', fontSize: '1rem', marginLeft: 8 }}>Hub de Biometría</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Centro de Acción — Identifica fatiga, monitorea rendimiento y ajusta planes en tiempo real.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: 'var(--green-10)', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--green-20)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-green)', animation: 'glow-pulse 2s infinite' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--neon-green)' }}>
              {connectedCount} DISPOSITIVOS LIVE
            </span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
             <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ─── CENTRO DE ACCIÓN (NUEVO) ─── */}
      {alerts.length > 0 && (
        <div style={{ 
          padding: 24, borderRadius: 16, 
          background: 'rgba(20, 20, 25, 0.6)', 
          border: '1px solid rgba(255, 61, 87, 0.2)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <AlertTriangle size={20} color="var(--danger-red)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger-red)' }}>Acciones Requeridas Hoy</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Basado en datos de Wearables nocturnos</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.map(alertItem => (
              <div key={alertItem.id} style={{ 
                display: 'flex', alignItems: 'center', gap: 16, padding: 16, 
                background: 'rgba(0,0,0,0.3)', borderRadius: 12, 
                borderLeft: `4px solid ${alertItem.color}` 
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 4 }}>{alertItem.member}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{alertItem.issue}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleAction(alertItem.id, alertItem.action1)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', background: `${alertItem.color}20`, color: alertItem.color, border: `1px solid ${alertItem.color}40` }}>
                    <Edit3 size={14} /> {alertItem.action1}
                  </button>
                  <button onClick={() => handleAction(alertItem.id, alertItem.action2)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <MessageSquare size={14} /> {alertItem.action2}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TABS ─── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
        {(['devices', 'hrv', 'sleep', 'zones'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700,
              background: activeTab === tab ? 'var(--neon-green)' : 'rgba(255,255,255,0.03)',
              color: activeTab === tab ? '#000' : 'var(--text-muted)',
              border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.2s', cursor: 'pointer'
            }}
          >
            {tab === 'devices' ? 'Readiness & Dispositivos' : tab === 'hrv' ? 'Análisis HRV' : tab === 'sleep' ? 'Calidad de Sueño' : 'Zonas Cardíacas'}
          </button>
        ))}
      </div>

      {activeTab === 'devices' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {connectedDevices.map((device) => (
            <div key={device.id} style={{ 
              background: 'rgba(20, 20, 25, 0.6)', borderRadius: 20, padding: 20, 
              border: `1px solid ${device.color}30`, position: 'relative', overflow: 'hidden',
              boxShadow: `0 8px 30px ${device.color}10`
            }}>
              {/* Resplandor superior */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: device.color, opacity: 0.8 }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${device.color}, ${device.color}60)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '1rem' }}>
                    {device.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{device.member}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Watch size={12} /> {device.name}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: device.color, lineHeight: 1 }}>{device.readiness}</div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginTop: 4 }}>Readiness</div>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: device.color, boxShadow: `0 0 10px ${device.color}` }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{device.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Battery size={14} style={{ color: device.battery < 30 ? 'var(--danger-red)' : 'var(--neon-green)' }} /> {device.battery}%
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {device.connected ? <Wifi size={14} style={{ color: 'var(--neon-green)' }} /> : <WifiOff size={14} />} {device.connected ? 'On' : 'Off'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '0.85rem', background: `${device.color}15`, border: `1px solid ${device.color}40`, color: device.color }}>
                  <Edit3 size={16} /> Ajustar Plan
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <MessageSquare size={16} /> Contactar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {activeTab === 'hrv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            <div style={{ padding: 24, borderRadius: 20, background: 'rgba(20, 20, 25, 0.6)', border: '1px solid rgba(0, 255, 136, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>HRV Semanal (Comunidad)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>La variabilidad de la frecuencia cardíaca alta indica buena recuperación.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--neon-green)', lineHeight: 1 }}>7.4</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Promedio General</div>
                </div>
              </div>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hrvData}>
                    <defs>
                      <linearGradient id="hrvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00FF88" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} domain={[60, 90]} />
                    <Tooltip contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 12 }} />
                    <Area type="monotone" dataKey="hrv" name="HRV" stroke="#00FF88" strokeWidth={3} fill="url(#hrvGrad)" dot={{ r: 5, fill: '#00FF88', strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="rmssd" name="RMSSD" stroke="#FF6B35" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ padding: 24, borderRadius: 20, background: 'rgba(20, 20, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 20 }}>Top Atletas Listos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { name: 'Alex Guerrero', hrv: 82, status: 'Óptimo para Pico', color: 'var(--success-green)' },
                  { name: 'Valentina Torres', hrv: 76, status: 'Entreno Normal', color: 'var(--neon-green)' },
                  { name: 'Andrés Mejía', hrv: 65, status: 'Mantenimiento', color: 'var(--warning-yellow)' },
                  { name: 'Carlos Rivas', hrv: 48, status: 'Sobrecarga', color: 'var(--danger-red)' },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: m.color, fontWeight: 600, marginTop: 4 }}>{m.status}</div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{m.hrv}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sleep' && (
        <div style={{ padding: 24, borderRadius: 20, background: 'rgba(20, 20, 25, 0.6)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Calidad de Sueño Consolidada</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>Un sueño profundo superior a 1.5h maximiza la hipertrofia.</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Profundo (Recuperación Física)', color: '#A78BFA' },
                { label: 'Ligero (Mantenimiento)', color: '#00FF88' },
                { label: 'REM (Recuperación Mental)', color: '#FF6B35' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 4, background: l.color }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sleepData}>
                <defs>
                  <linearGradient id="deepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF88" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00FF88" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="remGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#FF6B35" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
                <Tooltip contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 12 }} />
                <Area type="monotone" dataKey="deep" name="Profundo" stackId="1" stroke="#A78BFA" strokeWidth={2} fill="url(#deepGrad)" />
                <Area type="monotone" dataKey="light" name="Ligero" stackId="1" stroke="#00FF88" strokeWidth={2} fill="url(#lightGrad)" />
                <Area type="monotone" dataKey="rem" name="REM" stackId="1" stroke="#FF6B35" strokeWidth={2} fill="url(#remGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'zones' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(20, 20, 25, 0.6)', border: '1px solid rgba(255, 107, 53, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 24 }}>Distribución de Zonas FC (Hoy)</h3>
            {heartRateZones.map((zone, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{zone.zone}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>{zone.range}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: zone.color }}>{zone.percentage}%</span>
                </div>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${zone.percentage}%`, background: zone.color, borderRadius: 5 }} />
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
              Analizar Zonas por Atleta
            </button>
          </div>

          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(20, 20, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 24 }}>Métricas Ambientales y Vitales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Temperatura Corporal', value: '36.8°C', icon: Thermometer, color: 'var(--energy-orange)', status: 'Rango Normal' },
                { label: 'SpO2 (Oxígeno en Sangre)', value: '98%', icon: Activity, color: 'var(--neon-green)', status: 'Óptima oxigenación' },
                { label: 'Nivel de Estrés Acumulado', value: '24/100', icon: Zap, color: 'var(--success-green)', status: 'Bajo riesgo' },
                { label: 'Volumen de Pasos', value: '8,420', icon: Activity, color: 'var(--neon-green)', status: '+12% sobre media' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <item.icon size={20} style={{ color: item.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{item.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.status}</div>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
