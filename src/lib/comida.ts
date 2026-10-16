import { hoyISO } from './entreno';

export type Bocado = {
  id: string;
  fecha: string;
  nombre: string;
  gramos: number;
  kcal: number;
  prote: number;
  carb: number;
  grasa: number;
};

export type MetaComida = { kcal: number; prote: number; carb: number; grasa: number };

const KEY = 'fuxion_comida';
const META = 'fuxion_comida_meta';

export function leerComidas(): Bocado[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

export function guardarComidas(lista: Bocado[]) {
  localStorage.setItem(KEY, JSON.stringify(lista.slice(0, 200)));
}

export function comidasDeHoy(fecha = hoyISO()) {
  return leerComidas().filter((c) => c.fecha === fecha);
}

export function sumar(lista: Bocado[]) {
  return lista.reduce(
    (a, c) => ({
      kcal: a.kcal + (c.kcal || 0),
      prote: a.prote + (c.prote || 0),
      carb: a.carb + (c.carb || 0),
      grasa: a.grasa + (c.grasa || 0),
    }),
    { kcal: 0, prote: 0, carb: 0, grasa: 0 },
  );
}

export function leerMeta(): MetaComida {
  try {
    return { kcal: 2200, prote: 160, carb: 220, grasa: 60, ...JSON.parse(localStorage.getItem(META) || '{}') };
  } catch {
    return { kcal: 2200, prote: 160, carb: 220, grasa: 60 };
  }
}

export function guardarMeta(meta: MetaComida) {
  localStorage.setItem(META, JSON.stringify(meta));
  return meta;
}

export function porGramos(por100: { kcal: number; prote: number; carb: number; grasa: number }, gramos: number) {
  const f = Math.max(0, gramos) / 100;
  return {
    kcal: Math.round(por100.kcal * f),
    prote: Math.round(por100.prote * f),
    carb: Math.round(por100.carb * f),
    grasa: Math.round(por100.grasa * f),
  };
}

export function gramosParaProte(proteDeseada: number, protePor100: number) {
  if (!protePor100) return 0;
  return Math.round((proteDeseada / protePor100) * 100);
}
