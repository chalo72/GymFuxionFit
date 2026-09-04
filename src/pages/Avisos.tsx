import { useMemo } from 'react';
import { useGymData } from '../hooks/useGymData';
import { AiAssist } from '../components/AiAssist';
import { daysUntilExpiry, waAvisoUrl } from '../lib/accessGate';

export default function Avisos() {
  const { members } = useGymData();

  const { deudas, vencen } = useMemo(() => {
    const deudas = members.filter((m) => (m.debt || 0) > 0);
    const vencen = members.filter((m) => {
      const d = daysUntilExpiry(m.expiryDate || m.expiry);
      return d !== null && d >= 0 && d <= 7;
    });
    return { deudas, vencen };
  }, [members]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 32 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Avisos a socios</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14 }}>
          Abre WhatsApp con el texto listo. Hace falta el celular en la ficha. No es envío automático masivo.
        </p>
      </div>
      <AiAssist
        rol="recepción"
        texto="Un aviso amable hoy evita un socio perdido. Mora: cobra o pacta fecha. Por vencer: recuérdale el plan. Sin teléfono en la ficha no hay magia."
      />

      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Mora ({deudas.length})</h3>
        {deudas.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nadie con saldo.</p>}
        {deudas.map((m) => {
          const href = waAvisoUrl(m, 'deuda');
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--danger-red)' }}>${(m.debt || 0).toLocaleString('es-CO')} · {m.phone || 'sin teléfono'}</div>
              </div>
              {href ? (
                <a className="btn btn-primary" href={href} target="_blank" rel="noreferrer">WhatsApp</a>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Falta celular</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Vencen en 7 días ({vencen.length})</h3>
        {vencen.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nadie por vencer.</p>}
        {vencen.map((m) => {
          const href = waAvisoUrl(m, 'vence');
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.expiryDate || m.expiry} · {m.phone || 'sin teléfono'}</div>
              </div>
              {href ? (
                <a className="btn btn-primary" href={href} target="_blank" rel="noreferrer">WhatsApp</a>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Falta celular</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
