import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, Wallet, Package, ArrowRight, UserCheck, Dumbbell } from 'lucide-react';
import { useGymData } from '../hooks/useGymData';
import { useAuth } from '../contexts/AuthContext';
import mision from '../data/mision.json';
import versionData from '../../version.json';
import GymSwarm from '../components/enjambre/GymSwarm';
import { esGerencia } from '../lib/maintenanceAgent';
import { diasMoratoria } from '../lib/accessGate';
import { asignarNumeros, leerPasos } from '../lib/puerta';

function daysUntil(dateStr?: string) {
  if (!dateStr) return null;
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const { members, transactions, products, plans } = useGymData();
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
    const enSala = members.filter((m) => m.presence?.inGym);
    const numeros = asignarNumeros(members.map((m) => m.id));
    const pasosHoy = leerPasos().filter((p) => p.date === today && p.action === 'ENTRADA');
    const dia = plans.find((p) => p.id === 'dia')?.price || 0;
    const mes = plans.find((p) => p.id === 'mes_basico')?.price || 0;
    return { active, expiring, expired, withDebt, visitedToday, income, lowStock, enSala, numeros, pasosHoy, dia, mes };
  }, [members, transactions, products, plans, today, monthStr]);

  const greeting = user?.name?.split(' ')[0] || 'equipo';
  const socio = user?.role === 'client' || user?.role === 'athlete';
  const principal = user?.role === 'trainer'
    ? { to: '/trainer', label: 'Ver mis atletas' }
    : socio
      ? { to: '/entreno', label: 'Empezar entreno' }
      : { to: '/reception', label: 'Abrir recepción' };
  const agenda = user?.role === 'trainer' ? [
    { to: '/trainer', label: 'Mis atletas', hint: 'Quién entrena hoy', icon: Users },
    { to: '/schedule', label: 'Agenda', hint: 'Horarios', icon: ArrowRight },
    { to: '/entreno', label: 'Sesión', hint: 'Series, discos y descanso', icon: Dumbbell },
    { to: '/elite-plan', label: 'Plan', hint: 'Armar rutina', icon: Dumbbell },
    { to: '/nutrition', label: 'Nutrición', hint: 'Comidas', icon: Package },
  ] : socio ? [
    { to: '/sala', label: 'Sala', hint: 'Zonas y QR', icon: ArrowRight },
    { to: '/entreno', label: 'Sesión', hint: 'Anotar series', icon: Dumbbell },
    { to: '/client/training', label: 'Zonas', hint: 'Piso del gym', icon: Dumbbell },
    { to: '/client/nutrition', label: 'Comida', hint: 'Tu día', icon: Package },
    { to: '/client/progress', label: 'Progreso', hint: 'Cómo vas', icon: Users },
  ] : [
    { to: '/reception', label: 'Recepción', hint: 'Entrada y cuenta', icon: UserCheck },
    { to: '/finances', label: 'Caja', hint: 'Cobros y cuadre', icon: Wallet },
    { to: '/finances?tab=personal', label: 'Personal', hint: 'Empleados y nómina', icon: Users },
    { to: '/members', label: 'Socios', hint: 'Fichas', icon: Users },
    { to: '/inventory', label: 'Inventario', hint: 'Productos', icon: Package },
    { to: '/avisos', label: 'Avisos', hint: 'WhatsApp', icon: AlertTriangle },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>
      <section className="fit-hero">
        <p className="fit-kicker">Gym Fuxion Fit</p>
        <h2>Hola, {greeting}.<br /><span>Hoy en el gym.</span></h2>
        <svg className="fit-silueta" viewBox="0 0 200 260" aria-hidden>
          <ellipse cx="100" cy="248" rx="54" ry="8" fill="rgba(200,245,66,0.18)" />
          <path d="M100 28c10 0 18 8 18 18s-8 18-18 18-18-8-18-18 8-18 18-18zm-28 52c8 6 18 10 28 10s20-4 28-10l16 28-18 8 8 36-16 54-10-28-10 28-16-54 8-36-18-8 16-28z" fill="none" stroke="#C8F542" strokeWidth="3" />
          <path d="M78 118c18 22 26 22 44 0" fill="none" stroke="#C8F542" strokeWidth="2" opacity="0.7" />
        </svg>
        <button type="button" className="fit-cta" onClick={() => navigate(principal.to)}>{principal.label}</button>
      </section>

      <div className="fit-agenda">
        {agenda.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.to} type="button" className="fit-fila" onClick={() => navigate(a.to)}>
              <i><Icon size={18} /></i>
              <span>
                <strong>{a.label}</strong>
                <small>{a.hint}</small>
              </span>
            </button>
          );
        })}
      </div>

      {user?.role !== 'client' && user?.role !== 'athlete' && (
        <section className="hoy-sala">
          <div className="hoy-sala-maquinas" aria-hidden />
          <div className="hoy-sala-contenido">
            <p className="hoy-sala-kicker">Sala en vivo</p>
            <h3>Hoy en el gym</h3>
            <div className="hoy-sala-nums">
              <button type="button" onClick={() => navigate('/reception')}>
                <strong>{stats.enSala.length}</strong>
                <span>adentro ahora</span>
              </button>
              <button type="button" onClick={() => navigate('/reception')}>
                <strong>{Math.max(stats.visitedToday.length, stats.pasosHoy.length)}</strong>
                <span>visitas de hoy</span>
              </button>
              <button type="button" onClick={() => navigate('/members')}>
                <strong>{stats.active.length}</strong>
                <span>socios activos</span>
              </button>
            </div>
            <div className="hoy-chips">
              {stats.enSala.length === 0 && <span className="hoy-chip vacio">La sala está vacía. La entrada se marca en Recepción.</span>}
              {stats.enSala.slice(0, 8).map((m) => (
                <button key={m.id} type="button" className="hoy-chip" onClick={() => navigate('/reception')}>
                  #{stats.numeros[m.id]} {m.name}
                </button>
              ))}
            </div>
            <div className="hoy-precios">
              <span>Día ${Number(stats.dia).toLocaleString('es-CO')}</span>
              <span>Mensualidad ${Number(stats.mes).toLocaleString('es-CO')}</span>
              <span>Moratoria {diasMoratoria()} días</span>
              {esGerencia(user?.role) && (
                <button type="button" onClick={() => navigate('/settings?tab=pricing')}>Cambiar precios</button>
              )}
            </div>
          </div>
        </section>
      )}

      <details className="glass-card" style={{ padding: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 800 }}>Notas de la versión {versionData.version}</summary>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>{mision.objetivo}</p>
      </details>

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
          <div style={{ fontSize: 11, fontWeight: 800, color: '#C5D1CC', letterSpacing: 1 }}>GERENCIA</div>
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
