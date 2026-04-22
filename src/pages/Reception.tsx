import { useState, useEffect, useRef } from 'react';
import {
  DollarSign, Search, AlertTriangle,
  CheckCircle2, CreditCard, Smartphone, Banknote,
  TrendingUp, Users, X, Plus, ShoppingBag,
  LogIn, LogOut, Eye, Phone, Mail, MapPin,
  Calendar, BarChart2, Trash2, MinusCircle,
  QrCode, ScanEye, Camera, ShieldCheck, Activity,
  Zap, Database, Map as MapIcon, RefreshCcw, User,
  AlertCircle, HeartPulse, ChevronRight
} from 'lucide-react';
import { useGymData, Member } from '../hooks/useGymData';

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
                        {suggestions.length > 0 && (
                          <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, background: '#0a0f0d', border: '1px solid var(--green-20)', borderRadius: 16, overflow: 'hidden', zIndex: 100 }}>
                            {suggestions.map(m => (
                              <div key={m.id} onClick={() => handleSuccess(m, 'manual')} className="suggestion-item" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <div>
                                   <div style={{ fontSize: 14, fontWeight: 800 }}>{m.name}</div>
                                   <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.plan} • {m.status.toUpperCase()}</div>
                                 </div>
                                 <ChevronRight size={16} color="var(--neon-green)" />
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
             <div className="glass-card" style={{ minHeight: 380, padding: '15px 20px', border: `1px solid ${selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--green-20)'}`, background: 'rgba(0,0,0,0.6)', position: 'relative', animation: 'slideIn 0.3s ease-out', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                   <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--green-10)', border: '1px solid var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 950, color: 'var(--neon-green)' }}>{selectedMember.name.slice(0,1)}</div>
                      <div>
                         <h3 style={{ fontSize: 18, fontWeight: 950, color: '#fff' }}>{selectedMember.name}</h3>
                         <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--neon-green)' }}>{selectedMember.plan.toUpperCase()} · ID: #{selectedMember.id}</div>
                      </div>
                   </div>
                   <button onClick={() => { setSelectedMember(null); setPosMode(false); }} style={{ background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.2)', color: 'var(--danger-red)', padding: '6px 12px', borderRadius: 8, fontSize: 9, fontWeight: 950, cursor: 'pointer' }}>CERRAR</button>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 15, flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                       <div>
                          <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--neon-green)', marginBottom: 8 }}>SERVICIOS</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                             <button onClick={() => addToCart({ id: 'srv_dia', name: 'DÍA DE GYM', price: 10000, category: 'Servicio' })} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: 10, fontWeight: 950, textAlign: 'left', display:'flex', justifyContent:'space-between', cursor:'pointer' }}>
                                <span>🏋️ DÍA GYM</span><span>$10k</span>
                             </button>
                             <button onClick={() => addToCart({ id: 'srv_mes', name: 'MENSUALIDAD', price: 80000, category: 'Servicio' })} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: 10, fontWeight: 950, textAlign: 'left', display:'flex', justifyContent:'space-between', cursor:'pointer' }}>
                                <span>💎 MES</span><span>$80k</span>
                             </button>
                          </div>
                       </div>
                       <div>
                          <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8 }}>PRODUCTOS</div>
                          <select onChange={(e) => { const p = products.find(prod => prod.id === e.target.value); if (p) { addToCart(p); e.target.value = ''; } }} style={{ width: '100%', padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 10, outline: 'none' }}>
                             <option value="">-- SELECCIONAR --</option>
                             {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
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
                               <button key={m} onClick={() => setPaymentMethod(m as any)} style={{ padding: 6, borderRadius: 6, background: paymentMethod === m ? 'var(--green-10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${paymentMethod === m ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`, color: paymentMethod === m ? 'var(--neon-green)' : 'var(--text-muted)', fontSize: 8, fontWeight: 950, cursor:'pointer' }}>{m.toUpperCase()}</button>
                             ))}
                          </div>
                          <button onClick={handleFinalizeSale} disabled={cart.length === 0} style={{ width:'100%', padding:10, borderRadius:10, background: cart.length > 0 ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)', color:'#000', border:'none', fontWeight: 950, fontSize:11, cursor:'pointer' }}>
                             COBRAR: ${cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0).toLocaleString()}
                          </button>
                       </div>
                    </div>
                </div>
             </div>
           )}

           {showProfile && selectedMember && (
             <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div className="glass-card" style={{ maxWidth: 500, width: '100%', border: '1px solid var(--green-20)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                      <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                         <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--green-10)', border: '2px solid var(--neon-green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 24, fontWeight:950, color:'var(--neon-green)' }}>{selectedMember.name.slice(0,1)}</div>
                         <div>
                            <h2 style={{ fontSize: 22, fontWeight:950, color:'#fff' }}>{selectedMember.name}</h2>
                            <div style={{ color:'var(--neon-green)', fontWeight:900, fontSize: 10 }}>ATLETA {selectedMember.plan.toUpperCase()}</div>
                         </div>
                      </div>
                      <button onClick={() => setShowProfile(false)} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer' }}><X size={24}/></button>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                      <div style={{ background:'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12 }}>
                         <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom: 4 }}>OBJETIVO</div>
                         <div style={{ fontSize: 11, fontWeight: 800 }}>{selectedMember.objective || 'Sin definir'}</div>
                      </div>
                      <div style={{ background:'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12 }}>
                         <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom: 4 }}>VENCIMIENTO</div>
                         <div style={{ fontSize: 11, fontWeight: 800 }}>{selectedMember.expiryDate}</div>
                      </div>
                   </div>
                   <button onClick={() => setShowProfile(false)} style={{ width:'100%', padding:15, borderRadius:12, background:'var(--neon-green)', color:'#000', border:'none', fontWeight:950, fontSize:12, cursor:'pointer' }}>CERRAR EXPEDIENTE</button>
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
                     if (master) setSelectedMember(master);
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
                      <button onClick={(e) => { e.stopPropagation(); setSelectedMember(members?.find(master => master.id === m.id.toString()) || null); }} style={{ flex: 1, padding: 8, borderRadius: 8, background: 'var(--green-10)', border: '1px solid var(--green-20)', color: 'var(--neon-green)', fontSize: 9, fontWeight: 950, cursor: 'pointer' }}>ABRIR FICHA</button>
                      <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Marcar salida de ${m.name}?`)) setActiveMembers(prev => prev.filter(am => am.id !== m.id)); }} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.2)', color: 'var(--danger-red)', fontSize: 9, fontWeight: 950, cursor: 'pointer' }}><LogOut size={12} /></button>
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
                   <div key={l.id} style={{ padding: '12px 14px', fontSize: 10, borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: 14 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{l.time}</span>
                      <span style={{ color: l.color, fontWeight: 950 }}>{l.action}</span>
                      <span style={{ color: '#fff', fontWeight: 800 }}>{l.name.toUpperCase()}</span>
                   </div>
                 ))}
              </div>
           </div>
           <div className="glass-card" style={{ height: 180, background: 'linear-gradient(135deg, var(--green-5), transparent)', border: '1px solid var(--green-20)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                 <span style={{ fontSize: 11, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: 1 }}>SISTEMA DE SEGURIDAD</span>
                 <Activity size={16} style={{ color: 'var(--neon-green)' }} />
              </div>
              <div style={{ fontSize: 10, lineHeight: 2, fontWeight: 700, color: 'var(--text-secondary)' }}>
                 ENLACE: <span style={{ color:'#fff' }}>ENCRIPTADO AES-256</span><br />
                 AMENAZAS: <span style={{ color:'var(--neon-green)' }}>0 DETECTADAS</span><br />
                 ALERTAS: <span style={{ color:'var(--neon-green)' }}>ACTIVADAS</span>
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
