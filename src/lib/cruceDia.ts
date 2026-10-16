import type { Member, Transaction } from '../hooks/useGymData';
import { daysUntilExpiry } from './accessGate';
import { leerPasos } from './puerta';
import { fechaClave } from './turnosCaja';

export type Camara = {
  id: string;
  nombre: string;
  marca: string;
  zona: 'entrada' | 'sala';
  canal: string;
};

export type Grupo = { n: number; nombres: string[] };

export type CruceDia = {
  camaraEntrada: number | null;
  camaraSala: number | null;
  appEntraron: number;
  diferencia: number | null;
  enSala: number;
  mensual: Grupo;
  diario: Grupo;
  visita: Grupo;
  pagaronEfectivo: Grupo & { pesos: number };
  pagaronNequi: Grupo & { pesos: number };
  credito: Grupo;
  sinPago: Grupo;
  cubiertos: Grupo;
  nequiPesos: number;
  efectivoPesos: number;
};

const CAMS = 'fuxion_camaras';
const CONTEOS = 'fuxion_camaras_conteo';

export const MARCAS = ['Hikvision', 'Dahua', 'EZVIZ', 'Intelbras', 'TP-Link', 'Otra'];

function leer<T>(key: string): T[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function leerCamaras(): Camara[] {
  return leer<Camara>(CAMS);
}

export function guardarCamaras(lista: Camara[]) {
  localStorage.setItem(CAMS, JSON.stringify(lista));
}

type Conteo = { camaraId: string; fecha: string; entradas: number };

export function conteoDe(camaraId: string, fecha: string) {
  const item = leer<Conteo>(CONTEOS).find((c) => c.camaraId === camaraId && c.fecha === fecha);
  return item ? item.entradas : null;
}

export function guardarConteo(camaraId: string, fecha: string, entradas: number) {
  const all = leer<Conteo>(CONTEOS).filter((c) => !(c.camaraId === camaraId && c.fecha === fecha));
  all.unshift({ camaraId, fecha, entradas });
  localStorage.setItem(CONTEOS, JSON.stringify(all.slice(0, 400)));
}

function fechasHoy() {
  return new Set([fechaClave(Date.now()), new Date().toISOString().slice(0, 10)]);
}

function esEfectivo(m?: string) { return (m || '').toLowerCase().includes('efect'); }
function esNequi(m?: string) { return (m || '').toLowerCase().includes('nequi'); }
function esCredito(m?: string) {
  const x = (m || '').toLowerCase();
  return x.includes('crédit') || x.includes('credit');
}

function tipoPlan(plan?: string): 'mensual' | 'diario' | 'visita' {
  const p = (plan || '').toLowerCase();
  if (!p || p.includes('sin plan')) return 'visita';
  if (p.includes('día') || p.includes('dia')) return 'diario';
  if (p.includes('mes') || p.includes('básic') || p.includes('basic') || p.includes('pro') || p.includes('hyrox') || p.includes('semana') || p.includes('quincena')) return 'mensual';
  return 'visita';
}

function suma(txs: Transaction[], pred: (t: Transaction) => boolean) {
  return txs.filter(pred).reduce((a, t) => a + (t.amount || 0), 0);
}

export function armarCruce(members: Member[], transactions: Transaction[], fecha = fechaClave(Date.now())): CruceDia {
  const dias = fechasHoy();
  const delDia = transactions.filter((t) => dias.has(t.date));
  const entradas = leerPasos().filter((p) => p.action === 'ENTRADA' && (p.date === fecha || dias.has(p.date)));
  const ids = new Set(entradas.map((p) => p.memberId));
  members.forEach((m) => { if (dias.has(String(m.lastVisit || '').slice(0, 10))) ids.add(m.id); });
  const llegaron = members.filter((m) => ids.has(m.id));

  const vacio = (): Grupo => ({ n: 0, nombres: [] });
  const mensual = vacio();
  const diario = vacio();
  const visita = vacio();
  const pagaronEfectivo = { ...vacio(), pesos: 0 };
  const pagaronNequi = { ...vacio(), pesos: 0 };
  const credito = vacio();
  const sinPago = vacio();
  const cubiertos = vacio();

  const meter = (g: Grupo, nombre: string) => { g.n += 1; if (g.nombres.length < 8) g.nombres.push(nombre); };

  for (const m of llegaron) {
    const nombre = m.name || 'Socio';
    const suyos = delDia.filter((t) => t.type === 'income' && (t.client || '').toLowerCase() === nombre.toLowerCase());
    const pagoDia = suyos.some((t) => t.category === 'daypass');
    const tipo = pagoDia ? 'diario' : tipoPlan(m.plan);
    if (tipo === 'mensual') meter(mensual, nombre);
    else if (tipo === 'diario') meter(diario, nombre);
    else meter(visita, nombre);

    const ef = suyos.filter((t) => esEfectivo(t.method));
    const nq = suyos.filter((t) => esNequi(t.method));
    const cr = suyos.filter((t) => esCredito(t.method));
    if (cr.length || ((m.debt || 0) > 0 && suyos.length === 0)) meter(credito, nombre);
    else if (nq.length) { meter(pagaronNequi, nombre); pagaronNequi.pesos += nq.reduce((a, t) => a + (t.amount || 0), 0); }
    else if (ef.length) { meter(pagaronEfectivo, nombre); pagaronEfectivo.pesos += ef.reduce((a, t) => a + (t.amount || 0), 0); }
    else if (tipo === 'mensual' && (daysUntilExpiry(m.expiryDate || m.expiry) ?? -1) >= 0) meter(cubiertos, nombre);
    else meter(sinPago, nombre);
  }

  const cams = leerCamaras();
  const sumaZona = (zona: Camara['zona']) => {
    const lista = cams.filter((c) => c.zona === zona);
    if (!lista.length) return null;
    const nums = lista.map((c) => conteoDe(c.id, fecha)).filter((n): n is number => n !== null);
    return nums.length ? nums.reduce((a, n) => a + n, 0) : null;
  };
  const camaraEntrada = sumaZona('entrada');
  const camaraSala = sumaZona('sala');

  return {
    camaraEntrada,
    camaraSala,
    appEntraron: llegaron.length,
    diferencia: camaraEntrada === null ? null : camaraEntrada - llegaron.length,
    enSala: members.filter((m) => m.presence?.inGym).length,
    mensual, diario, visita,
    pagaronEfectivo, pagaronNequi, credito, sinPago, cubiertos,
    nequiPesos: suma(delDia, (t) => t.type === 'income' && esNequi(t.method)),
    efectivoPesos: suma(delDia, (t) => t.type === 'income' && esEfectivo(t.method)),
  };
}
