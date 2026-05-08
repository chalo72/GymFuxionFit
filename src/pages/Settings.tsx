import { Save, Bell, Shield, Palette, Globe, Database, Wifi, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGymData } from '../hooks/useGymData';

const sections = [
  { id: 'general', icon: Globe, title: 'General', description: 'Nombre del gimnasio, zona horaria y preferencias regionales' },
  { id: 'security', icon: Shield, title: 'Seguridad', description: 'Autenticación biométrica, anti-tailgating y control de acceso' },
  { id: 'notifications', icon: Bell, title: 'Notificaciones', description: 'Alertas por email, push y WhatsApp' },
  { id: 'appearance', icon: Palette, title: 'Apariencia', description: 'Tema, colores y personalización de la interfaz' },
  { id: 'integrations', icon: Wifi, title: 'Integraciones', description: 'Stripe, Wearables API, Supabase, Telegram' },
  { id: 'database', icon: Database, title: 'Base de Datos', description: 'PostgreSQL, TimescaleDB y Redis' },
  { id: 'pricing', icon: DollarSign, title: 'Precios y Planes', description: 'Configurar costos de membresías y daypasses' },
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
    <div style={{ padding: 24, background: 'var(--space-dark)', minHeight: '100vh', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Configuración</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 4 }}>Administración del sistema GymFuxionFit</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} /> Guardar Cambios
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
        <div className="glass-card" style={{ padding: 12, height: 'fit-content' }}>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8, border: 'none',
                background: activeTab === sec.id ? 'rgba(0,255,136,0.1)' : 'transparent',
                color: activeTab === sec.id ? 'var(--neon-green)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: '0.2s', textAlign: 'left'
              }}
            >
              <sec.icon size={18} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>{sec.title}</span>
            </button>
          ))}
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          {activeTab === 'pricing' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={20} color="var(--neon-green)" /> Precios y Planes
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>VALOR DÍA</label>
                  <input className="input-field" type="number" value={localPlans.dia} onChange={(e) => setLocalPlans({...localPlans, dia: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>VALOR SEMANA</label>
                  <input className="input-field" type="number" value={localPlans.semana} onChange={(e) => setLocalPlans({...localPlans, semana: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>MENSUALIDAD PRO</label>
                  <input className="input-field" type="number" value={localPlans.mes_pro} onChange={(e) => setLocalPlans({...localPlans, mes_pro: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>MENSUALIDAD HYROX</label>
                  <input className="input-field" type="number" value={localPlans.mes_hyrox} onChange={(e) => setLocalPlans({...localPlans, mes_hyrox: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'pricing' && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Sección {activeTab} en desarrollo</div>}
        </div>
      </div>
    </div>
  );
}
