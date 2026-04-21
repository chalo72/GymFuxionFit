import { Save, Bell, Shield, Palette, Globe, Database, Wifi } from 'lucide-react';
import { useState } from 'react';

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
];

export default function Settings() {
  const [gymName, setGymName] = useState('GymFuxionFit Montería');
  const [timezone, setTimezone] = useState('America/Bogota');
  const [faceAuth, setFaceAuth] = useState(true);
  const [antiTailgating, setAntiTailgating] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Configuración</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Administración del sistema GymFuxionFit
          </p>
        </div>
        <button className="btn btn-primary">
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
              className="sidebar-item"
              style={{ width: '100%' }}
            >
              <sec.icon size={18} />
              <span>{sec.title}</span>
            </button>
          ))}
        </div>

        {/* ─── CONTENT ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* General */}
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

          {/* Security */}
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

          {/* Notifications */}
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
        </div>
      </div>
    </div>
  );
}
