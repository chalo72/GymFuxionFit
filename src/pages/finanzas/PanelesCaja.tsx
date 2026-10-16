import { useState, type CSSProperties } from 'react';
import { useGymData } from '../../hooks/useGymData';
import { creditoDe } from '../../lib/cuentaPiso';

export { CajaHoy, CuadreCaja, CuadresPasados } from './TurnoCajaPaneles';

const ASIST_KEY = 'fuxion_staff_asistencia';

function pesos(n: number) {
  return `$${Math.round(n || 0).toLocaleString('es-CO')}`;
}

function hoyISO() {
  return new Date().toISOString().split('T')[0];
}

export function ListaCreditos() {
  const { members } = useGymData();
  const deben = members.filter((m) => (m.debt || 0) > 0).sort((a, b) => (b.debt || 0) - (a.debt || 0));
  const total = deben.reduce((a, m) => a + (m.debt || 0), 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Tarjeta titulo="Total que deben los socios" valor={pesos(total)} color="#C5D1CC" />
      <div className="glass-card" style={{ padding: 8, borderRadius: 20 }}>
        {deben.length === 0 && <p style={{ padding: 20, color: 'var(--text-muted)' }}>Nadie tiene crédito pendiente.</p>}
        {deben.map((m) => {
          const c = creditoDe(m);
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontWeight: 800 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Productos {pesos(c.productos)} · Mensualidad {pesos(c.membresia)}
                  {m.phone ? ` · ${m.phone}` : ''}
                </div>
              </div>
              <div style={{ fontWeight: 900, color: '#C5D1CC' }}>{pesos(m.debt || 0)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ListaPrestamos() {
  const { staffLoans } = useGymData();
  const vivos = staffLoans.filter((l) => l.remaining > 0);
  return (
    <div className="glass-card" style={{ padding: 8, borderRadius: 20 }}>
      {vivos.length === 0 && <p style={{ padding: 20, color: 'var(--text-muted)' }}>No hay préstamos activos del personal.</p>}
      {vivos.map((l) => (
        <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div style={{ fontWeight: 800 }}>{l.staffName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.description || 'Préstamo'} · cuota {pesos(l.installment)}</div>
          </div>
          <div style={{ fontWeight: 900 }}>{pesos(l.remaining)}</div>
        </div>
      ))}
    </div>
  );
}

export function AsistenciaPersonal() {
  const { staff } = useGymData();
  const hoy = hoyISO();
  const activos = staff.filter((s) => s.status !== 'inactive');
  const [marcas, setMarcas] = useState<Record<string, boolean>>(() => {
    try {
      const all = JSON.parse(localStorage.getItem(ASIST_KEY) || '{}');
      return all[hoy] || {};
    } catch {
      return {};
    }
  });

  const marcar = (id: string, present: boolean) => {
    const next = { ...marcas, [id]: present };
    setMarcas(next);
    let all: Record<string, Record<string, boolean>> = {};
    try { all = JSON.parse(localStorage.getItem(ASIST_KEY) || '{}'); } catch { all = {}; }
    all[hoy] = next;
    localStorage.setItem(ASIST_KEY, JSON.stringify(all));
  };

  const presentes = activos.filter((s) => marcas[s.id] === true).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Tarjeta titulo="Presentes hoy" valor={`${presentes} de ${activos.length}`} color="var(--neon-green)" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {activos.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No hay personal cargado. Agrégalo en Nómina.</p>}
        {activos.map((s) => (
          <div key={s.id} className="glass-card" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ fontWeight: 800 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{s.role}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => marcar(s.id, true)} style={chip(marcas[s.id] === true)}>Vino</button>
              <button type="button" onClick={() => marcar(s.id, false)} style={chip(marcas[s.id] === false)}>No vino</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VentasInventario() {
  const { products, transactions } = useGymData();
  const hoy = hoyISO();
  const ventasHoy = transactions.filter((t) => t.date === hoy && t.type === 'income' && (t.category === 'product' || (t.description || '').toLowerCase().includes('producto') || (t.description || '').toLowerCase().includes('venta')));
  const total = ventasHoy.reduce((a, t) => a + (t.amount || 0), 0);
  const bajos = products.filter((p) => p.stock <= p.minStock);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="fin-kpis">
        <Tarjeta titulo="Ventas de productos hoy" valor={pesos(total)} color="var(--neon-green)" />
        <Tarjeta titulo="Productos bajos de stock" valor={String(bajos.length)} color={bajos.length ? '#C5D1CC' : '#fff'} />
      </div>
      <div className="glass-card" style={{ padding: 8, borderRadius: 20 }}>
        {products.length === 0 && <p style={{ padding: 20, color: 'var(--text-muted)' }}>No hay productos en inventario.</p>}
        {products.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontWeight: 800 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Venta {pesos(p.sellPrice)} · compra {pesos(p.buyPrice)}</div>
            </div>
            <div style={{ fontWeight: 900, color: p.stock <= p.minStock ? '#C5D1CC' : '#fff' }}>{p.stock} und</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tarjeta({ titulo, valor, color }: { titulo: string; valor: string; color: string }) {
  return (
    <div className="glass-card" style={{ padding: '18px 20px', borderRadius: 20 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 950, color, marginTop: 4 }}>{valor}</div>
    </div>
  );
}

function chip(on: boolean): CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 12,
    border: on ? '1px solid var(--neon-green)' : '1px solid rgba(255,255,255,0.12)',
    background: on ? 'rgba(0,255,136,0.15)' : 'transparent',
    color: on ? 'var(--neon-green)' : '#fff',
    fontWeight: 800,
    cursor: 'pointer',
  };
}
