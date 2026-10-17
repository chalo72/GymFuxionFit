import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarDays, BarChart3, Settings,
  Dumbbell, Zap, Kanban, Apple, Brain,
  CalendarRange, UserCheck, LogOut, ShieldCheck, Smartphone,
  TrendingUp, Package, X, ChevronLeft, ChevronRight, ClipboardList, BrainCircuit, ChevronDown, Wrench, QrCode, MessageCircle, Video
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/* ── Elementos de navegación por rol ── */
const adminNav = [
  { section: 'Inicio', items: [
    { to: '/',            icon: LayoutDashboard, label: 'Inicio' },
    { to: '/finances',    icon: TrendingUp,      label: 'Caja' },
    { to: '/reception',   icon: UserCheck,       label: 'Recepción' },
    { to: '/settings?tab=pricing', icon: Settings, label: 'Tarifas' },
    { to: '/camaras',     icon: Video,           label: 'Cámaras' },
    { to: '/members',     icon: Users,           label: 'Clientes' },
    { to: '/schedule',    icon: CalendarRange,   label: 'Calendario' },
    { to: '/classes',     icon: CalendarDays,    label: 'Clases' },
  ]},
  { section: 'Supervisión', items: [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard gerente' },
    { to: '/kpis',        icon: BarChart3,       label: 'KPIs gerenciales' },
    { to: '/nutrition',   icon: Apple,           label: 'Nutrición' },
    { to: '/trainer',     icon: Zap,             label: 'Entrenamiento' },
    { to: '/piso-qr',     icon: QrCode,          label: 'Piso QR' },
  ]},
  { section: 'Entrenar', items: [
    { to: '/entreno',     icon: Dumbbell,        label: 'Sesión' },
    { to: '/evaluacion',  icon: ClipboardList,   label: 'Entrevista' },
    { to: '/elite-plan',  icon: BrainCircuit,    label: 'Plan' },
    { to: '/ai-coach',    icon: Brain,           label: 'AI Coach' },
  ]},
  { section: 'Negocio', items: [
    { to: '/finances',    icon: TrendingUp,      label: 'Finanzas' },
    { to: '/finances?tab=personal', icon: Users, label: 'Nómina' },
    { to: '/avisos',      icon: MessageCircle,   label: 'Avisos WhatsApp' },
    { to: '/crm',         icon: Kanban,          label: 'CRM' },
    { to: '/inventory',   icon: Package,        label: 'Inventario' },
    { to: '/analytics',   icon: BarChart3,      label: 'Analíticas' },
  ]},
  { section: 'Sistema', items: [
    { to: '/client-app',  icon: Smartphone,     label: 'App cliente' },
    { to: '/mantenimiento', icon: Wrench,       label: 'Mantenimiento' },
    { to: '/settings?tab=pricing', icon: Settings, label: 'Precios' },
    { to: '/settings',    icon: Settings,       label: 'Configuración' },
  ]}
];

const trainerNav = [
  { section: 'Mi espacio', items: [
    { to: '/trainer', icon: Zap, label: 'Atletas' },
    { to: '/entreno', icon: Dumbbell, label: 'Sesión' },
    { to: '/nutrition', icon: Apple, label: 'Nutrición' },
    { to: '/', icon: LayoutDashboard, label: 'Hoy' },
    { to: '/evaluacion', icon: ClipboardList, label: 'Entrevista' },
    { to: '/elite-plan', icon: BrainCircuit, label: 'Plan' },
    { to: '/schedule', icon: CalendarRange, label: 'Agenda' },
    { to: '/classes', icon: CalendarDays, label: 'Clases' },
  ]},
  { section: 'Herramientas', items: [
    { to: '/ai-coach', icon: Brain, label: 'AI Coach' },
    { to: '/piso-qr', icon: QrCode, label: 'Piso QR' },
  ]},
];

const receptionNav = [
  { section: 'Recepción', items: [
    { to: '/reception', icon: UserCheck, label: 'Recepción' },
    { to: '/finances', icon: TrendingUp, label: 'Caja' },
    { to: '/camaras', icon: Video, label: 'Cámaras' },
    { to: '/', icon: LayoutDashboard, label: 'Hoy' },
    { to: '/avisos', icon: MessageCircle, label: 'Avisos' },
  ]},
  { section: 'Sala', items: [
    { to: '/members', icon: Users, label: 'Clientes' },
    { to: '/schedule', icon: CalendarRange, label: 'Horarios' },
    { to: '/classes', icon: CalendarDays, label: 'Clases' },
  ]},
  { section: 'Dinero', items: [
    { to: '/finances', icon: TrendingUp, label: 'Caja' },
    { to: '/finances?tab=personal', icon: Users, label: 'Nómina' },
    { to: '/inventory', icon: Package, label: 'Inventario' },
    { to: '/crm', icon: Kanban, label: 'CRM' },
  ]},
];

const clientNav = [
  { section: 'Cliente', items: [
    { to: '/', icon: LayoutDashboard, label: 'Inicio' },
    { to: '/entreno', icon: Dumbbell, label: 'Entrenamiento' },
    { to: '/client/nutrition', icon: Apple, label: 'Nutrición' },
    { to: '/client/progress', icon: TrendingUp, label: 'Progreso' },
    { to: '/sala', icon: QrCode, label: 'Sala' },
    { to: '/client/training', icon: Dumbbell, label: 'Zonas' },
    { to: '/reports', icon: BarChart3, label: 'Mis reportes' },
  ]},
];

export const roleNavMap: Record<string, any> = { 
  admin: adminNav, 
  trainer: trainerNav, 
  receptionist: receptionNav, 
  client: clientNav,
  athlete: clientNav 
};

const roleColors: Record<string, string> = {
  admin: '#00FF88',
  trainer: '#8A9C96',
  receptionist: '#C5D1CC',
  client: '#00FF88',
  athlete: '#00FF88',
};

const roleLabels: Record<string, string> = {
  admin: 'Super Admin',
  trainer: 'Entrenador',
  receptionist: 'Recepcionista',
  client: 'Cliente',
  athlete: 'Atleta',
};

function navActivo(to: string, pathname: string, search: string) {
  const [path, query] = to.split('?');
  if (pathname !== path) return false;
  if (query) return search.includes(query);
  if (path === '/finances') return !search.includes('tab=personal');
  if (path === '/settings') return !search.includes('tab=pricing');
  return true;
}

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Inicio': true,
    'Supervisión': true,
    'Operación': true,
    'Recepción': true,
    'Sala': true,
    'Dinero': true,
    'Mi espacio': true,
    'Cliente': true
  });

  const role      = user?.role ?? 'admin';
  const navGroups = roleNavMap[role] ?? adminNav;
  const roleColor = roleColors[role] ?? '#00FF88';

  useEffect(() => {
    const activeSection = navGroups.find((g: any) =>
      g.items.some((item: any) => location.pathname === item.to)
    )?.section;
    if (activeSection) {
      setOpenSections((prev) => ({ ...prev, [activeSection]: true }));
    }
  }, [location.pathname]);

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
        {navGroups.map((group: any) => {
          const isOpen = openSections[group.section] !== false;

          return (
            <div key={group.section} style={{ marginBottom: '16px', padding: '0 8px' }}>
              <div 
                onClick={() => setOpenSections(prev => ({...prev, [group.section]: !prev[group.section]}))}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px', marginBottom: '4px', cursor: 'pointer', borderRadius: 8,
                  background: isOpen ? 'transparent' : 'rgba(255,255,255,0.02)'
                }}
              >
                <span className="sidebar-section-label" style={{ margin: 0, padding: 0 }}>{group.section}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </motion.div>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      marginTop: '4px'
                    }}>
                      {group.items.map((item: any) => (
                        <NavLink
                          key={`${group.section}__${item.to}`}
                          to={item.to}
                          className={`sidebar-item ${navActivo(item.to, location.pathname, location.search) ? 'active' : ''}`}
                          style={{ borderRadius: '8px' }}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                          {'badge' in item && item.badge && (
                            <span className="sidebar-badge">{item.badge}</span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
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
            style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', padding: 4, marginLeft: 'auto', borderRadius: 'var(--radius-sm)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
