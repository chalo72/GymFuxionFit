import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CommandPalette from './CommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoUpdate } from '../../hooks/useAutoUpdate';

const pageTitles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/members':      'Miembros',
  '/classes':      'Clases del Día',
  '/schedule':     'Calendario',
  '/analytics':    'Analíticas',
  '/accounting':   'Contabilidad',
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
    // Solo respetar la preferencia guardada si la pantalla es ancha (≥1200px)
    // En pantallas más pequeñas o sin preferencia → siempre expandido
    const saved = localStorage.getItem('sidebar-collapsed');
    const isWideScreen = window.innerWidth >= 1200;
    if (saved === 'true' && isWideScreen) return true;
    return false; // Por defecto: siempre expandido
  });
  const title = pageTitles[location.pathname] || 'GymFuxionFit';

  // Estado persistido manualmente en handleToggleCollapse

  // Cerrar menu al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleToggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    if (!newVal) {
      // Al expandir → limpiar preferencia guardada para que siempre arranque expandido
      localStorage.removeItem('sidebar-collapsed');
    } else {
      localStorage.setItem('sidebar-collapsed', 'true');
    }
  };

  return (
    <div className={`app-layout ${mobileMenuOpen ? 'mobile-menu-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Overlay para móvil */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="main-content">
        <Navbar 
          title={title}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          isCollapsed={isCollapsed}
          handleToggleCollapse={handleToggleCollapse}
        />


        {/* ─── PAGE CONTENT ─── */}
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      <CommandPalette />
    </div>
  );
}
