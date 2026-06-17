import React from 'react';

const LEADERBOARD = [
  { rank: 1, name: 'ALEX_WARRIOR', time: '32:45', pts: 4800, medal: 'gold',   change: '+2' },
  { rank: 2, name: 'FIT_LUCY',     time: '34:10', pts: 4650, medal: 'silver', change: '0'  },
  { rank: 12, name: 'YOU [ALEX G.]', time: '39:20', pts: 3750, medal: '',       change: '+4', isMe: true },
];

export function PanelLeaderboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, height: '100%' }}>
      <div className="glass-card" style={{ padding: 24, display:'flex', flexDirection:'column', border:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
           <div>
              <h3 style={{ fontSize: 14, fontWeight: 950, color: '#fff' }}>GLOBAL_LEADERBOARD_S2</h3>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, letterSpacing:1 }}>ZONE: ELITE_DIVISION | TOTAL_ATHLETES: 1,280</p>
           </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
           {LEADERBOARD.map(row => {
             const isMe = (row as any).isMe;
             return (
               <div key={row.rank} style={{ 
                 display: 'grid', gridTemplateColumns: '40px 1fr 100px 60px', padding: 16, 
                 background: isMe ? 'var(--green-10)' : 'rgba(255,255,255,0.02)', 
                 borderRadius: 14, border: isMe ? '1px solid var(--green-20)' : '1px solid transparent'
               }}>
                  <div style={{ fontSize: 13, fontWeight: 950, color: isMe ? 'var(--neon-green)' : 'var(--text-muted)' }}>#{row.rank}</div>
                  <div style={{ fontSize: 13, fontWeight: 950, color: '#fff' }}>{row.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 950, color: 'var(--neon-green)', fontFamily:'monospace' }}>{row.time}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: row.change.startsWith('+') ? 'var(--neon-green)' : '#ff4d4d', textAlign:'right' }}>{row.change}</div>
               </div>
             );
           })}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
         <div className="glass-card" style={{ padding: 20, border:'1px solid var(--neon-green)' }}>
            <div style={{ fontSize: 9, fontWeight: 950, color:'var(--neon-green)', marginBottom:12 }}>PERSONAL_Bests</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
               {[ { l: '1KM_RUN', v: '03:42' }, { l: 'BURPEES_30', v: '1:12' }, { l: 'SLED_PUSH', v: '24s' } ].map(b => (
                 <div key={b.l} style={{ display:'flex', justifyContent:'space-between', padding:8, background:'rgba(255,255,255,0.03)', borderRadius:8 }}>
                    <span style={{ fontSize:8, fontWeight:800, color:'var(--text-muted)' }}>{b.l}</span>
                    <span style={{ fontSize:10, fontWeight:950, color:'#fff' }}>{b.v}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
