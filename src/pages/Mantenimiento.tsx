import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import versionData from '../../version.json';
import mision from '../data/mision.json';
import {
  clearMaint,
  conversacionDe,
  esGerencia,
  fallosDe,
  horaTxtMaint,
  loadMaint,
  MEJORAS_HECHAS,
  MaintEvent,
} from '../lib/maintenanceAgent';

function useMaintLog() {
  const [rows, setRows] = useState<MaintEvent[]>(() => loadMaint());
  useEffect(() => {
    const sync = () => setRows(loadMaint());
    window.addEventListener('fuxion-maint-update', sync);
    const id = setInterval(sync, 1500);
    return () => {
      window.removeEventListener('fuxion-maint-update', sync);
      clearInterval(id);
    };
  }, []);
  return [rows, setRows] as const;
}

export default function Mantenimiento() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useMaintLog();

  const fallos = useMemo(() => fallosDe(rows), [rows]);
  const trail = useMemo(
    () => rows.filter((r) => r.tipo === 'accion' || r.tipo === 'ruta').slice(0, 25),
    [rows],
  );
  const hilo = useMemo(() => conversacionDe(rows), [rows]);

  if (!esGerencia(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#ff6b81', letterSpacing: 1 }}>GERENCIA</div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wrench size={22} /> Agente de mantenimiento
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 14, maxWidth: 640 }}>
            Conversación con el agente y con el taller de Cursor. Qué se hace, cómo, por qué, dónde y para qué.
            Versión {versionData.version}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Hoy</button>
          <button type="button" className="btn btn-ghost" onClick={() => { clearMaint(); setRows([]); }}>Vaciar log</button>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card orange">
          <div className="kpi-label">Fallos abiertos</div>
          <div className="kpi-value">{fallos.length}</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Clics / pantallas</div>
          <div className="kpi-value">{trail.length}</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Mejoras ya hechas</div>
          <div className="kpi-value">{MEJORAS_HECHAS.length}</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Siguiente</div>
          <div className="kpi-change" style={{ fontSize: 13, lineHeight: 1.4 }}>{mision.siguiente}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div className="glass-card" style={{ padding: 16, maxHeight: '70vh', overflow: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--neon-green)', marginBottom: 12 }}>
            CONVERSACIÓN · AGENTE ↔ TALLER
          </div>
          {hilo.map((m) => {
            const mio = m.de === 'taller';
            return (
              <div
                key={m.id}
                style={{
                  marginBottom: 12,
                  padding: 14,
                  borderRadius: 14,
                  border: `1px solid ${mio ? 'rgba(0,255,136,0.25)' : 'rgba(255,107,129,0.25)'}`,
                  background: mio ? 'rgba(0,255,136,0.06)' : 'rgba(255,107,129,0.06)',
                  marginLeft: mio ? 24 : 0,
                  marginRight: mio ? 0 : 24,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <strong style={{ color: mio ? 'var(--neon-green)' : '#ff6b81', fontSize: 12 }}>
                    {m.de === 'taller' ? 'Taller Cursor' : 'Agente de mantenimiento'}
                  </strong>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{horaTxtMaint(m.t)}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>{m.titulo}</div>
                <p style={{ fontSize: 13, margin: '0 0 6px' }}><strong>Qué:</strong> {m.que}</p>
                <p style={{ fontSize: 13, margin: '0 0 6px', color: 'var(--text-secondary)' }}><strong>Cómo:</strong> {m.como}</p>
                <p style={{ fontSize: 13, margin: '0 0 6px', color: 'var(--text-secondary)' }}><strong>Por qué:</strong> {m.porQue}</p>
                <p style={{ fontSize: 13, margin: '0 0 6px', color: 'var(--text-secondary)' }}><strong>Dónde:</strong> {m.donde}</p>
                <p style={{ fontSize: 13, margin: 0, color: 'var(--text-secondary)' }}><strong>Para qué:</strong> {m.paraQue}</p>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--neon-green)', marginBottom: 10 }}>
              QUÉ ESTÁN MEJORANDO
            </div>
            {MEJORAS_HECHAS.map((x) => (
              <div key={x.que} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{x.que}</div>
                <div style={{ color: 'var(--text-muted)' }}>Dónde: {x.donde}</div>
                <div style={{ color: 'var(--text-muted)' }}>Para qué: {x.paraQue}</div>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: 16, maxHeight: 280, overflow: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: '#00E5FF', marginBottom: 10 }}>
              RASTRO EN VIVO (clics y pantallas)
            </div>
            {trail.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Navega la app: aquí se ve a dónde entras y qué botón tocas.</p>
            ) : (
              trail.map((e) => (
                <div key={e.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {horaTxtMaint(e.t)} · {e.tipo} · {e.pantalla}
                  {e.boton ? ` · ${e.boton}` : ''}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
