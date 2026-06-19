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
        
        {/* ─── ALERTAS DE NEGOCIO ─── */}
        <div className="glass-card" style={{ padding: 24, background: 'rgba(255,255,255,0.02)', border: 'var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
           <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 20 }}>🔔 Alertas Rápidas</h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {lowStockCount > 0 ? (
                <div style={{ padding: '14px 16px', background: 'rgba(255,61,87,0.08)', borderRadius: 12, border: '1px solid rgba(255,61,87,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Productos con bajo stock</span>
                   <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--danger-red)' }}>{lowStockCount} alertas</span>
                </div>
              ) : (
                <div style={{ padding: '14px 16px', background: 'rgba(0,255,136,0.05)', borderRadius: 12, border: '1px solid rgba(0,255,136,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Inventario</span>
                   <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--neon-green)' }}>Saludable</span>
                </div>
              )}

              {members.filter(m => m.biometricStatus !== 'completed').length > 0 ? (
                <div style={{ padding: '14px 16px', background: 'rgba(255,214,0,0.08)', borderRadius: 12, border: '1px solid rgba(255,214,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Perfiles incompletos (Biometría)</span>
                   <span style={{ fontSize: 14, fontWeight: 900, color: '#FFD600' }}>{members.filter(m => m.biometricStatus !== 'completed').length} atletas</span>
                </div>
              ) : (
                <div style={{ padding: '14px 16px', background: 'rgba(0,255,136,0.05)', borderRadius: 12, border: '1px solid rgba(0,255,136,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Perfiles Biométricos</span>
                   <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--neon-green)' }}>Al día</span>
                </div>
              )}
           </div>
        </div>

        <AICoachPerformance />
      </div>
    </div>
  );
}
