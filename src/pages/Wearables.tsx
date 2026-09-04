import { Watch } from 'lucide-react';

export default function Wearables() {
  return (
    <div className="animate-fade-in glass-card" style={{ padding: 40, maxWidth: 560 }}>
      <Watch size={28} style={{ color: 'var(--neon-green)', marginBottom: 12 }} />
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Wearables</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
        No hay dispositivos conectados. Esta pantalla solo muestra datos cuando exista una API real.
      </p>
    </div>
  );
}
