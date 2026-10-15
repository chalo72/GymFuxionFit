import { useMemo, useState, type CSSProperties } from 'react';
import { useGymData } from '../../hooks/useGymData';
import { creditoDe } from '../../lib/cuentaPiso';

const CUADRES_KEY = 'fuxion_cuadres';
const ASIST_KEY = 'fuxion_staff_asistencia';

export type CuadreGuardado = {
  id: string;
  at: string;
  date: string;
  turno: string;
  efectivo: number;
  nequi: number;
  salidasEfectivo: number;
  contado: number;
  diferencia: number;
  nota: string;
};

function pesos(n: number) {
  return `$${Math.round(n || 0).toLocaleString('es-CO')}`;
}

function hoyISO() {
  return new Date().toISOString().split('T')[0];
}

function esEfectivo(method?: string) {
  return (method || '').toLowerCase().includes('efect');
}
function esNequi(method?: string) {
  return (method || '').toLowerCase().includes('nequi');
}
function esCredito(method?: string) {
  return (method || '').toLowerCase().includes('crédit') || (method || '').toLowerCase().includes('credit');
}

function loadCuadres(): CuadreGuardado[] {
  try {
    const raw = localStorage.getItem(CUADRES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CajaHoy() {
  const { transactions } = useGymData();
  const hoy = hoyISO();
  const delDia = transactions.filter((t) => t.date === hoy && !esCredito(t.method));
  const entro = delDia.filter((t) => t.type === 'income').reduce((a, t) => a + (t.amount || 0), 0);
  const salio = delDia.filter((t) => t.type === 'expense').reduce((a, t) => a + (t.amount || 0), 0);
  const efectivo = delDia.filter((t) => t.type === 'income' && esEfectivo(t.method)).reduce((a, t) => a + (t.amount || 0), 0);
  const nequi = delDia.filter((t) => t.type === 'income' && esNequi(t.method)).reduce((a, t) => a + (t.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fin-kpis">
        <Tarjeta titulo="Entró hoy" valor={pesos(entro)} color="var(--neon-green)" />
        <Tarjeta titulo="Salió hoy" valor={pesos(salio)} color="#ff6b6b" />
        <Tarjeta titulo="Efectivo" valor={pesos(efectivo)} color="#fff" />
        <Tarjeta titulo="Nequi" valor={pesos(nequi)} color="#00E5FF" />
      </div>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
        El cajón es solo efectivo. Nequi queda en el celular y no se cuenta con los billetes.
      </p>
      <div className="glass-card" style={{ padding: 8, borderRadius: 20 }}>
        {delDia.length === 0 && <p style={{ padding: 20, color: 'var(--text-muted)' }}>Hoy no hay movimientos en caja.</p>}
        {delDia.slice().reverse().map((t) => (
          <div key={String(t.id)} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontWeight: 800 }}>{t.description || 'Movimiento'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.time || ''} · {t.method || 'Sin método'}{t.client ? ` · ${t.client}` : ''}</div>
            </div>
            <div style={{ fontWeight: 900, color: t.type === 'income' ? 'var(--neon-green)' : '#ff6b6b', whiteSpace: 'nowrap' }}>
              {t.type === 'income' ? '+' : '−'}{pesos(t.amount || 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CuadreCaja({ onSaved }: { onSaved?: () => void }) {
  const { transactions } = useGymData();
  const hoy = hoyISO();
  const [turno, setTurno] = useState('Día');
  const [contado, setContado] = useState('');
  const [nota, setNota] = useState('');
  const [aviso, setAviso] = useState('');

  const cuentas = useMemo(() => {
    const delDia = transactions.filter((t) => t.date === hoy);
    const efectivo = delDia.filter((t) => t.type === 'income' && esEfectivo(t.method)).reduce((a, t) => a + (t.amount || 0), 0);
    const nequi = delDia.filter((t) => t.type === 'income' && esNequi(t.method)).reduce((a, t) => a + (t.amount || 0), 0);
    const salidasEfectivo = delDia.filter((t) => t.type === 'expense' && (esEfectivo(t.method) || !t.method)).reduce((a, t) => a + (t.amount || 0), 0);
    return { efectivo, nequi, salidasEfectivo, debeHaber: efectivo - salidasEfectivo };
  }, [transactions, hoy]);

  const contadoNum = Number(String(contado).replace(/\D/g, '')) || 0;
  const diferencia = contado === '' ? null : contadoNum - cuentas.debeHaber;

  const guardar = () => {
    if (contado === '') {
      setAviso('Escribe cuánto efectivo contaste.');
      return;
    }
    const item: CuadreGuardado = {
      id: `c_${Date.now()}`,
      at: new Date().toLocaleTimeString().slice(0, 5),
      date: hoy,
      turno,
      efectivo: cuentas.efectivo,
      nequi: cuentas.nequi,
      salidasEfectivo: cuentas.salidasEfectivo,
      contado: contadoNum,
      diferencia: contadoNum - cuentas.debeHaber,
      nota: nota.trim(),
    };
    const prev = loadCuadres();
    localStorage.setItem(CUADRES_KEY, JSON.stringify([item, ...prev].slice(0, 60)));
    setAviso('Cuadre guardado.');
    setContado('');
    setNota('');
    onSaved?.();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      <div className="glass-card" style={{ padding: 22, borderRadius: 24 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Lo que dice el sistema</h3>
        <Fila label="Efectivo que entró" valor={pesos(cuentas.efectivo)} />
        <Fila label="Efectivo que salió" valor={pesos(cuentas.salidasEfectivo)} />
        <Fila label="Debe haber en el cajón" valor={pesos(cuentas.debeHaber)} fuerte />
        <Fila label="Nequi (no va en el cajón)" valor={pesos(cuentas.nequi)} />
      </div>
      <div className="glass-card" style={{ padding: 22, borderRadius: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>Contar y cerrar</h3>
        <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Turno</label>
        <div style={{ display: 'flex', gap: 8, margin: '8px 0 14px' }}>
          {['Mañana', 'Tarde', 'Día'].map((t) => (
            <button key={t} type="button" onClick={() => setTurno(t)} style={chip(turno === t)}>{t}</button>
          ))}
        </div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Efectivo contado</label>
        <input value={contado} onChange={(e) => setContado(e.target.value)} inputMode="numeric" placeholder="Ej. 185000" style={campo} />
        {diferencia !== null && (
          <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900, color: diferencia === 0 ? 'var(--neon-green)' : '#ffb020' }}>
            {diferencia === 0 ? 'Cuadra exacto' : diferencia > 0 ? `Sobra ${pesos(diferencia)}` : `Falta ${pesos(Math.abs(diferencia))}`}
          </div>
        )}
        <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota opcional: vuelto, pago de agua..." style={{ ...campo, marginTop: 12 }} />
        <button type="button" onClick={guardar} style={{ marginTop: 14, width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: 'var(--neon-green)', color: '#000', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}>
          Guardar cuadre
        </button>
        {aviso && <p style={{ color: 'var(--neon-green)', fontWeight: 700 }}>{aviso}</p>}
      </div>
    </div>
  );
}

export function CuadresPasados() {
  const [lista, setLista] = useState<CuadreGuardado[]>(() => loadCuadres());
  return (
    <div className="glass-card" style={{ padding: 8, borderRadius: 20 }}>
      {lista.length === 0 && <p style={{ padding: 20, color: 'var(--text-muted)' }}>Todavía no hay cuadres guardados.</p>}
      {lista.map((c) => (
        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 800 }}>{c.date} · {c.turno} · {c.at}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Cajón {pesos(c.contado)} · sistema {pesos(c.efectivo - c.salidasEfectivo)} · Nequi {pesos(c.nequi)}
              {c.nota ? ` · ${c.nota}` : ''}
            </div>
          </div>
          <div style={{ fontWeight: 900, color: c.diferencia === 0 ? 'var(--neon-green)' : '#ffb020' }}>
            {c.diferencia === 0 ? 'Cuadró' : c.diferencia > 0 ? `Sobra ${pesos(c.diferencia)}` : `Falta ${pesos(Math.abs(c.diferencia))}`}
          </div>
        </div>
      ))}
      {lista.length > 0 && (
        <button type="button" onClick={() => { localStorage.removeItem(CUADRES_KEY); setLista([]); }} style={{ margin: 12, background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: 12 }}>
          Borrar historial de cuadres de este navegador
        </button>
      )}
    </div>
  );
}

export function ListaCreditos() {
  const { members } = useGymData();
  const deben = members.filter((m) => (m.debt || 0) > 0).sort((a, b) => (b.debt || 0) - (a.debt || 0));
  const total = deben.reduce((a, m) => a + (m.debt || 0), 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Tarjeta titulo="Total que deben los socios" valor={pesos(total)} color="#ffb020" />
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
              <div style={{ fontWeight: 900, color: '#ffb020' }}>{pesos(m.debt || 0)}</div>
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
        <Tarjeta titulo="Productos bajos de stock" valor={String(bajos.length)} color={bajos.length ? '#ffb020' : '#fff'} />
      </div>
      <div className="glass-card" style={{ padding: 8, borderRadius: 20 }}>
        {products.length === 0 && <p style={{ padding: 20, color: 'var(--text-muted)' }}>No hay productos en inventario.</p>}
        {products.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontWeight: 800 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Venta {pesos(p.sellPrice)} · compra {pesos(p.buyPrice)}</div>
            </div>
            <div style={{ fontWeight: 900, color: p.stock <= p.minStock ? '#ffb020' : '#fff' }}>{p.stock} und</div>
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

function Fila({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: fuerte ? 900 : 600 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span>{valor}</span>
    </div>
  );
}

const campo: CSSProperties = {
  width: '100%',
  marginTop: 6,
  padding: '14px 16px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(0,0,0,0.35)',
  color: '#fff',
  fontSize: 16,
};

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
