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
  const { transactions, members } = useGymData();

  const { monthlyRevenue, planDistribution, metrics, dailyClients, monthlyClients, dailyPayers, monthlyPayers } = useMemo(() => {
    // 1. Distribution of Plans (Dinámico)
    const plans: Record<string, number> = {};
    members.forEach(m => {
      const p = m.plan || 'Sin Plan';
      plans[p] = (plans[p] || 0) + 1;
    });
    
    let dailyPayers = 0;
    let monthlyPayers = 0;
    
    Object.entries(plans).forEach(([plan, count]) => {
      const pLow = plan.toLowerCase();
      if (pLow.includes('día') || pLow === 'dia' || pLow.includes('diario')) {
        dailyPayers += count;
      } else if (pLow.includes('mes') || pLow.includes('básico') || pLow.includes('basico') || pLow.includes('pro') || pLow.includes('hyrox')) {
        monthlyPayers += count;
      }
    });
    
    const colors = ['#FFD600', '#00E5FF', '#00F0FF', '#FF6B35', '#00E676', '#888888'];
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

    // 3. KPI Metrics (Análisis Financiero por Heurística)
    let moneyDaily = 0;
    let moneyMonthly = 0;
    
    transactions.filter(t => t.type === 'income').forEach(t => {
      const amount = t.amount;
      const desc = (t.description || '').toLowerCase();
      
      // Heurística por descripción o por monto
      if (desc.includes('día') || desc.includes('dia') || desc.includes('visita')) {
        moneyDaily += amount;
      } else if (desc.includes('mes') || desc.includes('mensual') || desc.includes('básico') || desc.includes('pro')) {
        moneyMonthly += amount;
      } else if (amount === 3000) {
        moneyDaily += amount;
      } else if (amount >= 45000) {
        moneyMonthly += amount;
      }
    });

    const totalRevenue = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const inactiveCount = members.filter(m => (!m.visits || m.visits === 0) && m.status !== 'suspended').length;
    const suspendedCount = members.filter(m => m.status === 'suspended').length;

    const computedMetrics = [
      { icon: Activity, label: 'Dinero por Día (Visitas)', value: `$${moneyDaily.toLocaleString('es-CO')}`, change: `${dailyPayers} Clientes`, up: true },
      { icon: Activity, label: 'Dinero por Mes (Planes)', value: `$${moneyMonthly.toLocaleString('es-CO')}`, change: `${monthlyPayers} Clientes`, up: true },
      { icon: Activity, label: 'Total Recaudado (Ambos)', value: `$${(moneyDaily + moneyMonthly).toLocaleString('es-CO')}`, change: 'Suma de ambos', up: true },
      { icon: Target, label: 'Inactivos (0 Visitas)', value: `${inactiveCount}`, change: 'Sin asistencia', up: false },
      { icon: Shield, label: 'Suspendidos', value: `${suspendedCount}`, change: 'Pausados', up: false },
    ];

    // 4. Client Trend Data
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
      metrics: computedMetrics,
      dailyClients: dailyClientData,
      monthlyClients: monthlyClientData,
      dailyPayers,
      monthlyPayers
    };
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
            <div className="kpi-value" style={{ 
              fontSize: 'var(--text-2xl)', 
              background: 'rgba(0, 240, 255, 0.05)', 
              border: '1px solid rgba(0, 240, 255, 0.2)', 
              borderRadius: '6px', 
              padding: '4px 12px', 
              display: 'inline-block',
              marginTop: '6px',
              fontWeight: 700,
              color: '#00F0FF'
            }}>{m.value}</div>
            <div className={`kpi-change ${m.up ? 'positive' : 'negative'}`}>
              {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {m.change}
            </div>
          </div>
        ))}
      </div>

      {/* ─── SIMULATION ROW ─── */}
      <div style={{ marginBottom: 12, marginTop: 24 }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-muted)' }}>Simulación de Ingresos (Basado en Clientes Activos)</h3>
      </div>
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        <div className="kpi-card cyan">
          <div className="kpi-label">Simulación Día (Visitas)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(0, 255, 136, 0.05)', 
            border: '1px solid rgba(0, 255, 136, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#00FF88'
          }}>${(dailyPayers * 3000).toLocaleString('es-CO')}</div>
          <div className="kpi-change positive">Ingreso diario estimado</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Simulación Mes (Planes)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(0, 255, 136, 0.05)', 
            border: '1px solid rgba(0, 255, 136, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#00FF88'
          }}>${(monthlyPayers * 45000).toLocaleString('es-CO')}</div>
          <div className="kpi-change positive">Ingreso mensual estimado</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Proyección Total Mes</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(0, 255, 136, 0.05)', 
            border: '1px solid rgba(0, 255, 136, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#00FF88'
          }}>${((dailyPayers * 3000 * 20) + (monthlyPayers * 45000)).toLocaleString('es-CO')}</div>
          <div className="kpi-change positive">20 días hábiles + Planes</div>
        </div>
      </div>

      {/* ─── ACCOUNTING ROW ─── */}
      <div style={{ marginBottom: 12, marginTop: 24 }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-muted)' }}>Contabilidad Real (Movimientos de Caja)</h3>
      </div>
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        <div className="kpi-card cyan">
          <div className="kpi-label">Entradas (Ingresos)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(0, 255, 136, 0.05)', 
            border: '1px solid rgba(0, 255, 136, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#00FF88'
          }}>${totalRevenue.toLocaleString('es-CO')}</div>
          <div className="kpi-change positive">Dinero ingresado</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Salidas (Gastos)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(255, 75, 75, 0.05)', 
            border: '1px solid rgba(255, 75, 75, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#FF4B4B'
          }}>${totalExpenses.toLocaleString('es-CO')}</div>
          <div className="kpi-change negative">Dinero gastado</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Lo que queda (Neto)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: netProfit >= 0 ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 75, 75, 0.05)', 
            border: netProfit >= 0 ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid rgba(255, 75, 75, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: netProfit >= 0 ? '#00FF88' : '#FF4B4B'
          }}>${netProfit.toLocaleString('es-CO')}</div>
          <div className={`kpi-change ${netProfit >= 0 ? 'positive' : 'negative'}`}>Balance final</div>
        </div>
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
