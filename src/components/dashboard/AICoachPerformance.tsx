import { useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import { useGymData } from '../../hooks/useGymData';

export default function AICoachPerformance() {
  const { members } = useGymData();
  const stats = useMemo(() => {
    const withPlan = members.filter((m) => m.activeProgram || (m.plans && m.plans.length)).length;
    const withBio = members.filter((m) => m.biometricStatus === 'completed').length;
    return { withPlan, withBio, total: members.length };
  }, [members]);

  return (
    <div className="glass-card full-width" style={{ padding: 24 }}>
      <div className="glass-card-title" style={{ marginBottom: 8 }}>Cobertura de coaching</div>
      <div className="glass-card-subtitle" style={{ marginBottom: 16 }}>
        Conteos reales de fichas, no métricas de un bot inventado.
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <ClipboardList size={18} />
          <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.withPlan}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>con plan</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.withBio}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>biometría completa</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.total}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>miembros</div>
        </div>
      </div>
    </div>
  );
}
