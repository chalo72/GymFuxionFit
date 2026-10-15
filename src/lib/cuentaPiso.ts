import type { Member } from '../hooks/useGymData';
import type { User } from '../contexts/AuthContext';

export type TabLine = { id: string; name: string; qty: number; price: number; at: number };

export type Presence = {
  inGym: boolean;
  enteredAt: number;
  method: string;
  doing?: string;
};

export function tabTotal(tab?: TabLine[]) {
  return (tab || []).reduce((a, l) => a + l.qty * l.price, 0);
}

export function mergeTab(
  tab: TabLine[] | undefined,
  lines: { id: string; name: string; qty: number; price: number }[]
): TabLine[] {
  const next = [...(tab || [])];
  for (const l of lines) {
    const i = next.findIndex((x) => x.id === l.id);
    if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + l.qty };
    else next.push({ ...l, at: Date.now() });
  }
  return next;
}

export function findMemberForUser(members: Member[], user: User | null): Member | null {
  if (!user) return null;
  const email = (user.email || '').toLowerCase();
  const name = (user.name || '').toLowerCase();
  return (
    members.find((m) => m.email && m.email.toLowerCase() === email) ||
    members.find((m) => String(m.id) === String(user.id)) ||
    members.find((m) => m.name && m.name.toLowerCase() === name) ||
    null
  );
}

export type CreditoSplit = { productos: number; membresia: number };

/** Si nunca se partió, la deuda vieja cuenta como mensualidad. */
export function creditoDe(m: Member): CreditoSplit {
  if (m.credito) return { productos: m.credito.productos || 0, membresia: m.credito.membresia || 0 };
  return { productos: 0, membresia: m.debt || 0 };
}

export function sumarCredito(m: Member, add: CreditoSplit): { debt: number; credito: CreditoSplit } {
  const base = creditoDe(m);
  const credito = {
    productos: Math.max(0, Math.round(base.productos + (add.productos || 0))),
    membresia: Math.max(0, Math.round(base.membresia + (add.membresia || 0))),
  };
  return { credito, debt: credito.productos + credito.membresia };
}

/** El abono baja primero productos y después la mensualidad. */
export function aplicarAbono(m: Member, monto: number) {
  const base = creditoDe(m);
  let rest = Math.max(0, Math.round(monto));
  const aProductos = Math.min(rest, base.productos);
  rest -= aProductos;
  const aMembresia = Math.min(rest, base.membresia);
  const credito = { productos: base.productos - aProductos, membresia: base.membresia - aMembresia };
  return { credito, debt: credito.productos + credito.membresia, aProductos, aMembresia };
}

export function fichaCuenta(m: Member) {
  const d = m.expiryDate || m.expiry;
  let plan = 'Al día';
  if (m.status === 'suspended') plan = 'Suspendido';
  else if (m.status === 'expired') plan = 'Vencido · renovar';
  else if (m.status === 'expiring') plan = 'Por vencer';
  else if (!m.plan) plan = 'Sin plan · inscribir';
  const split = creditoDe(m);
  const mora = split.productos + split.membresia;
  const consumo = tabTotal(m.openTab);
  return {
    plan,
    mora,
    creditoProductos: split.productos,
    creditoMembresia: split.membresia,
    consumo,
    aCobrarSalida: consumo,
    totalPendiente: mora + consumo,
    enSala: !!m.presence?.inGym,
    desde: m.presence?.enteredAt,
    haciendo: m.presence?.doing || (m.sessionLive ? 'Sesión con entrenador' : ''),
    trainer: m.trainer || m.sessionLive?.trainer || '',
    pidePago: m.pagoSolicitado,
  };
}
