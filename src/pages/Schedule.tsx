import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Clock, Dumbbell, CalendarDays,
  ChevronDown, CheckCircle, XCircle, Zap, Target, Heart, Star,
  AlertCircle, Users, Flame, X, ArrowLeft, Timer, Award, Shield,
  TrendingUp, Activity
} from 'lucide-react';

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const dates = ['14', '15', '16', '17', '18', '19', '20'];
const today = 4; // Viernes

type Routine = {
  ejercicio: string;
  emoji: string;
  descripcion: string;
  series: string;
  reps: string;
  consejo: string;
};

type ClassBlock = {
  time: string;
  name: string;
  subtitulo: string; // ← Descripción simple para la recepcionista
  instructor: string;
  enrolled: number;
  capacity: number;
  type: string;
  color: string;
  duration: string;
  description: string;
  image: string;
  isActive: boolean;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  beneficios: string[];
  equipo: string[];
  rutinas: Routine[];
};

type DaySchedule = {
  [key: string]: ClassBlock[];
};

const schedule: DaySchedule = {
  Lun: [
    {
      time: '06:00',
      name: 'HYROX Challenge',
      subtitulo: 'Carrera + ejercicios por estaciones — Como un circuito con correr y hacer fuerza',
      instructor: 'Coach Alex',
      enrolled: 18, capacity: 20,
      type: 'hyrox', color: '#FF6B35', duration: '60 min',
      description: 'Entrenamiento de alta intensidad combinando running con 8 estaciones de ejercicios funcionales. Ideal para atletas que quieren desafiarse.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
      isActive: true,
      nivel: 'Avanzado',
      beneficios: ['Resistencia cardiovascular', 'Fuerza total del cuerpo', 'Quema de grasa acelerada'],
      equipo: ['Sled (trineo)', 'Remo ergómetro', 'Pesas rusas', 'Cuerda de saltar'],
      rutinas: [
        { emoji: '🏃', ejercicio: 'Carrera de calentamiento', descripcion: 'Trote suave para preparar los músculos antes del esfuerzo fuerte.', series: '1', reps: '1 km a ritmo suave', consejo: 'No corras rápido — esta es solo la preparación' },
        { emoji: '🛷', ejercicio: 'Empuje de trineo (Sled Push)', descripcion: 'Empujar un trineo con peso por 25 metros. Se trabaja toda la pierna y el core.', series: '4', reps: '25 metros', consejo: 'Mantén la espalda recta, inclínate hacia adelante' },
        { emoji: '🚣', ejercicio: 'Remo en máquina', descripcion: 'Remar en la máquina simula el movimiento real del remo en agua. Trabaja espalda y brazos.', series: '3', reps: '500 metros', consejo: 'Empuja con las piernas primero, luego jala con los brazos' },
        { emoji: '🏋️', ejercicio: 'Burpees + salto', descripcion: 'Tirarse al piso, hacer una lagartija y saltar con las manos arriba. Ejercicio completo.', series: '4', reps: '10 repeticiones', consejo: 'Si es muy difícil, omite el salto al principio' },
        { emoji: '🎯', ejercicio: 'Lanzamiento de balón medicinal', descripcion: 'Lanzar una pelota pesada contra la pared en cuclillas. Trabaja piernas y hombros.', series: '3', reps: '15 repeticiones', consejo: 'Flexiona bien las rodillas antes de lanzar' },
        { emoji: '🔩', ejercicio: 'Jaloneos con kettlebell', descripcion: 'Mover una pesa rusa de un lado al otro entre las piernas. Trabaja caderas y espalda baja.', series: '3', reps: '20 repeticiones', consejo: 'El movimiento viene de las caderas, no de los brazos' },
        { emoji: '🏁', ejercicio: 'Sprint final', descripcion: 'Correr a máxima velocidad los últimos 200 metros. Es el esfuerzo máximo de la clase.', series: '1', reps: '200 metros al máximo', consejo: 'Da todo lo que tienes — ¡ya casi terminas!' },
      ],
    },
    {
      time: '09:00',
      name: 'Yoga Flow',
      subtitulo: 'Posiciones de yoga en movimiento — Estira el cuerpo y calma la mente',
      instructor: 'Coach Sofía',
      enrolled: 10, capacity: 20,
      type: 'yoga', color: '#A78BFA', duration: '60 min',
      description: 'Secuencias dinámicas de asanas (posiciones de yoga) para mejorar la flexibilidad, el equilibrio y la concentración mental.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
      isActive: true,
      nivel: 'Principiante',
      beneficios: ['Flexibilidad del cuerpo', 'Reducción del estrés', 'Mejora del equilibrio y postura'],
      equipo: ['Colchoneta de yoga', 'Bloque de yoga (opcional)', 'Banda elástica (opcional)'],
      rutinas: [
        { emoji: '🌅', ejercicio: 'Saludo al Sol (Surya Namaskar)', descripcion: 'Secuencia de movimientos encadenados de pie. Es el calentamiento principal del yoga.', series: '3', reps: 'Rondas completas', consejo: 'Respira profundo en cada movimiento — no hay prisa' },
        { emoji: '🐱', ejercicio: 'Gato-Vaca (Cat-Cow)', descripcion: 'En cuatro patas, arquear y redondear la espalda alternativamente. Libera la columna.', series: '2', reps: '10 ciclos', consejo: 'Sincroniza con la respiración: arquea al inhalar, redondea al exhalar' },
        { emoji: '🐶', ejercicio: 'Perro boca abajo (Downward Dog)', descripcion: 'Posición en forma de "V" invertida con manos y pies en el piso. Estira todo el cuerpo.', series: '3', reps: '30 segundos por posición', consejo: 'Los talones no tienen que tocar el piso — estira a tu ritmo' },
        { emoji: '🦁', ejercicio: 'Guerrero I y II (Warrior Pose)', descripcion: 'Postura de pie con una pierna adelante y brazos extendidos. Fortalece piernas y apertura de caderas.', series: '2', reps: '45 segundos por lado', consejo: 'La rodilla delantera no debe pasar la punta del pie' },
        { emoji: '🌊', ejercicio: 'Postura del niño (Child\'s Pose)', descripcion: 'Rodillas en el suelo, frente al piso, brazos extendidos. Es la postura de descanso del yoga.', series: '2', reps: '1 minuto de relajación', consejo: 'Cierra los ojos y enfócate en tu respiración' },
        { emoji: '🌙', ejercicio: 'Shavasana (Relajación final)', descripcion: 'Acostarse boca arriba completamente relajado. Es el cierre de cada sesión de yoga.', series: '1', reps: '5 minutos', consejo: 'No te muevas — este tiempo es para que el cuerpo absorba el trabajo' },
      ],
    },
    {
      time: '18:30',
      name: 'CrossFit WOD',
      subtitulo: 'Ejercicio del día — Mezcla de fuerza y cardio para quemar calorías',
      instructor: 'Coach Andrés',
      enrolled: 15, capacity: 18,
      type: 'strength', color: '#00F0FF', duration: '45 min',
      description: 'El Workout of the Day (WOD) de CrossFit combina movimientos de halterofilia, gimnasia y cardio metabólico en una sesión intensa y variada.',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600',
      isActive: true,
      nivel: 'Intermedio',
      beneficios: ['Fuerza muscular completa', 'Resistencia cardiovascular', 'Coordinación y potencia'],
      equipo: ['Barra olímpica', 'Discos de peso', 'Cuerda para saltar', 'Pull-up bar'],
      rutinas: [
        { emoji: '🔥', ejercicio: 'AMRAP 20 minutos', descripcion: 'Hacer la mayor cantidad de rondas posibles en 20 minutos. AMRAP = "As Many Rounds As Possible".', series: '1', reps: 'Máximo posible en 20 min', consejo: 'Elige un ritmo que puedas mantener — no empieces muy rápido' },
        { emoji: '💪', ejercicio: 'Levantamiento de potencia (Power Clean)', descripcion: 'Levantar la barra del piso hasta los hombros en un solo movimiento explosivo.', series: '5', reps: '3 repeticiones', consejo: 'La barra debe pasar pegada al cuerpo todo el tiempo' },
        { emoji: '🧗', ejercicio: 'Dominadas (Pull-ups)', descripcion: 'Colgarse de una barra y jalarse hacia arriba con los brazos. Trabaja espalda y bíceps.', series: '3', reps: '8–10 repeticiones', consejo: 'Si no puedes, usa una banda de asistencia — no hay vergüenza' },
        { emoji: '⚡', ejercicio: 'Box Jumps (Saltos al cajón)', descripcion: 'Saltar con los dos pies sobre una caja de madera o metal. Trabaja piernas explosivas.', series: '4', reps: '12 saltos', consejo: 'Aterriza con las rodillas flexionadas para proteger las articulaciones' },
        { emoji: '🌀', ejercicio: 'Saltos de cuerda doble (Double-Unders)', descripcion: 'Saltar la cuerda haciendo que pase dos veces bajo los pies en cada salto.', series: '3', reps: '30 saltos', consejo: 'Si no los dominas, haz el triple de saltos simples' },
        { emoji: '🏆', ejercicio: 'Wall Balls (Balón medicinal a la pared)', descripcion: 'Ponerse en cuclillas y lanzar la pelota a un punto marcado en la pared al levantarse.', series: '3', reps: '15 lanzamientos', consejo: 'El punto objetivo está a 3 metros de altura — apunta bien' },
      ],
    },
  ],
  Mar: [
    {
      time: '07:30',
      name: 'Fuerza Funcional',
      subtitulo: 'Pesas + ejercicios del cuerpo — Para fortalecer músculos y mejorar la postura',
      instructor: 'Coach María',
      enrolled: 12, capacity: 15,
      type: 'strength', color: '#00FF88', duration: '45 min',
      description: 'Sesión de trabajo con pesas y autocargas diseñada para mejorar la postura, la fuerza base y la composición corporal.',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?q=80&w=600',
      isActive: true,
      nivel: 'Principiante',
      beneficios: ['Tonificación muscular', 'Mejora de postura', 'Metabolismo activo todo el día'],
      equipo: ['Mancuernas', 'Barras cortas', 'Banco plano', 'TRX (opcional)'],
      rutinas: [
        { emoji: '🦵', ejercicio: 'Sentadilla con barra (Back Squat)', descripcion: 'Bajar con la barra en los hombros como si fuera a sentarse en una silla. El rey de los ejercicios de piernas.', series: '4', reps: '10 repeticiones', consejo: 'Las rodillas van hacia afuera — nunca se juntan al bajar' },
        { emoji: '🤸', ejercicio: 'Peso muerto rumano', descripcion: 'Bajar el peso frente a las piernas con la espalda recta. Trabaja la cadena posterior (isquiotibiales y glúteos).', series: '3', reps: '12 repeticiones', consejo: 'Siente el estiramiento en la parte trasera de las piernas' },
        { emoji: '💪', ejercicio: 'Press de banca', descripcion: 'Acostado, empujar la barra hacia arriba. El ejercicio clásico para pecho y tríceps.', series: '4', reps: '8 repeticiones', consejo: 'Nunca entrenes solo en banca — siempre con un compañero cerca' },
        { emoji: '🔙', ejercicio: 'Remo con mancuerna (Bent-over Row)', descripcion: 'Apoyado en el banco, jalar la mancuerna hacia la cadera. Trabaja la espalda media y bíceps.', series: '3', reps: '10 por lado', consejo: 'No gires el cuerpo al jalar — mantén la espalda plana' },
        { emoji: '🦾', ejercicio: 'Curl de bíceps + Extensión de tríceps', descripcion: 'Doblar el codo subiendo la mancuerna, luego extender el brazo hacia atrás. Trabaja ambas caras del brazo.', series: '3', reps: '12 repeticiones cada uno', consejo: 'Movimientos lentos y controlados — no uses el impulso del cuerpo' },
        { emoji: '🧠', ejercicio: 'Plancha abdominal', descripcion: 'Sostenerse en posición de lagartija sin bajar el cuerpo. Fortalece el abdomen y el core.', series: '3', reps: '40 segundos', consejo: 'El cuerpo debe ser una línea recta — no subas ni bajes la cadera' },
      ],
    },
    {
      time: '12:00',
      name: 'Cardio HIIT',
      subtitulo: 'Intervalos de alta intensidad — Quema mucha grasa en poco tiempo',
      instructor: 'Coach Diego',
      enrolled: 22, capacity: 25,
      type: 'cardio', color: '#00E676', duration: '30 min',
      description: 'HIIT (High Intensity Interval Training): la máxima quema calórica en solo 30 minutos alternando intervalos explosivos con descansos breves.',
      image: 'https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?q=80&w=600',
      isActive: true,
      nivel: 'Intermedio',
      beneficios: ['Máxima quema de grasa', 'Mejora del corazón y pulmones', 'Efecto "post-quema" de calorías hasta 24h después'],
      equipo: ['Solo el cuerpo', 'Colchoneta (opcional)', 'Cronómetro'],
      rutinas: [
        { emoji: '💨', ejercicio: 'Estructura HIIT: 40/20', descripcion: '40 segundos de ejercicio al máximo esfuerzo + 20 segundos de descanso. Se repite durante 30 minutos.', series: '1', reps: 'Bloque completo 30 min', consejo: 'En los 40 segundos activos: ¡al 100%! En los 20 de descanso: recupera' },
        { emoji: '🏃', ejercicio: 'Carrera en el lugar con rodillas altas', descripcion: 'Correr sin moverse del sitio levantando las rodillas hasta la cadera. Cardio puro.', series: '4', reps: '40 segundos', consejo: 'Los brazos se mueven como al correr — no los dejes quietos' },
        { emoji: '⭐', ejercicio: 'Jumping Jacks (Saltos de apertura)', descripcion: 'Saltar abriendo piernas y brazos al mismo tiempo. Clásico ejercicio de cardio grupal.', series: '4', reps: '40 segundos', consejo: 'Mantén el ritmo constante — no importa la velocidad, sí el no parar' },
        { emoji: '🌋', ejercicio: 'Burpees (versión explosiva)', descripcion: 'Tirarse al piso, lagartija, saltar, y repetir. El ejercicio más completo y demandante del HIIT.', series: '4', reps: '40 segundos', consejo: 'Si es demasiado difícil, omite el salto al final — ¡sigue moviéndote!' },
        { emoji: '🔥', ejercicio: 'Mountain Climbers (Escaladores)', descripcion: 'En posición de lagartija, alternar las rodillas hacia el pecho rápidamente. Trabaja abdomen y cardio.', series: '4', reps: '40 segundos', consejo: 'Las caderas no deben subir — mantén el cuerpo horizontal' },
        { emoji: '💥', ejercicio: 'Squat Jumps (Sentadillas con salto)', descripcion: 'Bajar en cuclillas y al subir dar un salto explosivo. Combina fuerza de piernas con cardio.', series: '4', reps: '40 segundos', consejo: 'Al aterrizar, dobla las rodillas suavemente para no hacerte daño' },
      ],
    },
  ],
  Vie: [
    {
      time: '06:00',
      name: 'HYROX Challenge',
      subtitulo: 'Carrera + ejercicios por estaciones — Entrenamiento tipo competencia oficial',
      instructor: 'Coach Alex',
      enrolled: 18, capacity: 20,
      type: 'hyrox', color: '#FF6B35', duration: '60 min',
      description: 'Bloque oficial de preparación para competencia HYROX. Simula las 8 estaciones del evento real con cronometraje y registro de marcas personales.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
      isActive: true,
      nivel: 'Avanzado',
      beneficios: ['Preparación para competencia', 'Resistencia anaeróbica', 'Superación personal y marcas'],
      equipo: ['Trineo con peso', 'Remo ergómetro', 'Cuerda de batalla', 'Pesas rusas'],
      rutinas: [
        { emoji: '📋', ejercicio: 'Briefing y activación', descripcion: 'Explicación de las 8 estaciones del día, asignación de pesos y metas personales.', series: '1', reps: '10 minutos', consejo: 'Anota tu tiempo meta antes de empezar — compite contra ti mismo' },
        { emoji: '🏃', ejercicio: 'Carrera de 1 km', descripcion: 'Primer segmento de carrera. Ritmo fuerte pero controlado porque quedan 7 estaciones.', series: '1', reps: '1 km cronometrado', consejo: 'No vayas al máximo — guarda energía para el trineo' },
        { emoji: '🛷', ejercicio: 'Empuje de trineo pesado', descripcion: 'Segunda estación: empujar el trineo con mayor peso. Fuerza de piernas pura.', series: '1', reps: '50 metros totales', consejo: 'Usa los talones para empujar — no las puntas de los pies' },
        { emoji: '🚣', ejercicio: 'Remo de 1000 metros', descripcion: 'Tercera estación en el ergómetro de remo. Resistencia de espalda y brazos bajo fatiga.', series: '1', reps: '1000 metros', consejo: 'Ritmo de 2 minutos por 500 metros es buen objetivo' },
        { emoji: '🔗', ejercicio: 'Cuerda de batalla (Battle Ropes)', descripcion: 'Cuarta estación: ondear cuerdas pesadas. Hombros, brazos y core bajo alta intensidad.', series: '1', reps: '3 minutos continuos', consejo: 'Mueve los brazos desde los hombros — no solo las muñecas' },
        { emoji: '🏁', ejercicio: 'Sprint final + Registro de marca', descripcion: 'Última carrera de 1 km a tope. Luego se registra el tiempo total personal.', series: '1', reps: '1 km a máxima velocidad', consejo: 'El último sprint es el más importante — deja todo en la pista' },
      ],
    },
  ],
};

const typeLabels: Record<string, string> = {
  hyrox: 'HYROX',
  strength: 'Fuerza',
  cardio: 'Cardio',
  yoga: 'Yoga',
};

const nivelColors: Record<string, string> = {
  'Principiante': '#00FF88',
  'Intermedio': '#FF9900',
  'Avanzado': '#FF3D57',
};

const nivelEmoji: Record<string, string> = {
  'Principiante': '🟢',
  'Intermedio': '🟡',
  'Avanzado': '🔴',
};

/* ═══════════════════════════════════════════════════════════
   COMPONENTE: ClassDetailModal — Vista inmersiva de una clase
   ═══════════════════════════════════════════════════════════ */
function ClassDetailModal({ cls, onClose }: { cls: ClassBlock; onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<number | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 350);
  };

  const ocupacionPct = Math.round((cls.enrolled / cls.capacity) * 100);
  const ocupacionColor = ocupacionPct >= 90 ? '#FF3D57' : ocupacionPct >= 70 ? '#FF9900' : '#00FF88';

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: visible ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(12px)' : 'blur(0px)',
        transition: 'all 0.35s ease',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        padding: '24px 16px',
        overflowY: 'auto',
      }}
    >
      <div
        ref={scrollRef}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 860,
          background: 'var(--space-dark)',
          borderRadius: 24,
          border: `1px solid ${cls.color}30`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 60px ${cls.color}15`,
          overflow: 'hidden',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ── HERO IMAGE ── */}
        <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
          <img
            src={cls.image}
            alt={cls.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) saturate(1.2)' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to top, var(--space-dark) 5%, ${cls.color}30 40%, transparent 100%)`,
          }} />
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,61,87,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; }}
          >
            <X size={18} />
          </button>
          {/* Botón volver */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute', top: 16, left: 16,
              height: 38, borderRadius: 20, padding: '0 16px',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${cls.color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; }}
          >
            <ArrowLeft size={15} /> Volver
          </button>
          {/* Hero Content */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '24px 32px 28px',
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: '3px 12px', borderRadius: 20,
                background: `${cls.color}25`, color: cls.color, letterSpacing: 1,
                textTransform: 'uppercase',
              }}>
                {typeLabels[cls.type] || cls.type}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: '3px 12px', borderRadius: 20,
                background: `${nivelColors[cls.nivel]}20`, color: nivelColors[cls.nivel],
              }}>
                {nivelEmoji[cls.nivel]} {cls.nivel}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Clock size={10} /> {cls.duration}
              </span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: -1, lineHeight: 1.1 }}>
              {cls.name}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontStyle: 'italic' }}>
              💬 {cls.subtitulo}
            </p>
          </div>
        </div>

        {/* ── METADATA BAR ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
          background: 'rgba(255,255,255,0.04)',
          borderBottom: `1px solid ${cls.color}15`,
        }}>
          {[
            { icon: <Dumbbell size={16} />, label: 'Instructor', value: cls.instructor },
            { icon: <Timer size={16} />, label: 'Duración', value: cls.duration },
            { icon: <Users size={16} />, label: 'Cupos', value: `${cls.enrolled}/${cls.capacity}` },
            { icon: <Activity size={16} />, label: 'Ocupación', value: `${ocupacionPct}%` },
          ].map((m, mi) => (
            <div key={mi} style={{
              padding: '16px 20px', textAlign: 'center',
              background: 'var(--space-dark)',
            }}>
              <div style={{ color: cls.color, marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{m.icon}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>{m.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: mi === 3 ? ocupacionColor : 'var(--text-primary)' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* ── BODY CONTENT ── */}
        <div style={{ padding: '28px 32px 36px' }}>

          {/* Descripción */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              {cls.description}
            </p>
          </div>

          {/* Beneficios + Equipo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36 }}>
            <div style={{
              padding: '18px 20px', borderRadius: 16,
              background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Heart size={14} style={{ color: '#00FF88' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#00FF88', textTransform: 'uppercase', letterSpacing: 1.5 }}>Beneficios</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cls.beneficios.map((b, bi) => (
                  <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} style={{ color: '#00FF88', flexShrink: 0 }} />
                    {b}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '18px 20px', borderRadius: 16,
              background: `${cls.color}08`, border: `1px solid ${cls.color}15`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Zap size={14} style={{ color: cls.color }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: cls.color, textTransform: 'uppercase', letterSpacing: 1.5 }}>Equipamiento</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cls.equipo.map((eq, ei) => (
                  <span key={ei} style={{
                    fontSize: 12, padding: '5px 14px', borderRadius: 20,
                    background: `${cls.color}12`, color: cls.color,
                    border: `1px solid ${cls.color}25`, fontWeight: 600,
                  }}>
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ══ RUTINAS — SECCIÓN PRINCIPAL ══ */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${cls.color}15`, border: `1px solid ${cls.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Award size={18} style={{ color: cls.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>Rutina Completa</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {cls.rutinas.length} ejercicios · Paso a paso con explicación detallada
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20,
                background: `${cls.color}15`, color: cls.color,
              }}>
                {cls.rutinas.length} PASOS
              </span>
            </div>

            {/* Timeline de ejercicios */}
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              {/* Línea vertical del timeline */}
              <div style={{
                position: 'absolute', left: 11, top: 8, bottom: 8,
                width: 2, background: `linear-gradient(to bottom, ${cls.color}50, ${cls.color}10)`,
                borderRadius: 2,
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {cls.rutinas.map((r, ri) => {
                  const isOpen = activeRoutine === ri;
                  return (
                    <div
                      key={ri}
                      onClick={() => setActiveRoutine(isOpen ? null : ri)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        background: isOpen ? `${cls.color}08` : 'rgba(255,255,255,0.02)',
                        borderRadius: 16,
                        padding: isOpen ? '20px 22px' : '16px 22px',
                        border: isOpen ? `1px solid ${cls.color}35` : '1px solid rgba(255,255,255,0.04)',
                        transition: 'all 0.3s ease',
                        boxShadow: isOpen ? `0 4px 24px ${cls.color}12` : 'none',
                      }}
                      onMouseEnter={e => {
                        if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={e => {
                        if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }}
                    >
                      {/* Dot del timeline */}
                      <div style={{
                        position: 'absolute', left: -23, top: 22,
                        width: 14, height: 14, borderRadius: '50%',
                        background: isOpen ? cls.color : 'var(--space-light)',
                        border: `2px solid ${isOpen ? cls.color : 'rgba(255,255,255,0.15)'}`,
                        transition: 'all 0.3s',
                        boxShadow: isOpen ? `0 0 12px ${cls.color}60` : 'none',
                      }} />

                      {/* Header del ejercicio */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: 28, lineHeight: 1 }}>{r.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 900, color: cls.color,
                              background: `${cls.color}15`, padding: '1px 8px', borderRadius: 8,
                            }}>
                              #{ri + 1}
                            </span>
                            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                              {r.ejercicio}
                            </span>
                          </div>
                          {!isOpen && (
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>
                              {r.descripcion.slice(0, 80)}...
                            </p>
                          )}
                        </div>
                        {/* Series/Reps badge compacto */}
                        <div style={{
                          textAlign: 'center', padding: '6px 14px', borderRadius: 12,
                          background: `${cls.color}12`, border: `1px solid ${cls.color}20`,
                          flexShrink: 0,
                        }}>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Series</div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: cls.color }}>{r.series}</div>
                        </div>
                        <ChevronDown size={16} style={{
                          color: 'var(--text-muted)', flexShrink: 0,
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.3s',
                        }} />
                      </div>

                      {/* Contenido expandido */}
                      {isOpen && (
                        <div style={{ marginTop: 16, paddingLeft: 42 }}>
                          {/* Descripción completa */}
                          <p style={{
                            fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7,
                            marginBottom: 14, paddingBottom: 14,
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                          }}>
                            {r.descripcion}
                          </p>

                          {/* Reps/Tiempo */}
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
                          }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '8px 16px', borderRadius: 12,
                              background: `${cls.color}10`, border: `1px solid ${cls.color}20`,
                            }}>
                              <TrendingUp size={14} style={{ color: cls.color }} />
                              <div>
                                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Repeticiones / Tiempo</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: cls.color, marginTop: 2 }}>{r.reps}</div>
                              </div>
                            </div>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '8px 16px', borderRadius: 12,
                              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                              <Target size={14} style={{ color: 'var(--text-secondary)' }} />
                              <div>
                                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Series</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{r.series} sets</div>
                              </div>
                            </div>
                          </div>

                          {/* Consejo destacado */}
                          <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            padding: '12px 16px', borderRadius: 12,
                            background: 'rgba(255,214,0,0.06)',
                            border: '1px solid rgba(255,214,0,0.15)',
                          }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 8,
                              background: 'rgba(255,214,0,0.12)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <Shield size={14} style={{ color: '#FFD600' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 800, color: '#FFD600', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>Consejo del Coach</div>
                              <div style={{ fontSize: 13, color: 'rgba(255,214,0,0.85)', lineHeight: 1.6 }}>
                                {r.consejo}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer del modal */}
          <div style={{
            marginTop: 32, paddingTop: 20,
            borderTop: `1px solid ${cls.color}15`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {cls.name} · {cls.instructor} · {cls.duration}
            </div>
            <button
              onClick={handleClose}
              style={{
                padding: '10px 24px', borderRadius: 14,
                background: `${cls.color}15`, border: `1px solid ${cls.color}30`,
                color: cls.color, fontWeight: 800, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${cls.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${cls.color}15`; }}
            >
              <ArrowLeft size={14} /> Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: Schedule
   ═══════════════════════════════════════════════════════════ */
export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState(days[today]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const [activeTab, setActiveTab] = useState<Record<number, 'rutinas' | 'info'>>({});
  const [detailClass, setDetailClass] = useState<ClassBlock | null>(null);

  const dayClasses = localSchedule[selectedDay] || [];

  const toggleStatus = (day: string, idx: number) => {
    setLocalSchedule(prev => ({
      ...prev,
      [day]: prev[day].map((c, i) => i === idx ? { ...c, isActive: !c.isActive } : c)
    }));
  };

  const getTab = (i: number) => activeTab[i] || 'rutinas';
  const setTab = (i: number, tab: 'rutinas' | 'info') =>
    setActiveTab(prev => ({ ...prev, [i]: tab }));

  const totalEnrolled = Object.values(schedule).flat().reduce((a, c) => a + c.enrolled, 0);
  const totalCapacity = Object.values(schedule).flat().reduce((a, c) => a + c.capacity, 0);

  return (
    <div className="animate-fade-in">

      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Calendario Semanal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Semana del 14–20 de Abril 2026 · {Object.values(schedule).flat().length} clases programadas
          </p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Nueva Clase</button>
      </div>

      {/* ─── KPIs ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Clases esta semana', value: String(Object.values(schedule).flat().length), color: 'var(--neon-green)', icon: <CalendarDays size={18} /> },
          { label: 'Total inscritos', value: String(totalEnrolled), color: 'var(--energy-orange)', icon: <Users size={18} /> },
          { label: 'Ocupación media', value: `${Math.round((totalEnrolled / totalCapacity) * 100)}%`, color: 'var(--success-green)', icon: <Target size={18} /> },
          { label: 'Instructores activos', value: '6', color: 'var(--neon-green)', icon: <Star size={18} /> },
        ].map((k, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: k.color, opacity: 0.7 }}>{k.icon}</div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── NAV DÍAS ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button className="btn btn-ghost" style={{ padding: '8px 10px' }}><ChevronLeft size={16} /></button>
        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          {days.map((day, i) => (
            <button
              key={day}
              onClick={() => { setSelectedDay(day); setExpandedId(null); }}
              style={{
                flex: 1, padding: '12px 8px',
                borderRadius: 'var(--radius-md)',
                border: selectedDay === day ? '1px solid var(--neon-green)' : '1px solid rgba(0,255,136,0.08)',
                background: selectedDay === day ? 'var(--green-10)' : 'var(--space-medium)',
                cursor: 'pointer', textAlign: 'center',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: selectedDay === day ? 'var(--neon-green)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{day}</div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: i === today ? 'var(--neon-green)' : selectedDay === day ? 'var(--text-primary)' : 'var(--text-secondary)', marginTop: 2 }}>{dates[i]}</div>
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'center', gap: 3 }}>
                {(schedule[day] || []).slice(0, 3).map((_, ci) => (
                  <span key={ci} style={{ width: 4, height: 4, borderRadius: '50%', background: selectedDay === day ? 'var(--neon-green)' : 'var(--text-muted)', display: 'inline-block' }} />
                ))}
              </div>
            </button>
          ))}
        </div>
        <button className="btn btn-ghost" style={{ padding: '8px 10px' }}><ChevronRight size={16} /></button>
      </div>

      {/* ─── CLASES DEL DÍA ─── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <CalendarDays size={18} style={{ color: 'var(--neon-green)' }} />
          <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>
            {selectedDay} {dates[days.indexOf(selectedDay)]} de Abril
          </h3>
          <span style={{
            fontSize: 'var(--text-xs)', fontWeight: 600,
            padding: '2px 8px', borderRadius: 'var(--radius-full)',
            background: 'var(--green-10)', color: 'var(--neon-green)',
          }}>
            {dayClasses.length} clases
          </span>
        </div>

        {dayClasses.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <CalendarDays size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Sin clases programadas este día</div>
            <button className="btn btn-secondary" style={{ marginTop: 16 }}><Plus size={16} /> Añadir Clase</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dayClasses.map((cls, i) => {
              const isExpanded = expandedId === i;
              const tab = getTab(i);
              const ocupacionPct = Math.round((cls.enrolled / cls.capacity) * 100);
              const ocupacionColor = ocupacionPct >= 90 ? '#FF3D57' : ocupacionPct >= 70 ? '#FF9900' : 'var(--neon-green)';

              return (
                <div
                  key={i}
                  className="glass-card animate-fade-in"
                  style={{
                    padding: 0, overflow: 'hidden',
                    borderLeft: `4px solid ${cls.color}`,
                    opacity: cls.isActive ? 1 : 0.55,
                    transition: 'all 0.35s ease',
                    boxShadow: isExpanded ? `0 8px 32px ${cls.color}20` : 'none',
                  }}
                >
                  {/* ── Fila Principal (siempre visible) ── */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : i)}
                    style={{
                      padding: '18px 22px', display: 'flex', alignItems: 'center',
                      gap: 20, cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Hora */}
                    <div style={{ textAlign: 'center', width: 68, flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: cls.color }}>{cls.time}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} />
                        {cls.duration}
                      </div>
                    </div>

                    {/* Separador */}
                    <div style={{ width: 1, height: 56, background: `${cls.color}25`, flexShrink: 0 }} />

                    {/* Info principal */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Título + badge tipo */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: 'var(--text-base)' }}>{cls.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px',
                          borderRadius: 20, background: `${cls.color}18`, color: cls.color,
                          textTransform: 'uppercase', letterSpacing: 0.8,
                        }}>
                          {typeLabels[cls.type] || cls.type}
                        </span>
                        {!cls.isActive && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger-red)', background: 'rgba(255,61,87,0.1)', padding: '2px 8px', borderRadius: 20 }}>
                            INACTIVA
                          </span>
                        )}
                      </div>

                      {/* ← SUBTÍTULO EN ESPAÑOL SENCILLO para la recepcionista */}
                      <div style={{
                        fontSize: 12, color: 'var(--text-muted)', marginBottom: 8,
                        fontStyle: 'italic', lineHeight: 1.4,
                        padding: '4px 10px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 8,
                        borderLeft: `2px solid ${cls.color}50`,
                      }}>
                        💬 {cls.subtitulo}
                      </div>

                      {/* Meta-info: instructor + nivel + cupos */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <Dumbbell size={11} style={{ color: cls.color }} />
                          {cls.instructor}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: nivelColors[cls.nivel] }}>
                          {nivelEmoji[cls.nivel]} {cls.nivel}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: ocupacionColor }}>
                          <Users size={11} />
                          {cls.enrolled}/{cls.capacity} cupos
                        </span>
                      </div>
                    </div>

                    {/* Barra de ocupación compacta */}
                    <div style={{ width: 80, flexShrink: 0, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>OCUPACIÓN</div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                        <div style={{ height: '100%', width: `${ocupacionPct}%`, background: ocupacionColor, borderRadius: 10, transition: 'width 0.5s' }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: ocupacionColor, marginTop: 4 }}>{ocupacionPct}%</div>
                    </div>

                    {/* Chevron */}
                    <div style={{ transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                      <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  {/* ══════ PANEL EXPANDIBLE ══════ */}
                  {isExpanded && (
                    <div className="animate-fade-in" style={{ borderTop: `1px solid ${cls.color}20` }}>

                      {/* Imagen de portada */}
                      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                        <img
                          src={cls.image}
                          alt={cls.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }}
                        />
                        <div style={{
                          position: 'absolute', inset: 0, padding: '20px 28px',
                          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                          background: `linear-gradient(to top, ${cls.color}60, transparent)`,
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: cls.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
                            {typeLabels[cls.type]} · {cls.nivel}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 4 }}>{cls.name}</div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', fontStyle: 'italic' }}>
                            💬 {cls.subtitulo}
                          </div>
                        </div>
                      </div>

                      {/* Pestañas */}
                      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 28px' }}>
                        {[
                          { key: 'rutinas', label: '📋 Rutinas Explicadas' },
                          { key: 'info', label: 'ℹ️ Información de la Clase' },
                        ].map(t => (
                          <button
                            key={t.key}
                            onClick={e => { e.stopPropagation(); setTab(i, t.key as 'rutinas' | 'info'); }}
                            style={{
                              padding: '12px 18px',
                              background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: 13, fontWeight: 700,
                              color: tab === t.key ? cls.color : 'var(--text-muted)',
                              borderBottom: tab === t.key ? `2px solid ${cls.color}` : '2px solid transparent',
                              transition: 'all 0.2s',
                              marginBottom: -1,
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 220px', gap: 28 }}>

                        {/* ─── PESTAÑA: RUTINAS EXPLICADAS ─── */}
                        {tab === 'rutinas' && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: cls.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                              🏋️ Ejercicios paso a paso — {cls.rutinas.length} ejercicios
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {cls.rutinas.map((r, ri) => (
                                <div
                                  key={ri}
                                  style={{
                                    background: 'rgba(255,255,255,0.025)',
                                    borderRadius: 14,
                                    padding: '14px 16px',
                                    borderLeft: `3px solid ${cls.color}40`,
                                    display: 'grid',
                                    gridTemplateColumns: '44px 1fr auto',
                                    gap: 14,
                                    alignItems: 'start',
                                  }}
                                >
                                  {/* Emoji + número */}
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24 }}>{r.emoji}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>#{ri + 1}</div>
                                  </div>

                                  {/* Nombre + descripción + consejo */}
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4, color: 'var(--text-primary)' }}>
                                      {r.ejercicio}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 8 }}>
                                      {r.descripcion}
                                    </div>
                                    <div style={{
                                      fontSize: 11, color: '#FFD600',
                                      display: 'flex', alignItems: 'flex-start', gap: 6,
                                      background: 'rgba(255,214,0,0.06)', padding: '6px 10px', borderRadius: 8
                                    }}>
                                      <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                                      <span><strong>Consejo:</strong> {r.consejo}</span>
                                    </div>
                                  </div>

                                  {/* Series / reps */}
                                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{
                                      background: `${cls.color}15`,
                                      borderRadius: 10, padding: '8px 12px',
                                      border: `1px solid ${cls.color}30`
                                    }}>
                                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Series</div>
                                      <div style={{ fontSize: 16, fontWeight: 900, color: cls.color }}>{r.series}</div>
                                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: 6, marginBottom: 2 }}>Reps / Tiempo</div>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{r.reps}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ─── PESTAÑA: INFO DE LA CLASE ─── */}
                        {tab === 'info' && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: cls.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
                              Sobre esta clase
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                              {cls.description}
                            </p>

                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--neon-green)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                              <Heart size={12} style={{ display: 'inline', marginRight: 6 }} />
                              Beneficios
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                              {cls.beneficios.map((b, bi) => (
                                <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                                  <CheckCircle size={14} style={{ color: 'var(--neon-green)', flexShrink: 0 }} />
                                  {b}
                                </div>
                              ))}
                            </div>

                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--energy-orange)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                              <Zap size={12} style={{ display: 'inline', marginRight: 6 }} />
                              Equipamiento necesario
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {cls.equipo.map((eq, ei) => (
                                <span key={ei} style={{
                                  fontSize: 11, padding: '4px 12px', borderRadius: 20,
                                  background: 'rgba(255,153,0,0.1)', color: 'var(--energy-orange)',
                                  border: '1px solid rgba(255,153,0,0.2)',
                                }}>
                                  {eq}
                                </span>
                              ))}
                            </div>

                            <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                              <div style={{ display: 'flex', gap: 16 }}>
                                <div>
                                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Instructor</div>
                                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{cls.instructor}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Duración</div>
                                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{cls.duration}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Nivel</div>
                                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, color: nivelColors[cls.nivel] }}>{nivelEmoji[cls.nivel]} {cls.nivel}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ─── PANEL DE GESTIÓN (siempre visible) ─── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                            GESTIÓN RÁPIDA
                          </div>

                          {/* Barra de cupos visual */}
                          <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cupos disponibles</span>
                              <span style={{ fontSize: 12, fontWeight: 800, color: ocupacionColor }}>
                                {cls.capacity - cls.enrolled} libres
                              </span>
                            </div>
                            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                              <div style={{ height: '100%', width: `${ocupacionPct}%`, background: ocupacionColor, borderRadius: 10 }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cls.enrolled} inscritos</span>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cls.capacity} máx</span>
                            </div>
                          </div>

                          <button
                            onClick={e => { e.stopPropagation(); toggleStatus(selectedDay, i); }}
                            style={{
                              padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                              background: cls.isActive ? 'rgba(255,61,87,0.1)' : 'var(--green-10)',
                              color: cls.isActive ? 'var(--danger-red)' : 'var(--neon-green)',
                              fontWeight: 800, fontSize: 12,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                              transition: 'all 0.2s',
                            }}
                          >
                            {cls.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            {cls.isActive ? 'DESACTIVAR CLASE' : 'ACTIVAR CLASE'}
                          </button>

                          <button
                            onClick={e => { e.stopPropagation(); setDetailClass(cls); }}
                            style={{
                              width: '100%', padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                              background: `linear-gradient(135deg, ${cls.color}20, ${cls.color}10)`,
                              color: cls.color, fontWeight: 800, fontSize: 13,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                              transition: 'all 0.2s',
                              border: `1px solid ${cls.color}30`,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${cls.color}35`; }}
                            onMouseLeave={e => { e.currentTarget.style.background = `${cls.color}15`; }}
                          >
                            🏋️ VER CLASE COMPLETA
                          </button>
                          <button className="btn btn-secondary" style={{ width: '100%', fontSize: 12, padding: 12 }}>
                            ✏️ Editar Horario
                          </button>
                          <button className="btn btn-ghost" style={{ width: '100%', fontSize: 12, padding: 12 }}>
                            <Flame size={13} /> Ver Estadísticas
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ MODAL DE DETALLE DE CLASE ══ */}
      {detailClass && (
        <ClassDetailModal cls={detailClass} onClose={() => setDetailClass(null)} />
      )}
    </div>
  );
}
