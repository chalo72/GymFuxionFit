import { Dumbbell, ScanFace, KeyRound, ShieldCheck, Dumbbell as DumbbellIcon, UserCheck } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';

const roleConfig: Record<UserRole, { label: string; description: string; redirect: string; color: string; icon: React.ReactNode }> = {
  admin: {
    label: 'Administrador',
    description: 'Control total del sistema',
    redirect: '/dashboard',
    color: '#00FF88',
    icon: <ShieldCheck size={18} />,
  },
  trainer: {
    label: 'Entrenador',
    description: 'Gestión de clientes y sesiones',
    redirect: '/trainer',
    color: '#FF6B35',
    icon: <DumbbellIcon size={18} />,
  },
  receptionist: {
    label: 'Recepción',
    description: 'Check-in, pagos y control',
    redirect: '/reception',
    color: '#A78BFA',
    icon: <UserCheck size={18} />,
  },
};

export default function Login() {
  const navigate   = useNavigate();
  const { login, isAuthenticated, user, loading } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  // 🛡️ MODO CRÍTICO: Redirección automática desactivada para romper bucles
  /*
  if (isAuthenticated && user) {
    const redirect = roleConfig[user.role]?.redirect ?? '/dashboard';
    console.log("🚀 Login: Usuario detectado, redirigiendo a:", redirect);
    return <Navigate to={redirect} replace />;
  }
  */

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    // FORZADO FÍSICO
    window.location.href = roleConfig[selectedRole].redirect;
  };

  const handleBiometricLogin = () => {
    login(selectedRole);
    window.location.href = roleConfig[selectedRole].redirect;
  };

  const handleQuickLogin = (role: UserRole) => {
    login(role);
    window.location.href = roleConfig[role].redirect;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* ─── HEADER ─── */}
          <div className="login-header">
            <div className="login-logo">
              <Dumbbell />
            </div>
            <h1 className="login-title">
              Gym<span>Fuxion</span>Fit
            </h1>
            <p className="login-subtitle">El Futuro del Fitness — Panel de Administración</p>
          </div>

          {/* ─── SELECTOR DE ROL ─── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              Acceder como
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(Object.entries(roleConfig) as [UserRole, typeof roleConfig[UserRole]][]).map(([role, cfg]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  style={{
                    padding: '12px 8px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: selectedRole === role ? `1px solid ${cfg.color}60` : '1px solid rgba(255,255,255,0.06)',
                    background: selectedRole === role ? `${cfg.color}12` : 'var(--space-medium)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span style={{ color: selectedRole === role ? cfg.color : 'var(--text-muted)' }}>{cfg.icon}</span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: selectedRole === role ? cfg.color : 'var(--text-secondary)' }}>
                    {cfg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ─── FORM ─── */}
          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Correo Electrónico</label>
              <input
                className="input-field"
                type="email"
                placeholder={`${selectedRole}@gymfuxionfit.com`}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--neon-green)' }} />
                Recordarme
              </label>
              <a href="#" style={{ fontSize: 'var(--text-xs)', color: 'var(--neon-green)' }}>
                ¿Contraseña olvidada?
              </a>
            </div>
            <button type="submit" className="btn btn-glow" style={{ width: '100%', marginTop: 4 }}>
              <KeyRound size={18} />
              Iniciar Sesión como {roleConfig[selectedRole].label}
            </button>
            <div className="login-divider"><span>O accede con</span></div>
            <button type="button" className="face-scan-btn" onClick={handleBiometricLogin}>
              <ScanFace size={22} />
              Reconocimiento Facial
            </button>
          </form>

          {/* ─── ACCESO RÁPIDO (DEMO) ─── */}
          <div style={{ marginTop: 24, padding: '16px', background: 'var(--space-medium)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,255,136,0.08)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, textAlign: 'center' }}>
              Acceso Demo Rápido
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(Object.entries(roleConfig) as [UserRole, typeof roleConfig[UserRole]][]).map(([role, cfg]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleQuickLogin(role)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${cfg.color}30`,
                    background: `${cfg.color}08`,
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    fontSize: 'var(--text-xs)', fontWeight: 600, color: cfg.color,
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${cfg.color}18`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${cfg.color}08`; }}
                >
                  {cfg.icon}
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 24 }}>
          © 2026 GymFuxionFit — Powered by AI + Biometrics
        </p>
      </div>
    </div>
  );
}
