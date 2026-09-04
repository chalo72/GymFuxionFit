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

export function fichaCuenta(m: Member) {
  const d = m.expiryDate || m.expiry;
  let plan = 'Al día';
  if (m.status === 'suspended') plan = 'Suspendido';
  else if (m.status === 'expired') plan = 'Vencido · renovar';
  else if (m.status === 'expiring') plan = 'Por vencer';
  else if (!m.plan) plan = 'Sin plan · inscribir';
  const mora = m.debt || 0;
  const consumo = tabTotal(m.openTab);
  return {
    plan,
    mora,
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
