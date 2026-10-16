import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Wallet, Users, Menu, Dumbbell, Apple, CalendarRange, QrCode, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type Item = { to: string; label: string; icon: typeof Wallet };

const recepción: Item[] = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard },
  { to: '/reception', label: 'Recepción', icon: UserCheck },
  { to: '/finances', label: 'Caja', icon: Wallet },
  { to: '/finances?tab=personal', label: 'Personal', icon: Users },
];

const entrenador: Item[] = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard },
  { to: '/trainer', label: 'Atletas', icon: Users },
  { to: '/schedule', label: 'Agenda', icon: CalendarRange },
  { to: '/nutrition', label: 'Nutrición', icon: Apple },
];

const socio: Item[] = [
  { to: '/sala', label: 'Sala', icon: QrCode },
  { to: '/client/training', label: 'Entreno', icon: Dumbbell },
  { to: '/client/nutrition', label: 'Comida', icon: Apple },
  { to: '/client/progress', label: 'Progreso', icon: LayoutDashboard },
];

function activo(to: string, path: string, search: string) {
  if (to.includes('tab=personal')) return path === '/finances' && search.includes('tab=personal');
  if (to === '/finances') return path === '/finances' && !search.includes('tab=personal');
  return path === to;
}

export default function BottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const role = user?.role ?? 'admin';
  const items = role === 'trainer' ? entrenador : role === 'client' || role === 'athlete' ? socio : recepción;
  const centro = role === 'trainer'
    ? { to: '/trainer', label: 'Atletas' }
    : role === 'client' || role === 'athlete'
      ? { to: '/entreno', label: 'Sesión' }
      : { to: '/reception', label: 'Recepción' };
  const lados = items.filter((item) => item.to !== centro.to).slice(0, 3);

  return (
    <nav className="thumb-nav" aria-label="Accesos rápidos">
      {lados.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const on = activo(item.to, pathname, search);
        return (
          <button key={item.to} type="button" className={on ? 'on' : ''} onClick={() => navigate(item.to)}>
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
      <button type="button" className="fit-fab" onClick={() => navigate(centro.to)} aria-label={centro.label}>
        <Plus size={28} />
      </button>
      {lados.slice(2).map((item) => {
        const Icon = item.icon;
        const on = activo(item.to, pathname, search);
        return (
          <button key={item.to} type="button" className={on ? 'on' : ''} onClick={() => navigate(item.to)}>
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
      <button type="button" onClick={onOpenMenu}>
        <Menu size={22} />
        <span>Menú</span>
      </button>
    </nav>
  );
}
