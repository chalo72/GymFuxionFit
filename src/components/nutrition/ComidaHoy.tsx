import { useState } from 'react';
import { searchFoodOFF } from '../../services/nutritionService';
import {
  comidasDeHoy, gramosParaProte, guardarComidas, guardarMeta, leerComidas, leerMeta,
  porGramos, sumar, type MetaComida,
} from '../../lib/comida';
import { hoyISO } from '../../lib/entreno';

function id() { return `${Date.now()}_${Math.random().toString(16).slice(2, 6)}`; }

export default function ComidaHoy() {
  const [meta, setMeta] = useState<MetaComida>(() => leerMeta());
  const [comidas, setComidas] = useState(() => comidasDeHoy());
  const [busca, setBusca] = useState('');
  const [gramos, setGramos] = useState(100);
  const [proteMeta, setProteMeta] = useState(30);
  const [elegido, setElegido] = useState<{ name: string; kcal: number; prote: number; carb: number; grasa: number } | null>(null);
  const [aviso, setAviso] = useState('');
  const hoy = sumar(comidas);
  const porcion = elegido ? porGramos(elegido, gramos) : null;

  const guardarLista = (next: typeof comidas) => {
    const resto = leerComidas().filter((c) => c.fecha !== hoyISO());
    guardarComidas([...next, ...resto]);
    setComidas(next);
  };

  const buscar = async (codigo = false) => {
    setAviso('Buscando…');
    if (codigo) {
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${busca.replace(/\D/g, '')}.json`);
        const data = await res.json();
        const p = data.product;
        if (!p) { setAviso('Ese código no está en la base pública.'); return; }
        setElegido({
          name: p.product_name || 'Alimento',
          kcal: Number(p.nutriments?.['energy-kcal_100g'] || 0),
          prote: Number(p.nutriments?.proteins_100g || 0),
          carb: Number(p.nutriments?.carbohydrates_100g || 0),
          grasa: Number(p.nutriments?.fat_100g || 0),
        });
        setAviso('Etiqueta encontrada. Ajusta los gramos y súmala al día.');
        return;
      } catch {
        setAviso('Sin internet no se lee el código.');
        return;
      }
    }
    const lista = await searchFoodOFF(busca);
    const primero = lista[0];
    if (!primero) { setAviso('No apareció en la base pública. Anótalo a mano abajo.'); return; }
    setElegido({
      name: primero.name,
      kcal: primero.macros.calories,
      prote: primero.macros.protein,
      carb: primero.macros.carbs,
      grasa: primero.macros.fats,
    });
    setAviso('Encontrado por cada 100 g. Cambia los gramos para ver la porción.');
  };

  const sumarHoy = () => {
    if (!elegido) return;
    const p = porGramos(elegido, gramos);
    guardarLista([{
      id: id(), fecha: hoyISO(), nombre: `${elegido.name} · ${gramos} g`, gramos, ...p,
    }, ...comidas]);
    setAviso('Sumado a las calorías de hoy.');
  };

  const aMano = () => {
    const kcal = Number(prompt('Calorías de esta comida') || 0);
    if (!kcal) return;
    guardarLista([{
      id: id(), fecha: hoyISO(), nombre: busca.trim() || 'Comida', gramos,
      kcal, prote: Number(prompt('Proteína (g)') || 0), carb: Number(prompt('Carbos (g)') || 0), grasa: Number(prompt('Grasa (g)') || 0),
    }, ...comidas]);
  };

  const barra = (valor: number, tope: number) => `${Math.min(100, Math.round((valor / Math.max(1, tope)) * 100))}%`;

  return (
    <section className="bloque comida-box">
      <p className="fit-kicker">Calorías de hoy</p>
      <h3>Lo que sí se comió</h3>
      <div className="macros">
        {[
          ['Calorías', hoy.kcal, meta.kcal, 'kcal'],
          ['Proteína', hoy.prote, meta.prote, 'g'],
          ['Carbos', hoy.carb, meta.carb, 'g'],
          ['Grasa', hoy.grasa, meta.grasa, 'g'],
        ].map(([nombre, valor, tope, unidad]) => (
          <div key={String(nombre)}>
            <strong>{valor}</strong>
            <small>{nombre} / {tope} {unidad}</small>
            <i><b style={{ width: barra(Number(valor), Number(tope)) }} /></i>
          </div>
        ))}
      </div>
      <div className="fila">
        <label>Meta kcal<input value={meta.kcal} onChange={(e) => setMeta(guardarMeta({ ...meta, kcal: Number(e.target.value) || 0 }))} /></label>
        <label>Proteína<input value={meta.prote} onChange={(e) => setMeta(guardarMeta({ ...meta, prote: Number(e.target.value) || 0 }))} /></label>
        <label>Carbos<input value={meta.carb} onChange={(e) => setMeta(guardarMeta({ ...meta, carb: Number(e.target.value) || 0 }))} /></label>
        <label>Grasa<input value={meta.grasa} onChange={(e) => setMeta(guardarMeta({ ...meta, grasa: Number(e.target.value) || 0 }))} /></label>
      </div>
      <div className="fila">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Alimento o código de barras" />
        <button type="button" onClick={() => buscar(false)}>Buscar</button>
        <button type="button" onClick={() => buscar(true)}>Leer código</button>
        <button type="button" onClick={aMano}>Anotar a mano</button>
      </div>
      {elegido && (
        <div className="bloque">
          <strong>{elegido.name}</strong>
          <p>Por 100 g: {elegido.kcal} kcal · {elegido.prote} g proteína · {elegido.carb} g carbos · {elegido.grasa} g grasa</p>
          <label>Gramos de esta porción
            <input value={gramos} onChange={(e) => setGramos(Number(e.target.value) || 0)} />
          </label>
          {porcion && <p>Esta porción: {porcion.kcal} kcal · {porcion.prote} g proteína · {porcion.carb} g carbos · {porcion.grasa} g grasa</p>}
          <label>Si quieres esta proteína (g)
            <input value={proteMeta} onChange={(e) => setProteMeta(Number(e.target.value) || 0)} />
          </label>
          <p>Te tocan {gramosParaProte(proteMeta, elegido.prote)} g para llegar a {proteMeta} g de proteína.</p>
          <button type="button" className="fit-cta chico" onClick={sumarHoy}>Sumar al día</button>
        </div>
      )}
      <ul>
        {comidas.map((c) => (
          <li key={c.id}>{c.nombre} · {c.kcal} kcal · {c.prote} g prot</li>
        ))}
        {comidas.length === 0 && <li>Hoy todavía no hay comidas. Lo que sumes reemplaza el ejemplo viejo.</li>}
      </ul>
      {aviso && <p className="aviso">{aviso}</p>}
      <style>{`
        .comida-box h3 { margin: 0; }
        .macros { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
        .macros div { background: #0c120e; border-radius: 16px; padding: 10px; }
        .macros strong { display: block; font-size: 28px; color: #C8F542; }
        .macros small { color: #c5d1b0; }
        .macros i { display: block; height: 8px; background: #1c2614; border-radius: 99px; margin-top: 8px; }
        .macros b { display: block; height: 8px; background: #C8F542; border-radius: 99px; }
        .comida-box ul { margin: 0; padding-left: 18px; color: #c5d1b0; }
      `}</style>
    </section>
  );
}
