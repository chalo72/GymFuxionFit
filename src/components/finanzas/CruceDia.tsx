import { useMemo, useState } from 'react';
import { useGymData } from '../../hooks/useGymData';
import {
  MARCAS, armarCruce, conteoDe, guardarCamaras, guardarConteo, leerCamaras, type Camara,
} from '../../lib/cruceDia';
import { fechaClave, pesos } from '../../lib/turnosCaja';

export default function CruceDia({ cajaEsperada }: { cajaEsperada?: number }) {
  const { members, transactions } = useGymData();
  const fecha = fechaClave(Date.now());
  const [cams, setCams] = useState<Camara[]>(() => leerCamaras());
  const [tick, setTick] = useState(0);
  const [nombre, setNombre] = useState('Puerta principal');
  const [marca, setMarca] = useState(MARCAS[0]);
  const [zona, setZona] = useState<Camara['zona']>('entrada');
  const [canal, setCanal] = useState('');
  const cruce = useMemo(() => armarCruce(members, transactions, fecha), [members, transactions, fecha, tick, cams]);

  const agregar = () => {
    if (!nombre.trim()) return;
    const next = [...cams, { id: `cam_${Date.now()}`, nombre: nombre.trim(), marca, zona, canal: canal.trim() }];
    guardarCamaras(next);
    setCams(next);
    setCanal('');
  };

  const anotar = (id: string, valor: string) => {
    if (valor.trim() === '') return;
    guardarConteo(id, fecha, Number(valor.replace(/\D/g, '')) || 0);
    setTick((n) => n + 1);
  };

  return (
    <section className="turno-card cruce">
      <header>
        <strong>Cruce del día</strong>
        <span>Cámara, puerta y caja</span>
      </header>
      <p>Anota el número que muestra el DVR. La app lo compara con quien recepción marcó, si está entrenando o de visita, y con lo que pagó.</p>
      <div className="turno-kpis">
        <Dato titulo="Cámara en la puerta" valor={cruce.camaraEntrada === null ? '—' : String(cruce.camaraEntrada)} />
        <Dato titulo="Marcados en la app" valor={String(cruce.appEntraron)} />
        <Dato titulo="Diferencia" valor={cruce.diferencia === null ? '—' : cruce.diferencia === 0 ? 'Igual' : cruce.diferencia > 0 ? `+${cruce.diferencia} en cámara` : `${cruce.diferencia} en app`} />
        <Dato titulo="En sala ahora" valor={String(cruce.enSala)} />
      </div>
      <div className="turno-kpis">
        <Dato titulo="Mensualidad" valor={String(cruce.mensual.n)} sub={cruce.mensual.nombres.join(', ')} />
        <Dato titulo="Día" valor={String(cruce.diario.n)} sub={cruce.diario.nombres.join(', ')} />
        <Dato titulo="Visita" valor={String(cruce.visita.n)} sub={cruce.visita.nombres.join(', ')} />
        <Dato titulo="Cámara de sala" valor={cruce.camaraSala === null ? '—' : String(cruce.camaraSala)} />
      </div>
      <div className="turno-kpis">
        <Dato titulo="Pagaron efectivo" valor={`${cruce.pagaronEfectivo.n} · ${pesos(cruce.efectivoPesos)}`} />
        <Dato titulo="Pagaron Nequi" valor={`${cruce.pagaronNequi.n} · ${pesos(cruce.nequiPesos)}`} />
        <Dato titulo="Se fueron en crédito" valor={String(cruce.credito.n)} sub={cruce.credito.nombres.join(', ')} />
        <Dato titulo="Llegaron y no pagaron" valor={String(cruce.sinPago.n)} sub={cruce.sinPago.nombres.join(', ')} />
      </div>
      <div className="turno-aparte">
        <span>Mensualidad al día, sin cobro hoy: {cruce.cubiertos.n}</span>
        <span>Nequi del día {pesos(cruce.nequiPesos)} · no va en el cajón</span>
        {cajaEsperada !== undefined && <span>Al entregar la caja debe haber {pesos(cajaEsperada)}</span>}
      </div>

      <div className="cruce-cams">
        {cams.length === 0 && <p>Todavía no hay cámaras. Agrega la de la puerta y, si quieres, la de la sala.</p>}
        {cams.map((c) => (
          <label key={c.id}>
            <span>{c.nombre} · {c.marca} · {c.zona}{c.canal ? ` · ${c.canal}` : ''}</span>
            <input
              inputMode="numeric"
              defaultValue={conteoDe(c.id, fecha) ?? ''}
              placeholder="Número del DVR hoy"
              onBlur={(e) => anotar(c.id, e.target.value)}
            />
          </label>
        ))}
      </div>
      <style>{`
        .cruce-cams, .cruce-nueva { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .cruce-cams label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
        .cruce-nueva { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cruce-nueva select { min-height: 52px; border-radius: 16px; background: rgba(0,0,0,.35); color: #fff; border: 1px solid rgba(255,255,255,.12); padding: 0 12px; }
        @media (max-width: 800px) { .cruce-nueva { grid-template-columns: 1fr; } }
      `}</style>
      <details>
        <summary>Agregar una cámara, si todavía no está</summary>
      <div className="cruce-nueva">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre, ej. Puerta" />
        <select value={marca} onChange={(e) => setMarca(e.target.value)}>
          {MARCAS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select value={zona} onChange={(e) => setZona(e.target.value as Camara['zona'])}>
          <option value="entrada">Entrada, cuenta gente</option>
          <option value="sala">Sala, quién está adentro</option>
        </select>
        <input value={canal} onChange={(e) => setCanal(e.target.value)} placeholder="Canal o modelo, opcional" />
        <button type="button" className="turno-principal" onClick={agregar}>Guardar cámara</button>
      </div>
      </details>
    </section>
  );
}

function Dato({ titulo, valor, sub }: { titulo: string; valor: string; sub?: string }) {
  return (
    <div className="turno-kpi">
      <span>{titulo}</span>
      <strong>{valor}</strong>
      {sub && <small style={{ display: 'block', marginTop: 4, color: 'rgba(255,255,255,.55)' }}>{sub}</small>}
    </div>
  );
}
