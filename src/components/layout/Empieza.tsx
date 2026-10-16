import { useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '../../contexts/AuthContext';

type Paso = { n: string; titulo: string; detalle: string; to: string };

const PASOS: Record<UserRole, { titulo: string; frase: string; pasos: Paso[] }> = {
  admin: {
    titulo: 'Empieza como gerente',
    frase: 'Tres cosas. El resto está en el menú.',
    pasos: [
      { n: '1', titulo: 'La plata', detalle: 'Abrir la caja, ver el día y cerrar.', to: '/finances' },
      { n: '2', titulo: 'La puerta', detalle: 'Quién entró, quién debe, quién paga.', to: '/reception' },
      { n: '3', titulo: 'Los precios', detalle: 'Día, semana y mes.', to: '/settings?tab=pricing' },
    ],
  },
  receptionist: {
    titulo: 'Empieza en recepción',
    frase: 'Busca el nombre o el número, toca Entrar, y cobra o fía en la ficha.',
    pasos: [
      { n: '1', titulo: 'La entrada', detalle: 'Estás en la puerta. Busca y deja pasar.', to: '/reception' },
      { n: '2', titulo: 'Cobrar o fiar', detalle: 'Efectivo, Nequi o crédito, en la misma ficha.', to: '/reception' },
      { n: '3', titulo: 'La caja', detalle: 'Ábrela al empezar y ciérrala al irte.', to: '/finances' },
    ],
  },
  trainer: {
    titulo: 'Empieza como entrenador',
    frase: 'Elige a la persona y abre su sesión.',
    pasos: [
      { n: '1', titulo: 'Mis atletas', detalle: 'Quién entrena hoy.', to: '/trainer' },
      { n: '2', titulo: 'La sesión', detalle: 'Peso, reps y lo que sigue.', to: '/entreno' },
      { n: '3', titulo: 'La comida', detalle: 'Calorías y proteína del día.', to: '/nutrition' },
    ],
  },
  client: {
    titulo: 'Empieza tu entreno',
    frase: 'Tres botones. No hay más que buscar.',
    pasos: [
      { n: '1', titulo: 'Mi entreno', detalle: 'La sesión de hoy: peso y series.', to: '/entreno' },
      { n: '2', titulo: 'Lo que comí', detalle: 'Calorías y proteína.', to: '/client/nutrition' },
      { n: '3', titulo: 'Mi peso', detalle: 'Cómo vas.', to: '/client/progress' },
    ],
  },
  athlete: {
    titulo: 'Empieza tu entreno',
    frase: 'Tres botones. No hay más que buscar.',
    pasos: [
      { n: '1', titulo: 'Mi entreno', detalle: 'La sesión de hoy: peso y series.', to: '/entreno' },
      { n: '2', titulo: 'Lo que comí', detalle: 'Calorías y proteína.', to: '/client/nutrition' },
      { n: '3', titulo: 'Mi peso', detalle: 'Cómo vas.', to: '/client/progress' },
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
              <span>{aqui ? 'Estás en este paso.' : paso.detalle}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
