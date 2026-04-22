import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Bell, CheckCircle2, X, Search, Zap, Receipt, ShieldCheck, Camera, Loader2, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NequiNotification {
  id: string;
  sender: string;
  amount: number;
  time: string;
  reference: string;
  status: 'incoming' | 'linked' | 'ignored';
}

interface NequiRadarProps {
  onLinkPayment: (amount: number, reference: string) => void;
  isExpecting?: boolean;
  expectedMemberName?: string;
  onCancelExpectation?: () => void;
}

export default function NequiRadar({ onLinkPayment, isExpecting, expectedMemberName, onCancelExpectation }: NequiRadarProps) {
  const [notifications, setNotifications] = useState<NequiNotification[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [showTimeoutAlert, setShowTimeoutAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lógica de Temporizador de Expectativa
  useEffect(() => {
    if (isExpecting) {
      setTimer(120); // 120 segundos (2 min) para recibir el pago
      setShowTimeoutAlert(false);
    } else {
      setTimer(null);
    }
  }, [isExpecting]);

  useEffect(() => {
    if (timer === null) return;
    if (timer <= 0) {
      setShowTimeoutAlert(true);
      setTimer(null);
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Simulación de notificaciones entrantes
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newNotif: NequiNotification = {
          id: 'NQ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          sender: 'NEQUI_USER_' + Math.floor(Math.random() * 9999),
          amount: [40000, 75000, 120000][Math.floor(Math.random() * 3)],
          time: new Date().toLocaleTimeString().slice(0, 5),
          reference: Math.floor(Math.random() * 1000000).toString(),
          status: 'incoming',
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 5));
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleLink = (notif: NequiNotification) => {
    onLinkPayment(notif.amount, notif.reference);
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, status: 'linked' } : n));
  };

  const handleIgnore = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'ignored' } : n));
  };

  const handleScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    // Simulación de procesamiento OCR Élite
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        amount: 120000,
        reference: '883492',
        date: '21 Abr 2026',
        confidence: 0.98
      });
    }, 3000);
  };

  return (
    <div className="glass-card" style={{ 
      padding: 24, 
      background: 'rgba(10, 15, 13, 0.98)', 
      border: '1px solid rgba(0, 255, 136, 0.2)',
      boxShadow: '0 0 40px rgba(0, 255, 136, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animación de fondo: Radar Pulse */}
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ 
          position: 'absolute', top: -50, right: -50, 
          width: 200, height: 200, borderRadius: '50%', 
          background: 'radial-gradient(circle, var(--neon-green) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} 
      />

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 38, height: 38, borderRadius: 12, 
            background: 'linear-gradient(135deg, #FF00FF 0%, #7000FF 100%)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)'
          }}>
            <Smartphone size={20} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 950, letterSpacing: 1.5, color: '#fff' }}>NEQUI_RADAR <span style={{ color: '#FF00FF' }}>PRO</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? 'var(--neon-green)' : 'var(--text-muted)', boxShadow: isLive ? '0 0 8px var(--neon-green)' : 'none' }} />
              <div style={{ fontSize: 9, color: isLive ? 'var(--neon-green)' : 'var(--text-muted)', fontWeight: 800 }}>
                {isLive ? '📡 SCANNING_NETWORK...' : 'SYSTEM_PAUSED'}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
           <button 
             onClick={() => setIsLive(!isLive)}
             style={{ 
               fontSize: 8, fontWeight: 950, padding: '6px 10px', borderRadius: 8,
               background: 'rgba(255,255,255,0.05)', color: isLive ? '#fff' : 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
             }}
           >
             {isLive ? 'SHUTDOWN' : 'BOOT'}
           </button>
        </div>
      </div>

      {/* SCANNING OVERLAY */}
      <AnimatePresence>
        {isExpecting && timer !== null && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ 
              background: 'rgba(255, 0, 255, 0.1)', border: '1px solid #FF00FF40', 
              padding: 12, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
          >
             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Loader2 className="animate-spin" size={14} color="#FF00FF" />
                <div style={{ fontSize: 10, fontWeight: 800 }}>
                   ESPERANDO PAGO DE: <span style={{ color: '#FF00FF' }}>{expectedMemberName?.toUpperCase()}</span>
                </div>
             </div>
             <div style={{ fontSize: 12, fontWeight: 950, color: '#FF00FF' }}>{timer}s</div>
          </motion.div>
        )}

        {showTimeoutAlert && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ 
              background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d40', 
              padding: 16, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12,
              boxShadow: '0 10px 30px rgba(255, 77, 77, 0.1)'
            }}
          >
             <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <AlertCircle size={20} color="#ff4d4d" />
                <div style={{ fontSize: 11, fontWeight: 950, color: '#ff4d4d' }}>TRANSACCIÓN NO DETECTADA</div>
             </div>
             <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                La notificación de Nequi no llegó a tiempo. Por favor, solicita al cliente 
                <span style={{ color: '#fff', fontWeight: 800 }}> {expectedMemberName} </span> 
                que cargue el comprobante de pago en su **Perfil de la App** para validación manual.
             </p>
             <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => { setShowTimeoutAlert(false); onCancelExpectation?.(); }}
                  style={{ flex: 1, padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: 9, fontWeight: 900, cursor: 'pointer' }}
                >
                  ENTENDIDO
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ flex: 1, padding: 8, borderRadius: 8, background: '#ff4d4d', border: 'none', color: '#fff', fontSize: 9, fontWeight: 950, cursor: 'pointer' }}
                >
                  ESCANEAR AHORA
                </button>
             </div>
          </motion.div>
        )}

        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', 
              backdropFilter: 'blur(10px)', zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16
            }}
          >
            <div style={{ position: 'relative' }}>
              <Loader2 className="animate-spin" size={48} color="var(--neon-green)" />
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', left: -10, right: -10, height: 2, background: 'var(--neon-green)', boxShadow: '0 0 10px var(--neon-green)', zIndex: 11 }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 950, letterSpacing: 2, color: 'var(--neon-green)' }}>ANALIZANDO_VOUCHER</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>EXTRAYENDO METADATOS POR IA...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATIONS LIST / RESULTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 180, zIndex: 1 }}>
        {scanResult ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            style={{ 
              padding: 20, borderRadius: 16, background: 'rgba(0,255,136,0.05)', 
              border: '1px solid var(--neon-green)40', display: 'flex', flexDirection: 'column', gap: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--neon-green)', marginBottom: 4 }}>VOUCHER_DETECTADO</div>
                <div style={{ fontSize: 24, fontWeight: 950 }}>${scanResult.amount.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>CONFIANZA_IA</div>
                <div style={{ fontSize: 12, fontWeight: 950, color: 'var(--neon-green)' }}>{(scanResult.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
               <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 2 }}>REFERENCIA</div>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>{scanResult.reference}</div>
               </div>
               <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 2 }}>FECHA</div>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>{scanResult.date}</div>
               </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
               <button 
                 onClick={() => setScanResult(null)}
                 style={{ flex: 1, padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: 10, fontWeight: 900, cursor: 'pointer' }}
               >
                 REINTENTAR
               </button>
               <button 
                 onClick={() => { onLinkPayment(scanResult.amount, scanResult.reference); setScanResult(null); }}
                 style={{ flex: 2, padding: 10, borderRadius: 10, background: 'var(--neon-green)', border: 'none', color: '#000', fontSize: 10, fontWeight: 950, cursor: 'pointer' }}
               >
                 CARGAR PAGO A SOCIO
               </button>
            </div>
          </motion.div>
        ) : notifications.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.2 }}>
            <div className="pulse-slow"><Bell size={32} /></div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>ESPERANDO_PAGOS_LIVE</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(notif => (
              <motion.div 
                key={notif.id} layout initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                style={{ 
                  padding: '14px 16px', borderRadius: 14, 
                  background: notif.status === 'linked' ? 'rgba(0,255,136,0.08)' : 'rgba(255, 0, 255, 0.05)',
                  border: `1px solid ${notif.status === 'linked' ? 'var(--neon-green)40' : 'rgba(255, 0, 255, 0.1)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 950, color: notif.status === 'linked' ? 'var(--neon-green)' : '#fff' }}>
                      ${notif.amount.toLocaleString()}
                    </span>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800 }}>{notif.time}</span>
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Search size={10} /> REF: {notif.reference}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {notif.status === 'incoming' ? (
                    <>
                      <button 
                        onClick={() => handleIgnore(notif.id)}
                        className="btn-icon" style={{ padding: 8, background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}
                      >
                        <X size={14} />
                      </button>
                      <button 
                        onClick={() => handleLink(notif)}
                        style={{ 
                          background: '#FF00FF', color: '#fff', border: 'none', 
                          padding: '8px 14px', borderRadius: 10, fontSize: 10, fontWeight: 950, 
                          cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 0, 255, 0.2)' 
                        }}
                      >
                        VINCULAR
                      </button>
                    </>
                  ) : (
                    <div style={{ color: 'var(--neon-green)', fontSize: 10, fontWeight: 950, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} /> LINKED
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, display: 'flex', gap: 10 }}>
         <button 
           onClick={() => fileInputRef.current?.click()}
           style={{ 
             flex: 1, padding: 14, borderRadius: 14, 
             background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
             color: '#fff', fontSize: 11, fontWeight: 950, cursor: 'pointer',
             display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
             transition: '0.3s'
           }}
           onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
           onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
         >
            <Camera size={16} style={{ color: '#FF00FF' }} /> ESCANEAR COMPROBANTE
         </button>
         <input 
           type="file" ref={fileInputRef} style={{ display: 'none' }} 
           accept="image/*" onChange={handleScanFile} 
         />
      </div>

      <div style={{ background: 'rgba(0,255,136,0.03)', padding: 10, borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
         <Info size={14} style={{ color: 'var(--neon-green)', flexShrink: 0 }} />
         <div style={{ fontSize: 8, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 900, color: 'var(--neon-green)' }}>TIP:</span> El Radar detecta pagos de la app de Nequi vinculada. Si el cliente envió pantallazo, usa el botón de <span style={{ color: '#FF00FF' }}>Escaneo IA</span>.
         </div>
      </div>
    </div>
  );
}
