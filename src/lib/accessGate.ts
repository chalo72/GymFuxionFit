import type { Member } from '../hooks/useGymData';

export function daysUntilExpiry(dateStr?: string) {
  if (!dateStr) return null;
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

const MORA_KEY = 'fuxion_moratoria_dias';

/** Días de cortesía después de que vence el plan. 3 si nadie lo ha cambiado. */
export function diasMoratoria() {
  const raw = localStorage.getItem(MORA_KEY);
  const n = raw == null ? 3 : Number(raw);
  if (!Number.isFinite(n) || n < 0) return 3;
  return Math.min(30, Math.floor(n));
}

export function guardarMoratoria(dias: number) {
  const n = Math.max(0, Math.min(30, Math.floor(Number(dias) || 0)));
  localStorage.setItem(MORA_KEY, String(n));
}

export type Gate =
  | { ok: true; moratoria?: boolean; diasVencido?: number }
  | { ok: false; reason: string };

export function canEnterGym(m: Member): Gate {
  if ((m.debt || 0) > 0) {
    return { ok: false, reason: `Mora $${(m.debt || 0).toLocaleString('es-CO')}` };
  }
  if (m.status === 'suspended') return { ok: false, reason: 'Cuenta suspendida' };
  const d = daysUntilExpiry(m.expiryDate || m.expiry);
  const gracia = diasMoratoria();
  if (d !== null && d < 0) {
    const vencido = Math.abs(d);
    if (vencido <= gracia) return { ok: true, moratoria: true, diasVencido: vencido };
    return { ok: false, reason: `Venció hace ${vencido} días. La moratoria es de ${gracia}.` };
  }
  if (m.status === 'expired' && d === null) return { ok: false, reason: 'Membresía vencida' };
  return { ok: true };
}

export function memberQrPayload(id: string) {
  return `gff:${id}`;
}

export function memberFromQr(raw: string, members: Member[]) {
  const t = raw.trim();
  const id = t.toLowerCase().startsWith('gff:') ? t.slice(4) : t;
  return members.find((m) => String(m.id) === id);
}

export function waDigits(phone?: string) {
  const d = String(phone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('57') && d.length >= 12) return d;
  if (d.length === 10) return `57${d}`;
  return d;
}

export function waAvisoUrl(m: Member, tipo: 'deuda' | 'vence') {
  const num = waDigits(m.phone);
  if (!num) return '';
  const nombre = m.name || 'socio';
  const text = tipo === 'deuda'
    ? `Hola ${nombre}, Gym Fuxion Fit: tienes saldo pendiente de $${(m.debt || 0).toLocaleString('es-CO')}. Pasa por recepción para quedar al día.`
    : `Hola ${nombre}, Gym Fuxion Fit: tu plan vence el ${m.expiryDate || m.expiry || ''}. Renueva para no perder el acceso.`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
