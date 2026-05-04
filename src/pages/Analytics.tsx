import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, CreditCard, Activity, Target } from 'lucide-react';

import { useMemo } from 'react';
import { useGymData } from '../hooks/useGymData';

export default function Analytics() {
  const { transactions, members } = useGymData();

  const { monthlyRevenue, planDistribution, metrics } = useMemo(() => {
    // 1. Distribution of Plans
    const plans: Record<string, number> = { Básico: 0, Pro: 0, HYROX: 0, VIP: 0, Estudiante: 0, Otro: 0 };
    members.forEach(m => {
      const p = m.plan || 'Otro';
      if (plans[p] !== undefined) plans[p]++;
      else plans['Otro']++;
    });
    
    const colors = ['#00F0FF', '#FF6B35', '#00E676', '#A78BFA', '#FFD600', '#888888'];
    const distData = Object.entries(plans)
      .filter(([_, count]) => count > 0)
      .map(([plan, count], i) => ({ plan, count, color: colors[i % colors.length] }));

    // 2. Monthly Revenue (Last 6-12 months from transactions)
    const revMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'income').forEach(t => {
      if (!t.date) return;
      const monthStr = t.date.substring(0, 7); // "YYYY-MM"
      revMap[monthStr] = (revMap[monthStr] || 0) + t.amount;
    });

    const sortedMonths = Object.keys(revMap).sort();
    const monthlyData = sortedMonths.slice(-12).map(mStr => {
      // Convert "YYYY-MM" to readable format
      const date = new Date(mStr + '-02'); // Add 2nd day to avoid timezone shifting
      const monthName = date.toLocaleString('es-CO', { month: 'short' });
      return { 
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1), 
        revenue: revMap[mStr],
        members: members.filter((m: any) => m.joinDate && m.joinDate <= mStr + '-31').length || members.length
      };
    });

    // 3. KPI Metrics
    const totalRevenue = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const activeCount = members.filter(m => m.status === 'active').length || 1;
    const arpu = totalRevenue / activeCount;

    const computedMetrics = [
      { icon: CreditCard, label: 'ARPU (Ingreso Prom. por Usuario)', value: `$${Math.round(arpu).toLocaleString()}`, change: 'Histórico', up: true },
      { icon: Users, label: 'Total Atletas Activos', value: `${activeCount}`, change: 'Actual', up: true },
      { icon: Activity, label: 'Ingreso Bruto Total', value: `$${totalRevenue.toLocaleString()}`, change: 'Todas las ventas', up: true },
      { icon: Target, label: 'Tasa de Actividad', value: `${Math.round((activeCount / (members.length || 1)) * 100)}%`, change: 'Miembros activos', up: true },
    ];

    return { monthlyRevenue: monthlyData, planDistribution: distData, metrics: computedMetrics };
  }, [transactions, members]);


  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Analíticas</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Métricas avanzadas de negocio y rendimiento
        </p>
      </div>

      {/* ─── METRICS ROW ─── */}
      <div className="kpi-row">
        {metrics.map((m, i) => (
          <div key={m.label} className={`kpi-card cyan animate-fade-in animate-delay-${i + 1}`}>
            <div className="kpi-icon cyan">
              <m.icon size={20} />
            </div>
            <div className="kpi-label">{m.label}</div>
            <div className="kpi-value" style={{ fontSize: 'var(--text-2xl)' }}>{m.value}</div>
            <div className={`kpi-change ${m.up ? 'positive' : 'negative'}`}>
              {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {m.change}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* ─── REVENUE TREND ─── */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <div className="glass-card-title">Tendencia de Ingresos</div>
              <div className="glass-card-subtitle">Últimos 12 meses</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(14,14,21,0.95)',
                    border: '1px solid rgba(0,240,255,0.2)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00F0FF"
                  strokeWidth={2}
                  fill="url(#cyanGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#00F0FF', stroke: 'rgba(0,240,255,0.3)', strokeWidth: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── PLAN DISTRIBUTION ─── */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <div className="glass-card-title">Distribución por Plan</div>
              <div className="glass-card-subtitle">Miembros activos por tipo de suscripción</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planDistribution} layout="vertical" barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
                <YAxis type="category" dataKey="plan" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600 }} width={80} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(14,14,21,0.95)',
                    border: '1px solid rgba(0,240,255,0.2)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Miembros" radius={[0, 8, 8, 0]}>
                  {planDistribution.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            {planDistribution.map((p) => (
              <div key={p.plan} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color, display: 'inline-block' }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {p.plan}: <b>{p.count}</b>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
