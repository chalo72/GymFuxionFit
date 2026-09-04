import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

type MemberLite = {
  id: string;
  name: string;
  debt?: number;
  expiryDate?: string;
  expiry?: string;
};

type ProductLite = { id: string; name: string; stock: number; minStock?: number };

type Props = {
  deudas: MemberLite[];
  porVencer: MemberLite[];
  stockBajo: ProductLite[];
  visitasHoy: number;
  activos: number;
};

const card = (color: string): CSSProperties => ({
  padding: 16,
  borderRadius: 16,
  border: `1px solid ${color}44`,
  background: `${color}12`,
          minHeight: 140,
  width: '100%',
  fontFamily: 'inherit',
});

export default function GymSwarm({ deudas, porVencer, stockBajo, visitasHoy, activos }: Props) {
  const navigate = useNavigate();

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--neon-green)', letterSpacing: 1 }}>
          ENJAMBRE DEL GYM
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Agentes del negocio. Cada uno muestra su cola real; el clic abre la pantalla donde se resuelve.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <button type="button" onClick={() => navigate('/finances?tab=cobros')} style={{ ...card('#FF6B35'), textAlign: 'left', cursor: 'pointer', color: 'inherit' }}>
          <div style={{ fontWeight: 800, color: '#FF6B35', marginBottom: 6 }}>Cobro</div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{deudas.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {deudas.length === 0 ? 'Sin saldos pendientes.' : deudas.slice(0, 3).map((m) => m.name).join(', ')}
            {deudas.length > 3 ? '…' : ''}
          </div>
        </button>

        <button type="button" onClick={() => navigate('/members')} style={{ ...card('#00E5FF'), textAlign: 'left', cursor: 'pointer', color: 'inherit' }}>
          <div style={{ fontWeight: 800, color: '#00E5FF', marginBottom: 6 }}>Renovación</div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{porVencer.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {porVencer.length === 0 ? 'Nadie vence en 7 días.' : porVencer.slice(0, 3).map((m) => m.name).join(', ')}
            {porVencer.length > 3 ? '…' : ''}
          </div>
        </button>

        <button type="button" onClick={() => navigate('/inventory')} style={{ ...card('#A78BFA'), textAlign: 'left', cursor: 'pointer', color: 'inherit' }}>
          <div style={{ fontWeight: 800, color: '#A78BFA', marginBottom: 6 }}>Bodega</div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{stockBajo.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {stockBajo.length === 0 ? 'Stock en mínimo: 0.' : stockBajo.slice(0, 3).map((p) => p.name).join(', ')}
            {stockBajo.length > 3 ? '…' : ''}
          </div>
        </button>

        <button type="button" onClick={() => navigate('/reception')} style={{ ...card('#00FF88'), textAlign: 'left', cursor: 'pointer', color: 'inherit' }}>
          <div style={{ fontWeight: 800, color: '#00FF88', marginBottom: 6 }}>Puerta</div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{visitasHoy}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Visitas hoy · {activos} activos en ficha. Ir a recepción.
          </div>
        </button>
      </div>
    </div>
  );
}
