import { useMemo, useState } from 'react';
import { useGymData } from '../hooks/useGymData';
import {
  MARCAS, armarCruce, conteoDe, guardarCamaras, guardarConteo, leerCamaras, type Camara,
} from '../lib/cruceDia';
import { fechaClave } from '../lib/turnosCaja';

export default function Camaras() {
  const { members, transactions } = useGymData();
  const fecha = fechaClave(Date.now());
  const [cams, setCams] = useState<Camara[]>(() => leerCamaras());
  const [nums, setNums] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    leerCamaras().forEach((c) => {
      const n = conteoDe(c.id, fecha);
      if (n !== null) base[c.id] = String(n);
    });
    return base;
  });
  const [tick, setTick] = useState(0);
  const [nombre, setNombre] = useState('');
  const [zona, setZona] = useState<Camara['zona']>('entrada');
  const [marca, setMarca] = useState(MARCAS[0]);
  const cruce = useMemo(() => armarCruce(members, transactions, fecha), [members, transactions, fecha, tick, cams]);

  const guardarHoy = () => {
    cams.forEach((c) => {
      if (nums[c.id] === undefined || nums[c.id] === '') return;
      guardarConteo(c.id, fecha, Number(nums[c.id]) || 0);
    });
    setTick((n) => n + 1);
  };

  const agregar = () => {
    const limpio = nombre.trim();
    if (!limpio) return;
    const next = [...cams, { id: `cam_${Date.now()}`, nombre: limpio, marca, zona, canal: '' }];
    guardarCamaras(next);
    setCams(next);
    setNombre('');
  };

  const quitar = (id: string) => {
    const next = cams.filter((c) => c.id !== id);
    guardarCamaras(next);
    setCams(next);
  };

  const dif = cruce.diferencia;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40, maxWidth: 720 }}>
      <h1 style={{ margin: 0 }}>Cámaras</h1>
      <div className="empieza-grid">
        <div className="empieza-card">
          <span className="empieza-n">1</span>
          <strong>{cruce.camaraEntrada === null ? '—' : cruce.camaraEntrada}</strong>
          <span>Contó la puerta</span>
        </div>
        <div className="empieza-card">
          <span className="empieza-n">2</span>
          <strong>{cruce.appEntraron}</strong>
          <span>Marcó la app</span>
        </div>
        <div className="empieza-card">
          <span className="empieza-n">3</span>
          <strong>{dif === null ? '—' : dif === 0 ? 'Igual' : dif > 0 ? `+${dif}` : String(dif)}</strong>
          <span>Diferencia</span>
        </div>
      </div>

      {cams.map((c) => (
        <div key={c.id} className="empieza-card">
          <span>{c.zona === 'entrada' ? 'Puerta' : 'Sala'} · {c.marca}</span>
          <strong>{c.nombre}</strong>
          <input
            className="input-field"
            inputMode="numeric"
            placeholder="Personas hoy"
            value={nums[c.id] ?? ''}
            onChange={(e) => setNums({ ...nums, [c.id]: e.target.value.replace(/\D/g, '') })}
            style={{ fontSize: 28, fontWeight: 900, textAlign: 'center' }}
          />
          <button type="button" className="btn btn-ghost" onClick={() => quitar(c.id)}>Quitar</button>
        </div>
      ))}

      <button type="button" className="btn btn-glow" onClick={guardarHoy} disabled={cams.length === 0}>
        Guardar el conteo de hoy
      </button>

      <div className="empieza-card">
        <strong>Nueva cámara</strong>
        <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className={zona === 'entrada' ? 'btn btn-glow' : 'btn btn-ghost'} onClick={() => setZona('entrada')}>Puerta</button>
          <button type="button" className={zona === 'sala' ? 'btn btn-glow' : 'btn btn-ghost'} onClick={() => setZona('sala')}>Sala</button>
        </div>
        <select className="input-field" value={marca} onChange={(e) => setMarca(e.target.value)}>
          {MARCAS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <button type="button" className="btn btn-glow" onClick={agregar}>Agregar</button>
      </div>
    </div>
  );
}
