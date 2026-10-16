import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MEDIDAS, MUSCULOS, calentamiento, csvSesiones, diasDesde, discos, guardarExtra, guardarSesiones,
  hoyISO, leerExtra, leerSesiones, musculoReciente, planDe, porcion, racha, snackDe, sugerir,
  usarPerdon, type EjercicioLog, type Serie, type Sesion, type TipoSerie,
} from '../lib/entreno';

const TABS = ['Sesión', 'Discos', 'Músculos', 'Plan', 'Snack', 'Foto', 'Etiqueta', 'Reloj', 'Informe'] as const;
type Tab = typeof TABS[number];

function id() { return `${Date.now()}_${Math.random().toString(16).slice(2, 6)}`; }

const PISTAS: Record<Tab, string> = {
  'Sesión': 'Peso anterior y por qué',
  'Discos': 'Por lado de la barra',
  'Músculos': 'Fresco o lesión',
  'Plan': 'Días de la semana',
  'Snack': 'Corta, sin equipo',
  'Foto': 'Progreso y medidas',
  'Etiqueta': 'Código y porción',
  'Reloj': 'Números del banco',
  'Informe': 'Racha, perdón y CSV',
};

export default function EntrenoStudio() {
  const [params, setParams] = useSearchParams();
  const pedido = params.get('pieza') as Tab | null;
  const tab: Tab = pedido && (TABS as readonly string[]).includes(pedido) ? pedido : 'Sesión';
  const setTab = (t: Tab) => setParams({ pieza: t });
  const [sesiones, setSesiones] = useState<Sesion[]>(() => leerSesiones());
  const [extra, setExtra] = useState(() => leerExtra());
  const [sesion, setSesion] = useState<Sesion>(() => ({
    id: id(), fecha: hoyISO(), titulo: 'Sesión de hoy', ejercicios: [], nota: '',
  }));
  const [nombre, setNombre] = useState('Press de banca');
  const [musculo, setMusculo] = useState('Pecho');
  const [descanso, setDescanso] = useState(0);
  const [barra, setBarra] = useState('20');
  const [pesoObj, setPesoObj] = useState('60');
  const [diasPlan, setDiasPlan] = useState('4');
  const [nivel, setNivel] = useState<'suave' | 'medio' | 'fuerte'>('medio');
  const [codigo, setCodigo] = useState('');
  const [alimento, setAlimento] = useState<{ name: string; protein: number } | null>(null);
  const [protMeta, setProtMeta] = useState('30');
  const [aviso, setAviso] = useState('');

  const sug = useMemo(() => sugerir(nombre), [nombre, sesiones]);
  const recientes = musculoReciente(sesiones);

  const persistir = (next: Sesion[]) => { guardarSesiones(next); setSesiones(next); };

  const agregarEjercicio = () => {
    const s = sug;
    const serie: Serie = { id: id(), tipo: 'normal', peso: s.peso, reps: s.reps, rir: 2, hecha: false };
    const ej: EjercicioLog = { id: id(), nombre: nombre.trim() || 'Ejercicio', musculo, series: [serie] };
    setSesion({ ...sesion, ejercicios: [...sesion.ejercicios, ej] });
  };

  const tocarSerie = (ejId: string, serieId: string, patch: Partial<Serie>) => {
    setSesion({
      ...sesion,
      ejercicios: sesion.ejercicios.map((e) => e.id !== ejId ? e : {
        ...e,
        series: e.series.map((s) => s.id === serieId ? { ...s, ...patch } : s),
      }),
    });
  };

  const cerrarSerie = (ejId: string, serie: Serie) => {
    tocarSerie(ejId, serie.id, { hecha: true });
    setDescanso(90);
    const t = window.setInterval(() => {
      setDescanso((n) => {
        if (n <= 1) { window.clearInterval(t); return 0; }
        return n - 1;
      });
    }, 1000);
    if ('Notification' in window && Notification.permission === 'granted') {
      window.setTimeout(() => new Notification('Descanso listo', { body: 'Siguiente serie.' }), 90000);
    }
  };

  const guardarHoy = () => {
    const limpia = sesiones.filter((s) => s.id !== sesion.id);
    persistir([sesion, ...limpia]);
    setAviso('Sesión guardada en este equipo. No se pierde al cambiar de pantalla.');
  };

  const copiarUltima = () => {
    const previa = sesiones[0];
    if (!previa) { setAviso('Todavía no hay una sesión para copiar.'); return; }
    setSesion({
      ...previa,
      id: id(),
      fecha: hoyISO(),
      titulo: `Copia de ${previa.titulo}`,
      ejercicios: previa.ejercicios.map((e) => ({ ...e, id: id(), series: e.series.map((s) => ({ ...s, id: id(), hecha: false })) })),
    });
    setAviso('Copiaste la última sesión. Los pesos quedan para que los ajustes.');
  };

  const buscarEtiqueta = async () => {
    setAviso('Buscando la etiqueta…');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${codigo.replace(/\D/g, '')}.json`);
      const data = await res.json();
      const p = data.product;
      if (!p) { setAviso('Ese código no está en la base pública.'); setAlimento(null); return; }
      setAlimento({ name: p.product_name || 'Alimento', protein: Number(p.nutriments?.proteins_100g || 0) });
      setAviso('Etiqueta encontrada. Ajusta la porción abajo.');
    } catch {
      setAviso('Sin internet no se lee el código. Puedes anotar la proteína a mano.');
    }
  };

  const exportar = () => {
    const blob = new Blob([csvSesiones(sesiones)], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fuxion-entreno.csv';
    a.click();
  };

  const informe = () => {
    const texto = `Fuxion Fit · semana\nRacha ${racha(sesiones)} días. Sesiones guardadas: ${sesiones.length}. Agua hoy: ${extra.agua} vasos. Pasos: ${extra.pasos}.`;
    if (navigator.share) navigator.share({ text: texto }).catch(() => {});
    else navigator.clipboard?.writeText(texto);
    setAviso('Informe listo para compartir.');
  };

  const d = discos(Number(pesoObj) || 0, Number(barra) || 20);
  const frescos = MUSCULOS.filter((m) => diasDesde(recientes[m]) > 2 && !extra.lesion.includes(m)).length;

  return (
    <div className="entreno-studio">
      <p className="fit-kicker">Lo mejor, junto</p>
      <h2>Entreno</h2>
      <div className="tablero">
        <div><strong>{racha(sesiones)}</strong><span>días de racha</span></div>
        <div><strong>{sug.peso} kg</strong><span>× {sug.reps} · {nombre}</span></div>
        <div><strong>{frescos}</strong><span>músculos frescos</span></div>
        <div><strong>{extra.agua}</strong><span>vasos de agua</span></div>
      </div>
      <p className="porque">{sug.porque}</p>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            <b>{t}</b>
            <small>{PISTAS[t]}</small>
          </button>
        ))}
      </div>

      {tab === 'Sesión' && (
        <section>
          <div className="fila">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ejercicio" />
            <select value={musculo} onChange={(e) => setMusculo(e.target.value)}>{MUSCULOS.map((m) => <option key={m}>{m}</option>)}</select>
            <button type="button" className="fit-cta chico" onClick={agregarEjercicio}>Agregar</button>
          </div>
          <p className="porque">{sug.porque}</p>
          <p className="porque">Calentamiento: {calentamiento(sug.peso).map((c) => `${c.pct} ${c.peso} kg × ${c.reps}`).join(' · ')}</p>
          {descanso > 0 && <p className="reloj">Descanso {descanso}s</p>}
          {sesion.ejercicios.map((e) => (
            <article key={e.id} className="bloque">
              <strong>{e.nombre}</strong> <small>{e.musculo}</small>
              {e.series.map((s) => (
                <div key={s.id} className="serie">
                  <select value={s.tipo} onChange={(ev) => tocarSerie(e.id, s.id, { tipo: ev.target.value as TipoSerie })}>
                    <option value="calentamiento">Calentamiento</option>
                    <option value="normal">Normal</option>
                    <option value="drop">Drop</option>
                    <option value="fallo">Al fallo</option>
                    <option value="super">Super</option>
                  </select>
                  <input inputMode="decimal" value={s.peso} onChange={(ev) => tocarSerie(e.id, s.id, { peso: Number(ev.target.value) || 0 })} />
                  <input inputMode="numeric" value={s.reps} onChange={(ev) => tocarSerie(e.id, s.id, { reps: Number(ev.target.value) || 0 })} />
                  <input inputMode="numeric" value={s.rir} onChange={(ev) => tocarSerie(e.id, s.id, { rir: Number(ev.target.value) || 0 })} title="Repeticiones en recámara" />
                  <button type="button" onClick={() => cerrarSerie(e.id, s)}>{s.hecha ? 'Lista' : 'Cerrar'}</button>
                </div>
              ))}
              <button type="button" className="texto" onClick={() => setSesion({
                ...sesion,
                ejercicios: sesion.ejercicios.map((x) => x.id !== e.id ? x : { ...x, series: [...x.series, { id: id(), tipo: 'normal', peso: sug.peso, reps: sug.reps, rir: 2, hecha: false }] }),
              })}>+ serie</button>
            </article>
          ))}
          <div className="fila">
            <button type="button" className="fit-cta chico" onClick={guardarHoy}>Guardar sesión</button>
            <button type="button" onClick={copiarUltima}>Copiar la anterior</button>
            <button type="button" onClick={() => Notification.requestPermission?.()}>Aviso al terminar el descanso</button>
          </div>
        </section>
      )}

      {tab === 'Discos' && (
        <section className="bloque">
          <label>Peso de la barra</label>
          <input value={barra} onChange={(e) => setBarra(e.target.value)} />
          <label>Peso que quieres levantar</label>
          <input value={pesoObj} onChange={(e) => setPesoObj(e.target.value)} />
          <p>Por lado: {d.usa.map((u) => `${u.cant} × ${u.disco} kg`).join(', ') || 'solo la barra'}.</p>
          {d.sobra > 0 && <p>Sobran {d.sobra} kg que no cierran con estos discos.</p>}
        </section>
      )}

      {tab === 'Músculos' && (
        <section>
          <p>Si un músculo se trabajó ayer, hoy va más suave. Marca una lesión y el plan lo evita. No baja ningún rango.</p>
          <div className="musculos">
            {MUSCULOS.map((m) => {
              const hace = diasDesde(recientes[m]);
              const lesionado = extra.lesion.includes(m);
              return (
                <button key={m} type="button" className={lesionado ? 'lesion' : hace <= 1 ? 'recien' : ''} onClick={() => {
                  const lesion = lesionado ? extra.lesion.filter((x) => x !== m) : [...extra.lesion, m];
                  setExtra(guardarExtra({ lesion }));
                }}>
                  <strong>{m}</strong>
                  <small>{lesionado ? 'Lesión, se evita' : hace > 20 ? 'Fresco' : `Hace ${hace} día(s)`}</small>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'Plan' && (
        <section className="bloque">
          <label>Días por semana</label>
          <input value={diasPlan} onChange={(e) => setDiasPlan(e.target.value)} />
          <ol>{planDe(Number(diasPlan) || 3, extra.lesion).map((m, i) => <li key={i}>Día {i + 1}: {m}</li>)}</ol>
          <p>El peso de cada serie lo propone la pestaña Sesión, con el motivo al lado.</p>
          <Link to="/elite-plan">Abrir el plan del entrenador que ya existía</Link>
        </section>
      )}

      {tab === 'Snack' && (
        <section className="bloque">
          <p>Sesión corta, sin equipo, de unos 8 a 15 minutos. Sirve el día que no da el tiempo.</p>
          <div className="fila">
            {(['suave', 'medio', 'fuerte'] as const).map((n) => (
              <button key={n} type="button" className={nivel === n ? 'on' : ''} onClick={() => setNivel(n)}>{n}</button>
            ))}
          </div>
          <ol>{snackDe(extra.lesion, nivel).map((e) => <li key={e.nombre}>{e.nombre} · {e.musculo} · 3 series de {e.reps}</li>)}</ol>
          <button type="button" onClick={() => setExtra(guardarExtra({ agua: (leerExtra().agua || 0) + 1, aguaDia: hoyISO() }))}>Vaso de agua · hoy {extra.agua}</button>
          <button type="button" onClick={() => setExtra(guardarExtra({ pasos: (leerExtra().pasos || 0) + 500, aguaDia: hoyISO() }))}>+500 pasos · hoy {extra.pasos}</button>
        </section>
      )}

      {tab === 'Foto' && (
        <section className="bloque">
          <p>La foto y las medidas quedan en este equipo, listas para comparar. No es un diagnóstico médico.</p>
          <input type="file" accept="image/*" capture="environment" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const img = new Image();
              img.onload = () => {
                const c = document.createElement('canvas');
                const scale = 280 / img.width;
                c.width = 280; c.height = Math.round(img.height * scale);
                c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
                setExtra(guardarExtra({ foto: c.toDataURL('image/jpeg', 0.6), fotoNota: 'Foto de progreso guardada' }));
              };
              img.src = String(reader.result);
            };
            reader.readAsDataURL(file);
          }} />
          {extra.foto && <img src={extra.foto} alt="Progreso" style={{ width: 160, borderRadius: 16, marginTop: 8 }} />}
          {MEDIDAS.map((m) => (
            <label key={m}>{m} ({m === 'Peso' ? 'kg' : 'cm'})
              <input value={extra.medidas[m] || ''} onChange={(e) => setExtra(guardarExtra({ medidas: { ...extra.medidas, [m]: e.target.value } }))} />
            </label>
          ))}
        </section>
      )}

      {tab === 'Etiqueta' && (
        <section className="bloque">
          <p>Escribe el código de barras. La base pública devuelve la proteína y aquí se calcula la porción.</p>
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código de barras" />
          <button type="button" onClick={buscarEtiqueta}>Leer etiqueta</button>
          {alimento && <p>{alimento.name} · {alimento.protein} g de proteína por 100 g</p>}
          <label>Proteína que quieres (g)</label>
          <input value={protMeta} onChange={(e) => setProtMeta(e.target.value)} />
          {alimento && <p>Porción: {porcion(Number(protMeta) || 0, alimento.protein)} g.</p>}
          <Link to="/client/nutrition">Abrir la nutrición que ya estaba</Link>
        </section>
      )}

      {tab === 'Reloj' && (
        <section className="bloque reloj-panel">
          <p>Pantalla grande para el celular en la muñeca o en el banco. El reloj de Apple y el de Android se conectan encima de esta misma sesión.</p>
          <strong>{nombre}</strong>
          <p>{sug.peso} kg × {sug.reps}</p>
          <p>{sug.porque}</p>
          <button type="button" className="fit-cta" onClick={guardarHoy}>Guardar desde aquí</button>
          <Link to="/wearables">Abrir la ficha de wearables</Link>
        </section>
      )}

      {tab === 'Informe' && (
        <section className="bloque">
          <p>Racha {racha(sesiones)} días. Perdones usados esta semana: {extra.perdon.filter((x) => x.startsWith(hoyISO().slice(0, 7))).length} de 2.</p>
          <button type="button" onClick={() => setExtra(usarPerdon())}>Usar un perdón de hoy</button>
          <button type="button" onClick={informe}>Compartir informe</button>
          <button type="button" onClick={exportar}>Bajar CSV</button>
          <label><input type="checkbox" checked={extra.perfilPublico} onChange={(e) => setExtra(guardarExtra({ perfilPublico: e.target.checked }))} /> Perfil visible para el entrenador en este equipo</label>
          <p>Misión de hoy: cierra una serie, toma un vaso de agua y elige un músculo que lleve más de 3 días fresco.</p>
        </section>
      )}

      {aviso && <p className="aviso">{aviso}</p>}
      <style>{`
        .entreno-studio { display: flex; flex-direction: column; gap: 12px; color: #fff; }
        .entreno-studio h2 { margin: 0; font-size: 32px; }
        .tablero { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
        .tablero div { background: #0e140f; border: 1px solid rgba(200,245,66,.35); border-radius: 22px; padding: 14px; }
        .tablero strong { display: block; font-size: 28px; color: #C8F542; }
        .tablero span, .leyenda, .porque { color: #c5d1b0; font-size: 14px; }
        .porque { margin: 0; }
        .tabs { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 8px; }
        .tabs button {
          min-height: 74px; border-radius: 18px; border: 1px solid rgba(200,245,66,.3);
          background: #0e140f; color: #fff; padding: 10px 12px; cursor: pointer; text-align: left;
        }
        .tabs button b { display: block; font-size: 15px; }
        .tabs button small { color: #c5d1b0; }
        .entreno-studio .fila button, .serie button {
          min-height: 42px; border-radius: 999px; border: 1px solid rgba(200,245,66,.3);
          background: #0e140f; color: #fff; padding: 8px 14px; cursor: pointer; font-weight: 800;
        }
        .tabs button.on, .fila button.on { background: #C8F542; color: #111; }
        .fila, .serie { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .entreno-studio input, .entreno-studio select {
          min-height: 44px; border-radius: 12px; border: 1px solid rgba(200,245,66,.25);
          background: #0c120e; color: #fff; padding: 8px 10px;
        }
        .bloque { border: 1px solid rgba(200,245,66,.25); border-radius: 20px; padding: 14px; background: #0e140f; display: flex; flex-direction: column; gap: 8px; }
        .fit-cta.chico { width: auto; }
        .reloj { font-size: 28px; font-weight: 900; color: #C8F542; }
        .musculos { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
        .musculos button { text-align: left; border-radius: 16px; padding: 10px; background: #0e140f; color: #fff; border: 1px solid rgba(200,245,66,.2); cursor: pointer; }
        .musculos button.recien { border-color: #C8F542; }
        .musculos button.lesion { opacity: .55; }
        .musculos small { display: block; color: #c5d1b0; }
        .texto { background: none; border: none; color: #C8F542; cursor: pointer; text-align: left; }
        .aviso { color: #C8F542; font-weight: 800; }
        .reloj-panel { min-height: 240px; justify-content: center; }
        .reloj-panel strong { font-size: 28px; }
      `}</style>
    </div>
  );
}
