/** Número fijo de socio y bitácora de puerta. Misma en gerencia y recepción. */

const NUMEROS = 'fuxion_numeros';
const PASOS = 'fuxion_puerta';

export type PasoPuerta = {
  id: number;
  memberId: string;
  name: string;
  numero: string;
  action: 'ENTRADA' | 'SALIDA';
  time: string;
  date: string;
  method: string;
};

export function asignarNumeros(ids: string[]): Record<string, string> {
  let map: Record<string, number> = {};
  try { map = JSON.parse(localStorage.getItem(NUMEROS) || '{}'); } catch { map = {}; }
  let max = 0;
  for (const n of Object.values(map)) if (typeof n === 'number' && n > max) max = n;
  let dirty = false;
  for (const id of ids) {
    if (!map[id]) { max += 1; map[id] = max; dirty = true; }
  }
  if (dirty) localStorage.setItem(NUMEROS, JSON.stringify(map));
  const out: Record<string, string> = {};
  for (const id of Object.keys(map)) out[id] = String(map[id]).padStart(3, '0');
  return out;
}

export function leerPasos(): PasoPuerta[] {
  try {
    const raw = JSON.parse(localStorage.getItem(PASOS) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function registrarPaso(paso: Omit<PasoPuerta, 'id'>): PasoPuerta[] {
  const next: PasoPuerta = { ...paso, id: Date.now() };
  const all = [next, ...leerPasos()].slice(0, 400);
  localStorage.setItem(PASOS, JSON.stringify(all));
  return all;
}
