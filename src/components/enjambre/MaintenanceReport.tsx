import { useEffect, useState } from 'react';
import { clearMaint, fallosDe, loadMaint, MaintEvent } from '../../lib/maintenanceAgent';

function hora(t: number) {
  return new Date(t).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function MaintenanceReport() {
  const [rows, setRows] = useState<MaintEvent[]>(() => loadMaint());

  useEffect(() => {
    const sync = () => setRows(loadMaint());
    window.addEventListener('fuxion-maint-update', sync);
    const id = setInterval(sync, 2000);
    return () => {
      window.removeEventListener('fuxion-maint-update', sync);
      clearInterval(id);
    };
  }, []);

  const fallos = fallosDe(rows);
  const acciones = rows.filter((r) => r.tipo === 'accion' || r.tipo === 'ruta').slice(0, 12);

  return (
    <div className="glass-card" style={{ padding: 20, border: '1px solid rgba(255,61,87,0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#ff6b81', letterSpacing: 1 }}>AGENTE DE MANTENIMIENTO</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Guarda errores, enlaces rotos y clics. El chat de Cursor lee esto al abrir sesión y repara.
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => { clearMaint(); setRows([]); }}>
          Vaciar log
        </button>
      </div>

      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
        Fallos: {fallos.length}
      </div>
      {fallos.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin fallos registrados en este navegador.</p>
      ) : (
        <div style={{ maxHeight: 180, overflow: 'auto', marginBottom: 14 }}>
          {fallos.slice(0, 20).map((e) => (
            <div key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 12 }}>
              <strong style={{ color: '#ff6b81' }}>{e.tipo}</strong>
              {' · '}
              <span>{hora(e.t)}</span>
              {' · pantalla '}
              <code>{e.pantalla}</code>
              {e.boton ? <> · botón “{e.boton}”</> : null}
              {e.modo ? <> · {e.modo}</> : null}
              <div style={{ color: 'var(--text-muted)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{e.detalle}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Últimos clics y pantallas</div>
      <div style={{ maxHeight: 140, overflow: 'auto' }}>
        {acciones.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Aún no hay rastro de clics.</p>
        ) : (
          acciones.map((e) => (
            <div key={e.id} style={{ fontSize: 12, padding: '4px 0', color: 'var(--text-secondary)' }}>
              {hora(e.t)} · {e.tipo} · {e.pantalla}
              {e.boton ? ` · ${e.boton}` : ''}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
