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

/* ══════════════════════════════════════════
   TIPOS Y CORE ARCHITECTURE
   Client Performance HUD V.2.6
══════════════════════════════════════════ */
type Tab       = 'scan' | 'workout' | 'leaderboard' | 'nutrition' | 'store' | 'wallet' | 'profile';
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

function PanelWallet({ user }: { user: any }) {
  const history = [
    { id: 1, date: 'Hoy', amount: user?.debt || 0, method: 'Pendiente', status: 'POR_PAGAR', ref: 'DEUDA_ACTUAL' },
    { id: 2, date: '15 Abr 2026', amount: 120000, method: 'Nequi', status: 'VERIFICADO', ref: 'NQ-883492' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: '100%', animation: 'slideIn 0.5s ease-out' }}>
       <div className="glass-card" style={{ padding: 32, borderRadius: 32, background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, transparent 100%)', border: '1px solid rgba(0,255,136,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
             <div>
                <h3 style={{ fontSize: 18, fontWeight: 950, color: '#fff' }}>Billetera Digital</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Estado de tu cuenta</p>
             </div>
             <CreditCard size={24} style={{ color: 'var(--neon-green)' }} />
          </div>
          
          <div style={{ marginBottom: 40 }}>
             <div style={{ fontSize: 11, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 2 }}>DEUDA PENDIENTE</div>
             <div style={{ fontSize: 42, fontWeight: 950, color: user?.debt > 0 ? 'var(--danger-red)' : 'var(--neon-green)' }}>
                ${(user?.debt || 0).toLocaleString()}
             </div>
          </div>

          <button style={{ width: '100%', padding: 22, borderRadius: 20, background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 950, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 10px 30px rgba(0,255,136,0.3)' }}>
             <Zap size={18} /> REPORTAR PAGO NEQUI
          </button>
       </div>

       <div className="glass-card" style={{ padding: 32, borderRadius: 32, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 16, fontWeight: 950, color: '#fff', marginBottom: 20 }}>Últimos Movimientos</h3>
          <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
             {history.map(item => (
               <div key={item.id} style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 24, display:'flex', justifyContent:'space-between', alignItems:'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                     <div style={{ fontSize: 15, fontWeight: 950, color: '#fff' }}>${item.amount.toLocaleString()}</div>
                     <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{item.date} • {item.method}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: 10, fontWeight: 950, color: item.status === 'POR_PAGAR' ? 'var(--danger-red)' : 'var(--neon-green)', background: item.status === 'POR_PAGAR' ? 'rgba(255,61,87,0.1)' : 'rgba(0,255,136,0.1)', padding: '4px 10px', borderRadius: 8 }}>{item.status}</div>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}

function PanelProfile({ user }: { user: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, height: '100%', animation: 'slideIn 0.5s ease-out' }}>
       <div className="glass-card" style={{ padding: 40, textAlign: 'center', borderRadius: 32 }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '3px solid var(--neon-green)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,136,0.05)', overflow: 'hidden' }}>
             {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={60} style={{ color: 'var(--neon-green)' }} />}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>{user?.name?.toUpperCase() || 'ATLETA_FUXION'}</h2>
          <div style={{ marginTop: 12, padding: '6px 12px', background: 'rgba(0,255,136,0.1)', borderRadius: 'var(--radius-full)', display: 'inline-block', fontSize: 10, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: 2 }}>
             {user?.status?.toUpperCase() || 'ACTIVO'}
          </div>
       </div>
       <div className="glass-card" style={{ padding: 32, borderRadius: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 950, color: '#fff', marginBottom: 24 }}>Mis Logros</h3>
          <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
             {[ { t: 'CONSTANCIA PURA', d: '30 días seguidos', i: '🔥' }, { t: 'FUERZA BRUTA', d: 'Récord en Squat', i: '🏋️' }, { t: 'MADRUGADOR', d: '5AM Club', i: '☀️' }, { t: 'CLIENTE ELITE', d: 'Membresía Pro', i: '💎' } ].map((a, i) => (
               <div key={i} className="premium-card-hover" style={{ padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 24, display:'flex', alignItems:'center', gap: 16, border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
                  <div style={{ fontSize: 32 }}>{a.i}</div>
                  <div>
                     <div style={{ fontSize: 14, fontWeight: 950, color: '#fff' }}>{a.t}</div>
                     <div style={{ fontSize: 11, color: 'var(--neon-green)', fontWeight: 800 }}>{a.d}</div>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}

function PanelStore({ onCartChange, injectTransaction, updateMemberStatus, athlete }: { onCartChange: (n: number) => void, injectTransaction: any, updateMemberStatus: any, athlete: any }) {
  const [filter, setFilter] = useState<'all' | 'local' | 'supplier'>('all');
  const [cart, setCart] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const MOCK_PRODUCTS = [
    { id: 'p1', name: 'Proteína Whey Elite 5lb', price: 240000, type: 'supplier', category: 'Suplementos', img: 'https://images.unsplash.com/photo-1593095183571-2d5ff1a473ee?q=80&w=200&h=200&auto=format&fit=crop', delivery: '3-5 días' },
    { id: 'p2', name: 'Creatina Monohidratada', price: 120000, type: 'local', category: 'Suplementos', img: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=200&h=200&auto=format&fit=crop', delivery: 'Inmediata (Gym)' },
    { id: 'p3', name: 'Camiseta Over-Size Fuxion', price: 65000, type: 'supplier', category: 'Ropa', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&h=200&auto=format&fit=crop', delivery: 'Envío Gratis' },
    { id: 'p4', name: 'Bebida Energética X-Zero', price: 6000, type: 'local', category: 'Bebidas', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&h=200&auto=format&fit=crop', delivery: 'En Recepción' },
    { id: 'p5', name: 'Cinturón de Fuerza Cuero', price: 180000, type: 'supplier', category: 'Accesorios', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200&h=200&auto=format&fit=crop', delivery: '5-7 días' },
    { id: 'p6', name: 'Aminoácidos BCAA 30 serv', price: 95000, type: 'local', category: 'Suplementos', img: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=200&h=200&auto=format&fit=crop', delivery: 'Inmediata' },
  ];

  const filtered = MOCK_PRODUCTS.filter(p => filter === 'all' || p.type === filter);

  useEffect(() => {
    onCartChange(cart.length);
  }, [cart, onCartChange]);

  const addToCart = (p: any) => {
    setCart([...cart, { ...p, cartId: crypto.randomUUID() }]);
  };

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const processOrder = async () => {
    try {
      // 1. Registrar Transacción
      await injectTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString().slice(0, 5),
        description: `COMPRA_TIENDA: ${cart.length} productos`,
        category: 'membership',
        type: 'income',
        amount: total,
        method: 'DEUDA_INTERNA',
        client: athlete.name
      });

      // 2. Cargar Deuda al Socio
      await updateMemberStatus(athlete.id, {
        debt: (athlete.debt || 0) + total
      });

      setOrderSuccess(true);
      setCart([]);
      setShowCheckout(false);
      
      // Reset success state after 3s
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (error) {
      console.error("Error procesando pedido:", error);
      alert("Error al procesar el pedido. Inténtalo de nuevo.");
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', animation: 'slideIn 0.5s ease-out' }}>
        <div className="glass-card" style={{ padding: 60, borderRadius: 40, border: '2px solid var(--neon-green)', textAlign: 'center', maxWidth: 450 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,255,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
            <Check size={50} color="var(--neon-green)" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 950, color: '#fff', marginBottom: 12 }}>¡PEDIDO EXITOSO!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6 }}>Tu compra ha sido procesada. Los productos se han cargado a tu cuenta.</p>
          <div style={{ marginTop: 30, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 20 }}>
             <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 4 }}>ID_PEDIDO</div>
             <div style={{ fontSize: 14, fontWeight: 950, color: 'var(--neon-green)', fontFamily: 'monospace' }}>#{crypto.randomUUID().slice(0,8).toUpperCase()}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, height: '100%', animation: 'slideIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header & Filtros */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>Marketplace <span style={{ color: 'var(--neon-green)' }}>Elite</span></h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Productos seleccionados para tu rendimiento</p>
          </div>
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12 }}>
            {[
              { id: 'all', label: 'Todo' },
              { id: 'local', label: 'En el Gym' },
              { id: 'supplier', label: 'Catálogo' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                style={{ 
                  padding: '8px 16px', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 900, cursor: 'pointer',
                  background: filter === f.id ? 'var(--neon-green)' : 'transparent',
                  color: filter === f.id ? '#000' : 'var(--text-muted)',
                  transition: '0.3s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, paddingBottom: 20 }}>
          {filtered.map(p => (
            <div key={p.id} className="glass-card premium-card-hover" style={{ display: 'flex', flexDirection: 'column', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
              <div style={{ height: 160, position: 'relative', background: '#000' }}>
                <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: p.type === 'local' ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)', color: p.type === 'local' ? '#000' : '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 9, fontWeight: 950, backdropFilter: 'blur(10px)' }}>
                  {p.type === 'local' ? 'EXPRESS' : 'CATÁLOGO'}
                </div>
              </div>
              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--neon-green)' }}>{p.category.toUpperCase()}</div>
                <div style={{ fontSize: 14, fontWeight: 950, color: '#fff', lineHeight: 1.2 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <Clock size={12} /> {p.delivery}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 950, color: '#fff' }}>${p.price.toLocaleString()}</div>
                  <button 
                    onClick={() => addToCart(p)}
                    style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--neon-green)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,255,136,0.2)' }}
                  >
                    <ShoppingCart size={18} color="#000" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel Lateral: Carrito & Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="glass-card" style={{ padding: 24, borderRadius: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 950 }}>Tu Carrito</h3>
            <div style={{ background: 'var(--neon-green)', color: '#000', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 950 }}>{cart.length}</div>
          </div>

          <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, opacity: 0.3 }}>
                <ShoppingBag size={40} style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: 12, fontWeight: 800 }}>Carrito vacío</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={item.cartId} style={{ display: 'flex', gap: 12, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 16, alignItems: 'center' }}>
                  <img src={item.img} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 950, color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--neon-green)' }}>${item.price.toLocaleString()}</div>
                  </div>
                  <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} style={{ border: 'none', background: 'transparent', color: 'var(--danger-red)', cursor: 'pointer' }}>×</button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL</span>
                <span style={{ fontSize: 20, fontWeight: 950, color: '#fff' }}>${total.toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setShowCheckout(true)}
                style={{ width: '100%', padding: 18, borderRadius: 16, background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 950, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 10px 20px rgba(0,255,136,0.2)' }}
              >
                COMPRAR AHORA <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: 20, borderRadius: 24, background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Info size={16} style={{ color: 'var(--neon-green)' }} />
            <span style={{ fontSize: 12, fontWeight: 950 }}>INFO DE ENVÍO</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Los productos <strong style={{ color: '#fff' }}>EXPRESS</strong> se retiran hoy mismo en recepción. Los de <strong style={{ color: '#fff' }}>CATÁLOGO</strong> se envían desde bodega central.
          </p>
        </div>
      </div>

      {/* Modal Checkout Simplificado */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 450, width: '100%', padding: 40, borderRadius: 40, textAlign: 'center', border: '1px solid var(--neon-green)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,255,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={40} color="var(--neon-green)" />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 950, marginBottom: 12 }}>¿Confirmar Pedido?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>El total de <strong style={{ color: '#fff' }}>${total.toLocaleString()}</strong> se cargará a tu cuenta para pagar en recepción o mediante Nequi.</p>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowCheckout(false)} style={{ flex: 1, padding: 18, borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', fontWeight: 950, cursor: 'pointer' }}>CANCELAR</button>
              <button 
                onClick={processOrder}
                style={{ flex: 1, padding: 18, borderRadius: 16, background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 950, cursor: 'pointer' }}
              >
                CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    const t1 = setTimeout(() => setPhase('found'), 1500);
    const t2 = setTimeout(() => setPhase('verified'), 3000);
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
                    {phase === 'verified' ? <Check size={80} style={{ color: 'var(--neon-green)' }} /> : <ScanFace size={80} style={{ color: 'var(--neon-green)', animation: 'pulse 1.5s infinite' }} />}
                 </div>
                 <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 8 }}>{phase === 'verified' ? '¡ACCESO CONCEDIDO!' : 'ESCANEANDO ROSTRO...'}</h2>
                 <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{phase === 'verified' ? 'Bienvenido a Fuxion Fit, Alex.' : 'Acércate al sensor de la entrada.'}</p>
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
