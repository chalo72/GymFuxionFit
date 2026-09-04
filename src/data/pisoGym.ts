export type Disciplina = 'hierro' | 'funcional' | 'hyrox' | 'cardio';

export type EjercicioPiso = {
  id: string;
  nombre: string;
  zona: string;
  disciplina: Disciplina;
  maquina?: string;
  variante: string;
  como: string[];
  ia: string;
};

export const DISCIPLINAS: { id: Disciplina; label: string; para: string }[] = [
  { id: 'hierro', label: 'Hierro / máquinas', para: 'Fuerza, hipertrofia, control' },
  { id: 'funcional', label: 'Funcional / CrossFit', para: 'WOD, skill, metcon' },
  { id: 'hyrox', label: 'HYROX / híbrido', para: 'Estaciones de carrera + fuerza' },
  { id: 'cardio', label: 'Cardio', para: 'Remo, bici, cuerda, ski' },
];

export const MAQUINAS = [
  { id: 'banca', nombre: 'Banco plano / inclinado', sede: 'Sala de pesas' },
  { id: 'polea', nombre: 'Polea / cruzado', sede: 'Sala de pesas' },
  { id: 'prensa', nombre: 'Prensa de piernas', sede: 'Sala de pesas' },
  { id: 'smith', nombre: 'Smith / jaula', sede: 'Sala de pesas' },
  { id: 'remo-ergo', nombre: 'Remoergómetro', sede: 'Zona cardio / HYROX' },
  { id: 'sled', nombre: 'Trineo (sled)', sede: 'Pista / funcional' },
  { id: 'rig', nombre: 'Rig / barra de dominadas', sede: 'Box funcional' },
  { id: 'cajon', nombre: 'Cajón pliométrico', sede: 'Box funcional' },
];

export const ZONAS = [
  { id: 'pecho', nombre: 'Pecho', detalle: 'Alto, medio, bajo, cruces' },
  { id: 'espalda', nombre: 'Espalda', detalle: 'Ancho, grosor, dominadas' },
  { id: 'pierna', nombre: 'Pierna', detalle: 'Cuádriceps, glúteo, femoral' },
  { id: 'hombro', nombre: 'Hombro y brazo', detalle: 'Press, laterales, tríceps' },
  { id: 'core', nombre: 'Core', detalle: 'Plancha, GHD, hollow' },
  { id: 'wod', nombre: 'WOD / metcon', detalle: 'CrossFit y condicionado' },
];

export const EJERCICIOS: EjercicioPiso[] = [
  { id: 'press-plano', nombre: 'Press banca plano', zona: 'pecho', disciplina: 'hierro', maquina: 'banca', variante: 'Pecho medio', como: ['Escápulas juntas, pies firmes.', 'Barra al pecho con control.', 'Empuja sin rebotar.'], ia: 'Si duele el hombro, baja el peso y cierra un poco el agarre.' },
  { id: 'press-inclinado', nombre: 'Press inclinado', zona: 'pecho', disciplina: 'hierro', maquina: 'banca', variante: 'Pecho alto', como: ['Banco 30–45°.', 'Baja a la parte alta del pecho.', 'No arquees el cuello.'], ia: 'Pecho alto: prioriza rango completo antes que ego.' },
  { id: 'press-declinado', nombre: 'Press declinado o fondos', zona: 'pecho', disciplina: 'hierro', maquina: 'banca', variante: 'Pecho bajo', como: ['Codos no se abren en exceso.', 'Pecho adelante en fondos.'], ia: 'Pecho bajo se siente más si bajas con control, no si rebotas.' },
  { id: 'aperturas', nombre: 'Aperturas en banco o pec deck', zona: 'pecho', disciplina: 'hierro', maquina: 'banca', variante: 'Estiramiento', como: ['Codos suaves, no bloqueados.', 'Abre hasta que el pecho tire, no el hombro.'], ia: 'Si el hombro pinza, reduce el rango. Pecho, no deltoides anterior.' },
  { id: 'cruces', nombre: 'Cruces en polea', zona: 'pecho', disciplina: 'hierro', maquina: 'polea', variante: 'Aislamiento', como: ['Codos semi-fijos.', 'Juntar manos al centro con pecho.'], ia: 'Polea alta = fibras altas; polea baja = fibras bajas.' },
  { id: 'dominada', nombre: 'Dominada o jalón', zona: 'espalda', disciplina: 'hierro', maquina: 'rig', variante: 'Ancho', como: ['Pecho al bar.', 'Escápulas primero, luego brazos.'], ia: 'Si no llegas, usa banda. No hagas kipping si buscas hipertrofia.' },
  { id: 'remo-barra', nombre: 'Remo con barra', zona: 'espalda', disciplina: 'hierro', maquina: 'smith', variante: 'Grosor', como: ['Espalda neutra.', 'Codo al hip.'], ia: 'Si redondeas lumbar, baja peso ya.' },
  { id: 'prensa-q', nombre: 'Prensa pies medios', zona: 'pierna', disciplina: 'hierro', maquina: 'prensa', variante: 'Cuádriceps', como: ['Pies al medio de la plataforma.', 'No trabe rodillas de golpe.'], ia: 'Rodillas alineadas con puntas. Dolor de rodilla = menos profundidad hoy.' },
  { id: 'prensa-g', nombre: 'Prensa pies altos', zona: 'pierna', disciplina: 'hierro', maquina: 'prensa', variante: 'Glúteo / femoral', como: ['Pies más arriba.', 'Baja con control.'], ia: 'Talones no se despegan. Si se despegan, baja carga.' },
  { id: 'sentadilla', nombre: 'Sentadilla en jaula', zona: 'pierna', disciplina: 'hierro', maquina: 'smith', variante: 'Patrón sentadilla', como: ['Core firme.', 'Cadera atrás y rodillas en línea.'], ia: 'Profundidad que puedas con espalda neutra, no la de Instagram.' },
  { id: 'press-hombro', nombre: 'Press militar', zona: 'hombro', disciplina: 'hierro', maquina: 'smith', variante: 'Deltoides', como: ['Costillas abajo.', 'No hiperextiendas lumbar.'], ia: 'Si te arqueas, el peso es de ego, no de hombro.' },
  { id: 'plancha', nombre: 'Plancha', zona: 'core', disciplina: 'hierro', variante: 'Estabilidad', como: ['Cadera ni caída ni pico.', 'Respira.'], ia: '20 segundos bien valen más que 2 minutos mal.' },
  { id: 'thruster', nombre: 'Thruster', zona: 'wod', disciplina: 'funcional', maquina: 'rig', variante: 'Fuerza + cardio', como: ['Sentadilla completa a press.', 'Un solo movimiento.'], ia: 'Escala a mancuernas si la barra se rompe.' },
  { id: 'burpee', nombre: 'Burpee / burpee box', zona: 'wod', disciplina: 'funcional', maquina: 'cajon', variante: 'Metcon', como: ['Pecho cerca del piso.', 'Cadera abre al saltar.'], ia: 'Step-back si la lumbar avisa. El WOD no vale una lesión.' },
  { id: 'muscle-up-prog', nombre: 'Progresión al muscle-up', zona: 'wod', disciplina: 'funcional', maquina: 'rig', variante: 'Skill', como: ['Dominada explosiva.', 'Transición cadera.'], ia: 'Hoy es skill, no metcon. Pocas reps perfectas.' },
  { id: 'wod-amrap', nombre: 'AMRAP corto de box', zona: 'wod', disciplina: 'funcional', variante: 'Condicionado', como: ['Elige 3 movimientos que sepas.', 'Ritmo que puedas hablar.'], ia: 'En Montería el calor mata: hidrátate entre rounds.' },
  { id: 'sled-push', nombre: 'Sled push', zona: 'wod', disciplina: 'hyrox', maquina: 'sled', variante: 'Estación HYROX', como: ['Cadera baja.', 'Pasos cortos y fuertes.'], ia: 'Si no hay trineo, marcha con disco al pecho 20 m ida y vuelta.' },
  { id: 'farmer', nombre: 'Farmer carry', zona: 'wod', disciplina: 'hyrox', variante: 'Agarre + core', como: ['Hombros abajo.', 'Pasos estables.'], ia: 'El agarre se va primero. Suelta antes de perder la postura.' },
  { id: 'remo-1k', nombre: 'Remo 500–1000 m', zona: 'wod', disciplina: 'hyrox', maquina: 'remo-ergo', variante: 'Estación cardio', como: ['Cadena a las costillas.', 'Piernas-cadera-brazos.'], ia: 'No tires solo de brazos. Ritmo que puedas sostener.' },
  { id: 'ski-sim', nombre: 'Simulacro ski / battle rope', zona: 'cardio', disciplina: 'hyrox', variante: 'Tracción', como: ['Core quieto.', 'Brazos largos.'], ia: 'Sin SkiErg: cuerdas o jalón alto con ritmo de ski.' },
  { id: 'remo-cal', nombre: 'Remo suave', zona: 'cardio', disciplina: 'cardio', maquina: 'remo-ergo', variante: 'Base aeróbica', como: ['Espalda larga.', '20–28 paladas/min.'], ia: 'Zona conversación. Si no puedes hablar, baja.' },
  { id: 'cuerda', nombre: 'Cuerda de saltar', zona: 'cardio', disciplina: 'cardio', variante: 'Salto', como: ['Muñecas, no hombros.', 'Pisos silenciosos.'], ia: 'Tobillos: si duelen, marcha en el sitio 1:1.' },
];

export function ejerciciosDeMaquina(id: string) {
  return EJERCICIOS.filter((e) => e.maquina === id);
}

export function ejerciciosDeZona(id: string) {
  return EJERCICIOS.filter((e) => e.zona === id);
}

export function ejerciciosDeDisciplina(id: Disciplina) {
  return EJERCICIOS.filter((e) => e.disciplina === id);
}

export function qrPisoUrl(origin: string, tipo: 'maquina' | 'zona' | 'disciplina', id: string) {
  return `${origin}/piso/${tipo}/${id}`;
}
