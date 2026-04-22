import { useState, useEffect } from 'react';
import {
  ScanFace, Dumbbell, Trophy, Apple, User, Play, Pause,
  Check, ChevronRight, Zap, Flame, Target, Star,
  TrendingUp, Clock, Shield, Award, Activity, Heart,
  ZapOff, Lock, CreditCard
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';

/* ══════════════════════════════════════════
   TIPOS Y CORE ARCHITECTURE
   Client Performance HUD V.2.6
══════════════════════════════════════════ */
type Tab       = 'scan' | 'workout' | 'leaderboard' | 'nutrition' | 'wallet' | 'profile';
type ScanPhase = 'scanning' | 'found' | 'verified';

const EXERCISES = [
  { id: 1, name: 'SQUATS_FRONT_LOADED', sets: 4, reps: 10, rest: '90s', intensity: 85, kcal: 95,  icon: '🏋️' },
  { id: 2, name: 'BENCH_PRESS_ISOLATION', sets: 3, reps: 12, rest: '60s', intensity: 78, kcal: 72,  icon: '💪' },
  { id: 3, name: 'CORE_PLANK_STABILIZER', sets: 3, reps: 15, rest: '60s', intensity: 65, kcal: 68,  icon: '🤸' },
  { id: 4, name: 'PLIC_PLYOMETRIC_JUMP', sets: 4, reps: 8,  rest: '90s', intensity: 92, kcal: 110, icon: '⚡' },
];

const LEADERBOARD = [
  { rank: 1, name: 'ALEX_WARRIOR', time: '32:45', pts: 4800, medal: 'gold',   change: '+2' },
  { rank: 2, name: 'FIT_LUCY',     time: '34:10', pts: 4650, medal: 'silver', change: '0'  },
  { rank: 12, name: 'YOU [ALEX G.]', time: '39:20', pts: 3750, medal: '',       change: '+4', isMe: true },
];

const progressData = [
  { d: 'L', kcal: 320 }, { d: 'M', kcal: 450 }, { d: 'M', kcal: 280 }, { d: 'J', kcal: 510 }, { d: 'V', kcal: 390 }
];

/* ══════════════════════════════════════════
   ESTILOS HUD GLOBALES
══════════════════════════════════════════ */
const CSS = `
  @keyframes scanLineHUD { 0%{top:0%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
  @keyframes glitchedText { 0%{opacity:1} 50%{opacity:.8} 100%{opacity:1} }
  @keyframes pulseHUD { 0% { scale:1; opacity:.5 } 50% { scale:1.05; opacity:1 } 100% { scale:1; opacity:.5 } }
  @keyframes spinRing { to { transform: rotate(360deg); } }
  .hud-stat:hover { border-color: var(--neon-green) !important; background: rgba(0,255,136,0.05) !important; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--green-20); border-radius: 10px; }
`;

/* ══════════════════════════════════════════
   COMPONENTES DE PANELES (TACTICAL)
══════════════════════════════════════════ */

function PanelLeaderboard() {
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

function PanelNutrition() {
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

function PanelWallet() {
  const history = [
    { id: 1, date: '15 Abr 2026', amount: 120000, method: 'Nequi', status: 'VERIFIED', ref: 'NQ-883492' },
    { id: 2, date: '15 Mar 2026', amount: 120000, method: 'Efectivo', status: 'VERIFIED', ref: 'CASH-001' },
    { id: 3, date: '15 Feb 2026', amount: 120000, method: 'Transferencia', status: 'VERIFIED', ref: 'TR-112233' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: '100%' }}>
       <div className="glass-card" style={{ padding: 24, border: '1px solid var(--neon-green)20' }}>
          <h3 style={{ fontSize: 14, fontWeight: 950, color: '#fff', marginBottom: 20 }}>BÓVEDA_DE_PAGOS</h3>
          <div style={{ padding: 24, borderRadius: 20, background: 'linear-gradient(135deg, #FF00FF20 0%, transparent 100%)', border: '1px solid #FF00FF40', textAlign: 'center', marginBottom: 24 }}>
             <div style={{ fontSize: 10, fontWeight: 900, color: '#FF00FF', letterSpacing: 2, marginBottom: 8 }}>PRÓXIMO_COBRO</div>
             <div style={{ fontSize: 32, fontWeight: 950, color: '#fff' }}>15_MAY_2026</div>
             <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginTop: 4 }}>VALOR: $120.000</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>ENVIAR_NUEVO_COMPROBANTE</div>
             <button style={{ 
               width: '100%', padding: 16, borderRadius: 14, 
               background: 'rgba(255, 0, 255, 0.1)', border: '1px solid #FF00FF40', 
               color: '#FF00FF', fontSize: 11, fontWeight: 950, cursor: 'pointer',
               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
             }}>
                <Zap size={16} /> SUBIR VOUCHER NEQUI / PSE
             </button>
          </div>
       </div>

       <div className="glass-card" style={{ padding: 24, overflowY: 'auto' }}>
          <h3 style={{ fontSize: 13, fontWeight: 950, color: '#fff', marginBottom: 20 }}>HISTORIAL_AUDITADO</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
             {history.map(item => (
               <div key={item.id} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.04)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                     <div style={{ fontSize: 11, fontWeight: 950, color: '#fff' }}>${item.amount.toLocaleString()}</div>
                     <div style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 800 }}>{item.date} • {item.method}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--neon-green)' }}>{item.status}</div>
                     <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>{item.ref}</div>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}

function PanelProfile() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, height: '100%' }}>
       <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid var(--neon-green)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,136,0.05)' }}>
             <User size={50} style={{ color: 'var(--neon-green)' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 950 }}>ALEX_GUERRERO</h2>
          <p style={{ fontSize: 10, color: 'var(--neon-green)', fontWeight: 800 }}>ATHLETE_STATUS: ELITE_LEVEL</p>
       </div>
       <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 950, color: '#fff', marginBottom: 20 }}>ACHIEVEMENT_VAULT</h3>
          <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
             {[ { t: 'HYROX_FINISHER', d: 'Mar 2026', i: '🏆' }, { t: 'STREAK_30D', d: 'Feb 2026', i: '🔥' } ].map((a, i) => (
               <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 16, display:'flex', alignItems:'center', gap: 14 }}>
                  <div style={{ fontSize: 24 }}>{a.i}</div>
                  <div>
                     <div style={{ fontSize: 11, fontWeight: 950 }}>{a.t}</div>
                     <div style={{ fontSize: 9, color:'var(--neon-green)', fontWeight:900 }}>{a.d}</div>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN UI ASSEMBLY
══════════════════════════════════════════ */
export default function ClientAppView() {
  const [tab,    setTab]    = useState<Tab>('scan');
  const [phase,  setPhase]  = useState<ScanPhase>('scanning');
  const [active, setActive] = useState(false);
  const [sec,    setSec]    = useState(0);
  const [done,   setDone]   = useState<Set<number>>(new Set());

  useEffect(() => {
    if (tab !== 'scan') { setPhase('scanning'); return; }
    const t1 = setTimeout(() => setPhase('found'), 2200);
    const t2 = setTimeout(() => setPhase('verified'), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [tab]);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setSec(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20, color: '#fff', padding: '10px 0' }}>
      <style>{CSS}</style>

      {/* ── HEADER HUD ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Activity size={18} style={{ color: 'var(--neon-green)' }} />
              <h1 style={{ fontSize: 22, fontWeight: 950, letterSpacing: -1 }}>PERFORMANCE_HUD <span style={{ color: 'var(--neon-green)', fontSize: 13, fontWeight: 300 }}>V.2.6</span></h1>
           </div>
           <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 1.5 }}>USER_PROFILE: ALEX_G_728 [ELITE_ATHLETE]</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
           {[
             { l: 'SESSION_TIME', v: active ? fmt(sec) : '--:--', c: active ? 'var(--neon-green)' : 'var(--text-muted)', blink: active },
             { l: 'HEART_RATE', v: active ? '142' : '--', c: '#ff4d4d', icon: <Heart size={10} /> },
             { l: 'FUEL_LEVEL', v: '78%', c: '#FFD600' }
           ].map(stat => (
             <div key={stat.l} className="hud-stat" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, textAlign: 'right' }}>
                <div style={{ fontSize: 8, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 2 }}>{stat.l}</div>
                <div style={{ fontSize: 16, fontWeight: 950, color: stat.c, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                   {stat.blink && <div style={{ width:6, height:6, borderRadius: '50%', background: stat.c, animation: 'pulseHUD 1s infinite' }} />}
                   {stat.v} {stat.icon}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* ── TABS HUD ── */}
      <div style={{ display: 'flex', gap: 5, padding: 4, background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)' }}>
         {[
           { id: 'scan', l: 'GENESIS_ID', i: <ScanFace /> },
           { id: 'workout', l: 'TACTICAL_PLAN', i: <Dumbbell /> },
           { id: 'leaderboard', l: 'ZONE_RANK', i: <Trophy /> },
           { id: 'nutrition', l: 'BIO_FUEL', i: <Zap /> },
           { id: 'wallet', l: 'BILLETERA', i: <CreditCard /> },
           { id: 'profile', l: 'BIO_STATUS', i: <User /> }
         ].map(t => (
           <button 
             key={t.id} 
             onClick={() => setTab(t.id as any)}
             style={{ 
               flex: 1, padding: '12px', border: 'none', borderRadius: 10, 
               background: tab === t.id ? 'var(--green-10)' : 'transparent',
               color: tab === t.id ? 'var(--neon-green)' : 'var(--text-muted)',
               fontSize: 10, fontWeight: 950, cursor: 'pointer', transition: 'all 0.3s',
               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
             }}>
             {t.i}
             {t.l}
           </button>
         ))}
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
         
         {tab === 'scan' && (
           <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, height: '100%' }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--green-20)' }}>
                 <div style={{ position: 'relative', width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(0,255,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: -15, border: '1px solid rgba(0,255,136,0.05)', borderRadius: '50%', animation: 'spinRing 10s linear infinite' }} />
                    <div style={{ position: 'relative', width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', background: '#050a08' }}>
                       {phase === 'scanning' && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, var(--neon-green) 50%, transparent)', height: 2, top: 0, animation: 'scanLineHUD 2.5s infinite linear', boxShadow: '0 0 15px var(--neon-green)', zIndex: 10 }} />}
                       <User size={120} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.1 }} />
                       {phase === 'verified' && (
                         <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,255,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={80} style={{ color: 'var(--neon-green)' }} />
                         </div>
                       )}
                    </div>
                    <div style={{ position: 'absolute', top:-10, width: '100%', textAlign: 'center', fontSize: 9, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: 2 }}>GENESIS_FACE_ID_SYNC</div>
                 </div>
                 <div style={{ marginTop: 20, textAlign:'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 950 }}>{phase === 'verified' ? 'ACCESS_GRANTED' : 'ACQUIRING_DATA...'}</div>
                 </div>
              </div>
              <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                 <h3 style={{ fontSize: 12, fontWeight: 950, color: '#fff', marginBottom: 20 }}>ATHLETE_TELEMETRY</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[ { l: 'SESSIONS', v: '47', i: <Activity size={12}/> }, { l: 'STREAK', v: '12d', i: <Flame size={12}/> } ].map(s => (
                      <div key={s.l} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                         <div style={{ fontSize: 20, fontWeight: 950 }}>{s.v}</div>
                         <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>{s.l}</div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
         )}

         {tab === 'workout' && (
           <div style={{ height: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20 }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 24 }}>
                 <h3 style={{ fontSize: 16, fontWeight: 950, color: '#fff', marginBottom: 20 }}>TACTICAL_PLAN: FULL_BODY_S</h3>
                 <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {EXERCISES.map(ex => (
                      <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                         <div style={{ flex: 1 }}>{ex.name}</div>
                         <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--neon-green)' }}>{ex.intensity}% LOAD</div>
                      </div>
                    ))}
                 </div>
                 <button onClick={() => setActive(!active)} style={{ marginTop: 20, width: '100%', padding: '16px', borderRadius: 14, background: active ? '#ff4d4d' : 'var(--neon-green)', color: '#000', fontWeight: 950 }}>
                    {active ? 'PAUSE_EXECUTION' : 'INITIALIZE_WORKOUT'}
                 </button>
              </div>
              <div className="glass-card" style={{ padding: 20 }}>
                 <div style={{ fontSize: 11, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 16 }}>PROGRESS_METRICS</div>
                 <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={progressData}>
                       <Bar dataKey="kcal" fill="var(--neon-green)" radius={[4,4,0,0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
         )}

         {tab === 'leaderboard' && <PanelLeaderboard />}
         {tab === 'nutrition' && <PanelNutrition />}
         {tab === 'wallet' && <PanelWallet />}
         {tab === 'profile' && <PanelProfile />}

      </div>
    </div>
  );
}
