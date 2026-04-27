import { useMemo } from 'react';
import { DollarSign, Users, TrendingUp, Activity } from 'lucide-react';
import RevenueOverview from '../components/dashboard/RevenueOverview';
import MemberAttendance from '../components/dashboard/MemberAttendance';
import AICoachPerformance from '../components/dashboard/AICoachPerformance';
import { useGymData } from '../hooks/useGymData';

export default function Dashboard() {
  const { members, transactions, products } = useGymData();

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stock <= (p.minStock || 0)).length;
  }, [products]);

  const kpis = useMemo(() => {
    /* Ingresos del mes actual */
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && t.date?.startsWith(monthStr))
      .reduce((acc, t) => acc + t.amount, 0);

    /* Miembros activos */
    const activeCount = members.filter(m => m.status === 'active').length;
    const totalCount = members.length || 1; // evitar div/0

    /* Tasa de retención */
    const retentionRate = Math.round((activeCount / totalCount) * 100);

    return [
      {
        icon: DollarSign,
        label: 'Ingresos del Mes',
        value: `$${monthlyIncome.toLocaleString('es-CO')}`,
        change: monthlyIncome > 0 ? 'Mes actual' : 'Sin datos',
        positive: monthlyIncome > 0,
        accent: 'cyan' as const,
      },
      {
        icon: Users,
        label: 'Miembros Activos',
        value: activeCount.toLocaleString(),
        change: `de ${totalCount} totales`,
        positive: activeCount > 0,
        accent: 'orange' as const,
      },
      {
        icon: TrendingUp,
        label: 'Tasa de Retención',
        value: `${retentionRate}%`,
        change: retentionRate >= 80 ? 'Excelente' : retentionRate >= 60 ? 'Regular' : 'Atención',
        positive: retentionRate >= 60,
        accent: 'green' as const,
      },
      {
        icon: Activity,
        label: 'Sesiones IA',
        value: '—',
        change: 'En desarrollo',
        positive: true,
        accent: 'cyan' as const,
      },
    ];
  }, [members, transactions]);

  return (
    <div>
      {/* ─── KPI ROW ─── */}
      <div className="kpi-row">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`kpi-card ${kpi.accent} animate-fade-in animate-delay-${i + 1}`}
          >
            <div className={`kpi-icon ${kpi.accent}`}>
              <kpi.icon size={20} />
            </div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className={`kpi-change ${kpi.positive ? 'positive' : 'negative'}`}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                {kpi.positive ? (
                  <path d="M5 1L9 6H1L5 1Z" fill="currentColor" />
                ) : (
                  <path d="M5 9L1 4H9L5 9Z" fill="currentColor" />
                )}
              </svg>
              {kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* ─── MAIN CHARTS GRID ─── */}
      <div className="dashboard-grid">
        <RevenueOverview />
        <MemberAttendance />
        
        {/* ─── NEXUS SYNC COMMAND CENTER ─── */}
        <div className="glass-card" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, transparent 100%)', border: '1px solid rgba(0,255,136,0.1)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 950, color: '#fff', letterSpacing: 1 }}>NEXUS_OMNI_SYNC</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 10px var(--neon-green)' }} />
                 <span style={{ fontSize: 9, fontWeight: 950, color: 'var(--neon-green)' }}>LIVE_RADAR_ACTIVE</span>
              </div>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { l: 'MIEMBROS_EN_DB', v: `${members.length}_ATLETAS`, c: 'var(--neon-green)' },
                { l: 'PWA_CACHE_SHIELD', v: 'PROTECTED (v.2.6)', c: 'var(--neon-green)' },
                { l: 'ALERTA_DE_STOCK_BAJO', v: `${lowStockCount}_PRODUCTOS`, c: lowStockCount > 0 ? 'var(--danger-red)' : 'var(--neon-green)', alert: lowStockCount > 0 },
                { l: 'PERFILES_SIN_BIOMETRÍA', v: `${members.filter(m => m.biometricStatus !== 'completed').length}_ATLETAS`, c: members.filter(m => m.biometricStatus !== 'completed').length > 0 ? 'var(--danger-red)' : 'var(--neon-green)', alert: members.filter(m => m.biometricStatus !== 'completed').length > 0 },
              ].map(s => (
                <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: s.alert ? '1px solid rgba(255,61,87,0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                   <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)' }}>{s.l}</span>
                   <span style={{ fontSize: 10, fontWeight: 950, color: s.c }}>{s.v}</span>
                </div>
              ))}
           </div>
           
           <button style={{ marginTop: 20, width: '100%', padding: 12, borderRadius: 10, background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.2)', fontSize: 10, fontWeight: 950, cursor: 'pointer' }}>
              AUDITAR INTEGRIDAD DE DATOS
           </button>
        </div>

        <AICoachPerformance />
      </div>
    </div>
  );
}
