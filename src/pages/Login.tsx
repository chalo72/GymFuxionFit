import { Dumbbell, KeyRound } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { useGymData } from '../hooks/useGymData';
import { mapStaffRole, loadUsers, ACCESO_DIRECTO } from '../lib/localUsers';

export const ROLE_HOME: Record<UserRole, string> = {
  admin: '/',
  trainer: '/trainer',
  receptionist: '/reception',
  client: '/sala',
  athlete: '/sala',
};

export default function Login() {
  const navigate = useNavigate();
  const {
    loginWithPassword, registerFirstAdmin, loginAsStaff, accesoDirecto,
    isAuthenticated, user, hasLocalUsers,
  } = useAuth();
  const { staff } = useGymData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/'} replace />;
  }

  const entrarDirecto = async (role: UserRole) => {
    setError('');
    setBusy(true);
    try {
      const err = await accesoDirecto(role);
      if (err) { setError(err); return; }
      navigate(ROLE_HOME[role] ?? '/');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (!hasLocalUsers) {
        const err = await registerFirstAdmin(name, email, password);
        if (err) { setError(err); return; }
        navigate('/');
        return;
      }
      const local = await loginWithPassword(email, password);
      if (!local.error && local.role) {
        navigate(ROLE_HOME[local.role]);
        return;
      }
      const staffHit = (staff || []).find(
        (s) => (s.email || '').toLowerCase() === email.trim().toLowerCase() && s.status !== 'inactive'
      );
      if (staffHit) {
        const staffErr = await loginAsStaff({
          id: staffHit.id,
          name: staffHit.name,
          email: staffHit.email || email.trim().toLowerCase(),
          role: mapStaffRole(staffHit.role),
          tempPassword: staffHit.tempPassword,
        }, password);
        if (staffErr) { setError(staffErr); return; }
        navigate(ROLE_HOME[mapStaffRole(staffHit.role)]);
        return;
      }
      setError(local.error || 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo"><Dumbbell /></div>
            <h1 className="login-title">Gym<span>Fuxion</span>Fit</h1>
            <p className="login-subtitle">Acceso directo temporal · clave {ACCESO_DIRECTO.clave}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {ACCESO_DIRECTO.cuentas.map((c) => (
              <button
                key={c.role}
                type="button"
                className="btn btn-glow"
                style={{ width: '100%' }}
                disabled={busy}
                onClick={() => entrarDirecto(c.role)}
              >
                Entrar como {c.name}
              </button>
            ))}
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>O con correo y clave</p>
            {!hasLocalUsers && (
              <div className="input-group">
                <label className="input-label">Nombre</label>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Correo</label>
              <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p style={{ color: 'var(--danger-red)', fontSize: 13, fontWeight: 700 }}>{error}</p>}
            <button type="submit" className="btn btn-ghost" style={{ width: '100%' }} disabled={busy}>
              <KeyRound size={18} />
              {busy ? 'Validando…' : 'Entrar con correo'}
            </button>
          </form>
          {hasLocalUsers && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
              {loadUsers().map((u) => `${u.role}: ${u.email}`).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
