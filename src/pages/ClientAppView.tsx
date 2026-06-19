import { useState, useEffect, useMemo } from 'react';
import {
  ScanFace, Dumbbell, Trophy, Apple, User, Play, Pause,
  Check, ChevronRight, Zap, Flame, Target, Star,
  TrendingUp, Clock, Shield, Award, Activity, Heart,
  ZapOff, Lock, CreditCard, ChevronLeft, Calendar,
  ShoppingBag, Filter, Info, ShoppingCart
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useGymData } from '../hooks/useGymData';
import { useAuth } from '../contexts/AuthContext';
import { PanelLeaderboard } from '../components/ClientHUD/PanelLeaderboard';
import { PanelNutrition } from '../components/ClientHUD/PanelNutrition';
import { PanelWallet } from '../components/ClientHUD/PanelWallet';
import { PanelProfile } from '../components/ClientHUD/PanelProfile';
import { PanelStore } from '../components/ClientHUD/PanelStore';


/* ══════════════════════════════════════════
   TIPOS Y CORE ARCHITECTURE
   Client Performance HUD V.2.6
══════════════════════════════════════════ */
type Tab       = 'scan' | 'workout' | 'leaderboard' | 'nutrition' | 'store' | 'wallet' | 'profile';
type ScanPhase = 'scanning' | 'found' | 'verified' | 'error_distance' | 'error_gps';

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
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  .elite-tab-active { background: var(--neon-green) !important; color: #000 !important; box-shadow: 0 0 20px rgba(0,255,136,0.4); }
  .premium-card-hover:hover { transform: translateY(-5px); border-color: var(--neon-green) !important; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

/* ══════════════════════════════════════════
   COMPONENTES DE PANELES (TACTICAL)
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   MAIN UI ASSEMBLY
══════════════════════════════════════════ */
export default function ClientAppView() {
  const [tab, setTab] = useState<Tab>('workout');
  const [phase, setPhase] = useState<ScanPhase>('scanning');
  const [active, setActive] = useState(false);
  const [sec, setSec] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const { members, injectTransaction, updateMemberStatus } = useGymData();
  const { user } = useAuth();

  const athlete = useMemo(() => {
    return members.find(m => m.id === user?.id) || {
      name: user?.name || 'Invitado',
      status: 'active',
      debt: 0,
      expiryDate: '2024-12-31'
    };
  }, [members, user]);

  useEffect(() => {
    if (tab !== 'scan') { setPhase('scanning'); return; }

    if (!('geolocation' in navigator)) {
      setPhase('error_gps');
      return;
    }

    setPhase('scanning');
    
    // Simular 1 segundo de escaneo UI antes de leer el GPS para dar sensación premium
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Importamos el motor matemático
          const { getDistanceBetweenCoordinates, GYM_LOCATION, MAX_DISTANCE_IN_KILOMETERS } = await import('../utils/geolocation');
          
          const distance = getDistanceBetweenCoordinates(
            { latitude, longitude },
            GYM_LOCATION
          );

          if (distance <= MAX_DISTANCE_IN_KILOMETERS) {
            setPhase('verified');
          } else {
            setPhase('error_distance');
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          setPhase('error_gps');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }, 1000);
    
  }, [tab]);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setSec(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24, color: '#fff', padding: '10px 0' }}>
      <style>{CSS}</style>

      {/* ── HEADER ELITE ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: 32, fontWeight: 950, letterSpacing: -1, marginBottom: 4 }}>
              Hola, <span style={{ color: 'var(--neon-green)' }}>{athlete.name.split(' ')[0]}</span>
           </h1>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 1 }}>{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</span>
           </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
           <div className="glass-card" style={{ padding: '12px 20px', borderRadius: 20, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 2 }}>ESTADO_MEMBRESÍA</div>
              <div style={{ fontSize: 13, fontWeight: 950, color: 'var(--neon-green)' }}>{athlete.status === 'active' ? '● ACTIVA' : '○ VENCIDA'}</div>
           </div>
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
         {[
           { label: 'PASOS', value: '8.420', icon: <Activity />, color: '#00E5FF' },
           { label: 'CALORÍAS', value: '420 kcal', icon: <Flame />, color: '#FF6B35' },
           { label: 'SUEÑO', value: '7h 20m', icon: <Heart />, color: '#A78BFA' },
           { label: 'TIEMPO GYM', value: active ? fmt(sec) : '--:--', icon: <Clock />, color: 'var(--neon-green)', active: active }
         ].map(s => (
           <div key={s.label} className="glass-card premium-card-hover" style={{ padding: 20, borderRadius: 24, transition: '0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                 <div style={{ color: s.color }}>{s.icon}</div>
                 {s.active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, animation: 'pulseHUD 1s infinite' }} />}
              </div>
              <div style={{ fontSize: 18, fontWeight: 950 }}>{s.value}</div>
              <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
           </div>
         ))}
      </div>

      {/* ── TABS NAVEGACIÓN ── */}
      <div style={{ display: 'flex', gap: 8, padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
         {[
           { id: 'workout', l: 'Entrenamiento', i: <Dumbbell size={18} /> },
           { id: 'scan', l: 'Acceso Gym', i: <ScanFace size={18} /> },
           { id: 'leaderboard', l: 'Ranking', i: <Trophy size={18} /> },
           { id: 'nutrition', l: 'Nutrición', i: <Apple size={18} /> },
           { 
             id: 'store', 
             l: 'Tienda', 
             i: (
               <div style={{ position: 'relative' }}>
                 <ShoppingBag size={18} />
                 {cartCount > 0 && (
                   <div style={{ 
                     position: 'absolute', top: -5, right: -10, 
                     background: 'var(--danger-red)', color: '#fff', 
                     fontSize: 8, padding: '2px 5px', borderRadius: '50%',
                     animation: 'pulse 1s infinite'
                   }}>
                     {cartCount}
                   </div>
                 )}
               </div>
             ) 
           },
           { id: 'wallet', l: 'Pagos', i: <CreditCard size={18} /> },
           { id: 'profile', l: 'Perfil', i: <User size={18} /> }
         ].map(t => (
           <button 
             key={t.id} 
             onClick={() => setTab(t.id as any)}
             className={tab === t.id ? 'elite-tab-active' : ''}
             style={{ 
               flex: 1, padding: '16px 8px', border: 'none', borderRadius: 18, 
               background: 'transparent',
               color: 'var(--text-muted)',
               fontSize: 10, fontWeight: 950, cursor: 'pointer', transition: '0.4s',
               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
             }}>
             {t.i}
             {t.l}
           </button>
         ))}
      </div>

      {/* ── ÁREA DE CONTENIDO ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
         
         {tab === 'scan' && (
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', animation: 'slideIn 0.5s ease-out' }}>
              <div className="glass-card" style={{ padding: 60, borderRadius: 40, border: '1px solid var(--neon-green)', textAlign: 'center', maxWidth: 400, width: '100%' }}>
                 <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 30px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(0,255,136,0.1)' }}>
                    <User size={100} style={{ opacity: 0.2 }} />
                    {phase === 'verified' && <Check size={80} style={{ color: 'var(--neon-green)' }} />}
                    {phase === 'scanning' && <ScanFace size={80} style={{ color: 'var(--neon-green)', animation: 'pulse 1.5s infinite' }} />}
                    {(phase === 'error_distance' || phase === 'error_gps') && <Lock size={80} style={{ color: 'var(--danger-red)' }} />}
                 </div>
                 <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 8, color: phase.includes('error') ? 'var(--danger-red)' : '#fff' }}>
                    {phase === 'verified' ? '¡ACCESO CONCEDIDO!' : 
                     phase === 'error_distance' ? 'ZONA RESTRINGIDA' :
                     phase === 'error_gps' ? 'GPS DESACTIVADO' : 'LEYENDO GPS...'}
                 </h2>
                 <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    {phase === 'verified' ? 'Bienvenido a Fuxion Fit. Registramos tu asistencia.' : 
                     phase === 'error_distance' ? 'Estás a más de 100m del gimnasio. Acércate para registrar tu entrada.' :
                     phase === 'error_gps' ? 'Debes otorgar permisos de ubicación para registrar asistencia.' : 'Buscando satélites y calculando distancia...'}
                 </p>
              </div>
           </div>
         )}

         {tab === 'workout' && (
           <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, animation: 'slideIn 0.5s ease-out' }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 32, borderRadius: 32 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                       <h3 style={{ fontSize: 20, fontWeight: 950, color: '#fff' }}>Rutina de Hoy</h3>
                       <p style={{ fontSize: 13, color: 'var(--neon-green)', fontWeight: 800 }}>DÍA 4: TREN SUPERIOR (FUERZA)</p>
                    </div>
                    <button onClick={() => setActive(!active)} style={{ padding: '14px 28px', borderRadius: 18, background: active ? 'var(--danger-red)' : 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 950, cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                       {active ? 'PAUSAR' : 'INICIAR ENTRENAMIENTO'}
                    </button>
                 </div>
                 
                 <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {EXERCISES.map((ex, i) => (
                      <div key={ex.id} className="premium-card-hover" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.04)', transition: '0.3s' }}>
                         <div style={{ fontSize: 32, width: 60, height: 60, background: 'rgba(255,255,255,0.03)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ex.icon}</div>
                         <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 16, fontWeight: 950 }}>{ex.name.replace(/_/g, ' ')}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{ex.sets} SERIES x {ex.reps} REPS • {ex.rest} DESC.</div>
                         </div>
                         <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 950, color: 'var(--neon-green)' }}>{ex.intensity}%</div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800 }}>INTENSIDAD</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                 <div className="glass-card" style={{ padding: 24, borderRadius: 28 }}>
                    <div style={{ fontSize: 12, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 20 }}>GASTO CALÓRICO (SEMANA)</div>
                    <ResponsiveContainer width="100%" height={160}>
                       <AreaChart data={progressData}>
                          <defs>
                             <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--neon-green)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--neon-green)" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="kcal" stroke="var(--neon-green)" fillOpacity={1} fill="url(#colorKcal)" strokeWidth={3} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="glass-card" style={{ padding: 24, borderRadius: 28, background: 'rgba(255,214,0,0.05)', border: '1px solid rgba(255,214,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                       <Award size={18} style={{ color: '#FFD600' }} />
                       <span style={{ fontSize: 13, fontWeight: 950, color: '#FFD600' }}>RECOMENDACIÓN IA</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>"Hoy estás rindiendo un <strong style={{ color: '#fff' }}>12% más</strong> de lo habitual. Te sugiero subir 2kg en tu última serie de Squats."</p>
                 </div>
              </div>
           </div>
         )}

         {tab === 'leaderboard' && <PanelLeaderboard />}
         {tab === 'nutrition' && <PanelNutrition />}
         {tab === 'store' && <PanelStore onCartChange={setCartCount} injectTransaction={injectTransaction} updateMemberStatus={updateMemberStatus} athlete={athlete} />}
         {tab === 'wallet' && <PanelWallet user={athlete} />}
         {tab === 'profile' && <PanelProfile user={athlete} />}

      </div>
    </div>
  );
}
