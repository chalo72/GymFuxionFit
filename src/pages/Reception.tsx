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

  /* ── Catálogo unificado para POS: inventario real → config → fallback ── */
  const posCatalog = useMemo(() => {
    if (products && products.length > 0) {
      return products.map(p => ({
        id: p.id, name: p.name,
        sellPrice: p.sellPrice ?? (p as any).price ?? 0,
        category: p.category ?? 'Producto',
        stock: p.stock
      }));
    }
    // Fallback a catálogo de configuración (Settings)
    return configProducts.filter(p => p.active).map(p => ({
      id: p.id, name: `${p.emoji} ${p.name}`,
      sellPrice: p.price, category: 'Producto', stock: undefined
    }));
  }, [products, configProducts]);
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
  const [posMode, setPosMode] = useState(false);
  
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
  const [paymentType, setPaymentType] = useState('Venta Producto');
  const [cashReceived, setCashReceived] = useState<string>('');
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
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 } 
        });
        setCameraStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
        
        let p = 0;
        const interval = setInterval(() => {
          p += 5;
          setProgress(p);
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
         p += 10;
         setProgress(p);
         if (p >= 100) {
           clearInterval(interval);
           handleSuccess(members[0].name, 'geo');
         }
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
      setStatus('idle'); 
      setProgress(0); 
      stopCamera(); 
      setSearch('');
      setSuggestions([]);
    }, 1500);
  };

  const addToCart = (product: any) => {
     setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
           if (product.stock && existing.qty >= product.stock) {
              alert('STOCK_INSUFICIENTE para este producto.');
              return prev;
           }
           return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
        }
        return [...prev, { id: product.id, name: product.name, price: product.sellPrice || product.price, qty: 1, category: product.category }];
     });
  };

  const removeFromCart = (id: string) => {
     setCart(prev => prev.filter(item => item.id !== id));
  };

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
             
             await updateMemberStatus(selectedMember.id, { 
                status: 'active', 
                expiryDate: startDate.toISOString().split('T')[0],
                debt: 0 
             });
          }
       }
    }

    if (paymentMethod === 'Crédito') {
       const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
       await updateMemberStatus(selectedMember.id, { 
         debt: selectedMember.debt + total 
       });
    }

    setLogs(prev => [{ 
      id: Date.now(), 
      name: selectedMember.name, 
      action: paymentMethod === 'Crédito' ? 'FIADO' : 'COBRO', 
      time: new Date().toLocaleTimeString().slice(0,5), 
      method: paymentMethod, 
      color: paymentMethod === 'Crédito' ? 'var(--danger-red)' : 'var(--neon-green)' 
    }, ...prev]);

    setCart([]);
    setPaymentType('Venta Producto');
  };

  const handleClearDebt = async (amount?: number) => {
    if (selectedMember) {
      if (amount && amount > 0) {
        await updateMemberStatus(selectedMember.id, { 
          debt: Math.max(0, selectedMember.debt - amount) 
        });
        await injectTransaction({
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString().slice(0, 5),
          description: `Abono a deuda: ${selectedMember.name}`,
          category: 'membership',
          type: 'income',
          amount: amount,
          method: paymentMethod,
          client: selectedMember.name
        });
      } else {
        await clearMemberDebt(selectedMember.id);
      }
      setAlertMember(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20 }}>
      
      {/* ── SMART ALERT OVERLAY ── */}
      {alertMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 450, width: '100%', border: `1px solid ${alertMember.debt > 0 ? 'var(--danger-red)' : 'var(--warning-yellow)'}`, animation: 'slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                   <div style={{ width: 48, height: 48, borderRadius: 12, background: alertMember.debt > 0 ? 'rgba(255,61,87,0.1)' : 'rgba(255,214,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color: alertMember.debt > 0 ? 'var(--danger-red)' : 'var(--warning-yellow)' }}>
                      <AlertTriangle size={28} />
                   </div>
                   <div>
                      <h3 style={{ fontSize: 11, fontWeight: 950, letterSpacing: 2, color: 'var(--text-muted)' }}>ALERTA DE ACCESO BLOQUEADO</h3>
                      <div style={{ fontSize: 22, fontWeight: 950, color: '#fff', marginTop: 4 }}>{alertMember.name}</div>
                   </div>
                </div>
                <button onClick={() => setAlertMember(null)} style={{ opacity: 0.5, color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
             </div>

             <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 20, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                {alertMember.debt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                     <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Deuda Pendiente:</span>
                     <span style={{ fontSize: 18, fontWeight: 950, color: 'var(--danger-red)', textShadow: '0 0 10px rgba(255,61,87,0.3)' }}>${alertMember.debt.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Plan Actual:</span>
                   <span style={{ fontSize: 14, fontWeight: 800 }}>{alertMember.plan}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                   <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Vencimiento:</span>
                   <span style={{ fontSize: 14, fontWeight: 800, color: alertMember.status === 'expired' ? 'var(--danger-red)' : 'var(--warning-yellow)' }}>{alertMember.expiryDate}</span>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                 <button 
                   onClick={() => handleClearDebt()}
                   style={{ padding: '16px', borderRadius: 12, background: 'var(--neon-green)', color: '#000', border: 'none', fontSize: 12, fontWeight: 950, boxShadow: '0 0 25px rgba(0,255,136,0.4)', cursor: 'pointer' }}
                 >
                   {alertMember.debt > 0 ? 'LIQUIDAR DEUDA' : 'RENOVAR MEMBRESÍA'}
                 </button>
              </div>
           </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr 350px', gap: 20, height: 'calc(100vh - 160px)', overflow: 'hidden' }}>
         
         {/* ── COL 1: OPERACIONES (CHECK-IN & VENTAS) ── */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', paddingRight: 5 }}>
            <div style={{ display: 'flex', gap: 10 }}>
               {[
                 { id: 'manual', icon: <User size={20}/>, label: 'MANUAL' },
                 { id: 'qr', icon: <QrCode size={20}/>, label: 'QR' },
                 { id: 'facial', icon: <ScanEye size={20}/>, label: 'FACIAL' },
                 { id: 'geo', icon: <MapPin size={20}/>, label: 'PROX' }
               ].map(t => (
                 <button 
                   key={t.id}
                   onClick={() => { startScanning(t.id as any); setSelectedMember(null); setPosMode(false); }}
                   style={{ 
                     flex: 1, padding: '15px 0', borderRadius: 16, background: activeTab === t.id ? 'var(--green-10)' : 'rgba(255,255,255,0.03)',
                     border: `1px solid ${activeTab === t.id ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`,
                     color: activeTab === t.id ? 'var(--neon-green)' : 'var(--text-muted)',
                     display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: '0.3s'
                   }}
                 >
                   {t.icon}
                   <span style={{ fontSize: 10, fontWeight: 950 }}>{t.label}</span>
                 </button>
               ))}
            </div>

            {!selectedMember ? (
             <div className="glass-card" style={{ flex: 1, padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--green-10)', background: 'radial-gradient(circle at center, #0a0f0d, #000)', borderRadius: 24 }}>
                {activeTab === 'manual' ? (
                   <div style={{ width:'100%', textAlign:'center' }}>
                      <Activity size={60} style={{ color: 'var(--neon-green)', opacity: 0.1, marginBottom: 20 }} />
                      <h3 style={{ fontSize: 16, fontWeight: 950, marginBottom: 20 }}>BUSCAR ATLETA</h3>
                      <div style={{ width: '100%', position: 'relative' }}>
                          <Search style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                          <input 
                            placeholder="Nombre o ID..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSuccess(search, 'manual')}
                            style={{ width: '100%', padding: '15px 15px 15px 45px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', fontSize: 14, outline: 'none' }}
                          />
                      </div>
                   </div>
                ) : (
                   <div style={{ textAlign:'center' }}>
                      <RefreshCcw className="spinning" size={40} style={{ color:'var(--neon-green)', opacity: 0.5, marginBottom: 20 }} />
                      <div style={{ fontSize:14, fontWeight:950, color:'var(--neon-green)' }}>ACTIVANDO SENSOR...</div>
                   </div>
                )}
             </div>
            ) : (
             <div className="glass-card" style={{ flex: 1, padding: 20, border: `1px solid ${selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--green-20)'}`, background: 'rgba(0,0,0,0.6)', display:'flex', flexDirection:'column', borderRadius: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                   <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, color: 'var(--neon-green)' }}>{selectedMember.name.slice(0,1)}</div>
                      <div>
                         <h3 style={{ fontSize: 14, fontWeight: 950, color: '#fff', margin:0 }}>{selectedMember.name}</h3>
                         <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--neon-green)' }}>{selectedMember.plan.toUpperCase()}</div>
                      </div>
                   </div>
                   <button onClick={() => setSelectedMember(null)} style={{ background: 'rgba(255,61,87,0.1)', border: 'none', color: 'var(--danger-red)', padding: '6px 12px', borderRadius: 8, fontSize: 10, cursor: 'pointer', fontWeight: 950 }}>CANCELAR</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 15, flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                       <div style={{ background:'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', textAlign:'center' }}>
                          <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 5 }}>DEUDA</div>
                          <div style={{ fontSize: 14, fontWeight: 950, color: selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--neon-green)' }}>${selectedMember.debt.toLocaleString()}</div>
                       </div>
                       <button onClick={() => setShowProfile(true)} style={{ background: 'var(--green-10)', border: '1px solid var(--green-20)', color: 'var(--neon-green)', borderRadius: 12, fontSize: 10, fontWeight: 950, cursor:'pointer' }}>VER FICHA</button>
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 1 }}>VENTA RÁPIDA</div>
                    <div style={{ position:'relative' }}>
                       <Search size={14} style={{ position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)', opacity:0.5 }} />
                       <input 
                         placeholder="Buscar producto..."
                         value={productSearch}
                         onChange={e => setProductSearch(e.target.value)}
                         style={{ width:'100%', padding: '12px 12px 12px 35px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12, outline:'none' }}
                       />
                       {productSearch.length > 0 && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(10,15,13,0.98)', borderRadius: 12, border: '1px solid var(--neon-green)', zIndex: 9999, maxHeight: 200, overflowY: 'auto' }}>
                             {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                                <div key={p.id} onClick={() => { addToCart(p); setProductSearch(''); }} style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', cursor:'pointer', fontSize: 12 }}>
                                   {p.name} - ${p.sellPrice.toLocaleString()}
                                </div>
                             ))}
                          </div>
                       )}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 10, minHeight: 100 }}>
                       {cart.length === 0 && <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 10, color:'var(--text-muted)' }}>CARRITO VACÍO</div>}
                       {cart.map(item => (
                         <div key={item.id} style={{ display: 'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8, background:'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8 }}>
                            <div style={{ fontSize: 11 }}><span style={{ color:'var(--neon-green)', fontWeight:950, marginRight:5 }}>{item.qty}x</span>{item.name}</div>
                            <button onClick={() => removeFromCart(item.id)} style={{ background:'none', border:'none', color:'var(--danger-red)', cursor:'pointer' }}><X size={12}/></button>
                         </div>
                       ))}
                    </div>
                    
                    <button 
                      onClick={() => { handleFinalizeSale(); setCashReceived(''); }} 
                      disabled={cart.length === 0} 
                      style={{ width:'100%', padding:'18px', borderRadius:'16px', background: cart.length > 0 ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)', color:'#000', border:'none', fontWeight: 950, fontSize:'16px', cursor:'pointer', boxShadow: cart.length > 0 ? '0 10px 30px rgba(0,255,136,0.3)' : 'none' }}
                   >
                      FINALIZAR: ${cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0).toLocaleString()}
                   </button>
                </div>
             </div>
            )}
         </div>

         {/* ── COL 2: MONITOR DE SALA (EL GRID GIGANTE) ── */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 15, overflowY: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
               <div>
                 <div style={{ fontSize: 13, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: 1 }}>ATLETAS EN SALA</div>
                 <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>MONITOREO EN TIEMPO REAL</div>
               </div>
               <div style={{ background: 'var(--green-10)', padding: '10px 20px', borderRadius: 15, border: '1px solid var(--green-20)', fontSize: 24, fontWeight: 950, color: 'var(--neon-green)' }}>
                 {activeMembers.length}
               </div>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 15, overflowY: 'auto', paddingRight: 10, alignContent: 'start' }}>
               {activeMembers.length === 0 && (
                 <div style={{ gridColumn: '1 / -1', padding: 120, textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: 30 }}>
                    <Users size={60} style={{ opacity: 0.1, marginBottom: 20 }} />
                    <div style={{ fontSize: 18, fontWeight: 800 }}>SALA VACÍA</div>
                    <p style={{ fontSize: 12 }}>No hay ingresos registrados actualmente.</p>
                 </div>
               )}

               {activeMembers.map(m => (
                 <div 
                   key={m.id} 
                   onClick={() => {
                      const master = members?.find(mMaster => String(mMaster.id) === String(m.id));
                      if (master) setSelectedMember(master);
                   }}
                   className="glass-card athlete-card" 
                   style={{ padding: '20px', border: `1px solid ${m.membershipStatus === 'expired' ? 'var(--danger-red)' : 'rgba(255,255,255,0.1)'}`, background: `linear-gradient(135deg, ${m.color}15, rgba(0,0,0,0.4))`, display: 'flex', flexDirection: 'column', gap: 15, cursor: 'pointer', borderRadius: 20 }}
                 >
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                       <div style={{ width: 50, height: 50, borderRadius: 14, background: `${m.color}20`, border: `1px solid ${m.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, color: m.color, fontSize: 20 }}>{m.initials}</div>
                       <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>{m.plan.toUpperCase()}</div>
                       </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px 15px', borderRadius: 12 }}>
                       <div style={{ fontSize: 12, color: 'var(--neon-green)', fontWeight: 950, display:'flex', alignItems:'center', gap:6 }}><Clock size={14}/> {fmtTime(Math.floor((Date.now() - m.checkedInAt) / 1000))}</div>
                       <button onClick={(e) => { e.stopPropagation(); setActiveMembers(prev => prev.filter(am => am.id !== m.id)); }} style={{ background:'rgba(255,61,87,0.1)', border:'none', color:'var(--danger-red)', padding:'6px 12px', borderRadius:8, fontSize:10, fontWeight:950 }}>SALIDA</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className="glass-card" style={{ flex:1, padding:20 }}>
               <div style={{ flex:1, overflowY:'auto' }}>
                 {logs.map(l => (
                   <div key={l.id} style={{ padding: '12px 14px', fontSize: 10, borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', gap: 14 }}>
                         <span style={{ color: 'var(--text-muted)' }}>{l.time}</span>
                         <span style={{ color: l.color, fontWeight: 950 }}>{l.action}</span>
                         <span style={{ color: '#fff', fontWeight: 800 }}>{l.name.toUpperCase()}</span>
                      </div>
                      {l.note && (
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: 50 }}>
                           📌 Obs: {l.note}
                        </div>
                      )}
                   </div>
                 ))}
              </div>
           </div>
           {/* ── DAILY REVENUE INTEL ── */}
           <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.06), transparent)', border: '1px solid var(--green-20)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', marginBottom: 16 }}>
                 <span style={{ fontSize: 11, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: 1 }}>RESUMEN DEL DÍA</span>
                 <TrendingUp size={16} style={{ color: 'var(--neon-green)' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8 }}>
                <div style={{ background:'rgba(0,255,136,0.05)', padding:'12px 14px', borderRadius:12, border:'1px solid rgba(0,255,136,0.1)' }}>
                  <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom:4, fontWeight:950 }}>INGRESOS HOY</div>
                  <div style={{ fontSize: 18, fontWeight:950, color:'var(--neon-green)' }}>${todayKpis.total.toLocaleString()}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.02)', padding:'12px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom:4, fontWeight:950 }}>TRANSACCIONES</div>
                  <div style={{ fontSize: 18, fontWeight:950, color:'#fff' }}>{todayKpis.count}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom:3, fontWeight:950 }}>MÉTODO + USADO</div>
                  <div style={{ fontSize: 11, fontWeight:800, color:'var(--neon-green)' }}>{todayKpis.topMethod}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.05)', overflow:'hidden' }}>
                  <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom:3, fontWeight:950 }}>TOP PRODUCTO</div>
                  <div style={{ fontSize: 10, fontWeight:800, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{todayKpis.topProd}</div>
                </div>
              </div>
           </div>
        </div>

      </div>

      {showProfile && selectedMember && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,10,0.95)', backdropFilter: 'blur(25px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div className="glass-card" style={{ maxWidth: 750, width: '100%', border: '2px solid var(--green-20)', maxHeight: '95vh', overflowY: 'auto', padding: 30, borderRadius: 32, boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                     <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--green-10)', border: '2px solid var(--neon-green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 32, fontWeight:950, color:'var(--neon-green)' }}>{selectedMember.name.slice(0,1)}</div>
                     <div>
                        <h2 style={{ fontSize: 26, fontWeight:950, color:'#fff', margin: 0 }}>{selectedMember.name}</h2>
                        <span style={{ color:'var(--neon-green)', fontWeight:900, fontSize: 11, background:'var(--green-10)', padding:'2px 8px', borderRadius:5 }}>{selectedMember.plan.toUpperCase()}</span>
                     </div>
                  </div>
                  <button onClick={() => setShowProfile(false)} style={{ background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', cursor:'pointer', padding: 12, borderRadius: 15 }}><X size={24}/></button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 25, marginBottom: 30 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ fontSize: 12, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 10 }}>ESTADO MÉDICO</div>
                     <div style={{ color: selectedMember.injuries ? 'var(--danger-red)' : 'var(--neon-green)', fontWeight: 800 }}>{selectedMember.injuries || 'Sin lesiones reportadas'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ fontSize: 12, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 10 }}>OBJETIVO</div>
                     <div style={{ color: '#fff', fontWeight: 800 }}>{selectedMember.objective || 'Mantener forma física'}</div>
                  </div>
               </div>
               <button onClick={() => setShowProfile(false)} style={{ width:'100%', padding:20, borderRadius:15, background:'var(--neon-green)', color:'#000', border:'none', fontWeight:950, fontSize:14, cursor:'pointer' }}>CERRAR EXPEDIENTE</button>
            </div>
         </div>
      )}

      <style>{`
         @keyframes spinning { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
         .spinning { animation: spinning 2s linear infinite; }
         .athlete-card:hover { transform: translateY(-5px); border-color: var(--neon-green) !important; box-shadow: 0 10px 30px rgba(0,255,136,0.1); }
      `}</style>
    </div>
  );
}
