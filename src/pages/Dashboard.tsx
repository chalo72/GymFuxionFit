import { DollarSign, Users, TrendingUp, Activity } from 'lucide-react';
import RevenueOverview from '../components/dashboard/RevenueOverview';
import MemberAttendance from '../components/dashboard/MemberAttendance';
import AICoachPerformance from '../components/dashboard/AICoachPerformance';

const kpis = [
  {
    icon: DollarSign,
    label: 'Ingresos del Mes',
    value: '$38,750',
    change: '+15.8%',
    positive: true,
    accent: 'cyan' as const,
  },
  {
    icon: Users,
    label: 'Miembros Activos',
    value: '1,247',
    change: '+245',
    positive: true,
    accent: 'orange' as const,
  },
  {
    icon: TrendingUp,
    label: 'Tasa de Retención',
    value: '93.2%',
    change: '+2.1%',
    positive: true,
    accent: 'green' as const,
  },
  {
    icon: Activity,
    label: 'Sesiones IA Hoy',
    value: '185',
    change: '+12%',
    positive: true,
    accent: 'cyan' as const,
  },
];

export default function Dashboard() {
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
        <AICoachPerformance />
      </div>
    </div>
  );
}
