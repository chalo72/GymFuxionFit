import React from 'react';
import { Clock } from 'lucide-react';

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
};

interface MembersListProps {
  activeMembers: any[];
  members: any[];
  setSelectedMember: (member: any) => void;
  setShowProfile: (show: boolean) => void;
  setCart: (cart: any[]) => void;
  setActiveMembers: React.Dispatch<React.SetStateAction<any[]>>;
}

export function MembersList({ activeMembers, members, setSelectedMember, setShowProfile, setCart, setActiveMembers }: MembersListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'hidden', height: '100%' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '20px 32px', borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 4 }}>PRESENCIA EN SALA</div>
            <div style={{ fontSize: 18, fontWeight: 950, color: '#fff' }}>ATLETAS ACTIVOS</div>
          </div>
          <div style={{ background: 'rgba(0,255,136,0.1)', padding: '12px 24px', borderRadius: 20, fontSize: 28, fontWeight: 950, color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.2)', boxShadow: 'inset 0 0 15px rgba(0,255,136,0.1)' }}>{activeMembers.length}</div>
       </div>
       <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, overflowY: 'auto', paddingRight: 10, alignContent: 'start' }} className="custom-scrollbar">
          {activeMembers.map(m => (
            <div key={m.id} onClick={() => { 
               const master = members.find(mx => String(mx.id) === String(m.id)) || {
                 id: String(m.id),
                 name: m.name,
                 plan: m.plan,
                 status: m.membershipStatus,
                 expiryDate: '2026-12-31',
                 debt: 0,
                 lastVisit: new Date().toISOString(),
                 color: m.color,
                 objective: 'Entrenamiento Pro',
                 injuries: 'Ninguna'
               }; 
               setSelectedMember(master); 
               setShowProfile(true); 
               setCart([]);
            }} className="glass-card athlete-card-premium" style={{ padding: 24, border: '1px solid rgba(255,255,255,0.08)', background: `linear-gradient(135deg, ${m.color}08, rgba(255,255,255,0.01))`, borderRadius: 24, cursor: 'pointer', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', backdropFilter: 'blur(10px)' }}>
               <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${m.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, fontWeight: 950, fontSize: 18, boxShadow: `0 0 15px ${m.color}20` }}>{m.initials}</div>
                  <div style={{ flex: 1 }}>
                     <div style={{ fontSize: 16, fontWeight: 950, color: '#fff' }}>{m.name}</div>
                     <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800 }}>{m.plan}</div>
                  </div>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, background: 'rgba(0,0,0,0.15)', padding: '10px 16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: 12, color: 'var(--neon-green)', fontWeight: 950, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14}/> {fmtTime(Math.floor((Date.now() - m.checkedInAt)/1000))}</div>
                  <button onClick={(e) => { e.stopPropagation(); setActiveMembers(px => px.filter(ax => ax.id !== m.id)); }} style={{ background: 'rgba(255,61,87,0.1)', border: 'none', color: 'var(--danger-red)', padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 950, cursor: 'pointer' }}>FINALIZAR</button>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}
