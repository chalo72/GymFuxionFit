export const DEFAULT_PLANS = [
  { id: 'dia', label: 'Día', price: 5000, desc: 'Acceso por un día', color: '#C5D1CC', duration: 'dia' },
  { id: 'semana', label: 'Semanal', price: 25000, desc: 'Acceso por 7 días', color: '#00FF88', duration: 'semana' },
  { id: 'quincena', label: 'Quincena', price: 30000, desc: 'Acceso 15 días', color: '#C5D1CC', duration: 'quincena' },
  { id: 'mes_basico', label: 'Básico', price: 45000, desc: 'Gimnasio · L-V', color: '#8A948A', duration: 'mes' },
  { id: 'mes_pro', label: 'Pro', price: 75000, desc: 'Completo · clases', color: '#00FF88', duration: 'mes' },
  { id: 'mes_hyrox', label: 'HYROX Pro', price: 120000, desc: 'Elite · HYROX', color: '#8A9C96', duration: 'mes' },
];

export function ensurePlanes(raw: unknown) {
  const list = Array.isArray(raw) ? raw.filter((p) => p && p.id) : [];
  if (list.length === 0) return DEFAULT_PLANS.map((p) => ({ ...p }));
  const byId = new Map(list.map((p: any) => [p.id, p]));
  for (const d of DEFAULT_PLANS) {
    if (!byId.has(d.id)) list.push({ ...d });
  }
  return list;
}
