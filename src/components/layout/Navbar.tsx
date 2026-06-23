import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Moon, Menu, X, LogOut, Settings, User } from 'lucide-react';
import versionData from '../../../version.json';

interface NavbarProps {
  title: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isCollapsed: boolean;
  handleToggleCollapse: () => void;
}

export default function Navbar({
  title,
  mobileMenuOpen,
  setMobileMenuOpen,
  isCollapsed,
  handleToggleCollapse
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
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
          <button 
            onClick={handleToggleCollapse}
            style={{ background: 'var(--green-10)', border: '1px solid var(--green-20)', color: 'var(--neon-green)', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 950, cursor: 'pointer', marginRight: 10, transition: '0.2s' }}
          >
            {isCollapsed ? 'VISTA AMPLIADA »' : '« VISTA COMPACTA'}
          </button>
          <button 
            onClick={() => {
               if ('caches' in window) caches.keys().then(names => { for (let n of names) caches.delete(n); });
               window.location.reload();
            }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 950, cursor: 'pointer', marginRight: 10 }}
            title="Forzar actualización de versión"
          >
            🔄 SINCRONIZAR
          </button>
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
        <button onClick={() => alert('Modo Fuxion ya activo.')}  className="navbar-icon-btn">
          <Moon size={20} />
        </button>
        
        {/* Notificaciones */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="navbar-icon-btn">
            <Bell size={20} />
            <span className="badge-dot" />
          </button>
          {showNotifications && (
            <div className="glass-card animate-fade-in" style={{ position: 'absolute', top: 50, right: 0, width: 320, padding: 16, zIndex: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ fontWeight: 950, fontSize: 14 }}>Notificaciones</h4>
                <span style={{ fontSize: 10, color: 'var(--neon-green)', background: 'var(--green-10)', padding: '2px 6px', borderRadius: 6 }}>2 Nuevas</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: 12, color: '#fff', fontWeight: 600, marginBottom: 4 }}>Sincronización Completada</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Los datos offline han sido subidos a Supabase.</p>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,61,87,0.05)', border: '1px solid rgba(255,61,87,0.2)' }}>
                  <p style={{ fontSize: 12, color: 'var(--danger-red)', fontWeight: 600, marginBottom: 4 }}>Alerta de Stock</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Proteína Fuxion Vainilla casi agotada (2 unidades).</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Perfil */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <div
            className="sidebar-avatar"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ width: 36, height: 36, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            AD
          </div>
          {showProfileMenu && (
            <div className="glass-card animate-fade-in" style={{ position: 'absolute', top: 50, right: 0, width: 200, padding: 8, zIndex: 100 }}>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: 10, fontSize: 13 }}><User size={16} /> Mi Perfil</button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: 10, fontSize: 13 }}><Settings size={16} /> Ajustes</button>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
              <button onClick={() => window.location.reload()} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: 10, fontSize: 13, color: 'var(--danger-red)' }}><LogOut size={16} /> Cerrar Sesión</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
