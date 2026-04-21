import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Search, Moon } from 'lucide-react';
import Sidebar from './Sidebar';

const pageTitles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/members':      'Miembros',
  '/classes':      'Clases del Día',
  '/schedule':     'Calendario',
  '/analytics':    'Analíticas',
  '/settings':     'Configuración',
  '/genesis-scan': 'Genesis Scan',
  '/crm':          'CRM Ventas',
  '/ai-coach':     'AI Coach',
  '/nutrition':    'Nutrición',
  '/wearables':    'Wearables',
  '/leaderboard':  'Leaderboard HYROX',
  '/payments':     'Pagos',
  '/trainer':      'Dashboard Entrenador',
  '/reception':    'Recepción — Control en Vivo',
  '/operations':   'Operaciones en Vivo',
  '/client-app':   'App Cliente — Vista Móvil',
  '/finances':     'Finanzas — Ingresos y Egresos',
  '/inventory':    'Inventario — Logística de Activos',
};

export default function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'GymFuxionFit';

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        {/* ─── NAVBAR ─── */}
        <header className="navbar">
          <div className="navbar-left">
            <h1 className="navbar-title">{title}</h1>
            <div className="navbar-breadcrumb">
              <span>Gym Admin</span>
              <span>/</span>
              <span style={{ color: 'var(--neon-green)' }}>{title}</span>
            </div>
          </div>

          <div className="navbar-right">
            <div className="search-input">
              <Search size={18} />
              <input
                className="input-field"
                placeholder="Buscar..."
                style={{ width: 220, paddingLeft: 42, height: 40, fontSize: '0.8125rem' }}
              />
            </div>
            <button className="navbar-icon-btn">
              <Moon size={20} />
            </button>
            <button className="navbar-icon-btn">
              <Bell size={20} />
              <span className="badge-dot" />
            </button>
            <div
              className="sidebar-avatar"
              style={{ width: 36, height: 36, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              AD
            </div>
          </div>
        </header>

        {/* ─── PAGE CONTENT ─── */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
