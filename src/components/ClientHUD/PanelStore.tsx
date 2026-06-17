import React, { useState, useEffect } from 'react';
import { Clock, ShoppingCart, ShoppingBag, ChevronRight, Info, Check } from 'lucide-react';

export function PanelStore({ onCartChange, injectTransaction, updateMemberStatus, athlete }: { onCartChange: (n: number) => void, injectTransaction: any, updateMemberStatus: any, athlete: any }) {
  const [filter, setFilter] = useState<'all' | 'local' | 'supplier'>('all');
  const [cart, setCart] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const MOCK_PRODUCTS = [
    { id: 'p1', name: 'Proteína Whey Elite 5lb', price: 240000, type: 'supplier', category: 'Suplementos', img: 'https://images.unsplash.com/photo-1593095183571-2d5ff1a473ee?q=80&w=200&h=200&auto=format&fit=crop', delivery: '3-5 días' },
    { id: 'p2', name: 'Creatina Monohidratada', price: 120000, type: 'local', category: 'Suplementos', img: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=200&h=200&auto=format&fit=crop', delivery: 'Inmediata (Gym)' },
    { id: 'p3', name: 'Camiseta Over-Size Fuxion', price: 65000, type: 'supplier', category: 'Ropa', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&h=200&auto=format&fit=crop', delivery: 'Envío Gratis' },
    { id: 'p4', name: 'Bebida Energética X-Zero', price: 6000, type: 'local', category: 'Bebidas', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&h=200&auto=format&fit=crop', delivery: 'En Recepción' },
    { id: 'p5', name: 'Cinturón de Fuerza Cuero', price: 180000, type: 'supplier', category: 'Accesorios', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200&h=200&auto=format&fit=crop', delivery: '5-7 días' },
    { id: 'p6', name: 'Aminoácidos BCAA 30 serv', price: 95000, type: 'local', category: 'Suplementos', img: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=200&h=200&auto=format&fit=crop', delivery: 'Inmediata' },
  ];

  const filtered = MOCK_PRODUCTS.filter(p => filter === 'all' || p.type === filter);

  useEffect(() => {
    onCartChange(cart.length);
  }, [cart, onCartChange]);

  const addToCart = (p: any) => {
    setCart([...cart, { ...p, cartId: crypto.randomUUID() }]);
  };

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const processOrder = async () => {
    try {
      // 1. Registrar Transacción
      await injectTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString().slice(0, 5),
        description: `COMPRA_TIENDA: ${cart.length} productos`,
        category: 'membership',
        type: 'income',
        amount: total,
        method: 'DEUDA_INTERNA',
        client: athlete.name
      });

      // 2. Cargar Deuda al Socio
      await updateMemberStatus(athlete.id, {
        debt: (athlete.debt || 0) + total
      });

      setOrderSuccess(true);
      setCart([]);
      setShowCheckout(false);
      
      // Reset success state after 3s
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (error) {
      console.error("Error procesando pedido:", error);
      alert("Error al procesar el pedido. Inténtalo de nuevo.");
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', animation: 'slideIn 0.5s ease-out' }}>
        <div className="glass-card" style={{ padding: 60, borderRadius: 40, border: '2px solid var(--neon-green)', textAlign: 'center', maxWidth: 450 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,255,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
            <Check size={50} color="var(--neon-green)" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 950, color: '#fff', marginBottom: 12 }}>¡PEDIDO EXITOSO!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6 }}>Tu compra ha sido procesada. Los productos se han cargado a tu cuenta.</p>
          <div style={{ marginTop: 30, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 20 }}>
             <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 4 }}>ID_PEDIDO</div>
             <div style={{ fontSize: 14, fontWeight: 950, color: 'var(--neon-green)', fontFamily: 'monospace' }}>#{crypto.randomUUID().slice(0,8).toUpperCase()}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, height: '100%', animation: 'slideIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header & Filtros */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>Marketplace <span style={{ color: 'var(--neon-green)' }}>Elite</span></h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Productos seleccionados para tu rendimiento</p>
          </div>
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12 }}>
            {[
              { id: 'all', label: 'Todo' },
              { id: 'local', label: 'En el Gym' },
              { id: 'supplier', label: 'Catálogo' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                style={{ 
                  padding: '8px 16px', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 900, cursor: 'pointer',
                  background: filter === f.id ? 'var(--neon-green)' : 'transparent',
                  color: filter === f.id ? '#000' : 'var(--text-muted)',
                  transition: '0.3s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, paddingBottom: 20 }}>
          {filtered.map(p => (
            <div key={p.id} className="glass-card premium-card-hover" style={{ display: 'flex', flexDirection: 'column', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
              <div style={{ height: 160, position: 'relative', background: '#000' }}>
                <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: p.type === 'local' ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)', color: p.type === 'local' ? '#000' : '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 9, fontWeight: 950, backdropFilter: 'blur(10px)' }}>
                  {p.type === 'local' ? 'EXPRESS' : 'CATÁLOGO'}
                </div>
              </div>
              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--neon-green)' }}>{p.category.toUpperCase()}</div>
                <div style={{ fontSize: 14, fontWeight: 950, color: '#fff', lineHeight: 1.2 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <Clock size={12} /> {p.delivery}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 950, color: '#fff' }}>${p.price.toLocaleString()}</div>
                  <button 
                    onClick={() => addToCart(p)}
                    style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--neon-green)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,255,136,0.2)' }}
                  >
                    <ShoppingCart size={18} color="#000" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel Lateral: Carrito & Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="glass-card" style={{ padding: 24, borderRadius: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 950 }}>Tu Carrito</h3>
            <div style={{ background: 'var(--neon-green)', color: '#000', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 950 }}>{cart.length}</div>
          </div>

          <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, opacity: 0.3 }}>
                <ShoppingBag size={40} style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: 12, fontWeight: 800 }}>Carrito vacío</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={item.cartId} style={{ display: 'flex', gap: 12, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 16, alignItems: 'center' }}>
                  <img src={item.img} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 950, color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--neon-green)' }}>${item.price.toLocaleString()}</div>
                  </div>
                  <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} style={{ border: 'none', background: 'transparent', color: 'var(--danger-red)', cursor: 'pointer' }}>×</button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL</span>
                <span style={{ fontSize: 20, fontWeight: 950, color: '#fff' }}>${total.toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setShowCheckout(true)}
                style={{ width: '100%', padding: 18, borderRadius: 16, background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 950, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 10px 20px rgba(0,255,136,0.2)' }}
              >
                COMPRAR AHORA <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: 20, borderRadius: 24, background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Info size={16} style={{ color: 'var(--neon-green)' }} />
            <span style={{ fontSize: 12, fontWeight: 950 }}>INFO DE ENVÍO</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Los productos <strong style={{ color: '#fff' }}>EXPRESS</strong> se retiran hoy mismo en recepción. Los de <strong style={{ color: '#fff' }}>CATÁLOGO</strong> se envían desde bodega central.
          </p>
        </div>
      </div>

      {/* Modal Checkout Simplificado */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 450, width: '100%', padding: 40, borderRadius: 40, textAlign: 'center', border: '1px solid var(--neon-green)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,255,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={40} color="var(--neon-green)" />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 950, marginBottom: 12 }}>¿Confirmar Pedido?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>El total de <strong style={{ color: '#fff' }}>${total.toLocaleString()}</strong> se cargará a tu cuenta para pagar en recepción o mediante Nequi.</p>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowCheckout(false)} style={{ flex: 1, padding: 18, borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', fontWeight: 950, cursor: 'pointer' }}>CANCELAR</button>
              <button 
                onClick={processOrder}
                style={{ flex: 1, padding: 18, borderRadius: 16, background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 950, cursor: 'pointer' }}
              >
                CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
