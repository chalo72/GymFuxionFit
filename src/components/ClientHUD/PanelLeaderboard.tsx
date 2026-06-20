import React from 'react';
import { Trophy, Flame, Activity } from 'lucide-react';

export function PanelLeaderboard({ members, athlete }: { members: any[], athlete: any }) {
  // Sort members by visits descending
  const sortedMembers = [...members]
    .sort((a, b) => (b.visits || 0) - (a.visits || 0))
    .slice(0, 15); // Top 15
    
  // Find athlete's real rank
  const myRank = [...members].sort((a, b) => (b.visits || 0) - (a.visits || 0)).findIndex(m => m.id === athlete.id) + 1;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, height: '100%', animation: 'slideIn 0.5s ease-out' }}>
      <div className="glass-card" style={{ padding: 24, display:'flex', flexDirection:'column', border:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
           <div>
              <h3 style={{ fontSize: 18, fontWeight: 950, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><Trophy color="#FFD700" /> CLASIFICACIÓN GLOBAL</h3>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing:1 }}>ZONA: FUXION ELITE | TOTAL ATLETAS: {members.length}</p>
           </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, paddingRight: 10 }} className="hide-scrollbar">
           {sortedMembers.map((m, idx) => {
             const isMe = m.id === athlete.id;
             const rank = idx + 1;
             return (
               <div key={m.id} style={{ 
                 display: 'grid', gridTemplateColumns: '40px 1fr 100px 60px', padding: 16, 
                 background: isMe ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.02)', 
                 borderRadius: 14, border: isMe ? '1px solid #00F0FF' : '1px solid transparent',
                 alignItems: 'center'
               }}>
                  <div style={{ fontSize: 16, fontWeight: 950, color: isMe ? '#00F0FF' : rank <= 3 ? '#FFD700' : 'var(--text-muted)' }}>#{rank}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{m.name.split(' ')[0]} {isMe ? '(TÚ)' : ''}</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Activity size={14} /> {m.visits || 0} pts
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#ff9900', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={14} /> {m.streak || 0}
                  </div>
               </div>
             );
           })}
        </div>
      </div>
      
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
         <div className="glass-card" style={{ padding: 24, border:'1px solid #00F0FF', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 950, color:'#00F0FF', marginBottom:8 }}>TU RANGO ACTUAL</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', textShadow: '0 0 20px rgba(0,240,255,0.5)' }}>#{myRank || '-'}</div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>De {members.length} atletas inscritos</p>
         </div>

         <div className="glass-card" style={{ padding: 20, border:'1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 950, color:'var(--neon-green)', marginBottom:16 }}>RÉCORDS PERSONALES (PR)</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
               {[ { l: '1KM RUN', v: '03:42' }, { l: 'BURPEES (30)', v: '1:12' }, { l: 'SLED PUSH', v: '24s' } ].map(b => (
                 <div key={b.l} style={{ display:'flex', justifyContent:'space-between', padding: 12, background:'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                    <span style={{ fontSize:10, fontWeight:800, color:'var(--text-muted)' }}>{b.l}</span>
                    <span style={{ fontSize:12, fontWeight:950, color:'#fff' }}>{b.v}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
