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
  const role = user?.role ?? 'admin';
  const navGroups = roleNavMap[role] ?? roleNavMap['admin'];
  const allCommands = navGroups.flatMap((group: any) =>
    group.items.map((item: any) => ({ ...item, section: group.section }))
  );
  const q = (query || '').toLowerCase();
  const filteredCommands = q
    ? allCommands.filter((cmd: any) =>
        String(cmd.label || '').toLowerCase().includes(q) ||
        String(cmd.section || '').toLowerCase().includes(q)
      )
    : allCommands;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    const openPalette = () => setIsOpen(true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('OPEN_COMMAND_PALETTE', openPalette);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('OPEN_COMMAND_PALETTE', openPalette);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            style={{
              position: 'fixed', top: '15vh', left: '50%', transform: 'translateX(-50%)',
              width: '90%', maxWidth: 600, background: 'rgba(20,20,25,0.95)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, overflow: 'hidden', zIndex: 10000,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Search size={20} color="var(--text-muted)" />
              <input
                ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="¿A dónde quieres ir?"
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 18, width: '100%', outline: 'none', marginLeft: 16 }}
              />
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 8, fontSize: 12 }}>
                <Command size={12} /> K
              </div>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto', padding: 12 }}>
              {filteredCommands.map((cmd: any) => (
                <div
                  key={`${cmd.section}-${cmd.to}`}
                  onClick={() => { navigate(cmd.to); setIsOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', borderRadius: 12 }}
                >
                  {cmd.icon && <cmd.icon size={18} color="var(--neon-green)" />}
                  <div style={{ marginLeft: 12 }}>
                    <div style={{ color: '#fff', fontWeight: 800 }}>{cmd.label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{cmd.section}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
