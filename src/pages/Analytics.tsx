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
} from 'recharts';
import { TrendingUp, TrendingDown, Users, CreditCard, Activity, Target } from 'lucide-react';

const monthlyRevenue = [
  { month: 'Ene', revenue: 28500, members: 980 },
  { month: 'Feb', revenue: 30200, members: 1020 },
  { month: 'Mar', revenue: 27800, members: 1010 },
  { month: 'Abr', revenue: 32000, members: 1050 },
  { month: 'May', revenue: 35600, members: 1095 },
  { month: 'Jun', revenue: 33400, members: 1110 },
  { month: 'Jul', revenue: 36200, members: 1145 },
  { month: 'Ago', revenue: 34800, members: 1160 },
  { month: 'Sep', revenue: 37500, members: 1190 },
  { month: 'Oct', revenue: 35900, members: 1200 },
  { month: 'Nov', revenue: 38200, members: 1230 },
  { month: 'Dic', revenue: 38750, members: 1247 },
];

const planDistribution = [
  { plan: 'Básico', count: 520, color: '#00F0FF' },
  { plan: 'Pro', count: 450, color: '#FF6B35' },
  { plan: 'HYROX', count: 277, color: '#00E676' },
];

const metrics = [
  { icon: CreditCard, label: 'ARPU', value: '$31.07', change: '+8.2%', up: true },
  { icon: Users, label: 'Tasa de Churn', value: '6.8%', change: '-1.2%', up: true },
  { icon: Activity, label: 'LTV Promedio', value: '$744', change: '+15%', up: true },
  { icon: Target, label: 'CAC', value: '$18.50', change: '-22%', up: true },
];

export default function Analytics() {
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
                    <Bar key={i} dataKey="count" fill={entry.color} />
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
