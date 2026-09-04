import type { Member } from '../hooks/useGymData';

export function daysUntilExpiry(dateStr?: string) {
  if (!dateStr) return null;
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

export function canEnterGym(m: Member): { ok: true } | { ok: false; reason: string } {
  if ((m.debt || 0) > 0) {
    return { ok: false, reason: `Mora $${(m.debt || 0).toLocaleString('es-CO')}` };
  }
  if (m.status === 'suspended') return { ok: false, reason: 'Cuenta suspendida' };
  if (m.status === 'expired') return { ok: false, reason: 'Membresía vencida' };
  const d = daysUntilExpiry(m.expiryDate || m.expiry);
  if (d !== null && d < 0) return { ok: false, reason: 'Membresía vencida' };
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
