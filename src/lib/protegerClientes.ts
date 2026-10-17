/** Copia que no se reemplaza por una lista vacía. No vive en el repositorio. */
const RESPALDO = 'fuxion_members_respaldo';
const ARCHIVO = 'fuxion_members_archivo';

function leer(clave: string): any[] {
  try {
    const lista = JSON.parse(localStorage.getItem(clave) || '[]');
    return Array.isArray(lista) ? lista.filter((m) => m && m.id) : [];
  } catch {
    return [];
  }
}

export function leerClientesGuardados(): any[] {
  const vivo = leer('fuxion_members');
  if (vivo.length) return vivo;
  const respaldo = leer(RESPALDO);
  if (respaldo.length) return respaldo;
  return leer(ARCHIVO);
}

function archivar(lista: any[]) {
  if (!lista.length) return;
  const map = new Map<string, any>();
  for (const m of leer(ARCHIVO)) map.set(String(m.id), m);
  for (const m of lista) map.set(String(m.id), { ...map.get(String(m.id)), ...m });
  localStorage.setItem(ARCHIVO, JSON.stringify([...map.values()]));
}

export function guardarRespaldo(lista: any[]) {
  if (!Array.isArray(lista) || lista.length === 0) return;
  const previo = leer(RESPALDO);
  if (previo.length > 0 && lista.length + 1 < previo.length) return;
  localStorage.setItem(RESPALDO, JSON.stringify(lista));
  archivar(lista);
}

/** Una lista vacía no borra la que ya estaba. Los que llegan se unen, no sustituyen. */
export function fusionarClientes(actual: any[], entrante: any[]): any[] {
  const base = actual.length ? actual : leerClientesGuardados();
  if (!entrante || entrante.length === 0) return base;
  const map = new Map<string, any>();
  for (const m of base) map.set(String(m.id), m);
  for (const m of entrante) {
    if (!m?.id) continue;
    const id = String(m.id);
    map.set(id, { ...map.get(id), ...m });
  }
  const next = [...map.values()];
  guardarRespaldo(next);
  return next;
}
