import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const revenueData = [
  { month: 'Ene', income: 28500, projection: 26000 },
  { month: 'Feb', income: 30200, projection: 28000 },
  { month: 'Mar', income: 27800, projection: 29000 },
  { month: 'Abr', income: 32000, projection: 30000 },
  { month: 'May', income: 35600, projection: 31500 },
  { month: 'Jun', income: 33400, projection: 33000 },
  { month: 'Jul', income: 36200, projection: 34000 },
  { month: 'Ago', income: 34800, projection: 35000 },
  { month: 'Sep', income: 37500, projection: 35500 },
  { month: 'Oct', income: 35900, projection: 36000 },
  { month: 'Nov', income: 38200, projection: 37000 },
  { month: 'Dic', income: 38750, projection: 37500 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div
      style={{
        background: 'rgba(14,18,14,0.95)',
        border: '1px solid rgba(0,255,136,0.2)',
        borderRadius: 12,
        padding: '12px 16px',
        backdropFilter: 'blur(20px)',
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.875rem' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: '0.8125rem', marginBottom: 2 }}>
          {p.name}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function RevenueOverview() {
  return (
    <div className="glass-card">
      <div className="glass-card-header">
        <div>
          <div className="glass-card-title">Resumen de Ingresos</div>
          <div className="glass-card-subtitle">Ingresos mensuales vs proyección</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>$38,750</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <span className="kpi-change positive">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
              </svg>
              15.8%
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>este mes</span>
          </div>
        </div>
      </div>

      {/* ─── stats rápidos ─── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            background: 'var(--space-medium)',
            border: '1px solid rgba(0,255,136,0.06)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>245</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Nuevas Altas
          </span>
        </div>
        <div
          style={{
            background: 'var(--space-medium)',
            border: '1px solid rgba(0,255,136,0.06)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span className="kpi-change positive" style={{ padding: '2px 6px' }}>
            +12%
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Crecimiento</span>
        </div>
        <div
          style={{
            background: 'var(--space-medium)',
            border: '1px solid rgba(0,255,136,0.06)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
          }}
        >
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>$320,450</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Acumulado</div>
        </div>
      </div>

      {/* ─── chart ─── */}
      <div className="chart-container" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData} barGap={4} barSize={14}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,255,136,0.04)' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}
            />
            <Bar
              dataKey="income"
              name="Ingresos"
              fill="#FF6B35"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="projection"
              name="Proyección"
              fill="#00FF88"
              radius={[4, 4, 0, 0]}
              opacity={0.6}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
