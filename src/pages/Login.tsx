import { Dumbbell } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { rolDePin } from '../lib/pines';

export const ROLE_HOME: Record<UserRole, string> = {
  admin: '/',
  trainer: '/trainer',
  receptionist: '/reception',
  client: '/',
  athlete: '/',
};

export default function Login() {
  const navigate = useNavigate();
  const { accesoDirecto, isAuthenticated, user } = useAuth();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/'} replace />;
  }

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const quien = name.trim();
    if (!quien) { setError('Escribe tu nombre.'); return; }
    if (pin.length < 4) { setError('El PIN tiene 4 números.'); return; }
    const rol = rolDePin(pin);
    if (!rol) { setError('Ese PIN no está.'); return; }
    setBusy(true);
    try {
      const err = await accesoDirecto(rol, quien);
      if (err) { setError(err); return; }
      navigate(ROLE_HOME[rol] ?? '/');
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
            <p className="login-subtitle">Escribe tu nombre y tu PIN.</p>
          </div>

          <form className="login-form" onSubmit={entrar}>
            <div className="input-group">
              <label className="input-label">Nombre</label>
              <input
                className="input-field"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div className="input-group">
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
            </div>
            {error && <p style={{ color: 'var(--danger-red)', fontSize: 13, fontWeight: 700 }}>{error}</p>}
            <button type="submit" className="btn btn-glow" style={{ width: '100%', marginTop: 12 }} disabled={busy}>
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
