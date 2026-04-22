import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Search, Moon, Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import versionData from '../../../version.json';
import { useAutoUpdate } from '../../hooks/useAutoUpdate';

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
  useAutoUpdate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const title = pageTitles[location.pathname] || 'GymFuxionFit';

  // Persistir estado
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // Cerrar menu al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className={`app-layout ${mobileMenuOpen ? 'mobile-menu-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Overlay para móvil */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="main-content">
        {/* ─── NAVBAR ─── */}
        <header className="navbar">
          <div className="navbar-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="navbar-title">{title}</h1>
            <div className="navbar-breadcrumb">
              <span style={{ color: 'var(--neon-green)', fontSize: 8, fontWeight: 950, background: 'var(--green-10)', padding: '2px 6px', borderRadius: 4, marginRight: 8, border: '1px solid var(--green-20)' }}>SISTEMA_OK</span>
              <span style={{ color: '#fff', fontSize: 8, fontWeight: 950, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, marginRight: 8, border: '1px solid rgba(255,255,255,0.1)' }}>v{versionData.version}</span>
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
