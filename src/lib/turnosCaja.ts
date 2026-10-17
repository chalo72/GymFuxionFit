import type { Transaction } from '../hooks/useGymData';

export type NombreTurno = 'Mañana' | 'Tarde' | 'Noche';
export type TipoCaja = 'principal' | 'pos';

export function nombreCaja(tipo?: TipoCaja) {
  return tipo === 'pos' ? 'Caja POS' : 'Caja principal';
}

export type TurnoCaja = {
  id: string;
  nombre: NombreTurno;
  tipo?: TipoCaja;
  estado: 'abierto' | 'cerrado';
  abiertoAt: number;
  cerradoAt?: number;
  responsable: string;
  fondo: number;
  efectivoEntro: number;
  efectivoSalio: number;
  nequi: number;
  credito: number;
  esperado: number;
  contado: number;
  diferencia: number;
  nota: string;
  bodega?: { agua?: number; gaseosa?: number; electrolito?: number };
  cruce?: {
    entraron: number;
    salieron: number;
    camara: number | null;
    efectivo: number;
    nequi: number;
    fiado: number;
    cubiertos: number;
    sinPago: number;
    pesosMensual: number;
    pesosDia: number;
    pesosAgua: number;
    pesosEfectivo: number;
    pesosNequi: number;
  };
};

const KEY = 'fuxion_turnos';

export const BILLETES = [100000, 50000, 20000, 10000, 5000, 2000, 1000];
export const MONEDAS = [500, 200, 100, 50];

export function pesos(n: number) {
  return `$${Math.round(n || 0).toLocaleString('es-CO')}`;
}

export function turnoSugerido(ahora = new Date()): NombreTurno {
  const h = ahora.getHours();
  if (h < 12) return 'Mañana';
  if (h < 18) return 'Tarde';
  return 'Noche';
}

export function leerTurnos(): TurnoCaja[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function guardarTurnos(lista: TurnoCaja[]) {
  localStorage.setItem(KEY, JSON.stringify(lista.slice(0, 120)));
}

export function turnoAbierto(lista = leerTurnos()) {
  return lista.find((t) => t.estado === 'abierto') || null;
}

function esEfectivo(method?: string) {
  return (method || '').toLowerCase().includes('efect');
}
function esNequi(method?: string) {
  return (method || '').toLowerCase().includes('nequi');
}
function esCredito(method?: string) {
  const m = (method || '').toLowerCase();
  return m.includes('crédit') || m.includes('credit');
}

function instante(t: { date: string; time?: string }) {
  const d = new Date(`${t.date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return NaN;
  const hm = (t.time || '00:00').slice(0, 5);
  const [h, m] = hm.split(':').map((x) => Number(x) || 0);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export function enVentana(t: { date: string; time?: string }, desde: number, hasta?: number) {
  const ms = instante(t);
  if (Number.isNaN(ms)) return false;
  if (ms < desde - 60_000) return false;
  if (hasta && ms > hasta) return false;
  return true;
}

export function resumirTurno(transactions: Transaction[], turno: Pick<TurnoCaja, 'abiertoAt' | 'cerradoAt' | 'fondo'>) {
  const delTurno = transactions.filter((t) => enVentana(t, turno.abiertoAt, turno.cerradoAt));
  const efectivoEntro = delTurno.filter((t) => t.type === 'income' && esEfectivo(t.method)).reduce((a, t) => a + (t.amount || 0), 0);
  const efectivoSalio = delTurno.filter((t) => t.type === 'expense' && (esEfectivo(t.method) || !t.method)).reduce((a, t) => a + (t.amount || 0), 0);
  const nequi = delTurno.filter((t) => t.type === 'income' && esNequi(t.method)).reduce((a, t) => a + (t.amount || 0), 0);
  const credito = delTurno.filter((t) => t.type === 'income' && esCredito(t.method)).reduce((a, t) => a + (t.amount || 0), 0);
  const esperado = (turno.fondo || 0) + efectivoEntro - efectivoSalio;
  return { delTurno, efectivoEntro, efectivoSalio, nequi, credito, esperado };
}

export function fechaClave(ms: number) {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function horaCorta(ms?: number) {
  if (!ms) return '';
  return new Date(ms).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export function duracion(desde: number, hasta = Date.now()) {
  const min = Math.max(0, Math.floor((hasta - desde) / 60000));
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}
