export type TipoSerie = 'calentamiento' | 'normal' | 'drop' | 'fallo' | 'super';

export type Serie = { id: string; tipo: TipoSerie; peso: number; reps: number; rir: number; hecha: boolean };
export type EjercicioLog = { id: string; nombre: string; musculo: string; series: Serie[] };
export type Sesion = { id: string; fecha: string; titulo: string; ejercicios: EjercicioLog[]; nota: string };

export const MUSCULOS = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Antebrazo',
  'Abdomen', 'Oblicuos', 'Glúteo', 'Cuádriceps', 'Isquios', 'Pantorrilla',
  'Trapecio', 'Lumbar', 'Aductores', 'Cardio', 'Cuerpo',
];

const SES = 'fuxion_sesiones';
const EXTRA = 'fuxion_entreno_extra';

export function leerSesiones(): Sesion[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SES) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}
export function guardarSesiones(lista: Sesion[]) {
  localStorage.setItem(SES, JSON.stringify(lista.slice(0, 80)));
}

export function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ultimaSerie(nombre: string, sesiones = leerSesiones()) {
  for (const s of sesiones) {
    for (const e of s.ejercicios) {
      if (e.nombre.toLowerCase() === nombre.toLowerCase()) {
        const hecha = [...e.series].reverse().find((x) => x.hecha && x.tipo !== 'calentamiento');
        if (hecha) return { fecha: s.fecha, ...hecha };
      }
    }
  }
  return null;
}

export function historialPeso(nombre: string, sesiones = leerSesiones()) {
  const filas: { fecha: string; peso: number; reps: number }[] = [];
  for (const s of [...sesiones].reverse()) {
    for (const e of s.ejercicios) {
      if (e.nombre.toLowerCase() !== nombre.toLowerCase()) continue;
      const mejor = e.series
        .filter((x) => x.hecha && x.tipo !== 'calentamiento')
        .sort((a, b) => b.peso - a.peso)[0];
      if (mejor) filas.push({ fecha: s.fecha, peso: mejor.peso, reps: mejor.reps });
    }
  }
  return filas;
}

export function ultimoLevantado(sesiones = leerSesiones()) {
  for (const s of sesiones) {
    for (const e of s.ejercicios) {
      const hecha = [...e.series].reverse().find((x) => x.hecha && x.tipo !== 'calentamiento');
      if (hecha) return { fecha: s.fecha, nombre: e.nombre, peso: hecha.peso, reps: hecha.reps };
    }
  }
  return null;
}

export function sugerir(nombre: string) {
  const u = ultimaSerie(nombre);
  if (!u) return { peso: 20, reps: 8, porque: 'Primera vez. Arranca suave y anota cómo se sintió.' };
  const sube = u.reps >= 8 && u.rir <= 2;
  const peso = sube ? Math.round((u.peso + 2.5) * 2) / 2 : u.peso;
  const porque = sube
    ? `La vez pasada fueron ${u.peso} kg por ${u.reps}, con ${u.rir} repeticiones en recámara. Hoy sube un poco.`
    : `La vez pasada fueron ${u.peso} kg por ${u.reps}. Hoy repite el peso hasta que salgan limpias.`;
  return { peso, reps: u.reps || 8, porque };
}

export function calentamiento(peso: number) {
  return [
    { pct: '50%', peso: Math.round(peso * 0.5 * 2) / 2, reps: 8 },
    { pct: '70%', peso: Math.round(peso * 0.7 * 2) / 2, reps: 5 },
    { pct: '85%', peso: Math.round(peso * 0.85 * 2) / 2, reps: 3 },
  ];
}

const DISCOS = [20, 15, 10, 5, 2.5, 1.25];
export function discos(total: number, barra = 20) {
  let lado = Math.max(0, (total - barra) / 2);
  const usa: { disco: number; cant: number }[] = [];
  for (const d of DISCOS) {
    const cant = Math.floor(lado / d + 1e-6);
    if (cant > 0) { usa.push({ disco: d, cant }); lado -= cant * d; }
  }
  return { barra, usa, sobra: Math.round(lado * 100) / 100 };
}

export function musculoReciente(sesiones = leerSesiones()) {
  const map: Record<string, string> = {};
  for (const s of sesiones) {
    for (const e of s.ejercicios) {
      if (e.series.some((x) => x.hecha) && !map[e.musculo]) map[e.musculo] = s.fecha;
    }
  }
  return map;
}

export function diasDesde(fecha?: string) {
  if (!fecha) return 99;
  const t = new Date(`${fecha}T12:00:00`).getTime();
  return Math.floor((Date.now() - t) / 86400000);
}

export function racha(sesiones = leerSesiones()) {
  const dias = new Set(sesiones.filter((s) => s.ejercicios.some((e) => e.series.some((x) => x.hecha))).map((s) => s.fecha));
  let n = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (dias.has(clave)) n += 1;
    else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

type Extra = {
  perdon: string[];
  lesion: string[];
  agua: number;
  aguaDia: string;
  pasos: number;
  medidas: Record<string, string>;
  fotoNota: string;
  foto?: string;
  perfilPublico: boolean;
};

function extra(): Extra {
  try {
    return { perdon: [], lesion: [], agua: 0, pasos: 0, aguaDia: hoyISO(), medidas: {}, fotoNota: '', perfilPublico: false, ...JSON.parse(localStorage.getItem(EXTRA) || '{}') };
  } catch {
    return { perdon: [], lesion: [], agua: 0, pasos: 0, aguaDia: hoyISO(), medidas: {}, fotoNota: '', perfilPublico: false };
  }
}
export function leerExtra() {
  const e = extra();
  if (e.aguaDia !== hoyISO()) { e.agua = 0; e.pasos = 0; e.aguaDia = hoyISO(); }
  return e;
}
export function guardarExtra(p: Partial<Extra>) {
  const next = { ...leerExtra(), ...p };
  if (next.foto && next.foto.length > 180000) next.foto = undefined;
  localStorage.setItem(EXTRA, JSON.stringify(next));
  return next;
}

export function usarPerdon() {
  const e = leerExtra();
  const semana = hoyISO().slice(0, 7);
  const usados = e.perdon.filter((x) => x.startsWith(semana));
  if (usados.length >= 2) return e;
  e.perdon = [...usados, hoyISO()];
  return guardarExtra({ perdon: e.perdon });
}

export function porcion(proteinaDeseada: number, proteinaPor100: number) {
  if (!proteinaPor100) return 0;
  return Math.round((proteinaDeseada / proteinaPor100) * 100);
}

export function csvSesiones(sesiones = leerSesiones()) {
  const filas = ['fecha,ejercicio,musculo,tipo,peso,reps,rir'];
  for (const s of sesiones) {
    for (const e of s.ejercicios) {
      for (const x of e.series.filter((z) => z.hecha)) {
        filas.push([s.fecha, e.nombre, e.musculo, x.tipo, x.peso, x.reps, x.rir].join(','));
      }
    }
  }
  return filas.join('\n');
}

const SNACK = [
  { nombre: 'Sentadilla al aire', musculo: 'Cuádriceps' },
  { nombre: 'Flexión de brazos', musculo: 'Pecho' },
  { nombre: 'Puente de glúteo', musculo: 'Glúteo' },
  { nombre: 'Plancha', musculo: 'Abdomen' },
  { nombre: 'Remo con toalla', musculo: 'Espalda' },
];

export function snackDe(lesion: string[], nivel: 'suave' | 'medio' | 'fuerte' = 'medio') {
  const reps = nivel === 'suave' ? 8 : nivel === 'fuerte' ? 15 : 10;
  return SNACK.filter((e) => !lesion.includes(e.musculo)).map((e) => ({ ...e, reps }));
}

export const MEDIDAS = [
  'Peso', 'Estatura', 'Cuello', 'Hombros', 'Pecho', 'Cintura', 'Abdomen',
  'Cadera', 'Glúteo', 'Brazo', 'Antebrazo', 'Muslo', 'Pierna', 'Pantorrilla',
];

export function planDe(dias: number, lesion: string[]) {
  const base = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Cuerpo'].filter((m) => !lesion.includes(m === 'Piernas' ? 'Cuádriceps' : m));
  return Array.from({ length: Math.max(1, Math.min(6, dias)) }, (_, i) => base[i % base.length]);
}
