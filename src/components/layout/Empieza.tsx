import { useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '../../contexts/AuthContext';

type Paso = { n: string; titulo: string; detalle: string; to: string };

const PASOS: Record<UserRole, { titulo: string; frase: string; pasos: Paso[] }> = {
  admin: {
    titulo: 'Gerencia',
    frase: 'Caja, recepción y tarifas.',
    pasos: [
      { n: '1', titulo: 'Caja', detalle: 'Apertura, movimiento y cierre.', to: '/finances' },
      { n: '2', titulo: 'Recepción', detalle: 'Ingreso, deuda y cobro.', to: '/reception' },
      { n: '3', titulo: 'Tarifas', detalle: 'Día, semana y mes.', to: '/settings?tab=pricing' },
    ],
  },
  receptionist: {
    titulo: 'Recepción',
    frase: 'Busque al cliente, registre el ingreso y cobre.',
    pasos: [
      { n: '1', titulo: 'Ingreso', detalle: 'Búsqueda por nombre o número.', to: '/reception' },
      { n: '2', titulo: 'Cobro', detalle: 'Efectivo, Nequi o crédito.', to: '/reception' },
      { n: '3', titulo: 'Caja', detalle: 'Apertura al iniciar y cierre al salir.', to: '/finances' },
    ],
  },
  trainer: {
    titulo: 'Entrenador',
    frase: 'Seleccione el atleta y abra la sesión.',
    pasos: [
      { n: '1', titulo: 'Atletas', detalle: 'Asistencia del día.', to: '/trainer' },
      { n: '2', titulo: 'Sesión', detalle: 'Carga, repeticiones y serie.', to: '/entreno' },
      { n: '3', titulo: 'Nutrición', detalle: 'Calorías y proteína.', to: '/nutrition' },
    ],
  },
  client: {
    titulo: 'Cliente',
    frase: 'Entrenamiento, nutrición y progreso.',
    pasos: [
      { n: '1', titulo: 'Entrenamiento', detalle: 'Sesión del día: carga y series.', to: '/entreno' },
      { n: '2', titulo: 'Nutrición', detalle: 'Calorías y proteína.', to: '/client/nutrition' },
      { n: '3', titulo: 'Progreso', detalle: 'Peso corporal.', to: '/client/progress' },
    ],
  },
  athlete: {
    titulo: 'Cliente',
    frase: 'Entrenamiento, nutrición y progreso.',
    pasos: [
      { n: '1', titulo: 'Entrenamiento', detalle: 'Sesión del día: carga y series.', to: '/entreno' },
      { n: '2', titulo: 'Nutrición', detalle: 'Calorías y proteína.', to: '/client/nutrition' },
      { n: '3', titulo: 'Progreso', detalle: 'Peso corporal.', to: '/client/progress' },
    ],
  },
};

export default function Empieza({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const guia = PASOS[role] ?? PASOS.admin;
  return (
    <section className="empieza" aria-label={guia.titulo}>
      <p className="empieza-kicker">{guia.titulo}</p>
      <h2 className="empieza-frase">{guia.frase}</h2>
      <div className="empieza-grid">
        {guia.pasos.map((paso) => {
          const aqui = paso.n === '1' && pathname === paso.to.split('?')[0];
          return (
            <button key={paso.n + paso.titulo} type="button" className="empieza-card" onClick={() => navigate(paso.to)}>
              <span className="empieza-n">{paso.n}</span>
              <strong>{paso.titulo}</strong>
              <span>{aqui ? 'Módulo activo.' : paso.detalle}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
