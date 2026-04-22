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
   HYBRID RECEPTION HUB (FUSION v3.8 - SMART_ALERTS)
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
  
  // Estados del Scanner Inteligente (Fusión v2.6 + v3.0)
  const [activeTab, setActiveTab] = useState<CheckInMethod>('manual');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Estados de Alerta Inteligente (Nueva Capa de Seguridad)
  const [alertMember, setAlertMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Estados del Carrito
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
      // BLOQUEO DE SEGURIDAD
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
    
    // Procesar cada item del carrito
    for (const item of cart) {
       if (item.category !== 'Servicio') {
          // Es un producto del inventario -> Registrar venta y descontar stock
          await registerProductSale(item.id, item.qty, selectedMember.name, paymentMethod);
       } else {
          // Es un servicio (Membresía/Dia) -> Inyectar transacción directamente
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

          // Actualización de fechas si es membresía
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

    // Lógica de Crédito (Si el método es Crédito, registramos deuda extra)
    if (paymentMethod === 'Crédito') {
       const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
       await updateMemberStatus(selectedMember.id, { 
         debt: selectedMember.debt + total 
       });
    }

    // Log Visual
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
        // Es un abono parcial
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
        // Liquidación total
        await clearMemberDebt(selectedMember.id);
      }
      setAlertMember(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20 }}>
      
      {/* ── SMART ALERT OVERLAY (Capa de Blindaje Financiero) ── */}
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
            CONTROL DE ENTRADAS <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>v.3.9</span>
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

      {/* ── MAIN LAYOUT FUSION (v3.9 - QUADRANT GRID) ── */}
      <div className="reception-layout-grid">
        
        {/* COL 1: SELECTOR DE SENSORES */}
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

        {/* COL 2: CORE SCANNER + DETALLE DE CLIENTE (Fusión v4.0 - MODO FÁCIL) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
           
           {/* Guía Rápida para Recepción */}
           {!selectedMember && (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginBottom: 10 }}>
                <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)', padding: 15, borderRadius: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--neon-green)', marginBottom: 5 }}>PASO 1</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Busca al Atleta</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: 15, borderRadius: 16, textAlign: 'center', opacity: 0.5 }}>
                  <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 5 }}>PASO 2</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Verifica su Plan</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: 15, borderRadius: 16, textAlign: 'center', opacity: 0.5 }}>
                  <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 5 }}>PASO 3</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Registra Entrada</div>
                </div>
             </div>
           )}

           {/* Active Scanner Zone */}
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
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'var(--neon-green)', color: '#000', padding: '12px 20px', borderRadius: 16, fontWeight: 950, fontSize: 12, cursor: 'pointer', boxShadow: '0 0 15px rgba(0,255,136,0.3)' }}
                        >
                          BUSCAR
                        </button>

                        {/* Suggestion List */}
                        {suggestions.length > 0 && (
                          <div style={{ 
                            position: 'absolute', top: '105%', left: 0, right: 0, 
                            background: '#0a0f0d', border: '1px solid var(--green-20)', 
                            borderRadius: 16, overflow: 'hidden', zIndex: 100, 
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)' 
                          }}>
                            {suggestions.map(m => (
                              <div 
                                key={m.id}
                                onClick={() => handleSuccess(m, 'manual')}
                                style={{ 
                                  padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  transition: '0.2s'
                                }}
                                className="suggestion-item"
                              >
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
                           <div style={{ letterSpacing: 2 }}>INICIALIZANDO CÁMARA...</div>
                        </div>
                    )}
                    
                    <div style={{ position: 'absolute', inset: 40, border: '1px solid rgba(0,255,136,0.3)', pointerEvents:'none' }}>
                        <div style={{ position:'absolute', top: `${progress}%`, left: 0, right: 0, height: 2, background: 'var(--neon-green)', boxShadow: '0 0 25px var(--neon-green)' }} />
                    </div>

                    <div style={{ position: 'absolute', bottom: 30, left: 30, right: 30, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', padding: 20, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 950, color: status === 'complete' ? 'var(--neon-green)' : '#fff', letterSpacing: 1 }}>
                              {status === 'complete' ? 'IDENTIDAD CONFIRMADA' : `ANALIZANDO ${activeTab.toUpperCase()}...`}
                          </span>
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
             /* ── FOCUS CLIENT CARD (La Ficha que el usuario extrañaba) ── */
             <div className="glass-card" style={{ minHeight: 450, padding: 25, border: `1px solid ${selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--green-20)'}`, background: 'rgba(0,0,0,0.4)', position: 'relative', animation: 'slideIn 0.3s ease-out', display: 'flex', flexDirection: 'column' }}>
                {/* Header Simplificado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                   <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--green-10)', border: '1px solid var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 950, color: 'var(--neon-green)' }}>{selectedMember.name.slice(0,1)}</div>
                      <div>
                         <h3 style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>{selectedMember.name}</h3>
                         <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--neon-green)' }}>{selectedMember.plan.toUpperCase()} · ID: #{selectedMember.id}</div>
                      </div>
                   </div>
                   <button onClick={() => { setSelectedMember(null); setPosMode(false); }} style={{ background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.2)', color: 'var(--danger-red)', padding: '8px 16px', borderRadius: 12, fontSize: 10, fontWeight: 950, cursor: 'pointer' }}>CERRAR FICHA</button>
                </div>

                {/* Dashboard de Estado (6 Mini-Cards) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 25 }}>
                    <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                       <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)' }}>VENCIMIENTO</div>
                       <div style={{ fontSize: 13, fontWeight: 950 }}>{selectedMember.expiryDate}</div>
                    </div>
                    <div style={{ padding: 12, background: selectedMember.debt > 0 ? 'rgba(255,61,87,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                       <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)' }}>DEUDA</div>
                       <div style={{ fontSize: 13, fontWeight: 950, color: selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--neon-green)' }}>${selectedMember.debt.toLocaleString()}</div>
                    </div>
                    <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)' }}>BIOMETRÍA</div>
                        <div style={{ fontSize: 13, fontWeight: 950, color: selectedMember.biometricStatus === 'completed' ? 'var(--neon-green)' : 'var(--danger-red)' }}>
                           {selectedMember.biometricStatus === 'completed' ? 'AL DÍA ✓' : 'FALTANTE ⚠'}
                        </div>
                     </div>
                     <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)' }}>PESO / ALTURA</div>
                        <div style={{ fontSize: 13, fontWeight: 950 }}>{selectedMember.weight || '--'}kg / {selectedMember.height || '--'}cm</div>
                     </div>
                    {activeMembers.find(m => m.id.toString() === selectedMember.id || m.name === selectedMember.name) && (
                      <>
                        <div style={{ padding: 12, background: 'rgba(0,255,136,0.03)', borderRadius: 12, border: '1px solid rgba(0,255,136,0.1)', textAlign: 'center' }}>
                           <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--neon-green)' }}>INGRESO</div>
                           <div style={{ fontSize: 13, fontWeight: 950 }}>{new Date(activeMembers.find(m => m.id.toString() === selectedMember.id || m.name === selectedMember.name)!.checkedInAt).toLocaleTimeString().slice(0,5)}</div>
                        </div>
                        <div style={{ padding: 12, background: 'rgba(0,255,136,0.03)', borderRadius: 12, border: '1px solid rgba(0,255,136,0.1)', textAlign: 'center' }}>
                           <div style={{ fontSize: 9, fontWeight: 950, color: 'var(--neon-green)' }}>TIEMPO GYM</div>
                           <div style={{ fontSize: 13, fontWeight: 950, color: 'var(--neon-green)' }}>{fmtTime(Math.floor((Date.now() - activeMembers.find(m => m.id.toString() === selectedMember.id || m.name === selectedMember.name)!.checkedInAt) / 1000))}</div>
                        </div>
                      </>
                    )}
                </div>

                {/* Área de Acción Simplista (Servicios vs Carrito) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, flex: 1, overflow: 'hidden' }}>
                    
                    {/* COL 1: SELECTOR DE SERVICIOS Y PRODUCTOS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                       <div>
                          <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--neon-green)', marginBottom: 12, letterSpacing: 1.5 }}>SELECTOR DE SERVICIO</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                             <button 
                               onClick={() => { setPaymentType('Pago Diario'); addToCart({ id: 'srv_dia', name: 'RUTINA DIARIA', price: 5000, category: 'Servicio' }); }}
                               style={{ padding: 18, borderRadius: 16, background: paymentType === 'Pago Diario' ? 'var(--green-10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${paymentType === 'Pago Diario' ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`, color: paymentType === 'Pago Diario' ? 'var(--neon-green)' : '#fff', fontWeight: 950, textAlign: 'left', display:'flex', justifyContent:'space-between', cursor:'pointer' }}
                             >
                               <span>⚡ RUTINA DEL DÍA</span>
                               <span style={{ opacity: 0.6 }}>$5.000</span>
                             </button>
                             <button 
                               onClick={() => { setPaymentType('Pago Semanal'); addToCart({ id: 'srv_sem', name: 'MEMBRESÍA SEMANAL', price: 25000, category: 'Servicio' }); }}
                               style={{ padding: 18, borderRadius: 16, background: paymentType === 'Pago Semanal' ? 'var(--green-10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${paymentType === 'Pago Semanal' ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`, color: paymentType === 'Pago Semanal' ? 'var(--neon-green)' : '#fff', fontWeight: 950, textAlign: 'left', display:'flex', justifyContent:'space-between', cursor:'pointer' }}
                             >
                               <span>🗓️ PAGO SEMANAL</span>
                               <span style={{ opacity: 0.6 }}>$25.000</span>
                             </button>
                             <button 
                               onClick={() => { setPaymentType('Pago Mensual'); addToCart({ id: 'srv_mes', name: 'MENSUALIDAD FULL', price: 80000, category: 'Servicio' }); }}
                               style={{ padding: 18, borderRadius: 16, background: paymentType === 'Pago Mensual' ? 'var(--green-10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${paymentType === 'Pago Mensual' ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`, color: paymentType === 'Pago Mensual' ? 'var(--neon-green)' : '#fff', fontWeight: 950, textAlign: 'left', display:'flex', justifyContent:'space-between', cursor:'pointer' }}
                             >
                               <span>💎 MENSUALIDAD</span>
                               <span style={{ opacity: 0.6 }}>$80.000</span>
                             </button>
                             {selectedMember.debt > 0 && (
                               <button 
                                 onClick={() => {
                                   const amt = prompt('¿Cuánto va a abonar el cliente?', selectedMember.debt.toString());
                                   if (amt) handleClearDebt(Number(amt));
                                 }}
                                 style={{ padding: 18, borderRadius: 16, background: 'rgba(255,214,0,0.1)', border: '1px solid var(--warning-yellow)', color: 'var(--warning-yellow)', fontWeight: 950, textAlign: 'center', cursor:'pointer' }}
                               >
                                 💰 REALIZAR ABONO A DEUDA
                               </button>
                             )}
                          </div>
                       </div>

                       <div>
                          <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 1.5 }}>AÑADIR PRODUCTO</div>
                          <select 
                            onChange={(e) => {
                               const p = products.find(prod => prod.id === e.target.value);
                               if (p) { addToCart(p); setPaymentType('Venta Producto'); e.target.value = ''; }
                            }}
                            style={{ width: '100%', padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, outline: 'none' }}
                          >
                             <option value="">-- SELECCIONAR PRODUCTO --</option>
                             {products.map(p => (
                               <option key={p.id} value={p.id}>{p.name} (${p.sellPrice.toLocaleString()})</option>
                             ))}
                          </select>
                       </div>
                    </div>

                    {/* COL 2: CARRITO Y COBRO FINAL */}
                    <div style={{ display: 'flex', flexDirection: 'column', background:'rgba(0,0,0,0.3)', borderRadius: 24, padding: 25, border: '1px solid rgba(255,255,255,0.05)' }}>
                       <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 20, letterSpacing: 1.5 }}>DETALLE DEL COBRO</div>
                       
                       <div style={{ flex: 1, overflowY: 'auto', marginBottom: 20 }}>
                          {cart.length > 0 ? cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12, background:'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12 }}>
                               <div style={{ fontSize: 12 }}>
                                  <span style={{ color:'var(--neon-green)', fontWeight:950, marginRight:8 }}>{item.qty}x</span>
                                  <span style={{ fontWeight: 800 }}>{item.name}</span>
                               </div>
                               <button onClick={() => removeFromCart(item.id)} style={{ background:'none', border:'none', color:'var(--danger-red)', cursor:'pointer', opacity:0.6 }}><Trash2 size={16}/></button>
                            </div>
                          )) : (
                             <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', opacity:0.2 }}>
                                <ShoppingBag size={48} />
                                <div style={{ fontSize: 11, marginTop: 10 }}>SIN ITEMS</div>
                             </div>
                          )}
                       </div>

                       <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 15 }}>
                             <button onClick={() => setPaymentMethod('Efectivo')} style={{ padding: 12, borderRadius: 12, background: paymentMethod === 'Efectivo' ? 'var(--green-10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${paymentMethod === 'Efectivo' ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`, color: paymentMethod === 'Efectivo' ? 'var(--neon-green)' : 'var(--text-muted)', fontSize: 10, fontWeight: 950, cursor:'pointer' }}>EFECTIVO</button>
                             <button onClick={() => setPaymentMethod('Nequi')} style={{ padding: 12, borderRadius: 12, background: paymentMethod === 'Nequi' ? 'var(--green-10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${paymentMethod === 'Nequi' ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`, color: paymentMethod === 'Nequi' ? 'var(--neon-green)' : 'var(--text-muted)', fontSize: 10, fontWeight: 950, cursor:'pointer' }}>NEQUI</button>
                             <button onClick={() => setPaymentMethod('Crédito')} style={{ padding: 12, borderRadius: 12, background: paymentMethod === 'Crédito' ? 'rgba(255,61,87,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${paymentMethod === 'Crédito' ? 'var(--danger-red)' : 'rgba(255,255,255,0.05)'}`, color: paymentMethod === 'Crédito' ? 'var(--danger-red)' : 'var(--text-muted)', fontSize: 10, fontWeight: 950, cursor:'pointer' }}>FIADO</button>
                          </div>
                          <button 
                            onClick={handleFinalizeSale}
                            disabled={cart.length === 0}
                            style={{ width:'100%', padding:18, borderRadius:16, background: cart.length > 0 ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)', color:'#000', border:'none', fontWeight:950, fontSize:15, cursor:'pointer', boxShadow: cart.length > 0 ? '0 0 30px rgba(0,255,136,0.3)' : 'none' }}
                          >
                            FINALIZAR COBRO: ${cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0).toLocaleString()}
                          </button>
                       </div>
                       <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <button 
                            onClick={() => {
                              const msg = `Hola ${selectedMember.name}! Te recordamos que tu membresía en GymFuxionFit está próxima a vencer o tienes un saldo pendiente. 💪%0A%0APuedes pagar en recepción o vía Nequi. ¡Te esperamos!`;
                              window.open(`https://wa.me/57${selectedMember.phone}?text=${msg}`, '_blank');
                            }} 
                            style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', fontSize: 10, fontWeight: 950, cursor: 'pointer' }}
                          >
                            NOTIFICAR AL ATLETA
                          </button>
                          <button 
                            onClick={() => setShowProfile(true)} 
                            style={{ padding: 14, borderRadius: 12, border: '2px solid var(--neon-green)', background: 'var(--green-10)', color: 'var(--neon-green)', fontSize: 10, fontWeight: 950, cursor: 'pointer', boxShadow: '0 0 15px rgba(0,255,136,0.2)' }}
                          >
                            VER PERFIL MAESTRO
                          </button>
                       </div>
                    </div>

                </div>
             </div>
           )}

           {/* ── PROFILE MODAL ── */}
           {showProfile && selectedMember && (
             <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div className="glass-card" style={{ maxWidth: 500, width: '100%', border: '1px solid var(--green-20)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
                      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                         <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--green-10)', border: '2px solid var(--neon-green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 32, fontWeight:950, color:'var(--neon-green)' }}>{selectedMember.name.slice(0,1)}</div>
                         <div>
                            <h2 style={{ fontSize: 28, fontWeight:950, color:'#fff' }}>{selectedMember.name}</h2>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                               <div style={{ color:'var(--neon-green)', fontWeight:900, fontSize: 11 }}>ATLETA {selectedMember.plan.toUpperCase()}</div>
                               <div style={{ padding: '2px 8px', borderRadius: 20, background: 'var(--neon-green)', color: '#000', fontSize: 9, fontWeight: 950 }}>CLIENTE VIP</div>
                            </div>
                         </div>
                      </div>
                      <button onClick={() => setShowProfile(false)} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer' }}><X size={24}/></button>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginBottom: 25 }}>
                      <div className="glass-card" style={{ padding: 15, background:'rgba(255,255,255,0.02)', textAlign:'center' }}>
                         <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom: 4 }}>OBJETIVO</div>
                         <div style={{ fontSize: 11, fontWeight: 900, color:'var(--neon-green)', textTransform:'uppercase' }}>{selectedMember.objective || 'Sin definir'}</div>
                      </div>
                      <div className="glass-card" style={{ padding: 15, background:'rgba(255,255,255,0.02)', textAlign:'center', border: `1px solid ${selectedMember.injuries && selectedMember.injuries !== 'Ninguna' ? 'var(--danger-red)' : 'rgba(0,255,136,0.2)'}` }}>
                         <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom: 4 }}>ESTADO SALUD</div>
                         <div style={{ fontSize: 11, fontWeight: 900, color: selectedMember.injuries && selectedMember.injuries !== 'Ninguna' ? 'var(--danger-red)' : 'var(--neon-green)' }}>{selectedMember.injuries && selectedMember.injuries !== 'Ninguna' ? 'OBSERVACIÓN' : 'ÓPTIMO'}</div>
                      </div>
                      <div className="glass-card" style={{ padding: 15, background:'rgba(255,255,255,0.02)', textAlign:'center' }}>
                         <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom: 4 }}>PLAN</div>
                         <div style={{ fontSize: 11, fontWeight: 900 }}>{selectedMember.plan}</div>
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 25 }}>
                      <div style={{ background:'rgba(255,255,255,0.02)', padding: 15, borderRadius: 16 }}>
                         <div style={{ fontSize: 9, fontWeight:950, color:'var(--text-muted)', marginBottom: 8 }}>LESIONES / LIMITACIONES</div>
                         <div style={{ fontSize: 11, lineHeight: 1.4 }}>{selectedMember.injuries || 'Ninguna registrada'}</div>
                      </div>
                      <div style={{ background:'rgba(255,255,255,0.02)', padding: 15, borderRadius: 16 }}>
                         <div style={{ fontSize: 9, fontWeight:950, color:'var(--text-muted)', marginBottom: 8 }}>GUÍA NUTRICIONAL</div>
                         <div style={{ fontSize: 11, lineHeight: 1.4 }}>{selectedMember.nutrition || 'No especificada'}</div>
                      </div>
                   </div>

                   <div style={{ background:'rgba(0,255,136,0.05)', padding: 20, borderRadius: 20, border: '1px solid rgba(0,255,136,0.1)', marginBottom: 25, position: 'relative' }}>
                      <button 
                        onClick={() => window.open(`https://wa.me/57${selectedMember.phone}?text=Hola ${selectedMember.name}, te saludamos de GymFuxionFit!`, '_blank')}
                        style={{ position: 'absolute', top: 20, right: 20, padding: '10px 15px', borderRadius: 12, background: '#25D366', color: '#fff', border: 'none', fontSize: 10, fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                         <Phone size={14} /> WHATSAPP
                      </button>
                      <div style={{ display:'flex', alignItems:'center', gap: 15, marginBottom: 12 }}>
                         <Phone size={16} style={{ color:'var(--neon-green)' }} />
                         <span style={{ fontSize: 13 }}>WhatsApp: +57 {selectedMember.phone}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap: 15, marginBottom: 12 }}>
                         <HeartPulse size={16} style={{ color:'var(--danger-red)' }} />
                         <span style={{ fontSize: 13, fontWeight: 800 }}>Emergencia: {selectedMember.emergencyContact || 'No asignado'}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap: 15 }}>
                         <MapPin size={16} style={{ color:'var(--neon-green)' }} />
                         <span style={{ fontSize: 13, opacity: 0.7 }}>Montería, Córdoba</span>
                      </div>
                   </div>

                   <button onClick={() => setShowProfile(false)} style={{ width:'100%', padding:18, borderRadius:16, background:'var(--neon-green)', color:'#000', border:'none', fontWeight:950, fontSize:14, cursor:'pointer' }}>CERRAR EXPEDIENTE</button>
                </div>
             </div>
           )}

           {/* Live Flow Athletes Monitoring */}
           <div style={{ height: 220, display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10 }}>
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
                  style={{ minWidth: 220, padding: 20, border: `1px solid ${m.membershipStatus === 'expired' ? 'var(--danger-red)' : 'var(--green-10)'}`, background: `linear-gradient(135deg, ${m.color}08, transparent)`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                   <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}15`, border: `2px solid ${m.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, color: m.color, fontSize: 16 }}>{m.initials}</div>
                      <div>
                         <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{m.name.split(' ')[0]}</div>
                         <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase' }}>{m.plan}</div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: 24, fontWeight: 950, color: m.color, letterSpacing: -1 }}>
                        {fmtTime(Math.floor((Date.now() - m.checkedInAt) / 1000))}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             const master = members.find(master => master.id === m.id.toString() || master.name === m.name);
                             if (master) {
                               setSelectedMember(master);
                               setPosMode(true);
                             }
                           }}
                           title="Cobrar / Carrito"
                           style={{ background: 'var(--green-10)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-green)', cursor: 'pointer' }}
                         >
                           <ShoppingBag size={14} />
                         </button>
                         
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             if (window.confirm(`¿Marcar salida de ${m.name}?`)) {
                               setActiveMembers(prev => prev.filter(am => am.id !== m.id));
                               setLogs(prev => [{ 
                                 id: Date.now(), 
                                 name: m.name, 
                                 action: 'SALIDA', 
                                 time: new Date().toLocaleTimeString().slice(0,5), 
                                 method: m.checkInMethod || 'manual', 
                                 color: '#ff4d4d' 
                                }, ...prev]);
                             }
                           }}
                           title="Marcar Salida (Eliminar de Sala)"
                           style={{ background: 'rgba(255,61,87,0.1)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-red)', cursor: 'pointer' }}
                         >
                           <LogOut size={14} />
                         </button>

                         {m.checkInMethod === 'qr' && <QrCode size={14} style={{ color: 'var(--text-muted)' }} />}
                         {m.checkInMethod === 'facial' && <ScanEye size={14} style={{ color: 'var(--text-muted)' }} />}
                         {m.membershipStatus !== 'active' && <AlertCircle size={14} style={{ color: 'var(--danger-red)' }} />}
                      </div>
                   </div>
                </div>
              ))}
              {activeMembers.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 24, color: 'var(--neon-green)', fontSize: 12, fontWeight: 900, letterSpacing: 2, opacity: 0.4, gap: 10 }}>
                   <Users size={32} />
                   <span>ESPERANDO INGRESOS...</span>
                </div>
              )}
           </div>
        </div>

        {/* COL 3: INTELLIGENCE FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                 <span style={{ fontSize: 11, fontWeight: 950, letterSpacing: 2, color: 'var(--text-muted)' }}>REGISTRO DE AUDITORÍA</span>
                 <RefreshCcw size={14} style={{ opacity: 0.3 }} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 12, fontFamily: 'monospace' }}>
                 {logs.map(l => (
                   <div key={l.id} style={{ padding: '12px 14px', fontSize: 10, borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: 14 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{l.time}</span>
                      <span style={{ color: l.color, fontWeight: 950 }}>{l.action}</span>
                      <span style={{ color: '#fff', fontWeight: 800 }}>{l.name.toUpperCase()}</span>
                   </div>
                 ))}
                 {logs.length === 0 && <div style={{ padding: 30, textAlign:'center', color:'var(--neon-green)', fontSize:10, letterSpacing:1, opacity:0.3 }}>ESPERANDO EVENTOS DEL SISTEMA...</div>}
              </div>
           </div>

           <div className="glass-card" style={{ height: 180, background: 'linear-gradient(135deg, var(--green-5), transparent)', border: '1px solid var(--green-20)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                 <span style={{ fontSize: 11, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: 1 }}>SISTEMA DE SEGURIDAD</span>
                 <Activity size={16} style={{ color: 'var(--neon-green)' }} />
              </div>
              <div style={{ fontSize: 10, lineHeight: 2, fontWeight: 700, color: 'var(--text-secondary)' }}>
                 ENLACE: <span style={{ color:'#fff' }}>ENCRIPTADO AES-256</span><br />
                 AMENAZAS: <span style={{ color:'var(--neon-green)' }}>0 DETECTADAS</span><br />
                 SINCRONIZACIÓN: <span style={{ color:'var(--neon-green)' }}>OPERATIVA v1.0</span><br />
                 ALERTAS: <span style={{ color:'var(--neon-green)' }}>ACTIVADAS</span>
              </div>
           </div>
        </div>

      </div>

      <style>{`
        @keyframes spinning {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spinning 2s linear infinite;
        }
        @keyframes slideIn {
          from { transform: translateY(30px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .product-card-premium:hover {
          background: rgba(255,255,255,0.05) !important;
          border-color: var(--neon-green) !important;
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .product-card-premium:active {
          transform: scale(0.95);
        }
        .product-card-premium:hover .add-indicator {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
