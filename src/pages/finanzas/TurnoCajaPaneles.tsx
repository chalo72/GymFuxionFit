import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Moon, Sun, Sunset, Minus, Plus } from 'lucide-react';
import { useGymData } from '../../hooks/useGymData';
import { useAuth } from '../../contexts/AuthContext';
import {
  BILLETES, MONEDAS, duracion, fechaClave, horaCorta, leerTurnos, guardarTurnos,
  pesos, resumirTurno, turnoAbierto, turnoSugerido, type NombreTurno, type TurnoCaja,
} from '../../lib/turnosCaja';
import { armarCruce } from '../../lib/cruceDia';
import CruceDia from '../../components/finanzas/CruceDia';

const TURNOS: { id: NombreTurno; icon: typeof Sun; rango: string }[] = [
  { id: 'Mañana', icon: Sun, rango: 'Hasta el mediodía' },
  { id: 'Tarde', icon: Sunset, rango: 'Mediodía a las 6' },
  { id: 'Noche', icon: Moon, rango: 'Después de las 6' },
];

function hoyISO() {
  return fechaClave(Date.now());
}

function useTurnos() {
  const [lista, setLista] = useState<TurnoCaja[]>(() => leerTurnos());
  const guardar = (next: TurnoCaja[]) => {
    guardarTurnos(next);
    setLista(next);
  };
  return { lista, abierto: turnoAbierto(lista), guardar };
}

export function CajaHoy({ onCuadre }: { onCuadre?: () => void }) {
  const { transactions, staff, injectTransaction } = useGymData();
  const { user } = useAuth();
  const { abierto, guardar, lista } = useTurnos();
  const [nombre, setNombre] = useState<NombreTurno>(turnoSugerido());
  const [fondo, setFondo] = useState('');
  const [quien, setQuien] = useState(user?.name || '');
  const [aviso, setAviso] = useState('');
  const [mov, setMov] = useState<'entrada' | 'salida' | null>(null);
  const [monto, setMonto] = useState('');
  const [motivo, setMotivo] = useState('');

  const resumen = useMemo(
    () => (abierto ? resumirTurno(transactions, abierto) : null),
    [transactions, abierto],
  );

  const abrir = () => {
    if (abierto) return;
    if (fondo.trim() === '') {
      setAviso('Escribe la base. Si el cajón arranca vacío, pon 0.');
      return;
    }
    const item: TurnoCaja = {
      id: `t_${Date.now()}`,
      nombre,
      estado: 'abierto',
      abiertoAt: Date.now(),
      responsable: quien.trim() || user?.name || 'Recepción',
      fondo: Number(String(fondo).replace(/\D/g, '')) || 0,
      efectivoEntro: 0, efectivoSalio: 0, nequi: 0, credito: 0,
      esperado: 0, contado: 0, diferencia: 0, nota: '',
    };
    guardar([item, ...lista]);
    setAviso('');
  };

  const mover = async () => {
    const valor = Number(String(monto).replace(/\D/g, '')) || 0;
    if (!mov || valor <= 0) {
      setAviso('Escribe cuánto efectivo entra o sale.');
      return;
    }
    const ahora = new Date();
    await injectTransaction({
      date: hoyISO(),
      time: ahora.toLocaleTimeString().slice(0, 5),
      description: `Caja · ${mov === 'entrada' ? 'entrada' : 'salida'}: ${motivo.trim() || 'efectivo'}`,
      category: 'other',
      type: mov === 'entrada' ? 'income' : 'expense',
      amount: valor,
      method: 'Efectivo',
      client: abierto?.responsable,
    });
    setMonto('');
    setMotivo('');
    setMov(null);
    setAviso(mov === 'entrada' ? 'Entrada anotada en el turno.' : 'Salida anotada en el turno.');
  };

  const cancelarVacio = () => {
    if (!abierto || !resumen) return;
    if (resumen.delTurno.length > 0) {
      setAviso('Este turno ya tiene movimientos. Ciérralo en el cuadre.');
      return;
    }
    guardar(lista.filter((t) => t.id !== abierto.id));
  };

  if (!abierto || !resumen) {
    const equipo = staff.filter((s) => s.status !== 'inactive').slice(0, 6);
    return (
      <div className="turno-wrap">
        <Estilos />
        <section className="turno-hero">
          <p className="turno-kicker">Caja cerrada</p>
          <h3>Abrir turno</h3>
          <p>Esta es la caja principal: el cajón de billetes. Paso 1: elige mañana, tarde o noche. Paso 2: escribe quién lo tiene. Paso 3: pon la base, aunque sea cero, y abre. Nequi y el fiado no van en esa base.</p>
        </section>
        <div className="turno-opciones">
          {TURNOS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} type="button" className={nombre === t.id ? 'on' : ''} onClick={() => setNombre(t.id)}>
                <Icon size={22} />
                <strong>{t.id}</strong>
                <small>{t.rango}</small>
              </button>
            );
          })}
        </div>
        {equipo.length > 0 && (
          <div className="turno-equipo">
            {equipo.map((s) => (
              <button key={s.id} type="button" className={quien === s.name ? 'on' : ''} onClick={() => setQuien(s.name)}>{s.name}</button>
            ))}
          </div>
        )}
        <label>Quién tiene la caja</label>
        <input value={quien} onChange={(e) => setQuien(e.target.value)} placeholder="Nombre de recepción" />
        <label>Base en el cajón</label>
        <input value={fondo} onChange={(e) => setFondo(e.target.value)} inputMode="numeric" placeholder="Ej. 50000 o 0" />
        <button type="button" className="turno-principal" onClick={abrir}>Abrir turno</button>
        {aviso && <p className="turno-aviso">{aviso}</p>}
      </div>
    );
  }

  return (
    <div className="turno-wrap">
      <Estilos />
      <section className="turno-banner">
        <div>
          <p className="turno-kicker">Turno abierto</p>
          <h3>{abierto.nombre} · {abierto.responsable}</h3>
          <p>Desde {horaCorta(abierto.abiertoAt)} · {duracion(abierto.abiertoAt)}</p>
        </div>
        <span className="turno-pill">En curso</span>
      </section>
      <div className="turno-kpis">
        <Kpi titulo="Base" valor={pesos(abierto.fondo)} />
        <Kpi titulo="Efectivo que entró" valor={pesos(resumen.efectivoEntro)} />
        <Kpi titulo="Efectivo que salió" valor={pesos(resumen.efectivoSalio)} rojo />
        <Kpi titulo="Debe haber en el cajón" valor={pesos(resumen.esperado)} fuerte />
      </div>
      <p className="turno-leyenda">Ese número sale así: base + efectivo que entró − efectivo que salió. Para cuadrar, toca Contar y cerrar y compara con los billetes que tienes en la mano.</p>
      <div className="turno-aparte">
        <span>Nequi {pesos(resumen.nequi)} · no está en el cajón</span>
        <span>Crédito {pesos(resumen.credito)} · no es plata de caja</span>
      </div>
      <div className="turno-acciones">
        <button type="button" onClick={() => setMov(mov === 'entrada' ? null : 'entrada')}>Meter efectivo</button>
        <button type="button" onClick={() => setMov(mov === 'salida' ? null : 'salida')}>Sacar efectivo</button>
        <button type="button" className="turno-principal" onClick={onCuadre}>Cerrar: contar la plata y las bebidas que quedaron</button>
      </div>
      {mov && (
        <div className="turno-mov">
          <strong>{mov === 'entrada' ? 'Meter plata al cajón, aparte de las ventas' : 'Sacar plata del cajón'}</strong>
          <p>Las ventas y el Nequi no se escriben aquí. Entran solos cuando se cobran en Recepción.</p>
          <input value={monto} onChange={(e) => setMonto(e.target.value)} inputMode="numeric" placeholder="Cuánto" />
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Para qué: vueltos, agua, base..." />
          <button type="button" className="turno-principal" onClick={mover}>Anotar</button>
        </div>
      )}
      <details className="turno-card">
        <summary>Cámaras, solo si quieres compararlas después</summary>
        <CruceDia cajaEsperada={resumen.esperado} />
      </details>
      <div className="turno-lista">
        {resumen.delTurno.length === 0 && <p>Todavía no hay movimientos en este turno.</p>}
        {resumen.delTurno.slice().reverse().map((t) => (
          <div key={String(t.id)}>
            <div>
              <strong>{t.description || 'Movimiento'}</strong>
              <small>{t.time || ''} · {t.method || 'Sin método'}{t.client ? ` · ${t.client}` : ''}</small>
            </div>
            <b className={t.type === 'income' ? 'mas' : 'menos'}>{t.type === 'income' ? '+' : '−'}{pesos(t.amount || 0)}</b>
          </div>
        ))}
      </div>
      {aviso && <p className="turno-aviso">{aviso}</p>}
      <button type="button" className="turno-texto" onClick={cancelarVacio}>Este turno se abrió por error</button>
    </div>
  );
}

const BEBIDAS = [
  { id: 'agua' as const, titulo: 'Agua' },
  { id: 'gaseosa' as const, titulo: 'Gaseosa' },
  { id: 'electrolito' as const, titulo: 'Electrolitos' },
];

function esBebida(nombre: string, cual: 'agua' | 'gaseosa' | 'electrolito') {
  const n = nombre.toLowerCase();
  if (cual === 'agua') return n.includes('agua') && !n.includes('gaseosa');
  if (cual === 'gaseosa') return n.includes('gaseosa');
  return n.includes('gator') || n.includes('electrol');
}

export function CuadreCaja() {
  const { transactions, members, products, updateProduct } = useGymData();
  const [, setParams] = useSearchParams();
  const { abierto, lista, guardar } = useTurnos();
  const [conteo, setConteo] = useState<Record<number, string>>({});
  const [bodega, setBodega] = useState<Record<'agua' | 'gaseosa' | 'electrolito', string>>({ agua: '', gaseosa: '', electrolito: '' });
  const [nota, setNota] = useState('');
  const [aviso, setAviso] = useState('');

  const resumen = useMemo(
    () => (abierto ? resumirTurno(transactions, abierto) : null),
    [transactions, abierto],
  );
  const dia = useMemo(() => armarCruce(members, transactions), [members, transactions]);

  const contado = [...BILLETES, ...MONEDAS].reduce((a, v) => a + (Number(conteo[v] || 0) * v), 0);
  const hayConteo = Object.values(conteo).some((n) => Number(n) > 0);
  const diferencia = resumen && hayConteo ? contado - resumen.esperado : null;

  const poner = (valor: number, delta: number) => {
    const actual = Number(conteo[valor] || 0);
    const next = Math.max(0, actual + delta);
    setConteo({ ...conteo, [valor]: next ? String(next) : '' });
  };

  const cerrar = () => {
    if (!abierto || !resumen) return;
    if (!hayConteo) {
      setAviso('Cuenta al menos un billete o una moneda.');
      return;
    }
    const dif = contado - resumen.esperado;
    if (dif < -5000 && !window.confirm(`Faltan ${pesos(Math.abs(dif))}. ¿Cierras el turno igual?`)) return;
    const quedaron: NonNullable<TurnoCaja['bodega']> = {};
    for (const b of BEBIDAS) {
      if (bodega[b.id] === '') continue;
      const n = Math.max(0, Number(bodega[b.id]) || 0);
      quedaron[b.id] = n;
      const hit = products.find((p) => esBebida(p.name, b.id));
      if (hit) updateProduct(hit.id, { stock: n });
    }
    const cerrado: TurnoCaja = {
      ...abierto,
      estado: 'cerrado',
      cerradoAt: Date.now(),
      efectivoEntro: resumen.efectivoEntro,
      efectivoSalio: resumen.efectivoSalio,
      nequi: resumen.nequi,
      credito: resumen.credito,
      esperado: resumen.esperado,
      contado,
      diferencia: dif,
      nota: nota.trim(),
      bodega: quedaron,
    };
    guardar(lista.map((t) => (t.id === abierto.id ? cerrado : t)));
    setConteo({});
    setNota('');
    setAviso('Turno cerrado. Quedó en Turnos cerrados.');
  };

  if (!abierto || !resumen) {
    return (
      <div className="turno-wrap">
        <Estilos />
        <section className="turno-hero">
          <p className="turno-kicker">Caja cerrada</p>
          <h3>Primero abre la caja</h3>
          <p>El cierre cuenta los billetes que quedaron. Sin turno abierto no hay nada que cerrar. Las ventas y el Nequi no se escriben aquí.</p>
          <button type="button" className="turno-principal" onClick={() => setParams({}, { replace: true })}>Abrir la caja</button>
        </section>
      </div>
    );
  }

  const ventas = resumen.efectivoEntro + resumen.nequi;

  return (
    <div className="turno-wrap">
      <Estilos />
      <section className="turno-banner">
        <div>
          <p className="turno-kicker">Cerrar caja · {abierto.nombre}</p>
          <h3>Así quedó el día</h3>
          <p>{abierto.responsable} · desde {horaCorta(abierto.abiertoAt)}</p>
        </div>
        <strong className="turno-esperado">{pesos(resumen.esperado)}</strong>
      </section>
      <p className="turno-leyenda">Para cerrar solo escribes dos cosas. Las ventas, el Nequi y los créditos ya entraron en Recepción: no se vuelven a escribir.</p>
      <p className="turno-leyenda">En el cajón debe haber {pesos(resumen.esperado)}. Eso es la base más el efectivo, menos lo que salió.</p>

      <section className="turno-escribir">
        <h3>1. Aquí metes la plata que quedó en el cajón</h3>
        <p className="turno-leyenda">Cuenta los billetes que tienes en la mano. El + suma uno. Esto es la plata física, no las ventas.</p>
        <div className="turno-denoms">
          {BILLETES.map((v) => (
            <Denom key={v} valor={v} cant={conteo[v] || ''} onChange={(n) => setConteo({ ...conteo, [v]: n })} onStep={(d) => poner(v, d)} />
          ))}
          {MONEDAS.map((v) => (
            <Denom key={v} valor={v} cant={conteo[v] || ''} onChange={(n) => setConteo({ ...conteo, [v]: n })} onStep={(d) => poner(v, d)} moneda />
          ))}
        </div>
        <div className={`turno-resultado ${diferencia === 0 ? 'ok' : diferencia !== null && diferencia < 0 ? 'falta' : ''}`}>
          <span>Plata contada {pesos(contado)} · debía haber {pesos(resumen.esperado)}</span>
          <strong>
            {diferencia === null ? 'Falta contar la plata' : diferencia === 0 ? 'Cuadra exacto' : diferencia > 0 ? `Sobra ${pesos(diferencia)}` : `Falta ${pesos(Math.abs(diferencia))}`}
          </strong>
        </div>
      </section>

      <section className="turno-escribir">
        <h3>2. Aquí cuentas agua, gaseosa y electrolitos</h3>
        <p className="turno-leyenda">Cuántas botellas quedaron en la nevera. No es plata. Si no las contaste, déjalas vacías.</p>
        {BEBIDAS.map((b) => {
          const enNevera = products.find((p) => esBebida(p.name, b.id));
          return (
            <div key={b.id} className="turno-bebida">
              <span>
                <strong>{b.titulo}</strong>
                <small>{enNevera ? `En la app ahora: ${enNevera.stock}` : 'Se guarda en este cierre'}</small>
              </span>
              <button type="button" onClick={() => setBodega({ ...bodega, [b.id]: String(Math.max(0, Number(bodega[b.id] || 0) - 1)) })} aria-label={`Quitar ${b.titulo}`}>−</button>
              <input
                inputMode="numeric"
                value={bodega[b.id]}
                placeholder="0"
                onChange={(e) => setBodega({ ...bodega, [b.id]: e.target.value.replace(/\D/g, '') })}
              />
              <button type="button" onClick={() => setBodega({ ...bodega, [b.id]: String(Number(bodega[b.id] || 0) + 1) })} aria-label={`Sumar ${b.titulo}`}>+</button>
            </div>
          );
        })}
      </section>

      <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota: vueltos, quién recibe la caja..." />
      <button type="button" className="turno-principal" onClick={cerrar}>Cerrar la caja con esta plata y estas bebidas</button>

      <h3 className="turno-dia">Solo para mirar. Esto ya se cobró</h3>
      <div className="turno-kpis">
        <Kpi titulo="Clientes que entraron" valor={String(dia.appEntraron)} />
        <Kpi titulo="Ventas cobradas" valor={pesos(ventas)} />
        <Kpi titulo="Pago en efectivo" valor={pesos(resumen.efectivoEntro)} />
        <Kpi titulo="Pago en Nequi" valor={pesos(resumen.nequi)} />
        <Kpi titulo="Créditos, no van al cajón" valor={pesos(resumen.credito)} />
        <Kpi titulo="Salió del cajón" valor={pesos(resumen.efectivoSalio)} rojo />
        <Kpi titulo="Base con la que abriste" valor={pesos(abierto.fondo)} />
        <Kpi titulo="Debe haber al cerrar" valor={pesos(resumen.esperado)} fuerte />
      </div>
      {aviso && <p className="turno-aviso">{aviso}</p>}
    </div>
  );
}

export function CuadresPasados() {
  const [lista, setLista] = useState<TurnoCaja[]>(() => leerTurnos());
  const [fecha, setFecha] = useState(hoyISO());
  const delDia = lista.filter((t) => fechaClave(t.abiertoAt) === fecha);
  const titulo = new Date(`${fecha}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  const mover = (dias: number) => {
    const d = new Date(`${fecha}T12:00:00`);
    d.setDate(d.getDate() + dias);
    const next = fechaClave(d.getTime());
    if (next > hoyISO()) return;
    setFecha(next);
  };

  return (
    <div className="turno-wrap">
      <Estilos />
      <div className="turno-fecha">
        <button type="button" onClick={() => mover(-1)} aria-label="Día anterior">←</button>
        <input type="date" value={fecha} max={hoyISO()} onChange={(e) => e.target.value && setFecha(e.target.value)} />
        <button type="button" onClick={() => mover(1)} disabled={fecha >= hoyISO()} aria-label="Día siguiente">→</button>
        {fecha !== hoyISO() && <button type="button" onClick={() => setFecha(hoyISO())}>Hoy</button>}
      </div>
      <h3 className="turno-dia">{titulo}</h3>
      {delDia.length === 0 && <section className="turno-hero"><p>Ese día no hay turnos de caja.</p></section>}
      {delDia.map((t) => (
        <article key={t.id} className="turno-card">
          <header>
            <strong>{t.nombre} · {t.responsable}</strong>
            <span className={t.estado === 'abierto' ? 'abierto' : ''}>{t.estado === 'abierto' ? 'Abierto' : 'Cerrado'}</span>
          </header>
          <p>{horaCorta(t.abiertoAt)}{t.cerradoAt ? ` – ${horaCorta(t.cerradoAt)}` : ' – sigue abierto'} · {duracion(t.abiertoAt, t.cerradoAt)}</p>
          <div className="turno-kpis mini">
            <Kpi titulo="Base" valor={pesos(t.fondo)} />
            <Kpi titulo="Esperado" valor={t.estado === 'cerrado' ? pesos(t.esperado) : '—'} />
            <Kpi titulo="Contado" valor={t.estado === 'cerrado' ? pesos(t.contado) : '—'} />
            <Kpi titulo="Nequi" valor={pesos(t.nequi)} />
          </div>
          {t.estado === 'cerrado' && (
            <p className={t.diferencia === 0 ? 'ok' : 'alerta'}>
              {t.diferencia === 0 ? 'Cuadró' : t.diferencia > 0 ? `Sobró ${pesos(t.diferencia)}` : `Faltó ${pesos(Math.abs(t.diferencia))}`}
              {t.nota ? ` · ${t.nota}` : ''}
            </p>
          )}
          {t.bodega && (t.bodega.agua !== undefined || t.bodega.gaseosa !== undefined || t.bodega.electrolito !== undefined) && (
            <p>Quedaron: agua {t.bodega.agua ?? '—'} · gaseosa {t.bodega.gaseosa ?? '—'} · electrolitos {t.bodega.electrolito ?? '—'}</p>
          )}
        </article>
      ))}
      {lista.length > 0 && (
        <button type="button" className="turno-texto" onClick={() => { localStorage.removeItem('fuxion_turnos'); setLista([]); }}>
          Borrar historial de turnos de este navegador
        </button>
      )}
    </div>
  );
}

function Kpi({ titulo, valor, fuerte, rojo }: { titulo: string; valor: string; fuerte?: boolean; rojo?: boolean }) {
  return (
    <div className={`turno-kpi${fuerte ? ' fuerte' : ''}${rojo ? ' rojo' : ''}`}>
      <span>{titulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function Denom({ valor, cant, onChange, onStep, moneda }: { valor: number; cant: string; onChange: (n: string) => void; onStep: (d: number) => void; moneda?: boolean }) {
  const n = Number(cant || 0);
  return (
    <div className={`turno-den${moneda ? ' moneda' : ''}`}>
      <span>{pesos(valor)}</span>
      <button type="button" onClick={() => onStep(-1)} aria-label="Quitar"><Minus size={16} /></button>
      <input inputMode="numeric" value={cant} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} />
      <button type="button" onClick={() => onStep(1)} aria-label="Sumar"><Plus size={16} /></button>
      <b>{pesos(n * valor)}</b>
    </div>
  );
}

function Estilos() {
  return (
    <style>{`
      .turno-wrap { display: flex; flex-direction: column; gap: 12px; }
      .turno-kicker { margin: 0; color: var(--neon-green); font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
      .turno-hero, .turno-banner, .turno-card {
        border-radius: 24px; padding: 18px 20px;
        background: #6E877F;
        border: 1px solid rgba(0,255,136,.22);
      }
      .turno-hero h3, .turno-banner h3 { margin: 4px 0; font-size: 26px; }
      .turno-hero p, .turno-banner p, .turno-card p { margin: 0; color: rgba(255,255,255,.72); font-size: 14px; }
      .turno-banner, .turno-card header { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
      .turno-pill, .turno-card header span {
        border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 900;
        background: rgba(0,255,136,.15); color: var(--neon-green);
      }
      .turno-card header span.abierto { background: #2A3834; color: #C5D1CC; }
      .turno-opciones, .turno-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
      .turno-kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .turno-opciones button, .turno-equipo button {
        min-height: 88px; border-radius: 18px; border: 1px solid rgba(255,255,255,.1);
        background: rgba(0,0,0,.28); color: #fff; cursor: pointer; padding: 12px;
      }
      .turno-opciones button.on, .turno-equipo button.on { border-color: var(--neon-green); background: rgba(0,255,136,.12); color: var(--neon-green); }
      .turno-opciones strong, .turno-opciones small { display: block; }
      .turno-opciones small { color: rgba(255,255,255,.6); margin-top: 4px; }
      .turno-equipo { display: flex; flex-wrap: wrap; gap: 8px; }
      .turno-equipo button { min-height: 44px; border-radius: 999px; padding: 8px 14px; font-weight: 800; }
      .turno-wrap label { font-size: 13px; font-weight: 800; color: rgba(255,255,255,.7); }
      .turno-wrap input, .turno-mov input {
        width: 100%; min-height: 52px; border-radius: 16px; border: 1px solid rgba(255,255,255,.12);
        background: rgba(0,0,0,.35); color: #fff; font-size: 16px; padding: 12px 14px;
      }
      .turno-principal {
        min-height: 56px; border: none; border-radius: 16px; background: var(--neon-green); color: #04140c;
        font-weight: 900; font-size: 16px; cursor: pointer;
      }
      .turno-acciones, .turno-mov { display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 8px; }
      .turno-mov { grid-template-columns: 1fr; }
      .turno-acciones button { min-height: 52px; border-radius: 16px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); color: #fff; font-weight: 800; cursor: pointer; }
      .turno-kpi { border-radius: 18px; padding: 14px; background: rgba(0,0,0,.28); border: 1px solid rgba(255,255,255,.06); }
      .turno-kpi span { display: block; font-size: 12px; color: rgba(255,255,255,.62); }
      .turno-kpi strong { display: block; margin-top: 4px; font-size: 22px; }
      .turno-kpi.fuerte strong { color: var(--neon-green); font-size: 26px; }
      .turno-kpi.rojo strong { color: #C5D1CC; }
      .turno-aparte { display: flex; flex-wrap: wrap; gap: 8px; }
      .turno-aparte span { border-radius: 999px; padding: 8px 12px; background: rgba(255,255,255,.05); font-size: 13px; font-weight: 700; }
      .turno-lista { border-radius: 20px; background: rgba(0,0,0,.22); }
      .turno-lista > div, .turno-lista > p { display: flex; justify-content: space-between; gap: 12px; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.05); }
      .turno-lista small { display: block; color: rgba(255,255,255,.55); }
      .turno-lista .mas { color: var(--neon-green); }
      .turno-lista .menos { color: #C5D1CC; }
      .turno-esperado { font-size: 28px; color: var(--neon-green); }
      .turno-leyenda { margin: 0; color: rgba(255,255,255,.7); font-size: 14px; }
      .turno-escribir { display: flex; flex-direction: column; gap: 10px; border: 2px solid #C8F542; border-radius: 20px; padding: 16px; }
      .turno-escribir h3 { margin: 0; }
      .turno-bebida { display: grid; grid-template-columns: 1fr 44px 72px 44px; gap: 8px; align-items: center; }
      .turno-bebida small { display: block; color: rgba(255,255,255,.55); font-weight: 600; }
      .turno-bebida button { min-height: 44px; border-radius: 12px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05); color: #fff; cursor: pointer; font-size: 20px; }
      .turno-denoms { display: flex; flex-direction: column; gap: 8px; }
      .turno-den { display: grid; grid-template-columns: 92px 44px 72px 44px 1fr; gap: 8px; align-items: center; }
      .turno-den button { min-height: 44px; border-radius: 12px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05); color: #fff; cursor: pointer; }
      .turno-den input { min-height: 44px; text-align: center; font-weight: 900; }
      .turno-den b { text-align: right; }
      .turno-den.moneda span { color: #8A9C96; }
      .turno-resultado { display: flex; justify-content: space-between; align-items: center; gap: 12px; border-radius: 18px; padding: 16px; background: rgba(42,56,52,.55); color: #C5D1CC; font-size: 18px; }
      .turno-resultado.ok, .turno-card .ok { background: rgba(0,255,136,.12); color: var(--neon-green); }
      .turno-resultado.falta, .turno-card .alerta { background: rgba(42,56,52,.7); color: #C5D1CC; }
      .turno-fecha { display: flex; gap: 8px; align-items: center; }
      .turno-fecha button { min-height: 44px; min-width: 44px; border-radius: 12px; border: 1px solid rgba(255,255,255,.12); background: transparent; color: #fff; font-weight: 900; cursor: pointer; }
      .turno-dia { margin: 0; text-transform: capitalize; }
      .turno-card header { margin-bottom: 6px; }
      .turno-kpis.mini { margin-top: 10px; }
      .turno-aviso { color: var(--neon-green); font-weight: 800; margin: 0; }
      .turno-texto { background: none; border: none; color: rgba(255,255,255,.45); cursor: pointer; text-align: left; }
      @media (max-width: 800px) {
        .turno-kpis, .turno-opciones, .turno-acciones { grid-template-columns: 1fr 1fr; }
        .turno-acciones .turno-principal { grid-column: 1 / -1; }
        .turno-den { grid-template-columns: 78px 44px 64px 44px 1fr; }
      }
    `}</style>
  );
}
