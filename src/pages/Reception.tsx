import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  DollarSign, Search, AlertTriangle,
  CheckCircle2, CreditCard, Smartphone, Banknote,
  TrendingUp, Users, X, Plus, ShoppingBag,
  LogIn, LogOut, Eye, Phone, Mail, MapPin,
  Calendar, BarChart2, Trash2, MinusCircle,
  QrCode, ScanEye, Camera, ShieldCheck, Activity,
  Zap, Database, Map as MapIcon, RefreshCcw, User,
  AlertCircle, HeartPulse, ChevronRight, Dumbbell,
  Contact, Star, Target, Clock, History
} from 'lucide-react';
import { useGymData, Member } from '../hooks/useGymData';
import { useGymConfig, DEFAULT_PRODUCTS } from '../contexts/GymConfigContext';

/* ══════════════════════════════════════════
   TIPOS & MOCKS HIDRINOS
   ══════════════════════════════════════════ */
type MembershipStatus = 'active' | 'expiring' | 'expired' | 'suspended';
type CheckInMethod = 'qr' | 'facial' | 'geo' | 'manual';

interface ActiveMember {
  id: number; name: string; initials: string; plan: string;
  checkedInAt: number; membershipStatus: MembershipStatus;
  color: string; checkInMethod?: CheckInMethod;
}

/* ══════════════════════════════════════════
   COMPONENTES AUXILIARES
   ══════════════════════════════════════════ */
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
};

/* ══════════════════════════════════════════
   HYBRID RECEPTION HUB (FUSION v4.1 - OPTIMIZED)
   ══════════════════════════════════════════ */
export default function Reception() {
  const { members, transactions, clearMemberDebt, injectTransaction, products, registerProductSale, updateMemberStatus } = useGymData();
  const { products: configProducts } = useGymConfig();

  /* ── KPIs del día calculados en tiempo real ── */
  const todayStr = new Date().toISOString().split('T')[0];
  const todayKpis = useMemo(() => {
    const todayTx = transactions.filter(t => t.date === todayStr && t.type === 'income');
    const total = todayTx.reduce((acc, t) => acc + t.amount, 0);
    const count = todayTx.length;
    const methodMap: Record<string, number> = {};
    todayTx.forEach(t => { methodMap[t.method] = (methodMap[t.method] || 0) + 1; });
    const topMethod = Object.entries(methodMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '--';
    const prodMap: Record<string, number> = {};
    todayTx.forEach(t => {
      const k = t.description?.replace(/^(Servicio: |Venta: )/, '') ?? 'Servicio';
      prodMap[k] = (prodMap[k] || 0) + 1;
    });
    const topProd = Object.entries(prodMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '--';
    return { total, count, topMethod, topProd };
  }, [transactions, todayStr]);

  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([
    { 
      id: 5, name: 'Rodrigo Silva', initials: 'RS', plan: 'Pro', 
      checkedInAt: Date.now() - 3600000, membershipStatus: 'active', color: 'var(--neon-green)', checkInMethod: 'qr' 
    }
  ]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<CheckInMethod>('manual');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const [alertMember, setAlertMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const [cart, setCart] = useState<{ id: string, name: string, price: number, qty: number, category: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Nequi' | 'Crédito'>('Efectivo');
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => { clearInterval(t); stopCamera(); };
  }, [cameraStream]);

  useEffect(() => {
    if (search.length > 1 && activeTab === 'manual') {
      const filtered = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [search, members, activeTab]);

  const startScanning = async (type: CheckInMethod) => {
    setActiveTab(type);
    if (type === 'manual') return;
    setStatus('scanning');
    setProgress(0);
    if (type === 'qr' || type === 'facial') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        setCameraStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
        let p = 0;
        const interval = setInterval(() => {
          p += 5; setProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            const randomMember = members[Math.floor(Math.random() * members.length)];
            handleSuccess(randomMember.name, type);
          }
        }, 100);
      } catch (err) { setStatus('error'); }
    } else if (type === 'geo') {
       let p = 0;
       const interval = setInterval(() => {
         p += 10; setProgress(p);
         if (p >= 100) { clearInterval(interval); handleSuccess(members[0].name, 'geo'); }
       }, 150);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  };

  const handleSuccess = (nameOrMember: string | Member, method: CheckInMethod) => {
    let masterMember: Member | undefined;
    if (typeof nameOrMember === 'string') {
      masterMember = members.find(m => m.name.toLowerCase() === nameOrMember.toLowerCase());
      if (!masterMember && method === 'manual') {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
        return;
      }
    } else {
      masterMember = nameOrMember;
    }
    
    if (masterMember) {
      setSelectedMember(masterMember);
      if (masterMember.debt > 0 || masterMember.status === 'expired' || masterMember.status === 'expiring') {
         setAlertMember(masterMember);
         setStatus('complete');
         setTimeout(() => { setStatus('idle'); stopCamera(); }, 1000);
         return; 
      }
    }

    const nameToUse = masterMember ? masterMember.name : (typeof nameOrMember === 'string' ? nameOrMember : '');
    if (!nameToUse) return;

    const existing = activeMembers.find(m => m.name === nameToUse);
    if (existing) {
      setActiveMembers(prev => prev.filter(m => m.id !== existing.id));
      setLogs(prev => [{ id: Date.now(), name: nameToUse, action: 'SALIDA', time: new Date().toLocaleTimeString().slice(0,5), method, color: '#ff4d4d' }, ...prev]);
    } else {
      const newM: ActiveMember = {
         id: masterMember ? Number(masterMember.id) : Date.now(),
         name: nameToUse,
         initials: nameToUse.slice(0,2).toUpperCase(),
         plan: masterMember ? masterMember.plan : 'Invitado',
         checkedInAt: Date.now(),
         membershipStatus: masterMember ? masterMember.status : 'active',
         color: 'var(--neon-green)',
         checkInMethod: method
      };
      setActiveMembers(prev => [newM, ...prev]);
      setLogs(prev => [{ id: Date.now(), name: nameToUse, action: 'ENTRADA', time: new Date().toLocaleTimeString().slice(0,5), method, color: newM.color }, ...prev]);
    }
    
    setStatus('complete');
    setTimeout(() => { 
      setStatus('idle'); setProgress(0); stopCamera(); setSearch(''); setSuggestions([]);
    }, 1500);
  };

  const addToCart = (product: any) => {
     setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
           if (product.stock && existing.qty >= product.stock) {
              alert('STOCK_INSUFICIENTE');
              return prev;
           }
           return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
        }
        return [...prev, { id: product.id, name: product.name, price: product.sellPrice || product.price || 0, qty: 1, category: product.category }];
     });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const handleFinalizeSale = async () => {
    if (!selectedMember || cart.length === 0) return;
    for (const item of cart) {
       if (item.category !== 'Servicio') {
          await registerProductSale(item.id, item.qty, selectedMember.name, paymentMethod);
       } else {
          await injectTransaction({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString().slice(0, 5),
            description: `Servicio: ${item.name}`,
            category: item.id === 'srv_mes' || item.id === 'srv_sem' ? 'membership' : 'daypass',
            type: 'income',
            amount: item.price * item.qty,
            method: paymentMethod,
            client: selectedMember.name
          });
          if (item.id === 'srv_mes' || item.id === 'srv_sem') {
             const daysToAdd = item.id === 'srv_mes' ? 30 * item.qty : 7 * item.qty;
             const [y, m, d] = selectedMember.expiryDate.split('-').map(Number);
             const currentExpiry = new Date(y, m - 1, d);
             const now = new Date();
             const startDate = currentExpiry > now ? currentExpiry : now;
             startDate.setDate(startDate.getDate() + daysToAdd);
             await updateMemberStatus(selectedMember.id, { status: 'active', expiryDate: startDate.toISOString().split('T')[0], debt: 0 });
          }
       }
    }
    if (paymentMethod === 'Crédito') {
       const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
       await updateMemberStatus(selectedMember.id, { debt: selectedMember.debt + total });
    }
    setLogs(prev => [{ id: Date.now(), name: selectedMember.name, action: paymentMethod === 'Crédito' ? 'FIADO' : 'COBRO', time: new Date().toLocaleTimeString().slice(0,5), method: paymentMethod, color: paymentMethod === 'Crédito' ? 'var(--danger-red)' : 'var(--neon-green)' }, ...prev]);
    setCart([]);
  };

  const handleClearDebt = async () => {
    if (selectedMember) {
      await clearMemberDebt(selectedMember.id);
      setAlertMember(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20 }}>
      
      {/* ── ALERTA DE DEUDA (DESBLOQUEADA) ── */}
      {alertMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 450, width: '100%', border: `1px solid ${alertMember.debt > 0 ? 'var(--danger-red)' : 'var(--warning-yellow)'}`, borderRadius: 24, padding: 30 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                   <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,61,87,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--danger-red)' }}>
                      <AlertTriangle size={28} />
                   </div>
                   <div>
                      <h3 style={{ fontSize: 11, fontWeight: 950, letterSpacing: 2, color: 'var(--text-muted)' }}>BLOQUEO DETECTADO</h3>
                      <div style={{ fontSize: 22, fontWeight: 950, color: '#fff', marginTop: 4 }}>{alertMember.name}</div>
                   </div>
                </div>
                <button onClick={() => setAlertMember(null)} style={{ opacity: 0.5, color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
             </div>

             <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 20, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                   <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Deuda Pendiente:</span>
                   <span style={{ fontSize: 18, fontWeight: 950, color: 'var(--danger-red)' }}>${alertMember.debt.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Vencimiento:</span>
                   <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--danger-red)' }}>{alertMember.expiryDate}</span>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                 <button onClick={() => setAlertMember(null)} style={{ padding:'16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'none', color:'var(--text-secondary)', fontWeight:950, fontSize:12, cursor:'pointer' }}>SOLO REGISTRAR</button>
                 <button onClick={() => handleClearDebt()} style={{ padding:'16px', borderRadius:12, background:'var(--neon-green)', color:'#000', border:'none', fontWeight:950, fontSize:12, cursor:'pointer' }}>LIQUIDAR DEUDA</button>
             </div>
             <button onClick={() => { setShowProfile(true); setAlertMember(null); }} style={{ width:'100%', padding:'16px', borderRadius:12, background:'rgba(255,255,255,0.05)', color:'#fff', border:'1px solid rgba(255,255,255,0.1)', fontWeight:950, fontSize:12, cursor:'pointer' }}>VER EXPEDIENTE DEL ATLETA</button>
          </div>
        </div>
      )}

      {/* ── LAYOUT DE 3 COLUMNAS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr 350px', gap: 20, height: 'calc(100vh - 160px)', overflow: 'hidden' }}>
         
         {/* COL 1: OPERACIONES */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', paddingRight: 5 }}>
            <div style={{ display: 'flex', gap: 10 }}>
               {[{ id: 'manual', icon: <User size={20}/>, label: 'MANUAL' }, { id: 'qr', icon: <QrCode size={20}/>, label: 'QR' }].map(t => (
                 <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ flex: 1, padding: '15px 0', borderRadius: 16, background: activeTab === t.id ? 'var(--green-10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${activeTab === t.id ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`, color: activeTab === t.id ? 'var(--neon-green)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                   {t.icon} <span style={{ fontSize: 10, fontWeight: 950 }}>{t.label}</span>
                 </button>
               ))}
            </div>

            {!selectedMember ? (
               <div className="glass-card" style={{ flex: 1, padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--green-10)', borderRadius: 24 }}>
                  <Activity size={60} style={{ color: 'var(--neon-green)', opacity: 0.1, marginBottom: 20 }} />
                  <input placeholder="Buscar atleta..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSuccess(search, 'manual')} style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', fontSize: 14 }} />
               </div>
            ) : (
               <div className="glass-card" style={{ flex: 1, padding: 20, border: `1px solid ${selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--green-20)'}`, borderRadius: 24, display:'flex', flexDirection:'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                     <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, color: 'var(--neon-green)' }}>{selectedMember.name.slice(0,1)}</div>
                        <div><h3 style={{ fontSize: 14, fontWeight: 950, color: '#fff', margin:0 }}>{selectedMember.name}</h3><div style={{ fontSize: 9, color: 'var(--neon-green)' }}>{selectedMember.plan}</div></div>
                     </div>
                     <button onClick={() => setSelectedMember(null)} style={{ background: 'rgba(255,61,87,0.1)', border: 'none', color: 'var(--danger-red)', padding: '6px 12px', borderRadius: 8, fontSize: 10, cursor: 'pointer' }}>CANCELAR</button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:15 }}>
                     <div style={{ background:'rgba(255,255,255,0.03)', padding:12, borderRadius:12, textAlign:'center' }}>
                        <div style={{ fontSize:8, color:'var(--text-muted)' }}>DEUDA</div>
                        <div style={{ fontSize:14, fontWeight:950, color: selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--neon-green)' }}>${selectedMember.debt.toLocaleString()}</div>
                     </div>
                     <button onClick={() => setShowProfile(true)} style={{ background:'var(--green-10)', border:'none', color:'var(--neon-green)', borderRadius:12, fontSize:10, fontWeight:950, cursor:'pointer' }}>VER FICHA</button>
                  </div>
                  <input placeholder="Vender producto..." value={productSearch} onChange={e => setProductSearch(e.target.value)} style={{ width:'100%', padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:12, color:'#fff', marginBottom:10 }} />
                  {productSearch && (
                     <div style={{ background:'#000', borderRadius:12, border:'1px solid var(--neon-green)', maxHeight:150, overflowY:'auto', marginBottom:10 }}>
                        {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                           <div key={p.id} onClick={() => { addToCart(p); setProductSearch(''); }} style={{ padding:10, borderBottom:'1px solid #111', fontSize:11, cursor:'pointer' }}>{p.name} - ${p.sellPrice.toLocaleString()}</div>
                        ))}
                     </div>
                  )}
                  <div style={{ flex:1, overflowY:'auto', background:'rgba(0,0,0,0.2)', borderRadius:12, padding:10, marginBottom:15 }}>
                     {cart.map(item => (
                        <div key={item.id} style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:5 }}>
                           <span>{item.qty}x {item.name}</span>
                           <button onClick={() => removeFromCart(item.id)} style={{ color:'var(--danger-red)', background:'none', border:'none' }}><X size={12}/></button>
                        </div>
                     ))}
                  </div>
                  <button onClick={handleFinalizeSale} disabled={cart.length === 0} style={{ width:'100%', padding:18, borderRadius:16, background: cart.length > 0 ? 'var(--neon-green)' : '#222', color:'#000', fontWeight:950, cursor:'pointer' }}>FINALIZAR VENTA</button>
               </div>
            )}
         </div>

         {/* COL 2: MONITOR DE SALA */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 15, overflowY: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: 20 }}>
               <div style={{ fontSize: 13, fontWeight: 950, color: 'var(--neon-green)' }}>ATLETAS EN SALA</div>
               <div style={{ background: 'var(--green-10)', padding: '8px 15px', borderRadius: 12, fontSize: 20, fontWeight: 950, color: 'var(--neon-green)' }}>{activeMembers.length}</div>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 15, overflowY: 'auto', paddingRight: 10, alignContent: 'start' }}>
               {activeMembers.map(m => (
                 <div key={m.id} onClick={() => { const master = members.find(mx => String(mx.id) === String(m.id)); if (master) { setSelectedMember(master); setShowProfile(true); } }} className="glass-card athlete-card" style={{ padding: 20, border: '1px solid rgba(255,255,255,0.1)', background: `linear-gradient(135deg, ${m.color}10, transparent)`, borderRadius: 20, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                       <div style={{ width: 45, height: 45, borderRadius: 12, background: 'var(--green-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, fontWeight: 950 }}>{m.initials}</div>
                       <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{m.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.plan}</div>
                       </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: 10 }}>
                       <div style={{ fontSize: 11, color: 'var(--neon-green)', fontWeight: 950 }}><Clock size={12}/> {fmtTime(Math.floor((Date.now() - m.checkedInAt)/1000))}</div>
                       <button onClick={(e) => { e.stopPropagation(); setActiveMembers(px => px.filter(ax => ax.id !== m.id)); }} style={{ background: 'rgba(255,61,87,0.1)', border: 'none', color: 'var(--danger-red)', padding: '5px 10px', borderRadius: 8, fontSize: 10 }}>SALIDA</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* COL 3: AUDITORÍA */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'hidden' }}>
            <div className="glass-card" style={{ padding: 20, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: 11, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 15 }}>RESUMEN HOY</div>
               <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div style={{ background:'rgba(0,255,136,0.05)', padding:12, borderRadius:12, textAlign:'center' }}>
                     <div style={{ fontSize:8, color:'var(--text-muted)' }}>VENTAS</div>
                     <div style={{ fontSize:14, fontWeight:950, color:'var(--neon-green)' }}>${todayKpis.total.toLocaleString()}</div>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.02)', padding:12, borderRadius:12, textAlign:'center' }}>
                     <div style={{ fontSize:8, color:'var(--text-muted)' }}>INGRESOS</div>
                     <div style={{ fontSize:14, fontWeight:950, color:'#fff' }}>{todayKpis.count}</div>
                  </div>
               </div>
            </div>
            <div className="glass-card" style={{ flex: 1, padding: 20, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 15, overflowY: 'hidden' }}>
               <div style={{ fontSize: 11, fontWeight: 950, color: 'var(--text-muted)' }}>AUDITORÍA EN VIVO</div>
               <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {logs.map(log => (
                    <div key={log.id} style={{ padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10, borderLeft: `3px solid ${log.color}`, fontSize: 10 }}>
                       <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <span style={{ fontWeight: 950 }}>{log.name}</span>
                          <span style={{ opacity: 0.5 }}>{log.time}</span>
                       </div>
                       <div style={{ color: log.color, fontWeight: 900 }}>{log.action}</div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* EXPEDIENTE (MODAL ELITE) */}
      {showProfile && selectedMember && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,10,0.95)', backdropFilter: 'blur(25px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div className="glass-card" style={{ maxWidth: 750, width: '100%', border: '2px solid var(--green-20)', maxHeight: '95vh', overflowY: 'auto', padding: 30, borderRadius: 32 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                     <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--green-10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 32, fontWeight:950, color:'var(--neon-green)' }}>{selectedMember.name.slice(0,1)}</div>
                     <div><h2 style={{ fontSize: 26, fontWeight:950, color:'#fff', margin: 0 }}>{selectedMember.name}</h2><div style={{ color:'var(--neon-green)', fontWeight:900 }}>{selectedMember.plan}</div></div>
                  </div>
                  <button onClick={() => setShowProfile(false)} style={{ background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', cursor:'pointer', padding: 12, borderRadius: 15 }}><X size={24}/></button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 25, marginBottom: 30 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 20 }}>
                     <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>ESTADO MÉDICO</div>
                     <div style={{ color: selectedMember.injuries ? 'var(--danger-red)' : 'var(--neon-green)', fontWeight: 800 }}>{selectedMember.injuries || 'Sin lesiones'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 20 }}>
                     <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>OBJETIVO</div>
                     <div style={{ color: '#fff', fontWeight: 800 }}>{selectedMember.objective || 'Mantener forma'}</div>
                  </div>
               </div>
               <button onClick={() => setShowProfile(false)} style={{ width:'100%', padding:20, borderRadius:15, background:'var(--neon-green)', color:'#000', border:'none', fontWeight:950, cursor:'pointer' }}>CERRAR EXPEDIENTE</button>
            </div>
         </div>
      )}

      <style>{`
         @keyframes spinning { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
         .spinning { animation: spinning 2s linear infinite; }
         .athlete-card:hover { transform: translateY(-5px); border-color: var(--neon-green) !important; }
      `}</style>
    </div>
  );
}
