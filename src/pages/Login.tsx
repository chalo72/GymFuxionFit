import { Dumbbell, KeyRound } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { useGymData } from '../hooks/useGymData';
import { mapStaffRole, loadUsers } from '../lib/localUsers';
import { pinesVisibles, rolDePin } from '../lib/pines';

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
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pines = pinesVisibles();

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/'} replace />;
  }

  const entrarConPin = async (codigo: string) => {
    const rol = rolDePin(codigo);
    if (!rol) { setError('Ese PIN no está. El de gerente es 2607.'); return; }
    await entrarDirecto(rol);
  };

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
            <p className="login-subtitle">Entra con el PIN. El de gerente es 2607.</p>
          </div>

          <form className="login-form" onSubmit={(e) => { e.preventDefault(); entrarConPin(pin); }}>
            <label className="input-label">PIN</label>
            <input
              className="input-field"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4 números"
              style={{ fontSize: 32, letterSpacing: 8, textAlign: 'center', fontWeight: 900 }}
            />
            <button type="submit" className="btn btn-glow" style={{ width: '100%', marginTop: 12 }} disabled={busy}>
              Entrar
            </button>
            {error && <p style={{ color: 'var(--danger-red)', fontSize: 13, fontWeight: 700 }}>{error}</p>}
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0 20px' }}>
            {pines.map((c) => (
              <button
                key={c.rol}
                type="button"
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'space-between' }}
                disabled={busy}
                onClick={() => entrarDirecto(c.rol)}
              >
                <span>Entrar como {c.nombre}</span>
                <strong>{c.pin}</strong>
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
