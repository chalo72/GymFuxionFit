import React from 'react';
import { ShoppingBag, X } from 'lucide-react';

interface PosCartProps {
  cart: any[];
  removeFromCart: (id: string) => void;
  handleFinalizeSale: () => void;
  isProcessing: boolean;
}

export function PosCart({ cart, removeFromCart, handleFinalizeSale, isProcessing }: PosCartProps) {
  return (
    <>
      <div style={{ flex:1, overflowY:'auto', background:'rgba(0,0,0,0.25)', borderRadius:20, padding:16, marginBottom:20, minHeight: 100, border: '1px solid rgba(255,255,255,0.03)' }}>
         {cart.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
               <ShoppingBag size={24} />
               <div style={{ fontSize: 10, fontWeight: 950, marginTop: 10, letterSpacing: 1 }}>LISTA VACÍA</div>
            </div>
         ) : cart.map(item => (
            <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', fontSize:12, marginBottom:10, background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 12 }}>
               <span style={{ fontWeight: 700 }}>{item.qty}x {item.name}</span>
               <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                 <span style={{ fontWeight: 950, color: 'var(--neon-green)' }}>${(item.price * item.qty).toLocaleString()}</span>
                 <button onClick={() => removeFromCart(item.id)} style={{ color:'var(--danger-red)', background:'rgba(255,61,87,0.05)', border:'none', padding: 6, borderRadius: 8, cursor:'pointer' }}><X size={14}/></button>
               </div>
            </div>
         ))}
      </div>
      <button 
        onClick={handleFinalizeSale} 
        disabled={cart.length === 0 || isProcessing} 
        style={{ 
          width:'100%', padding:20, borderRadius:20, 
          background: cart.length > 0 && !isProcessing ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)', 
          color:'#000', fontWeight:950, cursor: isProcessing ? 'wait' : 'pointer', 
          transition: '0.4s', boxShadow: cart.length > 0 ? '0 10px 30px rgba(0,255,136,0.3)' : 'none', 
          letterSpacing: 1 
        }}
      >
        {isProcessing ? 'PROCESANDO...' : 'CONFIRMAR Y COBRAR'}
      </button>
    </>
  );
}
