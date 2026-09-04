import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useGymData, type Member } from '../../hooks/useGymData';
import { mergeTab, tabTotal } from '../../lib/cuentaPiso';
import { AiAssist } from '../AiAssist';

export function PanelStore({ onCartChange, athlete }: { onCartChange: (n: number) => void; injectTransaction?: any; updateMemberStatus?: any; athlete: Member | null }) {
  const { products, registerProductSale, updateMemberStatus } = useGymData();
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [ok, setOk] = useState('');

  useEffect(() => { onCartChange(cart.reduce((a, c) => a + c.qty, 0)); }, [cart, onCartChange]);

  const add = (p: { id: string; name: string; sellPrice: number; stock: number }) => {
    if (p.stock <= 0) return;
    setCart((prev) => {
      const e = prev.find((x) => x.id === p.id);
      if (e) return prev.map((x) => x.id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { id: p.id, name: p.name, price: p.sellPrice, qty: 1 }];
    });
  };

  const pedir = async () => {
    if (!athlete?.id || cart.length === 0) return;
    for (const item of cart) {
      const okStock = await registerProductSale(item.id, item.qty, athlete.name, 'Cuenta piso');
      if (!okStock) {
        setOk(`Sin stock: ${item.name}`);
        return;
      }
    }
    await updateMemberStatus(athlete.id, {
      openTab: mergeTab(athlete.openTab, cart),
    });
    setCart([]);
    setOk('Pedido en tu cuenta. Pásalo en recepción antes de irte.');
    setTimeout(() => setOk(''), 4000);
  };

  const consumo = tabTotal(athlete?.openTab);

  if (!athlete?.id) {
    return <p style={{ color: 'var(--text-muted)' }}>Recepción debe vincular tu correo a tu ficha de socio para pedir de verdad.</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, height: '100%' }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 900 }}>Tienda del gym</h2>
        <AiAssist rol="socio" texto="Esto es el inventario real. Pedir carga a tu cuenta del piso (agua, gaseosa, tanque). No es un marketplace de mentiras." />
        {products.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No hay productos cargados. Recepción / inventario los da de alta.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => add(p)} className="glass-card" style={{ padding: 14, textAlign: 'left', cursor: p.stock > 0 ? 'pointer' : 'not-allowed', opacity: p.stock > 0 ? 1 : 0.4 }}>
              <div style={{ fontWeight: 800, fontSize: 13 }}>{p.name}</div>
              <div style={{ color: 'var(--neon-green)', fontWeight: 900, marginTop: 6 }}>${(p.sellPrice || 0).toLocaleString('es-CO')}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stock {p.stock} · {p.category}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#FFD700' }}>CUENTA ABIERTA AHORA</div>
        {(athlete.openTab || []).length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nada pendiente de consumo.</p>}
        {(athlete.openTab || []).map((l) => (
          <div key={l.id + l.at} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8 }}>
            <span>{l.qty}× {l.name}</span>
            <span>${(l.qty * l.price).toLocaleString('es-CO')}</span>
          </div>
        ))}
        <div style={{ fontWeight: 900, marginTop: 12 }}>A pagar al salir: ${consumo.toLocaleString('es-CO')}</div>
        <h3 style={{ marginTop: 24, fontSize: 14 }}>Nuevo pedido</h3>
        {cart.map((c) => (
          <div key={c.id} style={{ fontSize: 13 }}>{c.qty}× {c.name}</div>
        ))}
        <button type="button" className="btn btn-glow" style={{ width: '100%', marginTop: 12 }} disabled={!cart.length} onClick={pedir}>Pedir (cuenta del piso)</button>
        {ok && <p style={{ color: 'var(--neon-green)', fontSize: 13, marginTop: 10 }}>{ok}</p>}
      </div>
    </div>
  );
}
