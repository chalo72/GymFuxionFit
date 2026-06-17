import React from 'react';
import { CreditCard, Zap } from 'lucide-react';

export function PanelWallet({ user }: { user: any }) {
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
