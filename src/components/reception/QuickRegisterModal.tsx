import { useState } from 'react';
import { X, UserPlus, Phone, CreditCard, Check, Zap } from 'lucide-react';
import { Member } from '../../hooks/useGymData';

interface QuickRegisterModalProps {
  onClose: () => void;
  onSave: (data: Omit<Member, 'id'>, amountPaid: number) => void;
  plansConfig: any;
}

export default function QuickRegisterModal({ onClose, onSave, plansConfig }: QuickRegisterModalProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    plan: 'mes_pro',
    payMethod: 'Efectivo',
    amountPaid: 0,
    debt: 0
  });

  const plans = [
    { id: 'dia', label: 'Día', price: plansConfig?.dia || 5000, color: '#FFD600' },
    { id: 'semana', label: 'Semana', price: plansConfig?.semana || 25000, color: '#00E5FF' },
    { id: 'mes_basico', label: 'Básico', price: plansConfig?.mes_basico || 45000, color: '#8A948A' },
    { id: 'mes_pro', label: 'Pro', price: plansConfig?.mes_pro || 75000, color: '#00FF88' },
    { id: 'mes_hyrox', label: 'HYROX', price: plansConfig?.mes_hyrox || 120000, color: '#FF6B35' },
  ];

  const currentPlanPrice = plans.find(p => p.id === form.plan || p.label.toLowerCase() === form.plan.toLowerCase())?.price || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expiry = new Date();
    if (form.plan === 'dia') {
      expiry.setDate(expiry.getDate() + 1);
    } else if (form.plan === 'semana') {
      expiry.setDate(expiry.getDate() + 7);
    } else {
      expiry.setMonth(expiry.getMonth() + 1);
    }

    onSave({
      name: form.name,
      phone: form.phone,
      plan: form.plan,
      status: 'active',
      expiryDate: expiry.toISOString().split('T')[0],
      debt: Math.max(0, currentPlanPrice - form.amountPaid),
      payMethod: form.payMethod,
      biometricStatus: 'pending',
      lastVisit: new Date().toISOString().split('T')[0],
      visits: 0
    } as any, form.amountPaid);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)', zIndex: 11000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="glass-card premium-shadow" style={{
        maxWidth: 450, width: '100%', borderRadius: 28,
        background: 'var(--space-dark)', border: '1px solid rgba(0,255,136,0.2)',
        overflow: 'hidden', position: 'relative'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--neon-green)', letterSpacing: 2, textTransform: 'uppercase' }}>Registro Rápido Recepción</div>
            <h3 style={{ fontSize: 20, fontWeight: 950, color: '#fff', marginTop: 4 }}>Nuevo Atleta</h3>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: 8, borderRadius: 12, cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Nombre */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>Nombre Completo</label>
            <div style={{ position: 'relative' }}>
              <UserPlus size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'rgba(0,255,136,0.5)' }} />
              <input 
                required
                placeholder="Ej: Pedro Pérez"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', padding: '14px 14px 14px 45px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>WhatsApp / Teléfono</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'rgba(0,255,136,0.5)' }} />
              <input 
                required
                placeholder="310 000 0000"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={{ width: '100%', padding: '14px 14px 14px 45px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          {/* Plan */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>Seleccionar Plan</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {plans.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setForm({ ...form, plan: p.id })}
                  style={{
                    padding: '12px 8px', borderRadius: 16, textAlign: 'center', cursor: 'pointer',
                    background: form.plan === p.id ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${form.plan === p.id ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)'}`,
                    transition: '0.3s'
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: form.plan === p.id ? 'var(--neon-green)' : '#fff' }}>{p.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 950, marginTop: 4 }}>${(p.price/1000).toFixed(0)}K</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pago */}
          <div style={{ background: 'rgba(0,255,136,0.03)', padding: 20, borderRadius: 20, border: '1px solid rgba(0,255,136,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
               <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)' }}>Total a Pagar:</span>
               <span style={{ fontSize: 16, fontWeight: 950, color: 'var(--neon-green)' }}>${currentPlanPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
               <select 
                value={form.payMethod}
                onChange={e => setForm({ ...form, payMethod: e.target.value })}
                style={{ flex: 1, padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12 }}
               >
                 <option value="Efectivo">💵 Efectivo</option>
                 <option value="Nequi">📱 Nequi</option>
                 <option value="Transferencia">🏦 Transf.</option>
               </select>
               <input 
                type="number"
                placeholder="Abono..."
                onChange={e => setForm({ ...form, amountPaid: Number(e.target.value) })}
                style={{ width: 100, padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12 }}
               />
            </div>
          </div>

          <button 
            type="submit"
            style={{
              width: '100%', padding: 18, borderRadius: 20, background: 'var(--neon-green)',
              color: '#000', fontWeight: 950, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 10px 30px rgba(0,255,136,0.3)', marginTop: 10
            }}
          >
            <Zap size={18} /> REGISTRAR Y ACTIVAR
          </button>
        </form>
      </div>
    </div>
  );
}
