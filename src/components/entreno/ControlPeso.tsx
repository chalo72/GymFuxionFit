import { useEffect, useMemo, useState } from 'react';
import {
  calentamiento, discos, guardarSesiones, historialPeso, hoyISO, leerSesiones,
  sugerir, ultimaSerie, type Sesion,
} from '../../lib/entreno';

function id() { return `${Date.now()}_${Math.random().toString(16).slice(2, 6)}`; }
function paso(n: number, delta: number) {
  return Math.max(0, Math.round((n + delta) * 2) / 2);
}

export default function ControlPeso() {
  const [sesiones, setSesiones] = useState<Sesion[]>(() => leerSesiones());
  const [nombre, setNombre] = useState('Press de banca');
  const [peso, setPeso] = useState(20);
  const [reps, setReps] = useState(8);
  const [rir, setRir] = useState(2);
  const [aviso, setAviso] = useState('');

  const previa = useMemo(() => ultimaSerie(nombre, sesiones), [nombre, sesiones]);
  const historia = useMemo(() => historialPeso(nombre, sesiones), [nombre, sesiones]);
  const tope = Math.max(1, ...historia.map((h) => h.peso), peso);
  const carga = discos(peso, 20);

  useEffect(() => {
    const s = sugerir(nombre);
    setPeso(s.peso);
    setReps(s.reps);
  }, [nombre]);

  const anotar = () => {
    const serie = { id: id(), tipo: 'normal' as const, peso, reps, rir, hecha: true };
    const hoy = sesiones.find((s) => s.fecha === hoyISO()) || {
      id: id(), fecha: hoyISO(), titulo: 'Sesión de hoy', ejercicios: [], nota: '',
    };
    const ya = hoy.ejercicios.find((e) => e.nombre.toLowerCase() === nombre.trim().toLowerCase());
    const ejercicios = ya
      ? hoy.ejercicios.map((e) => e.id === ya.id ? { ...e, series: [...e.series, serie] } : e)
      : [...hoy.ejercicios, { id: id(), nombre: nombre.trim() || 'Ejercicio', musculo: 'Cuerpo', series: [serie] }];
    const next = { ...hoy, ejercicios };
    const lista = [next, ...sesiones.filter((s) => s.id !== next.id)];
    guardarSesiones(lista);
    setSesiones(lista);
    setAviso(`Anotado: ${peso} kg × ${reps}. La próxima vez se compara con este peso.`);
  };

  return (
    <section className="bloque peso-box">
      <p className="fit-kicker">Control del peso</p>
      <input className="nombre-grande" value={nombre} onChange={(e) => setNombre(e.target.value)} aria-label="Ejercicio" />
      <p className="antes">
        {previa
          ? `La vez pasada, ${previa.fecha}: ${previa.peso} kg × ${previa.reps}. Hoy ${peso > previa.peso ? 'vas más arriba' : peso < previa.peso ? 'vas más suave' : 'repites el mismo peso'}.`
          : 'Primera vez con este ejercicio. El peso que anotes queda para compararlo después.'}
      </p>
      <div className="peso-grande">
        <button type="button" onClick={() => setPeso((n) => paso(n, -5))}>-5</button>
        <button type="button" onClick={() => setPeso((n) => paso(n, -2.5))}>-2.5</button>
        <strong>{peso}<small> kg</small></strong>
        <button type="button" onClick={() => setPeso((n) => paso(n, 2.5))}>+2.5</button>
        <button type="button" onClick={() => setPeso((n) => paso(n, 5))}>+5</button>
      </div>
      <div className="peso-grande chico">
        <button type="button" onClick={() => setReps((n) => Math.max(1, n - 1))}>-1</button>
        <strong>{reps}<small> reps</small></strong>
        <button type="button" onClick={() => setReps((n) => n + 1)}>+1</button>
        <button type="button" onClick={() => setRir((n) => Math.max(0, n - 1))}>recámara {rir}</button>
      </div>
      <p>Por lado: {carga.usa.map((u) => `${u.cant} × ${u.disco} kg`).join(', ') || 'solo la barra de 20 kg'}.</p>
      <p>Calentamiento: {calentamiento(peso).map((c) => `${c.pct} ${c.peso} kg × ${c.reps}`).join(' · ')}</p>
      <button type="button" className="fit-cta" onClick={anotar}>Anotar este peso</button>
      {aviso && <p className="aviso">{aviso}</p>}
      <div className="barras">
        {historia.length === 0 && <p>Cuando anotes, aquí se ve cómo sube o baja el peso.</p>}
        {historia.slice(-8).map((h) => (
          <div key={`${h.fecha}-${h.peso}`}>
            <i style={{ height: `${Math.max(12, (h.peso / tope) * 72)}px` }} />
            <b>{h.peso}</b>
            <small>{h.fecha.slice(5)}</small>
          </div>
        ))}
      </div>
      <style>{`
        .peso-box .nombre-grande {
          font-size: 22px; font-weight: 800; width: 100%;
        }
        .antes { margin: 0; color: #c5d1b0; }
        .peso-grande { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .peso-grande strong { font-size: 56px; line-height: 1; color: #C8F542; min-width: 160px; text-align: center; }
        .peso-grande.chico strong { font-size: 32px; min-width: 90px; }
        .peso-grande small { font-size: 16px; color: #fff; }
        .peso-grande button {
          min-width: 64px; min-height: 56px; border-radius: 16px; border: 1px solid rgba(200,245,66,.4);
          background: #0c120e; color: #fff; font-weight: 900; font-size: 18px; cursor: pointer;
        }
        .barras { display: flex; align-items: flex-end; gap: 8px; min-height: 110px; }
        .barras div { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .barras i { display: block; width: 28px; background: #C8F542; border-radius: 8px 8px 2px 2px; }
        .barras b { font-size: 12px; }
        .barras small { color: #c5d1b0; }
      `}</style>
    </section>
  );
}
