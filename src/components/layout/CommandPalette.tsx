import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roleNavMap } from './Sidebar';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten the navigation for the current user role
  const role = user?.role ?? 'admin';
  const navGroups = roleNavMap[role] ?? roleNavMap['admin'];
  
  const allCommands = navGroups.flatMap((group: any) => 
    group.items.map((item: any) => ({
      ...item,
      section: group.section
    }))
  );

  const filteredCommands = query 
    ? allCommands.filter((cmd: any) => 
        cmd.label.toLowerCase().includes(query.toLowerCase()) || 
        cmd.section.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  // Global Key Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (to: string) => {
    navigate(to);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: 'fixed',
              top: '15vh',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: 600,
              background: 'rgba(20, 20, 25, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 136, 0.1)',
              overflow: 'hidden',
              zIndex: 10000
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <Search size={20} color="var(--text-muted)" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿A dónde quieres ir?..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 600,
                  width: '100%',
                  outline: 'none',
                  marginLeft: 16
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255, 255, 255, 0.1)', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                <Command size={12} /> K
              </div>
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto', padding: 12 }} className="custom-scrollbar">
              {filteredCommands.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No se encontraron resultados
                </div>
              ) : (
                filteredCommands.map((cmd: any) => (
                  <div
                    key={cmd.to}
                    onClick={() => handleSelect(cmd.to)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderRadius: 12,
                      background: 'transparent',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: 10, borderRadius: 10, marginRight: 16 }}>
                      <cmd.icon size={18} color="var(--neon-green)" />
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 800 }}>{cmd.label}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{cmd.section}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
