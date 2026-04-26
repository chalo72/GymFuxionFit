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
  Contact, Star
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
                  onClick={() => setAlertMember(null)}
                  style={{ padding: '16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'none', fontSize: 12, fontWeight: 950, color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                   SOLO REGISTRAR
                </button>
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

      {/* ── HEADER HUD ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 950, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap size={28} style={{ color: 'var(--neon-green)' }} />
            CONTROL DE ENTRADAS <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>v.4.1</span>
          </h2>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>ESTADO DEL GIMNASIO EN VIVO</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--green-20)' }}>
              <Users size={16} />
              <span style={{ fontSize: 14, fontWeight: 950 }}>{activeMembers.length} EN SALA</span>
           </div>
        </div>
      </div>

      <div className="reception-layout-grid">
        
        {/* COL 1: SENSORES */}
        <div className="sensor-selector-container" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
           {[
             { id: 'manual', icon: <User size={20}/>, label: 'MANUAL' },
             { id: 'qr', icon: <QrCode size={20}/>, label: 'LEER QR' },
             { id: 'facial', icon: <ScanEye size={20}/>, label: 'FACIAL' },
             { id: 'geo', icon: <MapPin size={20}/>, label: 'PROXIMIDAD' }
           ].map(t => (
             <button 
               key={t.id}
               className="sensor-btn"
               onClick={() => { startScanning(t.id as any); setSelectedMember(null); setPosMode(false); }}
               style={{ 
                 height: 85, borderRadius: 16, background: activeTab === t.id ? 'var(--green-10)' : 'rgba(255,255,255,0.03)',
                 border: `1px solid ${activeTab === t.id ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`,
                 color: activeTab === t.id ? 'var(--neon-green)' : 'var(--text-muted)',
                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, transition: '0.3s', cursor: 'pointer'
               }}
             >
               {t.icon}
               <span style={{ fontSize: 9, fontWeight: 950 }}>{t.label}</span>
             </button>
           ))}
        </div>

        {/* COL 2: SCANNER & ACTIVE FLOW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
           
           {!selectedMember ? (
             <div className="glass-card" style={{ minHeight: 400, padding: 0, position: 'relative', overflow: 'hidden', border: '1px solid var(--green-10)', background: 'radial-gradient(circle at center, #0a0f0d, #000)' }}>
                {activeTab === 'manual' ? (
                   <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, minHeight: 400 }}>
                    <Activity size={80} style={{ color: 'var(--neon-green)', opacity: 0.1, marginBottom: 30 }} />
                    <h3 style={{ fontSize: 20, fontWeight: 950, marginBottom: 24, letterSpacing: 1 }}>ESPERANDO REGISTRO</h3>
                    <div style={{ width: '100%', maxWidth: 450, position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={24} />
                        <input 
                          placeholder="BUSCAR ATLETA POR NOMBRE..." 
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSuccess(search, 'manual')}
                          style={{ width: '100%', padding: '24px 80px 24px 60px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, color: '#fff', fontSize: 18, fontWeight: 700, outline: 'none' }}
                        />
                        <button 
                          onClick={() => handleSuccess(search, 'manual')}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'var(--neon-green)', color: '#000', padding: '12px 20px', borderRadius: 16, fontWeight: 950, fontSize: 12, cursor: 'pointer' }}
                        >
                          BUSCAR
                        </button>
                        
                        {/* ── PREDICTIVE SUGGESTIONS HUB ── */}
                        {suggestions.length > 0 && (
                          <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid var(--green-20)', zIndex: 100, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                             {suggestions.map(s => (
                               <div 
                                 key={s.id} 
                                 onClick={() => handleSuccess(s, 'manual')}
                                 style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}
                                 className="suggestion-item"
                               >
                                  <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                     <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-10)', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 950 }}>{s.name.slice(0,1)}</div>
                                     <div>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{s.name}</div>
                                        <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>PLAN: {s.plan.toUpperCase()}</div>
                                     </div>
                                  </div>
                                  <div style={{ fontSize: 10, fontWeight: 950, color: s.status === 'active' ? 'var(--neon-green)' : 'var(--danger-red)' }}>{s.status.toUpperCase()}</div>
                               </div>
                             ))}
                          </div>
                        )}
                    </div>
                   </div>
                ) : (
                  <div style={{ width: '100%', minHeight: 400, position: 'relative' }}>
                    {cameraStream ? (
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    ) : (
                        <div style={{ height: '100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--neon-green)', fontWeight:950, minHeight: 400, gap: 20 }}>
                           <RefreshCcw className="spinning" size={40} style={{ opacity: 0.5 }} />
                           <div>INICIALIZANDO CÁMARA...</div>
                        </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 30, left: 30, right: 30, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', padding: 20, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 950 }}>{status === 'complete' ? 'IDENTIDAD CONFIRMADA' : `ANALIZANDO ${activeTab.toUpperCase()}...`}</span>
                          <span style={{ fontSize: 13, fontWeight: 950 }}>{Math.round(progress)}%</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--neon-green)', transition: '0.1s ease-out' }} />
                        </div>
                    </div>
                  </div>
                )}
             </div>
           ) : (
             /* ── FOCUS CLIENT CARD COMPACT v4.1 ── */
             <div className="glass-card" style={{ minHeight: 450, padding: '15px 20px', border: `1px solid ${selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--green-20)'}`, background: 'rgba(0,0,0,0.6)', position: 'relative', animation: 'slideIn 0.3s ease-out', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                   <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--green-10)', border: '1px solid var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 950, color: 'var(--neon-green)' }}>{selectedMember.name.slice(0,1)}</div>
                      <div>
                         <h3 style={{ fontSize: 18, fontWeight: 950, color: '#fff' }}>{selectedMember.name}</h3>
                         <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--neon-green)' }}>{selectedMember.plan.toUpperCase()} · ID: #{selectedMember.id}</div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setShowProfile(true)} style={{ background: 'var(--green-10)', border: '1px solid var(--green-20)', color: 'var(--neon-green)', padding: '6px 12px', borderRadius: 8, fontSize: 9, fontWeight: 950, cursor: 'pointer', display:'flex', alignItems:'center', gap:5 }}><Eye size={12}/> PERFIL</button>
                      <button 
                         onClick={() => {
                            const obs = prompt(`Razón de SALIDA ADMINISTRATIVA para ${selectedMember.name}:`, 'Solicitud del cliente');
                            if (obs !== null) {
                              setActiveMembers(prev => prev.filter(am => String(am.id) !== String(selectedMember.id)));
                              setLogs(prev => [{ 
                                id: Date.now(), 
                                name: selectedMember.name, 
                                action: 'SALIDA ADMIN', 
                                time: new Date().toLocaleTimeString().slice(0,5), 
                                method: 'manual', 
                                color: 'var(--warning-yellow)',
                                note: obs 
                              }, ...prev]);
                              setSelectedMember(null);
                            }
                         }}
                         style={{ background: 'rgba(255,150,0,0.1)', border: '1px solid rgba(255,150,0,0.2)', color: 'var(--warning-yellow)', padding: '6px 12px', borderRadius: 8, fontSize: 9, fontWeight: 950, cursor: 'pointer' }}
                       >
                          SALIDA
                       </button>
                      <button onClick={() => { setSelectedMember(null); setPosMode(false); }} style={{ background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.2)', color: 'var(--danger-red)', padding: '6px 12px', borderRadius: 8, fontSize: 9, fontWeight: 950, cursor: 'pointer' }}>CERRAR</button>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 15 }}>
                    <div style={{ padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                       <div style={{ fontSize: 7, fontWeight: 950, color: 'var(--text-muted)' }}>VENCIMIENTO</div>
                       <div style={{ fontSize: 10, fontWeight: 950 }}>{selectedMember.expiryDate}</div>
                    </div>
                    <div style={{ padding: 8, background: selectedMember.debt > 0 ? 'rgba(255,61,87,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                       <div style={{ fontSize: 7, fontWeight: 950, color: 'var(--text-muted)' }}>DEUDA</div>
                       <div style={{ fontSize: 10, fontWeight: 950, color: selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--neon-green)' }}>${selectedMember.debt.toLocaleString()}</div>
                    </div>
                    <div style={{ padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <div style={{ fontSize: 7, fontWeight: 950, color: 'var(--text-muted)' }}>BIOMETRÍA</div>
                        <div style={{ fontSize: 10, fontWeight: 950, color: selectedMember.biometricStatus === 'completed' ? 'var(--neon-green)' : 'var(--danger-red)' }}>{selectedMember.biometricStatus === 'completed' ? 'OK ✓' : 'FALTA ⚠'}</div>
                     </div>
                     <div style={{ padding: 8, background: 'rgba(0,255,136,0.03)', borderRadius: 10, border: '1px solid rgba(0,255,136,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: 7, fontWeight: 950, color: 'var(--neon-green)' }}>OBJETIVO</div>
                        <div style={{ fontSize: 10, fontWeight: 950 }}>{selectedMember.objective?.slice(0,12) || '--'}</div>
                     </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 15, flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                       <div>
                          <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--neon-green)', marginBottom: 8, letterSpacing: 1 }}>SERVICIOS RÁPIDOS</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                             <button onClick={() => addToCart({ id: 'srv_dia', name: 'DÍA GYM', price: 10000, category: 'Servicio' })} style={{ padding: '10px 5px', borderRadius: 10, background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)', color: '#fff', fontSize: 9, fontWeight: 950, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                                <span>🏋️ DÍA</span><span style={{color:'var(--neon-green)'}}>$10k</span>
                             </button>
                             <button onClick={() => addToCart({ id: 'srv_sem', name: 'SEMANA', price: 25000, category: 'Servicio' })} style={{ padding: '10px 5px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: 9, fontWeight: 950, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                                <span>🗓️ SEM</span><span style={{color:'var(--neon-green)'}}>$25k</span>
                             </button>
                             <button onClick={() => addToCart({ id: 'srv_mes', name: 'MES', price: 80000, category: 'Servicio' })} style={{ padding: '10px 5px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: 9, fontWeight: 950, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                                <span>💎 MES</span><span style={{color:'var(--neon-green)'}}>$80k</span>
                             </button>
                          </div>
                       </div>
                        <div style={{ flex: 1, display:'flex', flexDirection:'column', position:'relative' }}>
                           <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>PRODUCTOS / INVENTARIO</div>
                           <div style={{ position:'relative' }}>
                              <Search size={14} style={{ position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)', opacity:0.5 }} />
                              <input 
                                placeholder="Buscar suplemento, agua..."
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                style={{ width:'100%', padding: '12px 12px 12px 35px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 11, outline:'none', transition:'0.3s' }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--neon-green)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                              />

                              {/* ── DROPDOWN INTELIGENTE DE PRODUCTOS ── */}
                              {productSearch.length > 0 && (
                                <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'rgba(10,15,13,0.98)', backdropFilter: 'blur(20px)', borderRadius: 16, border: '1px solid var(--green-20)', zIndex: 100, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', maxHeight: 250, overflowY: 'auto' }}>
                                   {products
                                     .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                     .map(p => (
                                       <div 
                                         key={p.id}
                                         onClick={() => { addToCart(p); setProductSearch(''); }}
                                         style={{ padding: '12px 15px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}
                                         className="suggestion-item"
                                       >
                                         <div style={{ display:'flex', flexDirection:'column' }}>
                                            <span style={{ fontSize: 11, fontWeight: 800 }}>{p.name}</span>
                                            <span style={{ fontSize: 8, color:'var(--text-muted)' }}>{p.category} · Stock: {p.stock || 0}</span>
                                         </div>
                                         <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
                                            <span style={{ color:'var(--neon-green)', fontSize: 11, fontWeight: 950 }}>${p.sellPrice.toLocaleString()}</span>
                                            <span style={{ fontSize: 7, color:'var(--text-muted)' }}>CLIC PARA AGREGAR</span>
                                         </div>
                                       </div>
                                     ))}
                                   {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                      <div style={{ padding: 20, textAlign:'center', color:'var(--text-muted)', fontSize:11 }}>Sin coincidencias</div>
                                   )}
                                </div>
                              )}
                           </div>
                           
                           {/* Espacio informativo cuando no hay búsqueda activa */}
                           {productSearch.length === 0 && (
                             <div style={{ marginTop: 10, padding: 15, background:'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 8, flex: 1 }}>
                                <ShoppingBag size={24} style={{ opacity:0.1 }} />
                                <span style={{ fontSize: 9, color:'var(--text-muted)', textAlign:'center' }}>Usa el buscador para añadir productos al carrito</span>
                             </div>
                           )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', background:'rgba(0,0,0,0.3)', borderRadius: 16, padding: 15, border: '1px solid rgba(255,255,255,0.05)' }}>
                       <div style={{ flex: 1, overflowY: 'auto' }}>
                          {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8, background:'rgba(255,255,255,0.02)', padding: 8, borderRadius: 8 }}>
                               <div style={{ fontSize: 10 }}><span style={{ color:'var(--neon-green)', fontWeight:950, marginRight:5 }}>{item.qty}x</span>{item.name}</div>
                               <button onClick={() => removeFromCart(item.id)} style={{ background:'none', border:'none', color:'var(--danger-red)', cursor:'pointer' }}><X size={14}/></button>
                            </div>
                          ))}
                       </div>
                       <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 10 }}>
                             {['Efectivo', 'Nequi', 'Crédito'].map(m => (
                               <button key={m} onClick={() => { setPaymentMethod(m as any); if (m !== 'Efectivo') setCashReceived(''); }} style={{ padding: 6, borderRadius: 6, background: paymentMethod === m ? 'var(--green-10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${paymentMethod === m ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`, color: paymentMethod === m ? 'var(--neon-green)' : 'var(--text-muted)', fontSize: 8, fontWeight: 950, cursor:'pointer' }}>{m.toUpperCase()}</button>
                             ))}
                          </div>

                          {paymentMethod === 'Efectivo' && (
                             <div 
                               style={{ 
                                 marginBottom: 10, background:'rgba(255,255,255,0.03)', borderRadius:12, padding:12, 
                                 border: `1px solid ${Number(cashReceived) >= cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0) && cart.length > 0 ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`,
                                 boxShadow: Number(cashReceived) >= cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0) && cart.length > 0 ? '0 0 15px rgba(0,255,136,0.1)' : 'none',
                                 transition: '0.3s'
                               }}
                             >
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                                   <span style={{ fontSize: 9, color:'var(--text-muted)', fontWeight:950 }}>RECIBIDO:</span>
                                   <div style={{ position:'relative' }}>
                                      <span style={{ position:'absolute', left:-10, color:'var(--neon-green)', fontWeight:950 }}>$</span>
                                      <input 
                                        type="number" 
                                        placeholder="0"
                                        value={cashReceived}
                                        onChange={e => setCashReceived(e.target.value)}
                                        style={{ width: 80, background: 'none', border: 'none', borderBottom: '1px solid var(--neon-green)', color: '#fff', fontSize: 14, fontWeight: 950, textAlign: 'right', outline: 'none' }}
                                      />
                                   </div>
                                </div>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                   <span style={{ fontSize: 9, color:'var(--text-muted)', fontWeight:950 }}>CAMBIO:</span>
                                   <span 
                                     style={{ fontSize: 18, fontWeight: 950, color: 'var(--neon-green)' }}
                                   >
                                      ${Math.max(0, (Number(cashReceived) || 0) - cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0)).toLocaleString()}
                                   </span>
                                </div>
                             </div>
                          )}

                          <button 
                             onClick={() => { handleFinalizeSale(); setCashReceived(''); }} 
                             disabled={cart.length === 0} 
                             style={{ width:'100%', padding:12, borderRadius:12, background: cart.length > 0 ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)', color:'#000', border:'none', fontWeight: 950, fontSize:12, cursor:'pointer', boxShadow: cart.length > 0 ? '0 0 20px rgba(0,255,136,0.2)' : 'none' }}
                          >
                             FINALIZAR: ${cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0).toLocaleString()}
                          </button>
                       </div>
                    </div>
                </div>
             </div>
           )}

           {showProfile && selectedMember && (
             <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div className="glass-card" style={{ maxWidth: 560, width: '100%', border: '1px solid var(--green-20)', maxHeight: '90vh', overflowY: 'auto' }}>
                   {/* ── HEADER EXPEDIENTE ── */}
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                      <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                         <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--green-10)', border: '2px solid var(--neon-green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 26, fontWeight:950, color:'var(--neon-green)', position:'relative' }}>
                           {selectedMember.name.slice(0,1)}
                           {/* Semáforo de salud */}
                           {selectedMember.injuries && String(selectedMember.injuries).trim().length > 0 && (
                             <div style={{ position:'absolute', top:-6, right:-6, width:18, height:18, borderRadius:'50%', background:'var(--danger-red)', border:'2px solid #000', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <AlertCircle size={10} color="#fff" />
                              </div>
                            )}
                          </div>
                         <div>
                            <h2 style={{ fontSize: 22, fontWeight:950, color:'#fff' }}>{selectedMember.name}</h2>
                            <div style={{ color:'var(--neon-green)', fontWeight:900, fontSize: 10 }}>🏋️ ATLETA {selectedMember.plan.toUpperCase()} · ID #{selectedMember.id}</div>
                          </div>
                       </div>
                       <button onClick={() => setShowProfile(false)} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', padding: 4 }}><X size={24}/></button>
                    </div>
                    {selectedMember.injuries && selectedMember.injuries.length > 0 && (() => {
                      const injList: string[] = Array.isArray(selectedMember.injuries)
                        ? (selectedMember.injuries as string[])
                        : String(selectedMember.injuries).split(',').filter(Boolean);
                      return injList.length > 0 ? (
                        <div style={{ background:'rgba(255,61,87,0.06)', padding: '12px 16px', borderRadius: 12, border:'1px solid rgba(255,61,87,0.2)', marginBottom: 10 }}>
                           <div style={{ display:'flex', gap: 8, alignItems:'center', marginBottom: 8 }}>
                             <HeartPulse size={14} style={{ color:'var(--danger-red)' }} />
                             <span style={{ fontSize: 9, fontWeight:950, color:'var(--danger-red)' }}>LESIONES ACTIVAS</span>
                           </div>
                           <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
                             {injList.map((inj, i) => (
                               <span key={i} style={{ fontSize: 9, background:'rgba(255,61,87,0.1)', color:'var(--danger-red)', border:'1px solid rgba(255,61,87,0.2)', padding:'4px 10px', borderRadius:20, fontWeight:800 }}>{inj.trim()}</span>
                             ))}
                           </div>
                        </div>
                      ) : null;
                    })()}

                   {/* ── GRID 4 COLS — DATOS CLAVE ── */}
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                      {[
                        { label: 'PLAN',        val: selectedMember.plan,                    icon: <Star size={12}/>,        color: 'var(--neon-green)' },
                        { label: 'VENCIMIENTO', val: selectedMember.expiryDate,              icon: <Calendar size={12}/>,    color: selectedMember.status === 'expired' ? 'var(--danger-red)' : '#fff' },
                        { label: 'ESTADO',      val: selectedMember.status.toUpperCase(),    icon: <CheckCircle2 size={12}/>, color: selectedMember.status === 'active' ? 'var(--neon-green)' : 'var(--danger-red)' },
                        { label: 'DEUDA',       val: `$${selectedMember.debt.toLocaleString()}`, icon: <DollarSign size={12}/>, color: selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--neon-green)' },
                      ].map(row => (
                        <div key={row.label} style={{ background:'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 12, border:'1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display:'flex', gap:5, alignItems:'center', fontSize: 8, color:'var(--text-muted)', marginBottom: 5, fontWeight:950 }}>{row.icon}{row.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: row.color }}>{row.val}</div>
                        </div>
                      ))}
                   </div>

                   {/* ── OBJETIVO ── */}
                   <div style={{ background:'rgba(0,255,136,0.04)', padding: '12px 16px', borderRadius: 12, border:'1px solid rgba(0,255,136,0.1)', marginBottom: 10, display:'flex', gap: 10, alignItems:'center' }}>
                      <Dumbbell size={16} style={{ color:'var(--neon-green)', flexShrink:0 }} />
                      <div>
                        <div style={{ fontSize: 8, color:'var(--text-muted)', fontWeight:950, marginBottom: 3 }}>OBJETIVO DE ENTRENAMIENTO</div>
                        <div style={{ fontSize: 12, fontWeight: 800 }}>{selectedMember.objective || 'Sin definir'}</div>
                      </div>
                   </div>

                   {/* ── CONTACTO ── */}
                   <div style={{ background:'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 12, border:'1px solid rgba(255,255,255,0.05)', marginBottom: 10 }}>
                      <div style={{ fontSize: 9, fontWeight:950, color:'var(--text-muted)', marginBottom: 10 }}>INFORMACIÓN DE CONTACTO</div>
                      <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
                        {selectedMember.phone && (
                          <div style={{ display:'flex', gap: 10, alignItems:'center', fontSize: 11 }}>
                            <Phone size={12} style={{ color:'var(--text-muted)' }} />
                            <span style={{ fontWeight:700 }}>{selectedMember.phone}</span>
                          </div>
                        )}
                        {selectedMember.email && (
                          <div style={{ display:'flex', gap: 10, alignItems:'center', fontSize: 11 }}>
                            <Mail size={12} style={{ color:'var(--text-muted)' }} />
                            <span style={{ fontWeight:700 }}>{selectedMember.email}</span>
                          </div>
                        )}
                        {(selectedMember as any).emergencyContact && (
                          <div style={{ display:'flex', gap: 10, alignItems:'center', fontSize: 11 }}>
                            <Contact size={12} style={{ color:'var(--warning-yellow)', flexShrink:0 }} />
                            <span style={{ fontWeight:700, color:'var(--warning-yellow)' }}>Emergencia: {(selectedMember as any).emergencyContact}</span>
                          </div>
                        )}
                      </div>
                   </div>

                   {/* ── HISTORIAL DE VISITAS ── */}
                   <div style={{ background:'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 12, border:'1px solid rgba(255,255,255,0.05)', marginBottom: 16 }}>
                      <div style={{ fontSize: 9, fontWeight:950, color:'var(--text-muted)', marginBottom: 8 }}>ÚLTIMA VISITA REGISTRADA</div>
                      <div style={{ fontSize: 11, fontWeight:800 }}>
                        {selectedMember.lastVisit ? new Date(selectedMember.lastVisit).toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : 'Sin registro'}
                      </div>
                   </div>

                   <button onClick={() => setShowProfile(false)} style={{ width:'100%', padding:15, borderRadius:12, background:'var(--neon-green)', color:'#000', border:'none', fontWeight:950, fontSize:12, cursor:'pointer', letterSpacing:1 }}>CERRAR EXPEDIENTE 360°</button>
                </div>
             </div>
           )}

           {/* Live Flow Athletes Monitoring (Pestañas Expandibles v4.1) */}
           <div style={{ height: 280, display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 15, marginTop: 10 }}>
              {activeMembers.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => {
                     const master = members?.find(mMaster => 
                       String(mMaster.id) === String(m.id) || 
                       mMaster.name?.trim().toLowerCase() === m.name?.trim().toLowerCase()
                     );
                     if (master) {
                        setSelectedMember(master);
                     } else {
                        // Fallback: Si no está en la DB global, crear objeto temporal para permitir ver la ficha
                        setSelectedMember({
                           id: String(m.id),
                           name: m.name,
                           status: m.membershipStatus,
                           expiryDate: '2026-12-31', // Fecha estimada si es mock
                           debt: 0,
                           lastVisit: new Date().toISOString(),
                           plan: m.plan,
                           phone: '3000000000',
                           color: m.color,
                           biometricStatus: 'completed',
                           objective: 'Mantener forma'
                        } as any);
                     }
                   }}
                  className="glass-card" 
                  style={{ minWidth: 260, padding: 15, border: `1px solid ${m.membershipStatus === 'expired' ? 'var(--danger-red)' : 'rgba(255,255,255,0.1)'}`, background: `linear-gradient(135deg, ${m.color}08, transparent)`, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: '0.3s' }}
                >
                   <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}15`, border: `1px solid ${m.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, color: m.color, fontSize: 14 }}>{m.initials}</div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{m.name}</div>
                         <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800 }}>{m.plan}</div>
                      </div>
                      <div style={{ padding: '4px 8px', borderRadius: 8, background: m.membershipStatus === 'expired' ? 'rgba(255,61,87,0.1)' : 'rgba(0,255,136,0.1)', color: m.membershipStatus === 'expired' ? 'var(--danger-red)' : 'var(--neon-green)', fontSize: 8, fontWeight: 950 }}>
                         {m.membershipStatus === 'active' ? 'ACTIVO' : 'DEUDA'}
                      </div>
                   </div>
                   <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                         <span style={{ color: 'var(--text-muted)' }}>Ingreso:</span>
                         <span style={{ fontWeight: 800 }}>{new Date(m.checkedInAt).toLocaleTimeString().slice(0,5)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                         <span style={{ color: 'var(--text-muted)' }}>En Sala:</span>
                         <span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>{fmtTime(Math.floor((Date.now() - m.checkedInAt) / 1000))}</span>
                      </div>
                   </div>
                   <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedMember(members?.find(master => master.id === m.id.toString()) || null); }}
                        style={{ flex: 1, padding: 8, borderRadius: 8, background: 'var(--green-10)', border: '1px solid var(--green-20)', color: 'var(--neon-green)', fontSize: 9, fontWeight: 950, cursor: 'pointer' }}
                      >
                         ABRIR FICHA
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const obs = prompt(`¿Por qué marcas salida de ${m.name}? (Sin cobro)`, 'Error de registro');
                          if (obs !== null) {
                            setActiveMembers(prev => prev.filter(am => am.id !== m.id));
                            setLogs(prev => [{ 
                              id: Date.now(), 
                              name: m.name, 
                              action: 'SALIDA (S.C)', 
                              time: new Date().toLocaleTimeString().slice(0,5), 
                              method: 'manual', 
                              color: 'var(--danger-red)',
                              note: obs 
                            }, ...prev]);
                          }
                        }}
                        style={{ padding: 8, borderRadius: 8, background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.2)', color: 'var(--danger-red)', fontSize: 9, fontWeight: 950, cursor: 'pointer' }}
                      >
                         <LogOut size={12} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* COL 3: INTELLIGENCE FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                 <span style={{ fontSize: 11, fontWeight: 950, letterSpacing: 2, color: 'var(--text-muted)' }}>REGISTRO DE AUDITORÍA</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 12, fontFamily: 'monospace' }}>
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

      <style>{`
        @keyframes spinning { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spinning 2s linear infinite; }
        @keyframes slideIn { from { transform: translateY(30px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        .reception-layout-grid { display: grid; grid-template-columns: 100px 1fr 350px; gap: 20; height: calc(100vh - 250px); }
        .sensor-btn:hover { background: var(--green-5) !important; border-color: var(--neon-green) !important; }
        .suggestion-item:hover { background: rgba(0,255,136,0.05) !important; }
      `}</style>
    </div>
  );
}
