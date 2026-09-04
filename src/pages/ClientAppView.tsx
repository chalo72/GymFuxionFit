import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ScanFace, Dumbbell, Trophy, Apple, User, Play, Pause,
  Check, ChevronRight, Zap, Flame, Target, Star,
  TrendingUp, Clock, Shield, Award, Activity, Heart,
  ZapOff, Lock, CreditCard, ChevronLeft, Calendar,
  ShoppingBag, Filter, Info, ShoppingCart, ScanLine
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';
import { findMemberForUser, fichaCuenta, tabTotal } from '../lib/cuentaPiso';
import { useGymData } from '../hooks/useGymData';
import { AiAssist } from '../components/AiAssist';
import { useAuth } from '../contexts/AuthContext';
import { firstName } from '../lib/safeText';
import { PanelLeaderboard } from '../components/ClientHUD/PanelLeaderboard';
import { PanelNutrition } from '../components/ClientHUD/PanelNutrition';
import { PanelWallet } from '../components/ClientHUD/PanelWallet';
import { PanelProfile } from '../components/ClientHUD/PanelProfile';
import { PanelStore } from '../components/ClientHUD/PanelStore';
import { fetchTodaysWorkout } from '../services/exerciseService';
import type { WorkoutExercise } from '../types/exercise';
import { PostureCoach } from '../components/AI/PostureCoach';
import { PanelAIScanner } from '../components/ClientHUD/PanelAIScanner';


/* ══════════════════════════════════════════
   TIPOS Y CORE ARCHITECTURE
   Client Performance HUD V.2.6
══════════════════════════════════════════ */
type Tab       = 'scan' | 'workout' | 'leaderboard' | 'nutrition' | 'store' | 'wallet' | 'profile' | 'aicoach' | 'aiscanner';
type ScanPhase = 'scanning' | 'found' | 'verified' | 'error_distance' | 'error_gps';

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
  const { members, updateMemberStatus } = useGymData();
  const { user } = useAuth();
  
  const [workouts, setWorkouts] = useState<WorkoutExercise[]>([]);
  const [loadingWorkout, setLoadingWorkout] = useState(true);

  useEffect(() => {
    fetchTodaysWorkout().then(data => {
      setWorkouts(data);
      setLoadingWorkout(false);
    });
  }, []);

  const markedGeo = useRef(false);

  const athlete = useMemo(() => findMemberForUser(members, user), [members, user]);

  useEffect(() => {
    if (phase !== 'verified' || !athlete?.id || markedGeo.current) return;
    markedGeo.current = true;
    updateMemberStatus(athlete.id, {
      presence: {
        inGym: true,
        enteredAt: athlete.presence?.inGym ? athlete.presence.enteredAt : Date.now(),
        method: 'geo',
        doing: athlete.sessionLive ? 'Sesión con entrenador' : 'En el gym (GPS)',
      },
      lastVisit: new Date().toISOString(),
      visits: athlete.presence?.inGym ? athlete.visits : (athlete.visits || 0) + 1,
    });
  }, [phase, athlete, updateMemberStatus]);

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
          const { getDistanceBetweenCoordinates, GYM_PINS, MAX_DISTANCE_IN_KILOMETERS } = await import('../utils/geolocation');
          const distance = Math.min(...GYM_PINS.map((pin) => getDistanceBetweenCoordinates({ latitude, longitude }, pin)));

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
      <AiAssist
        rol="socio"
        texto="Tu objetivo se cumple en el piso, no en la pantalla. Escanea el QR de la máquina o entra a Sala: pecho alto/bajo, WOD, HYROX. Si tu membresía está vencida o hay mora, recepción no te deja entrar."
      />
      <Link to="/sala" style={{ color: 'var(--neon-green)', fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Abrir sala del socio (QR y zonas) →</Link>
      {!athlete && <p style={{ color: '#FFD700', fontSize: 13 }}>Tu login no está en una ficha. En recepción, pon el mismo correo del socio.</p>}
      {athlete && tabTotal(athlete.openTab) > 0 && (
        <div className="glass-card" style={{ padding: 14, border: '1px solid rgba(255,215,0,0.4)' }}>
          Debes pagar al salir: {(athlete.openTab || []).map((l) => `${l.qty}× ${l.name}`).join(', ')} = ${tabTotal(athlete.openTab).toLocaleString('es-CO')}
        </div>
      )}

      {/* ── HEADER ELITE ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: 32, fontWeight: 950, letterSpacing: -1, marginBottom: 4 }}>
              Hola, <span style={{ color: 'var(--neon-green)' }}>{firstName(athlete?.name)}</span>
           </h1>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 1 }}>{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</span>
           </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
           <div className="glass-card" style={{ padding: '12px 20px', borderRadius: 20, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 2 }}>ESTADO_MEMBRESÍA</div>
              <div style={{ fontSize: 13, fontWeight: 950, color: 'var(--neon-green)' }}>{athlete?.status === 'active' ? '● ACTIVA' : athlete ? `○ ${fichaCuenta(athlete).plan}` : '○ SIN FICHA'}</div>
           </div>
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
         {[
           { label: 'VISITAS', value: String(athlete?.visits || 0), icon: <Activity />, color: '#00E5FF' },
           { label: 'RACHA', value: String(athlete?.streak || 0), icon: <Flame />, color: '#FF6B35' },
           { label: 'SALDO', value: `$${(athlete?.debt || 0).toLocaleString('es-CO')}`, icon: <Heart />, color: '#A78BFA' },
           { label: 'TIEMPO SESIÓN', value: active ? fmt(sec) : '--:--', icon: <Clock />, color: 'var(--neon-green)', active: active }
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
           { id: 'aiscanner', l: 'Escáner 3D', i: <ScanLine size={18} color="var(--neon-green)" /> },
           { id: 'store', l: 'Tienda', i: (
             <div style={{ position: 'relative' }}>
               <ShoppingBag size={18} />
               {cartCount > 0 && (
                 <div style={{ 
                   position: 'absolute', top: -8, right: -8, 
                   background: 'var(--neon-green)', color: '#000', 
                   fontSize: 10, fontWeight: 'bold', 
                   width: 16, height: 16, borderRadius: '50%',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   animation: 'pulse 1s infinite'
                 }}>
                   {cartCount}
                 </div>
               )}
             </div>
           ) 
           },
           { id: 'aicoach', l: 'Coach IA', i: <Activity size={18} color="var(--neon-green)" /> },
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
                     phase === 'error_distance' ? 'Estás lejos de las sedes (Ciénaga de Oro / Montería). Acércate o entra por recepción.' :
                     phase === 'error_gps' ? 'Debes otorgar permisos de ubicación para registrar asistencia.' : 'Buscando satélites y calculando distancia...'}
                 </p>
              </div>
           </div>
         )}

         {tab === 'aicoach' && <PostureCoach />}

         {tab === 'workout' && (
           <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, animation: 'slideIn 0.5s ease-out' }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 32, borderRadius: 32 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                       <h3 style={{ fontSize: 20, fontWeight: 950, color: '#fff' }}>Rutina de Hoy</h3>
                       <p style={{ fontSize: 13, color: 'var(--neon-green)', fontWeight: 800 }}>
                         {workouts.length ? `${workouts.length} ejercicios cargados` : 'Sin rutina cargada'}
                       </p>
                    </div>
                    <button onClick={() => {
                       const next = !active;
                       setActive(next);
                       if (athlete?.id) {
                         updateMemberStatus(athlete.id, {
                           presence: athlete.presence?.inGym
                             ? { ...athlete.presence, doing: next ? 'Entrenando' : 'En sala' }
                             : athlete.presence,
                         });
                       }
                    }} style={{ padding: '14px 28px', borderRadius: 18, background: active ? 'var(--danger-red)' : 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 950, cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                       {active ? 'PAUSAR' : 'INICIAR ENTRENAMIENTO'}
                    </button>
                 </div>
                 
                 <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {loadingWorkout ? (
                      <div style={{ textAlign: 'center', padding: 40, color: 'var(--neon-green)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--neon-green)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                        <div>Cargando rutina visual...</div>
                      </div>
                    ) : workouts.map((ex) => (
                      <div key={ex.id} className="premium-card-hover" style={{ display: 'flex', flexDirection: 'column', padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.04)', transition: '0.3s' }}>
                         
                         {/* Cabecera del ejercicio */}
                         <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                           <div style={{ width: 100, height: 80, borderRadius: 16, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
                             <img src={ex.gifUrl} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                           </div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 16, fontWeight: 950, textTransform: 'uppercase', marginBottom: 4 }}>{ex.name}</div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 9, background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', padding: '4px 8px', borderRadius: 8, fontWeight: 900 }}>{ex.target}</span>
                                <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 8, fontWeight: 800 }}>{ex.equipment}</span>
                              </div>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 13, fontWeight: 950, color: 'var(--neon-green)' }}>{ex.sets}x{ex.reps}</div>
                              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800 }}>{ex.rest} DESC.</div>
                           </div>
                         </div>
                         
                         {/* Instrucciones desplegables */}
                         <details style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12, cursor: 'pointer' }}>
                           <summary style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             VER TÉCNICA Y CONSEJOS
                           </summary>
                           <ul style={{ marginTop: 12, paddingLeft: 16, fontSize: 12, color: '#ccc', lineHeight: 1.6 }}>
                             {ex.instructions.map((inst, idx) => (
                               <li key={idx} style={{ marginBottom: 4 }}>{inst}</li>
                             ))}
                           </ul>
                           <div style={{ marginTop: 12, fontSize: 10, color: 'var(--neon-green)', fontWeight: 800 }}>
                             Sinergia: {ex.secondaryMuscles.join(', ')}
                           </div>
                         </details>

                      </div>
                    ))}
                 </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                 <div className="glass-card" style={{ padding: 24, borderRadius: 28 }}>
                    <div style={{ fontSize: 12, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 12 }}>MEMBRESÍA</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{athlete?.plan || 'Sin plan'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Vence: {athlete?.expiryDate || athlete?.expiry || '—'}</div>
                    <Link to="/sala" style={{ display: 'block', marginTop: 12, color: 'var(--neon-green)', fontSize: 13 }}>Zonas y máquinas (QR) →</Link>
                 </div>
                 <div className="glass-card" style={{ padding: 24, borderRadius: 28 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      Las recomendaciones de IA aparecerán cuando haya un análisis real de la sesión. No se muestran sugerencias inventadas.
                    </p>
                 </div>
              </div>
           </div>
         )}

         {tab === 'leaderboard' && <PanelLeaderboard members={members} athlete={athlete} />}
         {tab === 'nutrition' && <PanelNutrition athlete={athlete} updateMemberStatus={updateMemberStatus} />}
         {tab === 'store' && <PanelStore onCartChange={setCartCount} athlete={athlete} />}
         {tab === 'wallet' && <PanelWallet user={athlete} />}
         {tab === 'profile' && <PanelProfile user={athlete} />}
         {tab === 'aiscanner' && <PanelAIScanner />}

      </div>
    </div>
  );
}
