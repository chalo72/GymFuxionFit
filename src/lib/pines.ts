import type { UserRole } from './localUsers';

const KEY = 'fuxion_pines';

export const PINES_INICIAL: Record<UserRole, string> = {
  admin: '2607',
  receptionist: '2610',
  trainer: '2611',
  client: '2612',
  athlete: '2612',
};

const ORDEN: UserRole[] = ['admin', 'receptionist', 'trainer', 'client'];

export const NOMBRE_ROL: Record<UserRole, string> = {
  admin: 'Gerente',
  receptionist: 'Recepción',
  trainer: 'Entrenador',
  client: 'Socio',
  athlete: 'Socio',
};

export function leerPines(): Record<UserRole, string> {
  try {
    return { ...PINES_INICIAL, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...PINES_INICIAL };
  }
}

export function guardarPin(role: UserRole, pin: string) {
  const limpio = pin.replace(/\D/g, '').slice(0, 4);
  const next = { ...leerPines(), [role]: limpio };
  if (role === 'client') next.athlete = limpio;
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function rolDePin(pin: string): UserRole | null {
  const limpio = pin.replace(/\D/g, '');
  if (limpio.length < 4) return null;
  const map = leerPines();
  const hit = ORDEN.find((rol) => map[rol] === limpio);
  return hit || null;
}

export function pinesVisibles() {
  return ORDEN.map((rol) => ({ rol, nombre: NOMBRE_ROL[rol], pin: leerPines()[rol] }));
}
