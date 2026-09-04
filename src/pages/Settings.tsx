import { Save, Bell, Shield, Palette, Globe, Database, Wifi, DollarSign, KeyRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGymData } from '../hooks/useGymData';
import { useAuth } from '../contexts/AuthContext';
import { loadUsers, type UserRole } from '../lib/localUsers';

const sections = [
  { id: 'general', icon: Globe, title: 'General', description: 'Nombre del gimnasio, zona horaria y preferencias regionales' },
  { id: 'accesos', icon: KeyRound, title: 'Accesos', description: 'Claves de gerencia, entrenador y recepción' },
  { id: 'security', icon: Shield, title: 'Seguridad', description: 'Autenticación biométrica, anti-tailgating y control de acceso' },
  { id: 'notifications', icon: Bell, title: 'Notificaciones', description: 'Alertas por email, push y WhatsApp' },
  { id: 'appearance', icon: Palette, title: 'Apariencia', description: 'Tema, colores y personalización de la interfaz' },
  { id: 'integrations', icon: Wifi, title: 'Integraciones', description: 'Stripe, Wearables API, Supabase, Telegram' },
  { id: 'database', icon: Database, title: 'Base de Datos', description: 'PostgreSQL, TimescaleDB y Redis' },
  { id: 'pricing', icon: DollarSign, title: 'Precios y Planes', description: 'Configurar costos de membresías y daypasses' },
];

function AccesosPanel() {
  const { upsertAccount, user } = useAuth();
  const [accounts, setAccounts] = useState(() => loadUsers());
  const [name, setName] = useState('Recepción');
  const [email, setEmail] = useState('recepcion@gymfuxionfit.local');
  const [role, setRole] = useState<UserRole>('receptionist');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const save = async () => {
    setMsg('');
    const err = await upsertAccount({ name, email, role, password });
    if (err) { setMsg(err); return; }
    setAccounts(loadUsers());
    setPassword('');
    setMsg('Cuenta guardada. Esa clave queda en este navegador (no se puede leer después; solo cambiarla).');
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Accesos del gym</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        La clave de gerencia es la que creaste al abrir la primera cuenta. No está guardada en texto: no la puedo adivinar.
        Aquí creas o cambias gerencia, entrenador y recepción.
      </p>
      <p style={{ fontSize: 13, marginBottom: 16 }}>
        Sesión actual: <strong>{user?.email}</strong> ({user?.role})
      </p>
      <div style={{ marginBottom: 20 }}>
        {accounts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aún no hay cuentas en este navegador.</p>}
        {accounts.map((a) => (
          <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13 }}>
            <strong>{a.role}</strong> · {a.name} · {a.email}
          </div>
        ))}
      </div>
      <div className="input-group" style={{ marginBottom: 10 }}>
        <label className="input-label">Rol</label>
        <select className="input-field" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          <option value="admin">Gerencia (admin)</option>
          <option value="trainer">Entrenador</option>
          <option value="receptionist">Recepcionista</option>
        </select>
      </div>
      <div className="input-group" style={{ marginBottom: 10 }}>
        <label className="input-label">Nombre</label>
        <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="input-group" style={{ marginBottom: 10 }}>
        <label className="input-label">Correo</label>
        <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="input-group" style={{ marginBottom: 10 }}>
        <label className="input-label">Nueva contraseña (mín. 6)</label>
        <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {msg && <p style={{ fontSize: 13, marginBottom: 10 }}>{msg}</p>}
      <button type="button" className="btn btn-primary" onClick={save}>Guardar acceso</button>
    </div>
  );
}

export default function Settings() {
  const [gymName, setGymName] = useState('GymFuxionFit Montería');
  const [timezone, setTimezone] = useState('America/Bogota');
  const [faceAuth, setFaceAuth] = useState(true);
  const [antiTailgating, setAntiTailgating] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  const { plansConfig, updatePlansConfig } = useGymData();
  const [localPlans, setLocalPlans] = useState(() => {
    const p = plansConfig || { dia: 5000, semana: 25000, quincena: 30000, mes_basico: 45000, mes_pro: 75000, mes_hyrox: 120000 };
    return {
      dia: String(p.dia || ''),
      semana: String(p.semana || ''),
      quincena: String(p.quincena || ''),
      mes_basico: String(p.mes_basico || ''),
      mes_pro: String(p.mes_pro || ''),
      mes_hyrox: String(p.mes_hyrox || '')
    };
  });

  const handleSave = () => {
    updatePlansConfig({
      ...plansConfig,
      dia: Number(localPlans.dia),
      semana: Number(localPlans.semana),
      quincena: Number(localPlans.quincena),
      mes_basico: Number(localPlans.mes_basico),
      mes_pro: Number(localPlans.mes_pro),
      mes_hyrox: Number(localPlans.mes_hyrox)
    });
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
          {activeTab === 'accesos' && <AccesosPanel />}
          {activeTab === 'pricing' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={20} color="var(--neon-green)" /> Precios y Planes
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>VALOR DÍA</label>
                  <input className="input-field" type="number" value={localPlans.dia} onChange={(e) => setLocalPlans({...localPlans, dia: e.target.value})} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>VALOR SEMANA</label>
                  <input className="input-field" type="number" value={localPlans.semana} onChange={(e) => setLocalPlans({...localPlans, semana: e.target.value})} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>VALOR QUINCENA</label>
                  <input className="input-field" type="number" value={localPlans.quincena || ''} onChange={(e) => setLocalPlans({...localPlans, quincena: e.target.value})} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>MENSUALIDAD BÁSICA</label>
                  <input className="input-field" type="number" value={localPlans.mes_basico} onChange={(e) => setLocalPlans({...localPlans, mes_basico: e.target.value})} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>MENSUALIDAD PRO</label>
                  <input className="input-field" type="number" value={localPlans.mes_pro} onChange={(e) => setLocalPlans({...localPlans, mes_pro: e.target.value})} />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>MENSUALIDAD HYROX</label>
                  <input className="input-field" type="number" value={localPlans.mes_hyrox} onChange={(e) => setLocalPlans({...localPlans, mes_hyrox: e.target.value})} />
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'pricing' && activeTab !== 'accesos' && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Sección {activeTab} en desarrollo</div>}
        </div>
      </div>
    </div>
  );
}
