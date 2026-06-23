import React, { useState } from 'react';
import { CreditCard, Zap, X, CheckCircle } from 'lucide-react';
import { useGymData } from '../../hooks/useGymData';

export function PanelWallet({ user }: { user: any }) {
  const { injectTransaction } = useGymData();
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(user?.debt || 0);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const history = [
    { id: 1, date: 'Hoy', amount: user?.debt || 0, method: 'Pendiente', status: 'POR_PAGAR', ref: 'DEUDA_ACTUAL' },
    { id: 2, date: '15 Abr 2026', amount: 120000, method: 'Nequi', status: 'VERIFICADO', ref: 'NQ-883492' },
  ];

  const handlePay = () => {
    if (!phone || amount <= 0) return;
    setProcessing(true);
    
    // Simular el proceso de pago Nequi y luego guardar en DB
    setTimeout(() => {
      injectTransaction({
        type: 'income',
        amount: Number(amount),
        category: 'deuda_cliente',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        method: 'Nequi',
        description: `Pago Deuda App (Nequi: ${phone}) - ${user?.name || 'Cliente'}`
      });
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setPhone('');
        alert('Pago procesado correctamente. En breves minutos se reflejará en tu cuenta.');
      }, 2000);
    }, 1500);
  };

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

          <button onClick={() => setShowModal(true)} style={{ width: '100%', padding: 22, borderRadius: 20, background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 950, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 10px 30px rgba(0,255,136,0.3)' }}>
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

       {/* Modal de Pago Nequi */}
       {showModal && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s' }}>
            <div className="glass-card animate-slide-up" style={{ width: 400, padding: 30, borderRadius: 32, border: '1px solid var(--neon-green)' }}>
               {success ? (
                 <div style={{ textAlign: 'center', padding: '40px 0' }}>
                   <CheckCircle size={60} color="var(--neon-green)" style={{ margin: '0 auto 20px' }} />
                   <h3 style={{ fontSize: 24, color: '#fff', fontWeight: 950 }}>Pago Exitoso</h3>
                   <p style={{ color: 'var(--text-muted)', marginTop: 10 }}>Tu saldo ha sido actualizado.</p>
                 </div>
               ) : (
                 <>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 950, color: '#fff' }}>Pagar con Nequi</h3>
                      <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20}/></button>
                   </div>
                   
                   <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>NÚMERO DE CELULAR NEQUI</label>
                      <input 
                        type="text" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="300 000 0000"
                        style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12, marginTop: 8, fontSize: 16 }}
                      />
                   </div>

                   <div style={{ marginBottom: 30 }}>
                      <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>VALOR A PAGAR</label>
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(Number(e.target.value))}
                        style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--neon-green)', borderRadius: 12, marginTop: 8, fontSize: 24, fontWeight: 950 }}
                      />
                   </div>

                   <button 
                     onClick={handlePay}
                     disabled={processing || !phone}
                     style={{ width: '100%', padding: 18, background: 'var(--neon-green)', color: '#000', border: 'none', borderRadius: 16, fontWeight: 950, fontSize: 16, cursor: processing || !phone ? 'not-allowed' : 'pointer', opacity: processing || !phone ? 0.5 : 1 }}
                   >
                      {processing ? 'PROCESANDO...' : 'CONFIRMAR PAGO'}
                   </button>
                 </>
               )}
            </div>
         </div>
       )}
    </div>
  );
}
