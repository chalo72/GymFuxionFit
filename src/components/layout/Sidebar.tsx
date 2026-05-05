import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, BarChart3, Settings,
  Dumbbell, Zap, Scan, Kanban, Apple, Brain, Trophy, CreditCard,
  Watch, CalendarRange, UserCheck, LogOut, ShieldCheck, Radio, Smartphone,
  TrendingUp, Package, X, ChevronLeft, ChevronRight, BookOpen, ClipboardList, PieChart, Shield, HeartPulse, BrainCircuit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/* ── Elementos de navegación por rol ── */
const adminNav = [
  { section: 'Principal', items: [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trainer',     icon: Zap,             label: 'Rendimiento Élite', badge: 'VIBE' },
    { to: '/operations',  icon: Radio,           label: 'Operaciones Live', badge: '●' },
    { to: '/genesis-scan',icon: Scan,            label: 'Genesis Scan' },
    { to: '/crm',         icon: Kanban,          label: 'CRM Ventas' },
    { to: '/members',     icon: Users,           label: 'Miembros', badge: 245 },
    { to: '/schedule',    icon: CalendarRange,   label: 'Calendario' },
    { to: '/classes',     icon: CalendarDays,    label: 'Clases' },
    { to: '/catalogs',    icon: BookOpen,        label: 'Catálogos Expertos' },
    { to: '/evaluacion',  icon: ClipboardList,   label: 'Entrevista Inicial', badge: 'NUEVO' },
    { to: '/elite-plan',  icon: BrainCircuit,    label: 'Plan de Entrenamiento', badge: 'PRO' },
    { to: '/elite-rec',   icon: HeartPulse,      label: 'Descanso y Energía', badge: 'VITAL' },
  ]},
  { section: 'IA & Biometría', items: [
    { to: '/ai-coach',   icon: Brain,   label: 'AI Coach' },
    { to: '/nutrition',  icon: Apple,   label: 'Nutrición' },
    { to: '/wearables',  icon: Watch,   label: 'Wearables' },
    { to: '/leaderboard',icon: Trophy,  label: 'Leaderboard' },
  ]},
  { section: 'Negocio', items: [
    { to: '/analytics', icon: BarChart3,  label: 'Analíticas' },
    { to: '/kpis',      icon: PieChart,   label: 'KPIs Gerenciales', badge: 'NEW' },
    { to: '/finances',  icon: TrendingUp, label: 'Finanzas' },
    { to: '/inventory', icon: Package,    label: 'Inventario' },
    { to: '/payments',  icon: CreditCard, label: 'Pagos' },
  ]},
  { section: 'Sistema', items: [
    { to: '/client-app', icon: Smartphone, label: 'App Cliente' },
    { to: '/settings',   icon: Settings,   label: 'Configuración' },
  ]},
  { section: 'Dashboards Cliente', items: [
    { to: '/client/progress', icon: TrendingUp, label: 'Mi Progreso' },
    { to: '/client/nutrition',icon: Apple,      label: 'Nutrición Cliente' },
    { to: '/client/training', icon: Dumbbell,   label: 'Entrenamientos' },
    { to: '/reports',         icon: BarChart3,  label: 'Reportes Globales' },
  ]},
];

const trainerNav = [
  { section: 'Mi Espacio', items: [
    { to: '/trainer', icon: LayoutDashboard, label: 'Mis Clientes' },
    { to: '/evaluacion', icon: ClipboardList,   label: 'Entrevista Inicial', badge: 'NUEVO' },
    { to: '/elite-plan', icon: BrainCircuit,    label: 'Plan de Entrenamiento', badge: 'PRO' },
    { to: '/elite-rec',  icon: HeartPulse,      label: 'Descanso y Energía', badge: 'VITAL' },
    { to: '/schedule', icon: CalendarRange,  label: 'Mi Agenda' },
    { to: '/classes',  icon: CalendarDays,   label: 'Clases' },
  ]},
  { section: 'Herramientas IA', items: [
    { to: '/ai-coach',  icon: Brain,  label: 'AI Coach' },
    { to: '/nutrition', icon: Apple,  label: 'Nutrición' },
    { to: '/wearables', icon: Watch,  label: 'Wearables' },
  ]},
  { section: 'Competencia', items: [
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ]},
];

const receptionNav = [
  { section: 'Control Gym', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/reception', icon: UserCheck,      label: 'Recepción Live' },
    { to: '/members',   icon: Users,          label: 'Miembros' },
    { to: '/schedule',  icon: CalendarRange,  label: 'Horarios' },
    { to: '/classes',   icon: CalendarDays,   label: 'Clases' },
  ]},
  { section: 'Negocio', items: [
    { to: '/finances',  icon: TrendingUp, label: 'Finanzas' },
    { to: '/inventory', icon: Package,    label: 'Inventario' },
    { to: '/crm',       icon: Kanban,     label: 'CRM Ventas' },
    { to: '/payments',  icon: CreditCard, label: 'Pagos' },
  ]},
];

const clientNav = [
  { section: 'Mi Área Personal', items: [
    { to: '/client/progress', icon: TrendingUp, label: 'Mi Progreso' },
    { to: '/client/nutrition',icon: Apple,      label: 'Nutrición' },
    { to: '/client/training', icon: Dumbbell,   label: 'Entrenamiento' },
    { to: '/reports',         icon: BarChart3,  label: 'Mis Reportes' },
  ]},
];

const roleNavMap: Record<string, any> = { 
  admin: adminNav, 
  trainer: trainerNav, 
  receptionist: receptionNav, 
  client: clientNav,
  athlete: clientNav 
};

const roleColors: Record<string, string> = {
  admin: '#00FF88',
  trainer: '#FF6B35',
  receptionist: '#A78BFA',
  client: '#00d0ff',
  athlete: '#00d0ff',
};

const roleLabels: Record<string, string> = {
  admin: 'Super Admin',
  trainer: 'Entrenador',
  receptionist: 'Recepcionista',
  client: 'Cliente',
  athlete: 'Atleta',
};

export default function Sidebar({ 
  isOpen, 
  onClose,
  isCollapsed,
  onToggleCollapse
}: { 
  isOpen?: boolean, 
  onClose?: () => void,
  isCollapsed: boolean,
  onToggleCollapse: () => void
}) {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { user, logout } = useAuth();

  const role      = user?.role ?? 'admin';
  const navGroups = roleNavMap[role] ?? adminNav;
  const roleColor = roleColors[role] ?? '#00FF88';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      {/* ─── HEADER ─── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Dumbbell />
        </div>
        <div className="sidebar-brand">
          Gym<span>Fuxion</span>Fit
        </div>

        {/* Botón cerrar móvil */}
        <button className="mobile-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Rol badge */}
      <div className="sidebar-role-badge" style={{ padding: '8px 16px 4px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 'var(--radius-full)',
          background: `${roleColor}15`, border: `1px solid ${roleColor}30`,
          fontSize: 'var(--text-xs)', fontWeight: 700, color: roleColor,
        }}>
          <ShieldCheck size={11} /> {roleLabels[role]}
        </div>
      </div>

      {/* ─── NAVIGATION ─── */}
      <nav className="sidebar-nav">
        {navGroups.map((group: any) => (
          <div key={group.section}>
            <span className="sidebar-section-label">{group.section}</span>
            {group.items.map((item: any) => (
              <NavLink
                key={`${group.section}__${item.to}`}
                to={item.to}
                className={`sidebar-item ${location.pathname === item.to ? 'active' : ''}`}
              >
                <item.icon />
                <span>{item.label}</span>
                {'badge' in item && item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ─── FOOTER ─── */}
      <div className="sidebar-footer">
        <button className="sidebar-toggle-btn" onClick={onToggleCollapse} title={isCollapsed ? 'Expandir Navegación' : 'Colapsar Navegación'}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span>VISTA COMPACTA</span>}
        </button>

        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)` }}>
            <Zap size={16} />
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name?.split(' ')[0] ?? 'Usuario'}</div>
            <div className="sidebar-user-role">{roleLabels[role]}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', padding: 4, marginLeft: 'auto', borderRadius: 'var(--radius-sm)', transition: 'color var(--transition-fast)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger-red)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
