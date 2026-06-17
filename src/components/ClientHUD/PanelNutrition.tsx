import React from 'react';

export function PanelNutrition() {
  const macros = [
    { name: 'PROTEIN_CORE', val: 142, goal: 180, color: '#FF6B35', pct: 79 },
    { name: 'CARB_RESOURCE', val: 210, goal: 280, color: '#00FF88', pct: 75 },
    { name: 'FAT_SUPPORT', val: 48,  goal: 65,  color: '#FFD700', pct: 74 },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: '100%' }}>
       <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 950, color: '#fff', marginBottom: 24 }}>RESOURCE_CONSUMPTION</h3>
          <div style={{ padding: 30, borderRadius: 20, background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)', textAlign: 'center', marginBottom: 20 }}>
             <div style={{ fontSize: 48, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: -2 }}>1,640</div>
             <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>KCAL_INGESTED / 2,200_TARGET</div>
             <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 10, marginTop: 16 }}>
                <div style={{ height: '100%', width: '74%', background: 'var(--neon-green)', borderRadius: 10, boxShadow: '0 0 10px var(--neon-green)' }} />
             </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
             {macros.map(m => (
               <div key={m.name}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, fontWeight:900, color:'var(--text-muted)', marginBottom:6 }}>
                     <span>{m.name}</span>
                     <span>{m.val}G / {m.goal}G</span>
                  </div>
                  <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                     <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 10 }} />
                  </div>
               </div>
             ))}
          </div>
       </div>
       <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 950, color: '#fff', marginBottom: 20 }}>NUTRI_LOG_VERIFIED</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
             {[ { t: 'BREAKFAST', i: 'Oats + Eggs', k: '480', s: 'COMPLETE' }, { t: 'PRE_WORKOUT', i: 'Whey + Banana', k: '310', s: 'COMPLETE' }, { t: 'LUNCH', i: 'Chicken + Rice', k: '620', s: 'COMPLETE' } ].map((l, i) => (
               <div key={i} style={{ padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', display:'flex', justifyContent:'space-between' }}>
                  <div>
                     <div style={{ fontSize: 11, fontWeight: 950, color:'#fff' }}>{l.t}</div>
                     <div style={{ fontSize: 9, color:'var(--text-muted)', fontWeight:800 }}>{l.i}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                     <div style={{ fontSize: 11, fontWeight: 950, color: 'var(--neon-green)' }}>{l.k} KCAL</div>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}
