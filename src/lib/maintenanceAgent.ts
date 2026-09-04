export type MaintTipo =
  | 'error_js'
  | 'error_promesa'
  | 'error_ui'
  | 'enlace'
  | 'clic'
  | 'ruta'
  | 'accion';

export type MaintEvent = {
  id: string;
  t: number;
  tipo: MaintTipo;
  pantalla: string;
  boton?: string;
  modo?: string;
  detalle: string;
};

const KEY = 'fuxion_mantenimiento';
const MAX = 80;

export const RUTAS_CONOCIDAS = new Set([
  '/',
  '/login',
  '/dashboard',
  '/members',
  '/trainer',
  '/training',
  '/progress',
  '/nutrition',
  '/reports',
  '/settings',
  '/operations',
  '/genesis-scan',
  '/crm',
  '/schedule',
  '/classes',
  '/catalogs',
  '/evaluacion',
  '/elite-plan',
  '/elite-rec',
  '/ai-coach',
  '/wearables',
  '/leaderboard',
  '/analytics',
  '/kpis',
  '/finances',
  '/payments',
  '/accounting',
  '/inventory',
  '/reception',
  '/client-app',
  '/client/progress',
  '/client/nutrition',
  '/client/training',
  '/mantenimiento',
]);

export function loadMaint(): MaintEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addMaint(ev: Omit<MaintEvent, 'id' | 't'> & { t?: number }) {
  const row: MaintEvent = {
    id: crypto.randomUUID(),
    t: ev.t || Date.now(),
    tipo: ev.tipo,
    pantalla: ev.pantalla,
    boton: ev.boton,
    modo: ev.modo,
    detalle: String(ev.detalle || '').slice(0, 800),
  };
  const prev = loadMaint();
  const isTrail = row.tipo === 'accion' || row.tipo === 'ruta';
  const fallos = prev.filter((e) => e.tipo !== 'accion' && e.tipo !== 'ruta');
  const trail = prev.filter((e) => e.tipo === 'accion' || e.tipo === 'ruta');
  const next = isTrail
    ? [...fallos.slice(0, 50), row, ...trail].slice(0, 80)
    : [row, ...fallos, ...trail].slice(0, 80);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('fuxion-maint-update'));
  return row;
}

export function clearMaint() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event('fuxion-maint-update'));
}

export function fallosDe(list: MaintEvent[]) {
  return list.filter((e) => e.tipo !== 'accion' && e.tipo !== 'ruta');
}

export function esGerencia(role?: string) {
  return role === 'admin';
}

export type ChatMsg = {
  id: string;
  t: number;
  de: 'agente' | 'taller';
  titulo: string;
  que: string;
  como: string;
  porQue: string;
  donde: string;
  paraQue: string;
};

export const MEJORAS_HECHAS = [
  {
    que: 'Login y menú por rol',
    como: 'Cuenta admin real y staff con clave; rutas detrás de sesión',
    porQue: 'Sin eso cualquiera entra y el gym no es producto',
    donde: '/login y todo el menú',
    paraQue: 'Que recepción, entrenador y admin vean solo lo suyo',
  },
  {
    que: 'Hub Dinero',
    como: 'Una entrada Caja / Cobros / Libros',
    porQue: 'Había finanzas duplicadas y se perdía el flujo',
    donde: '/finances',
    paraQue: 'Cobrar y registrar sin saltar de pantalla en pantalla',
  },
  {
    que: 'Enjambre del gym',
    como: 'Colas reales: cobro, renovación, bodega, puerta',
    porQue: 'El panel anterior fingía agentes que no trabajaban el negocio',
    donde: 'Hoy',
    paraQue: 'Que el equipo vea qué hay que hacer hoy y vaya al módulo',
  },
  {
    que: 'Agente de mantenimiento',
    como: 'Escucha errores JS, crashes, enlaces rotos, clics y rutas',
    porQue: 'El taller de Cursor no ve la pantalla si no hay parte escrito',
    donde: 'Toda la app · pantalla /mantenimiento',
    paraQue: 'Reportar qué falló y repararlo en el chat de Cursor',
  },
];

function horaTxt(t: number) {
  return new Date(t).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' });
}

export function interpretarFallo(e: MaintEvent): ChatMsg {
  const donde = `${e.pantalla}${e.boton ? ` · botón “${e.boton}”` : ''}`;
  if (e.tipo === 'enlace') {
    return {
      id: `a-${e.id}`,
      t: e.t,
      de: 'agente',
      titulo: 'Enlace o ruta rota',
      que: e.detalle,
      como: 'Al hacer clic el destino no está en las rutas de la app o el href está vacío.',
      porQue: 'El usuario cree que el botón sirve y no pasa nada o cae mal.',
      donde,
      paraQue: 'Que cada clic del menú y de la UI abra la pantalla correcta.',
    };
  }
  if (e.tipo === 'error_ui') {
    return {
      id: `a-${e.id}`,
      t: e.t,
      de: 'agente',
      titulo: 'La interfaz se cayó',
      que: e.detalle,
      como: 'ErrorBoundary atrapó un crash de React en esa vista.',
      porQue: 'Sin esto la persona ve “ERROR DEL SISTEMA” y no puede trabajar.',
      donde,
      paraQue: 'Estabilizar esa pantalla y que recepción/admin no se queden trabados.',
    };
  }
  return {
    id: `a-${e.id}`,
    t: e.t,
    de: 'agente',
    titulo: e.tipo === 'error_js' || e.tipo === 'error_promesa' ? 'Error en código al usar la UI' : 'Hallazgo',
    que: e.detalle,
    como: e.modo || 'Capturado en runtime',
    porQue: 'Un fallo silencioso rompe un clic o un flujo aunque la pantalla se vea bien.',
    donde,
    paraQue: 'Localizar el archivo/botón y repararlo en el taller de Cursor.',
  };
}

export function respuestaTaller(e: MaintEvent): ChatMsg {
  return {
    id: `t-${e.id}`,
    t: e.t + 1,
    de: 'taller',
    titulo: 'Taller Cursor — recibido',
    que: `Parte ${e.tipo} en ${e.pantalla}. Queda en cola para abrir el código, reproducir el clic y parchear.`,
    como: 'Cuando esta sesión de chat está abierta se lee el log (fuxion_mantenimiento), se busca la pantalla y se corrige. No se marca “ya quedó” hasta que el parche exista.',
    porQue: 'Si se inventa “reparado”, el gerencia ve teatro y el bug sigue.',
    donde: e.pantalla,
    paraQue: 'Cerrar el hueco y subir versión para que el gym lo vea.',
  };
}

export function briefingConversacion(): ChatMsg[] {
  return [
    {
      id: 'brief-1',
      t: 0,
      de: 'taller',
      titulo: 'Meta del taller (Cursor)',
      que: 'Dejar GymFuxionFit operativa: cada clic de admin, recepción, entrenador y cliente tiene que servir.',
      como: 'Código + agente de mantenimiento. El agente no repara solo: escribe el parte. El taller repara.',
      porQue: 'Sin parte no hay cómo saber en qué botón se rompió.',
      donde: 'Chat Cursor + /mantenimiento',
      paraQue: 'Plataforma lista para el gym, no demo.',
    },
    {
      id: 'brief-2',
      t: 1,
      de: 'agente',
      titulo: 'Cómo trabajo yo',
      que: 'Vigilo errores JS, crashes de UI, enlaces que no existen y el rastro de pantallas/botones.',
      como: 'Queda en este navegador. Gerencia lo ve aquí. El taller lo lee al abrir el chat.',
      porQue: 'Cursor cerrado no recibe el chat; el log sí sobrevive.',
      donde: 'Todas las rutas, incluido login',
      paraQue: 'Que gerencia vea qué se encontró, dónde, por qué importa y para qué se va a tocar.',
    },
  ];
}

export function conversacionDe(list: MaintEvent[]): ChatMsg[] {
  const fallos = fallosDe(list).slice().reverse();
  const hilo: ChatMsg[] = [...briefingConversacion()];
  fallos.forEach((e) => {
    hilo.push(interpretarFallo(e));
    hilo.push(respuestaTaller(e));
  });
  if (fallos.length === 0) {
    hilo.push({
      id: 'ok-1',
      t: Date.now(),
      de: 'agente',
      titulo: 'Sin fallos en este navegador',
      que: 'No hay crashes, enlaces rotos ni errores JS guardados todavía.',
      como: 'Sigo escuchando cada clic y cada cambio de pantalla (lista abajo).',
      porQue: 'Un log vacío no significa que toda la app esté perfecta: significa que aquí no se ha caído nada aún.',
      donde: 'Este dispositivo / esta sesión',
      paraQue: 'Usar la app (recepción, dinero, miembros). Si algo se rompe, aparece aquí al instante.',
    });
    hilo.push({
      id: 'ok-2',
      t: Date.now() + 1,
      de: 'taller',
      titulo: 'Qué está haciendo el taller ahora',
      que: 'Pantalla de gerencia de mantenimiento, enjambre real del gym, y seguir pantallas de uso diario.',
      como: 'Prioridad: lo que el agente reporte + flujos de cobro, check-in y miembros.',
      porQue: 'Ahí está el dinero y la puerta del gym.',
      donde: 'Hoy, Recepción, Dinero, Miembros',
      paraQue: 'Que el gerente vea trabajo real, no un carrusel.',
    });
  }
  return hilo;
}

export function horaTxtMaint(t: number) {
  if (!t) return 'inicio';
  return horaTxt(t);
}

function pathOfHref(href: string) {
  try {
    if (href.startsWith('http')) return new URL(href).pathname;
    return href.split('?')[0].split('#')[0] || '/';
  } catch {
    return href;
  }
}

export function labelFromNode(el: Element | null) {
  if (!el) return '';
  const aria = el.getAttribute('aria-label');
  if (aria) return aria.slice(0, 80);
  const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
  return t.slice(0, 80);
}

export function inspectClickTarget(el: Element, pantalla: string, modo: string) {
  const a = el.closest('a');
  const clickable = a || el.closest('button, [role="button"]');
  if (!clickable) return;

  const boton = labelFromNode(clickable);

  if (a) {
    const href = a.getAttribute('href') || '';
    if (!href || href === '#' || href.startsWith('javascript:')) {
      addMaint({
        tipo: 'enlace',
        pantalla,
        boton,
        modo,
        detalle: `Enlace vacío o inútil: "${href}"`,
      });
      return;
    }
    if (href.startsWith('/') || href.startsWith(window.location.origin)) {
      const path = pathOfHref(href);
      if (path && !RUTAS_CONOCIDAS.has(path)) {
        addMaint({
          tipo: 'enlace',
          pantalla,
          boton,
          modo,
          detalle: `Ruta no registrada en la app: ${path}`,
        });
      }
    }
    return;
  }

  addMaint({
    tipo: 'accion',
    pantalla,
    boton,
    modo,
    detalle: 'clic en botón',
  });
}

export function reportJsError(message: string, pantalla: string, extra?: string) {
  addMaint({
    tipo: 'error_js',
    pantalla,
    modo: 'runtime',
    detalle: extra ? `${message} | ${extra}` : message,
  });
}

export function reportUiCrash(error: Error, pantalla: string) {
  addMaint({
    tipo: 'error_ui',
    pantalla,
    modo: 'ErrorBoundary',
    detalle: `${error.name}: ${error.message}\n${(error.stack || '').split('\n').slice(0, 4).join('\n')}`,
  });
}
