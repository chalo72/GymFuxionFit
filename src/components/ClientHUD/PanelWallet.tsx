import { useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useGymData, type Member } from '../../hooks/useGymData';
import { fichaCuenta, tabTotal } from '../../lib/cuentaPiso';
import { AiAssist } from '../AiAssist';

export function PanelWallet({ user }: { user: Member | null }) {
  const { transactions, updateMemberStatus } = useGymData();
  const [msg, setMsg] = useState('');

  const mine = useMemo(() => {
    if (!user?.name) return [];
    const n = user.name.toLowerCase();
    return transactions.filter((t) => (t.client || t.description || '').toLowerCase().includes(n)).slice(0, 12);
  }, [transactions, user]);

  const f = user ? fichaCuenta(user) : null;

  const pedirCaja = async () => {
    if (!user?.id || !f) return;
    const amount = f.totalPendiente;
    if (amount <= 0) {
      setMsg('No debes nada ahora.');
      return;
    }
    await updateMemberStatus(user.id, {
      pagoSolicitado: { amount, at: Date.now(), nota: 'Socio pide liquidar en recepción' },
    });
    setMsg('Recepción ya ve que quieres pagar. No fingimos Nequi: se cierra en caja.');
  };

  if (!user?.id) {
    return <p style={{ color: 'var(--text-muted)' }}>Sin ficha de socio vinculada no hay pagos reales.</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="glass-card" style={{ padding: 28, borderRadius: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 18, fontWeight: 950 }}>Tu cuenta</h3>
          <CreditCard style={{ color: 'var(--neon-green)' }} />
        </div>
        <AiAssist rol="pagos" texto="Mora de plan y consumo del piso (agua, etc.) son cosas distintas. El consumo se paga al salir. La mora se arregla en recepción." />
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>MORA DEL PLAN</div>
        <div style={{ fontSize: 32, fontWeight: 950, color: f && f.mora > 0 ? 'var(--danger-red)' : 'var(--neon-green)' }}>${(f?.mora || 0).toLocaleString('es-CO')}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>CONSUMO EN EL GYM HOY</div>
        <div style={{ fontSize: 28, fontWeight: 950, color: '#FFD700' }}>${tabTotal(user.openTab).toLocaleString('es-CO')}</div>
        {(user.openTab || []).map((l) => (
          <div key={l.id} style={{ fontSize: 13, marginTop: 6 }}>{l.qty}× {l.name}</div>
        ))}
        <div style={{ marginTop: 16, fontSize: 13 }}>Estado: {f?.plan}</div>
        <button type="button" className="btn btn-glow" style={{ width: '100%', marginTop: 20 }} onClick={pedirCaja}>Avisar a recepción que voy a pagar</button>
        {msg && <p style={{ fontSize: 13, marginTop: 10, color: 'var(--neon-green)' }}>{msg}</p>}
      </div>
      <div className="glass-card" style={{ padding: 28, borderRadius: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 950, marginBottom: 12 }}>Movimientos reales</h3>
        {mine.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Aún no hay cobros a tu nombre en caja.</p>}
        {mine.map((t) => (
          <div key={String(t.id)} style={{ padding: 14, marginBottom: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 16, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{t.description}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.date} · {t.method}</div>
            </div>
            <div style={{ fontWeight: 900, color: 'var(--neon-green)' }}>${(t.amount || 0).toLocaleString('es-CO')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
