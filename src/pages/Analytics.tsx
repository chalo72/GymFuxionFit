// Force update: 2026-05-08 v2
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
import { TrendingUp, TrendingDown, Users, CreditCard, Activity, Target, Shield } from 'lucide-react';

import { useMemo } from 'react';
import { useGymData } from '../hooks/useGymData';

export default function Analytics() {
  const { transactions, members, obligations, staff, plans } = useGymData();

  const { monthlyRevenue, planDistribution, dailyClients, monthlyClients } = useMemo(() => {
    // 1. Distribution of Plans (Dinámico)
    const planCounts: Record<string, number> = {};
    members.forEach(m => {
      const p = m.plan || 'Sin Plan';
      planCounts[p] = (planCounts[p] || 0) + 1;
    });
    
    const colors = ['#FFD600', '#00E5FF', '#00F0FF', '#FF6B35', '#00E676', '#888888'];
    const distData = Object.entries(planCounts)
      .filter(([_, count]) => count > 0)
      .map(([planId, count], i) => {
        const planObj = plans ? plans.find((p: any) => p.id === planId) : null;
        const planName = planObj ? planObj.name : planId;
        return { plan: planName, count, color: colors[i % colors.length] };
      });

    // 2. Monthly Revenue (Last 6-12 months from transactions)
    const revMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'income').forEach(t => {
      if (!t.date) return;
      const monthStr = t.date.substring(0, 7); // "YYYY-MM"
      revMap[monthStr] = (revMap[monthStr] || 0) + t.amount;
    });

    const sortedMonths = Object.keys(revMap).sort();
    const monthlyData = sortedMonths.slice(-12).map(mStr => {
      const date = new Date(mStr + '-02');
      const monthName = date.toLocaleString('es-CO', { month: 'short' });
      return { 
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1), 
        revenue: revMap[mStr],
        members: members.filter((m: any) => m.joinDate && m.joinDate <= mStr + '-31').length || members.length
      };
    });

    // 3. Client Trend Data
    const clientDayMap: Record<string, number> = {};
    const clientMonthMap: Record<string, number> = {};
    
    members.forEach(m => {
      const dateStr = m.joined || m.expiryDate;
      if (!dateStr) return;
      
      const dayStr = dateStr.substring(0, 10);
      clientDayMap[dayStr] = (clientDayMap[dayStr] || 0) + 1;
      
      const monthStr = dateStr.substring(0, 7);
      clientMonthMap[monthStr] = (clientMonthMap[monthStr] || 0) + 1;
    });
    
    const sortedDays = Object.keys(clientDayMap).sort().slice(-15);
    const dailyClientData = sortedDays.map(d => ({
      date: d.substring(5),
      count: clientDayMap[d]
    }));
    
    const sortedMonthsClients = Object.keys(clientMonthMap).sort().slice(-6);
    const monthlyClientData = sortedMonthsClients.map(mStr => {
      const date = new Date(mStr + '-02');
      const monthName = date.toLocaleString('es-CO', { month: 'short' });
      return {
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        count: clientMonthMap[mStr]
      };
    });

    return { 
      monthlyRevenue: monthlyData, 
      planDistribution: distData, 
      dailyClients: dailyClientData,
      monthlyClients: monthlyClientData
    };
  }, [transactions, members, obligations]);


  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Analíticas</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Métricas avanzadas de negocio y rendimiento
        </p>
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

      {/* ─── NUEVOS CLIENTES (DÍA / MES) ─── */}
      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        {/* Clientes por Día */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <div className="glass-card-title">Nuevos Clientes por Día</div>
              <div className="glass-card-subtitle">Últimos 15 días</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyClients} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(14,14,21,0.95)',
                    border: '1px solid rgba(0,255,136,0.2)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [value, 'Nuevos Clientes']}
                />
                <Bar dataKey="count" fill="#00FF88" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clientes por Mes */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <div className="glass-card-title">Nuevos Clientes por Mes</div>
              <div className="glass-card-subtitle">Últimos 6 meses</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyClients}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF88" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(14,14,21,0.95)',
                    border: '1px solid rgba(0,255,136,0.2)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [value, 'Nuevos Clientes']}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#00FF88"
                  strokeWidth={2}
                  fill="url(#greenGrad)"
                  dot={{ r: 4, fill: '#00FF88' }}
                  activeDot={{ r: 6, fill: '#00FF88', stroke: 'rgba(0,255,136,0.3)', strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
