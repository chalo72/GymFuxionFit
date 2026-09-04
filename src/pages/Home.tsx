import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, Wallet, Package, ArrowRight } from 'lucide-react';
import { useGymData } from '../hooks/useGymData';
import { useAuth } from '../contexts/AuthContext';
import mision from '../data/mision.json';
import versionData from '../../version.json';
import GymSwarm from '../components/enjambre/GymSwarm';
import { esGerencia } from '../lib/maintenanceAgent';

function daysUntil(dateStr?: string) {
  if (!dateStr) return null;
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const { members, transactions, products } = useGymData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const monthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const stats = useMemo(() => {
    const active = members.filter((m) => m.status === 'active');
    const expiring = members.filter((m) => {
      const d = daysUntil(m.expiryDate || m.expiry);
      return d !== null && d >= 0 && d <= 7;
    });
    const expired = members.filter((m) => m.status === 'expired' || (daysUntil(m.expiryDate || m.expiry) ?? 1) < 0);
    const withDebt = members.filter((m) => (m.debt || 0) > 0);
    const visitedToday = members.filter((m) => m.lastVisit && String(m.lastVisit).startsWith(today));
    const income = transactions
      .filter((t) => t.type === 'income' && t.date?.startsWith(monthStr))
      .reduce((a, t) => a + (t.amount || 0), 0);
    const lowStock = products.filter((p) => p.stock <= (p.minStock || 0));
    return { active, expiring, expired, withDebt, visitedToday, income, lowStock };
  }, [members, transactions, products, today, monthStr]);

  const greeting = user?.name?.split(' ')[0] || 'equipo';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 32 }}>
      <div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Hoy</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14 }}>
          Hola, {greeting}. Solo lo que necesita atención en el gym ahora.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 20, border: '1px solid var(--green-20)' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--neon-green)', letterSpacing: 1, marginBottom: 8 }}>
          QUÉ SE ESTÁ HACIENDO · v{versionData.version}
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{mision.objetivo}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{mision.dosSistemas.appGym}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{mision.ahora}</p>
        <p style={{ fontSize: 13 }}><strong>Siguiente:</strong> {mision.siguiente}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          <button type="button" className="btn btn-glow" onClick={() => navigate('/avisos')}>Avisos WhatsApp</button>
          <button type="button" className="btn" onClick={() => navigate('/piso-qr')}>Imprimir QR de piso</button>
          <button type="button" className="btn" onClick={() => navigate('/sala')}>Vista socio</button>
        </div>
      </div>

      <GymSwarm
        deudas={stats.withDebt}
        porVencer={stats.expiring}
        stockBajo={stats.lowStock}
        visitasHoy={stats.visitedToday.length}
        activos={stats.active.length}
      />

      {esGerencia(user?.role) && (
        <button
          type="button"
          className="glass-card"
          onClick={() => navigate('/mantenimiento')}
          style={{ padding: 20, textAlign: 'left', cursor: 'pointer', border: '1px solid rgba(255,107,129,0.35)', color: 'inherit' }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: '#ff6b81', letterSpacing: 1 }}>GERENCIA</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginTop: 6 }}>Abrir agente de mantenimiento</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            Conversación con el agente, errores, qué se mejora, cómo, por qué, dónde y para qué.
          </p>
        </button>
      )}

      <div className="kpi-row">
        <button className="kpi-card cyan" onClick={() => navigate('/members')} style={{ textAlign: 'left', cursor: 'pointer' }}>
          <div className="kpi-icon cyan"><Users size={20} /></div>
          <div className="kpi-label">Activos</div>
          <div className="kpi-value">{stats.active.length}</div>
          <div className="kpi-change">{stats.visitedToday.length} visitas hoy</div>
        </button>
        <button className="kpi-card orange" onClick={() => navigate('/members')} style={{ textAlign: 'left', cursor: 'pointer' }}>
          <div className="kpi-icon orange"><AlertTriangle size={20} /></div>
          <div className="kpi-label">Por vencer (7 días)</div>
          <div className="kpi-value">{stats.expiring.length}</div>
          <div className="kpi-change">{stats.expired.length} vencidos</div>
        </button>
        <button className="kpi-card green" onClick={() => navigate('/finances')} style={{ textAlign: 'left', cursor: 'pointer' }}>
          <div className="kpi-icon green"><Wallet size={20} /></div>
          <div className="kpi-label">Ingresos del mes</div>
          <div className="kpi-value">${stats.income.toLocaleString('es-CO')}</div>
          <div className="kpi-change">{stats.withDebt.length} con saldo</div>
        </button>
        <button className="kpi-card cyan" onClick={() => navigate('/inventory')} style={{ textAlign: 'left', cursor: 'pointer' }}>
          <div className="kpi-icon cyan"><Package size={20} /></div>
          <div className="kpi-label">Stock bajo</div>
          <div className="kpi-value">{stats.lowStock.length}</div>
          <div className="kpi-change">{products.length} productos</div>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Membresías a renovar</h3>
          {stats.expiring.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nadie vence en los próximos 7 días.</p>
          ) : (
            stats.expiring.slice(0, 8).map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.expiryDate || m.expiry}</span>
              </div>
            ))
          )}
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Saldos pendientes</h3>
          {stats.withDebt.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No hay deudas registradas.</p>
          ) : (
            stats.withDebt.slice(0, 8).map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--danger-red)' }}>
                  ${(m.debt || 0).toLocaleString('es-CO')}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Atajos</h3>
          {[
            { to: '/reception', label: 'Recepción y caja' },
            { to: '/members', label: 'Directorio de miembros' },
            { to: '/trainer', label: 'Atletas y planes' },
            { to: '/finances', label: 'Registrar movimiento' },
          ].map((a) => (
            <button
              key={a.to}
              onClick={() => navigate(a.to)}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'space-between', marginBottom: 6 }}
            >
              {a.label}
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
