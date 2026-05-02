import { Save, Bell, Shield, Palette, Globe, Database, Wifi, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGymData } from '../hooks/useGymData';

const sections = [
  {
    id: 'general',
    icon: Globe,
    title: 'General',
    description: 'Nombre del gimnasio, zona horaria y preferencias regionales',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Seguridad',
    description: 'Autenticación biométrica, anti-tailgating y control de acceso',
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notificaciones',
    description: 'Alertas por email, push y WhatsApp',
  },
  {
    id: 'appearance',
    icon: Palette,
    title: 'Apariencia',
    description: 'Tema, colores y personalización de la interfaz',
  },
  {
    id: 'integrations',
    icon: Wifi,
    title: 'Integraciones',
    description: 'Stripe, Wearables API, Supabase, Telegram',
  },
  {
    id: 'database',
    icon: Database,
    title: 'Base de Datos',
    description: 'PostgreSQL, TimescaleDB y Redis',
  },
  {
    id: 'pricing',
    icon: DollarSign,
    title: 'Precios y Planes',
    description: 'Configurar costos de membresías y daypasses',
  },
];

export default function Settings() {
  const [gymName, setGymName] = useState('GymFuxionFit Montería');
  const [timezone, setTimezone] = useState('America/Bogota');
  const [faceAuth, setFaceAuth] = useState(true);
  const [antiTailgating, setAntiTailgating] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  const { plansConfig, updatePlansConfig } = useGymData();
  const [localPlans, setLocalPlans] = useState(plansConfig || { dia: 5000, semana: 25000, mes_basico: 45000, mes_pro: 75000, mes_hyrox: 120000 });

  useEffect(() => {
    if (plansConfig) setLocalPlans(plansConfig);
  }, [plansConfig]);

  const handleSave = () => {
    updatePlansConfig(localPlans);
    alert("Configuración guardada exitosamente");
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Configuración</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Administración del sistema GymFuxionFit
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} />
          Guardar Cambios
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
        {/* ─── NAV LATERAL ─── */}
        <div className="glass-card" style={{ padding: 12, height: 'fit-content' }}>
          {sections.map((sec) => (
            <button
              key={sec.id}
              className={`sidebar-item ${activeTab === sec.id ? 'active' : ''}`}
              style={{ width: '100%', background: activeTab === sec.id ? 'rgba(0,255,136,0.1)' : 'transparent', color: activeTab === sec.id ? 'var(--neon-green)' : 'var(--text-muted)' }}
              onClick={() => setActiveTab(sec.id)}
            >
              <sec.icon size={18} />
              <span>{sec.title}</span>
            </button>
          ))}
        </div>

        {/* ─── CONTENT ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* General */}
          {activeTab === 'general' && (
          <div className="glass-card">
            <div className="glass-card-header">
              <div>
                <div className="glass-card-title">
                  <Globe size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                  General
                </div>
                <div className="glass-card-subtitle">Configuración básica del gimnasio</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Nombre del Gimnasio</label>
                <input className="input-field" value={gymName} onChange={(e) => setGymName(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Zona Horaria</label>
                <input className="input-field" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
              </div>
            </div>
          </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
          <div className="glass-card">
            <div className="glass-card-header">
              <div>
                <div className="glass-card-title">
                  <Shield size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                  Seguridad
                </div>
                <div className="glass-card-subtitle">Control de acceso biométrico</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,240,255,0.06)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Reconocimiento Facial</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Login biométrico para acceso al gym</div>
                </div>
                <button
                  onClick={() => setFaceAuth(!faceAuth)}
                  style={{
                    width: 48, height: 26, borderRadius: 13, padding: 3,
                    background: faceAuth ? 'var(--electric-cyan)' : 'var(--space-lighter)',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                    display: 'flex', alignItems: faceAuth ? 'center' : 'center',
                    justifyContent: faceAuth ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,240,255,0.06)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Anti-Tailgating</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Detección de accesos no autorizados</div>
                </div>
                <button
                  onClick={() => setAntiTailgating(!antiTailgating)}
                  style={{
                    width: 48, height: 26, borderRadius: 13, padding: 3,
                    background: antiTailgating ? 'var(--electric-cyan)' : 'var(--space-lighter)',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                    display: 'flex', alignItems: antiTailgating ? 'center' : 'center',
                    justifyContent: antiTailgating ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
          <div className="glass-card">
            <div className="glass-card-header">
              <div>
                <div className="glass-card-title">
                  <Bell size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                  Notificaciones
                </div>
                <div className="glass-card-subtitle">Canales de comunicación</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,240,255,0.06)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Email</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Reportes diarios y alertas del sistema</div>
                </div>
                <button
                  onClick={() => setEmailNotif(!emailNotif)}
                  style={{
                    width: 48, height: 26, borderRadius: 13, padding: 3,
                    background: emailNotif ? 'var(--electric-cyan)' : 'var(--space-lighter)',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: emailNotif ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Push Notifications</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Alertas en tiempo real al móvil</div>
                </div>
                <button
                  onClick={() => setPushNotif(!pushNotif)}
                  style={{
                    width: 48, height: 26, borderRadius: 13, padding: 3,
                    background: pushNotif ? 'var(--electric-cyan)' : 'var(--space-lighter)',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: pushNotif ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Precios y Planes */}
          {activeTab === 'pricing' && (
          <div className="glass-card">
            <div className="glass-card-header">
              <div>
                <div className="glass-card-title">
                  <DollarSign size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--neon-green)' }} />
                  Precios y Planes
                </div>
                <div className="glass-card-subtitle">Define los costos base de las membresías y accesos</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Valor Día (Rutina Suelta)</label>
                  <input className="input-field" type="number" value={localPlans.dia} onChange={(e) => setLocalPlans({...localPlans, dia: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Valor Semana</label>
                  <input className="input-field" type="number" value={localPlans.semana} onChange={(e) => setLocalPlans({...localPlans, semana: Number(e.target.value)})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Mensualidad Básica</label>
                  <input className="input-field" type="number" value={localPlans.mes_basico} onChange={(e) => setLocalPlans({...localPlans, mes_basico: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Mensualidad Pro</label>
                  <input className="input-field" type="number" value={localPlans.mes_pro} onChange={(e) => setLocalPlans({...localPlans, mes_pro: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Mensualidad HYROX</label>
                  <input className="input-field" type="number" value={localPlans.mes_hyrox} onChange={(e) => setLocalPlans({...localPlans, mes_hyrox: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
