import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Search, Menu, X, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import versionData from '../../../version.json';
import { useAuth } from '../../contexts/AuthContext';
import { useGymData } from '../../hooks/useGymData';

interface NavbarProps {
  title: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isCollapsed: boolean;
  handleToggleCollapse: () => void;
}

export default function Navbar({
  title, mobileMenuOpen, setMobileMenuOpen, isCollapsed, handleToggleCollapse,
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { members, products } = useGymData();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const initials = (user?.name || 'U').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  const alerts = useMemo(() => {
    const list: { title: string; detail: string }[] = [];
    const low = products.filter((p) => p.stock <= (p.minStock || 0));
    if (low.length) list.push({ title: 'Stock bajo', detail: `${low.length} producto(s)` });
    const debt = members.filter((m) => (m.debt || 0) > 0);
    if (debt.length) list.push({ title: 'Saldos pendientes', detail: `${debt.length} miembro(s)` });
    return list;
  }, [members, products]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="navbar-title">{title}</h1>
        <div className="navbar-breadcrumb">
          <span style={{ color: '#fff', fontSize: 8, fontWeight: 950, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, marginRight: 8 }}>
            v{versionData.version}
          </span>
          <button onClick={handleToggleCollapse} style={{ background: 'var(--green-10)', border: '1px solid var(--green-20)', color: 'var(--neon-green)', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 950, cursor: 'pointer' }}>
            {isCollapsed ? 'Ampliar menú' : 'Compactar menú'}
          </button>
        </div>
      </div>
      <div className="navbar-right">
        <button
          className="search-input"
          onClick={() => window.dispatchEvent(new Event('OPEN_COMMAND_PALETTE'))}
          style={{ width: 220, height: 40, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'transparent', border: 'none', color: 'inherit' }}
        >
          <Search size={18} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Buscar (Ctrl+K)</span>
        </button>
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="navbar-icon-btn">
            <Bell size={20} />
            {alerts.length > 0 && <span className="badge-dot" />}
          </button>
          {showNotifications && (
            <div className="glass-card" style={{ position: 'absolute', top: 50, right: 0, width: 300, padding: 16, zIndex: 100 }}>
              <h4 style={{ fontWeight: 950, fontSize: 14, marginBottom: 12 }}>Alertas</h4>
              {alerts.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin alertas.</p>
              ) : alerts.map((a) => (
                <div key={a.title} style={{ padding: 10, marginBottom: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700 }}>{a.title}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div ref={profileRef} style={{ position: 'relative' }}>
          <div className="sidebar-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ width: 36, height: 36, fontSize: '0.75rem', cursor: 'pointer' }}>
            {initials}
          </div>
          {showProfileMenu && (
            <div className="glass-card" style={{ position: 'absolute', top: 50, right: 0, width: 220, padding: 8, zIndex: 100 }}>
              <div style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}>
                <Settings size={16} /> Ajustes
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger-red)' }} onClick={() => { logout(); navigate('/login'); }}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
